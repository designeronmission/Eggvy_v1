// src/services/BudgetStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const BUDGET_DATA_KEY = 'budget_data';
const CURRENT_MONTH_KEY = 'current_month';
const ACCOUNTS_KEY = 'user_accounts';
const TRANSACTIONS_KEY = 'transactions';

// Initial category data structure
export const INITIAL_CATEGORY_DATA = {
  bills: {
    id: 'bills',
    name: 'Bills',
    icon: 'file-text',
    color: '#0A84FF',
    lightColor: '#E8F1FF',
    description: 'Monthly obligations',
    categories: [
      { id: 'b1', name: 'Rent/Mortgage', assigned: 0, available: 0, activity: 0 },
      { id: 'b2', name: 'Electricity', assigned: 0, available: 0, activity: 0 },
      { id: 'b3', name: 'Water', assigned: 0, available: 0, activity: 0 },
      { id: 'b4', name: 'Internet', assigned: 0, available: 0, activity: 0 },
      { id: 'b5', name: 'Phone', assigned: 0, available: 0, activity: 0 },
    ],
    totalBudgeted: 0,
    totalSpent: 0,
    totalAvailable: 0
  },
  wants: {
    id: 'wants',
    name: 'Wants',
    icon: 'heart',
    color: '#FF2D55',
    lightColor: '#FFE5E9',
    description: 'Discretionary spending',
    categories: [
      { id: 'w1', name: 'Dining Out', assigned: 0, available: 0, activity: 0 },
      { id: 'w2', name: 'Shopping', assigned: 0, available: 0, activity: 0 },
      { id: 'w3', name: 'Entertainment', assigned: 0, available: 0, activity: 0 },
      { id: 'w4', name: 'Coffee', assigned: 0, available: 0, activity: 0 },
      { id: 'w5', name: 'Hobbies', assigned: 0, available: 0, activity: 0 },
    ],
    totalBudgeted: 0,
    totalSpent: 0,
    totalAvailable: 0
  },
  needs: {
    id: 'needs',
    name: 'Needs',
    icon: 'shield',
    color: '#34C759',
    lightColor: '#E6F7E6',
    description: 'Essential expenses',
    categories: [
      { id: 'n1', name: 'Groceries', assigned: 0, available: 0, activity: 0 },
      { id: 'n2', name: 'Transportation', assigned: 0, available: 0, activity: 0 },
      { id: 'n3', name: 'Healthcare', assigned: 0, available: 0, activity: 0 },
      { id: 'n4', name: 'Education', assigned: 0, available: 0, activity: 0 },
      { id: 'n5', name: 'Savings', assigned: 0, available: 0, activity: 0 },
    ],
    totalBudgeted: 0,
    totalSpent: 0,
    totalAvailable: 0
  }
};

/**
 * Reset all data - clears all storage
 */
export const resetAllData = async () => {
  try {
    console.log('Resetting all budget data...');
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys);
    console.log('All data reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting data:', error);
    throw error;
  }
};

/**
 * Load budget data from storage
 */
export const loadBudgetData = async () => {
  try {
    const data = await AsyncStorage.getItem(BUDGET_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading budget data:', error);
    return null;
  }
};

/**
 * Save budget data to storage
 */
export const saveBudgetData = async (data) => {
  try {
    await AsyncStorage.setItem(BUDGET_DATA_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving budget data:', error);
    throw error;
  }
};

/**
 * Load current month (YYYY-MM format)
 */
export const loadCurrentMonth = async () => {
  try {
    const data = await AsyncStorage.getItem(CURRENT_MONTH_KEY);
    if (data) {
      // Validate the format
      const regex = /^\d{4}-\d{2}$/;
      if (regex.test(data)) {
        return data;
      }
    }
    
    // Return current month if no valid data found
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error loading current month:', error);
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
};

/**
 * Save current month
 */
export const saveCurrentMonth = async (month) => {
  try {
    // Validate month format before saving
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(month)) {
      console.error('Invalid month format:', month);
      return false;
    }
    await AsyncStorage.setItem(CURRENT_MONTH_KEY, month);
    return true;
  } catch (error) {
    console.error('Error saving current month:', error);
    throw error;
  }
};

/**
 * Load accounts
 */
export const loadAccounts = async () => {
  try {
    const data = await AsyncStorage.getItem(ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading accounts:', error);
    return [];
  }
};

/**
 * Save accounts
 */
export const saveAccounts = async (accounts) => {
  try {
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return true;
  } catch (error) {
    console.error('Error saving accounts:', error);
    throw error;
  }
};

/**
 * Load transactions
 */
export const loadTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

/**
 * Save transactions
 */
export const saveTransactions = async (transactions) => {
  try {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Error saving transactions:', error);
    throw error;
  }
};

/**
 * Calculate total balance from accounts
 */
export const calculateTotalBalance = (accounts) => {
  if (!accounts || !Array.isArray(accounts)) return 0;
  return accounts.reduce((total, account) => total + (account.balance || 0), 0);
};