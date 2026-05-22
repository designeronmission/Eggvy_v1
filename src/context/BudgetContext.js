// src/context/BudgetContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  loadBudgetData,  
  saveBudgetData, 
  loadCurrentMonth,
  saveCurrentMonth,
  loadAccounts,
  loadTransactions,
  saveTransactions,
  calculateTotalBalance,
  INITIAL_CATEGORY_DATA 
} from '../services/BudgetStorage';

const BudgetContext = createContext();

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within BudgetProvider');
  }
  return context;
};

export const BudgetProvider = ({ children }) => {
  const [categoryData, setCategoryData] = useState(INITIAL_CATEGORY_DATA);
  const [currentMonth, setCurrentMonth] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        const [
          storedBudgetData, 
          storedMonth,
          storedAccounts,
          storedTransactions
        ] = await Promise.all([
          loadBudgetData(),
          loadCurrentMonth(),
          loadAccounts(),
          loadTransactions()
        ]);
        
        if (storedBudgetData) {
          setCategoryData(storedBudgetData);
        }
        
        // Validate and set current month
        if (storedMonth && isValidMonth(storedMonth)) {
          setCurrentMonth(storedMonth);
        } else {
          // Set to current month if invalid
          const now = new Date();
          const validMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          setCurrentMonth(validMonth);
          await saveCurrentMonth(validMonth);
        }
        
        setAccounts(storedAccounts || []);
        setTransactions(storedTransactions || []);
        
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Helper function to validate month format (YYYY-MM)
  const isValidMonth = (month) => {
    if (!month || typeof month !== 'string') return false;
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(month)) return false;
    
    const [year, monthNum] = month.split('-').map(Number);
    return year >= 2000 && year <= 2100 && monthNum >= 1 && monthNum <= 12;
  };

  // Auto-save effects
  useEffect(() => {
    if (!isLoading) {
      saveBudgetData(categoryData).catch(console.error);
    }
  }, [categoryData, isLoading]);

  useEffect(() => {
    if (!isLoading && currentMonth && isValidMonth(currentMonth)) {
      saveCurrentMonth(currentMonth).catch(console.error);
    }
  }, [currentMonth, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveTransactions(transactions).catch(console.error);
    }
  }, [transactions, isLoading]);

  const addAccount = async (account, openingBalance) => {
    try {
      const newAccount = { ...account, balance: openingBalance };
      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      return true;
    } catch (error) {
      console.error('Error adding account:', error);
      Alert.alert('Error', 'Failed to add account');
      return false;
    }
  };

  const addTransaction = async (transaction) => {
    try {
      // Validate transaction date
      if (!isValidDate(transaction.date)) {
        Alert.alert('Error', 'Invalid date format');
        return false;
      }

      const updatedTransactions = [...transactions, transaction];
      setTransactions(updatedTransactions);
      await saveTransactions(updatedTransactions);
      
      // Update category available amount
      const updatedData = { ...categoryData };
      let categoryFound = false;
      
      Object.keys(updatedData).forEach(groupKey => {
        const group = updatedData[groupKey];
        if (!group?.categories) return;
        
        const categoryIndex = group.categories.findIndex(cat => cat?.id === transaction.categoryId);
        if (categoryIndex !== -1) {
          // Update both available and activity
          group.categories[categoryIndex] = {
            ...group.categories[categoryIndex],
            available: (group.categories[categoryIndex].available || 0) - transaction.amount,
            activity: (group.categories[categoryIndex].activity || 0) - transaction.amount,
          };
          categoryFound = true;
        }
      });
      
      if (categoryFound) {
        setCategoryData(updatedData);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction');
      return false;
    }
  };

  // Helper function to validate date format (YYYY-MM-DD)
  const isValidDate = (dateString) => {
    if (!dateString) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && 
           date.getMonth() === month - 1 && 
           date.getDate() === day;
  };

  const deleteTransaction = async (transactionId) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return false;

      const updatedTransactions = transactions.filter(t => t.id !== transactionId);
      setTransactions(updatedTransactions);
      await saveTransactions(updatedTransactions);
      
      // Update category available amount (add back the amount)
      const updatedData = { ...categoryData };
      
      Object.keys(updatedData).forEach(groupKey => {
        const group = updatedData[groupKey];
        if (!group?.categories) return;
        
        const categoryIndex = group.categories.findIndex(cat => cat?.id === transaction.categoryId);
        if (categoryIndex !== -1) {
          group.categories[categoryIndex] = {
            ...group.categories[categoryIndex],
            available: (group.categories[categoryIndex].available || 0) + transaction.amount,
            activity: (group.categories[categoryIndex].activity || 0) + transaction.amount,
          };
        }
      });
      
      setCategoryData(updatedData);
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('Error', 'Failed to delete transaction');
      return false;
    }
  };

  const setCategoryBudget = async (categoryId, amount) => {
    try {
      // Find which group contains this category
      let foundGroup = null;
      let foundCategory = null;
      
      Object.keys(categoryData).forEach(groupKey => {
        const group = categoryData[groupKey];
        if (group?.categories) {
          const category = group.categories.find(c => c.id === categoryId);
          if (category) {
            foundGroup = groupKey;
            foundCategory = category;
          }
        }
      });

      if (!foundGroup || !foundCategory) {
        console.error('Category not found');
        return false;
      }

      // Update the category's assigned amount
      const updatedData = { ...categoryData };
      const categoryIndex = updatedData[foundGroup].categories.findIndex(
        c => c.id === categoryId
      );
      
      if (categoryIndex !== -1) {
        // Calculate activity (total spent) from transactions for this category in current month
        const { spent } = getCategorySpent(categoryId);
        
        updatedData[foundGroup].categories[categoryIndex] = {
          ...updatedData[foundGroup].categories[categoryIndex],
          assigned: amount,
          // Update available: assigned - spent
          available: amount - spent,
          activity: -spent, // Negative because it's spent
        };
      }

      // Update state (this will trigger auto-save through the useEffect)
      setCategoryData(updatedData);
      
      return true;
    } catch (error) {
      console.error('Error setting category budget:', error);
      return false;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const updatedData = { ...categoryData };
      let found = false;
      
      Object.keys(updatedData).forEach(groupKey => {
        const group = updatedData[groupKey];
        if (!group?.categories) return;
        
        const categoryIndex = group.categories.findIndex(cat => cat?.id === categoryId);
        if (categoryIndex !== -1) {
          group.categories.splice(categoryIndex, 1);
          found = true;
        }
      });

      if (found) {
        // Delete associated transactions
        const updatedTransactions = transactions.filter(t => t.categoryId !== categoryId);
        setTransactions(updatedTransactions);
        await saveTransactions(updatedTransactions);
        
        setCategoryData(updatedData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', 'Failed to delete category');
      return false;
    }
  };

  const changeMonth = async (newMonth) => {
    // Validate new month
    if (isValidMonth(newMonth)) {
      setCurrentMonth(newMonth);
    } else {
      console.error('Invalid month format:', newMonth);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getTotalBalance = () => {
    return calculateTotalBalance(accounts);
  };

  const getCategorySpent = (categoryId, month = currentMonth) => {
    // Ensure month is valid
    if (!month || !isValidMonth(month)) {
      month = currentMonth;
    }

    const monthTransactions = transactions.filter(t => {
      if (!t.date) return false;
      // Extract YYYY-MM from date (assuming YYYY-MM-DD format)
      const transactionMonth = t.date.substring(0, 7);
      return transactionMonth === month;
    });
    
    const catTransactions = monthTransactions.filter(t => t.categoryId === categoryId);
    const spent = catTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    return { spent, count: catTransactions.length, transactions: catTransactions };
  };

  const refreshData = async () => {
    try {
      const [storedTransactions, storedBudgetData] = await Promise.all([
        loadTransactions(),
        loadBudgetData()
      ]);
      
      setTransactions(storedTransactions || []);
      if (storedBudgetData) {
        setCategoryData(storedBudgetData);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const value = {
    categoryData,
    setCategoryData,
    currentMonth,
    accounts,
    transactions,
    isLoading,
    error,
   
    addAccount,
    addTransaction,
    deleteTransaction,
    setCategoryBudget,
    deleteCategory,
    changeMonth,
    formatCurrency,
    getTotalBalance,
    getCategorySpent,
    refreshData,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};