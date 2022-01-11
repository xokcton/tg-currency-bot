"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Telegram = void 0;
const currency_1 = require("./currency");
const telegram_1 = require("../controllers/telegram");
class Telegram {
    constructor() {
        this.myCommands = [
            { command: '/start', description: 'Bot greeting' },
            { command: '/help', description: 'Brief information about the bot and its list of commands' },
            { command: '/listRecent', description: 'A small list of hype crypts in the next form: /{currency_symbol} $pricePerUnit' },
            { command: '/{currency_symbol}', description: 'Get detailed information about cryptocurrency' },
            { command: '/addToFavorite', description: 'Adds the crypt to the "favorites" section' },
            { command: '/listFavorite', description: 'Returns a list of selected crypts' },
            { command: '/deleteFavorite', description: 'Removes crypt from "favorites" section' }
        ];
        this.unknownMessage = (resp) => __awaiter(this, void 0, void 0, function* () {
            const newArr = [...this.myCommands.map(element => element.command)];
            const { data } = yield currency_1.currency.getCurrencies();
            data.forEach((element) => {
                newArr.push('/' + element.symbol.toLowerCase());
            });
            const index = newArr.indexOf(resp);
            if (index === -1) {
                const answer = 'I don\'t understand you!';
                return {
                    answer
                };
            }
        });
        this.helpMessage = () => {
            const briefInfo = "I am a bot that allows you to easily follow the hype crypt :)";
            let commandsList = '';
            this.myCommands.forEach(element => {
                commandsList += `${element.command} - ${element.description}\n\n`;
            });
            const answer = `${briefInfo}\n\n${commandsList}`;
            return {
                answer
            };
        };
        this.startMessage = (firstName) => {
            return {
                answer: `${firstName}, welcome to Lambda_Task6 chat bot :)`
            };
        };
        this.listRecentMessage = () => __awaiter(this, void 0, void 0, function* () {
            const { data } = yield currency_1.currency.getCurrencies();
            const list = this.formList(data);
            return {
                answer: list
            };
        });
        this.getCurrencyInfoMessage = (userId, resp) => __awaiter(this, void 0, void 0, function* () {
            const { data } = yield currency_1.currency.getCurrencies();
            const isMatch = data.filter((el) => el.symbol.toLowerCase() === resp);
            let isTrue = false;
            if (isMatch.length > 0) {
                const alreadyAdded = yield (0, telegram_1.getOneFavorite)(userId, isMatch[0].symbol);
                let opts;
                if (alreadyAdded) {
                    opts = this.configureOptions(true);
                }
                else {
                    opts = this.configureOptions(false);
                }
                const msg = this.getDetailedInfo(isMatch);
                isTrue = true;
                return {
                    answer: {
                        msg,
                        opts,
                        isTrue
                    }
                };
            }
            return {
                answer: {
                    msg: '',
                    opts: {},
                    isTrue
                }
            };
        });
        this.addToFavoriteMessage = (chatId, userId, firstName, resp) => __awaiter(this, void 0, void 0, function* () {
            const { data } = yield currency_1.currency.getCurrencies();
            let currencySymbol, price;
            let isTrue = false;
            const certainCurrency = data.filter((el) => el.symbol.toLowerCase() === resp);
            if (certainCurrency[0]) {
                isTrue = true;
                currencySymbol = certainCurrency[0].symbol.toLowerCase();
                price = certainCurrency[0].quote.USD.price.toFixed(2);
                const dbUnit = {
                    chatId,
                    userId,
                    firstName,
                    currencySymbol,
                    price
                };
                const result = yield (0, telegram_1.addToFavorites)(dbUnit);
                let message = '';
                if (result)
                    message = result.message;
                return {
                    answer: {
                        msg: message,
                        isTrue
                    }
                };
            }
            return {
                answer: {
                    msg: '',
                    isTrue
                }
            };
        });
        this.deleteFavoriteMessage = (currencySymbol) => __awaiter(this, void 0, void 0, function* () {
            const { data } = yield currency_1.currency.getCurrencies();
            let isTrue = false;
            const certainCurrency = data.filter((el) => el.symbol.toLowerCase() === currencySymbol);
            if (certainCurrency[0]) {
                isTrue = true;
                const result = yield (0, telegram_1.deleteFavorite)(currencySymbol);
                let message = '';
                if (result)
                    message = result.message;
                return {
                    answer: {
                        msg: message,
                        isTrue
                    }
                };
            }
            return {
                answer: {
                    msg: '',
                    isTrue
                }
            };
        });
        this.listFavoriteMessage = (userId) => __awaiter(this, void 0, void 0, function* () {
            const data = (yield (0, telegram_1.getAllFavorites)(userId));
            const list = this.formListFromDb(data);
            return {
                answer: list
            };
        });
        this.handleCallbackQuery = (action, msg) => __awaiter(this, void 0, void 0, function* () {
            let text = '';
            const extraText = msg.text.split(' ');
            const chatId = msg.from.id;
            const userId = msg.chat.id;
            const firstName = msg.chat.first_name;
            const firstIndex = msg.text.indexOf('Symbol') + 8;
            const secondIndex = msg.text.indexOf('\n');
            const currencySymbol = (msg.text.substring(firstIndex, secondIndex)).trim().toLowerCase();
            const price = +(extraText[extraText.length - 1]);
            if (action === 'add') {
                yield (0, telegram_1.addToFavorites)({ chatId, userId, firstName, currencySymbol, price });
                text = `${currencySymbol} was added successfully`;
            }
            else {
                yield (0, telegram_1.deleteFavorite)(currencySymbol);
                text = `${currencySymbol} was removed successfully`;
            }
            return {
                answer: text
            };
        });
        this.formList = (array) => {
            const firstTwenty = array.slice().splice(0, 20);
            let resultList = '';
            firstTwenty.forEach(element => {
                resultList += `/${element.symbol.toLowerCase()} $${element.quote.USD.price.toFixed(2)}\n`;
            });
            return resultList;
        };
        this.formListFromDb = (array) => {
            const firstTwenty = array.slice().splice(0, 20);
            let resultList = '';
            firstTwenty.forEach(element => {
                resultList += `/${element.currencySymbol.toLowerCase()} $${element.price}\n`;
            });
            return resultList;
        };
        this.getDetailedInfo = (array) => {
            const currency = array[0];
            const result = `Name: ${currency.name} | Symbol: ${currency.symbol} \n CMC rank: ${currency.cmc_rank} | Cost: $ ${currency.quote.USD.price.toFixed(2)}`;
            return result;
        };
        this.configureOptions = (alreadyAdded) => {
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
                };
        };
    }
}
exports.Telegram = Telegram;
