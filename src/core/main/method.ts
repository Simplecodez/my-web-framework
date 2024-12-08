import {
  GlobalErrorHandler,
  MiddlewareHandler
} from '../interfaces/middleware.interface';

export type RouteMiddleware = {
  [method: string]: (MiddlewareHandler | GlobalErrorHandler)[];
};

export type SubPath = Map<string, RouteMiddleware>;

export abstract class Method {
  protected path: string = '';
  public routeMiddleware: SubPath = new Map();

  /**
   * Sets the base path for the instance and enables method chaining.
   *
   * @param {string} path - The base route path.
   * @returns {this} The current instance for chaining.
   *
   * @example
   * method.route('/api')
   *   .get('/users', (req, res) => res.send('User list'))
   *   .post('/users', (req, res) => res.send('User created'));
   */
  route(path: string) {
    this.path = path;
    return this;
  }

  private addRoute(path: string, method: string, middlewares: MiddlewareHandler[]) {
    if (typeof path !== 'string') {
      throw new Error('Invalid input: path must be strings.');
    }

    if (
      !Array.isArray(middlewares) ||
      !middlewares.every((fn) => typeof fn === 'function')
    ) {
      throw new Error('Invalid input: middlewares must be an array of functions.');
    }

    let existingPath = this.routeMiddleware.get(path);

    if (existingPath && existingPath[method]) {
      console.warn(`Overwriting middleware for ${method.toUpperCase()} ${path}`);
    }

    if (!existingPath) {
      existingPath = { [method]: middlewares };
    } else {
      existingPath = { ...existingPath, [method]: middlewares };
    }
    this.routeMiddleware.set(path, existingPath);
  }

  private registerRoute(
    path: string | MiddlewareHandler,
    method: string,
    middlewares: MiddlewareHandler[]
  ) {
    if (typeof path === 'string') {
      this.addRoute(path, method, middlewares);
      return;
    }

    if (!this.path) {
      throw new Error('No path specified');
    }

    this.addRoute(this.path, method, [path, ...middlewares]);
  }

  /**
   * Registers a GET route with the specified path and middlewares.
   *
   * @param {string} path - The route path.
   * @param {...MiddlewareHandler[]} middlewares - Middleware functions for the GET request.
   * @returns {this} The current instance for chaining.
   */
  get(path: string | MiddlewareHandler, ...middlewares: MiddlewareHandler[]) {
    this.registerRoute(path, 'get', middlewares);
    return this;
  }

  /**
   * Registers a POST route with the specified path and middlewares.
   *
   * @param {string} path - The route path.
   * @param {...MiddlewareHandler[]} middlewares - Middleware functions for the GET request.
   * @returns {this} The current instance for chaining.
   */
  post(path: string | MiddlewareHandler, ...middlewares: MiddlewareHandler[]) {
    this.registerRoute(path, 'post', middlewares);
    return this;
  }

  /**
   * Registers a PATCH route with the specified path and middlewares.
   *
   * @param {string} path - The route path.
   * @param {...MiddlewareHandler[]} middlewares - Middleware functions for the GET request.
   * @returns {this} The current instance for chaining.
   */
  patch(path: string | MiddlewareHandler, ...middlewares: MiddlewareHandler[]) {
    this.registerRoute(path, 'patch', middlewares);
    return this;
  }
}
