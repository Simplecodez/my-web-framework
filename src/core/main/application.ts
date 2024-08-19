import http from "http";
import {
  MiddlewareHandler,
  Request,
  Response,
} from "../interfaces/middleware.interface";
import { Router } from "./router";
import { Method, SubPath } from "./method";
import { addRequestProps } from "./request";
import { addResponseProps } from "./response";
import { Params } from "../interfaces/utils.interface";
import { Utils } from "./utils";

export class Application extends Method {
  private pathOnlyMiddleware: Map<string, MiddlewareHandler[]> = new Map();
  private appMiddleware: Map<string, MiddlewareHandler[] | SubPath> = new Map();

  constructor() {
    super();
  }

  loadMiddleware() {
    for (const [key, value] of this.middleware) {
      this.appMiddleware.set(key, value);
    }
  }

  addMiddleware(path: string, middlewares: MiddlewareHandler[] | SubPath) {
    if (path === "/global") {
      if (this.middleware.has(path)) {
        this.middleware.set(path, [
          ...(this.middleware.get(path) as MiddlewareHandler[]),
          ...(middlewares as MiddlewareHandler[]),
        ]);
      } else {
        this.middleware.set(path, middlewares as MiddlewareHandler[]);
      }
    } else {
      if (!this.middleware.has(path)) {
        this.middleware.set(path, middlewares);
      }
    }
  }

  use(
    pathOrMiddleware: string | MiddlewareHandler,
    ...handlers: (Router | MiddlewareHandler)[]
  ) {
    if (typeof pathOrMiddleware === "string") {
      const lastHandler = handlers[handlers.length - 1];
      if (lastHandler instanceof Router) {
        this.addMiddleware(pathOrMiddleware, lastHandler.routeMiddleware);
      }
      if (handlers.length > 1) {
        const middlewareForAPath: MiddlewareHandler[] = [];
        for (let index = 0; index < handlers.length - 1; index++) {
          middlewareForAPath.push(handlers[index] as MiddlewareHandler);
        }
        this.pathOnlyMiddleware.set(pathOrMiddleware, middlewareForAPath);
      }
      return;
    }

    this.addMiddleware("/global", [pathOrMiddleware] as MiddlewareHandler[]);
    const moreMiddleware: MiddlewareHandler[] = [];
    for (const handler of handlers) {
      if (!(handler instanceof Router)) {
        moreMiddleware.push(handler);
      }
    }
    this.addMiddleware("/global", moreMiddleware);
  }

  async handleRequest(req: Request, res: Response) {
    const [basePath, subPath] = Utils.splitPath(req.pathname);
    let middlewareStack: MiddlewareHandler[] = [];
    for (const [path, globalMiddlewareOrPathMiddleware] of this.appMiddleware) {
      if (req.pathname.startsWith(path) || path === "/global") {
        if (globalMiddlewareOrPathMiddleware instanceof Map) {
          for (const [key, value] of globalMiddlewareOrPathMiddleware) {
            const matchedPath = Utils.matchPath(key, subPath);

            if (matchedPath.matched) {
              req.params = matchedPath.params as Params;
              const subPathHandler = value[req.method as string];
              if (subPathHandler) {
                middlewareStack.push(...subPathHandler);
              }
              break;
            }
          }
          break;
        } else if (Array.isArray(globalMiddlewareOrPathMiddleware)) {
          middlewareStack.push(...globalMiddlewareOrPathMiddleware);
        }
      }
    }

    for (let index = 0; index < middlewareStack.length; index++) {
      let isNextCalled = false;
      try {
        const result = middlewareStack[index](req, res, (err: any) => {
          if (err) {
            throw err;
          }
          isNextCalled = true;
        });
        if ((result as any) instanceof Promise) {
          await result;
        }
      } catch (error: any) {
        console.log(error);
        res.write(error?.message);
        res.end();
        break;
      }

      if (!isNextCalled) {
        break;
      }
    }
  }

  listen(port: number, callback: () => void) {
    const server = http.createServer((req, res) => {
      const request = addRequestProps(req);
      const response = addResponseProps(res);
      this.handleRequest(request, response);
    });
    this.loadMiddleware();
    server.listen(port, callback);
  }
}
