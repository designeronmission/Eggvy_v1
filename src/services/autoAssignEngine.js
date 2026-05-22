// src/services/autoAssignEngine.js
import { calculateCategoryNeed } from './autoAssignScoring';

/**
 * TIER DEFINITIONS
 * Lower number = higher priority
 */
export const TIERS = {
  OVERSPENT: 0,        // Negative balances - MUST fix first
  IMMEDIATE: 1,        // Due within 7 days
  URGENT: 2,           // Due within 30 days
  ESSENTIALS: 3,       // Food, utilities, etc.
  TRUE_EXPENSES: 4,    // Annual bills, sinking funds
  SAVINGS: 5,          // Goals, emergency fund
  LIFESTYLE: 6         // Dining out, entertainment
};

export const TIER_NAMES = {
  [TIERS.OVERSPENT]: '🚨 Overspending',
  [TIERS.IMMEDIATE]: '⚠️ Due This Week',
  [TIERS.URGENT]: '📅 Due This Month',
  [TIERS.ESSENTIALS]: '🛒 Essentials',
  [TIERS.TRUE_EXPENSES]: '📋 True Expenses',
  [TIERS.SAVINGS]: '💰 Savings Goals',
  [TIERS.LIFESTYLE]: '🎉 Lifestyle'
};

export const TIER_COLORS = {
  [TIERS.OVERSPENT]: '#DC2626',
  [TIERS.IMMEDIATE]: '#F97316',
  [TIERS.URGENT]: '#EAB308',
  [TIERS.ESSENTIALS]: '#0A84FF',
  [TIERS.TRUE_EXPENSES]: '#8B5CF6',
  [TIERS.SAVINGS]: '#10B981',
  [TIERS.LIFESTYLE]: '#6B7280'
};

/**
 * Determine tier for a category
 */
export const getCategoryTier = (category, currentDate = new Date()) => {
  try {
    if (!category) return TIERS.LIFESTYLE;

    // OVERSPENT TIER - Highest priority
    if (typeof category.available === 'number' && category.available < 0) {
      return TIERS.OVERSPENT;
    }

    // Check due dates for immediate/urgent priorities
    if (category.dueDate) {
      const dueDate = new Date(category.dueDate);
      const daysUntilDue = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 7) {
        return TIERS.IMMEDIATE;
      }
      if (daysUntilDue <= 30) {
        return TIERS.URGENT;
      }
    }

    // Type-based tiers
    if (category.type === 'essential' || category.type === 'bill') {
      return TIERS.ESSENTIALS;
    }
    
    if (category.type === 'sinking' || category.type === 'trueExpense') {
      return TIERS.TRUE_EXPENSES;
    }
    
    if (category.type === 'savings') {
      return TIERS.SAVINGS;
    }

    return TIERS.LIFESTYLE;
  } catch (error) {
    console.error('Error in getCategoryTier:', error);
    return TIERS.LIFESTYLE;
  }
};

/**
 * Calculate priority score (higher = more urgent)
 */
const calculatePriorityScore = (category, needed) => {
  try {
    if (!category) return 0;

    let score = 0;

    // Manual priority (1-10, default 5)
    score += (typeof category.priorityManual === 'number' ? category.priorityManual : 5) * 10;

    // Essential category bonus
    if (category.type === 'essential' || category.type === 'bill') {
      score += 50;
    }

    // Negative balance - maximum urgency
    if (typeof category.available === 'number' && category.available < 0) {
      score += 500;
    }

    // Due date urgency
    if (category.dueDate) {
      const dueDate = new Date(category.dueDate);
      const currentDate = new Date();
      const daysUntilDue = Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue <= 0) {
        score += 200; // Past due
      } else if (daysUntilDue <= 7) {
        score += 150; // Due this week
      } else if (daysUntilDue <= 30) {
        score += 100; // Due this month
      } else {
        score += 50; // Future due
      }
    }

    // Larger needed amount gets higher priority
    if (needed > 0) {
      score += Math.min(needed / 100, 100); // Up to 100 points based on amount
    }

    return score;
  } catch (error) {
    console.error('Error in calculatePriorityScore:', error);
    return 0;
  }
};

/**
 * Calculate how much each category needs
 */
export const calculateNeeds = (categories, readyToAssign, currentDate) => {
  try {
    const needs = [];
    let totalNeeded = 0;

    if (!categories || !Array.isArray(categories)) {
      console.error('calculateNeeds: categories is not an array', categories);
      return { needs: [], totalNeeded: 0 };
    }

    categories.forEach((category) => {
      try {
        if (!category) return;

        // Calculate need based on category data
        let need = 0;
        
        // Check for overspending first (highest priority)
        if (category.available < 0) {
          need = Math.abs(category.available);
        }
        // Check if category has a target
        else if (category.targetAmount > 0) {
          // Calculate how much more we need to reach the target
          const currentAssigned = category.assigned || 0;
          const targetRemaining = Math.max(0, category.targetAmount - currentAssigned);
          
          // Only consider it a need if we haven't met the target yet
          if (targetRemaining > 0) {
            need = targetRemaining;
          }
        }

        // Only add to needs if there's actually a need
        if (need > 0.01) { // Small threshold to avoid floating point issues
          const tier = getCategoryTier(category, currentDate);
          const score = calculatePriorityScore(category, need);
          
          needs.push({
            ...category,
            needed: need,
            tier,
            score
          });
          
          totalNeeded += need;
        }
      } catch (catError) {
        console.error(`Error processing category:`, catError);
      }
    });

    // Sort needs by tier and score
    const sortedNeeds = needs.sort((a, b) => {
      // First by tier (lower tier number = higher priority)
      if (a.tier !== b.tier) return a.tier - b.tier;
      // Then by score (higher score = higher priority)
      return b.score - a.score;
    });

    return {
      needs: sortedNeeds,
      totalNeeded
    };
  } catch (error) {
    console.error('calculateNeeds error:', error);
    return { needs: [], totalNeeded: 0 };
  }
};

