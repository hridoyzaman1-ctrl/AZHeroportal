import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useContent } from '../App';
import { auth, db } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { User } from '../types';

type AuthState = 'LOGIN' | 'SIGNUP' | 'VERIFY' | 'PENDING';

const AdminAuth: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('LOGIN');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContent();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const SUPER_ADMIN_EMAIL = 'hridoyzaman1@gmail.com';
    const normalizedInputEmail = email.toLowerCase().trim();
    const isSuperAdmin = normalizedInputEmail === SUPER_ADMIN_EMAIL;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      // SUPER ADMIN BULLETPROOF BYPASS
      if (isSuperAdmin) {
        console.log("🔥 SUPER ADMIN LOGIN - BYPASSING ALL CHECKS");

        // If no user doc exists, create one
        if (!userDoc.exists()) {
          const newSuperAdmin: User = {
            id: firebaseUser.uid,
            name: 'Super Admin',
            email: normalizedInputEmail,
            role: 'Admin',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedInputEmail}`,
            joinedDate: new Date().toLocaleDateString(),
            isVerified: true,
            isApproved: true,
            isRejected: false
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newSuperAdmin);
          login(newSuperAdmin);
          navigate('/admin');
          return;
        }

        // If doc exists, force correct permissions and login
        const userData = userDoc.data() as User;

        // Always fix permissions for super admin
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          isApproved: true,
          role: 'Admin',
          isRejected: false,
          isVerified: true
        });

        // Login with corrected data
        login({
          ...userData,
          isApproved: true,
          role: 'Admin',
          isVerified: true,
          isRejected: false
        });
        navigate('/admin');
        return;
      }

      // REGULAR USER FLOW
      if (!userDoc.exists()) {
        setError('User profile not found in neural grid.');
        await auth.signOut();
        return;
      }

      const userData = userDoc.data() as User;

      if (!userData.isApproved) {
        if (!userData.isVerified) {
          setAuthState('VERIFY');
        } else {
          setAuthState('PENDING');
        }
        await auth.signOut();
        return;
      }

      login(userData);
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid signal coordinates.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });
      await sendEmailVerification(firebaseUser);

      const isSuperAdmin = email.toLowerCase().trim() === 'hridoyzaman1@gmail.com';

      const newUser: User = {
        id: firebaseUser.uid,
        name,
        email,
        address,
        mobile,
        role: isSuperAdmin ? 'Admin' : 'Guest',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        joinedDate: new Date().toLocaleDateString(),
        isVerified: false,
        isApproved: isSuperAdmin, // FORCE TRUE for Super Admin
        isRejected: false
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

      if (isSuperAdmin) {
        // Auto login for super admin
        login(newUser);
        navigate('/admin');
      } else {
        setAuthState('VERIFY');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to enlist personnel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 relative overflow-hidden font-display">
      {/* Cinematic Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute -top-40 -left-40 size-96 bg-primary-red/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 size-96 bg-primary-blue/10 blur-[150px] rounded-full animate-pulse"></div>
      </div>

      <Link to="/" className="absolute top-10 left-10 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-all group z-50">
        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
        Exit Terminal
      </Link>

      <div className="max-w-md w-full bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] p-12 space-y-8 shadow-[0_0_100px_rgba(0,0,0,1)] relative z-10">

        <div className="text-center space-y-2">
          <div className={`size-20 mx-auto flex items-center justify-center mb-6 rounded-3xl border ${authState === 'PENDING' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-primary-red/10 border-primary-red/20'}`}>
            <span className={`material-symbols-outlined text-4xl ${authState === 'PENDING' ? 'text-yellow-500' : 'text-primary-red'} ${authState === 'VERIFY' ? 'animate-pulse' : ''}`}>
              {authState === 'LOGIN' ? 'shield_person' : authState === 'SIGNUP' ? 'person_add' : authState === 'VERIFY' ? 'mail' : 'hourglass_top'}
            </span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            {authState === 'LOGIN' ? 'COMMAND' : authState === 'SIGNUP' ? 'ENLIST' : authState === 'VERIFY' ? 'VERIFY' : 'RESTRICTED'}
            <span className={authState === 'PENDING' ? 'text-yellow-500' : 'text-primary-red'}> {authState === 'PENDING' ? 'AREA' : 'AUTH'}</span>
          </h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            {authState === 'PENDING' ? 'Awaiting Security Clearance' : 'Neural Grid Link Required'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-primary-red/10 border border-primary-red/20 rounded-2xl text-[10px] font-black uppercase text-primary-red text-center tracking-widest animate-fadeIn">
            {error}
          </div>
        )}

        {authState === 'LOGIN' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="UPLINK EMAIL" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-primary-red transition-all" required />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="ENCRYPTION KEY"
                value={pass}
                onChange={e => setPass(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:border-primary-red transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>            <button type="submit" disabled={loading} className="w-full py-5 bg-primary-red text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'SYNCHRONIZING...' : 'INITIALIZE LINK'}
            </button>
            <div className="text-center pt-4">
              <button type="button" onClick={() => setAuthState('SIGNUP')} className="text-[9px] font-black text-gray-700 uppercase tracking-widest hover:text-white transition-all underline underline-offset-8">Request Access Permissions</button>
            </div>
          </form>
        )}

        {authState === 'SIGNUP' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="NAME" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-primary-red" required />
              <input type="tel" placeholder="MOBILE" value={mobile} onChange={e => setMobile(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-primary-red" required />
            </div>
            <input type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-primary-red" required />
            <input type="text" placeholder="PHYSICAL ADDRESS" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-primary-red" required />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="CREATE KEY"
                value={pass}
                onChange={e => setPass(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-primary-red pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>            <button type="submit" disabled={loading} className="w-full py-5 bg-primary-red text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
              {loading ? 'ENLISTING...' : 'ENLIST PERSONNEL'}
            </button>
            <div className="text-center pt-4">
              <button type="button" onClick={() => setAuthState('LOGIN')} className="text-[9px] font-black text-gray-700 uppercase tracking-widest hover:text-white transition-all underline underline-offset-8">Return to Terminal</button>
            </div>
          </form>
        )}

        {authState === 'VERIFY' && (
          <div className="space-y-8 text-center animate-fadeIn">
            <div className="text-center space-y-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                Verification link sent to your email. Please verify your identity to proceed to Command HQ Queue.
                <br /><br />
                <span className="text-primary-red">Note:</span> If you do not see the email in your inbox, please check your spam or junk folder.
              </p>
            </div>
            <button onClick={() => setAuthState('LOGIN')} className="w-full py-5 bg-primary-blue text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.4em]">RETURN TO LOGIN</button>
          </div>
        )}

        {authState === 'PENDING' && (
          <div className="space-y-10 text-center animate-fadeIn">
            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
              <span className="material-symbols-outlined text-6xl text-yellow-500 animate-pulse">lock</span>
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">ACCESS REQUESTED</h2>
              <p className="text-xs text-gray-500 font-medium leading-relaxed italic">Intelligence identity verified. Your request is now in the Command HQ queue. Please wait for Admin approval to access the Multiverse Vault.</p>
            </div>
            <Link to="/" className="block w-full py-5 bg-primary-red text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">BACK TO HERO PORTAL</Link>
            <button onClick={() => setAuthState('LOGIN')} className="text-[9px] font-black text-gray-800 uppercase tracking-widest hover:text-white transition-all underline underline-offset-8">Try Login Again</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuth;

