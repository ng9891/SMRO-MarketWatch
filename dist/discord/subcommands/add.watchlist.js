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
exports.add = void 0;
const builders_1 = require("@discordjs/builders");
const scraper_1 = __importDefault(require("../../scraper/scraper"));
const watchlist_action_1 = require("../../db/actions/watchlist.action");
const users_action_1 = require("../../db/actions/users.action");
const items_action_1 = require("../../db/actions/items.action");
const helpers_1 = require("../../helpers/helpers");
const valid_response_1 = require("../responses/valid.response");
const invalid_response_1 = require("../responses/invalid.response");
const Scheduler_1 = __importDefault(require("../../scheduler/Scheduler"));
const checkMarket_1 = require("../../scheduler/checkMarket");
const isListFull = (listSize) => {
    if (!listSize)
        return false;
    if (listSize < Number(process.env.MAX_LIST_SIZE))
        return false;
    return true;
};
exports.add = {
    data: new builders_1.SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription('Add/Update an Item ID to the watchlist.')
        .addIntegerOption((option) => option.setName('itemid').setDescription('ID of the Item. e.g 6635').setRequired(true))
        .addStringOption((option) => option.setName('threshold').setDescription('Price threshold for notifications. e.g 250m').setRequired(true))
        .addIntegerOption((option) => option.setName('refinement').setDescription('Minimum refinement of the equipment if applicable. e.g 11 or 12')),
    run: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        yield interaction.deferReply();
        const userID = interaction.user.id;
        const userName = interaction.user.username;
        const discriminator = interaction.user.discriminator;
        const itemID = interaction.options.getInteger('itemid', true).toString();
        const threshold = interaction.options.getString('threshold', true);
        const refine = interaction.options.getInteger('refinement');
        const refinement = refine ? Math.abs(refine).toString() : null;
        const validPrice = (0, helpers_1.parsePriceString)(threshold);
        if (!validPrice)
            return (0, invalid_response_1.getInvalidPriceFormatMsg)();
        const maxThreshold = Number(process.env.MAX_THRESHOLD);
        if (validPrice >= maxThreshold)
            return (0, invalid_response_1.getInvalidMaxPriceMsg)();
        // Scraping item info
        const itemInfo = yield (0, scraper_1.default)(itemID);
        const newList = {
            itemID,
            threshold: validPrice,
            itemName: itemInfo.name,
            timestamp: itemInfo.timestamp,
            userID,
            userName,
        };
        if (refinement)
            newList.refinement = refinement;
        const user = yield (0, users_action_1.getUserInfo)(userID, userName, discriminator);
        const list = user.list;
        // If its not an update. Check for list size
        if (list && !list[itemID]) {
            const isFull = isListFull(user.listSize);
            if (isFull)
                return (0, invalid_response_1.getMaxListSizeMsg)(itemID, itemInfo.name, user === null || user === void 0 ? void 0 : user.list);
        }
        const newUser = yield (0, users_action_1.setUserInfo)(Object.assign(Object.assign({}, user), { list: Object.assign(Object.assign({}, user.list), { [itemID]: newList }) }));
        yield (0, items_action_1.setItemInfo)(itemInfo, userID);
        // Check if recurrence is set.
        let wl = yield (0, watchlist_action_1.getWatchListInfo)(itemID);
        if (!wl) {
            const recurrence = Number(process.env.DEFAULT_RECURRANCE_MINUTES);
            wl = yield (0, watchlist_action_1.createNewWatchList)(recurrence, newUser, itemInfo);
        }
        // Job is not running because it has 0 subs. Needs reschedule.
        if (!(wl === null || wl === void 0 ? void 0 : wl.subs) || wl.subs === 0)
            Scheduler_1.default.rescheduleJob(wl, checkMarket_1.checkMarket);
        const isNewSub = yield (0, watchlist_action_1.addSub)(newList);
        const action = isNewSub ? 'ADD' : 'UPDATE';
        const embed = (0, valid_response_1.getDefaultEmbed)(action, wl, newUser.list);
        if (!itemInfo.vends)
            itemInfo.vends = [];
        yield interaction.editReply({ embeds: [embed] });
        yield (0, checkMarket_1.notifySubs)([newList], itemInfo.vends, (0, helpers_1.isItemAnEquip)(itemInfo.type, itemInfo.equipLocation));
    }),
};
