"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telegram_1 = require("../controllers/telegram");
const router = (0, express_1.Router)();
router.post(`/bot`, telegram_1.getMessage);
exports.default = router;
