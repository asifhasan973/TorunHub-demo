import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  sendEmailVerification,
  reload,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { toast } from 'react-toastify';
import axios from 'axios';

const AuthContext = createContext();

// Backend API URL - update this when you deploy your backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'user', 'subadmin', 'admin'
  const [loading, setLoading] = useState(true);

  // Fetch user role from backend
  const fetchUserRole = async (user) => {
    try {
      const token = await user.getIdToken();
      const url = `${API_URL}/users/role`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRole(response.data.role);
      return response.data.role;
    } catch (error) {
      // Default to 'user' role if backend is not available
      setUserRole('user');
      return 'user';
    }
  };

  const signup = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });

      // Send verification email
      try {
        await sendEmailVerification(result.user, {
          url: window.location.origin + '/',
          handleCodeInApp: false,
        });
        toast.info('Verification email sent. Please check your inbox.');
      } catch (verifyErr) {
      }

      // Create user in backend with default 'user' role
      try {
        const token = await result.user.getIdToken();
        await axios.post(
          `${API_URL}/users/create`,
          {
            email: result.user.email,
            displayName: displayName,
            uid: result.user.uid,
            role: 'user',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (backendError) {
        // Continue even if backend fails
      }

      toast.success('Account created. Verify your email to continue.');
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // We won't force sign-out here; pages can redirect to /verify-email
      await reload(result.user);
      await fetchUserRole(result.user);
      toast.success('Logged in successfully!');
      return result;
    } catch (error) {
      toast.error('Invalid email or password');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Reload user to get the latest data including photoURL
      await reload(result.user);

      // Check if user exists in backend, if not create with 'user' role
      try {
        const token = await result.user.getIdToken();
        await axios.post(
          `${API_URL}/users/create`,
          {
            email: result.user.email,
            displayName: result.user.displayName,
            uid: result.user.uid,
            photoURL: result.user.photoURL,
            role: 'user',
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (backendError) {
        // User might already exist - silent fail
      }

      await fetchUserRole(result.user);
      
      // Force a state update with the fresh user data
      setCurrentUser(auth.currentUser);
      
      toast.success('Logged in with Google successfully!');
      return result;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateUserProfile = async (displayName, photoURL) => {
    try {
      await updateProfile(auth.currentUser, { displayName, photoURL });
      setCurrentUser({ ...auth.currentUser });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  // Check if user has admin or subadmin access
  const hasAdminAccess = () => {
    return userRole === 'admin' || userRole === 'subadmin';
  };

  // Check if user is admin only
  const isAdmin = () => {
    return userRole === 'admin';
  };

  // Check if user is subadmin
  const isSubAdmin = () => {
    return userRole === 'subadmin';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserRole(user);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    hasAdminAccess,
    isAdmin,
    isSubAdmin,
    fetchUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
