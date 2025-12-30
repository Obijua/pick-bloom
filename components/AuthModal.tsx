/*
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Eye, EyeOff, AlertCircle, User as UserIcon, ArrowLeft, CheckCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

type ViewState = 'login' | 'register' | 'forgot' | 'reset' | 'success_register';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, registerUser, forgotPassword, resetPassword, incomingResetToken } = useStore();
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If token arrives via context (from email link), auto-switch to reset view
  useEffect(() => {
      if (incomingResetToken && isAuthModalOpen) {
          setResetToken(incomingResetToken);
          setViewState('reset');
      }
  }, [incomingResetToken, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (viewState === 'login') {
            const isAdmin = await login(email, password);
            if (isAdmin) navigate('/admin');
            setIsAuthModalOpen(false);
            resetForm();
        } else if (viewState === 'register') {
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                setIsLoading(false);
                return;
            }
            if (password.length < 6) {
                setError("Password must be at least 6 characters");
                setIsLoading(false);
                return;
            }
            const success = await registerUser(name, email, password);
            if (success) {
                // Show success view instead of closing
                setViewState('success_register');
            }
        } else if (viewState === 'forgot') {
            await forgotPassword(email);
            // No token returned here anymore
        } else if (viewState === 'reset') {
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                setIsLoading(false);
                return;
            }
            const success = await resetPassword(resetToken, password);
            if (success) {
                setViewState('login');
                setPassword('');
                setConfirmPassword('');
            }
        }
    } catch (e: any) {
        setError(e.message || "An error occurred");
    } finally {
        setIsLoading(false);
    }
  };

  const resetForm = () => {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setResetToken('');
      setError('');
      setViewState('login');
  };

  const fillAdminCredentials = () => {
      setEmail('admin@farmersmarket.com');
      setPassword('admin123');
      setViewState('login');
      setError('');
  };

  const getTitle = () => {
      switch(viewState) {
          case 'login': return 'Welcome Back';
          case 'register': return 'Create Account';
          case 'forgot': return 'Forgot Password';
          case 'reset': return 'Reset Password';
          case 'success_register': return 'Check Your Email';
      }
  };

  const getSubtitle = () => {
      switch(viewState) {
          case 'login': return 'Sign in to access your orders';
          case 'register': return 'Enter your details to get started';
          case 'forgot': return 'Enter your email to receive a reset link';
          case 'reset': return 'Create a new secure password';
          case 'success_register': return 'Verify your account to continue';
      }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsAuthModalOpen(false)}
      />
      
      <div className="relative  bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <button 
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {viewState !== 'login' && viewState !== 'success_register' && (
            <button 
                onClick={() => setViewState('login')}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
            </button>
        )}

        <div className="p-8">
          {viewState === 'success_register' ? (
              <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Registration Successful!</h2>
                  <p className="text-gray-600 mb-6">
                      We've sent a verification link to <strong>{email}</strong>. Please check your inbox (and spam folder) to activate your account.
                  </p>
                  <button 
                      onClick={() => { resetForm(); }}
                      className="w-full bg-[#143f17] text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                      Back to Login
                  </button>
              </div>
          ) : (
              <>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                    {getTitle()}
                    </h2>
                    <p className="text-gray-500 text-sm">
                    {getSubtitle()}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {viewState === 'register' && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="John Doe"
                            />
                            <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        </div>
                        </div>
                    )}

                    {viewState !== 'reset' && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="you@example.com"
                            />
                            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        </div>
                        </div>
                    )}

                    {viewState === 'reset' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
                            <div className="relative">
                                <input
                                type="text"
                                required
                                value={resetToken}
                                onChange={(e) => setResetToken(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Paste code from email"
                                readOnly={!!incomingResetToken}
                                />
                                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                            </div>
                            {!incomingResetToken && <p className="text-xs text-gray-500 mt-1">Check your email for the code</p>}
                        </div>
                    )}

                    {viewState !== 'forgot' && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {viewState === 'reset' ? 'New Password' : 'Password'}
                        </label>
                        <div className="relative">
                            <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            />
                            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        </div>
                    )}

                    {(viewState === 'register' || viewState === 'reset') && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            />
                            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        </div>
                        </div>
                    )}

                    {viewState === 'login' && (
                        <div className="text-right">
                            <button 
                                type="button"
                                onClick={() => setViewState('forgot')}
                                className="text-xs text-primary-600 font-medium hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#143f17] text-white font-bold py-3 rounded-lg hover:bg-primary-700 cursor-pointer transition-colors shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                    {isLoading ? 'Processing...' : (
                        viewState === 'login' ? 'Sign In' :
                        viewState === 'register' ? 'Sign Up' :
                        viewState === 'forgot' ? 'Send Reset Link' : 'Reset Password'
                    )}
                    </button>
                </form>

                {viewState === 'login' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-500shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-700 flex-1">
                            <div className="flex justify-between items-start">
                                <p className="font-bold mb-1">Admin Login Details:</p>
                                <button onClick={fillAdminCredentials} className="text-blue-600 underline font-bold hover:text-blue-800">
                                    Auto-fill
                                </button>
                            </div>
                            <p>Email: admin@farmersmarket.com</p>
                            <p>Pass: admin123</p>
                        </div>
                    </div>
                )}

                {(viewState === 'login' || viewState === 'register') && (
                    <>
                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span className="text-xs text-gray-400 font-medium">OR CONTINUE WITH</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-2.5 cursor-pointer border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                <span className="text-sm font-medium text-gray-600">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-2.5 cursor-pointer border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                <svg className="h-5 w-5 text-[#1877F2] fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                <span className="text-sm font-medium text-gray-600">Facebook</span>
                            </button>
                        </div>
                    </>
                )}

                <div className="mt-6 text-center text-sm text-gray-500">
                    {viewState === 'login' ? "Don't have an account? " : "Already have an account? "}
                    {(viewState === 'login' || viewState === 'register') && (
                        <button 
                        onClick={() => { 
                            setViewState(viewState === 'login' ? 'register' : 'login'); 
                            setError(''); 
                            setName(''); 
                        }}
                        className="text-primary-600 font-semibold hover:underline cursor-pointer"
                        >
                        {viewState === 'login' ? 'Sign Up' : 'Log In'}
                        </button>
                    )}
                </div>
              </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
*/







