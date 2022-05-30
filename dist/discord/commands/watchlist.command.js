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
exports.watchlist = void 0;
const builders_1 = require("@discordjs/builders");
const add_watchlist_1 = require("../subcommands/add.watchlist");
const remove_watchlist_1 = require("../subcommands/remove.watchlist");
const recurrence_watchlist_1 = require("../subcommands/recurrence.watchlist");
const list_watchlist_1 = require("../subcommands/list.watchlist");
exports.watchlist = {
    data: new builders_1.SlashCommandBuilder()
        .setName('watchlist')
        .setDescription('Manage watchlist')
        .addSubcommand(add_watchlist_1.add.data)
        .addSubcommand(remove_watchlist_1.remove.data)
        .addSubcommand(recurrence_watchlist_1.recurrence.data)
        .addSubcommand(list_watchlist_1.list.data),
    run: (interaction) => __awaiter(void 0, void 0, void 0, function* () {
        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case 'add': {
                return yield add_watchlist_1.add.run(interaction);
            }
            case 'remove': {
                return yield remove_watchlist_1.remove.run(interaction);
            }
            case 'recurrence': {
                return yield recurrence_watchlist_1.recurrence.run(interaction);
            }
            case 'list': {
                return yield list_watchlist_1.list.run(interaction);
            }
            default: {
                return 'Command not found.';
            }
        }
    }),
};
