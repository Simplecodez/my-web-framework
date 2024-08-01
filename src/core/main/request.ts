import url from "url";
import http from "http";
import { Request } from "../interfaces/middleware.interface";

export const addRequestProps = (req: http.IncomingMessage): Request => {
  const parseURL = url.parse(req.url as string, true);
  (req as Request).query = parseURL.query;
  (req as Request).pathname = parseURL.pathname || "";
  req.method = (req.method as string).toLowerCase();
  return req as Request;
};
