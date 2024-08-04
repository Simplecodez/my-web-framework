import { MatchResult, Params } from "../interfaces/utils.interface";

export class Utils {
  static splitPath(path: string): [string, string] {
    const segments = path.split("/").filter((segment) => segment !== "");
    const basePath = `/${segments[0]}`;
    const subPath =
      segments.length > 1 ? `/${segments.slice(1).join("/")}` : basePath;

    return [basePath, subPath];
  }

  private static isValidPath(path: string): boolean {
    const maxPathLength = 2000;
    const validPathRegex = /^[a-zA-Z0-9-_/]+$/;
    return path.length <= maxPathLength && validPathRegex.test(path);
  }

  static matchPath(template: string, path: string): MatchResult {
    if (!Utils.isValidPath(path)) {
      return { matched: false };
    }
    const paramNames: string[] = [];
    const regexPath = template.replace(/:(\w+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return "([^/]+)";
    });

    const pathRegex = new RegExp(`^${regexPath}$`);
    const match = path.match(pathRegex);

    if (!match) {
      return { matched: false };
    }

    const params: Params = {};
    paramNames.forEach((paramName, index) => {
      params[paramName] = decodeURIComponent(match[index + 1]);
    });

    return { matched: true, params };
  }
}
