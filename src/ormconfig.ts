import path from "path";
import { ConnectionOptions } from "typeorm";

import { Post } from "@entities/Post";
import { User } from "@entities/User";
import { Updoot } from "@entities/Updoot";
import { __prod__ } from "./config";

const ormconfig: ConnectionOptions = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER_NAME,
  type: "postgres",
  password: process.env.DB_USER_PASSWORD,
  entities: [Post, User, Updoot],
  migrations: [path.join(__dirname, "./migrations/*")],
  logging: !__prod__,
  synchronize: true,
};

export default ormconfig;
