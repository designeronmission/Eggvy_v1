// src/services/autoAssignHistory.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'auto_assign_history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Record a batch of allocations for undo
 */
export const recordAllocationBatch = async (allocations, previousCategories) => {
  try {
    // Guard against invalid inputs
    if (!allocations || !Array.isArray(allocations)) {
      console.warn('recordAllocationBatch: allocations is not an array');
      return null;
    }
    
    if (!previousCategories || !Array.isArray(previousCategories)) {
      console.warn('recordAllocationBatch: previousCategories is not an array');
      return null;
    }

    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const batch = {
      id: batchId,
      timestamp: new Date().toISOString(),
      allocations: allocations.map(a => ({
        categoryId: a.categoryId,
        amount: a.amount,
        categoryName: a.categoryName
      })),
      previousState: previousCategories.map(c => ({
        id: c?.id,
        assigned: c?.assigned || 0,
        available: c?.available || 0
      })).filter(c => c.id) // Remove any entries without ID
    };

    // Get existing history
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    const history = historyJson ? JSON.parse(historyJson) : [];
    
    // Add new batch
    history.unshift(batch);
    
    // Keep only last MAX_HISTORY_ITEMS
    if (history.length > MAX_HISTORY_ITEMS) {
      history.pop();
    }
    
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return batchId;
  } catch (error) {
    console.error('Error recording allocation history:', error);
    return null;
  }
};

/**
 * Undo the most recent allocation batch
 */
export const undoLastAllocation = async () => {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    if (!historyJson) return null;
    
    const history = JSON.parse(historyJson);
    if (history.length === 0) return null;
    
    const lastBatch = history[0];
    
    // Remove from history
    history.shift();
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    
    return lastBatch;
  } catch (error) {
    console.error('Error undoing allocation:', error);
    return null;
  }
};

/**
 * Get allocation history
 */
export const getAllocationHistory = async () => {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error loading allocation history:', error);
    return [];
  }
};

/**
 * Clear all history
 */
export const clearAllocationHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing allocation history:', error);
  }
};