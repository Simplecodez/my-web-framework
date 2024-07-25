import { IncomingMessage, ServerResponse } from "http";
import { MiddlewareHandler } from "../interfaces/middleware.interface";
import { Method } from "./method";

export type RouteMiddleware = {
  [method: string]: MiddlewareHandler[];
};

export class Router extends Method {
  constructor() {
    super();
  }

  route() {}
}

const router = new Router();

// router.get();
