// Force approve hridoyzaman1@gmail.com in Firestore
import { db } from './services/firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

async function forceApproveAdmin() {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'hridoyzaman1@gmail.com'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        console.log('User not found, checking all users...');
        const allUsers = await getDocs(usersRef);
        allUsers.forEach(doc => {
            console.log(doc.id, doc.data().email);
        });
        return;
    }

    snapshot.forEach(async (userDoc) => {
        console.log('Found user:', userDoc.id, userDoc.data());
        await updateDoc(doc(db, 'users', userDoc.id), {
            isApproved: true,
            role: 'Admin',
            isRejected: false,
            isVerified: true
        });
        console.log('✅ DONE! User approved as Admin');
    });
}

forceApproveAdmin();
