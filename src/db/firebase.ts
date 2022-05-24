import admin from 'firebase-admin'
import {getFirestore} from 'firebase-admin/firestore'

import firebaseCredentials from './serviceAccount.json';

const serviceAccount = firebaseCredentials as admin.ServiceAccount;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smro-marketwatch.firebaseio.com"
});

const db = getFirestore();
export default db;