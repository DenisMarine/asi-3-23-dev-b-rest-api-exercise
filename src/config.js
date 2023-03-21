import "dotenv/config"
import { resolve } from "node:path"

const config = {
  port: 3000,
  db: {
    client: "pg",
    connection: {
      user: process.env.BD_USER,
      database: process.env.BD_DATABASE,
    },
    migrations: {
      directory: resolve("src/db/migrations"),
      stub: resolve("src/db/migrations.stub"),
    },
  },
}

export default config
