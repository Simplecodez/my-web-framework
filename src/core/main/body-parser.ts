import { IncomingMessage, ServerResponse } from "http";
import { MiddlewareHandler } from "../interfaces/middleware.interface";

export class BodyParser {
  private dataBinary: Buffer[] = [];
  private body: any;
  constructor(req: IncomingMessage, res: ServerResponse) {
    this.extractData(req, res);
  }
  private extractData(req: IncomingMessage, res: ServerResponse) {
    req.on("data", (chunk: Buffer) => {
      this.dataBinary.push(chunk);
    });

    req.on("end", () => {
      this.body = this.parseData(req.headers["content-type"] as string);
    });
  }

  private parseData(contentType: string) {
    const buffer = Buffer.concat(this.dataBinary);

    const stringdata = buffer.toString("utf8");
    if (contentType === "application/json") return JSON.parse(stringdata);
    else console.log(stringdata);
  }

  async getBody(req: IncomingMessage): Promise<any> {
    // Wait until the 'end' event has been processed
    return new Promise((resolve) => {
      req.on("end", () => {
        resolve(this.body);
      });
    });
  }
}
