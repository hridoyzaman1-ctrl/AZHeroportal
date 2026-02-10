
import { VaultItem, User, Category, RankingList, SiteSettings, Subscriber, UserRole } from '../types';
import { db, auth } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
  getDoc,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

const COLLECTIONS = {
  VAULT: 'vault',
  USERS: 'users',
  CATEGORIES: 'categories',
  RANKINGS: 'rankings',
  SETTINGS: 'settings',
  SUBSCRIBERS: 'subscribers'
};

export const storageService = {
  // Users
  getUsers: async (): Promise<User[]> => {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  },

  updateUserProfile: async (userId: string, data: Partial<User>) => {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, data);
  },

  // Vault Items (Articles/Trailers)
  getItems: async (): Promise<VaultItem[]> => {
    const q = query(collection(db, COLLECTIONS.VAULT), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VaultItem));
  },

  addItem: async (item: VaultItem) => {
    // Use setDoc with the item's ID so update/delete work correctly
    await setDoc(doc(db, COLLECTIONS.VAULT, item.id), item);
    return item;
  },

  updateItem: async (item: VaultItem) => {
    const { id, ...data } = item;
    const itemRef = doc(db, COLLECTIONS.VAULT, id);
    await updateDoc(itemRef, data as any);
  },

  deleteUser: async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.USERS, id));
  },

  deleteItem: async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.VAULT, id));
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const docSnapshot = await getDoc(doc(db, COLLECTIONS.CATEGORIES, 'main'));
    if (docSnapshot.exists()) {
      return docSnapshot.data().list;
    }
    return ['Movies', 'Games', 'Comics', 'DC', 'Marvel', 'Blog', 'Reviews', 'Trailers', 'Rumors', 'Indie', 'Tech'];
  },

  saveCategories: async (cats: Category[]) => {
    await setDoc(doc(db, COLLECTIONS.CATEGORIES, 'main'), { list: cats });
  },

  addCategory: async (cat: string) => {
    const cats = await storageService.getCategories();
    if (!cats.includes(cat)) {
      const updated = [...cats, cat];
      await storageService.saveCategories(updated);
      return updated;
    }
    return cats;
  },

  deleteCategory: async (cat: string) => {
    const cats = await storageService.getCategories();
    const updated = cats.filter(c => c !== cat);
    await storageService.saveCategories(updated);
    return updated;
  },

  // Settings
  getSettings: async (): Promise<SiteSettings> => {
    const docSnapshot = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'general'));
    const defaults: SiteSettings = {
      address: 'Multiverse HQ, Sector 7-G, Prime Reality Tower, New York, NY 10001',
      showAddress: true,
      contactEmail: 'uplink@heroportal.io',
      socialLinks: [
        { id: 'fb', platform: 'Facebook', url: 'https://facebook.com/heroportal', icon: 'facebook', visible: true },
        { id: 'wa', platform: 'WhatsApp', url: 'https://wa.me/heroportal', icon: 'chat', visible: true },
        { id: 'yt', platform: 'YouTube', url: 'https://youtube.com/heroportal', icon: 'play_circle', visible: true },
        { id: 'x', platform: 'X', url: 'https://x.com/heroportal', icon: 'brand_family', visible: true },
        { id: 'tk', platform: 'TikTok', url: 'https://tiktok.com/@heroportal', icon: 'music_note', visible: true }
      ],
      copyrightYear: '2026'
    };

    if (docSnapshot.exists()) {
      const data = docSnapshot.data() as SiteSettings;
      // Merge defaults with data to ensure new fields (like socialLinks) exist if missing in DB
      return {
        ...defaults,
        ...data,
        socialLinks: data.socialLinks || defaults.socialLinks
      };
    }
    return defaults;
  },

  saveSettings: async (settings: SiteSettings) => {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'general'), settings);
  },

  // Subscribers
  getSubscribers: async (): Promise<Subscriber[]> => {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.SUBSCRIBERS));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subscriber));
  },

  addSubscriber: async (email: string) => {
    const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.SUBSCRIBERS), where('email', '==', email)));
    if (querySnapshot.empty) {
      const newSub = { email, date: new Date().toLocaleDateString() };
      await addDoc(collection(db, COLLECTIONS.SUBSCRIBERS), newSub);
    }
  },

  deleteSubscriber: async (id: string) => {
    await deleteDoc(doc(db, COLLECTIONS.SUBSCRIBERS, id));
    return storageService.getSubscribers();
  },

  seedVault: async () => {
    const existing = await storageService.getItems();
    if (existing.length > 0) return;

    const BATCH = [
      {
        id: '73_1biulkYk', type: 'Trailer', title: 'Deadpool & Wolverine | Final Trailer', categories: ['Movies', 'Marvel', 'Trailers'], author: 'Marvel Studios', date: new Date().toISOString(), readTime: '3 min read', imageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=1600', thumbnailUrl: 'https://img.youtube.com/vi/73_1biulkYk/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=73_1biulkYk', content: 'The ultimate multiversal team-up. Deadpool and Wolverine unite to save the MCU. This is the official briefing for the high-octane crossover that breaks the fourth wall and the timeline. LFG.', status: 'Published', views: 980000, likes: 210000, comments: [], userRatings: [10, 10, 10], isHero: true, isScroller: true, isMainFeed: true, isMarvelTrending: true, isVideoSection: true
      },
      {
        id: 'mqqft2x_Aa4', type: 'Trailer', title: 'The Batman | Main Trailer', categories: ['Movies', 'DC', 'Trailers'], author: 'Warner Bros.', date: new Date(Date.now() - 3600000).toISOString(), readTime: '2 min read', imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1600', thumbnailUrl: 'https://img.youtube.com/vi/mqqft2x_Aa4/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4', content: 'Vengeance has arrived. Robert Pattinson stars as the Dark Knight in a gritty, detective-focused exploration of Gotham City’s deepest secrets. Witness the emergence of a new legend.', status: 'Published', views: 890000, likes: 150000, comments: [], userRatings: [10, 10, 9], isHero: true, isScroller: true, isMainFeed: true, isDCTrending: true, isVideoSection: true
      },
      {
        id: 'JfVOs4VSpmA', type: 'Trailer', title: 'Spider-Man: No Way Home | Teaser', categories: ['Movies', 'Marvel', 'Trailers'], author: 'Sony Pictures', date: new Date(Date.now() - 7200000).toISOString(), readTime: '3 min read', imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=1600', thumbnailUrl: 'https://img.youtube.com/vi/JfVOs4VSpmA/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA', content: 'The multiverse is broken. Peter Parker seeks the help of Doctor Strange to make the world forget his secret identity, only to unleash villains from across space and time.', status: 'Published', views: 2400000, likes: 450000, comments: [], userRatings: [10, 10, 10, 10], isHero: true, isMainFeed: true, isMarvelTrending: true, isVideoSection: true
      },
      {
        id: 'a-superman-legacy', type: 'Article', title: 'Superman Legacy: First Look at Corenswet in Suit', categories: ['Movies', 'DC'], author: 'James Gunn', date: new Date(Date.now() - 10800000).toISOString(), readTime: '5 min read', imageUrl: 'https://images.unsplash.com/photo-1534802046520-4f27db7f3ae5?auto=format&fit=crop&q=80&w=1600', thumbnailUrl: 'https://images.unsplash.com/photo-1534802046520-4f27db7f3ae5?auto=format&fit=crop&q=80&w=400', videoUrl: 'https://www.youtube.com/watch?v=wAOuSfpHrZw', content: 'The new Man of Steel is getting into peak Kryptonian shape. David Corenswet has been working tirelessly to embody the hope and strength of the classic Superman. This is a new beginning for the DCU.', status: 'Published', views: 45000, likes: 3400, comments: [], userRatings: [], isMainFeed: true, isDCTrending: true, isVideoSection: true
      },
      {
        id: 'kYJ7K0M9_Xg', type: 'Review', title: 'Marvel Rivals | Closed Beta Gameplay Review', categories: ['Games', 'Marvel', 'Reviews'], author: 'Gamer One', date: new Date(Date.now() - 14400000).toISOString(), readTime: '12 min read', imageUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=1600', thumbnailUrl: 'https://img.youtube.com/vi/kYJ7K0M9_Xg/maxresdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=kYJ7K0M9_Xg', content: 'NetEase Games strikes gold with Marvel Rivals. We analyze the team-up mechanics and how the environmental destruction changes the hero shooter genre. It is more than just an Overwatch clone.', status: 'Published', views: 120000, likes: 15000, comments: [], userRatings: [9, 10, 9], isMainFeed: true
      },
      {
        id: 'art-xmen-97', type: 'Article', title: 'X-Men 97: Season 2 Production Leaks', categories: ['Movies', 'Marvel'], author: 'Nexus Scout', date: new Date(Date.now() - 86400000).toISOString(), readTime: '8 min read', imageUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=1600', thumbnailUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=400', videoUrl: 'https://www.youtube.com/watch?v=u_Q1foJF5gQ', content: 'Why X-Men 97 succeeded where others failed. It respected the legacy while pushing the emotional boundaries of animated storytelling. Season 2 is reportedly already in post-production.', status: 'Published', views: 89000, likes: 6700, comments: [], userRatings: [], isMainFeed: true, isMarvelTrending: true, isVideoSection: true
      }
    ];

    for (const item of BATCH) {
      await setDoc(doc(db, COLLECTIONS.VAULT, item.id), item);
    }
  },

  approveUser: async (userId: string, role: UserRole) => {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      isApproved: true,
      isRejected: false,
      role
    });
    return storageService.getUsers();
  },

  rejectUser: async (userId: string) => {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      isApproved: false,
      isRejected: true,
      role: 'Guest'
    });
    return storageService.getUsers();
  },

  revokeUser: async (userId: string) => {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      isApproved: false,
      isRejected: false,
      role: 'Guest'
    });
    return storageService.getUsers();
  },

  // Ranking Lists
  getRankingLists: async (): Promise<RankingList[]> => {
    const q = query(collection(db, COLLECTIONS.RANKINGS));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RankingList));
  },

  saveRankingLists: async (lists: RankingList[]) => {
    // Delete all existing rankings
    const snapshot = await getDocs(collection(db, COLLECTIONS.RANKINGS));
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, COLLECTIONS.RANKINGS, docSnapshot.id));
    }
    // Add new rankings
    for (const list of lists) {
      await setDoc(doc(db, COLLECTIONS.RANKINGS, list.id), list);
    }
  }
};
