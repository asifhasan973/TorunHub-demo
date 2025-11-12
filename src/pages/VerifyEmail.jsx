import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { sendEmailVerification, reload } from 'firebase/auth';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkVerified = async () => {
      if (!auth.currentUser) return;
      try {
        await reload(auth.currentUser);
        if (auth.currentUser.emailVerified) {
          toast.success('Email verified!');
          navigate('/');
        }
      } catch {}
    };
    // Initial check and periodic polling
    checkVerified();
    const id = setInterval(checkVerified, 4000);
    return () => clearInterval(id);
  }, [navigate]);

  const handleResend = async () => {
    if (!auth.currentUser) return;
    try {
      setSending(true);
      await sendEmailVerification(auth.currentUser, {
        url: window.location.origin + '/',
        handleCodeInApp: false,
      });
      toast.info('Verification email resent. Please check your inbox.');
    } catch (e) {
      toast.error(e.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleIHaveVerified = async () => {
    if (!auth.currentUser) return;
    try {
      setChecking(true);
      await reload(auth.currentUser);
      if (auth.currentUser.emailVerified) {
        toast.success('Email verified!');
        navigate('/');
      } else {
        toast.error('Not verified yet. Please click the link in your email.');
      }
    } catch (e) {
      toast.error(e.message || 'Failed to check verification');
    } finally {
      setChecking(false);
    }
  };

  const email = auth.currentUser?.email;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 text-center">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-black mb-3">
          Verify your email
        </motion.h1>
        <p className="text-gray-700 mb-6">
          We sent a verification link to
          <span className="font-semibold"> {email || 'your email'} </span>.
          Please check your inbox and click the link to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={handleResend} disabled={sending} className="btn btn-outline">
            {sending ? 'Sending...' : 'Resend Email'}
          </button>
          <button onClick={handleIHaveVerified} disabled={checking} className="btn bg-black text-white hover:bg-gray-800 border-none">
            {checking ? 'Checking...' : "I've verified"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4">This page will auto-check every few seconds.</p>
      </div>
    </div>
  );
};

export default VerifyEmail;


