// Delete the two "THE WORLD ENDS" articles
import { db } from './services/firebase';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

async function cleanupItems() {
    const vaultRef = collection(db, 'vault');
    const q = query(vaultRef, where('title', '==', 'THE WORLD ENDS'));
    const snapshot = await getDocs(q);

    console.log(`Found ${snapshot.size} items with title "THE WORLD ENDS"`);

    for (const docSnapshot of snapshot.docs) {
        console.log(`Deleting: ${docSnapshot.id} - ${docSnapshot.data().title}`);
        await deleteDoc(doc(db, 'vault', docSnapshot.id));
        console.log(`✅ Deleted ${docSnapshot.id}`);
    }

    console.log('✅ Cleanup complete!');
}

cleanupItems().catch(console.error);
