import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useContent } from '../App';
import { storage, db } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const AdminProfile: React.FC = () => {
    const { currentUser, login } = useContent();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        dob: '',
        address: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                mobile: currentUser.mobile || '',
                dob: currentUser.dob || '',
                address: currentUser.address || ''
            });
        }
    }, [currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setLoading(true);
        setMessage('');

        try {
            const userRef = doc(db, 'users', currentUser.id);
            await updateDoc(userRef, {
                name: formData.name,
                mobile: formData.mobile,
                dob: formData.dob,
                address: formData.address
            });

            // Update local context
            login({ ...currentUser, ...formData });
            setMessage('Profile updated successfully.');
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!currentUser || !e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);
        setMessage('');

        try {
            const storageRef = ref(storage, `profile_images/${currentUser.id}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            const userRef = doc(db, 'users', currentUser.id);
            await updateDoc(userRef, { avatar: downloadURL });

            login({ ...currentUser, avatar: downloadURL });
            setMessage('Profile picture updated.');
        } catch (error) {
            console.error('Error uploading image:', error);
            setMessage('Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!currentUser) return;
        if (!window.confirm('Are you sure you want to remove your profile picture?')) return;

        setUploading(true);
        setMessage('');

        try {
            // Create a default avatar URL
            const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`;

            // Try to delete from storage if it exists (ignoring error if it doesn't)
            const storageRef = ref(storage, `profile_images/${currentUser.id}`);
            try {
                await deleteObject(storageRef);
            } catch (err) {
                // Ignore if object not found
            }

            const userRef = doc(db, 'users', currentUser.id);
            await updateDoc(userRef, { avatar: defaultAvatar });

            login({ ...currentUser, avatar: defaultAvatar });
            setMessage('Profile picture removed.');
        } catch (error) {
            console.error('Error removing image:', error);
            setMessage('Failed to remove image.');
        } finally {
            setUploading(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-display">
            <aside className="w-72 bg-[#0c0c0c] border-r border-white/5 flex flex-col shrink-0">
                <div className="p-10 border-b border-white/5">
                    <Link to="/" className="text-2xl font-black italic tracking-tighter text-primary-red flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl animate-boltFlash">bolt</span> COMMAND
                    </Link>
                </div>
                <nav className="flex-1 p-8 space-y-4">
                    <Link to="/admin" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5">
                        <span className="material-symbols-outlined">grid_view</span>
                        <span className="font-bold text-[11px] uppercase tracking-widest">Dashboard</span>
                    </Link>
                    <Link to="/admin/content" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5">
                        <span className="material-symbols-outlined">inventory_2</span>
                        <span className="font-bold text-[11px] uppercase tracking-widest">Vault Content</span>
                    </Link>
                    <Link to="/admin/users" className="flex items-center gap-5 p-5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5">
                        <span className="material-symbols-outlined">group</span>
                        <span className="font-bold text-[11px] uppercase tracking-widest">Personnel Matrix</span>
                    </Link>
                    <Link to="/admin/profile" className="flex items-center gap-5 p-5 rounded-2xl bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
                        <span className="material-symbols-outlined">account_circle</span>
                        <span className="font-bold text-[11px] uppercase tracking-widest">My Profile</span>
                    </Link>
                </nav>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 bg-[#0a0f1a] overflow-y-auto">
                <header className="px-12 py-10 border-b border-white/5 flex justify-between items-center bg-[#0a0f1a]/80 backdrop-blur-xl sticky top-0 z-40">
                    <div>
                        <span className="text-primary-blue text-[10px] font-black uppercase tracking-[0.4em] mb-1 block">Identity Management</span>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter">MY <span className="text-primary-blue">PROFILE</span></h1>
                    </div>
                </header>

                <div className="p-12 max-w-5xl mx-auto w-full">
                    {message && (
                        <div className="mb-8 p-4 bg-primary-blue/10 border border-primary-blue/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary-blue text-center animate-fadeIn">
                            {message}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Column: Avatar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white/5 border border-white/5 rounded-[3rem] p-8 text-center space-y-6">
                                <div className="relative inline-block group">
                                    <img
                                        src={currentUser.avatar}
                                        alt="Profile"
                                        className="size-48 rounded-full border-4 border-white/10 shadow-2xl object-cover"
                                    />
                                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <span className="material-symbols-outlined text-4xl text-white">upload</span>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all disabled:opacity-50"
                                    >
                                        {uploading ? 'Uploading...' : 'Change Picture'}
                                    </button>
                                    <button
                                        onClick={handleDeleteImage}
                                        disabled={uploading}
                                        className="w-full py-3 bg-primary-red/10 text-primary-red rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-red/20 transition-all disabled:opacity-50"
                                    >
                                        Remove Picture
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Security</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">Role</label>
                                        <div className="text-sm font-bold text-primary-blue">{currentUser.role}</div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">User ID</label>
                                        <div className="text-[10px] font-mono text-gray-400 break-all">{currentUser.id}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/5 border border-white/5 rounded-[3rem] p-10">
                                <form onSubmit={handleUpdateProfile} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-blue transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email (Read Only)</label>
                                            <input
                                                type="email"
                                                value={currentUser.email}
                                                disabled
                                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold text-gray-500 outline-none cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Mobile Number</label>
                                            <input
                                                type="tel"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-blue transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-blue transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Physical Address</label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary-blue transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-white/10">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-10 py-4 bg-primary-blue text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-primary-blue/20 disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : 'Save Profile Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminProfile;
