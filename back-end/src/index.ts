import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { createServer } from "http";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { Game } from "./entites/Game";
import { User } from "./entites/User";
import { gameResolver } from "./resolvers/gameResolver";
import { messagesResolver } from "./resolvers/messageResolver";

const PORT = 4000;

const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    database: "connect4online",
    username: "myuser",
    password: "mypass",
    logging: true,
    synchronize: true,
    entities: [
      Game,
      User,
    ],
    migrations: [path.join(__dirname, "./migrations/*")],
  });

  const app = express();
  await conn.runMigrations();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  const corsOptions = {
    origin: "https://www.connect4online.xyz",
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
            res({ req: ws.upgradeReq.session.userId });
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

  app.get('/', (_, res) => {
    res.send('Welcome!')
  })

  const http = createServer(app);

  apolloServer.installSubscriptionHandlers(http);

  http.listen(PORT, () => {
    console.log(`server started on port: ${PORT}`);
  });
};

main().catch((err) => console.log(err));
