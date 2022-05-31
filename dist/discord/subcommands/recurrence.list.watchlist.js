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
exports.recurrenceList = void 0;
const builders_1 = require("@discordjs/builders");
const Scheduler_1 = __importDefault(require("../../scheduler/Scheduler"));
const formatDistanceToNow_1 = __importDefault(require("date-fns/formatDistanceToNow"));
const fromUnixTime_1 = __importDefault(require("date-fns/fromUnixTime"));
const valid_response_1 = require("../responses/valid.response");
exports.recurrenceList = {
    data: new builders_1.SlashCommandSubcommandBuilder().setName('list').setDescription('List running jobs.'),
    run: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        yield interaction.deferReply();
        const itemsMap = Scheduler_1.default.schedulerMap;
        const data = Array.from(itemsMap).map(([key, val]) => {
            const { wl, job } = val;
            const subs = wl.subs ? wl.subs.toString() : '1';
            const time = job.nextInvocation();
            // formatDistanceToNow giving 'invalid time' error. Remaking Date.
            const unix = time.getTime() / 1000;
            const newTime = (0, fromUnixTime_1.default)(unix);
            const nextOn = (0, formatDistanceToNow_1.default)(newTime, { addSuffix: false });
            return { itemID: key, itemName: wl.itemName, subs, recurrence: wl.recurrence, nextOn };
        });
        const resp = (0, valid_response_1.getRecurrenceMsg)(data);
        yield interaction.editReply(resp);
    }),
};
