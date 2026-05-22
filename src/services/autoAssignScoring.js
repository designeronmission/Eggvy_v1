// src/services/autoAssignScoring.js

/**
 * Calculate how much a category needs based on its target type
 */
export const calculateCategoryNeed = (category, currentDate = new Date()) => {
  try {
    // Guard against undefined category
    if (!category) return 0;
    
    // Negative balance - need to cover the deficit (HIGHEST PRIORITY)
    if (category.available < 0) {
      return Math.abs(category.available);
    }

    // If category has a target amount (monthly budget), calculate need
    if (category.targetAmount && category.targetAmount > 0) {
      const target = category.targetAmount;
      const assigned = category.assigned || 0;
      
      // If assigned is less than target, need the difference
      if (assigned < target) {
        return target - assigned;
      }
    }

    // If no target but has assigned amount, maybe it's fully funded
    return 0;
  } catch (error) {
    console.error('Error in calculateCategoryNeed:', error);
    return 0;
  }
};

/**
 * Monthly target - need full amount each month
 */
const calculateMonthlyNeed = (category) => {
  const target = category.targetAmount || 0;
  const assigned = category.assigned || 0;
  
  // If already fully funded, need 0
  if (assigned >= target) return 0;
  
  return target - assigned;
};

/**
 * Date-based target - spread cost over remaining months
 */
const calculateDateBasedNeed = (category, currentDate) => {
  if (!category.dueDate || !category.targetAmount) return 0;

  try {
    const dueDate = new Date(category.dueDate);
    const targetAmount = category.targetAmount;
    const currentBalance = category.available || 0;
    
    // If past due, need full remaining amount
    if (dueDate <= currentDate) {
      return Math.max(0, targetAmount - currentBalance);
    }

    // Calculate months remaining
    const monthsRemaining = (
      (dueDate.getFullYear() - currentDate.getFullYear()) * 12 +
      (dueDate.getMonth() - currentDate.getMonth())
    );

    // If due this month, need full amount
    if (monthsRemaining <= 0) {
      return Math.max(0, targetAmount - currentBalance);
    }

    // Spread the remaining need over remaining months
    const remainingNeeded = Math.max(0, targetAmount - currentBalance);
    return Math.ceil(remainingNeeded / monthsRemaining);
  } catch (error) {
    console.error('Error in calculateDateBasedNeed:', error);
    return 0;
  }
};

/**
 * Savings builder - consistent monthly contribution
 */
const calculateSavingsBuilderNeed = (category) => {
  return category.monthlyContribution || 0;
};

/**
 * Target balance - need until hitting target
 */
const calculateTargetBalanceNeed = (category) => {
  if (!category.targetAmount) return 0;
  
  const target = category.targetAmount;
  const current = category.available || 0;
  
  if (current >= target) return 0;
  
  return target - current;
};

/**
 * Get human-readable description of why category needs funding
 */
export const getNeedDescription = (category) => {
  try {
    if (!category) return 'Unknown';
    
    if (category.available < 0) {
      return `Overspent: ${formatCurrency(Math.abs(category.available))}`;
    }

    if (category.targetAmount && category.targetAmount > 0) {
      const need = category.targetAmount - (category.assigned || 0);
      if (need > 0) {
        return `Monthly target: ${formatCurrency(need)} needed`;
      }
    }

    return 'Fully funded';
  } catch (error) {
    return 'Error calculating need';
  }
};

const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  } catch (error) {
    return `$${amount || 0}`;
  }
};