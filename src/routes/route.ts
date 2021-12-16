import { Router } from 'express'
import { getMessage } from '../controllers/telegram'
import dotenv from 'dotenv'

dotenv.config()
const { TOKEN } = process.env!
const router = Router()

router.post(`/bot${TOKEN}`, getMessage)

export default router
