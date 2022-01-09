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
exports.getOneFavorite = exports.getAllFavorites = exports.deleteFavorite = exports.addToFavorites = exports.getMessage = void 0;
const db_1 = require("../services/db");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const telegram_1 = require("../api/telegram");
dotenv_1.default.config();
const { TG_URI, TOKEN } = process.env;
const endpoint = `${TG_URI}${TOKEN}`;
const possibleMessages = {
    start: /^\/start$/,
    help: /^\/help$/,
    listRecent: /^\/listRecent$/,
    addToFav: /^\/addToFavorite (.+)/,
    deleteFav: /^\/deleteFavorite (.+)/,
    listFav: /^\/listFavorite$/,
    currencyInfo: /^\/(.+)$/
};
const sendMessageToBot = (chatId, msg, isButton = false, opts = {}) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (isButton) {
            return yield axios_1.default.post(`${endpoint}/sendMessage`, {
                chat_id: chatId,
                text: msg,
                reply_markup: opts.reply_markup
            });
        }
        return yield axios_1.default.post(`${endpoint}/sendMessage`, {
            chat_id: chatId,
            text: msg,
        });
    }
    catch (error) {
        console.log(error);
    }
});
const answerCallbackQuery = (callbackId, msg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield axios_1.default.post(`${endpoint}/answerCallbackQuery`, {
            callback_query_id: callbackId,
            text: msg,
        });
    }
    catch (error) {
        console.log(error);
    }
});
const deleteMessageFromBot = (chatId, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield axios_1.default.post(`${endpoint}/deleteMessage`, {
            chat_id: chatId,
            message_id: messageId,
        });
    }
    catch (error) {
        console.log(error);
    }
});
const getMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    const { message } = req.body;
    // let botAnswer: string = 'I don\'t understand you!'
    let botAnswer = 'xz!';
    if ((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.callback_query) === null || _b === void 0 ? void 0 : _b.id) {
        const { answer } = yield (0, telegram_1.handleCallbackQuery)((_d = (_c = req.body) === null || _c === void 0 ? void 0 : _c.callback_query) === null || _d === void 0 ? void 0 : _d.data, (_f = (_e = req.body) === null || _e === void 0 ? void 0 : _e.callback_query) === null || _f === void 0 ? void 0 : _f.message);
        const callbackResponse = yield answerCallbackQuery((_h = (_g = req.body) === null || _g === void 0 ? void 0 : _g.callback_query) === null || _h === void 0 ? void 0 : _h.id, answer);
        if ((_j = callbackResponse === null || callbackResponse === void 0 ? void 0 : callbackResponse.data) === null || _j === void 0 ? void 0 : _j.ok) {
            const messageId = req.body.callback_query.message.message_id;
            const chatId = req.body.callback_query.message.chat.id;
            const deleteMessageResponse = yield deleteMessageFromBot(chatId, messageId);
            if ((_k = deleteMessageResponse === null || deleteMessageResponse === void 0 ? void 0 : deleteMessageResponse.data) === null || _k === void 0 ? void 0 : _k.ok) {
                yield sendMessageToBot(chatId, answer);
            }
        }
    }
    if (!message) {
        return res.end();
    }
    switch (message.text) {
        case message.text.match(possibleMessages.start) && message.text.match(possibleMessages.start)[0]:
            const startRes = (0, telegram_1.startMessage)(message.from.first_name);
            botAnswer = startRes.answer;
            break;
        case message.text.match(possibleMessages.help) && message.text.match(possibleMessages.help)[0]:
            const helpRes = (0, telegram_1.helpMessage)();
            botAnswer = helpRes.answer;
            break;
        case message.text.match(possibleMessages.listRecent) && message.text.match(possibleMessages.listRecent)[0]:
            const listRecentRes = yield (0, telegram_1.listRecentMessage)();
            botAnswer = listRecentRes.answer;
            break;
        case message.text.match(possibleMessages.listFav) && message.text.match(possibleMessages.listFav)[0]:
            const listFavoriteRes = yield (0, telegram_1.listFavoriteMessage)(message.from.id);
            botAnswer = listFavoriteRes.answer;
            break;
        case message.text.match(possibleMessages.addToFav) && message.text.match(possibleMessages.addToFav)[0]:
            const addToFavoriteRes = yield (0, telegram_1.addToFavoriteMessage)(message.chat.id, message.from.id, message.from.first_name, message.text.match(possibleMessages.addToFav)[1]);
            if (addToFavoriteRes === null || addToFavoriteRes === void 0 ? void 0 : addToFavoriteRes.answer.isTrue)
                botAnswer = addToFavoriteRes.answer.msg;
            break;
        case message.text.match(possibleMessages.deleteFav) && message.text.match(possibleMessages.deleteFav)[0]:
            const deleteFavoriteRes = yield (0, telegram_1.deleteFavoriteMessage)(message.text.match(possibleMessages.deleteFav)[1]);
            if (deleteFavoriteRes === null || deleteFavoriteRes === void 0 ? void 0 : deleteFavoriteRes.answer.isTrue)
                botAnswer = deleteFavoriteRes.answer.msg;
            break;
        case message.text.match(possibleMessages.currencyInfo) && message.text.match(possibleMessages.currencyInfo)[0]:
            const currencyInfoRes = yield (0, telegram_1.getCurrencyInfoMessage)(message.from.id, message.text.split('/')[1]);
            if (currencyInfoRes === null || currencyInfoRes === void 0 ? void 0 : currencyInfoRes.answer.isTrue) {
                yield sendMessageToBot(message.chat.id, (_l = currencyInfoRes === null || currencyInfoRes === void 0 ? void 0 : currencyInfoRes.answer) === null || _l === void 0 ? void 0 : _l.msg, true, (_m = currencyInfoRes === null || currencyInfoRes === void 0 ? void 0 : currencyInfoRes.answer) === null || _m === void 0 ? void 0 : _m.opts);
                return res.end();
            }
            break;
        default:
            const unknownRes = yield (0, telegram_1.unknownMessage)(message.text);
            botAnswer = unknownRes.answer;
            break;
    }
    yield sendMessageToBot(message.chat.id, botAnswer);
    res.sendStatus(200);
});
exports.getMessage = getMessage;
const addToFavorites = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _o, _p;
    try {
        const check = yield ((_o = db_1.collections.favorites) === null || _o === void 0 ? void 0 : _o.findOne({ currencySymbol: data.currencySymbol }));
        if (check) {
            return { message: `${data.currencySymbol} already in favorite list!` };
        }
        const result = yield ((_p = db_1.collections.favorites) === null || _p === void 0 ? void 0 : _p.insertOne(data));
        if (result) {
            return { message: `Successfully added a new favorite currency: ${data.currencySymbol}` };
        }
        else {
            new Error('Failed to add a new favorite currency!');
        }
    }
    catch (error) {
        console.error(error);
    }
});
exports.addToFavorites = addToFavorites;
const deleteFavorite = (currencySymbol) => __awaiter(void 0, void 0, void 0, function* () {
    var _q;
    try {
        const result = yield ((_q = db_1.collections.favorites) === null || _q === void 0 ? void 0 : _q.deleteOne({ currencySymbol }));
        if (result && result.deletedCount)
            return { message: `Successfully removed ${currencySymbol} from favorites` };
        if (!result)
            return { message: `Failed to remove ${currencySymbol} from favorites` };
        if (!result.deletedCount)
            return { message: `Currency with symbol ${currencySymbol} does not exist` };
    }
    catch (error) {
        console.error(error);
    }
});
exports.deleteFavorite = deleteFavorite;
const getAllFavorites = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _r;
    try {
        const favorites = (yield ((_r = db_1.collections.favorites) === null || _r === void 0 ? void 0 : _r.find({ userId }).toArray())) || [];
        if (favorites)
            return favorites;
        else
            new Error('You do not have any crypt in your favorites!');
    }
    catch (error) {
        console.error(error);
    }
});
exports.getAllFavorites = getAllFavorites;
const getOneFavorite = (userId, currencySymbol) => __awaiter(void 0, void 0, void 0, function* () {
    var _s;
    try {
        const cs = currencySymbol ? currencySymbol : '';
        const favorites = yield ((_s = db_1.collections.favorites) === null || _s === void 0 ? void 0 : _s.findOne({ userId, currencySymbol: cs.toLowerCase() }));
        if (favorites)
            return true;
        return false;
    }
    catch (error) {
        console.error(error);
    }
});
exports.getOneFavorite = getOneFavorite;
