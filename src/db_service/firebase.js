const admin = require('firebase-admin');
const serviceAccount = require(path.join(process.cwd(), 'conf/smro-marketwatch-firebase-adminsdk-ni65j-dee04f4b28.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = {
  db: db,
  admin: admin,
};