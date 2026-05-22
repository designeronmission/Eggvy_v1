// src/screens/AutoAssignScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBudget } from '../context/BudgetContext';
import { runAutoAssign, TIERS, TIER_NAMES, TIER_COLORS } from '../services/autoAssignEngine';
import Icon from 'react-native-vector-icons/Feather';
import TopBar from '../components/layout/TopBar';

const PRIMARY_COLOR = '#0A84FF';

const AutoAssignScreen = ({ navigation }) => {
  const budget = useBudget();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState('exact');
  const [selectedTiers, setSelectedTiers] = useState({
    [TIERS.OVERSPENT]: true,
    [TIERS.IMMEDIATE]: true,
    [TIERS.URGENT]: true,
    [TIERS.ESSENTIALS]: true,
    [TIERS.TRUE_EXPENSES]: true,
    [TIERS.SAVINGS]: true,
    [TIERS.LIFESTYLE]: true
  });
  const [hasAccounts, setHasAccounts] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategoriesFromBudget();
  }, [budget?.categoryData]);

  useEffect(() => {
    checkAccounts();
  }, []);

  const loadCategoriesFromBudget = () => {
    if (!budget?.categoryData) {
      console.log('No category data available');
      return;
    }

    try {
      const allCategories = [];
      
      Object.keys(budget.categoryData).forEach(groupKey => {
        const group = budget.categoryData[groupKey];
        if (group && group.categories && Array.isArray(group.categories)) {
          group.categories.forEach(category => {
            if (category && category.id) {
              const assigned = typeof category.assigned === 'number' ? category.assigned : 0;
              const targetAmount = typeof category.targetAmount === 'number' ? category.targetAmount : 0;
              const available = typeof category.available === 'number' ? category.available : 0;
              
              allCategories.push({
                id: category.id,
                name: category.name || 'Unnamed Category',
                groupName: group.name || groupKey,
                available: available,
                assigned: assigned,
                targetAmount: targetAmount,
                type: category.type || getCategoryTypeFromGroup(groupKey),
                priorityManual: category.priorityManual || 5,
                color: category.color || group.color || PRIMARY_COLOR,
                dueDate: category.dueDate || null,
                capMax: category.capMax || null,
                floorMin: category.floorMin || null
              });
            }
          });
        }
      });
      
      console.log('Loaded categories for auto-assign:', allCategories.length);
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const getCategoryTypeFromGroup = (groupKey) => {
    const groupLower = groupKey.toLowerCase();
    if (groupLower.includes('bill') || groupLower.includes('rent') || groupLower.includes('utility')) {
      return 'bill';
    } else if (groupLower.includes('essential') || groupLower.includes('need') || groupLower.includes('grocery')) {
      return 'essential';
    } else if (groupLower.includes('saving') || groupLower.includes('goal')) {
      return 'savings';
    } else if (groupLower.includes('true') || groupLower.includes('annual')) {
      return 'trueExpense';
    }
    return 'lifestyle';
  };

  const checkAccounts = async () => {
    try {
      if (!AsyncStorage) {
        console.error('AsyncStorage is not available');
        setHasAccounts(false);
        return;
      }
      
      const storedAccounts = await AsyncStorage.getItem('user_accounts');
      const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];
      
      if (accounts.length === 0) {
        setHasAccounts(false);
        Alert.alert(
          'No Accounts Found',
          'You need to add an account before you can auto-assign money.',
          [
            { 
              text: 'Add Account', 
              onPress: () => navigation.navigate('Budget', { openAddAccount: true })
            },
            { text: 'Go Back', onPress: () => navigation.goBack() }
          ]
        );
      } else {
        setHasAccounts(true);
      }
    } catch (error) {
      console.error('Error checking accounts:', error);
      setHasAccounts(false);
    }
  };

  const handlePreview = async () => {
    if (categories.length === 0) {
      Alert.alert('No Categories', 'Please create some categories first.');
      return;
    }

    setLoading(true);
    try {
      console.log('Running auto-assign with:', {
        readyToAssign: budget.readyToAssign,
        categoriesCount: categories.length,
        mode
      });

      const enabledTiers = Object.entries(selectedTiers)
        .filter(([_, enabled]) => enabled)
        .map(([tier]) => parseInt(tier));

      const result = await runAutoAssign({
        readyToAssign: budget.readyToAssign || 0,
        categories: categories,
        mode,
        enabledTiers: enabledTiers.length === 7 ? null : enabledTiers
      });

      console.log('Preview result:', result);
      
      if (result.allocations.length === 0) {
        Alert.alert('No Funding Needed', 'All categories are fully funded!');
      }
      
      setPreview(result);
    } catch (error) {
      console.error('Preview error:', error);
      Alert.alert('Error', 'Failed to generate preview: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!preview || preview.allocations.length === 0) {
      Alert.alert('Nothing to Assign', 'No categories need funding right now.');
      return;
    }

    Alert.alert(
      'Confirm Auto-Assign',
      `This will assign ${budget.formatCurrency(preview.stats.totalAllocated)} across ${preview.allocations.length} categories.\n\nRemaining to assign: ${budget.formatCurrency(preview.readyToAssignRemaining)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            setLoading(true);
            try {
              let successCount = 0;
              let totalAssigned = 0;
              let failedCategories = [];
              
              for (const allocation of preview.allocations) {
                console.log('Applying allocation:', allocation.categoryName, allocation.amount);
                try {
                  const success = await budget.assignMoneyToCategory(
                    allocation.categoryId,
                    allocation.amount
                  );
                  if (success) {
                    successCount++;
                    totalAssigned += allocation.amount;
                  } else {
                    failedCategories.push(allocation.categoryName);
                  }
                } catch (catError) {
                  console.error(`Failed to assign to ${allocation.categoryName}:`, catError);
                  failedCategories.push(allocation.categoryName);
                }
              }

              console.log('Auto-assign complete:', { successCount, totalAssigned, failedCategories });
              
              let message = `Assigned ${budget.formatCurrency(totalAssigned)} to ${successCount} categories`;
              if (failedCategories.length > 0) {
                message += `\n\nFailed to assign to: ${failedCategories.join(', ')}`;
              }
              
              Alert.alert(
                successCount > 0 ? 'Success' : 'Partial Success',
                message,
                [{ 
                  text: 'OK', 
                  onPress: () => {
                    navigation.goBack();
                  }
                }]
              );
            } catch (error) {
              console.error('Apply error:', error);
              Alert.alert('Error', 'Failed to apply allocations: ' + error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const toggleTier = (tier) => {
    setSelectedTiers(prev => ({
      ...prev,
      [tier]: !prev[tier]
    }));
  };

  const selectAllTiers = () => {
    const allTrue = Object.keys(selectedTiers).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setSelectedTiers(allTrue);
  };

  const clearAllTiers = () => {
    const allFalse = Object.keys(selectedTiers).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
    setSelectedTiers(allFalse);
  };

  const groupedPreview = preview?.allocations.reduce((acc, allocation) => {
    const tier = allocation.tier;
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(allocation);
    return acc;
  }, {});

  const enabledCount = Object.values(selectedTiers).filter(Boolean).length;

  if (!hasAccounts) {
    return (
      <View style={styles.container}>
        <TopBar 
          title="Auto-Assign Money" 
          showBack 
          onBackPress={() => navigation.goBack()} 
        />
        <View style={styles.noAccountsContainer}>
          <View style={styles.noAccountsIcon}>
            <Icon name="credit-card" size={48} color="#94A3B8" />
          </View>
          <Text style={styles.noAccountsTitle}>No Accounts Found</Text>
          <Text style={styles.noAccountsText}>
            You need to add an account before you can auto-assign money.
          </Text>
          <TouchableOpacity 
            style={styles.addAccountButton}
            onPress={() => navigation.navigate('Budget', { openAddAccount: true })}
          >
            <Text style={styles.addAccountButtonText}>Add Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar 
        title="Auto-Assign Money" 
        showBack 
        onBackPress={() => navigation.goBack()} 
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.rtaCard}>
          <View style={styles.rtaContent}>
            <View>
              <Text style={styles.rtaLabel}>Ready to Assign</Text>
              <Text style={[
                styles.rtaAmount,
                { color: budget.readyToAssign >= 0 ? '#FFFFFF' : '#DC2626' }
              ]}>
                {budget.formatCurrency(budget.readyToAssign)}
              </Text>
            </View>
            <View style={styles.rtaIcon}>
              <Icon name="dollar-sign" size={24} color="#FFFFFF" />
            </View>
          </View>
          {budget.readyToAssign <= 0 && (
            <Text style={styles.rtaWarning}>
              No funds available to assign
            </Text>
          )}
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Icon name="pie-chart" size={18} color={PRIMARY_COLOR} />
            <Text style={styles.overviewTitle}>Categories Overview</Text>
          </View>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatValue}>{categories.length}</Text>
              <Text style={styles.overviewStatLabel}>Total Categories</Text>
            </View>
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatValue}>
                {categories.filter(c => c.targetAmount > 0).length}
              </Text>
              <Text style={styles.overviewStatLabel}>With Targets</Text>
            </View>
            <View style={styles.overviewStatItem}>
              <Text style={styles.overviewStatValue}>
                {categories.filter(c => c.available < 0).length}
              </Text>
              <Text style={styles.overviewStatLabel}>Overspent</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assignment Mode</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'exact' && styles.modeButtonActive
              ]}
              onPress={() => setMode('exact')}
            >
              <View style={styles.modeIconContainer}>
                <Icon 
                  name="check-circle" 
                  size={20} 
                  color={mode === 'exact' ? PRIMARY_COLOR : '#64748B'} 
                />
              </View>
              <View style={styles.modeTextContainer}>
                <Text style={[
                  styles.modeButtonText,
                  mode === 'exact' && styles.modeButtonTextActive
                ]}>
                  Exact
                </Text>
                <Text style={styles.modeDescription}>
                  Fund categories fully in priority order
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'proportional' && styles.modeButtonActive
              ]}
              onPress={() => setMode('proportional')}
            >
              <View style={styles.modeIconContainer}>
                <Icon 
                  name="pie-chart" 
                  size={20} 
                  color={mode === 'proportional' ? PRIMARY_COLOR : '#64748B'} 
                />
              </View>
              <View style={styles.modeTextContainer}>
                <Text style={[
                  styles.modeButtonText,
                  mode === 'proportional' && styles.modeButtonTextActive
                ]}>
                  Proportional
                </Text>
                <Text style={styles.modeDescription}>
                  Split funds by priority when money is tight
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories to Fund</Text>
            <View style={styles.tierActions}>
              <TouchableOpacity onPress={selectAllTiers}>
                <Text style={[styles.tierActionText, selectedTiers[TIERS.OVERSPENT] && selectedTiers[TIERS.LIFESTYLE] ? styles.tierActionTextActive : null]}>
                  All
                </Text>
              </TouchableOpacity>
              <Text style={styles.tierActionDivider}>|</Text>
              <TouchableOpacity onPress={clearAllTiers}>
                <Text style={[styles.tierActionText, !selectedTiers[TIERS.OVERSPENT] && !selectedTiers[TIERS.IMMEDIATE] ? styles.tierActionTextActive : null]}>
                  None
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.selectedCount}>
            {enabledCount} of 7 category types selected
          </Text>

          {Object.entries(TIER_NAMES).map(([tierKey, tierName]) => {
            const tier = parseInt(tierKey);
            return (
              <View key={tier} style={styles.tierItem}>
                <Text style={styles.tierName}>{tierName}</Text>
                <Switch
                  value={selectedTiers[tier]}
                  onValueChange={() => toggleTier(tier)}
                  trackColor={{ false: '#E2E8F0', true: PRIMARY_COLOR }}
                  thumbColor={selectedTiers[tier] ? '#FFFFFF' : '#FFFFFF'}
                  ios_backgroundColor="#E2E8F0"
                />
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.previewButton,
            (loading || budget.readyToAssign <= 0 || categories.length === 0) && styles.previewButtonDisabled
          ]}
          onPress={handlePreview}
          disabled={loading || budget.readyToAssign <= 0 || categories.length === 0}
        >
          {loading ? (
            <ActivityIndicator color={PRIMARY_COLOR} />
          ) : (
            <>
              <Icon name="eye" size={20} color={PRIMARY_COLOR} />
              <Text style={styles.previewButtonText}>Preview Assignment</Text>
            </>
          )}
        </TouchableOpacity>

        {preview && preview.allocations.length > 0 && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview Results</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>TO ASSIGN</Text>
                <Text style={styles.statValueLarge}>
                  {budget.formatCurrency(preview.stats.totalNeeded)}
                </Text>
              </View>

              <View style={styles.statsRow}>
                <View style={[styles.statCard, styles.statCardSmall]}>
                  <Icon name="check-circle" size={16} color="#10B981" />
                  <Text style={styles.statLabel}>WILL FUND</Text>
                  <Text style={styles.statValueGreen}>
                    {budget.formatCurrency(preview.stats.totalAllocated)}
                  </Text>
                  <Text style={styles.statPercentage}>
                    {((preview.stats.totalAllocated / preview.stats.totalNeeded) * 100).toFixed(1)}%
                  </Text>
                </View>

                <View style={[styles.statCard, styles.statCardSmall]}>
                  <Icon name="dollar-sign" size={16} color={PRIMARY_COLOR} />
                  <Text style={styles.statLabel}>REMAINING</Text>
                  <Text style={styles.statValueBlue}>
                    {budget.formatCurrency(preview.readyToAssignRemaining)}
                  </Text>
                  <Text style={styles.statSubtext}>
                    {preview.readyToAssignRemaining > 0 ? "Unassigned" : "All allocated"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>Funding Progress</Text>
                <Text style={styles.progressPercentage}>
                  {((preview.stats.totalAllocated / preview.stats.totalNeeded) * 100).toFixed(1)}%
                </Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${(preview.stats.totalAllocated / preview.stats.totalNeeded) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{preview.allocations.length}</Text>
                <Text style={styles.summaryLabel}>Categories Funded</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {budget.formatCurrency(preview.stats.totalAllocated / preview.allocations.length)}
                </Text>
                <Text style={styles.summaryLabel}>Average</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{preview.stats.executionTimeMs}ms</Text>
                <Text style={styles.summaryLabel}>Time</Text>
              </View>
            </View>

            {Object.entries(groupedPreview || {})
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([tier, allocations]) => (
                <View key={tier} style={styles.tierGroup}>
                  <View style={styles.tierHeader}>
                    <View style={styles.tierHeaderLeft}>
                      <View style={[styles.tierDot, { backgroundColor: TIER_COLORS[tier] }]} />
                      <Text style={styles.tierHeaderText}>{TIER_NAMES[tier]}</Text>
                    </View>
                    <View style={styles.tierHeaderRight}>
                      <Text style={styles.tierCount}>{allocations.length}</Text>
                      <Text style={styles.tierTotal}>
                        {budget.formatCurrency(
                          allocations.reduce((sum, a) => sum + a.amount, 0)
                        )}
                      </Text>
                    </View>
                  </View>

                  {allocations.map((allocation, index) => (
                    <View key={index} style={styles.allocationItem}>
                      <View style={styles.allocationInfo}>
                        <Text style={styles.allocationCategory}>
                          {allocation.categoryName}
                        </Text>
                        <Text style={styles.allocationGroup}>
                          {allocation.groupName}
                        </Text>
                      </View>
                      <View style={styles.allocationAmount}>
                        <Text style={styles.allocationAmountText}>
                          {budget.formatCurrency(allocation.amount)}
                        </Text>
                        {allocation.amount < allocation.need && (
                          <View style={styles.allocationPartialContainer}>
                            <Text style={styles.allocationPartial}>
                              of {budget.formatCurrency(allocation.need)}
                            </Text>
                            <View style={styles.partialProgressBar}>
                              <View 
                                style={[
                                  styles.partialProgressFill, 
                                  { width: `${(allocation.amount / allocation.need) * 100}%` }
                                ]} 
                              />
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ))}

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.applyButtonText}>Apply Auto-Assign</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {preview && preview.allocations.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="check-circle" size={48} color="#10B981" />
            <Text style={styles.emptyStateTitle}>All Caught Up!</Text>
            <Text style={styles.emptyStateText}>
              No categories need funding right now.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  content: {
    flex: 1,
    padding: 16
  },
  rtaCard: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
  },
  rtaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  rtaLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },
  rtaAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rtaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rtaWarning: {
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: '#DC2626',
    padding: 12,
    textAlign: 'center',
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 8,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overviewStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  tierActions: {
    flexDirection: 'row',
    gap: 8,
  },
  tierActionText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  tierActionTextActive: {
    color: PRIMARY_COLOR,
  },
  tierActionDivider: {
    fontSize: 13,
    color: '#E2E8F0',
  },
  selectedCount: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  tierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tierName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  modeButtons: {
    gap: 12,
    marginTop: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  modeButtonActive: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#F0F9FF',
  },
  modeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeTextContainer: {
    flex: 1,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  modeButtonTextActive: {
    color: PRIMARY_COLOR,
  },
  modeDescription: {
    fontSize: 12,
    color: '#94A3B8',
  },
  previewButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  previewButtonDisabled: {
    opacity: 0.5,
    borderColor: '#94A3B8',
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  previewSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardSmall: {
    flex: 1,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statValueLarge: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  statValueGreen: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 2,
  },
  statValueBlue: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY_COLOR,
    marginBottom: 2,
  },
  statPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  statSubtext: {
    fontSize: 10,
    color: '#94A3B8',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 3,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  tierGroup: {
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tierHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tierHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  tierTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  allocationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  allocationInfo: {
    flex: 1,
    marginRight: 12,
  },
  allocationCategory: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  allocationGroup: {
    fontSize: 11,
    color: '#64748B',
  },
  allocationAmount: {
    alignItems: 'flex-end',
    minWidth: 90,
  },
  allocationAmountText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginBottom: 2,
  },
  allocationPartialContainer: {
    alignItems: 'flex-end',
    width: '100%',
  },
  allocationPartial: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
  },
  partialProgressBar: {
    width: 50,
    height: 2,
    backgroundColor: '#F1F5F9',
    borderRadius: 1,
    overflow: 'hidden',
  },
  partialProgressFill: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 1,
  },
  applyButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  noAccountsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noAccountsIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noAccountsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  noAccountsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addAccountButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addAccountButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AutoAssignScreen;