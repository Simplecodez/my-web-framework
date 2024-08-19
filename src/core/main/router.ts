import {
  MiddlewareHandler,
  Request,
  Response,
} from "../interfaces/middleware.interface";
import { Method } from "./method";

export class Router extends Method {
  private path: string = "";
  constructor() {
    super();
  }

  route(path: string) {
    this.path = path;
    return this;
  }

  private addSubRoutesHandler(
    path: string,
    method: string,
    middlewares: MiddlewareHandler[]
  ) {
    let middleware = this.routeMiddleware.get(path);
    if (!middleware) {
      middleware = { [method]: middlewares };
      this.routeMiddleware.set(path, middleware);
    } else {
      middleware[method] = middlewares;
    }
  }

  private addMethodHandler(
    path: string | MiddlewareHandler,
    method: string,
    middlewares: MiddlewareHandler[]
  ) {
    if (typeof path === "string") {
      this.addSubRoutesHandler(path, method, middlewares);
    } else {
      if (!this.path) {
        throw new Error("No path specified");
      }
      this.addSubRoutesHandler(this.path, method, [path, ...middlewares]);
    }
  }

  get(path: string | MiddlewareHandler, ...middlewares: MiddlewareHandler[]) {
    this.addMethodHandler(path, "get", middlewares);
    return this;
  }

  post(path: string | MiddlewareHandler, ...middlewares: MiddlewareHandler[]) {
    this.addMethodHandler(path, "post", middlewares);
    return this;
  }

  patch(path: string | MiddlewareHandler, ...middlewares: MiddlewareHandler[]) {
    this.addMethodHandler(path, "patch", middlewares);
    return this;
  }
}
