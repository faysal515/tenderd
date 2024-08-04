import { Service, Container } from "typedi";
import * as winston from "winston";
import { Request } from "express";

@Service()
export default class LoggerService {
  private loggerInstance: winston.Logger;

  constructor() {
    this.loggerInstance = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [new winston.transports.Console()],
    });
  }

  public info(message: string, meta?: any) {
    this.loggerInstance.info(message, { ...meta });
  }

  public error(message: string, meta?: any) {
    this.loggerInstance.error(message, { ...meta });
  }
}
