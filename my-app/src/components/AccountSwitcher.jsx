    import { useState, useEffect } from 'react';

    export default function AccountSwitcher({ currentUser, onSwitchAccount, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const [savedAccounts, setSavedAccounts] = useState([]);

    useEffect(() => {
        const accounts = JSON.parse(localStorage.getItem('savedAccounts') || '[]');
        setSavedAccounts(accounts);
    }, [currentUser]);

    const otherAccounts = savedAccounts.filter(acc => acc.email !== currentUser?.email);

    if (!isOpen) {
        return (
        <button 
            onClick={() => setIsOpen(true)}
            style={{
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: '#0f9d58', color: 'white', border: 'none',
            fontSize: '18px', cursor: 'pointer', fontWeight: 'bold'
            }}
        >
            {currentUser?.email?.charAt(0).toUpperCase()}
        </button>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
        <div 
            style={{ position: 'fixed', inset: 0, zIndex: 99 }} 
            onClick={() => setIsOpen(false)} 
        />

        <div style={{
            position: 'absolute', top: '50px', right: '0', zIndex: 100,
            backgroundColor: '#202124', color: '#e8eaed', width: '350px',
            borderRadius: '24px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            fontFamily: 'sans-serif'
        }}>
            
            {/* Текущий аккаунт */}
            <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid #5f6368' }}>
            <div style={{ fontSize: '14px', marginBottom: '16px' }}>{currentUser?.email}</div>
            <div style={{
                width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#0f9d58',
                color: 'white', fontSize: '32px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 10px', border: '2px solid #ea4335'
            }}>
                {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '500', marginBottom: '16px' }}>
                Hi, User!
            </div>
            <button style={{
                background: 'transparent', color: '#8ab4f8', border: '1px solid #5f6368',
                padding: '8px 16px', borderRadius: '16px', cursor: 'pointer'
            }}>
                Manage your Account
            </button>
            </div>

            <div style={{ padding: '10px 0' }}>
            {otherAccounts.map((acc, index) => (
                <div 
                key={index} 
                onClick={() => {
                    setIsOpen(false);
                    onSwitchAccount(acc.email);
                }}
                style={{
                    display: 'flex', alignItems: 'center', padding: '12px', cursor: 'pointer',
                    borderRadius: '8px', transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#303134'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#d93025',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginRight: '12px', fontWeight: 'bold'
                }}>
                    {acc.email.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{acc.name || acc.email.split('@')[0]}</div>
                    <div style={{ fontSize: '12px', color: '#9aa0a6' }}>{acc.email}</div>
                </div>
                </div>
            ))}
            </div>

            <div style={{ borderTop: '1px solid #5f6368', paddingTop: '10px' }}>
            <div 
                onClick={() => { setIsOpen(false); onLogout(); }}
                style={{ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
                <span style={{ fontSize: '20px' }}>➕</span> Add another account
            </div>
            <div 
                onClick={() => { setIsOpen(false); onLogout(); }}
                style={{ padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
                <span style={{ fontSize: '20px' }}>🚪</span> Sign out of all accounts
            </div>
            </div>
        </div>
        </div>
    );
    }