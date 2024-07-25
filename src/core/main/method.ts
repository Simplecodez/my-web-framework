import { IncomingMessage, ServerResponse } from "http";
import { MiddlewareHandler } from "../interfaces/middleware.interface";

export type RouteMiddleware = {
  [method: string]: MiddlewareHandler[];
};

export class Method {
  public routeMiddleware: Map<string, RouteMiddleware> = new Map();

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
