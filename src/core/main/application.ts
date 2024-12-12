import http from 'http';
import {
  GlobalErrorHandler,
  MiddlewareHandler,
  NextFunction,
  Request,
  Response
} from '../interfaces/middleware.interface';
import { Router } from './router';
import { Method, RouteMiddleware } from './method';
import { addRequestProps } from './request';
import { addResponseProps } from './response';
import { Params } from '../interfaces/utils.interface';
import { Utils } from './utils';

/**
 * The `Application` class serves as the core framework for handling HTTP requests, middleware, and routing.
 * It provides mechanisms for global middleware, path-specific middleware, and request routing.
 *
 * @extends Method
 */
export class Application extends Method {
  private globalMiddlewareStore: MiddlewareHandler[] = [];
  private pathGlobalMiddleware: Map<string, MiddlewareHandler[]> = new Map();
  private pathMiddlewareAndHandler: Map<string, RouteMiddleware> = new Map();

  constructor() {
    super();
  }

  private loadMiddleware() {
    for (const [key, value] of this.routeMiddleware) {
      if (this.globalMiddlewareStore.length > 0) {
        for (const method in value) value[method].unshift(...this.globalMiddlewareStore);
      }
      this.pathMiddlewareAndHandler.set(key, value);
    }
  }

  private extractPathGlobalHandler(path: string) {
    const pathGlobalMiddleware: MiddlewareHandler[] = [];
    for (const [key, value] of this.pathGlobalMiddleware) {
      if (path.startsWith(key)) {
        pathGlobalMiddleware.push(...value);
        break;
      }
    }
    return pathGlobalMiddleware;
  }

  /**
   * Prepends path-specific and global middleware to route handlers and updates the middleware map.
   *
   * @private
   * @param {string} path - The base path for the route.
   * @param {Router} routeHandler - The router instance containing middleware and handlers for subpaths.
   * @param {MiddlewareHandler[]} pathGlobalMiddleware - An array of middleware specific to the given path.
   */
  private prependPathAndGlobalMiddleware(
    path: string,
    routeHandler: Router,
    pathGlobalMiddleware: MiddlewareHandler[]
  ) {
    for (const [subPath, value] of routeHandler.routeMiddleware) {
      if (this.globalMiddlewareStore.length > 0) {
        for (const method in value) {
          value[method].unshift(...pathGlobalMiddleware);
          value[method].unshift(...this.globalMiddlewareStore);
        }
      }
      let fullPath = Utils.getFullPath(path, subPath);
      if (subPath === '/') {
        fullPath = path;
      }
      this.pathMiddlewareAndHandler.set(fullPath, value);
    }
  }

  private handleCasesOfRouterAndMiddlewareMix(
    handlers: (Router | MiddlewareHandler)[],
    errMsg: string
  ) {
    for (const handler of handlers) {
      if (handler instanceof Router) {
        throw Error(errMsg);
      }
    }
  }

  /**
   * Handles the execution of middleware and error handlers in sequence for a specific request and response cycle.
   *
   * @private
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @param {number} index - The current index of the middleware in the execution chain.
   * @param {(MiddlewareHandler | GlobalErrorHandler)[]} methodMiddlewareHandler - The list of middleware
   * and/or global error handlers to execute.
   * @returns {NextFunction} The `next` function to call the next middleware or handle an error.
   */
  private nextFunction(
    req: Request,
    res: Response,
    index: number,
    methodMiddlewareHandler: (MiddlewareHandler | GlobalErrorHandler)[]
  ): NextFunction {
    const next = (err: any): void => {
      if (index >= methodMiddlewareHandler.length) {
        if (err) {
          res.status(500).send('Internal server error');
          if (err instanceof Error) {
            throw err;
          } else {
            throw new Error('Provide a global error handler');
          }
        }
      }
      const eachMiddleware = methodMiddlewareHandler[index++];

      if (err) {
        if (eachMiddleware.length === 4) {
          (eachMiddleware as GlobalErrorHandler)(err, req, res, next);
        } else {
          next(err);
        }
      } else {
        if (eachMiddleware.length < 4) {
          try {
            (eachMiddleware as MiddlewareHandler)(req, res, next);
          } catch (err) {
            next(err);
          }
        }
      }
    };
    return next;
  }

