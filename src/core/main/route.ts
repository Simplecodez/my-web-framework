import { IncomingMessage, ServerResponse } from "http";
import { MiddlewareHandler } from "../interfaces/middleware.interface";

export type RouteMiddleware = {
  [method: string]: MiddlewareHandler[];
};

export class Router {
  private routes = [];
  private routeMiddleware: Map<string, RouteMiddleware> = new Map();

  route() {}

  addRoute(path: string, method: string, middlewares: MiddlewareHandler[]) {
    if (!this.routeMiddleware.has(path)) {
      this.routeMiddleware.set(path, {});
    }
    const routeMiddleware = this.routeMiddleware.get(path)!;
    routeMiddleware[method] = [...middlewares];
  }

  get(path: string, ...middlewares: MiddlewareHandler[]) {
    this.addRoute(path, "get", middlewares);
  }

  post(path: string, ...middlewares: MiddlewareHandler[]) {
    this.addRoute(path, "post", middlewares);
  }

  patch(path: string, ...middlewares: MiddlewareHandler[]) {
    this.addRoute(path, "patch", middlewares);
  }
}

const route = new Router();

route.get(
  "/users",
  (req: IncomingMessage, res: ServerResponse, next: () => void) => {}
);
