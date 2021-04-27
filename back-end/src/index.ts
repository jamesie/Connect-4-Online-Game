import "reflect-metadata";
import connectRedis from "connect-redis";
import express from "express";
import session from "express-session";
import path from "path";
import { createConnection } from "typeorm";
import { Game } from "./entites/Game";
import Redis from "ioredis";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { gameResolver } from "./resolvers/gameResolver";
import { buildSchema } from "type-graphql";
import { User } from "./entites/User";
import { Socket, Server } from "socket.io";
import { createServer } from "http";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { messagesResolver } from './resolvers/messageResolver';
import { Messages } from './entites/Messages';

const PORT = 4000;

const main = async () => {
  const conn = await createConnection({
    type: "mongodb",
    url: "mongodb://localhost:27017/connect4",
    username: "mongodb",
    password: "mongodb",
    logging: true,
    synchronize: true,
    entities: [Game, User, Messages],
    migrations: [path.join(__dirname, "./migrations/*")],
  });

  const app = express();
  await conn.runMigrations();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
  };

  app.use(cors(corsOptions));

  const sessionMiddleWare = session({
    name: "connect4c",
    store: new RedisStore({
      client: redis,
      disableTouch: true,
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
    saveUninitialized: false,
    secret: "newSecret",
    resave: false,
  });

  app.use(sessionMiddleWare);

  const REDIS_DOMAIN_NAME = "127.0.0.1";
  const PORT_NUMBER = 6379;

  const options = {
    host: REDIS_DOMAIN_NAME,
    port: PORT_NUMBER,
    retryStrategy: (times: number) => {
      // reconnect after
      return Math.min(times * 50, 2000);
    },
  };

  const myPubSub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options),
  });

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [gameResolver, messagesResolver],
      pubSub: myPubSub,
      validate: false,
    }),
    subscriptions: {
      onConnect: async (_, ws: any, __) => {
        return new Promise((res) => {
          sessionMiddleWare(ws.upgradeReq, {} as any, () => {
            res({req: ws.upgradeReq.session.userId});
          });
        });
      },
    },
    context: ({ req, res, connection }) => ({ req, res, redis, connection }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  const http = createServer(app);

  apolloServer.installSubscriptionHandlers(http);

  http.listen(PORT, () => {
    console.log(`server started on port: ${PORT}`);
  });
};

main().catch((err) => console.log(err));
