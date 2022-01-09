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
exports.handleCallbackQuery = exports.listFavoriteMessage = exports.deleteFavoriteMessage = exports.addToFavoriteMessage = exports.getCurrencyInfoMessage = exports.listRecentMessage = exports.startMessage = exports.helpMessage = exports.unknownMessage = void 0;
const currency_1 = require("./currency");
const telegram_1 = require("../controllers/telegram");
const myCommands = [
    { command: '/start', description: 'Bot greeting' },
    { command: '/help', description: 'Brief information about the bot and its list of commands' },
    { command: '/listRecent', description: 'A small list of hype crypts in the next form: /{currency_symbol} $pricePerUnit' },
    { command: '/{currency_symbol}', description: 'Get detailed information about cryptocurrency' },
    { command: '/addToFavorite', description: 'Adds the crypt to the "favorites" section' },
    { command: '/listFavorite', description: 'Returns a list of selected crypts' },
    { command: '/deleteFavorite', description: 'Removes crypt from "favorites" section' }
];
const unknownMessage = (resp) => __awaiter(void 0, void 0, void 0, function* () {
    const newArr = [...myCommands.map(element => element.command)];
    const { data } = yield (0, currency_1.getCurrencies)();
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
exports.unknownMessage = unknownMessage;
const helpMessage = () => {
    const briefInfo = "I am a bot that allows you to easily follow the hype crypt :)";
    let commandsList = '';
    myCommands.forEach(element => {
        commandsList += `${element.command} - ${element.description}\n\n`;
    });
    const answer = `${briefInfo}\n\n${commandsList}`;
    return {
        answer
    };
};
exports.helpMessage = helpMessage;
const startMessage = (firstName) => {
    return {
        answer: `${firstName}, welcome to Lambda_Task6 chat bot :)`
    };
};
exports.startMessage = startMessage;
const listRecentMessage = () => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield (0, currency_1.getCurrencies)();
    const list = formList(data);
    return {
        answer: list
    };
});
exports.listRecentMessage = listRecentMessage;
const getCurrencyInfoMessage = (userId, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield (0, currency_1.getCurrencies)();
    const isMatch = data.filter((el) => el.symbol.toLowerCase() === resp);
    let isTrue = false;
    if (isMatch.length > 0) {
        const alreadyAdded = yield (0, telegram_1.getOneFavorite)(userId, isMatch[0].symbol);
        let opts;
        if (alreadyAdded) {
            opts = configureOptions(true);
        }
        else {
            opts = configureOptions(false);
        }
        const msg = getDetailedInfo(isMatch);
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
exports.getCurrencyInfoMessage = getCurrencyInfoMessage;
const addToFavoriteMessage = (chatId, userId, firstName, resp) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield (0, currency_1.getCurrencies)();
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
        return {
            answer: {
                msg: result === null || result === void 0 ? void 0 : result.message,
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
exports.addToFavoriteMessage = addToFavoriteMessage;
const deleteFavoriteMessage = (currencySymbol) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield (0, currency_1.getCurrencies)();
    let isTrue = false;
    const certainCurrency = data.filter((el) => el.symbol.toLowerCase() === currencySymbol);
    if (certainCurrency[0]) {
        isTrue = true;
        const result = yield (0, telegram_1.deleteFavorite)(currencySymbol);
        return {
            answer: {
                msg: result === null || result === void 0 ? void 0 : result.message,
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
exports.deleteFavoriteMessage = deleteFavoriteMessage;
const listFavoriteMessage = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const data = (yield (0, telegram_1.getAllFavorites)(userId));
    const list = formListFromDb(data);
    return {
        answer: list
    };
});
exports.listFavoriteMessage = listFavoriteMessage;
const formList = (array) => {
    const firstTwenty = array.slice().splice(0, 20);
    let resultList = '';
    firstTwenty.forEach(element => {
        resultList += `/${element.symbol.toLowerCase()} $${element.quote.USD.price.toFixed(2)}\n`;
    });
    return resultList;
};
const formListFromDb = (array) => {
    const firstTwenty = array.slice().splice(0, 20);
    let resultList = '';
    firstTwenty.forEach(element => {
        resultList += `/${element.currencySymbol.toLowerCase()} $${element.price}\n`;
    });
    return resultList;
};
const handleCallbackQuery = (action, msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    let text = '';
    const extraText = (_a = msg.text) === null || _a === void 0 ? void 0 : _a.split(' ');
    const chatId = (_b = msg.from) === null || _b === void 0 ? void 0 : _b.id;
    const userId = (_c = msg.chat) === null || _c === void 0 ? void 0 : _c.id;
    const firstName = (_d = msg.chat) === null || _d === void 0 ? void 0 : _d.first_name;
    const firstIndex = ((_e = msg.text) === null || _e === void 0 ? void 0 : _e.indexOf('Symbol')) + 8;
    const secondIndex = (_f = msg.text) === null || _f === void 0 ? void 0 : _f.indexOf('\n');
    const currencySymbol = (_h = ((_g = msg.text) === null || _g === void 0 ? void 0 : _g.substring(firstIndex, secondIndex))) === null || _h === void 0 ? void 0 : _h.trim().toLowerCase();
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
exports.handleCallbackQuery = handleCallbackQuery;
const getDetailedInfo = (array) => {
    const currency = array[0];
    const result = `Name: ${currency.name} | Symbol: ${currency.symbol} \n CMC rank: ${currency.cmc_rank} | Cost: $ ${currency.quote.USD.price.toFixed(2)}`;
    return result;
};
const configureOptions = (alreadyAdded) => {
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
