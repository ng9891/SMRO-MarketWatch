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
const serverQuery_autocomplete_1 = require("../autocomplete/serverQuery.autocomplete");
const onInteraction = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (interaction.isAutocomplete()) {
        const autoIteraction = interaction;
        if (autoIteraction.commandName === 'watchlist') {
            const focusedOption = autoIteraction.options.getFocused(true);
            if (focusedOption.name === 'item-query')
                return yield (0, itemQuery_autocomplete_1.itemQuery)(autoIteraction);
            if (focusedOption.name === 'server')
                return yield (0, serverQuery_autocomplete_1.serverQuery)(autoIteraction);
        }
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
            }
        }
    }
    catch (error) {
        const err = error;
        console.log(err);
        if (interaction.deferred)
            yield interaction.editReply(err.message);
        else
            yield interaction.reply(err.message);
    }
});
exports.onInteraction = onInteraction;
