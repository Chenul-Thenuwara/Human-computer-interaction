// @ts-nocheck
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { adminDb } from '../src/lib/firebase-admin';
import { furnitureLibrary } from '../src/lib/furniture-data';

const getDummyPrice = (type: string) => {
    switch (type) {
        case 'chair': return "45,000 LKR";
        case 'dining-table': return "120,000 LKR";
        case 'side-table': return "35,000 LKR";
        case 'sofa': return "185,000 LKR";
        case 'cabinet': return "95,000 LKR";
        case 'clock': return "15,000 LKR";
        case 'picture-frame': return "12,000 LKR";
        case 'fireplace': return "250,000 LKR";
        default: return "50,000 LKR";
    }
};

async function migrate() {
    console.log("Starting migration with Admin SDK...");
    const batch = adminDb.batch();

    for (const item of furnitureLibrary) {
        const id = item.name.toLowerCase().replace(/\s+/g, '-');
        const ref = adminDb.collection('furniture').doc(id);

        batch.set(ref, {
            ...item,
            price: getDummyPrice(item.type)
        });
    }

    await batch.commit();
    console.log("Migration complete!");
}

migrate().catch(console.error);
