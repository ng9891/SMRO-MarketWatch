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
const discord_js_1 = require("discord.js");
const Scheduler_1 = __importDefault(require("../../scheduler/Scheduler"));
const valid_response_1 = require("../responses/valid.response");
exports.recurrenceList = {
    data: new builders_1.SlashCommandSubcommandBuilder().setName('list').setDescription('List of running jobs.'),
    run: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        if (interaction instanceof discord_js_1.ButtonInteraction)
            return;
        yield interaction.deferReply();
        const itemsMap = Scheduler_1.default.schedulerMap;
        const data = yield Array.from(itemsMap).map(([key, val], idx) => {
            const { wl, job } = val;
            const subs = wl.subs ? wl.subs : 1;
            let time = job.nextInvocation();
            if (!time) {
                console.log(`No next invocation time found for itemID: ${wl.itemID} | ${itemsMap.size} jobs`);
                time = new Date();
            }
            // formatDistanceToNow giving 'invalid time' error. Remaking Date.
            const nextOn = time.getTime() / 1000;
            return { itemID: wl.itemID, itemName: wl.itemName, subs, recurrence: wl.recurrence, nextOn, server: wl.server };
        });
        const resp = (0, valid_response_1.getRecurrenceMsg)(data);
        yield interaction.editReply(resp);
    }),
};
