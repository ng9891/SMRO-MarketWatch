import {VendInfo} from '../../ts/interfaces/VendInfo';
import db from '../firebase';
import {getVendHash} from '../../helpers/helpers';
import {FieldValue} from 'firebase-admin/firestore';

const historyRef = db.collection('History');
const batch = db.batch();

export const addToHistory = async (vends: VendInfo[], timestamp: number) => {
  for (const vend of vends) {
    const hash = getVendHash(vend);
    batch.set(historyRef.doc(vend.itemID).collection('Hash').doc(), {...vend, hash, timestamp});
    batch.set(historyRef.doc(vend.itemID), {count: FieldValue.increment(1)}, {merge: true});
  }
  await batch.commit();
};
