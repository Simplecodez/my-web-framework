import http, { IncomingMessage, ServerResponse } from "http";
import { Handler, Route } from "../interfaces/router.interface";
import { BodyParser } from "./body-parser";
import { MiddlewareHandler } from "../interfaces/middleware.interface";
import { RouteMiddleware } from "./route";

export class Application {
  private routes: Route[] = [];
  private middlewareStack: MiddlewareHandler[] = [];

  private routeMiddleware: Map<string, Map<string, RouteMiddleware>> =
    new Map();

  get(path: string, handler: Handler) {
    this.routes.push({ path, method: "GET", handler });
    this.use(handler);
  }

  use(
    pathOrMiddleware: string | MiddlewareHandler,
    ...middleware: MiddlewareHandler[]
  ) {
    if (typeof pathOrMiddleware === "string") this;
    this.middlewareStack.push(...middleware);
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

app.use(async (req, res, next) => {
  const bodyParser = new BodyParser();
  await bodyParser.extractData(req, res);
  next();
});

app.use((req, res, next) => {
  console.log(new Date());
  console.log(req.body, "dddddddddddd");
  next();
});

app.use((req, res, next) => {
  console.log(new Date());
  console.log(req.body, "eeeeeeeeeeeeeeeeeee");
  return;
});

app.get("/us", (req, res) => {
  res.write(req.body.name + " " + "welcome");
  res.end();
});