  /**
   * Registers middleware, routers, or global error handlers.
   *
   * @param {string | MiddlewareHandler | GlobalErrorHandler} pathOrMiddleware - A route path (string),
   * a middleware handler, or a global error handler (if arity is 4).
   * @param {...(Router | MiddlewareHandler)[]} handlers - Additional middleware or router instances.
   *
   * @throws {Error} Throws an error if a `Router` instance is mixed with middleware in an invalid way.
   */
  use(
    pathOrMiddleware: string | MiddlewareHandler | GlobalErrorHandler,
    ...handlers: (Router | MiddlewareHandler)[]
  ) {
    // Add path handlers to pathMiddleware container
    if (typeof pathOrMiddleware === 'string') {
      const routeHandler = handlers[handlers.length - 1];

      if (!(routeHandler instanceof Router)) {
        const errMsg =
          'Invalid middleware signature. Remove Router instance for path specific middleware.';

        this.handleCasesOfRouterAndMiddlewareMix(handlers, errMsg);

        this.pathGlobalMiddleware.set(pathOrMiddleware, handlers as MiddlewareHandler[]);
        return;
      }

      const pathGlobalMiddleware = this.extractPathGlobalHandler(pathOrMiddleware);
      this.prependPathAndGlobalMiddleware(
        pathOrMiddleware,
        routeHandler,
        pathGlobalMiddleware
      );

      return;
    }

    // adds global error handler
    if (pathOrMiddleware.length === 4) {
      for (const [path, routeHandler] of this.pathMiddlewareAndHandler) {
        for (const method in routeHandler) {
          routeHandler[method].push(pathOrMiddleware);
        }
      }
      return;
    }

    const errMsg =
      'Invalid middleware signature. Remove Router instance for global middleware.';
    this.handleCasesOfRouterAndMiddlewareMix(handlers, errMsg);

    this.globalMiddlewareStore.push(
      pathOrMiddleware as MiddlewareHandler,
      ...(handlers as MiddlewareHandler[])
    );
  }

  /**
   * Handles incoming HTTP requests by matching paths and executing middleware or handlers.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @async
   */
  async requestHandler(req: Request, res: Response) {
    const { pathname, method } = req;

    const methodMiddlewareHandler: (MiddlewareHandler | GlobalErrorHandler)[] = [];

    for (const [path, handler] of this.pathMiddlewareAndHandler) {
      const matchedPath = Utils.matchPath(path, pathname);
      if (matchedPath.matched) {
        req.params = matchedPath.params as Params;
        methodMiddlewareHandler.push(...handler[method]);
        break;
      }
    }

    let index = 0;
    this.nextFunction(req, res, index, methodMiddlewareHandler)();
  }

  /**
   * Converts the current instance into a request listener compatible with Node.js HTTP servers.
   *
   * @returns {(req: http.IncomingMessage, res: http.ServerResponse) => void} A function that acts as a request listener,
   * handling incoming requests and responses.
   */
  toRequestListener() {
    return (req: http.IncomingMessage, res: http.ServerResponse) => {
      const request = addRequestProps(req);
      const response = addResponseProps(res);
      this.loadMiddleware();
      return this.requestHandler(request, response);
    };
  }

  /**
   * Starts the HTTP server and listens for incoming requests on the specified port.
   *
   * @param {number} port - The port number on which the server will listen.
   * @param {() => void} callback - A callback function executed once the server starts listening.
   */
  listen(port: number, callback: () => void) {
    this.loadMiddleware();
    const server = http.createServer((req, res) => {
      const request = addRequestProps(req);
      const response = addResponseProps(res);
      return this.requestHandler(request, response);
    });
    server.listen(port, callback);
  }
}
