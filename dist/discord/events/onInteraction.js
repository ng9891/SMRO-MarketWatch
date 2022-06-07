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
exports.onInteraction = void 0;
const _CommandList_1 = __importDefault(require("../commands/_CommandList"));
const itemQuery_autocomplete_1 = require("../autocomplete/itemQuery.autocomplete");
const threshold_button_1 = require("../button/threshold.button");
const serverQuery_autocomplete_1 = require("../autocomplete/serverQuery.autocomplete");
const listing_select_1 = require("../select/listing.select");
const onInteraction = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (interaction.isAutocomplete()) {
        if (interaction.commandName === 'watchlist') {
            const focusedOption = interaction.options.getFocused(true);
            if (focusedOption.name === 'item-query')
                return yield (0, itemQuery_autocomplete_1.itemQuery)(interaction);
            if (focusedOption.name === 'server')
                return yield (0, serverQuery_autocomplete_1.serverQuery)(interaction);
        }
    }
    if (interaction.isButton()) {
        for (const id of threshold_button_1.btnIDArr) {
            if (interaction.customId === id) {
                yield (0, threshold_button_1.changeThreshold)(interaction);
                break;
            }
        }
        return;
    }
    if (interaction.isSelectMenu()) {
        if (interaction.customId === listing_select_1.listingSelectMenu.customId)
            yield (0, listing_select_1.listingRun)(interaction);
        return;
    }
    if (!interaction.isCommand())
        return;
    try {
        for (const Command of _CommandList_1.default) {
            if (interaction.commandName === Command.data.name) {
                const resp = yield Command.run(interaction);
                if (resp) {
                    interaction.deferred ? yield interaction.editReply(resp) : yield interaction.reply(resp);
                }
                break;
            }
        }
    }
    catch (error) {
        console.error(error);
        console.trace('trace' + error);
        if (error instanceof Error) {
            if (interaction.deferred)
                yield interaction.editReply(error.message);
            else
                yield interaction.reply(error.message);
        }
    }
});
exports.onInteraction = onInteraction;
