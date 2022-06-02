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
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './conf/.env' });
const scraper_1 = require("./scraper");
describe.skip('Scrape HEL', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield fs_1.promises.readFile(path_1.default.resolve(__dirname, './mocks/pksResponse.txt'), 'utf8');
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            text: () => Promise.resolve(data),
        }));
    }));
    test('Scraping 28946 PKS', () => __awaiter(void 0, void 0, void 0, function* () {
        const test = yield (0, scraper_1.scrapeItem)('28946', 'test', 'HEL');
        // await fs.writeFile(path.resolve(__dirname, './mocks/pksObject.json'), JSON.stringify(test));
        const file = yield fs_1.promises.readFile(path_1.default.resolve(__dirname, './mocks/pksObject.json'), 'utf8');
        const object = JSON.parse(file);
        object.timestamp = Math.floor(new Date().getTime() / 1000);
        expect(test).toEqual(object);
    }));
    test('Scrape fail', () => __awaiter(void 0, void 0, void 0, function* () {
        const test = global.fetch;
        test.mockReturnValueOnce(Promise.resolve({
            ok: false,
            text: () => Promise.resolve(''),
            statusText: 'Blocked',
        }));
        expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, scraper_1.scrapeItem)('6690', 'test', 'HEL');
        })).rejects.toThrow('Blocked');
    }));
    test('Non-existent ID', () => __awaiter(void 0, void 0, void 0, function* () {
        const test = global.fetch;
        test.mockReturnValueOnce(Promise.resolve({
            ok: true,
            text: () => Promise.resolve(''),
        }));
        yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, scraper_1.scrapeItem)('6690', 'test', 'HEL');
        })).rejects.toThrow('No item found for: 6690:test in HEL');
    }));
});
describe.skip('Scrape NIF', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield fs_1.promises.readFile(path_1.default.resolve(__dirname, './mocks/nif_ADResponse.txt'), 'utf8');
        const itemInfo = yield fs_1.promises.readFile(path_1.default.resolve(__dirname, './mocks/nif_ADInfoResponse.txt'), 'utf8');
        global.fetch = jest
            .fn()
            .mockImplementationOnce(() => Promise.resolve({
            ok: true,
            text: () => Promise.resolve(data),
        }))
            .mockImplementationOnce(() => Promise.resolve({
            ok: true,
            text: () => Promise.resolve(itemInfo),
        }))
            .mockImplementation(() => Promise.resolve({
            ok: true,
            text: () => Promise.resolve(data),
        }));
    }));
    jest.setTimeout(10000);
    test('Scraping 15204 Abyss Dress', () => __awaiter(void 0, void 0, void 0, function* () {
        const test = yield (0, scraper_1.scrapeItem)('15204', 'Abyss Dress', 'NIF');
        // await fs.writeFile(path.resolve(__dirname, './mocks/nif_AD5.json'), JSON.stringify(test));
        const file = yield fs_1.promises.readFile(path_1.default.resolve(__dirname, './mocks/nif_AD4.json'), 'utf8');
        const object = JSON.parse(file);
        object.timestamp = Math.floor(new Date().getTime() / 1000);
        expect(test).toEqual(object);
    }));
});
