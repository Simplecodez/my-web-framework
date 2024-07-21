import { IncomingMessage, ServerResponse } from "http";

export type MiddlewareHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => void;
