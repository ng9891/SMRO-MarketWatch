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
exports.getSubs = exports.unSub = exports.addSub = exports.updateWatchLists = exports.createNewWatchList = exports.getActiveWatchLists = exports.getWatchListInfo = void 0;
const firebase_1 = __importDefault(require("../firebase"));
const firestore_1 = require("firebase-admin/firestore");
const date_fns_1 = require("date-fns");
const helpers_1 = require("../../helpers/helpers");
const watchlistRef = firebase_1.default.collection('Watchlist');
const getWatchListInfo = (itemID, server) => __awaiter(void 0, void 0, void 0, function* () {
    const snap = yield watchlistRef.doc(server + itemID).get();
    return snap.exists ? snap.data() : null;
});
exports.getWatchListInfo = getWatchListInfo;
const getActiveWatchLists = (subs = 1) => __awaiter(void 0, void 0, void 0, function* () {
    const snap = yield watchlistRef.where('subs', '>=', subs).get();
    return snap;
});
exports.getActiveWatchLists = getActiveWatchLists;
const createNewWatchList = (recurrence, user, scrape) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemID, name: itemName, timestamp, server } = scrape;
    const { userID, userName } = user;
    const now = (0, date_fns_1.fromUnixTime)(timestamp);
    const nextOn = (0, date_fns_1.getUnixTime)((0, date_fns_1.add)(now, { minutes: recurrence }));
    const setOn = (0, date_fns_1.getUnixTime)(now);
    const wl = {
        recurrence,
        itemID,
        itemName,
        setOn,
        nextOn,
        setByID: userID,
        setByName: userName,
        createdOn: timestamp,
        subs: 0,
        server,
    };
    yield watchlistRef.doc(server + itemID).set(wl, { merge: true });
    return wl;
});
exports.createNewWatchList = createNewWatchList;
const updateWatchLists = (list) => __awaiter(void 0, void 0, void 0, function* () {
    const batch = firebase_1.default.batch();
    const newList = list.map((wl) => {
        const { itemID, recurrence, setByID, setByName, setOn, server } = wl;
        const now = new Date();
        const nextOn = (0, date_fns_1.getUnixTime)((0, helpers_1.calculateNextExec)(setOn, now, recurrence));
        const update = { recurrence, setByID, setByName, nextOn, setOn };
        batch.update(watchlistRef.doc(server + itemID), update);
        return Object.assign(wl, update);
    });
    yield batch.commit();
    return newList;
});
exports.updateWatchLists = updateWatchLists;
const addSub = (list) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemID, userID, server } = list;
    const subsRef = watchlistRef.doc(server + itemID).collection('Subs');
    const snap = yield subsRef.doc(userID).get();
    let newSub = false;
    if (!snap.exists) {
        yield watchlistRef.doc(server + itemID).set({ subs: firestore_1.FieldValue.increment(1) }, { merge: true });
        newSub = true;
    }
    yield watchlistRef.doc(server + itemID).set({ lastSubChangeOn: (0, date_fns_1.getUnixTime)(new Date()) }, { merge: true });
    yield subsRef.doc(userID).set(Object.assign({}, list));
    return newSub;
});
exports.addSub = addSub;
const unSub = (itemID, userID, server) => __awaiter(void 0, void 0, void 0, function* () {
    yield watchlistRef
        .doc(server + itemID)
        .collection('Subs')
        .doc(userID)
        .delete();
    yield watchlistRef.doc(server + itemID).set({ lastSubChangeOn: (0, date_fns_1.getUnixTime)(new Date()) }, { merge: true });
    yield watchlistRef.doc(server + itemID).set({ subs: firestore_1.FieldValue.increment(-1) }, { merge: true });
});
exports.unSub = unSub;
const getSubs = (itemID, server) => __awaiter(void 0, void 0, void 0, function* () {
    const snap = yield watchlistRef
        .doc(server + itemID)
        .collection('Subs')
        .get();
    return snap.empty ? null : snap.docs.map((snapUser) => snapUser.data());
});
exports.getSubs = getSubs;
