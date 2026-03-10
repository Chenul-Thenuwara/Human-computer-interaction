require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkImages() {
    const snapshot = await getDocs(collection(db, 'furniture'));
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    console.log(`Found ${items.length} furniture items:`);
    let deletedCount = 0;

    for (const item of items) {
        // Check if image URL is missing, invalid, or looks like the corrupted ones
        if (!item.imageUrl || item.imageUrl.includes('undefined') || !item.imageUrl.startsWith('https://')) {
            console.log(`\nDeleting broken item: ID=${item.id}, Name=${item.name}`);
            await deleteDoc(doc(db, 'furniture', item.id));
            deletedCount++;
        } else {
            console.log(`Keeping valid item: ID=${item.id}, Name=${item.name}`);
        }
    }

    console.log(`\nDeleted ${deletedCount} broken items.`);
    process.exit(0);
}

checkImages().catch(console.error);
