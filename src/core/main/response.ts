import http from "http";
import { Response } from "../interfaces/middleware.interface";

export const addResponseProps = (res: http.ServerResponse): Response => {
  (res as Response).send = (data: any) => {
    let contentType: string;
    let body: Buffer;

    if (typeof data === "string") {
      contentType = "text/html";
      body = Buffer.from(data, "utf-8");
    } else if (Buffer.isBuffer(data)) {
      contentType = "application/octet-stream";
      body = data;
    } else if (typeof data === "object") {
      contentType = "application/json";
      body = Buffer.from(JSON.stringify(data), "utf-8");
    } else {
      throw new Error("Unsupported data type");
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", body.length);
    res.end(body);
  };

  (res as Response).status = (code: number) => {
    res.statusCode = code;
    return res as Response;
  };

  (res as Response).json = (data: object) => {
    res.setHeader("Content-Type", "application/json");
    const jsonString = JSON.stringify(data);
    res.setHeader("Content-Length", Buffer.byteLength(jsonString));
    res.end(jsonString);
  };

  return res as Response;
};
