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
exports.checkMarket = exports.notifySubs = void 0;
const discord_1 = require("../discord/discord");
const history_action_1 = require("../db/actions/history.action");
const watchlist_action_1 = require("../db/actions/watchlist.action");
const scraper_1 = require("../scraper/scraper");
const firestore_1 = require("firebase-admin/firestore");
const valid_response_1 = require("../discord/responses/valid.response");
const helpers_1 = require("../helpers/helpers");
const CacheHistory_1 = __importDefault(require("../db/cachers/CacheHistory"));
const CacheSubs_1 = __importDefault(require("../db/cachers/CacheSubs"));
const notifySubs = (subs, vends, isEquip = true) => __awaiter(void 0, void 0, void 0, function* () {
    const channelID = process.env.DISCORD_CHANNEL_ID;
    if (!channelID)
        throw new Error('No channel ID found.');
    subs.forEach((snap) => __awaiter(void 0, void 0, void 0, function* () {
        const sub = snap instanceof firestore_1.QueryDocumentSnapshot ? snap.data() : snap;
        // Get vends below threshold
        const notifArr = [];
        for (const vend of vends) {
            // Vends are sorted. Faster than Array.reduce
            if (vend.price > sub.threshold)
                break;
            if (sub.refinement && !(0, helpers_1.isSameRefinement)(sub.refinement, vend.refinement))
                continue;
            notifArr.push(vend);
        }
        const server = sub.server;
        if (notifArr.length > 0) {
            const msg = (0, valid_response_1.getNotificationMsg)(sub.userID, notifArr, server, isEquip);
            yield (0, discord_1.sendMsgBot)(msg, channelID);
        }
    }));
});
exports.notifySubs = notifySubs;
const checkMarket = function (wl) {
    return __awaiter(this, void 0, void 0, function* () {
        const channelID = process.env.DISCORD_CHANNEL_ID;
        const logMsg = process.env.LOG_RUNNING_MESSAGE && process.env.LOG_RUNNING_MESSAGE === 'true' ? true : false;
        try {
            if (!channelID)
                throw new Error('No channel ID found.');
            const { itemID, itemName, server } = wl;
            if (logMsg)
                yield (0, discord_1.sendMsgBot)(`\`\`\`Running [${itemID}:${itemName}]\`\`\``, channelID);
            const currWl = yield (0, watchlist_action_1.getWatchListInfo)(itemID, server);
            if (!currWl)
                return wl;
            let subs = [];
            if (currWl.lastSubChangeOn) {
                subs = yield CacheSubs_1.default.getSubsCache(itemID, server, currWl.lastSubChangeOn);
            }
            if (subs.length === 0)
                return currWl;
            const scrape = yield (0, scraper_1.scrapeItem)(itemID, itemName, server);
            const vends = scrape === null || scrape === void 0 ? void 0 : scrape.vends;
            if (!vends || vends.length === 0)
                return currWl;
            const stats = yield (0, history_action_1.getHistoryStats)(itemID);
            let historyHashes = [];
            if (stats && stats[server + 'lastUpdated']) {
                const lastUpdated = stats[server + 'lastUpdated'];
                historyHashes = yield CacheHistory_1.default.getHistoryCache(itemID, server, lastUpdated);
            }
            const newVends = (0, helpers_1.vendsNotInHistory)(vends, historyHashes);
            if (newVends.length > 0) {
                const isEquip = (0, helpers_1.isItemAnEquip)(scrape.type, scrape.equipLocation);
                yield (0, exports.notifySubs)(subs, newVends, isEquip);
                yield (0, history_action_1.addToHistory)(newVends, scrape.timestamp, server);
                CacheHistory_1.default.updateHistoryCache(itemID, server, newVends, scrape.timestamp);
            }
            if (logMsg)
                yield (0, discord_1.sendMsgBot)(`\`\`\`Finished [${itemID}:${itemName}]\`\`\``, channelID);
            // Returning Watchlist for the next job.
            return currWl;
        }
        catch (error) {
            const err = error;
            console.log(err.message);
            if (channelID)
                yield (0, discord_1.sendMsgBot)(err.message, channelID);
            return wl;
        }
    });
};
exports.checkMarket = checkMarket;
