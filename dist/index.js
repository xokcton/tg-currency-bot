"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = require("body-parser");
const error_1 = require("./middlewares/error");
const route_1 = __importDefault(require("./routes/route"));
const db_1 = require("./services/db");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, body_parser_1.json)());
app.use(error_1.errorHandler);
app.use(route_1.default);
(0, db_1.connectToDatabase)().catch((error) => {
    console.error("Database connection failed ", error);
    process.exit();
});
app.listen(PORT);
