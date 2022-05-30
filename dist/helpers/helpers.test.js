"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const helpers = __importStar(require("./helpers"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
describe.skip('Clean vend text', () => {
    test('Empty card slots', () => {
        const text = helpers.cleanShopText('\nNone\n');
        expect(text).toBe('-');
    });
    test('Empty card slots with double \\n', () => {
        const text = helpers.cleanShopText('\\nNone\\n');
        expect(text).toBe('-');
    });
    test('Empty string', () => {
        const text = helpers.cleanShopText('');
        expect(text).toBe('');
    });
    test('With module', () => {
        expect(helpers.cleanShopText('Automatic (Fixed Casting)\n')).toBe('Automatic (Fixed Casting)');
    });
    test('With card', () => {
        expect(helpers.cleanShopText('\nPoring Card\n')).toBe('Poring Card');
    });
    test('Double line break', () => {
        expect(helpers.cleanShopText('\n\n+12 Automatic Leg A-type\n')).toBe('+12 Automatic Leg A-type');
    });
    test('Random \\n', () => {
        expect(helpers.cleanShopText('\n\n+12 Automatic\n\nLeg A-type\n')).toBe('+12 Automatic Leg A-type');
    });
    test('Refinement', () => {
        expect(helpers.cleanShopText('\n\n+12')).toBe('+12');
    });
    test('Only \\n', () => {
        expect(helpers.cleanShopText('\n\n')).toBe('');
    });
    test('With options', () => {
        expect(helpers.cleanShopText("\\n\\nCursed Knight's Shield\n[1] [2 Options]\nIncreases resistance against Demihuman monster by 4%Increases resistance against Demihuman monster by 5% ")).toBe("Cursed Knight's Shield [1] [2 Options] Increases resistance against Demihuman monster by 4%Increases resistance against Demihuman monster by 5%");
    });
    test('With refinement and options', () => {
        expect(helpers.cleanShopText("\\n\\n+9 Cursed Knight's Shield\n[ Options ]\\nIncreases physical damage inflicted on Demon monster by 1%Increases physical damage inflicted on Brute monster by 3% ")).toBe("+9 Cursed Knight's Shield [ Options ] Increases physical damage inflicted on Demon monster by 1%Increases physical damage inflicted on Brute monster by 3%");
    });
});
describe.skip('Clean vend prices', () => {
    test('Empty price', () => {
        expect(helpers.cleanShopPrice('')).toBe(0);
    });
    test('Not a number', () => {
        expect(helpers.cleanShopPrice('\nNone\n')).toBeNaN();
    });
    test('Millions', () => {
        expect(helpers.cleanShopPrice('250,000,000 z')).toBe(250000000);
    });
    test('With linebreak', () => {
        expect(helpers.cleanShopPrice('\n250\\n,000,000\n z\\n')).toBe(250000000);
    });
});
describe.skip('Parse string to numbers', () => {
    test('thousands', () => {
        expect(helpers.parsePriceString('1.5k')).toBe(1500);
    });
    test('Double decimals', () => {
        expect(helpers.parsePriceString('2.55k')).toBe(2550);
    });
    test('millions', () => {
        expect(helpers.parsePriceString('2.5m')).toBe(2500000);
    });
    test('billions', () => {
        expect(helpers.parsePriceString('5.55b')).toBe(5550000000);
    });
    test('Invalid string', () => {
        expect(helpers.parsePriceString('6q')).toBeNull();
    });
    test('Invalid string 2', () => {
        expect(helpers.parsePriceString('m5')).toBeNull();
    });
    test('Negative', () => {
        expect(helpers.parsePriceString('-5')).toBeNull();
    });
});
describe.skip('Parse number to string', () => {
    test('thousands', () => {
        expect(helpers.formatPrice(25000)).toBe('25k');
    });
    test('millions', () => {
        expect(helpers.formatPrice(25000000)).toBe('25m');
    });
    test('billions', () => {
        expect(helpers.formatPrice(5550000000)).toBe('5.55b');
    });
    test('0', () => {
        expect(helpers.formatPrice(0)).toBe('0');
    });
    test('Negative number', () => {
        expect(helpers.formatPrice(-12)).toBe('0');
    });
    test('With decimals', () => {
        expect(helpers.formatPrice(1500.55)).toBe('1.5k');
    });
});
const getUnixTime_1 = __importDefault(require("date-fns/getUnixTime"));
describe.skip('Calculate Next Execution ', () => {
    test('Same date 10min recurrence', () => {
        const now = new Date(2022, 1, 1, 1, 40, 0);
        const next = new Date(2022, 1, 1, 1, 50, 0);
        expect(helpers.calculateNextExec(now, now, 10)).toEqual(next);
    });
    test('1 Year difference', () => {
        const recurrence = 30;
        const now = new Date(2022, 1, 1, 1, 40, 0);
        const before = new Date(2021, 1, 1, 1, 0, 0);
        const next = new Date(2022, 1, 1, 2, 0, 0);
        expect(helpers.calculateNextExec(before, now, recurrence)).toEqual(next);
    });
    test('10 days and 4 hrs 10min difference', () => {
        const recurrence = 20;
        const now = new Date(2022, 1, 10, 1, 40, 0);
        const before = new Date(2022, 1, 1, 4, 20, 0);
        const next = new Date(2022, 1, 10, 2, 0, 0);
        expect(helpers.calculateNextExec(before, now, recurrence)).toEqual(next);
    });
    test('with timestamp', () => {
        const recurrence = 20;
        const now = new Date(2022, 1, 10, 1, 40, 0);
        const before = new Date(2022, 1, 1, 4, 20, 0);
        const next = new Date(2022, 1, 10, 2, 0, 0);
        expect(helpers.calculateNextExec((0, getUnixTime_1.default)(before), (0, getUnixTime_1.default)(now), recurrence)).toEqual(next);
    });
    test('In the future', () => {
        const now = new Date(2022, 1, 10, 1, 40, 0);
        const next = new Date(2022, 1, 10, 2, 0, 0);
        expect(helpers.calculateNextExec(next, now, 30)).toEqual(next);
    });
});
describe.skip('Same refinement', () => {
    test('empty strings', () => {
        expect(helpers.isSameRefinement('', '')).toBe(true);
    });
    test('with -', () => {
        expect(helpers.isSameRefinement('12', '-')).toBe(false);
    });
    test('Same', () => {
        expect(helpers.isSameRefinement('12', '+12')).toBe(true);
    });
    test('Same 2', () => {
        expect(helpers.isSameRefinement('-8', '+8')).toBe(true);
    });
    test('Not Same', () => {
        expect(helpers.isSameRefinement('12', '+11')).toBe(false);
    });
    test('Not Same 2', () => {
        expect(helpers.isSameRefinement('1', '+0')).toBe(false);
    });
    test('with 0', () => {
        expect(helpers.isSameRefinement('0', '-')).toBe(true);
    });
});
describe('Testing getting vend not in history', () => {
    let mockData;
    let subSet12;
    let subSet7;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const file = yield fs_1.promises.readFile(path_1.default.resolve(__dirname, '../scraper/mocks/pksObject.json'), 'utf8');
        const mockDataScraped = JSON.parse(file);
        mockData = mockDataScraped.vends;
        subSet12 = mockData.filter((el) => el.refinement === '+12');
        subSet7 = mockData.filter((el) => el.refinement === '+7');
    }));
    test('checkHashInHistory', () => {
        const mockHistory = mockData;
        expect(helpers.checkHashInHistory('', mockHistory)).toBe(false);
        expect(helpers.checkHashInHistory('289467Rush200000', mockHistory)).toBe(false);
        expect(helpers.checkHashInHistory('-2894618571857?-?28946148888888', mockHistory)).toBe(true);
        expect(helpers.checkHashInHistory('+12289462127Yes300000000', mockHistory)).toBe(true);
        expect(helpers.checkHashInHistory('+12289461960Drei-Equipments400000000', mockHistory)).toBe(true);
    });
    test('checkHashInHistory With string array', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockHistory = ['+12289461960Drei-Equipments400000000', '+12289462127Yes300000000', '-2894618571857?-?28946148888888'];
        expect(helpers.checkHashInHistory('+12289462127Yes300000000', mockHistory)).toBe(true);
        expect(helpers.checkHashInHistory('+12289461960Drei-Equipments400000000', mockHistory)).toBe(true);
        expect(helpers.checkHashInHistory('289467Rush200000', mockHistory)).toBe(false);
    }));
    test('Subset', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockNewVends = mockData;
        const mockHistory = mockNewVends.slice(0, 10);
        const subSetAnswer = mockNewVends.slice(10);
        const diff = yield helpers.vendsNotInHistory(mockNewVends, mockHistory);
        expect(diff.length).toBe(3);
        expect(diff).toEqual(subSetAnswer);
    }));
    test('Subset 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockNewVends = mockData;
        const mockHistory = mockNewVends.slice(0, 12);
        const subSetAnswer = mockNewVends.slice(12);
        const diff = yield helpers.vendsNotInHistory(mockNewVends, mockHistory);
        expect(diff).toEqual(subSetAnswer);
        expect(diff.length).toBe(1);
    }));
    test('Subset 3 - vends have 1 repeated hash at array[1]', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockNewVends = mockData;
        const mockHistory = mockNewVends.slice(0, 1);
        const subSetAnswer = mockNewVends.slice(2);
        const diff = yield helpers.vendsNotInHistory(mockNewVends, mockHistory);
        expect(diff.length).toBe(11);
        expect(diff).toEqual(subSetAnswer);
    }));
    test('No history', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockNewVends = mockData;
        const mockHistory = [];
        const subSetAnswer = mockData;
        const diff = yield helpers.vendsNotInHistory(mockNewVends, mockHistory);
        expect(diff.length).toBe(13);
        expect(diff).toEqual(subSetAnswer);
    }));
});
