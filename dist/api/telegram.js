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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const dotenv_1 = __importDefault(require("dotenv"));
const currency_1 = require("./currency");
const telegram_1 = require("../controllers/telegram");
dotenv_1.default.config();
const { TOKEN, SERVER_URL } = process.env;
const bot = new node_telegram_bot_api_1.default(`${TOKEN}`);
const myCommands = [
    { command: '/start', description: 'Bot greeting' },
    { command: '/help', description: 'Brief information about the bot and its list of commands' },
    { command: '/listRecent', description: 'A small list of hype crypts in the next form: /{currency_symbol} $pricePerUnit' },
    { command: '/{currency_symbol}', description: 'Get detailed information about cryptocurrency' },
    { command: '/addToFavorite', description: 'Adds the crypt to the "favorites" section' },
    { command: '/listFavorite', description: 'Returns a list of selected crypts' },
    { command: '/deleteFavorite', description: 'Removes crypt from "favorites" section' }
];
bot.setWebHook(`${SERVER_URL}/bot${TOKEN}`);
bot.setMyCommands([
    { command: '/start', description: 'Bot greeting' },
    { command: '/help', description: 'Brief information about the bot and its list of commands' }
]);
bot.onText(/(.+)/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id;
    const resp = match[1];
    const newArr = [...myCommands.map(element => element.command)];
    const { data } = yield (0, currency_1.getCurrencies)();
    data.forEach((element) => {
        newArr.push('/' + element.symbol.toLowerCase());
    });
    const index = newArr.indexOf(resp);
    if (index === -1) {
        bot.sendMessage(chatId, 'I don\'t understand you!');
    }
}));
bot.onText(/\/help/, (msg, match) => {
    const chatId = msg.chat.id;
    const briefInfo = "I am a bot that allows you to easily follow the hype crypt :)";
    let commandsList = '';
    myCommands.forEach(element => {
        commandsList += `${element.command} - ${element.description}\n\n`;
    });
    bot.sendMessage(chatId, `${briefInfo}\n\n${commandsList}`);
});
bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;
    const welcome = `${msg.chat.first_name}, welcome to Lambda_Task6 chat bot :)`;
    bot.sendMessage(chatId, welcome);
});
bot.onText(/\/listRecent/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id;
    const { data } = yield (0, currency_1.getCurrencies)();
    const list = formList(data);
    bot.sendMessage(chatId, list);
}));
bot.onText(/\/(.+)/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const chatId = msg.chat.id;
    const userId = (_a = msg.from) === null || _a === void 0 ? void 0 : _a.id;
    const { data } = yield (0, currency_1.getCurrencies)();
    const resp = match[1];
    const isMatch = data.filter((el) => el.symbol.toLowerCase() === resp);
    if (isMatch.length > 0) {
        const alreadyAdded = yield (0, telegram_1.getOneFavorite)(userId, isMatch[0].symbol);
        let opts;
        if (alreadyAdded) {
            opts = configureOptions(true);
        }
        else {
            opts = configureOptions(false);
        }
        const res = getDetailedInfo(isMatch);
        bot.sendMessage(chatId, res, opts);
    }
}));
bot.onText(/\/addToFavorite (.+)/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { data } = yield (0, currency_1.getCurrencies)();
    const chatId = msg.chat.id;
    const userId = (_b = msg.from) === null || _b === void 0 ? void 0 : _b.id;
    const firstName = (_c = msg.from) === null || _c === void 0 ? void 0 : _c.first_name;
    let currencySymbol, price;
    const resp = match[1];
    const certainCurrency = data.filter((el) => el.symbol.toLowerCase() === resp);
    if (certainCurrency[0]) {
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
        bot.sendMessage(chatId, result === null || result === void 0 ? void 0 : result.message);
    }
}));
bot.onText(/\/deleteFavorite (.+)/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    const chatId = msg.chat.id;
    const { data } = yield (0, currency_1.getCurrencies)();
    const currencySymbol = match[1];
    const certainCurrency = data.filter((el) => el.symbol.toLowerCase() === currencySymbol);
    if (certainCurrency[0]) {
        const result = yield (0, telegram_1.deleteFavorite)(currencySymbol);
        bot.sendMessage(chatId, result === null || result === void 0 ? void 0 : result.message);
    }
}));
bot.onText(/\/listFavorite/, (msg, match) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const chatId = msg.chat.id;
    const userId = (_d = msg.from) === null || _d === void 0 ? void 0 : _d.id;
    const data = (yield (0, telegram_1.getAllFavorites)(userId));
    const list = formListFromDb(data);
    bot.sendMessage(chatId, list);
}));
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
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
        const action = callbackQuery.data;
        const msg = callbackQuery.message;
        const opts = {
            chat_id: msg.chat.id,
            message_id: msg.message_id
        };
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
        bot.editMessageText(text, opts);
    });
});
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
exports.default = bot;
