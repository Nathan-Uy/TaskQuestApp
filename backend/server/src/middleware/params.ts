import { Request } from "express";

export const param = (req: Request, key: string): string => {
  const val = req.params[key];
  return Array.isArray(val) ? (val[0] ?? "") : (val ?? "");
};
