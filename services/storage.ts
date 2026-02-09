
import { VaultItem, User, Category, RankingList, SiteSettings, Subscriber, UserRole } from '../types';

const KEYS = {
  VAULT: 'hero_portal_vault_v31',
  USERS: 'hero_portal_users_v31',
  CATEGORIES: 'hero_portal_categories_v31',
  RANKINGS: 'hero_portal_rankings_v31',
  SETTINGS: 'hero_portal_settings_v31',
  SUBSCRIBERS: 'hero_portal_subscribers_v31'
};

const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  name: 'Master Admin',
  email: 'hridoyzaman1@gmail.com',
  password: 'Youknowwho1',
  role: 'Admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  joinedDate: '2024-01-01',
  isVerified: true,
  isApproved: true,
  isRejected: false
};

const INITIAL_VAULT: VaultItem[] = [
  {
    id: '73_1biulkYk',
    type: 'Trailer',
    title: 'Deadpool & Wolverine | Final Trailer',
    categories: ['Movies', 'Marvel', 'Trailers'],
    author: 'Marvel Studios',
    date: new Date().toISOString(),
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://img.youtube.com/vi/73_1biulkYk/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    content: 'The ultimate multiversal team-up. Deadpool and Wolverine unite to save the MCU. This is the official briefing for the high-octane crossover that breaks the fourth wall and the timeline. LFG.',
    status: 'Published', views: 980000, likes: 210000, comments: [], userRatings: [10, 10, 10],
    isHero: true, isScroller: true, isMainFeed: true, isMarvelTrending: true, isVideoSection: true
  },
  {
    id: 'mqqft2x_Aa4',
    type: 'Trailer',
    title: 'The Batman | Main Trailer',
    categories: ['Movies', 'DC', 'Trailers'],
    author: 'Warner Bros.',
    date: new Date(Date.now() - 3600000).toISOString(),
    readTime: '2 min read',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://img.youtube.com/vi/mqqft2x_Aa4/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
    content: 'Vengeance has arrived. Robert Pattinson stars as the Dark Knight in a gritty, detective-focused exploration of Gotham City’s deepest secrets. Witness the emergence of a new legend.',
    status: 'Published', views: 890000, likes: 150000, comments: [], userRatings: [10, 10, 9],
    isHero: true, isScroller: true, isMainFeed: true, isDCTrending: true, isVideoSection: true
  },
  {
    id: 'JfVOs4VSpmA',
    type: 'Trailer',
    title: 'Spider-Man: No Way Home | Teaser',
    categories: ['Movies', 'Marvel', 'Trailers'],
    author: 'Sony Pictures',
    date: new Date(Date.now() - 7200000).toISOString(),
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://img.youtube.com/vi/JfVOs4VSpmA/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    content: 'The multiverse is broken. Peter Parker seeks the help of Doctor Strange to make the world forget his secret identity, only to unleash villains from across space and time.',
    status: 'Published', views: 2400000, likes: 450000, comments: [], userRatings: [10, 10, 10, 10],
    isHero: true, isMainFeed: true, isMarvelTrending: true, isVideoSection: true
  },
  {
    id: 'a-superman-legacy',
    type: 'Article',
    title: 'Superman Legacy: First Look at Corenswet in Suit',
    categories: ['Movies', 'DC'],
    author: 'James Gunn',
    date: new Date(Date.now() - 10800000).toISOString(),
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1534802046520-4f27db7f3ae5?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534802046520-4f27db7f3ae5?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://www.youtube.com/watch?v=wAOuSfpHrZw',
    content: 'The new Man of Steel is getting into peak Kryptonian shape. David Corenswet has been working tirelessly to embody the hope and strength of the classic Superman. This is a new beginning for the DCU.',
    status: 'Published', views: 45000, likes: 3400, comments: [], userRatings: [],
    isMainFeed: true, isDCTrending: true, isVideoSection: true
  },
  {
    id: 'kYJ7K0M9_Xg',
    type: 'Review',
    title: 'Marvel Rivals | Closed Beta Gameplay Review',
    categories: ['Games', 'Marvel', 'Reviews'],
    author: 'Gamer One',
    date: new Date(Date.now() - 14400000).toISOString(),
    readTime: '12 min read',
    imageUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://img.youtube.com/vi/kYJ7K0M9_Xg/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=kYJ7K0M9_Xg',
    content: 'NetEase Games strikes gold with Marvel Rivals. We analyze the team-up mechanics and how the environmental destruction changes the hero shooter genre. It is more than just an Overwatch clone.',
    status: 'Published', views: 120000, likes: 15000, comments: [], userRatings: [9, 10, 9],
    isMainFeed: true
  },
  {
    id: 'art-xmen-97',
    type: 'Article',
    title: 'X-Men 97: Season 2 Production Leaks',
    categories: ['Movies', 'Marvel'],
    author: 'Nexus Scout',
    date: new Date(Date.now() - 86400000).toISOString(),
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://www.youtube.com/watch?v=u_Q1foJF5gQ',
    content: 'Why X-Men 97 succeeded where others failed. It respected the legacy while pushing the emotional boundaries of animated storytelling. Season 2 is reportedly already in post-production.',
    status: 'Published', views: 89000, likes: 6700, comments: [], userRatings: [],
    isMainFeed: true, isMarvelTrending: true, isVideoSection: true
  },
  {
    id: 'art-joker-2',
    type: 'Review',
    title: 'Joker 2: Folie à Deux Verdict',
    categories: ['Movies', 'DC', 'Reviews'],
    author: 'Arkham Guard',
    date: new Date(Date.now() - 172800000).toISOString(),
    readTime: '15 min read',
    imageUrl: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&q=80&w=400',
    content: 'A musical odyssey into madness. Joaquin Phoenix and Lady Gaga deliver performances that are bound to be controversial. Read our full verdict on this polarizing sequel that breaks all expectations.',
    rating: '7.8', status: 'Published', views: 150000, likes: 20000, comments: [], userRatings: [7, 8, 7],
    isMainFeed: true, isDCTrending: true
  },
  {
    id: 'ZYzbalQ6L28',
    type: 'Trailer',
    title: 'Spider-Man: No Way Home | Final Trailer',
    categories: ['Movies', 'Marvel', 'Trailers'],
    author: 'Sony Pictures',
    date: new Date(Date.now() - 259200000).toISOString(),
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://img.youtube.com/vi/ZYzbalQ6L28/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=ZYzbalQ6L28',
    content: 'The villains of the past return. Experience the final briefing before the multiversal event of the century crashes into reality. This is the Spider-Man movie we have been waiting for.',
    status: 'Published', views: 3200000, likes: 750000, comments: [], userRatings: [10, 10, 10],
    isHero: false, isMainFeed: true, isVideoSection: true
  },
  {
    id: 'art-marvel-villains',
    type: 'Blog',
    title: 'Top 5 Marvel Villains We Still Need to See',
    categories: ['Blog', 'Marvel'],
    author: 'The Watcher',
    date: new Date(Date.now() - 345600000).toISOString(),
    readTime: '10 min read',
    imageUrl: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://www.youtube.com/watch?v=aWzlQ2N6qqg',
    content: 'From Galactus to Dr. Doom, these are the heavy hitters that need to debut in the MCU’s upcoming phases to keep the stakes at an all-time high. We look at the comic history of these cosmic threats.',
    status: 'Published', views: 34000, likes: 4500, comments: [], userRatings: [],
    isMainFeed: true, isVideoSection: true
  },
  {
    id: 'art-daredevil-leaks',
    type: 'Article',
    title: 'Daredevil: Born Again - Street Level Chaos',
    categories: ['Movies', 'Marvel'],
    author: 'Hell’s Kitchen',
    date: new Date(Date.now() - 432000000).toISOString(),
    readTime: '7 min read',
    imageUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://www.youtube.com/watch?v=lmv1PYIarsg',
    content: 'The Devil of Hell’s Kitchen returns. After a creative overhaul, the series is moving in a darker, more street-level direction that fans have been begging for since the Netflix days.',
    status: 'Published', views: 110000, likes: 23000, comments: [], userRatings: [10, 9, 10],
    isMainFeed: true, isMarvelTrending: true, isVideoSection: true
  },
  {
    id: 'pv3Ss8o94GQ',
    type: 'Trailer',
    title: 'Marvel Rivals | Official Reveal Trailer',
    categories: ['Games', 'Marvel', 'Trailers'],
    author: 'NetEase Games',
    date: new Date(Date.now() - 518400000).toISOString(),
    readTime: '2 min read',
    imageUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://img.youtube.com/vi/pv3Ss8o94GQ/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=pv3Ss8o94GQ',
    content: 'A new hero shooter is here. Assemble your team of Marvel Super Heroes and Super Villains to battle across iconic maps in this team-up driven 6v6 shooter.',
    status: 'Published', views: 670000, likes: 54000, comments: [], userRatings: [],
    isMainFeed: true, isVideoSection: true
  },
  {
    id: 'art-the-boys-s5',
    type: 'Article',
    title: 'The Boys Season 5: The Final Showdown Begins',
    categories: ['Indie', 'Blog'],
    author: 'Butcher',
    date: new Date(Date.now() - 604800000).toISOString(),
    readTime: '10 min read',
    imageUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://www.youtube.com/watch?v=5SKP1_F7ReE',
    content: 'The final showdown is coming. We analyze the explosive season 4 finale and what it means for the ultimate fate of Homelander and the crew. Diabolical.',
    status: 'Published', views: 98000, likes: 12000, comments: [], userRatings: [],
    isMainFeed: true, isVideoSection: true
  },
  {
    id: 'art-wolverine-legacy',
    type: 'Article',
    title: 'Wolverine: Tracing the Legacy of the Claw',
    categories: ['Comics', 'Marvel'],
    author: 'Logan',
    date: new Date(Date.now() - 691200000).toISOString(),
    readTime: '15 min read',
    imageUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
    content: 'Tracing the history of the world’s most famous mutant from his first appearance in Hulk #181 to the present day in the MCU. He is the best there is at what he does.',
    status: 'Published', views: 12000, likes: 2100, comments: [], userRatings: [],
    isMainFeed: true, isVideoSection: true
  },
  {
    id: '_OKAwz2uxFE',
    type: 'Trailer',
    title: 'Joker: Folie à Deux | Teaser Trailer',
    categories: ['Movies', 'DC', 'Trailers'],
    author: 'Warner Bros.',
    date: new Date(Date.now() - 777600000).toISOString(),
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1509333945802-7663ced29942?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://img.youtube.com/vi/_OKAwz2uxFE/maxresdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=_OKAwz2uxFE',
    content: 'Experience the first briefing for the descent into musical madness at Arkham State Hospital. Todd Phillips and Joaquin Phoenix return for another masterpiece.',
    status: 'Published', views: 1200000, likes: 300000, comments: [], userRatings: [10, 10, 10],
    isMainFeed: true, isVideoSection: true, isDCTrending: true
  },
  {
    id: 'art-rivals-meta',
    type: 'Blog',
    title: 'Why Marvel Rivals is a Game Changer',
    categories: ['Blog', 'Games', 'Marvel'],
    author: 'Nexus Scout',
    date: new Date(Date.now() - 864000000).toISOString(),
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://www.youtube.com/watch?v=pv3Ss8o94GQ',
    content: 'Deep dive into how team-up mechanics are fundamentally shifting the meta of modern hero shooters. We look at the best character synergies in the current build.',
    status: 'Published', views: 15000, likes: 800, comments: [], userRatings: [],
    isMainFeed: true, isVideoSection: true
  },
  {
    id: 'art-sandman-s2',
    type: 'Article',
    title: 'The Sandman Season 2: Production Update',
    categories: ['Movies', 'Indie'],
    author: 'Dreamer',
    date: new Date(Date.now() - 950400000).toISOString(),
    readTime: '9 min read',
    imageUrl: 'https://images.unsplash.com/photo-1509333945802-7663ced29942?auto=format&fit=crop&q=80&w=1600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509333945802-7663ced29942?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://www.youtube.com/watch?v=VKvAZvGlTnQ',
    content: 'Neil Gaiman’s masterpiece continues. We get our first glimpse of the youngest of the Endless in the highly anticipated second season. The Dreaming is expanding.',
    status: 'Published', views: 28000, likes: 2200, comments: [], userRatings: [],
    isMainFeed: true, isVideoSection: true
  }
];

