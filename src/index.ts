import "reflect-metadata";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { buildSchema } from "type-graphql";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";

import { COOKIE_NAME, server, __prod__ } from "@config/index";
import ormconfig from "./ormconfig";
import { UserResolver } from "@resolvers/User";
import { PostResolver } from "@resolvers/Post";
import { createUpdootLoader, createUserLoader } from "./utils/loaders";

const main = async () => {
  const conn = await createConnection(ormconfig);

  const app = express();

  app.use(cors({ credentials: true, origin: "http://localhost:3002" }));

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365, //1 year
        httpOnly: true,
        secure: __prod__,
        sameSite: "lax",
      },
      saveUninitialized: false,
      secret: process.env.SECRET as string,
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({ resolvers: [PostResolver, UserResolver], validate: false }),
    context: ({ req, res }) => ({ req, res, redis, conn, userLoader: createUserLoader(), updootLoader: createUpdootLoader() }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(server.PORT, () =>
    console.log(`🚀 Server running at http://localhost:${server.PORT}${apolloServer.graphqlPath}`)
  );
};

main().catch(console.log);
