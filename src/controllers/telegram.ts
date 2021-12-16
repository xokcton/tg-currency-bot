import { RequestHandler } from "express"
import { collections } from "../services/db";
import Favorites from "../models/favorites";
import bot from '../api/telegram'

export const getMessage: RequestHandler = (req, res) => {
  const { body } = req
  bot.processUpdate(body)
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