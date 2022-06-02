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
exports.serverQuery = void 0;
const serverQuery = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    const focusedValue = interaction.options.getFocused();
    const choices = [
        { name: 'Helheim', value: 'HEL' },
        { name: 'Niffleheim', value: 'NIF' },
    ];
    const filtered = choices.filter((choice) => choice.name.toLowerCase().includes(focusedValue.toLowerCase()));
    yield interaction.respond(filtered.map((choice) => ({ name: choice.name, value: choice.value })));
});
exports.serverQuery = serverQuery;
