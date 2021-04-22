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

const PORT = 4000;

const main = async () => {
  const conn = await createConnection({
    type: "mongodb",
    url: "mongodb://localhost:27017/connect4",
    username: "mongodb",
    password: "mongodb",
    logging: true,
    synchronize: true,
    entities: [Game, User],
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

  app.use(
    session({
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
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [gameResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  const http = createServer(app);

  const io = new Server(http, {
    origins: ["http://localhost:3000"]
  });

  io.on("connection", (socket: Socket) => {
    socket.on("joinRoom", ({ nickname, roomId }: JoinRoomType) => {
      console.log(`${nickname} Joined Room ${roomId}!`);
      socket.join(roomId);
      socket.broadcast.to(roomId).emit("someoneJoinedRoom");
    });

    socket.on("completedMove", ({ roomId, id }) => {
      console.log("recieved req");
      socket.broadcast.to(roomId).emit("moveCompleted", { id });
    });

    socket.on("sendChatMsg", ({ roomId, id, msg }) => {
      console.log(id, msg);
      socket.to(roomId).emit("chatMsg", { id, msg });
    });

    socket.on("dasdasdasdas", () => socket.emit("connection debug"));

    socket.on("disconnect", (reason) => {
      console.log("disconnect for: ",  reason)
    });
  });

  http.listen(PORT, () => {
    console.log(`server started on port: ${PORT}`);
  });
};

main().catch((err) => console.log(err));

type JoinRoomType = {
  nickname: string;
  roomId: string;
};
