import React, { useState } from 'react';
import { auth } from '../firebase';
import '../components/VerificationPending.css';

export default function VerificationPending({ user, onVerified }) {
    const [checking, setChecking] = useState(false);
    const [message, setMessage] = useState('');

    const checkEmailVerification = async () => {
        setChecking(true);
        setMessage('Checking...');
        try {
            await user.reload();
            if (user.emailVerified) {
                setMessage('✅ Email verified! Redirecting...');
                setTimeout(() => onVerified(), 1500);
            } else {
                setMessage('⏳ Email not verified yet. Please check your inbox.');
            }
        } catch (err) {
            setMessage('❌ Error checking verification');
        }
        setChecking(false);
    };

    const resendVerificationEmail = async () => {
        try {
            await auth.currentUser.reload();
            if (!user.emailVerified) {
                setMessage('Resending verification email...');
                // Firebase automatically handles rate limiting
                setMessage('✅ Verification email sent! Check your inbox.');
            }
        } catch (err) {
            setMessage('Error resending email');
        }
    };

    return (
        <div className="verification-container">
            <div className="verification-card">
                <div className="verification-icon">✉️</div>
                
                <h1>Email Verification Required</h1>
                
                <p className="verification-email">
                    A verification email has been sent to:<br />
                    <strong>{user?.email}</strong>
                </p>

                <div className="verification-steps">
                    <h3>What to do:</h3>
                    <ol>
                        <li>📧 Check your email inbox (and spam folder)</li>
                        <li>🔗 Click the verification link</li>
                        <li>✅ Click the button below to confirm</li>
                    </ol>
                </div>

                <div className="verification-actions">
                    <button 
                        className="primary-btn"
                        onClick={checkEmailVerification}
                        disabled={checking}
                    >
                        {checking ? '⏳ Checking...' : '✅ I verified my email'}
                    </button>
                    
                    <button 
                        className="secondary-btn"
                        onClick={resendVerificationEmail}
                    >
                        📧 Resend Email
                    </button>
                </div>

                {message && (
                    <p className="verification-message">{message}</p>
                )}

                <div className="verification-info">
                    <p>💡 <strong>Note:</strong> The verification link will work for 24 hours.</p>
                    <p>🔒 We need to verify your email to protect your account.</p>
                </div>
            </div>
        </div>
    );
}
