import DataLoader from "dataloader";
import { User } from "@entities/User";
import { Updoot } from "@entities/Updoot";

export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userMap: Record<number, User> = {};

    users.forEach((user) => {
      userMap[user.id] = user;
    });

    return userIds.map((key) => userMap[key]);
  });

export const createUpdootLoader = () => new DataLoader<Record<string, number>, Updoot | null>(async (keys) => {
  const updoots = await Updoot.findByIds(keys as any);

  const updootMap: Record<string, Updoot> = {};

  updoots.forEach((updoot) => {
    const { userId, postId } = updoot;
    updootMap[`${userId} | ${postId}`] = updoot;
  });

  return keys.map(({postId, userId}) => updootMap[`${userId} | ${postId}`]);
})