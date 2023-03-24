import express from "express"
import winston from "winston"
import config from "./src/config.js"
import knex from "knex"
import BaseModel from "./src/db/models/BaseModel.js"
import prepareRoutes from "./src/prepareRoutes.js"

const db = knex(config.db)

BaseModel.knex(db)

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
})
const app = express()

app.use((req, res, next) => {
  req.locals = {}

  next()
})
app.use(express.json())
prepareRoutes({ app, db })

app.listen(config.port, () => logger.info(`Listening on :${config.port}`))
