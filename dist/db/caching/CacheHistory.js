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
const fromUnixTime_1 = __importDefault(require("date-fns/fromUnixTime"));
const subDays_1 = __importDefault(require("date-fns/subDays"));
const history_action_1 = require("../actions/history.action");
const date_fns_1 = require("date-fns");
const helpers_1 = require("../../helpers/helpers");
const historyDays = Number(process.env.HISTORY_FROM_DAYS);
const CacheHistory = (() => {
    const DAYS_KEEP_HISTORY = isNaN(historyDays) || historyDays === 0 ? 30 : historyDays;
    const historyCache = new Map();
    const setHistoryCache = (itemID, server, vends, lastUpdated) => {
        const date = (0, fromUnixTime_1.default)(lastUpdated);
        const newCache = { itemID, server, lastUpdated: date, data: vends };
        historyCache.set(server + itemID, newCache);
    };
    const updateHistoryCache = (itemID, server, vends, lastUpdated) => {
        const cache = historyCache.get(server + itemID);
        if (!cache)
            return false;
        const date = (0, fromUnixTime_1.default)(lastUpdated);
        const fromDate = (0, subDays_1.default)(date, DAYS_KEEP_HISTORY);
        const filteredCache = cache.data.filter((data) => (0, fromUnixTime_1.default)(data.timestamp) > fromDate);
        cache.data = [...vends, ...filteredCache];
        cache.lastUpdated = date;
        return true;
    };
    const getHistoryCache = (itemID, server, lastUpdated) => __awaiter(void 0, void 0, void 0, function* () {
        const cache = historyCache.get(server + itemID);
        if (!cache) {
            const fromDate = (0, date_fns_1.getUnixTime)((0, subDays_1.default)(new Date(), DAYS_KEEP_HISTORY));
            const docs = yield (0, history_action_1.getHistory)(itemID, fromDate, server);
            const newCache = docs ? docs : [];
            setHistoryCache(itemID, server, newCache, lastUpdated);
            return newCache;
        }
        if (!(0, helpers_1.isCacheOld)(lastUpdated, cache.lastUpdated, 59)) {
            console.log('History is gotten from cache');
            return cache.data;
        }
        const newInHistory = yield (0, history_action_1.getHistory)(itemID, lastUpdated, server);
        if (!newInHistory)
            return cache.data;
        updateHistoryCache(itemID, server, newInHistory, lastUpdated);
        console.log('History is gotten from DB cause cache is old');
        return cache.data;
    });
    const deleteCache = (itemID, server) => {
        historyCache.delete(server + itemID);
    };
    return {
        setHistoryCache,
        updateHistoryCache,
        getHistoryCache,
        deleteCache,
    };
})();
exports.default = CacheHistory;
