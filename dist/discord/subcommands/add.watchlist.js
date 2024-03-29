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
const discord_js_1 = require("discord.js");
const scraper_1 = require("../../scraper/scraper");
const watchlist_action_1 = require("../../db/actions/watchlist.action");
const users_action_1 = require("../../db/actions/users.action");
const items_action_1 = require("../../db/actions/items.action");
const helpers_1 = require("../../helpers/helpers");
const helpers_2 = require("../../helpers/helpers");
const valid_response_1 = require("../responses/valid.response");
const invalid_response_1 = require("../responses/invalid.response");
const invalid_response_2 = require("../responses/invalid.response");
const Scheduler_1 = __importDefault(require("../../scheduler/Scheduler"));
const checkMarket_1 = require("../../scheduler/checkMarket");
const isListFull = (listSize) => {
    if (!listSize)
        return false;
    if (listSize < Number(process.env.MAX_LIST_SIZE))
        return false;
    return true;
};
const parseCommandIteraction = (interaction) => {
    const query = interaction.options.getString('item-query');
    if (!query)
        return {};
    const [itemID, itemName] = query.split('=');
    const serverQuery = interaction.options.getString('server');
    if (!serverQuery)
        return {};
    const refine = interaction.options.getInteger('refinement');
    const refinement = refine ? Math.abs(refine).toString() : null;
    const threshold = interaction.options.getString('threshold', true);
    return { itemID, itemName, server: serverQuery, threshold, refinement };
};
const getNewThresholdFromButton = (interaction, threshold) => {
    if (!threshold)
        return null;
    const buttonID = interaction.customId;
    const sign = buttonID.slice(0, 1);
    const percent = Number(buttonID.slice(1)) / 100;
    const amountToChange = threshold * percent;
    const newThresh = sign === '+' ? threshold + amountToChange : threshold - amountToChange;
    return (0, helpers_2.parsePriceString)((0, helpers_2.formatPrice)(newThresh));
};
exports.add = {
    data: new builders_1.SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription('Add/Update an Item ID to the watchlist.')
        .addStringOption((option) => option
        .setName('server')
        .setDescription('Decide which server to put the watchlist')
        .setRequired(true)
        .setAutocomplete(true))
        .addStringOption((option) => option.setName('item-query').setDescription('Find item.').setRequired(true).setAutocomplete(true))
        .addStringOption((option) => option
        .setName('threshold')
        .setDescription('Price threshold for notifications. e.g 250m - Max of 2b')
        .setRequired(true))
        .addIntegerOption((option) => option.setName('refinement').setDescription('Minimum refinement of the equipment if applicable. e.g 11 or 12')),
    run: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        // Handling UX
        if (interaction instanceof discord_js_1.SelectMenuInteraction)
            return;
        if (interaction instanceof discord_js_1.CommandInteraction)
            yield interaction.deferReply();
        const followUp = interaction instanceof discord_js_1.ButtonInteraction ? (yield interaction.followUp('Fetching...')) : null;
        const userID = interaction.user.id;
        const userName = interaction.user.username;
        const discriminator = interaction.user.discriminator;
        // If interaction comes from button, embed has to be parsed to get the Item info.
        const { itemID, itemName, server, threshold, refinement } = interaction instanceof discord_js_1.CommandInteraction ? parseCommandIteraction(interaction) : (0, helpers_1.parseListingEmbed)(interaction);
        if (!itemID || !itemName || !server)
            return (0, invalid_response_2.getSelectFromAutocompleteMsg)();
        let validPrice = interaction instanceof discord_js_1.ButtonInteraction
            ? getNewThresholdFromButton(interaction, (0, helpers_2.parsePriceString)(threshold))
            : (0, helpers_2.parsePriceString)(threshold);
        if (!validPrice)
            return (0, invalid_response_1.getInvalidPriceFormatMsg)();
        const maxThreshold = Number(process.env.MAX_THRESHOLD);
        if (validPrice > maxThreshold)
            validPrice = maxThreshold;
        // Scraping item info
        const itemInfo = yield (0, scraper_1.scrapeItem)(itemID, itemName, server);
        const newList = {
            itemID,
            userID,
            userName,
            server,
            itemName: itemInfo.name,
            timestamp: itemInfo.timestamp,
            threshold: validPrice,
        };
        if (refinement)
            newList.refinement = refinement;
        const user = yield (0, users_action_1.getUserInfo)(userID, userName, discriminator);
        const list = user.list;
        // If its not an item threshold update. Check for user list size
        if (list && !list[itemID]) {
            const isFull = isListFull(user.listSize);
            if (isFull)
                return (0, invalid_response_1.getMaxListSizeMsg)(itemID, itemInfo.name, user === null || user === void 0 ? void 0 : user.list);
        }
        const newUser = yield (0, users_action_1.setUserInfo)(Object.assign(Object.assign({}, user), { list: Object.assign(Object.assign({}, user.list), { [server + itemID]: newList }) }));
        yield (0, items_action_1.setItemInfo)(itemInfo, userID);
        // Check if recurrence is set.
        let wl = yield (0, watchlist_action_1.getWatchListInfo)(itemID, server);
        if (!wl) {
            const recurrence = Number(process.env.DEFAULT_RECURRANCE_MINUTES);
            wl = yield (0, watchlist_action_1.createNewWatchList)(recurrence, newUser, itemInfo);
        }
        // Job is not running because it has 0 subs. Needs reschedule.
        if (!(wl === null || wl === void 0 ? void 0 : wl.subs) || wl.subs === 0)
            Scheduler_1.default.rescheduleJob(Object.assign(Object.assign({}, wl), { subs: 1 }), checkMarket_1.checkMarket);
        const isNewSub = yield (0, watchlist_action_1.addSub)(newList);
        const action = isNewSub ? 'ADD' : 'UPDATE';
        const nextOn = (0, helpers_1.calculateNextExec)(wl.setOn, new Date(), wl.recurrence).getTime() / 1000;
        const embed = (0, valid_response_1.getDefaultEmbed)(action, Object.assign(Object.assign({}, wl), { nextOn }), newUser);
        // Handling how to respond depending on the interaction type.
        if (interaction instanceof discord_js_1.CommandInteraction) {
            yield interaction.editReply({ embeds: [embed] });
        }
        else if (followUp) {
            yield followUp.edit({ content: action, embeds: [embed] });
        }
        else {
            yield interaction.followUp({ embeds: [embed] });
        }
        if (itemInfo.vends && itemInfo.vends.length > 0)
            yield (0, checkMarket_1.notifySubs)([newList], itemInfo.vends, (0, helpers_1.isItemAnEquip)(itemInfo.type, itemInfo.equipLocation));
    }),
};
