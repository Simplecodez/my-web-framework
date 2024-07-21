import http, { IncomingMessage, ServerResponse } from "http";
import { Handler, Route } from "../interfaces/router.interface";
import { BodyParser } from "./body-parser";
import { MiddlewareHandler } from "../interfaces/middleware.interface";

export class Application {
  private routes: Route[] = [];
  private middlewareStack: MiddlewareHandler[] = [];

  get(path: string, handler: Handler) {
    this.routes.push({ path, method: "GET", handler });
  }

  use(middleware: MiddlewareHandler) {
    this.middlewareStack.push(middleware);
  }

  async registerMiddleWare(req: IncomingMessage, res: ServerResponse) {
    const index = 0;
    let isNextCalled = false;
    for (let index = 0; index < this.middlewareStack.length; index++) {
      await this.middlewareStack[index](req, res, () => {
        isNextCalled = true;
      });

      if (!isNextCalled) {
        break;
      }
    }
  }

  listen(port: number, callback: () => void) {
    const server = http.createServer((req: IncomingMessage, res) => {
      // Handle middleware
      this.registerMiddleWare(req, res);
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
  const bodyParser = new BodyParser(req, res);
  req.body = await bodyParser.getBody(req);
  console.log("eeeeeeeeeee");
});
app.use((req, res, next) => {
  console.log(new Date());
  console.log(req.body, "dddddddddddd");
  next();
});

app.get("/us", (req, res) => {
  res.write("Welcome to reel.");
  res.end();
});
