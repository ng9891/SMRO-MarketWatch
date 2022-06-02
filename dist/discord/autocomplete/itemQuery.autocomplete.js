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
exports.itemQuery = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const itemQuery = (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield fs_1.promises.readFile(path_1.default.resolve(__dirname, '../../assets/iteminfo.json'), 'utf8');
    const choices = JSON.parse(data);
    const focusedValue = interaction.options.getFocused();
    const isNum = !focusedValue || isNaN(Number(focusedValue)) ? false : true;
    const filtered = choices
        .filter((choice) => {
        if (isNum)
            return choice.id.toString().startsWith(focusedValue);
        return choice.name.toLowerCase().startsWith(focusedValue.toLowerCase());
    })
        .slice(0, 25);
    yield interaction.respond(filtered.map((choice) => ({ name: `${choice.id} - ${choice.name}`, value: `${choice.id}=${choice.name}` })));
});
exports.itemQuery = itemQuery;
