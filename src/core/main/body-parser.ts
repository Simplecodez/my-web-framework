import { IncomingMessage, ServerResponse } from "http";

export class BodyParser {
  private dataBinary: Buffer[] = [];

  public async extractData(req: IncomingMessage, res: ServerResponse) {
    return new Promise<void>((resolve, reject) => {
      req.on("data", (chunk: Buffer) => {
        this.dataBinary.push(chunk);
      });

      req.on("end", () => {
        req.body = this.parseData(req.headers["content-type"] as string);
        resolve();
      });

      req.on("error", (err) => {
        reject(err);
      });
    });
  }

  private parseData(contentType: string) {
    const buffer = Buffer.concat(this.dataBinary);

    const stringdata = buffer.toString("utf8");
    if (contentType === "application/json") return JSON.parse(stringdata);
    else console.log(stringdata);
  }
}
