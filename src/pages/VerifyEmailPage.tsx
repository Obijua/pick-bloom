
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { verifyEmail, user } = useStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const attemptRef = useRef(false);

  useEffect(() => {
    // If the user in context is already verified, we can assume success
    // regardless of the token call result (which might fail if duplicate)
    if (user?.isVerified) {
        setStatus('success');
        return;
    }

    const verify = async () => {
        if (!token) return;
        if (attemptRef.current) return; 
        attemptRef.current = true;

        try {
            const success = await verifyEmail(token);
            if (success) {
                setStatus('success');
            } else {
                // If verifyEmail returned false, it might be because the token was invalid
                // OR it was a duplicate call and the user is actually now verified in the DB.
                // Since we can't easily check DB here without another call, and the context 
                // user update might be pending, we rely on the user check above or manual refresh.
                // However, if the user is ALREADY verified in context (checked above), we don't get here.
                // So if we get here, it's likely a genuine error.
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };
    verify();
  }, [token, verifyEmail, user?.isVerified]); // Added user.isVerified dependency

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
            {status === 'verifying' && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-primary-600 animate-spin" />
                    <h2 className="text-xl font-bold text-gray-900">Verifying Email...</h2>
                    <p className="text-gray-500">Please wait while we verify your account.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center gap-4 animate-scale-in">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Email Verified!</h2>
                    <p className="text-gray-500 mb-2">Your account has been successfully activated.</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 w-full"
                    >
                        Go to Home
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center gap-4 animate-scale-in">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Verification Failed</h2>
                    <p className="text-gray-500 mb-2">This link is invalid or has expired.</p>
                    <button 
                        onClick={() => navigate('/')} 
                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold hover:bg-gray-300 w-full"
                    >
                        Return Home
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default VerifyEmailPage;
