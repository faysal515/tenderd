import swaggerUi from "swagger-ui-express";
import express from "express";
import * as fs from "fs";
import * as path from "path";

export function setupSwagger(app: express.Express) {
  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../openapi.json"), "utf8")
  );

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
