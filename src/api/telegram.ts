import { currency } from './currency'
import { addToFavorites, deleteFavorite, getAllFavorites, getOneFavorite } from '../controllers/telegram'
import Favorites from '../models/favorites'

interface ICommands{
  command: string,
  description: string
}

export class Telegram {
  private myCommands: ICommands[] = [
    {command: '/start', description: 'Bot greeting'},
    {command: '/help', description: 'Brief information about the bot and its list of commands'},
    {command: '/listRecent', description: 'A small list of hype crypts in the next form: /{currency_symbol} $pricePerUnit'},
    {command: '/{currency_symbol}', description: 'Get detailed information about cryptocurrency'},
    {command: '/addToFavorite', description: 'Adds the crypt to the "favorites" section'},
    {command: '/listFavorite', description: 'Returns a list of selected crypts'},
    {command: '/deleteFavorite', description: 'Removes crypt from "favorites" section'}
  ]

  unknownMessage = async (resp: string) => {
    const newArr = [...this.myCommands.map(element => element.command)]
    const { data } = await currency.getCurrencies()
  
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

  helpMessage = () => {
    const briefInfo = "I am a bot that allows you to easily follow the hype crypt :)"
    let commandsList = ''
  
    this.myCommands.forEach(element => {
      commandsList += `${element.command} - ${element.description}\n\n`
    })
  
    const answer = `${briefInfo}\n\n${commandsList}`
  
    return {
      answer
    }
  }

  startMessage = (firstName: string) => {
    return {
      answer: `${firstName}, welcome to Lambda_Task6 chat bot :)`
    }
  }

  listRecentMessage = async () => {
    const { data } = await currency.getCurrencies()
    const list = this.formList(data)
    return {
      answer: list
    }
  }

  getCurrencyInfoMessage = async (userId: number, resp: string) => {
    const { data } = await currency.getCurrencies()
    const isMatch = data.filter((el: { symbol: string }) => el.symbol.toLowerCase() === resp)
    let isTrue = false
    
    if(isMatch.length > 0){
      const alreadyAdded = await getOneFavorite(userId, isMatch[0].symbol)
      let opts
      if (alreadyAdded) {
        opts = this.configureOptions(true)
      }
      else{
        opts = this.configureOptions(false)
      }
      const msg = this.getDetailedInfo(isMatch)
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

  addToFavoriteMessage = async (chatId: number, userId: number, firstName: string, resp: string) => {
    const { data } = await currency.getCurrencies()
    let currencySymbol, price
    let isTrue = false
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
      let message = ''
      if (result) message = result.message
      return {
        answer: {
          msg: message,
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

  deleteFavoriteMessage = async (currencySymbol: string) => {
    const { data } = await currency.getCurrencies()
    let isTrue = false
    const certainCurrency = data.filter((el: { symbol: string }) => el.symbol.toLowerCase() === currencySymbol)
    
    if (certainCurrency[0]) {
      isTrue = true
      const result = await deleteFavorite(currencySymbol)
      let message = ''
      if (result) message = result.message
      return {
        answer: {
          msg: message,
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

  listFavoriteMessage = async (userId: number) => {
    const data = (await getAllFavorites(userId)) as Favorites[]
    const list = this.formListFromDb(data)
    return {
      answer: list
    }
  }

  handleCallbackQuery = async (action: string, msg: any) => {
    let text = ''
    const extraText = msg.text.split(' ')
    const chatId = msg.from.id
    const userId = msg.chat.id
    const firstName = msg.chat.first_name
    const firstIndex = msg.text.indexOf('Symbol') + 8
    const secondIndex = msg.text.indexOf('\n')
    const currencySymbol = (msg.text.substring(firstIndex, secondIndex)).trim().toLowerCase()
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

  private formList = (array: Array<any>): string => {
    const firstTwenty = array.slice().splice(0, 20)
    let resultList = ''
  
    firstTwenty.forEach(element => {
      resultList += `/${element.symbol.toLowerCase()} $${element.quote.USD.price.toFixed(2)}\n`
    })
  
    return resultList
  }

  private formListFromDb = (array: Favorites[]): string => {
    const firstTwenty = array.slice().splice(0, 20)
    let resultList = ''
  
    firstTwenty.forEach(element => {
      resultList += `/${element.currencySymbol.toLowerCase()} $${element.price}\n`
    })
  
    return resultList
  }

  private getDetailedInfo = (array: Array<any>) => {
    const currency = array[0] 
    const result = `Name: ${currency.name} | Symbol: ${currency.symbol} \n CMC rank: ${currency.cmc_rank} | Cost: $ ${currency.quote.USD.price.toFixed(2)}`
    return result
  }

  private configureOptions = (alreadyAdded: boolean) => {
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
}