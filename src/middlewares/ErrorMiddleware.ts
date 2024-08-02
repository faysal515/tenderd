import {
  Middleware,
  ExpressErrorMiddlewareInterface,
  HttpError,
} from "routing-controllers";
import { Service } from "typedi";
import { Request, Response, NextFunction } from "express";
import LoggerService from "../services/LoggerService";

@Service()
@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  constructor(private logger: LoggerService) {}

  error(error: any, req: Request, res: Response, next: NextFunction): void {
    const status = error.httpCode || 500;
    const message = error.message || "Internal Server Error";
    const errors = error.errors || [];

    // Log the error
    this.logger.error("Error occurred", {
      message,
      errors,
      stack: error.stack,
      requestId: res.locals.requestId,
    });

    // if (res.headersSent) {
    //   return next(error);
    // }

    // Check if it's a validation error
    if (error.name === "BadRequestError" && errors.length) {
      const formattedErrors = errors.map((err: any) => ({
        property: err.property,
        constraints: err.constraints,
      }));

      res.status(400).json({
        status: 400,
        message: "Validation Error",
        errors: formattedErrors,
        requestId: res.locals.requestId,
      });
    } else {
      // Send the error response
      res.status(status).json({
        status,
        message,
        errors,
        requestId: res.locals.requestId,
      });
    }
  }
}
