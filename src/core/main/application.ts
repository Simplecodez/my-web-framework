import http, { IncomingMessage, ServerResponse } from "http";
import { Handler, Route } from "../interfaces/router.interface";
import { BodyParser } from "./body-parser";
import { MiddlewareHandler } from "../interfaces/middleware.interface";
import { RouteMiddleware, Router } from "./route";
import { Method } from "./method";

export class Application extends Method {
  private middlewareStack: MiddlewareHandler[] = [];
  private mainRouteMiddleware: Map<string, Map<string, RouteMiddleware>> =
    new Map();
  constructor() {
    super();
  }

  addParentRoute(path: string, middleware: Map<string, RouteMiddleware>) {
    if (!this.mainRouteMiddleware.has(path)) {
      this.mainRouteMiddleware.set(path, middleware);
    }
  }

  use(
    pathOrMiddleware: string | MiddlewareHandler,
    ...handlers: (Router | MiddlewareHandler)[]
  ) {
    if (typeof pathOrMiddleware === "string") {
      const lastHandler = handlers[handlers.length - 1];
      if (lastHandler instanceof Router) {
        this.addParentRoute(pathOrMiddleware, lastHandler.routeMiddleware);
      }
    }

    for (const handler of handlers) {
      if (!(handler instanceof Router)) {
        this.middlewareStack.push(handler);
      }
    }
  }

  async registerMiddleware(req: IncomingMessage, res: ServerResponse) {
    for (let index = 0; index < this.middlewareStack.length; index++) {
      let isNextCalled = false;
      try {
        const result = this.middlewareStack[index](req, res, (err: any) => {
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

  listen(port: number, callback: () => void) {
    const server = http.createServer((req: IncomingMessage, res) => {
      // Handle middleware
      this.registerMiddleware(req, res);
      // Handle routing
    });

    server.listen(port, callback);
  }
}

const app = new Application();
app.listen(3000, () => {
  console.log("listening...");
});

// app.use(async (req, res, next) => {
//   const bodyParser = new BodyParser();
//   await bodyParser.extractData(req, res);
//   next();
// });

// app.use((req, res, next) => {
//   console.log(new Date());
//   console.log(req.body, "dddddddddddd");
//   next();
// });

// app.use((req, res, next) => {
//   console.log(new Date());
//   console.log(req.body, "eeeeeeeeeeeeeeeeeee");
//   return;
// });

app.get("/us", (req, res) => {
  res.write(req.body.name + " " + "welcome");
  res.end();
});
