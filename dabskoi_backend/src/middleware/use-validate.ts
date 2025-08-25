import { ZodError, ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const useValidate =
  (schemas: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      let message = "Harap lengkapi form dengan benar";
      if (err instanceof ZodError) {
        message = err?.errors?.map((error) => error?.message)?.[0] || message;
      } else {
        message = err?.message || message;
      }
      return res.status(400).json({
        metaData: {
          code: 400,
          message: "Bad Request",
        },
        responseMessage: message,
        errors: err?.errors || err,
      });
    }
  };
