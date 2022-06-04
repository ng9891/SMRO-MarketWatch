import {VendInfo} from '../../ts/interfaces/VendInfo';
import db from '../firebase';
import {FieldValue} from 'firebase-admin/firestore';
import {calculateVendHash} from '../../helpers/helpers';
import getUnixTime from 'date-fns/getUnixTime';
import {ServerName} from '../../ts/types/ServerName';

const historyRef = db.collection('History');

export const addToHistory = async (vends: VendInfo[], timestamp: number, server: ServerName) => {
  if (vends.length === 0) return;
  const batch = db.batch();
  for (const vend of vends) {
    const hash = vend?.hash ? vend.hash : calculateVendHash(vend);
    batch.set(historyRef.doc(vend.itemID).collection(server).doc(), {...vend, hash, timestamp, server});
    batch.set(historyRef.doc(vend.itemID), {[server + 'count']: FieldValue.increment(1)}, {merge: true});
  }
  const {itemID} = vends[0];
  batch.set(historyRef.doc(itemID), {[server + 'lastUpdated']: timestamp}, {merge: true});
  await batch.commit();
};

export const getHistory = async (itemID: string, fromDate: Date | number, server: ServerName) => {
  const from = fromDate instanceof Date ? getUnixTime(fromDate) : fromDate;
  const foundVends = await historyRef.doc(itemID).collection(server).where('timestamp', '>', from).get();
  return foundVends.empty ? null : foundVends.docs.map((snap) => snap.data() as VendInfo);
};

export const getHistoryStats = async (itemID: string) => {
  const stats = await historyRef.doc(itemID).get();
  return stats.exists ? stats.data() : null;
};
