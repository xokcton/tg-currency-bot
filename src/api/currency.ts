import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()
const { CMC_KEY, CMC_URL } = process.env

export const getCurrencies = async () => {
  const config = {
    headers: {
      'X-CMC_PRO_API_KEY': CMC_KEY!
    }
  }
  const { data } = await axios.get(CMC_URL!, config)
  return data
}