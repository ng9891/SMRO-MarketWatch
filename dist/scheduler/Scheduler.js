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
const Scheduler = (() => {
    const schedulerMap = new Map();
    const rescheduleJob = (wl, cb) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('\n*********************************');
        console.log(`${wl.server} [${wl.itemID}:${wl.itemName}] Rescheduling...`);
        // Updating nextOn
        const updatedWl = yield (0, watchlist_action_1.updateWatchLists)([wl]);
        const newWl = updatedWl[0];
        createJob(newWl, cb);
    });
    const _onJobSuccess = (wl, cb) => {
        rescheduleJob(wl, cb);
    };
    const _onJobCanceled = (item) => {
        const date = new Date();
        console.log(`[${item}] cancelled on: ${date}`);
    };
    const createJob = (wl, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const { itemID, itemName, nextOn, setOn, recurrence, server } = wl;
        const nextJobDate = (0, fromUnixTime_1.default)(nextOn);
        const isCancelled = cancelJob(itemID, server);
        if (!isCancelled)
            console.log(`\n${server} | [${itemID}:${itemName}] Job is not running.`);
        const newJob = node_schedule_1.default.scheduleJob(nextJobDate, function () {
            return __awaiter(this, void 0, void 0, function* () {
                const date = new Date();
                console.log(`Running... [${itemID}:${itemName}] | now: ${date}`);
                return yield cb(wl);
            });
        });
        if (!newJob)
            throw new Error(`***Failed to create Job for: ${server} | [${itemID}:${itemName}]***`);
        console.log(`${server} | [${itemID}:${itemName}] Created:${(0, fromUnixTime_1.default)(setOn)} | Recur:${recurrence}min | jobOn:${nextJobDate}`);
        newJob.on('success', (wl) => {
            if (!wl)
                return;
            _onJobSuccess(wl, cb);
        });
        newJob.on('canceled', () => {
            _onJobCanceled(`${server}${itemID}:${itemName}`);
        });
        schedulerMap.set(server + itemID, { wl, job: newJob });
    });
    const cancelJob = (itemID, server) => {
        const item = schedulerMap.get(server + itemID);
        if (item) {
            schedulerMap.delete(server + itemID);
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
