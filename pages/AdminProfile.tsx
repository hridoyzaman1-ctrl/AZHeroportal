import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useContent } from '../App';
import { storage, db } from '../services/firebase';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import AdminLayout from '../components/AdminLayout';

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!currentUser?.id) {
            alert("Error: User ID missing. Please re-login.");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large. Max 5MB allowed.");
            return;
        }

        setUploading(true);
        setMessage('Starting upload...');

        try {
            // Use a unique name to force browser cache refresh
            const timestamp = Date.now();
            const storageRef = ref(storage, `profile_images/${currentUser.id}_${timestamp}`);

            // Upload with metadata
            const metadata = {
                contentType: file.type,
                cacheControl: 'public,max-age=3600'
            };

            // Use uploadBytesResumable for better control
            const uploadTask = uploadBytesResumable(storageRef, file, metadata);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setMessage(`Uploading: ${Math.round(progress)}%`);
                },
                (error) => {
                    console.error("Upload error:", error);
                    setUploading(false);
                    setMessage(`Upload failed: ${error.message}`);
                    alert(`Upload Error: ${error.message}`);
                },
                async () => {
                    // Upload completed successfully
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                        const userRef = doc(db, 'users', currentUser.id);
                        await updateDoc(userRef, { avatar: downloadURL });

                        // Update local state immediately with the new URL
                        // FORCE UPDATE: Create new object reference
                        const updatedUser = { ...currentUser, avatar: downloadURL };
                        login(updatedUser);

                        setMessage('Profile picture updated successfully.');
                        setUploading(false);
                    } catch (urlError: any) {
                        console.error("Error getting URL:", urlError);
                        setMessage(`Failed to get URL: ${urlError.message}`);
                        setUploading(false);
                    }
                }
            );

        } catch (error: any) {
            console.error('Error initiating upload:', error);
            const errMsg = error.message || 'Unknown error';
            setMessage(`Failed: ${errMsg}`);
            alert(`Upload Error: ${errMsg}`);
            setUploading(false);
        } finally {
            // Reset input so verified change event fires again if same file selected
            if (fileInputRef.current) fileInputRef.current.value = '';
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
        <AdminLayout title="OPERATIVE PROFILE" subtitle="Genetic Clearance Data">
            <div className="flex-1 p-4 md:p-12 space-y-8 md:space-y-12 overflow-y-auto no-scrollbar">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                    {/* LEFT COLUMN: AVATAR & SECURITY */}
                    <div className="lg:col-span-4 space-y-8">
                        {message && (
                            <div className="p-4 bg-primary-blue/10 border border-primary-blue/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary-blue text-center animate-fadeIn">
                                {message}
                            </div>
                        )}

                        <div className="bg-white/5 border border-white/5 rounded-[3.5rem] p-8 text-center space-y-8">
                            <div className="relative inline-block group">
                                <img
                                    src={currentUser.avatar}
                                    alt="Profile"
                                    className="size-48 rounded-full border-4 border-white/10 shadow-2xl object-cover"
                                />
                                <div
                                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <span className="material-symbols-outlined text-4xl text-white">upload</span>
                                </div>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full py-4 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all disabled:opacity-50"
                                >
                                    {uploading ? 'Syncing...' : 'Change Avatar'}
                                </button>
                                <button
                                    onClick={handleDeleteImage}
                                    disabled={uploading}
                                    className="w-full py-4 bg-primary-red/10 text-primary-red rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-red/20 transition-all disabled:opacity-50"
                                >
                                    Remove Avatar
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-[3rem] p-8 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Clearance Status</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Authorization Level</label>
                                    <div className="text-sm font-black text-primary-blue uppercase italic">{currentUser.role}</div>
                                </div>
                                <div>
                                    <label className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Unique Signal ID</label>
                                    <div className="text-[9px] font-mono text-gray-400 break-all">{currentUser.id}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: DATA FORM */}
                    <div className="lg:col-span-8">
                        <div className="bg-white/5 border border-white/5 rounded-[3.5rem] p-6 md:p-12 h-full">
                            <form onSubmit={handleUpdateProfile} className="space-y-8 md:space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Legal Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-primary-blue transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Identity Uplink (Read Only)</label>
                                        <input
                                            type="email"
                                            value={currentUser.email}
                                            disabled
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-sm font-bold text-gray-600 outline-none cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Mobile Frequency</label>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-primary-blue transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Cycle of Origin (DOB)</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-primary-blue transition-all"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Physical Coordinates</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-primary-blue transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-10 border-t border-white/5">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto px-12 py-6 bg-primary-blue text-black rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl hover:shadow-primary-blue/20 disabled:opacity-50"
                                    >
                                        {loading ? 'Committing...' : 'Commit Genetic Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};


export default AdminProfile;
