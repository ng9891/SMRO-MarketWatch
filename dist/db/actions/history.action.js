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
exports.getHistoryStats = exports.getHistory = exports.addToHistory = void 0;
const firebase_1 = __importDefault(require("../firebase"));
const firestore_1 = require("firebase-admin/firestore");
const getUnixTime_1 = __importDefault(require("date-fns/getUnixTime"));
const historyRef = firebase_1.default.collection('History');
const addToHistory = (vends, timestamp, server) => __awaiter(void 0, void 0, void 0, function* () {
    if (vends.length === 0)
        return;
    const batch = firebase_1.default.batch();
    for (const vend of vends) {
        batch.set(historyRef.doc(vend.itemID).collection(server).doc(), Object.assign(Object.assign({}, vend), { server }));
        batch.set(historyRef.doc(vend.itemID), { [server + 'count']: firestore_1.FieldValue.increment(1) }, { merge: true });
    }
    const { itemID } = vends[0];
    batch.set(historyRef.doc(itemID), { [server + 'lastUpdated']: timestamp }, { merge: true });
    yield batch.commit();
});
exports.addToHistory = addToHistory;
const getHistory = (itemID, fromDate, server) => __awaiter(void 0, void 0, void 0, function* () {
    const from = fromDate instanceof Date ? (0, getUnixTime_1.default)(fromDate) : fromDate;
    const foundVends = yield historyRef.doc(itemID).collection(server).where('timestamp', '>', from).get();
    return foundVends.empty ? null : foundVends.docs.map((snap) => snap.data());
});
exports.getHistory = getHistory;
const getHistoryStats = (itemID) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield historyRef.doc(itemID).get();
    return stats.exists ? stats.data() : null;
});
exports.getHistoryStats = getHistoryStats;
