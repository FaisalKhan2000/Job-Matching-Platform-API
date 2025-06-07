import { NextFunction, Request, Response } from "express";

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const catchErrors = (controller: ControllerFunction) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const result = await controller(req, res, next);
      return result;
    } catch (error) {
      next(error);
    }
  };
};
