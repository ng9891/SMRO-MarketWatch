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
const dotenv_1 = __importDefault(require("dotenv"));
const discord_1 = require("./discord/discord");
const watchlist_action_1 = require("./db/actions/watchlist.action");
const Scheduler_1 = __importDefault(require("./scheduler/Scheduler"));
const checkMarket_1 = require("./scheduler/checkMarket");
dotenv_1.default.config({ path: './conf/.env' });
(() => __awaiter(void 0, void 0, void 0, function* () {
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const guildId = process.env.DISCORD_GUILD_ID;
    const maxThreshold = process.env.MAX_THRESHOLD;
    const thumbURL = process.env.THUMBNAIL_URL;
    const maxListSize = process.env.MAX_LIST_SIZE;
    const recurr = process.env.DEFAULT_RECURRANCE_MINUTES;
    const channelID = process.env.DISCORD_CHANNEL_ID;
    const permission = process.env.DISCORD_PERMISSION;
    const urlHel = process.env.URL_HEL;
    const urlNif = process.env.URL_NIF;
    const urlHelItem = process.env.URL_HEL_ITEM;
    const urlNifItem = process.env.URL_HEL_ITEM;
    if (!token)
        return console.error('No DISCORD_TOKEN found');
    if (!clientId)
        return console.error('No DISCORD_CLIENT_ID found');
    if (!guildId)
        return console.error('No DISCORD_GUILD_ID found');
    if (!channelID)
        return console.error('No DISCORD_CHANNEL_ID found.');
    if (!permission)
        return console.error('No DISCORD_PERMISSION found.');
    if (!maxThreshold)
        return console.error('No MAX_THRESHOLD found');
    if (!urlHel)
        return console.error('No URL_HEL found');
    if (!urlNif)
        return console.error('No URL_NIF found');
    if (!urlHelItem)
        return console.error('No URL_HEL_ITEM found');
    if (!urlNifItem)
        return console.error('No URL_HEL_ITEM found');
    if (!thumbURL)
        return console.error('No THUMBNAIL_URL found');
    if (!maxListSize)
        return console.error('No MAX_LIST_SIZE found');
    if (!recurr)
        return console.error('No DEFAULT_RECURRANCE_MINUTES found');
    yield (0, discord_1.deployDiscordBot)(token);
    // Rerunning all jobs.
    const watchlists = yield (0, watchlist_action_1.getActiveWatchLists)();
    if (watchlists.empty)
        return;
    const batch = watchlists.docs.map((snap) => snap.data());
    const updatedBatch = yield (0, watchlist_action_1.updateWatchLists)(batch);
    updatedBatch.forEach((wl) => {
        Scheduler_1.default.createJob(wl, checkMarket_1.checkMarket);
    });
}))();
