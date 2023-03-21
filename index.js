import express from "express"
import winston from "winston"
import config from "./src/config.js"
import knex from "knex"
import BaseModel from "./src/db/models/BaseModel.js"

const bd = knex(config.db)

BaseModel.knex(db)

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
})
const app = express()

app.listen(config.port, () => logger.info(`Listening on :${config.port}`))
