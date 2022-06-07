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
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingRun = exports.listingSelectMenu = void 0;
const discord_js_1 = require("discord.js");
const remove_watchlist_1 = require("../subcommands/remove.watchlist");
const helpers_1 = require("../../helpers/helpers");
const threshold_button_1 = require("../button/threshold.button");
exports.listingSelectMenu = new discord_js_1.MessageSelectMenu()
    .setCustomId('listing')
    .setPlaceholder('Nothing selected')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions([
    {
        label: 'Update Item Threshold',
        description: 'Gives you a series of threshold options to choose from',
        value: 'update',
    },
    {
        label: 'Remove Item',
        description: 'Remove from your watchlist',
        value: 'remove',
    },
    {
        label: 'None',
        description: 'Erase this manu',
        value: 'none',
    },
]);
const listingRun = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    const requestUserID = interaction.user.id;
    const author = interaction.message.content;
    const authorID = author.slice(2, author.length - 1);
    if (requestUserID !== authorID)
        return yield interaction.reply({ content: 'Sorry. You cannot interract with this listing', ephemeral: true });
    yield interaction.deferUpdate();
    const selected = interaction.values[0];
    const { threshold } = (0, helpers_1.parseListingEmbed)(interaction);
    if (!threshold) {
        yield interaction.editReply({ components: [] });
        return yield interaction.followUp('Sorry. Could not find Embed information.');
    }
    const thresh = (0, helpers_1.parsePriceString)(threshold);
    if (!thresh) {
        yield interaction.editReply({ components: [] });
        return yield interaction.followUp('Sorry. Could not find threshold information.');
    }
    switch (selected) {
        case 'remove': {
            yield remove_watchlist_1.remove.run(interaction);
            yield interaction.editReply({ components: [] });
            break;
        }
        case 'update': {
            const btns = (0, threshold_button_1.generateThresholdBtn)(thresh);
            const maxItemPerRow = 5;
            let rowBtn = [];
            let count = 0;
            const actionRows = [];
            btns.forEach((btn, idx) => {
                if (count === maxItemPerRow) {
                    const action = new discord_js_1.MessageActionRow().addComponents(rowBtn);
                    actionRows.push(action);
                    count = 0;
                    rowBtn = [];
                }
                rowBtn.push(btn);
                if (idx === btns.length - 1) {
                    const action = new discord_js_1.MessageActionRow().addComponents(rowBtn);
                    actionRows.push(action);
                }
                count += 1;
            });
            yield interaction.editReply({ components: actionRows });
            break;
        }
        default: {
            yield interaction.editReply({ components: [] });
        }
    }
});
exports.listingRun = listingRun;
