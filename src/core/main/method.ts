import { MiddlewareHandler } from "../interfaces/middleware.interface";

export type RouteMiddleware = {
  [method: string]: MiddlewareHandler[];
};

export type SubPath = Map<string, RouteMiddleware>;

export class Method {
  public routeMiddleware: SubPath = new Map();

  private addRoute(
    path: string,
    method: string,
    middlewares: MiddlewareHandler[]
  ) {
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

// const app = new Application();
// app.listen(3000, () => {
//   console.log("listening...");
// });

// app.get("/", (req, res, next) => {});

// app.use(async (req, res, next) => {
//   const bodyParser = new BodyParser();
//   await bodyParser.extractData(req, res);
//   next();
// });

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

// // app.use((req, res, next) => {
// //   console.log(new Date());
// //   console.log(req.body, "eeeeeeeeeeeeeeeeeee");
// //   return;
// // });

// app.get("/us", (req, res) => {
//   res.write(req.body.name + " " + "welcome");
//   res.end();
// });
