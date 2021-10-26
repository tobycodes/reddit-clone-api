import { Connection } from "typeorm";
import { Post } from "@entities/Post";
import { convertToSlug } from "@utils/convertToSlug";

const run = async (conn: Connection) => {
  // Retrieve DB Connection
  const postRepo = await conn.getRepository(Post);

  // Fetch the data
  const posts = await postRepo.find();

  // Run update on the data
  const updatedPosts = posts.map((p) => ({
    ...p,
    slug: convertToSlug(p.title),
  }));
  await Promise.all(updatedPosts.map((p) => postRepo.update({ id: p.id }, { slug: p.slug })));

  console.log("Done");
};

export default run;