import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, Eye, EyeOff, AlertCircle, User as UserIcon, ArrowLeft, CheckCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

type ViewState = 'login' | 'register' | 'forgot' | 'reset' | 'success_register';

const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, registerUser, forgotPassword, resetPassword, incomingResetToken } = useStore();
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      if (incomingResetToken && isAuthModalOpen) {
          setResetToken(incomingResetToken);
          setViewState('reset');
      }
  }, [incomingResetToken, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (viewState === 'login') {
            const isAdmin = await login(email, password);
            if (isAdmin) navigate('/admin');
            setIsAuthModalOpen(false);
            resetForm();
        } else if (viewState === 'register') {
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                setIsLoading(false);
                return;
            }
            if (password.length < 6) {
                setError("Password must be at least 6 characters");
                setIsLoading(false);
                return;
            }
            const success = await registerUser(name, email, password);
            if (success) {
                setViewState('success_register');
            }
        } else if (viewState === 'forgot') {
            await forgotPassword(email);
        } else if (viewState === 'reset') {
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                setIsLoading(false);
                return;
            }
            const success = await resetPassword(resetToken, password);
            if (success) {
                setViewState('login');
                setPassword('');
                setConfirmPassword('');
            }
        }
    } catch (e: any) {
        setError(e.message || "An error occurred");
    } finally {
        setIsLoading(false);
    }
  };

  const resetForm = () => {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setResetToken('');
      setError('');
      setViewState('login');
  };

  const getTitle = () => {
      switch(viewState) {
          case 'login': return 'Welcome Back';
          case 'register': return 'Create Account';
          case 'forgot': return 'Forgot Password';
          case 'reset': return 'Reset Password';
          case 'success_register': return 'Check Your Email';
      }
  };

  const getSubtitle = () => {
      switch(viewState) {
          case 'login': return 'Sign in to access your orders';
          case 'register': return 'Enter your details to get started';
          case 'forgot': return 'Enter your email to receive a reset link';
          case 'reset': return 'Create a new secure password';
          case 'success_register': return 'Verify your account to continue';
      }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsAuthModalOpen(false)}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <button 
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {viewState !== 'login' && viewState !== 'success_register' && (
            <button 
                onClick={() => setViewState('login')}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
            </button>
        )}

        <div className="p-8">
          {viewState === 'success_register' ? (
              <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4">Registration Successful!</h2>
                  <p className="text-gray-600 mb-6">
                      We've sent a verification link to <strong>{email}</strong>. Please check your inbox to activate your account.
                  </p>
                  <button 
                      onClick={() => { resetForm(); }}
                      className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                      Back to Login
                  </button>
              </div>
          ) : (
              <>
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                    {getTitle()}
                    </h2>
                    <p className="text-gray-500 text-sm">
                    {getSubtitle()}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {viewState === 'register' && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="John Doe"
                            />
                            <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        </div>
                        </div>
                    )}

                    {viewState !== 'reset' && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="you@example.com"
                            />
                            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        </div>
                        </div>
                    )}

                    {viewState === 'reset' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reset Token</label>
                            <div className="relative">
                                <input
                                type="text"
                                required
                                value={resetToken}
                                onChange={(e) => setResetToken(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="Paste code from email"
                                readOnly={!!incomingResetToken}
                                />
                                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    )}

                    {viewState !== 'forgot' && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {viewState === 'reset' ? 'New Password' : 'Password'}
                        </label>
                        <div className="relative">
                            <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            />
                            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        </div>
                    )}

                    {(viewState === 'register' || viewState === 'reset') && (
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            />
                            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                        </div>
                        </div>
                    )}

                    {viewState === 'login' && (
                        <div className="text-right">
                            <button 
                                type="button"
                                onClick={() => setViewState('forgot')}
                                className="text-xs text-primary-600 font-medium hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#143f17] text-white font-bold py-3 rounded-lg cursor-pointer hover:bg-primary-700 transition-colors shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                    {isLoading ? 'Processing...' : (
                        viewState === 'login' ? 'Sign In' :
                        viewState === 'register' ? 'Sign Up' :
                        viewState === 'forgot' ? 'Send Reset Link' : 'Reset Password'
                    )}
                    </button>
                </form>

                {(viewState === 'login' || viewState === 'register') && (
                    <>
                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px bg-gray-200 flex-1"></div>
                            <span className="text-xs text-gray-700 font-medium">OR CONTINUE WITH</span>
                            <div className="h-px bg-gray-200 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                                <span className="text-sm font-medium text-gray-600">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <svg className="h-5 w-5 text-[#1877F2] fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                <span className="text-sm font-medium text-gray-600">Facebook</span>
                            </button>
                        </div>
                    </>
                )}

                <div className="mt-6 text-center text-sm text-gray-700">
                    {viewState === 'login' ? "Don't have an account? " : "Already have an account? "}
                    {(viewState === 'login' || viewState === 'register') && (
                        <button 
                        onClick={() => { 
                            setViewState(viewState === 'login' ? 'register' : 'login'); 
                            setError(''); 
                            setName(''); 
                        }}
                        className="text-[#143f17] font-semibold hover:underline"
                        >
                        {viewState === 'login' ? 'Sign Up' : 'Log In'}
                        </button>
                    )}
                </div>
              </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
