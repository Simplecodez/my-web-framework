import { IncomingMessage, ServerResponse } from "http";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

export interface Route {
  path: string;
  method: string;
  handler: Handler;
}

export interface Request extends IncomingMessage {
  body?: any;
}
