import "dotenv/config"
import { resolve } from "node:path"

const config = {
  port: process.env.PORT,
  db: {
    client: "pg",
    connection: {
      user: process.env.DB_USER,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
    },
    migrations: {
      directory: resolve("./src/db/migrations"),
      stub: resolve("./src/db/migration.stub"),
    },
  },
  security: {
    jwt: {
      secret: process.env.SECURITY_JWT_SECRET,
      options: {
        expiresIn: "2 days",
      },
    },
    password: {
      saltLen: 128,
      keylen: 128,
      iterations: 10000,
      digest: "sha512",
      pepper: process.env.SECURITY_PASSWORD_PEPPER,
    },
  },
}

export default config
