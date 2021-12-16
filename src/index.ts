import express from 'express'
import dotenv from 'dotenv'
import { json } from 'body-parser'
import { errorHandler } from './middlewares/error'
import tgRoutes from './routes/route'
import { connectToDatabase } from "./services/db"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000

app.use(json())
app.use(errorHandler)
app.use(tgRoutes)

connectToDatabase().catch((error: Error) => {
  console.error("Database connection failed ", error)
  process.exit()
})

app.listen(PORT)