/**
 * MAIN AUTO-ASSIGN ENGINE
 */
export const runAutoAssign = async ({
  readyToAssign,
  categories,
  mode = 'exact',
  enabledTiers = null,
  options = {}
}) => {
  try {
    console.log('🚀 AutoAssign Started:', { 
      readyToAssign, 
      categoriesCount: categories?.length,
      mode
    });
    
    const startTime = Date.now();
    const currentDate = new Date();
    
    // Validate inputs
    if (!categories || !Array.isArray(categories)) {
      console.error('Categories is not an array:', categories);
      return {
        success: false,
        error: 'Invalid categories data',
        allocations: [],
        readyToAssignRemaining: readyToAssign,
        stats: {
          categoriesFunded: 0,
          totalAllocated: 0,
          totalNeeded: 0,
          executionTimeMs: Date.now() - startTime
        }
      };
    }
    
    // Step 1: Calculate needs for all categories
    const { needs, totalNeeded } = calculateNeeds(categories, readyToAssign, currentDate);
    
    // Log needs for debugging
    console.log('Categories with needs:', needs.map(n => ({
      name: n.name,
      needed: n.needed,
      assigned: n.assigned,
      targetAmount: n.targetAmount
    })));
    
    // Step 2: Filter by enabled tiers if specified
    let filteredNeeds = needs;
    if (enabledTiers && Array.isArray(enabledTiers) && enabledTiers.length > 0) {
      filteredNeeds = needs.filter(n => enabledTiers.includes(n.tier));
    }
    
    // Step 3: If nothing needs funding, return early
    if (!filteredNeeds || filteredNeeds.length === 0) {
      return {
        success: true,
        allocations: [],
        readyToAssignRemaining: readyToAssign,
        stats: {
          categoriesFunded: 0,
          totalAllocated: 0,
          totalNeeded: 0,
          executionTimeMs: Date.now() - startTime
        }
      };
    }

    let remainingToAssign = readyToAssign;
    const allocationMap = new Map();

    // Step 4: Group by tier for tier-based processing
    const needsByTier = {};
    Object.values(TIERS).forEach(tier => {
      needsByTier[tier] = filteredNeeds.filter(n => n && n.tier === tier);
    });

    // Step 5: Process tiers in order
    for (let tier = 0; tier <= 6; tier++) {
      if (remainingToAssign <= 0) break;
      
      const tierNeeds = needsByTier[tier] || [];
      if (tierNeeds.length === 0) continue;

      // Calculate total needed in this tier
      const tierTotalNeeded = tierNeeds.reduce((sum, cat) => {
        return sum + (cat?.needed || 0);
      }, 0);

      if (mode === 'proportional' && remainingToAssign < tierTotalNeeded) {
        // PROPORTIONAL MODE: Split available funds based on scores
        const totalScore = tierNeeds.reduce((sum, cat) => {
          return sum + (cat?.score || 0);
        }, 0);
        
        tierNeeds.forEach(category => {
          if (!category || !category.id) return;
          
          const share = totalScore > 0 ? (category.score || 0) / totalScore : 1 / tierNeeds.length;
          const allocatable = Math.min(
            remainingToAssign * share,
            category.needed || 0
          );

          if (allocatable > 0.01) {
            allocationMap.set(category.id, {
              amount: allocatable,
              category: category
            });
            remainingToAssign -= allocatable;
          }
        });
      } else {
        // EXACT MODE: Fund categories fully until money runs out
        for (const category of tierNeeds) {
          if (!category || !category.id) continue;
          if (remainingToAssign <= 0) break;

          const allocatable = Math.min(
            category.needed || 0,
            remainingToAssign
          );

          if (allocatable > 0.01) {
            allocationMap.set(category.id, {
              amount: allocatable,
              category: category
            });
            remainingToAssign -= allocatable;
          }
        }
      }
    }

    // Step 6: Convert allocation map to array format
    const finalAllocations = [];
    for (const [categoryId, data] of allocationMap.entries()) {
      finalAllocations.push({
        categoryId,
        amount: data.amount,
        categoryName: data.category.name,
        groupName: data.category.groupName,
        tier: data.category.tier,
        need: data.category.needed,
        score: data.category.score
      });
    }

    console.log('Final allocations:', finalAllocations);

    return {
      success: true,
      allocations: finalAllocations,
      readyToAssignRemaining: remainingToAssign,
      stats: {
        categoriesFunded: finalAllocations.length,
        totalAllocated: readyToAssign - remainingToAssign,
        totalNeeded,
        executionTimeMs: Date.now() - startTime
      }
    };
  } catch (error) {
    console.error('❌ AutoAssign Error:', error);
    return {
      success: false,
      error: error.message,
      allocations: [],
      readyToAssignRemaining: readyToAssign,
      stats: {
        categoriesFunded: 0,
        totalAllocated: 0,
        totalNeeded: 0,
        executionTimeMs: 0
      }
    };
  }
};

/**
 * Run auto-assign with specific strategy
 */
export const runSmartAssign = async (params, strategy = 'balanced') => {
  switch (strategy) {
    case 'aggressive':
      return await runAutoAssign({
        ...params,
        options: { goalWeight: 2 }
      });
    
    case 'conservative':
      return await runAutoAssign({
        ...params,
        enabledTiers: [TIERS.OVERSPENT, TIERS.IMMEDIATE, TIERS.URGENT, TIERS.ESSENTIALS]
      });
    
    case 'balanced':
    default:
      return await runAutoAssign(params);
  }
};