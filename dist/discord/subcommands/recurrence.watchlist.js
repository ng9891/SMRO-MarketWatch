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
exports.recurrence = void 0;
const builders_1 = require("@discordjs/builders");
const watchlist_action_1 = require("../../db/actions/watchlist.action");
const valid_response_1 = require("../responses/valid.response");
const invalid_response_1 = require("../responses/invalid.response");
const scraper_1 = __importDefault(require("../../scraper/scraper"));
const Scheduler_1 = __importDefault(require("../../scheduler/Scheduler"));
const checkMarket_1 = require("../../scheduler/checkMarket");
const date_fns_1 = require("date-fns");
exports.recurrence = {
    data: new builders_1.SlashCommandSubcommandBuilder()
        .setName('recurrence')
        .setDescription('Change the check recurrence of an item. **Must have permission!**')
        .addIntegerOption((option) => option.setName('itemid').setDescription('The ID of the item you wish to change.').setRequired(true))
        .addIntegerOption((option) => option.setName('recurrence').setDescription('New recurrence interval in minutes.').setRequired(true)),
    run: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        yield interaction.deferReply();
        const userID = interaction.user.id;
        const userName = interaction.user.username;
        const itemID = (_a = interaction.options.getInteger('itemid', true)) === null || _a === void 0 ? void 0 : _a.toString();
        const recurrence = Math.abs(interaction.options.getInteger('recurrence', true));
        const member = interaction.member;
        const permission = process.env.PERMISSION_TO_CHANGE_SCRAPE_TIME || 'BAN_MEMBERS';
        if (!member.permissions.has(permission))
            return (0, invalid_response_1.getNoPermissionMsg)();
        let wl = yield (0, watchlist_action_1.getWatchListInfo)(itemID);
        if (!wl) {
            const itemInfo = yield (0, scraper_1.default)(itemID);
            wl = yield (0, watchlist_action_1.createNewWatchList)(recurrence, { userID, userName }, itemInfo);
        }
        else {
            const newWl = Object.assign(Object.assign({}, wl), { setByID: userID, setByName: userName, recurrence, setOn: (0, date_fns_1.getUnixTime)(new Date()) });
            wl = yield (0, watchlist_action_1.updateWatchList)(newWl);
        }
        if ((wl === null || wl === void 0 ? void 0 : wl.subs) && wl.subs > 0)
            Scheduler_1.default.createJob(wl, checkMarket_1.checkMarket);
        yield interaction.editReply((0, valid_response_1.getRecurrenceUpdateMsg)(wl));
    }),
};
