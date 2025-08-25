import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constant/auth";
import { $Enums } from "@prisma/client";
import { UserDecodedSchema } from "../validators/UserValidator";

export const useAuth =
  (roles: $Enums.Role[] = []) =>
  (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers?.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader?.split(" ")?.[1];
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        const decoded = UserDecodedSchema.parse(payload);
        if (!roles.includes(decoded.role as $Enums.Role)) {
          return res.status(403).json({
            metaData: { code: 403, message: "Forbidden" },
            responseMessage: "Forbidden",
          });
        }
        req.user = {
          id: decoded.id,
          role: decoded.role as $Enums.Role,
        };
        return next();
      } catch {
        return res.status(401).json({
          metaData: { code: 401, message: "Unauthorized" },
          responseMessage: "Unauthorized",
        });
      }
    }

    return res.status(401).json({
      metaData: { code: 401, message: "Unauthorized" },
      responseMessage: "Unauthorized",
    });
  };
