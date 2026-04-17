import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'savedAccounts';
const CURRENT_ACCOUNT_KEY = 'currentAccount';

export const useAccountManager = () => {
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);


  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSavedAccounts(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading saved accounts:', err);
      }
    }

    const current = localStorage.getItem(CURRENT_ACCOUNT_KEY);
    if (current) {
      try {
        setCurrentAccount(JSON.parse(current));
      } catch (err) {
        console.error('Error loading current account:', err);
      }
    }
  }, []);


  const saveAccount = useCallback((accountData) => {
    setSavedAccounts((prev) => {
      const filtered = prev.filter(acc => acc.email !== accountData.email);
      const updated = [...filtered, accountData];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);


  const setCurrentAccountData = useCallback((account) => {
    setCurrentAccount(account);
    localStorage.setItem(CURRENT_ACCOUNT_KEY, JSON.stringify(account));
  }, []);


  const removeAccount = useCallback((email) => {
    setSavedAccounts((prev) => {
      const updated = prev.filter(acc => acc.email !== email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    if (currentAccount?.email === email) {
      setCurrentAccount(null);
      localStorage.removeItem(CURRENT_ACCOUNT_KEY);
    }
  }, [currentAccount]);


  const clearAllAccounts = useCallback(() => {
    setSavedAccounts([]);
    setCurrentAccount(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_ACCOUNT_KEY);
  }, []);

  return {
    savedAccounts,
    currentAccount,
    saveAccount,
    setCurrentAccountData,
    removeAccount,
    clearAllAccounts,
  };
};