export const storageService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    const users: User[] = data ? JSON.parse(data) : [DEFAULT_ADMIN];
    if (!users.find(u => u.email === DEFAULT_ADMIN.email)) {
      users.push(DEFAULT_ADMIN);
      storageService.saveUsers(users);
    }
    return users;
  },
  saveUsers: (users: User[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),
  registerUser: (userData: Partial<User>): User => {
    const users = storageService.getUsers();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      password: userData.password || '',
      address: userData.address || '',
      mobile: userData.mobile || '',
      role: 'Guest',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
      joinedDate: new Date().toLocaleDateString(),
      isVerified: false,
      isApproved: false,
      isRejected: false,
      verificationCode
    };
    storageService.saveUsers([...users, newUser]);
    alert(`VERIFICATION CODE: ${verificationCode}`);
    return newUser;
  },
  verifyCode: (email: string, code: string): { success: boolean, user?: User } => {
    const users = storageService.getUsers();
    const userIndex = users.findIndex(u => u.email === email && u.verificationCode === code);
    if (userIndex !== -1) {
      users[userIndex].isVerified = true;
      delete users[userIndex].verificationCode;
      storageService.saveUsers(users);
      return { success: true, user: users[userIndex] };
    }
    return { success: false };
  },
  approveUser: (userId: string, role: UserRole): User[] => {
    const users = storageService.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, isApproved: true, isRejected: false, role } : u);
    storageService.saveUsers(updated);
    return updated;
  },
  rejectUser: (userId: string): User[] => {
    const users = storageService.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, isApproved: false, isRejected: true } : u);
    storageService.saveUsers(updated);
    return updated;
  },
  revokeUser: (userId: string): User[] => {
    const users = storageService.getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, isApproved: false, role: 'Guest' as UserRole } : u);
    storageService.saveUsers(updated);
    return updated;
  },
  getItems: (): VaultItem[] => {
    const data = localStorage.getItem(KEYS.VAULT);
    if (!data) {
      storageService.saveItems(INITIAL_VAULT);
      return INITIAL_VAULT;
    }
    return JSON.parse(data);
  },
  saveItems: (items: VaultItem[]) => localStorage.setItem(KEYS.VAULT, JSON.stringify(items)),
  addItem: (item: VaultItem) => {
    const items = storageService.getItems();
    const updated = [item, ...items];
    storageService.saveItems(updated);
    return updated;
  },
  updateItem: (item: VaultItem) => {
    const items = storageService.getItems();
    const updated = items.map(i => i.id === item.id ? item : i);
    storageService.saveItems(updated);
    return updated;
  },
  deleteItem: (id: string) => {
    const items = storageService.getItems();
    const updated = items.filter(u => u.id !== id);
    storageService.saveItems(updated);
    return updated;
  },
  getCategories: (): Category[] => {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    return data ? JSON.parse(data) : ['Movies', 'Games', 'Comics', 'DC', 'Marvel', 'Blog', 'Reviews', 'Trailers', 'Rumors', 'Indie', 'Tech'];
  },
  saveCategories: (cats: Category[]) => localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats)),
  addCategory: (cat: string) => {
    const cats = storageService.getCategories();
    if (!cats.includes(cat)) {
      const updated = [...cats, cat];
      storageService.saveCategories(updated);
      return updated;
    }
    return cats;
  },
  deleteCategory: (cat: string) => {
    const updated = storageService.getCategories().filter(c => c !== cat);
    storageService.saveCategories(updated);
    return updated;
  },
  getRankingLists: (): RankingList[] => {
    const data = localStorage.getItem(KEYS.RANKINGS);
    return data ? JSON.parse(data) : [];
  },
  saveRankingLists: (lists: RankingList[]) => localStorage.setItem(KEYS.RANKINGS, JSON.stringify(lists)),
  getSettings: (): SiteSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      address: 'Multiverse HQ, Sector 7-G, Prime Reality Tower, New York, NY 10001',
      contactEmail: 'uplink@heroportal.io',
      socialLinks: [
        { id: '1', platform: 'X', url: 'https://x.com/heroportal', icon: 'brand_family' },
        { id: '2', platform: 'YouTube', url: 'https://youtube.com/heroportal', icon: 'play_circle' },
        { id: '3', platform: 'Instagram', url: 'https://instagram.com/heroportal', icon: 'photo_camera' },
        { id: '4', platform: 'Discord', url: 'https://discord.gg/heroportal', icon: 'forum' }
      ]
    };
  },
  saveSettings: (settings: SiteSettings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)),
  getSubscribers: (): Subscriber[] => {
    const data = localStorage.getItem(KEYS.SUBSCRIBERS);
    return data ? JSON.parse(data) : [];
  },
  addSubscriber: (email: string) => {
    const subs = storageService.getSubscribers();
    if (!subs.find(s => s.email === email)) {
      const newSub: Subscriber = { id: Date.now().toString(), email, date: new Date().toLocaleDateString() };
      const updated = [newSub, ...subs];
      localStorage.setItem(KEYS.SUBSCRIBERS, JSON.stringify(updated));
      return updated;
    }
    return subs;
  },
  deleteSubscriber: (id: string) => {
    const subs = storageService.getSubscribers().filter(s => s.id !== id);
    localStorage.setItem(KEYS.SUBSCRIBERS, JSON.stringify(subs));
    return subs;
  }
};
