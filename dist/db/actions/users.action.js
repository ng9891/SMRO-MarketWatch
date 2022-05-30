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
exports.setUserInfo = exports.getUserInfo = void 0;
const firebase_1 = __importDefault(require("../firebase"));
const getUnixTime_1 = __importDefault(require("date-fns/getUnixTime"));
const usersRef = firebase_1.default.collection('User');
const getUserInfo = (userID, userName, discriminator) => __awaiter(void 0, void 0, void 0, function* () {
    const snap = yield usersRef.doc(userID).get();
    if (!snap.exists) {
        const timestamp = (0, getUnixTime_1.default)(new Date());
        const newUser = { userID, userName, discriminator, listSize: 0, list: {}, timestamp };
        yield usersRef.doc(userID).set(newUser);
        return newUser;
    }
    return snap.data();
});
exports.getUserInfo = getUserInfo;
const setUserInfo = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID, userName, list } = user;
    const newList = list ? list : {};
    const listSize = Object.keys(newList).length;
    yield usersRef.doc(userID).set({ userID, userName, list: Object.assign({}, newList), listSize });
    return Object.assign(Object.assign({}, user), { listSize });
});
exports.setUserInfo = setUserInfo;
