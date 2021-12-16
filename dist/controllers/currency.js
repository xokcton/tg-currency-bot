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
exports.getCurrencies = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const CMC_KEY = process.env.CMC_KEY || '';
const CMC_URL = process.env.CMC_URL || '';
const getCurrencies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const config = {
        headers: {
            'X-CMC_PRO_API_KEY': CMC_KEY
        }
    };
    const { data } = yield axios_1.default.get(CMC_URL, config);
    console.log(data);
});
exports.getCurrencies = getCurrencies;
