import { db } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { furnitureLibrary } from './furniture-data';
import { FurnitureItem } from './design-context';

export async function fetchFurnitureFromDB(): Promise<FurnitureItem[]> {
    const querySnapshot = await getDocs(collection(db, 'furniture'));
    const items: FurnitureItem[] = [];
    querySnapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as FurnitureItem);
    });
    return items;
}

export async function migrateFurnitureToDB() {
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

    const batch = [];

    // furnitureLibrary contains all standard and wall items as it was pushed at the bottom of the file
    for (const item of furnitureLibrary) {
        // Create an ID from the name
        const id = item.name.toLowerCase().replace(/\s+/g, '-');
        const ref = doc(db, 'furniture', id);

        batch.push(setDoc(ref, {
            ...item,
            price: getDummyPrice(item.type)
        }));
    }

    await Promise.all(batch);
    console.log("Furniture migrated successfully!");
}
