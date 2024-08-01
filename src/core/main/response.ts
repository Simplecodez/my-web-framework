import http from "http";
import { Response } from "../interfaces/middleware.interface";

export const addResponseProps = (res: http.ServerResponse): Response => {
  (res as Response).send = () => {};
  return res as Response;
};
