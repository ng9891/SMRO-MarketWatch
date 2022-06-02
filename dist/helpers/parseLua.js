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
exports.parseLua = void 0;
const luaparse_1 = require("luaparse");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const parseLua = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield fs_1.promises.readFile(path_1.default.resolve(__dirname, '../assets/iteminfo.lua'), 'utf8');
    const parsedLua = (0, luaparse_1.parse)(data, { comments: false });
    const body = parsedLua.body[0];
    const init = body.init[0];
    const fields = init.fields;
    const arr = [];
    for (const field of fields) {
        const item = field;
        const itemKey = item.key;
        const key = itemKey.value;
        const tbl = item.value;
        const tblValues = tbl.fields.values();
        let itemName = '';
        for (const val of tblValues) {
            const keyField = val;
            if (keyField.key.name === 'identifiedDisplayName') {
                const itemField = keyField.value;
                itemName = itemField.raw.replace(/"/g, '');
            }
        }
        arr.push({ id: key, name: itemName });
    }
    yield fs_1.promises.writeFile(path_1.default.resolve(__dirname, '../assets/iteminfo.json'), JSON.stringify(arr));
});
exports.parseLua = parseLua;
