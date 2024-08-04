import http from "http";
import {
  MiddlewareHandler,
  Request,
  Response,
} from "../interfaces/middleware.interface";
import { router, Router } from "./route";
import { Method, RouteMiddleware, SubPath } from "./method";

import { addRequestProps } from "./request";
import { addResponseProps } from "./response";
import { BodyParser } from "./body-parser";
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

  async registerMiddleware(req: Request, res: Response) {
    const [basePath, subPath] = Utils.splitPath(req.pathname);
    console.log(basePath, subPath, "hhhhh");
    for (const [path, globalMiddlewareOrPathMiddleware] of this.appMiddleware) {
      if (path === basePath || path === "/global") {
        let middlewareStack: MiddlewareHandler[] = [];

        if (globalMiddlewareOrPathMiddleware instanceof Map) {
          const routeHandler = globalMiddlewareOrPathMiddleware.get(
            subPath
          ) as RouteMiddleware;
          const subPathHandler = routeHandler[req.method as string];
          middlewareStack.push(...subPathHandler);
        } else if (Array.isArray(globalMiddlewareOrPathMiddleware)) {
          middlewareStack.push(...globalMiddlewareOrPathMiddleware);
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
            console.log("I ran");
            break;
          }
        }
      }
    }
  }

  listen(port: number, callback: () => void) {
    const server = http.createServer((req, res) => {
      const request = addRequestProps(req);
      const response = addResponseProps(res);
      console.log(this.appMiddleware);
      this.registerMiddleware(request, response);
    });
    this.loadMiddleware();
    server.listen(port, callback);
  }
}

const app = new Application();

app.get("/me", (req, res, next) => {
  console.log({ name: "Emmanuel", age: "26" });
  console.log(req.body);
  res.end("This is me");
});

app.use(async (req, res, next) => {
  const bodyParser = new BodyParser();
  await bodyParser.extractData(req, res);
  next();
});

app.get("/user", (req, res, next) => {
  console.log({ name: "Emmanuel", age: "26" });
  console.log(req.body);
  res.end("This is me");
});

app.post("/user", (req, res, next) => {
  console.log({ name: "Emmanuel", age: "26" });
  console.log(req.body);
  res.end("This is mennnnnnnnnn");
});

app.use("/admin", router);

// app.use(
//   (req, res, next) => {
//     console.log(new Date());
//     console.log(req.body, "dddddddddddd");
//     next();
//   },
//   (req, res, next) => {
//     console.log(new Date());
//     console.log(req.body, "dddddddddddd");
//     next();
//   },
//   (req, res, next) => {
//     console.log(new Date());
//     console.log(req.body, "dddddddddddd");
//     res.end();
//   }
// );

app.listen(3000, () => {
  console.log("listen on port 3000");
});
