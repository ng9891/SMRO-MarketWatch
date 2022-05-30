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
exports.getSubs = exports.unSub = exports.addSub = exports.updateWatchList = exports.createNewWatchList = exports.getWatchListInfo = void 0;
const firebase_1 = __importDefault(require("../firebase"));
const firestore_1 = require("firebase-admin/firestore");
const date_fns_1 = require("date-fns");
const helpers_1 = require("../../helpers/helpers");
const watchlistRef = firebase_1.default.collection('Watchlist');
const getWatchListInfo = (itemID) => __awaiter(void 0, void 0, void 0, function* () {
    const snap = yield watchlistRef.doc(itemID).get();
    if (!snap.exists)
        return null;
    return snap.data();
});
exports.getWatchListInfo = getWatchListInfo;
const createNewWatchList = (recurrence, user, scrape) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemID, name: itemName, timestamp } = scrape;
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
    };
    yield watchlistRef.doc(itemID).set(wl, { merge: true });
    return wl;
});
exports.createNewWatchList = createNewWatchList;
const updateWatchList = (wl) => __awaiter(void 0, void 0, void 0, function* () {
    const { recurrence, setByID, setByName, setOn } = wl;
    const now = new Date();
    const nextOn = (0, date_fns_1.getUnixTime)((0, helpers_1.calculateNextExec)(setOn, now, recurrence));
    const update = { recurrence, setByID, setByName, nextOn, setOn };
    yield watchlistRef.doc(wl.itemID).update(update);
    return Object.assign(wl, update);
});
exports.updateWatchList = updateWatchList;
const addSub = (list) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemID, userID } = list;
    const subsRef = watchlistRef.doc(itemID).collection('Subs');
    const snap = yield subsRef.doc(userID).get();
    let newSub = false;
    if (!snap.exists) {
        yield watchlistRef.doc(itemID).set({ subs: firestore_1.FieldValue.increment(1) }, { merge: true });
        newSub = true;
    }
    yield subsRef.doc(userID).set(Object.assign({}, list));
    return newSub;
});
exports.addSub = addSub;
const unSub = (itemID, userID) => __awaiter(void 0, void 0, void 0, function* () {
    yield watchlistRef.doc(itemID).collection('Subs').doc(userID).delete();
    const snap = yield watchlistRef.doc(itemID).get();
    if (snap.exists) {
        const data = snap.data();
        if (data && data.subs > 0)
            yield watchlistRef.doc(itemID).set({ subs: firestore_1.FieldValue.increment(-1) }, { merge: true });
    }
    else {
        console.error('Unsubscribing a user not subscribed to:' + itemID);
    }
});
exports.unSub = unSub;
const getSubs = (itemID) => __awaiter(void 0, void 0, void 0, function* () {
    const snap = yield watchlistRef.doc(itemID).collection('Subs').get();
    if (snap.empty)
        return null;
    return snap;
});
exports.getSubs = getSubs;
