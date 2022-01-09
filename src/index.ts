import express from 'express'
import dotenv from 'dotenv'
import { json, urlencoded } from 'body-parser'
import { errorHandler } from './middlewares/error'
import tgRoutes from './routes/route'
import { connectToDatabase } from "./services/db"
import { exec } from 'child_process'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000
const { TG_URI, TOKEN, SERVER_URL } = process.env
const command = `curl -F "url=${SERVER_URL}/bot" ${TG_URI}${TOKEN}/setWebhook`

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.log(`error: ${error.message}`)
    return
  }
  if (stderr) {
    console.log(`stderr: ${stderr}`)
    return
  }
  console.log(`stdout: ${stdout}`)
})

app.use(json())
app.use(urlencoded({ extended: true }))
app.use(errorHandler)
app.use(tgRoutes)

connectToDatabase().catch((error: Error) => {
  console.error("Database connection failed ", error)
  process.exit()
})

app.listen(PORT)