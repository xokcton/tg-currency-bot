import TelegramBot from 'node-telegram-bot-api'
import dotenv from 'dotenv'
import { getCurrencies } from './currency'
import { addToFavorites, deleteFavorite, getAllFavorites, getOneFavorite } from '../controllers/telegram'
import Favorites from '../models/favorites'

interface ICommands{
  command: string,
  description: string
}

dotenv.config()
const { TOKEN, SERVER_URL }  = process.env
const bot = new TelegramBot(`${TOKEN}`)
const myCommands: ICommands[] = [
  {command: '/start', description: 'Bot greeting'},
  {command: '/help', description: 'Brief information about the bot and its list of commands'},
  {command: '/listRecent', description: 'A small list of hype crypts in the next form: /{currency_symbol} $pricePerUnit'},
  {command: '/{currency_symbol}', description: 'Get detailed information about cryptocurrency'},
  {command: '/addToFavorite', description: 'Adds the crypt to the "favorites" section'},
  {command: '/listFavorite', description: 'Returns a list of selected crypts'},
  {command: '/deleteFavorite', description: 'Removes crypt from "favorites" section'}
]
bot.setWebHook(`${SERVER_URL}/bot${TOKEN}`)

bot.setMyCommands([
  {command: '/start', description: 'Bot greeting'},
  {command: '/help', description: 'Brief information about the bot and its list of commands'}
])

bot.onText(/(.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const resp = match![1]
  const newArr = [...myCommands.map(element => element.command)]
  const { data } = await getCurrencies()

  data.forEach((element: { symbol: string }) => {
    newArr.push('/' + element.symbol.toLowerCase())
  })

  const index = newArr.indexOf(resp)
  if (index === -1) {
    bot.sendMessage(chatId, 'I don\'t understand you!')
  }
})

bot.onText(/\/help/, (msg, match) => {
  const chatId = msg.chat.id
  const briefInfo: string = "I am a bot that allows you to easily follow the hype crypt :)"
  let commandsList: string = ''

  myCommands.forEach(element => {
    commandsList += `${element.command} - ${element.description}\n\n`
  })
  bot.sendMessage(chatId, `${briefInfo}\n\n${commandsList}`)
})

bot.onText(/\/start/, (msg, match) => {
  const chatId = msg.chat.id
  const welcome = `${msg.chat.first_name}, welcome to Lambda_Task6 chat bot :)`
  bot.sendMessage(chatId, welcome)
})

bot.onText(/\/listRecent/, async (msg, match) => {
  const chatId = msg.chat.id
  const { data } = await getCurrencies()
  const list = formList(data)
  bot.sendMessage(chatId, list)
})

bot.onText(/\/(.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const userId = msg.from?.id!
  const { data } = await getCurrencies()
  const resp = match![1]
  const isMatch = data.filter((el: { symbol: string }) => el.symbol.toLowerCase() === resp)
  
  if(isMatch.length > 0){
    const alreadyAdded = await getOneFavorite(userId, isMatch[0].symbol)
    let opts
    if (alreadyAdded) {
      opts = configureOptions(true)
    }
    else{
      opts = configureOptions(false)
    }
    const res = getDetailedInfo(isMatch)
    bot.sendMessage(chatId, res, opts)
  }
})

bot.onText(/\/addToFavorite (.+)/, async (msg, match) => {
  const { data } = await getCurrencies()
  const chatId = msg.chat.id
  const userId = msg.from?.id
  const firstName = msg.from?.first_name
  let currencySymbol, price
  const resp = match![1]
  const certainCurrency = data.filter((el: { symbol: string }) => el.symbol.toLowerCase() === resp)
  
  if (certainCurrency[0]) {
    currencySymbol = certainCurrency[0].symbol.toLowerCase()
    price = certainCurrency[0].quote.USD.price.toFixed(2)
    const dbUnit = {
      chatId,
      userId,
      firstName,
      currencySymbol,
      price
    } as Favorites
    const result = await addToFavorites(dbUnit)
    bot.sendMessage(chatId, result?.message!)
  }
})

bot.onText(/\/deleteFavorite (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const { data } = await getCurrencies()
  const currencySymbol: string = match![1]
  const certainCurrency = data.filter((el: { symbol: string }) => el.symbol.toLowerCase() === currencySymbol)
  
  if (certainCurrency[0]) {
    const result = await deleteFavorite(currencySymbol)
    bot.sendMessage(chatId, result?.message!)
  }
})

bot.onText(/\/listFavorite/, async (msg, match) => {
  const chatId = msg.chat.id
  const userId = msg.from?.id!
  const data = (await getAllFavorites(userId)) as Favorites[]
  const list = formListFromDb(data)
  bot.sendMessage(chatId, list)
})

const formList = (array: Array<any>): string => {
  const firstTwenty = array.slice().splice(0, 20)
  let resultList: string = ''

  firstTwenty.forEach(element => {
    resultList += `/${element.symbol.toLowerCase()} $${element.quote.USD.price.toFixed(2)}\n`
  })

  return resultList
}

const formListFromDb = (array: Favorites[]): string => {
  const firstTwenty = array.slice().splice(0, 20)
  let resultList: string = ''

  firstTwenty.forEach(element => {
    resultList += `/${element.currencySymbol.toLowerCase()} $${element.price}\n`
  })

  return resultList
}

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data
  const msg = callbackQuery.message!
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id
  }
  let text = ''

  const extraText = msg.text?.split(' ')!
  const chatId = msg.from?.id!
  const userId = msg.chat?.id!
  const firstName = msg.chat?.first_name!
  const firstIndex = msg.text?.indexOf('Symbol')! + 8
  const secondIndex = msg.text?.indexOf('\n')!
  const currencySymbol = (msg.text?.substring(firstIndex, secondIndex))?.trim().toLowerCase()!
  const price = +(extraText[extraText.length - 1])

  if (action === 'add') {
    await addToFavorites({ chatId, userId, firstName, currencySymbol, price })
    text = `${currencySymbol} was added successfully`
  } else {
    await deleteFavorite(currencySymbol)
    text = `${currencySymbol} was removed successfully`
  }

  bot.editMessageText(text, opts)
})

const getDetailedInfo = (array: Array<any>) => {
  const currency = array[0] 
  const result = `Name: ${currency.name} | Symbol: ${currency.symbol} \n CMC rank: ${currency.cmc_rank} | Cost: $ ${currency.quote.USD.price.toFixed(2)}`
  return result
}

const configureOptions = (alreadyAdded: boolean) => {
  return alreadyAdded ? 
  {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Remove from following',
            callback_data: 'remove'
          }
        ]
      ]
    }
  } 
  : {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Add to following',
            callback_data: 'add'
          }
        ]
      ]
    }
  }
}

export default bot