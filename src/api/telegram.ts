import { getCurrencies } from './currency'
import { addToFavorites, deleteFavorite, getAllFavorites, getOneFavorite } from '../controllers/telegram'
import Favorites from '../models/favorites'

interface ICommands{
  command: string,
  description: string
}

const myCommands: ICommands[] = [
  {command: '/start', description: 'Bot greeting'},
  {command: '/help', description: 'Brief information about the bot and its list of commands'},
  {command: '/listRecent', description: 'A small list of hype crypts in the next form: /{currency_symbol} $pricePerUnit'},
  {command: '/{currency_symbol}', description: 'Get detailed information about cryptocurrency'},
  {command: '/addToFavorite', description: 'Adds the crypt to the "favorites" section'},
  {command: '/listFavorite', description: 'Returns a list of selected crypts'},
  {command: '/deleteFavorite', description: 'Removes crypt from "favorites" section'}
]

export const unknownMessage = async (resp: string) => {
  const newArr = [...myCommands.map(element => element.command)]
  const { data } = await getCurrencies()

  data.forEach((element: { symbol: string }) => {
    newArr.push('/' + element.symbol.toLowerCase())
  })

  const index = newArr.indexOf(resp)
  if (index === -1) {
    const answer = 'I don\'t understand you!'
    return {
      answer
    }
  }
}

export const helpMessage = () => {
  const briefInfo: string = "I am a bot that allows you to easily follow the hype crypt :)"
  let commandsList: string = ''

  myCommands.forEach(element => {
    commandsList += `${element.command} - ${element.description}\n\n`
  })

  const answer = `${briefInfo}\n\n${commandsList}`

  return {
    answer
  }
}

export const startMessage = (firstName: string) => {
  return {
    answer: `${firstName}, welcome to Lambda_Task6 chat bot :)`
  }
}

export const listRecentMessage = async () => {
  const { data } = await getCurrencies()
  const list = formList(data)
  return {
    answer: list
  }
}

export const getCurrencyInfoMessage = async (userId: number, resp: string) => {
  const { data } = await getCurrencies()
  const isMatch = data.filter((el: { symbol: string }) => el.symbol.toLowerCase() === resp)
  let isTrue: boolean = false
  
  if(isMatch.length > 0){
    const alreadyAdded = await getOneFavorite(userId, isMatch[0].symbol)
    let opts
    if (alreadyAdded) {
      opts = configureOptions(true)
    }
    else{
      opts = configureOptions(false)
    }
    const msg = getDetailedInfo(isMatch)
    isTrue = true

    return {
      answer: {
        msg,
        opts,
        isTrue
      }
    }
  }

  return {
    answer: {
      msg: '',
      opts: {},
      isTrue
    }
  }
}

export const addToFavoriteMessage = async (chatId: number, userId: number, firstName: string, resp: string) => {
  const { data } = await getCurrencies()
  let currencySymbol, price
  let isTrue: boolean = false
  const certainCurrency = data.filter((el: { symbol: string }) => el.symbol.toLowerCase() === resp)
  
  if (certainCurrency[0]) {
    isTrue = true
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
    return {
      answer: {
        msg: result?.message!,
        isTrue
      }
    }
  }

  return {
    answer: {
      msg: '',
      isTrue
    }
  }
}

export const deleteFavoriteMessage = async (currencySymbol: string) => {
  const { data } = await getCurrencies()
  let isTrue = false
  const certainCurrency = data.filter((el: { symbol: string }) => el.symbol.toLowerCase() === currencySymbol)
  
  if (certainCurrency[0]) {
    isTrue = true
    const result = await deleteFavorite(currencySymbol)
    return {
      answer: {
        msg: result?.message!,
        isTrue
      }
    }
  }

  return {
    answer: {
      msg: '',
      isTrue
    }
  }
}

export const listFavoriteMessage = async (userId: number) => {
  const data = (await getAllFavorites(userId)) as Favorites[]
  const list = formListFromDb(data)
  return {
    answer: list
  }
}

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

export const handleCallbackQuery = async (action: string, msg: any) => {
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

  return {
    answer: text
  }
}

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