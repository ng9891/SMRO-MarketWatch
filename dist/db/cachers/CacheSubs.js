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
const watchlist_action_1 = require("../actions/watchlist.action");
const helpers_1 = require("../../helpers/helpers");
const CacheSubs = (() => {
    const subsCache = new Map();
    const setSubsCache = (itemID, server, lists, lastSubChangeOn) => {
        const date = (0, fromUnixTime_1.default)(lastSubChangeOn);
        const newCache = { itemID, server, lastSubChangeOn: date, data: lists };
        subsCache.set(server + itemID, newCache);
    };
    const getSubsCache = (itemID, server, lastSubChangeOn) => __awaiter(void 0, void 0, void 0, function* () {
        const cache = subsCache.get(server + itemID);
        if (!cache) {
            const docs = yield (0, watchlist_action_1.getSubs)(itemID, server);
            const newCache = docs ? docs : [];
            setSubsCache(itemID, server, newCache, lastSubChangeOn);
            return newCache;
        }
        if (!(0, helpers_1.isCacheOld)(lastSubChangeOn, cache.lastSubChangeOn, 5))
            return cache.data;
        const newSubList = yield (0, watchlist_action_1.getSubs)(itemID, server);
        if (!newSubList)
            return cache.data;
        setSubsCache(itemID, server, newSubList, lastSubChangeOn);
        return cache.data;
    });
    const deleteCache = (itemID, server) => {
        subsCache.delete(server + itemID);
    };
    return {
        setSubsCache,
        getSubsCache,
        deleteCache,
    };
})();
exports.default = CacheSubs;
