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
    batch.set(historyRef.doc(vend.itemID), {count: FieldValue.increment(1)}, {merge: true});
  }
  await batch.commit();
};

export const getHistory = async (itemID: string, fromDate: Date, server: ServerName) => {
  const from = getUnixTime(fromDate);
  const foundVends = await historyRef.doc(itemID).collection(server).where('timestamp', '>=', from).get();
  if (foundVends.empty) return null;
  return foundVends;
};

const checkHistory = async (hash: string[], fromDate: Date, server: ServerName) => {
  if (hash.length > 10) throw new Error('Hash list is greater than 10 in checkHistory');
  const from = getUnixTime(fromDate);
  const foundVends = await historyRef
    .where('server', '==', server)
    .where('timestamp', '>=', from)
    .where('hash', 'in', hash)
    .get();
  if (foundVends.empty) return null;
  return foundVends;
};
