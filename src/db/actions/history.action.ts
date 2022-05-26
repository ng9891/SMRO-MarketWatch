import {VendInfo} from '../../ts/interfaces/VendInfo';
import db from '../firebase';

const historyRef = db.collection('History');
const batch = db.batch();

export const addToHistory = (vendInfo: VendInfo[]) => {
  return '';
};
