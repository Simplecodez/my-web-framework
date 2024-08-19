import { MiddlewareHandler } from "../interfaces/middleware.interface";

export type RouteMiddleware = {
  [method: string]: MiddlewareHandler[];
};

export type SubPath = Map<string, RouteMiddleware>;

export abstract class Method {
  public routeMiddleware: SubPath = new Map();
  protected middleware: Map<string, MiddlewareHandler[] | SubPath> = new Map();

  private addRoute(
    path: string,
    method: string,
    middlewares: MiddlewareHandler[]
  ) {
    // Get main path using path variable
    let middlewareSubPath = this.middleware.get(path) as SubPath;

    // if no path, then create a new one and add subpath
    if (!middlewareSubPath) {
      middlewareSubPath = new Map<string, RouteMiddleware>();
      middlewareSubPath.set("/", { [method]: middlewares });
    } else {
      // else, add a new method to a middleware array
      const middlewareSubPathHandler = middlewareSubPath.get(
        path
      ) as RouteMiddleware;

      if (middlewareSubPathHandler) {
        middlewareSubPathHandler[method] = middlewares;
      }
      middlewareSubPath.set(path, middlewareSubPathHandler);
    }
    this.middleware.set(path, middlewareSubPath);
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
