import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export const validateRequest =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsedData.body;
      req.query = parsedData.query;
      req.params = parsedData.params;
      next();
    } catch (error) {
      next(error);
    }
  };
