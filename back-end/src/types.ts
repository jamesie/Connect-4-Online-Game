import session from "express-session";
import { Redis } from "ioredis";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";


declare module "express-session" {
  interface SessionData {
    userId?: ObjectId;
  }
}

export type MyContext = {
  req: Request & {session : session.SessionData}
  res: Response;
  redis: Redis;
}