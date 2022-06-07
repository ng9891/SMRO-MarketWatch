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
exports.changeThreshold = exports.generateThresholdBtn = exports.btnIDArr = void 0;
const discord_js_1 = require("discord.js");
const helpers_1 = require("../../helpers/helpers");
const add_watchlist_1 = require("../subcommands/add.watchlist");
const btnRowLength = 5;
const btnStyleArr = ['SUCCESS', 'DANGER', 'SECONDARY'];
const btnIconArr = ['⬆️', '⬇️', '❌'];
// Builts IDs: +20 +15 +10 etc...
exports.btnIDArr = (() => {
    const arrID = [];
    for (let i = 1; i <= btnRowLength; i++) {
        const steps = 5 * i;
        const id1 = `+${steps}`;
        const id2 = `-${steps}`;
        arrID[0] ? arrID[0].push(id1) : arrID.push([id1]);
        arrID[1] ? arrID[1].push(id2) : arrID.push([id2]);
    }
    return [...arrID[0], ...arrID[1], 'none'];
})();
const generateThresholdBtn = (threshold) => {
    const threshArr = [];
    for (let i = 1; i <= btnRowLength; i++) {
        const steps = 5 * i;
        const percent = steps / 100;
        threshArr.push(threshold * percent);
    }
    const maxThreshold = Number(process.env.MAX_THRESHOLD);
    const btns = exports.btnIDArr.map((id, idx) => {
        let label = '';
        let styleIndex = 0;
        const threshIdx = idx % threshArr.length;
        if (idx === exports.btnIDArr.length - 1) {
            label = 'None';
            styleIndex = 2;
        }
        else if (idx < btnRowLength) {
            const thresh = threshArr[threshIdx] + threshold;
            const newThresh = thresh < maxThreshold ? thresh : maxThreshold;
            label = (0, helpers_1.formatPrice)(newThresh);
            styleIndex = 0;
        }
        else {
            const thresh = threshold - threshArr[threshIdx];
            const newThresh = thresh < maxThreshold ? thresh : maxThreshold;
            label = (0, helpers_1.formatPrice)(newThresh);
            styleIndex = 1;
        }
        return new discord_js_1.MessageButton()
            .setCustomId(id)
            .setLabel(label)
            .setStyle(btnStyleArr[styleIndex])
            .setEmoji(btnIconArr[styleIndex]);
    });
    return btns;
};
exports.generateThresholdBtn = generateThresholdBtn;
const changeThreshold = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    const requestUserID = interaction.user.id;
    const author = interaction.message.content;
    const authorID = author.slice(2, author.length - 1);
    if (requestUserID !== authorID) {
        yield interaction.reply({ content: 'Sorry. You cannot interract with this listing', ephemeral: true });
        return;
    }
    yield interaction.deferUpdate();
    const { threshold } = (0, helpers_1.parseListingEmbed)(interaction);
    if (!threshold) {
        yield interaction.update({ components: [] });
        yield interaction.followUp('Sorry. Could not find Embed information.');
        return;
    }
    yield interaction.editReply({ components: [] });
    if (interaction.customId !== 'none') {
        yield add_watchlist_1.add.run(interaction);
    }
});
exports.changeThreshold = changeThreshold;
