import { Arg, Query, Mutation, Resolver, Ctx, UseMiddleware, Int, FieldResolver, Root } from "type-graphql";
import { getRepository, LessThan } from "typeorm";

import { convertToSlug } from "@utils/convertToSlug";
import { IsAuthenticated } from "@middleware/isAuthenticated";
import { Context } from "@custom-types/index";
import { Post } from "@entities/Post";
import { PostInput, PostsResponse, PostResponse } from "@custom-types/post";
import hasher from "@utils/hasher";
import { Updoot } from "@entities/Updoot";
import { User } from "@entities/User";

@Resolver(Post)
export class PostResolver {
  // GET ALL POSTS
  @Query(() => PostsResponse)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PostsResponse> {
    const postRepo = getRepository(Post);
    const realLimit = Math.min(51, limit + 1);

    // const postsQuery = postRepo
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
    //   .orderBy("p.id", "DESC")
    //   .limit(realLimit);

    // if (cursor) {
    //   postsQuery.where('p."id" < :cursor', { cursor: hasher.decode(cursor) });
    // }

    // const posts = await postsQuery.getMany();

    // This is the same as above, but much more simpler and convenient
    const posts = await postRepo.find({
      where: cursor ? { id: LessThan(hasher.decode(cursor)) } : {},
      order: { id: "DESC" },
      take: realLimit,
    });

    const hasMore = posts.length === realLimit;
    const newCursor = hasher.encode(posts[posts.length - 2].id);

    return { status: "success", posts: posts.slice(0, realLimit - 1), hasMore, cursor: newCursor };
  }

  // GET SINGLE POST
  @Query(() => PostResponse)
  async post(@Arg("id", () => Int!) id: number): Promise<PostResponse> {
    try {
      const post = await Post.findOne(id);

      return { status: "success", post };
    } catch (err: any) {
      return { status: "error", message: err.message };
    }
  }

  // GET SINGLE POST BY SLUG
  @Query(() => PostResponse)
  async postBySlug(@Arg("slug") slug: string): Promise<PostResponse> {
    try {
      const post = await Post.findOne({ slug });

      return { status: "success", post };
    } catch (err: any) {
      return { status: "error", message: err.message };
    }
  }

  // CREATE POST
  @Mutation(() => PostResponse!)
  @UseMiddleware(IsAuthenticated)
  async createPost(@Ctx() { req }: Context, @Arg("input") input: PostInput): Promise<PostResponse> {
    // Validate post title
    if (!input.title) return { status: "error", errors: [{ name: "title", message: "Post title is required" }] };

    const post = await Post.create({
      ...input,
      creatorId: req.session.userId,
      slug: convertToSlug(input.title),
    });

    await Post.save(post);

    return {
      post: await Post.findOne(post.id),
      status: "success",
      message: "Post created successfully",
    };
  }

  // UPDATE POST
  @Mutation(() => PostResponse)
  @UseMiddleware(IsAuthenticated)
  async updatePost(
    @Ctx() { req }: Context,
    @Arg("id", () => Int!) id: number,
    @Arg("input") input: PostInput
  ): Promise<PostResponse> {
    const post = await Post.findOne(id);

    if (!post) return { status: "error", message: "Post not found" };

    if (post.creatorId !== req.session.userId)
      return { status: "error", message: "You are not authorized to update this post" };

    if (!input.title) return { status: "error", errors: [{ name: "title", message: "Post title is required" }] };

    await Post.update(post.id, { ...input, slug: convertToSlug(input.title) });

    return {
      status: "success",
      message: "Post updated successfully",
      post: await Post.findOne(id),
    };
  }

  // VOTE POST
  @Mutation(() => PostResponse)
  @UseMiddleware(IsAuthenticated)
  async vote(
    @Ctx() { req, conn }: Context,
    @Arg("postId", () => Int!) postId: number,
    @Arg("value", () => Int!) value: number
  ): Promise<PostResponse> {
    const { userId } = req.session;
    const realValue = value !== -1 ? 1 : -1;

    try {
      // Check if the post exists and throw an error if it doesn't
      const post = await Post.findOne(postId, { relations: ["updoots"] });
      if (!post) throw new Error("Post does not exist.");

      // Check if the user has already voted on the post and add/deduct points accordingly
      const prevVote = post.updoots.find((u) => u.postId === post.id && u.userId === userId);

      if (prevVote && prevVote.value !== realValue) {
        // Create transaction to update existing vote and post points
        await conn.manager.transaction(async (em) => {
          await em.update(Updoot, prevVote, { value: realValue });
          await em.update(Post, postId, { points: () => `points + ${realValue * 2}` });
        });
      } else if (!prevVote) {
        // Create transaction to insert new vote and update post points
        await conn.manager.transaction(async (em) => {
          await em.insert(Updoot, { userId, postId, value: realValue });
          await em.update(Post, postId, { points: () => `points + ${realValue}` });
        });
      }

      return {
        status: "success",
        message: "Your vote has been sent",
        post: await Post.findOne(postId),
      };
    } catch (error: any) {
      const message = error.code == "23505" ? "You have already voted on this post" : error.message;

      return { status: "error", message };
    }
  }

  // DELETE POST
  @Mutation(() => PostResponse)
  @UseMiddleware(IsAuthenticated)
  async deletePost(@Ctx() { req }: Context, @Arg("id", () => Int!) id: number): Promise<PostResponse> {
    const post = await Post.findOne(id);

    if (!post) return { status: "error", message: "Post not found" };

    if (post.creatorId !== req.session.userId)
      return { status: "error", message: "You are not authorized to delete this post" };

    await Post.delete(post.id);

    return { status: "success", message: "Post deleted successfully", post };
  }

  // Resolve `creator` field on Post
  @FieldResolver(() => User)
  creator(@Root() root: Post, @Ctx() { userLoader }: Context) {
    return userLoader.load(root.creatorId);
  }

  // Resolve `updoots` field on Post
  @FieldResolver(() => [Updoot])
  updoots(@Root() { id }: Post, @Ctx() { req, updootLoader }: Context) {
    if(!req.session.userId) return [];

    return updootLoader.load({userId: req.session.userId, postId: id});
  }

  // Resolve `snippet` field on Post
  @FieldResolver(() => String)
  snippet(@Root() root: Post) {
    return root.text.length < 75 ? root.text : root.text.slice(0, 72).padEnd(75, ".");
  }

  // Resolve `voteStatus` field on Post
  @FieldResolver(() => Int)
  async voteStatus(@Root() root: Post, @Ctx() { req, updootLoader }: Context) {
    if(!req.session.userId) return null;

    const updoot = await updootLoader.load({postId: root.id, userId: req.session.userId })

    return updoot?.value;
  }
}
