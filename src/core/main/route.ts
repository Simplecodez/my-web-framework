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
