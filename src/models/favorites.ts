import { ObjectId } from "mongodb"

export default class Favorites {
  constructor(public chatId: number, public userId: number, public firstName: string, public currencySymbol: string, public price: number, public id?: ObjectId) {}
}