import http from "http";
import { UrlWithParsedQuery } from "url";

export interface Response extends http.ServerResponse {
  send(data: any): void;
  status(code: number): Response;
  json(data: object): void;
}

export interface Request extends http.IncomingMessage {
  query: Record<string, any>;
  pathname: string;
  method: string;
  params: Record<string, string>;
  getParsedUrl(pathURL: string): UrlWithParsedQuery;
}

export type MiddlewareHandler = (
  req: Request,
  res: Response,
  next: (err?: any) => void
) => void;
