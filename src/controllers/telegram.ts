import { RequestHandler } from "express"
import { collections } from "../services/db";
import Favorites from "../models/favorites";
import dotenv from 'dotenv'
import axios from 'axios'
import {
  listFavoriteMessage,
  deleteFavoriteMessage,
  addToFavoriteMessage,
  getCurrencyInfoMessage,
  listRecentMessage,
  startMessage,
  helpMessage,
  unknownMessage,
  handleCallbackQuery
} from '../api/telegram'

dotenv.config()
const { TG_URI, TOKEN } = process.env
const endpoint = `${TG_URI}${TOKEN}`
const possibleMessages = {
  start: /^\/start$/,
  help: /^\/help$/,
  listRecent: /^\/listRecent$/,
  addToFav: /^\/addToFavorite (.+)/,
  deleteFav: /^\/deleteFavorite (.+)/,
  listFav: /^\/listFavorite$/,
  currencyInfo: /^\/(.+)$/
}

const sendMessageToBot = async (chatId: number, msg: string, isButton: boolean = false, opts: any = {}) => {
  try {
    if (isButton) {
      return await axios.post(`${endpoint}/sendMessage`, {
        chat_id: chatId,
        text: msg,
        reply_markup: opts.reply_markup
      })
    }
    return await axios.post(`${endpoint}/sendMessage`, {
      chat_id: chatId,
      text: msg,
    })
  } catch (error) {
    console.log(error)
  }
}

const answerCallbackQuery = async (callbackId: number, msg: string) => {
  try {
    return await axios.post(`${endpoint}/answerCallbackQuery`, {
      callback_query_id: callbackId,
      text: msg,
    })
  } catch (error) {
    console.log(error)
  }
}

const deleteMessageFromBot = async (chatId: number, messageId: number) => {
  try {
    return await axios.post(`${endpoint}/deleteMessage`, {
      chat_id: chatId,
      message_id: messageId,
    })
  } catch (error) {
    console.log(error)
  }
}

export const getMessage: RequestHandler = async (req, res) => {
  const { message } = req.body
  // let botAnswer: string = 'I don\'t understand you!'
  let botAnswer: string = 'xz!'

  if (req.body?.callback_query?.id) {
    const { answer } = await handleCallbackQuery(req.body?.callback_query?.data, req.body?.callback_query?.message)
    const callbackResponse = await answerCallbackQuery(req.body?.callback_query?.id, answer)
    if (callbackResponse?.data?.ok){
      const messageId = req.body.callback_query.message.message_id
      const chatId = req.body.callback_query.message.chat.id
      const deleteMessageResponse = await deleteMessageFromBot(chatId, messageId)
      if (deleteMessageResponse?.data?.ok) {
        await sendMessageToBot(chatId, answer)
      }
    }
  }

  if (!message) {
    return res.end()
  }

  switch (message.text) {
    case message.text.match(possibleMessages.start) && message.text.match(possibleMessages.start)[0]:
      const startRes = startMessage(message.from.first_name)
      botAnswer = startRes.answer
      break
    case message.text.match(possibleMessages.help) && message.text.match(possibleMessages.help)[0]:
      const helpRes = helpMessage()
      botAnswer = helpRes.answer
      break
    case message.text.match(possibleMessages.listRecent) && message.text.match(possibleMessages.listRecent)[0]:
      const listRecentRes = await listRecentMessage()
      botAnswer = listRecentRes.answer
      break
    case message.text.match(possibleMessages.listFav) && message.text.match(possibleMessages.listFav)[0]:
      const listFavoriteRes = await listFavoriteMessage(message.from.id)
      botAnswer = listFavoriteRes.answer
      break
    case message.text.match(possibleMessages.addToFav) && message.text.match(possibleMessages.addToFav)[0]:
      const addToFavoriteRes = await addToFavoriteMessage(message.chat.id, message.from.id, message.from.first_name, message.text.match(possibleMessages.addToFav)[1])
      if (addToFavoriteRes?.answer.isTrue) botAnswer = addToFavoriteRes.answer.msg
      break
    case message.text.match(possibleMessages.deleteFav) && message.text.match(possibleMessages.deleteFav)[0]:
      const deleteFavoriteRes = await deleteFavoriteMessage(message.text.match(possibleMessages.deleteFav)[1])
      if (deleteFavoriteRes?.answer.isTrue) botAnswer = deleteFavoriteRes.answer.msg
      break
    case message.text.match(possibleMessages.currencyInfo) && message.text.match(possibleMessages.currencyInfo)[0]:
      const currencyInfoRes = await getCurrencyInfoMessage(message.from.id, message.text.split('/')[1])
      if (currencyInfoRes?.answer.isTrue){
        await sendMessageToBot(message.chat.id, currencyInfoRes?.answer?.msg, true, currencyInfoRes?.answer?.opts)
        return res.end()
      }
      break
    default:
      const unknownRes = await unknownMessage(message.text)
      botAnswer = unknownRes!.answer
      break
  }

  await sendMessageToBot(message.chat.id, botAnswer)
  res.sendStatus(200)
}

export const addToFavorites = async (data: Favorites) => {
  try {
    const check = await collections.favorites?.findOne({ currencySymbol: data.currencySymbol })
    if (check) {
      return { message: `${data.currencySymbol} already in favorite list!` }
    }
    const result = await collections.favorites?.insertOne(data)

    if (result) {
      return { message: `Successfully added a new favorite currency: ${data.currencySymbol}` }
    } else {
      new Error('Failed to add a new favorite currency!')
    } 
  } catch (error) {
    console.error(error)
  }
}

export const deleteFavorite = async (currencySymbol: string) => {
  try {
    const result = await collections.favorites?.deleteOne({ currencySymbol })

    if (result && result.deletedCount)
      return { message: `Successfully removed ${currencySymbol} from favorites` }
    if (!result)
      return { message: `Failed to remove ${currencySymbol} from favorites` }  
    if (!result.deletedCount)
      return { message: `Currency with symbol ${currencySymbol} does not exist` }

  } catch (error) {
    console.error(error)
  }
}

export const getAllFavorites = async (userId: number) => {
  try {
    const favorites = (await collections.favorites?.find({ userId }).toArray()) || [] as Favorites[]

    if (favorites)
      return favorites
    else
      new Error('You do not have any crypt in your favorites!')
  } catch (error) {
    console.error(error)
  }
}

export const getOneFavorite = async (userId: number, currencySymbol: string) => {
  try {
    const cs = currencySymbol ? currencySymbol : ''
    const favorites = await collections.favorites?.findOne({ userId, currencySymbol: cs.toLowerCase() })
    
    if (favorites)
      return true
    
      return false
  } catch (error) {
    console.error(error)
  }
}