import { Middleware, ExpressMiddlewareInterface } from "routing-controllers";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { Service } from "typedi";

@Middleware({ type: "before" })
@Service()
export class AddRequestIdMiddleware implements ExpressMiddlewareInterface {
  use(req: Request, res: Response, next: NextFunction): void {
    res.locals.requestId = uuidv4();
    next();
  }
}
