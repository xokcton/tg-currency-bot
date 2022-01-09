import { Router } from 'express'
import { getMessage } from '../controllers/telegram'

const router = Router()

router.post(`/bot`, getMessage)

export default router
