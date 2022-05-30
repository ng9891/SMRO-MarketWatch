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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const builders_1 = require("@discordjs/builders");
const users_action_1 = require("../../db/actions/users.action");
const watchlist_action_1 = require("../../db/actions/watchlist.action");
const valid_response_1 = require("../responses/valid.response");
const invalid_response_1 = require("../responses/invalid.response");
const Scheduler_1 = __importDefault(require("../../scheduler/Scheduler"));
exports.remove = {
    data: new builders_1.SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription('Remove an item from the watchlist.')
        .addIntegerOption((option) => option.setName('itemid').setDescription('Item ID to remove from the watchlist').setRequired(true)),
    run: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        yield interaction.deferReply();
        const userID = interaction.user.id;
        const userName = interaction.user.username;
        const discriminator = interaction.user.discriminator;
        const itemID = interaction.options.getInteger('itemid', true).toString();
        const user = yield (0, users_action_1.getUserInfo)(userID, userName, discriminator);
        const id = itemID;
        const list = user.list ? user.list : undefined;
        if (!list)
            return (0, invalid_response_1.getItemNotOnListMsg)(itemID, list);
        const _a = list, _b = id, delItem = _a[_b], rest = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
        if (!delItem)
            return (0, invalid_response_1.getItemNotOnListMsg)(itemID, list);
        const newUser = Object.assign(user, { list: rest });
        yield (0, users_action_1.setUserInfo)(newUser);
        yield (0, watchlist_action_1.unSub)(itemID, userID);
        const wl = yield (0, watchlist_action_1.getWatchListInfo)(itemID);
        if (!wl)
            return 'Error. Deleted an item not in the Watchlist.';
        if (!(wl === null || wl === void 0 ? void 0 : wl.subs) || wl.subs === 0)
            Scheduler_1.default.cancelJob(itemID);
        const resp = (0, valid_response_1.getDefaultEmbed)('REMOVE', wl, list);
        yield interaction.editReply({ embeds: [resp] });
    }),
};
