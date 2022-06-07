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
exports.onReady = void 0;
const v9_1 = require("discord-api-types/v9");
const rest_1 = require("@discordjs/rest");
const _CommandList_1 = __importDefault(require("../commands/_CommandList"));
// Deploy Commands
const onReady = (BOT) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const rest = new rest_1.REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
    const commandData = _CommandList_1.default.map((command) => command.data.toJSON());
    yield rest.put(v9_1.Routes.applicationGuildCommands(((_a = BOT.user) === null || _a === void 0 ? void 0 : _a.id) || 'missing id', process.env.DISCORD_GUILD_ID), { body: commandData });
    console.log('SMRO-MarketWatch Bot is ready!');
});
exports.onReady = onReady;
