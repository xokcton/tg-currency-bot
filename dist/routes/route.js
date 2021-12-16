"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telegram_1 = require("../controllers/telegram");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { TOKEN } = process.env;
const router = (0, express_1.Router)();
router.post(`/bot${TOKEN}`, telegram_1.getMessage);
exports.default = router;
