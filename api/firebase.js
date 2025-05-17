const admin = require('firebase-admin');

function initializeFirebase() {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    }

    const db = admin.firestore();
    const auth = admin.auth();
    const storage = admin.storage();

    return { admin, db, auth, storage };
}

module.exports = { initializeFirebase };