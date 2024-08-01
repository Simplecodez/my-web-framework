import http from "http";
import { UrlWithParsedQuery } from "url";

export interface Response extends http.ServerResponse {
  send(): any;
}

export interface Request extends http.IncomingMessage {
  query: Record<string, any>;
  pathname: string;
  method: string;
  getParsedUrl(pathURL: string): UrlWithParsedQuery;
}

export type MiddlewareHandler = (
  req: Request,
  res: Response,
  next: (err?: any) => void
) => void;
