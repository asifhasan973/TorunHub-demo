import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { toast } from 'react-toastify';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin email from environment variables
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    // Check if admin is logged in on mount
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setAdmin(user);
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [ADMIN_EMAIL]);

  const adminLogin = async (email, password) => {
    try {
      // First, try to sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Then verify this is the admin email
      if (userCredential.user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        toast.error('You do not have admin access');
        return false;
      }

      setAdmin(userCredential.user);
      toast.success('Admin login successful!');
      return true;
    } catch (error) {
      
      // If user doesn't exist, provide helpful message
      if (error.code === 'auth/user-not-found') {
        toast.error('Admin account not found. Please create an admin account in Firebase.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email format');
      } else {
        toast.error('Login failed: ' + error.message);
      }
      return false;
    }
  };

  const adminLogout = async () => {
    try {
      await signOut(auth);
      setAdmin(null);
      toast.success('Logged out successfully');
      return true;
    } catch (error) {
      toast.error('Logout failed');
      return false;
    }
  };

  const value = {
    admin,
    loading,
    adminLogin,
    adminLogout,
    isAdmin: !!admin,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
