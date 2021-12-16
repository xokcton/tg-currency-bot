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
const telegram_1 = __importDefault(require("../api/telegram"));
const getMessage = (req, res) => {
    const { body } = req;
    telegram_1.default.processUpdate(body);
    res.sendStatus(200);
};
exports.getMessage = getMessage;
const addToFavorites = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const check = yield ((_a = db_1.collections.favorites) === null || _a === void 0 ? void 0 : _a.findOne({ currencySymbol: data.currencySymbol }));
        if (check) {
            return { message: `${data.currencySymbol} already in favorite list!` };
        }
        const result = yield ((_b = db_1.collections.favorites) === null || _b === void 0 ? void 0 : _b.insertOne(data));
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
    var _c;
    try {
        const result = yield ((_c = db_1.collections.favorites) === null || _c === void 0 ? void 0 : _c.deleteOne({ currencySymbol }));
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
    var _d;
    try {
        const favorites = (yield ((_d = db_1.collections.favorites) === null || _d === void 0 ? void 0 : _d.find({ userId }).toArray())) || [];
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
    var _e;
    try {
        const cs = currencySymbol ? currencySymbol : '';
        const favorites = yield ((_e = db_1.collections.favorites) === null || _e === void 0 ? void 0 : _e.findOne({ userId, currencySymbol: cs.toLowerCase() }));
        if (favorites)
            return true;
        return false;
    }
    catch (error) {
        console.error(error);
    }
});
exports.getOneFavorite = getOneFavorite;
