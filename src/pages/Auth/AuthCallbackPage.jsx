import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../../services/authService';
import './AuthCallbackPage.css';

/**
 * Handles the OAuth callback after Google sign-in.
 * Backend redirects to: {FRONTEND_URL}/auth/google/callback?token=xxx
 * On error: ?error=GOOGLE_AUTH_FAILED&message=...
 */
const AuthCallbackPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    const userParam = searchParams.get('user');

    if (errorParam) {
      setError(messageParam || t('authCallback.errors.googleFailed'));
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
      setError(t('authCallback.errors.noCode'));
    }
  }, [searchParams, navigate, t]);

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
              {t('authCallback.backToLogin')}
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
          <p>{t('authCallback.loggingIn')}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
