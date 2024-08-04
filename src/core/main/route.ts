import { MiddlewareHandler } from "../interfaces/middleware.interface";
import { Method } from "./method";

export class Router extends Method {
  constructor() {
    super();
  }
  route() {}

  addSubRoutesHandler(
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

  get(path: string, ...middlewares: MiddlewareHandler[]) {
    this.addSubRoutesHandler(path, "get", middlewares);
  }

  post(path: string, ...middlewares: MiddlewareHandler[]) {
    this.addSubRoutesHandler(path, "post", middlewares);
  }

  patch(path: string, ...middlewares: MiddlewareHandler[]) {
    this.addSubRoutesHandler(path, "patch", middlewares);
  }
}

const router = new Router();

router.get("/me", (req, res, next) => {
  console.log(req.body);
  res.end("uuuuuuuuuuu");
});

export { router };
