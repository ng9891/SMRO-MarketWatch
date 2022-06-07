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
exports.list = void 0;
const builders_1 = require("@discordjs/builders");
const discord_js_1 = require("discord.js");
const users_action_1 = require("../../db/actions/users.action");
const valid_response_1 = require("../responses/valid.response");
exports.list = {
    data: new builders_1.SlashCommandSubcommandBuilder()
        .setName('list')
        .setDescription('Display the watchlist of a user.')
        .addUserOption((option) => option.setName('user').setDescription('Optional. Specify the user.')),
    run: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        if (interaction instanceof discord_js_1.ButtonInteraction)
            return;
        if (interaction instanceof discord_js_1.SelectMenuInteraction)
            return;
        yield interaction.deferReply();
        const mention = interaction.options.getUser('user');
        const userID = mention && !mention.bot ? mention.id : interaction.user.id;
        const userName = mention && !mention.bot ? mention.username : interaction.user.username;
        const discriminator = mention && !mention.bot ? mention.discriminator : interaction.user.discriminator;
        const user = yield (0, users_action_1.getUserInfo)(userID, userName, discriminator);
        yield interaction.editReply((0, valid_response_1.getListingMsg)(user));
    }),
};
