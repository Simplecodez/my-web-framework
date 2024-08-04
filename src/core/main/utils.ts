export class Utils {
  static splitPath(path: string): [string, string] {
    const segments = path.split("/").filter((segment) => segment !== "");
    const basePath = `/${segments[0]}`;
    const subPath =
      segments.length > 1 ? `/${segments.slice(1).join("/")}` : basePath;

    return [basePath, subPath];
  }
}
