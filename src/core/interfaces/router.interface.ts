import { IncomingMessage, ServerResponse } from "http";

export type Handler = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: any) => void
) => void;

export interface HandlerMiddleware {
  path: string;
  method: string;
  handler: Handler;
}
