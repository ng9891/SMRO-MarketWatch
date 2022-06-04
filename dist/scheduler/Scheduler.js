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
const node_schedule_1 = __importDefault(require("node-schedule"));
const fromUnixTime_1 = __importDefault(require("date-fns/fromUnixTime"));
const watchlist_action_1 = require("../db/actions/watchlist.action");
const CacheHistory_1 = __importDefault(require("../db/cachers/CacheHistory"));
const CacheSubs_1 = __importDefault(require("../db/cachers/CacheSubs"));
const Scheduler = (() => {
    const schedulerMap = new Map();
    const rescheduleJob = (wl, cb) => __awaiter(void 0, void 0, void 0, function* () {
        // Updating nextOn
        const updatedWl = yield (0, watchlist_action_1.updateWatchLists)([wl]);
        const newWl = updatedWl[0];
        createJob(newWl, cb);
        console.log(`\n${wl.server} [${wl.itemID}:${wl.itemName}] Reschedule to ${(0, fromUnixTime_1.default)(newWl.nextOn)}`);
    });
    const _onJobSuccess = (wl, cb) => {
        rescheduleJob(wl, cb);
    };
    const createJob = (wl, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const { itemID, itemName, nextOn, server } = wl;
        const nextJobDate = (0, fromUnixTime_1.default)(nextOn);
        cancelJob(itemID, server);
        const newJob = node_schedule_1.default.scheduleJob(nextJobDate, function () {
            return __awaiter(this, void 0, void 0, function* () {
                const date = new Date();
                console.log(`\n${server} [${itemID}:${itemName}] Running... ${date}`);
                return yield cb(wl);
            });
        });
        if (!newJob)
            throw new Error(`***Failed to create Job for: ${server} [${itemID}:${itemName}]***`);
        newJob.on('success', (wl) => {
            if (!wl)
                return;
            _onJobSuccess(wl, cb);
        });
        schedulerMap.set(server + itemID, { wl, job: newJob });
    });
    const cancelJob = (itemID, server, deleteCache = false) => {
        const item = schedulerMap.get(server + itemID);
        if (item) {
            schedulerMap.delete(server + itemID);
            if (deleteCache) {
                CacheHistory_1.default.deleteCache(itemID, server);
                CacheSubs_1.default.deleteCache(itemID, server);
            }
            return item.job.cancel();
        }
        return false;
    };
    return {
        createJob,
        cancelJob,
        rescheduleJob,
        schedulerMap,
    };
})();
exports.default = Scheduler;
