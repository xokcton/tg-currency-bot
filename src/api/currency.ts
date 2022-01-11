import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()
const CMC_KEY = process.env.CMC_KEY || ''
const CMC_URL = process.env.CMC_URL || ''

class Currency{
  constructor (private readonly key: string,  private readonly url: string){}

  getCurrencies = async () => {
    const config = {
      headers: {
        'X-CMC_PRO_API_KEY': this.key
      }
    }
    const { data } = await axios.get(this.url, config)
    return data
  }
}

export const currency = new Currency(CMC_KEY, CMC_URL) 