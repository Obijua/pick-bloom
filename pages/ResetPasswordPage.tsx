
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Loader2 } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { openResetModal } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      // Trigger the modal with the token
      openResetModal(token);
      // Redirect to home so the modal appears over the homepage
      navigate('/');
    }
  }, [token, openResetModal, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
            <p className="text-gray-600 font-medium">Verifying reset link...</p>
        </div>
    </div>
  );
};

export default ResetPasswordPage;
