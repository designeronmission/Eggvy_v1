// src/utils/budgetUtils.js

/**
 * Calculate category metrics (spending, remaining, goal progress)
 */
export const calculateCategoryMetrics = (categories, categoryId) => {
  if (!categories || !Array.isArray(categories)) {
    return null;
  }
  
  const category = categories.find(c => c && c.id === categoryId);
  if (!category) return null;

  const spent = Math.abs(category.activity || 0);
  const remaining = category.available || 0;
  const assigned = category.assigned || 0;
  
  // Calculate goal progress
  let goalProgress = null;
  if (category.targetAmount) {
    goalProgress = ((category.available || 0) / category.targetAmount) * 100;
  }

  return {
    spent,
    remaining,
    assigned,
    overspent: remaining < 0,
    goalProgress,
    isGoalMet: (category.available || 0) >= category.targetAmount
  };
};

/**
 * Calculate budget totals
 */
export const calculateBudgetTotals = (categories) => {
  if (!categories || !Array.isArray(categories)) {
    return { totalAssigned: 0, totalActivity: 0, totalAvailable: 0 };
  }

  const totals = categories.reduce((acc, cat) => {
    if (cat && !cat.isHidden) {
      acc.totalAssigned += cat.assigned || 0;
      acc.totalActivity += cat.activity || 0;
      acc.totalAvailable += cat.available || 0;
    }
    return acc;
  }, { totalAssigned: 0, totalActivity: 0, totalAvailable: 0 });

  return totals;
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  const numAmount = amount || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

/**
 * Calculate age of money (simplified)
 */
export const calculateAgeOfMoney = (transactions) => {
  // Simplified version - in real app, would analyze spending patterns
  const avgDaysSinceEarned = 30; // Placeholder
  return avgDaysSinceEarned;
};

/**
 * Get month name from date string
 */
export const getMonthName = (dateStr) => {
  try {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  } catch (error) {
    return dateStr;
  }
};

/**
 * Calculate days until due date
 */
export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  
  try {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    return null;
  }
};

/**
 * Get status text for due date
 */
export const getDueStatus = (dueDate) => {
  const days = getDaysUntilDue(dueDate);
  
  if (days === null) return null;
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Due Today';
  if (days === 1) return 'Due Tomorrow';
  if (days <= 7) return `Due in ${days} days`;
  return `Due in ${days} days`;
};