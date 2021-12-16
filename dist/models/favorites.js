"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Favorites {
    constructor(chatId, userId, firstName, currencySymbol, price, id) {
        this.chatId = chatId;
        this.userId = userId;
        this.firstName = firstName;
        this.currencySymbol = currencySymbol;
        this.price = price;
        this.id = id;
    }
}
exports.default = Favorites;
