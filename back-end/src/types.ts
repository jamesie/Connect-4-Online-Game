import session from "express-session";
import { Redis } from "ioredis";
import { Request, Response } from "express";
import { ObjectID } from "typeorm";


declare module "express-session" {
  interface SessionData {
    userId?: ObjectID;
  }
}

export type MyContext = {
  req: Request & {session : session.SessionData}
  res: Response;
  redis: Redis;
}