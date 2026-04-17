import { useState, useRef, useEffect } from 'react';
import './AccountSwitcher.css';

export default function AccountSwitcher({ user, savedAccounts, onSwitchAccount, onRemoveAccount }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!savedAccounts || savedAccounts.length === 0) {
    return null;
  }

  return (
    <div className="account-switcher" ref={menuRef}>
      <button
        className="account-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Switch Account"
      >
        <span className="account-icon">👤</span>
        {user && <span className="account-count">{savedAccounts.length}</span>}
      </button>

      {isOpen && (
        <div className="account-switcher-menu">
          <div className="account-menu-header">My Accounts</div>

          <div className="account-list">
            {savedAccounts.map((account) => (
              <div
                key={account.email}
                className={`account-item ${
                  user && user.email === account.email ? 'active' : ''
                }`}
              >
                <div
                  className="account-info"
                  onClick={() => {
                    onSwitchAccount(account);
                    setIsOpen(false);
                  }}
                >
                  <div className="account-email">{account.email}</div>
                  <div className="account-name">{account.name}</div>
                </div>
                <button
                  className="account-remove-btn"
                  onClick={() => onRemoveAccount(account.email)}
                  title="Remove Account"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="account-menu-footer">
            Total: {savedAccounts.length}
          </div>
        </div>
      )}
    </div>
  );
}
