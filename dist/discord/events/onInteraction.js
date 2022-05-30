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
const onInteraction = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isCommand())
        return;
    for (const Command of _CommandList_1.default) {
        if (interaction.commandName === Command.data.name) {
            try {
                const resp = yield Command.run(interaction);
                if (resp) {
                    if (interaction.deferred)
                        yield interaction.editReply(resp);
                    else
                        yield interaction.reply(resp);
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
        }
    }
});
exports.onInteraction = onInteraction;
