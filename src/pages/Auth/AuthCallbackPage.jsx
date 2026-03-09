import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';
import './AuthCallbackPage.css';

/**
 * Handles the OAuth callback after Google sign-in.
 * Backend redirects to: {FRONTEND_URL}/auth/google/callback?token=xxx
 * On error: ?error=GOOGLE_AUTH_FAILED&message=...
 */
const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    const userParam = searchParams.get('user');

    if (errorParam) {
      setError(messageParam || 'فشل تسجيل الدخول بـ Google');
      return;
    }

    if (token) {
      let user = null;
      if (userParam) {
        try {
          user = JSON.parse(decodeURIComponent(userParam));
        } catch {
          // Ignore parse errors
        }
      }
      authService.completeGoogleLogin(token, user);
      navigate('/', { replace: true });
      window.location.reload(); // Refresh to update auth state across the app
    } else {
      setError('لم يتم استلام رمز الدخول. يرجى المحاولة مرة أخرى.');
    }
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/login', { state: { message: error, type: 'error' } });
  };

  if (error) {
    return (
      <div className="auth-callback-page">
        <div className="auth-callback-card">
          <div className="auth-callback-error">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button onClick={handleRetry} className="auth-callback-btn">
              العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback-page">
      <div className="auth-callback-card">
        <div className="auth-callback-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>جاري تسجيل الدخول...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
