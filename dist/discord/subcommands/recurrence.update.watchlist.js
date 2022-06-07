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
exports.recurrenceUpdate = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const watchlist_action_1 = require("../../db/actions/watchlist.action");
const valid_response_1 = require("../responses/valid.response");
const invalid_response_1 = require("../responses/invalid.response");
const scraper_1 = require("../../scraper/scraper");
const Scheduler_1 = __importDefault(require("../../scheduler/Scheduler"));
const checkMarket_1 = require("../../scheduler/checkMarket");
const date_fns_1 = require("date-fns");
exports.recurrenceUpdate = {
    data: new builders_1.SlashCommandSubcommandBuilder()
        .setName('update')
        .setDescription('Updates the recurrence of an item. **Must have permission!**')
        .addStringOption((option) => option
        .setName('server')
        .setDescription('Decide which server to put the watchlist')
        .setRequired(true)
        .setAutocomplete(true))
        .addStringOption((option) => option.setName('item-query').setDescription('Find item.').setRequired(true).setAutocomplete(true))
        .addIntegerOption((option) => option.setName('recurrence').setDescription('New recurrence interval in minutes.').setRequired(true)),
    run: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        if (interaction instanceof discord_js_1.ButtonInteraction)
            return;
        if (interaction instanceof discord_js_1.SelectMenuInteraction)
            return;
        yield interaction.deferReply();
        const userID = interaction.user.id;
        const userName = interaction.user.username;
        const discriminator = interaction.user.discriminator;
        const recurrence = Math.abs(interaction.options.getInteger('recurrence', true));
        const query = interaction.options.getString('item-query');
        if (!query)
            return (0, invalid_response_1.getSelectFromAutocompleteMsg)();
        const [itemID, itemName] = query.split('=');
        if (!itemID || !itemName)
            return (0, invalid_response_1.getSelectFromAutocompleteMsg)();
        const serverQuery = interaction.options.getString('server');
        if (!serverQuery)
            return (0, invalid_response_1.getSelectFromAutocompleteMsg)();
        const server = serverQuery;
        const member = interaction.member;
        const permission = process.env.PERMISSION_TO_CHANGE_SCRAPE_TIME || 'BAN_MEMBERS';
        if (!member.permissions.has(permission))
            return (0, invalid_response_1.getNoPermissionMsg)();
        let wl = yield (0, watchlist_action_1.getWatchListInfo)(itemID, server);
        if (!wl) {
            const itemInfo = yield (0, scraper_1.scrapeItem)(itemID, itemName, server);
            wl = yield (0, watchlist_action_1.createNewWatchList)(recurrence, { userID, userName, discriminator }, itemInfo);
        }
        else {
            const newWl = Object.assign(Object.assign({}, wl), { setByID: userID, setByName: userName, recurrence, setOn: (0, date_fns_1.getUnixTime)(new Date()) });
            const updatedWl = yield (0, watchlist_action_1.updateWatchLists)([newWl]);
            wl = updatedWl[0];
        }
        if ((wl === null || wl === void 0 ? void 0 : wl.subs) && wl.subs > 0)
            Scheduler_1.default.createJob(wl, checkMarket_1.checkMarket);
        yield interaction.editReply((0, valid_response_1.getRecurrenceUpdateMsg)(wl));
    }),
};
