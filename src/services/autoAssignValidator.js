// src/services/autoAssignValidator.js

/**
 * Validate allocations against constraints
 */
export const validateAllocations = (
  allocationMap,
  categories,
  originalReadyToAssign,
  remainingToAssign
) => {
  try {
    // Guard against undefined inputs
    if (!allocationMap || !(allocationMap instanceof Map)) {
      console.warn('validateAllocations: allocationMap is not a valid Map');
      return [];
    }
    
    if (!categories || !Array.isArray(categories)) {
      console.warn('validateAllocations: categories is not an array');
      return [];
    }

    const validated = [];
    const categoryMap = new Map(categories.map(c => [c?.id, c]));

    // Track total allocated
    let totalAllocated = 0;

    for (const [categoryId, amount] of allocationMap.entries()) {
      if (!categoryId) continue;
      
      const category = categoryMap.get(categoryId);
      if (!category) continue;

      // Calculate safe amount (can't assign more than needed)
      const need = calculateCategoryNeedForValidation(category);
      const safeAmount = Math.min(amount || 0, need || 0);

      // Constraint: Cap maximum
      if (category.capMax && typeof category.capMax === 'number') {
        const newTotal = (category.assigned || 0) + safeAmount;
        if (newTotal > category.capMax) {
          const cappedAmount = Math.max(0, category.capMax - (category.assigned || 0));
          if (cappedAmount > 0) {
            validated.push({
              categoryId,
              amount: cappedAmount,
              originalAmount: amount,
              capped: true,
              categoryName: category.name || 'Unknown',
              groupName: category.groupName || 'Uncategorized',
              tier: category.tier || 6,
              need: need
            });
            totalAllocated += cappedAmount;
          }
          continue;
        }
      }

      if (safeAmount > 0) {
        validated.push({
          categoryId,
          amount: safeAmount,
          originalAmount: amount,
          capped: false,
          categoryName: category.name || 'Unknown',
          groupName: category.groupName || 'Uncategorized',
          tier: category.tier || 6,
          need: need
        });
        totalAllocated += safeAmount;
      }
    }

    // Constraint: Total allocated can't exceed original ready to assign
    if (totalAllocated > originalReadyToAssign) {
      console.error('Validation failed: Total allocation exceeds available funds');
      return [];
    }

    return validated;
  } catch (error) {
    console.error('Error in validateAllocations:', error);
    return [];
  }
};

/**
 * Check if allocation would cause any issues
 */
export const wouldCauseOverspending = (allocations, categories) => {
  try {
    if (!allocations || !Array.isArray(allocations) || !categories || !Array.isArray(categories)) {
      return null;
    }
    
    const categoryMap = new Map(categories.map(c => [c?.id, c]));

    for (const allocation of allocations) {
      if (!allocation || !allocation.categoryId) continue;
      
      const category = categoryMap.get(allocation.categoryId);
      if (!category) continue;

      const newAvailable = (category.available || 0) + (allocation.amount || 0);
      
      // If category had target and we're over-funding
      if (category.targetAmount && newAvailable > category.targetAmount) {
        return {
          issue: 'overfunding',
          categoryId: category.id,
          categoryName: category.name || 'Unknown',
          excess: newAvailable - category.targetAmount
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error in wouldCauseOverspending:', error);
    return null;
  }
};

/**
 * Ensure minimum balances are maintained
 */
export const enforceMinimums = (allocations, categories) => {
  try {
    if (!allocations || !Array.isArray(allocations) || !categories || !Array.isArray(categories)) {
      return allocations || [];
    }
    
    const finalAllocations = [...allocations];
    const categoryMap = new Map(categories.map(c => [c?.id, c]));

    // First pass: ensure minimums
    for (const allocation of finalAllocations) {
      if (!allocation || !allocation.categoryId) continue;
      
      const category = categoryMap.get(allocation.categoryId);
      if (!category || !category.floorMin) continue;

      const newAssigned = (category.assigned || 0) + (allocation.amount || 0);
      
      // If we're not meeting minimum, adjust upward
      if (newAssigned < category.floorMin) {
        const additionalNeeded = category.floorMin - newAssigned;
        
        // Try to take from remaining funds
        allocation.amount = (allocation.amount || 0) + additionalNeeded;
      }
    }

    return finalAllocations;
  } catch (error) {
    console.error('Error in enforceMinimums:', error);
    return allocations || [];
  }
};

// Helper function to calculate need for validation
const calculateCategoryNeedForValidation = (category) => {
  try {
    if (!category) return 0;
    
    // If negative balance, need to cover the deficit
    if (category.available < 0) {
      return Math.abs(category.available);
    }

    // If has target amount
    if (category.targetAmount && category.targetAmount > 0) {
      const target = category.targetAmount;
      const current = category.available || 0;
      
      if (current < target) {
        return target - current;
      }
    }

    return 0;
  } catch (error) {
    return 0;
  }
};