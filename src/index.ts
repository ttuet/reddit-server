import "reflect-metadata";
import { MikroORM, RequestContext } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { Post } from "./entities/Post";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
  await RequestContext.createAsync(orm.em, async () => {
    //   const post = orm.em.create(Post, {
    //     title: "My first post ",
    //   });
    //   await orm.em.persistAndFlush(post);
    // const posts = await orm.em.find(Post, {});
    // console.log(posts);
    const app = express();
    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [HelloResolver, PostResolver],
        validate: false,
      }),
      context: () => {
        {
          em: orm.em;
        }
      },
    });
    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
      console.log("server started on localhost:4000");
    });
  });
};

main().catch((err) => {
  console.log(err);
});
