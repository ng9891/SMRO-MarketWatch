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
exports.sendMsgBot = exports.deployDiscordBot = exports.BOT = void 0;
const discord_js_1 = require("discord.js");
const IntentOptions_1 = __importDefault(require("./IntentOptions"));
const onInteraction_1 = require("./events/onInteraction");
const onReady_1 = require("./events/onReady");
exports.BOT = new discord_js_1.Client({ intents: IntentOptions_1.default });
const deployDiscordBot = (token) => __awaiter(void 0, void 0, void 0, function* () {
    exports.BOT.on('ready', () => __awaiter(void 0, void 0, void 0, function* () { return yield (0, onReady_1.onReady)(exports.BOT); }));
    exports.BOT.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, onInteraction_1.onInteraction)(interaction); }));
    yield exports.BOT.login(token);
});
exports.deployDiscordBot = deployDiscordBot;
const sendMsgBot = (msg, channelID) => __awaiter(void 0, void 0, void 0, function* () {
    const channel = exports.BOT.channels.cache.get(channelID);
    if (!channel)
        throw new Error('Failed to get channel,');
    if (channel.type !== 'GUILD_TEXT')
        throw new Error('Provided ChannelID is not a text channel,');
    const textChannel = channel;
    if (!msg)
        throw new Error('sendMsgBot was send empty message.');
    if (typeof msg === 'string')
        return yield textChannel.send(msg);
    else {
        const sent = yield textChannel.send(msg);
        setTimeout(() => {
            sent.edit({ components: [] });
        }, 2 * 60 * 1000);
    }
});
exports.sendMsgBot = sendMsgBot;
