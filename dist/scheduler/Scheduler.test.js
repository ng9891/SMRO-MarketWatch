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
const Scheduler_1 = __importDefault(require("./Scheduler"));
const addMinutes_1 = __importDefault(require("date-fns/addMinutes"));
const subMinutes_1 = __importDefault(require("date-fns/subMinutes"));
const getUnixTime_1 = __importDefault(require("date-fns/getUnixTime"));
const fromUnixTime_1 = __importDefault(require("date-fns/fromUnixTime"));
const mock = function (wl) {
    return __awaiter(this, void 0, void 0, function* () {
        const { itemID, recurrence, nextOn, setOn } = wl;
        const date = (0, getUnixTime_1.default)(new Date());
        console.log(`Ran!. On: ${(0, fromUnixTime_1.default)(date)}`);
        return wl;
    });
};
const fakeWL = {
    itemID: '6635',
    itemName: 'BSB',
    recurrence: 30,
    setByID: '123',
    setByName: 'vT',
    setOn: (0, getUnixTime_1.default)(new Date()),
    nextOn: (0, getUnixTime_1.default)((0, addMinutes_1.default)(new Date(), 30)),
    createdOn: (0, getUnixTime_1.default)((0, subMinutes_1.default)(new Date(), 5 * 1440)),
    subs: 1,
    server: 'HEL'
};
describe.skip('Testing Scheduler', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.clearAllTimers();
    });
    test('Called once in 59min with 30min reccurence', () => {
        const callbackMock = jest.fn(mock);
        Scheduler_1.default.createJob(fakeWL, callbackMock);
        expect(callbackMock).not.toBeCalled();
        jest.advanceTimersByTime(30 * 60000);
        expect(callbackMock).toBeCalled();
        expect(callbackMock).toHaveBeenCalledTimes(1);
    });
    test.skip('Called twice in 1hr with 30min reccurence', () => {
        const callbackMock = jest.fn(mock);
        Scheduler_1.default.createJob(fakeWL, callbackMock);
        expect(callbackMock).not.toBeCalled();
        jest.advanceTimersByTime(30 * 60000);
        expect(callbackMock).toBeCalled();
        expect(callbackMock).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(35 * 60000);
        expect(callbackMock).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(35 * 60000);
    });
});
