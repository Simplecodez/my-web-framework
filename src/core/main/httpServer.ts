import http from "http";
import { Handler, Route } from "../interfaces/router.interface";

export class Server {
  private routes: Route[] = [];

  get(path: string, handler: Handler) {
    this.routes.push({ path, method: "GET", handler });
  }

  listen(port: number, callback: () => void) {
    const server = http.createServer((req, res) => {
      const route = this.routes.find(
        (route) => route.method === req.method && route.path === req.url
      );
      if (route) {
        route.handler(req, res);
      } else {
        res.write(`Can't find ${req.url} on this server.`);
        res.end();
      }
    });

    server.listen(port, callback);
  }
}
