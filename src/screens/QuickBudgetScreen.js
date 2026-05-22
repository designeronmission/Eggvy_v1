// src/screens/QuickBudgetScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useBudget } from '../context/BudgetContext';
import Icon from 'react-native-vector-icons/Feather';
import TopBar from '../components/layout/TopBar';
import LinearGradient from 'react-native-linear-gradient';

const PRIMARY_COLOR = '#0A84FF';
const colors = {
  primary: PRIMARY_COLOR,
  primaryLight: '#F0F9FF',
  success: '#34C759',
  successLight: '#E6F7E6',
  warning: '#FF9F0A',
  warningLight: '#FFF4E5',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  info: '#5856D6',
  infoLight: '#EEEDFF',
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
};

const QuickBudgetScreen = ({ navigation }) => {
  const budget = useBudget();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [readyToAssign, setReadyToAssign] = useState(0);

  useEffect(() => {
    loadCategories();
    setReadyToAssign(budget?.readyToAssign || 0);
  }, [budget?.categoryData, budget?.readyToAssign]);

  const loadCategories = () => {
    if (!budget?.categoryData) return;

    const allCategories = [];
    
    Object.keys(budget.categoryData).forEach(groupKey => {
      const group = budget.categoryData[groupKey];
      if (group && group.categories && Array.isArray(group.categories)) {
        group.categories.forEach(cat => {
          if (cat && cat.id) {
            allCategories.push({
              ...cat,
              groupName: group.name || groupKey,
              groupColor: group.color || PRIMARY_COLOR,
            });
          }
        });
      }
    });
    
    setCategories(allCategories);
  };

  const quickActions = [
    {
      id: 'underfunded',
      name: 'Underfunded',
      icon: 'alert-circle',
      description: 'Budget to meet goals',
      color: colors.warning,
      lightColor: colors.warningLight,
    },
    {
      id: 'snooze',
      name: 'Snooze',
      icon: 'clock',
      description: 'Move to next month',
      color: colors.info,
      lightColor: colors.infoLight,
    },
    {
      id: 'reset',
      name: 'Reset',
      icon: 'refresh-cw',
      description: 'Reset assigned amounts',
      color: colors.danger,
      lightColor: colors.dangerLight,
    },
    {
      id: 'steal',
      name: 'Steal From',
      icon: 'arrow-left-circle',
      description: 'Move from overspent',
      color: colors.primary,
      lightColor: colors.primaryLight,
    }
  ];

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const selectAll = () => {
    const allCategoryIds = categories
      .filter(c => !c.isHidden)
      .map(c => c.id);
    setSelectedCategories(allCategoryIds);
  };

  const clearAll = () => {
    setSelectedCategories([]);
  };

  const handleQuickAction = (action) => {
    if (selectedCategories.length === 0) {
      Alert.alert('No Categories Selected', 'Please select at least one category');
      return;
    }

    switch (action.id) {
      case 'underfunded':
        handleUnderfunded();
        break;
      case 'snooze':
        handleSnooze();
        break;
      case 'reset':
        handleReset();
        break;
      case 'steal':
        handleSteal();
        break;
    }
  };

  const handleUnderfunded = () => {
    let totalNeeded = 0;
    const updates = [];

    selectedCategories.forEach(catId => {
      const category = categories.find(c => c.id === catId);
      if (category && category.targetAmount) {
        const needed = category.targetAmount - category.assigned;
        if (needed > 0) {
          totalNeeded += needed;
          updates.push({ categoryId: catId, amount: needed });
        }
      }
    });

    if (totalNeeded === 0) {
      Alert.alert('No Underfunded Categories', 'Selected categories are fully funded');
      return;
    }

    if (totalNeeded > readyToAssign) {
      Alert.alert(
        'Insufficient Funds',
        `Need ${budget.formatCurrency(totalNeeded)} but only ${budget.formatCurrency(readyToAssign)} available`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Assign Available', 
            onPress: async () => {
              try {
                for (const update of updates) {
                  const amount = Math.min(update.amount, readyToAssign / updates.length);
                  await budget.assignMoneyToCategory(update.categoryId, amount);
                }
                Alert.alert('Success', 'Available funds have been distributed');
                setSelectedCategories([]);
                navigation.goBack();
              } catch (error) {
                console.error('Error assigning money:', error);
                Alert.alert('Error', 'Failed to assign money');
              }
            }
          }
        ]
      );
      return;
    }

    Alert.alert(
      'Budget Underfunded',
      `This will assign ${budget.formatCurrency(totalNeeded)} to ${selectedCategories.length} categories. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Budget',
          onPress: async () => {
            try {
              for (const update of updates) {
                await budget.assignMoneyToCategory(update.categoryId, update.amount);
              }
              Alert.alert('Success', 'Categories have been budgeted');
              setSelectedCategories([]);
              navigation.goBack();
            } catch (error) {
              console.error('Error budgeting:', error);
              Alert.alert('Error', 'Failed to budget categories');
            }
          }
        }
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Categories',
      `This will set assigned amounts to $0 for ${selectedCategories.length} categories. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const catId of selectedCategories) {
                const category = categories.find(c => c.id === catId);
                if (category && category.assigned > 0) {
                  await budget.assignMoneyToCategory(catId, -category.assigned);
                }
              }
              Alert.alert('Success', 'Categories have been reset');
              setSelectedCategories([]);
              navigation.goBack();
            } catch (error) {
              console.error('Error resetting categories:', error);
              Alert.alert('Error', 'Failed to reset categories');
            }
          }
        }
      ]
    );
  };

  const handleSnooze = () => {
    Alert.alert(
      'Snooze Categories',
      `Move available balances to next month for ${selectedCategories.length} categories?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Snooze',
          onPress: () => {
            Alert.alert('Success', 'Categories have been snoozed');
            setSelectedCategories([]);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleSteal = () => {
    navigation.navigate('MoveMoneyScreen');
  };

  const selectedCategoriesData = categories.filter(c => selectedCategories.includes(c.id));
  const totalAssigned = selectedCategoriesData.reduce((sum, cat) => sum + cat.assigned, 0);

  return (
    <View style={styles.container}>
      <TopBar 
        title="Quick Budget" 
        showBack 
        onBackPress={() => navigation.goBack()} 
      />

      <LinearGradient
        colors={['#34C759', '#2E7D32']}
        style={styles.rtaBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.rtaBannerContent}>
          <View style={styles.rtaBannerIcon}>
            <Icon name="dollar-sign" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.rtaBannerLabel}>Ready to Assign</Text>
            <Text style={styles.rtaBannerAmount}>
              {budget.formatCurrency(readyToAssign)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { borderColor: action.color }]}
              onPress={() => handleQuickAction(action)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.lightColor }]}>
                <Icon name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionName}>{action.name}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.selectionBar}>
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionCount}>
            {selectedCategories.length} categories selected
          </Text>
          <Text style={styles.selectionTotal}>
            Total Assigned: {budget.formatCurrency(totalAssigned)}
          </Text>
        </View>
        <View style={styles.selectionButtons}>
          <TouchableOpacity onPress={selectAll} style={styles.selectionButton}>
            <Text style={styles.selectionButtonText}>Select All</Text>
          </TouchableOpacity>
          <Text style={styles.selectionDivider}>|</Text>
          <TouchableOpacity onPress={clearAll} style={styles.selectionButton}>
            <Text style={styles.selectionButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.categoriesSection}
        showsVerticalScrollIndicator={false}
      >
        {categories.filter(c => !c.isHidden).map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategories.includes(category.id) && styles.selectedCategoryCard
            ]}
            onPress={() => toggleCategory(category.id)}
            activeOpacity={0.7}
          >
            <View style={styles.categoryCardLeft}>
              <View style={[styles.categoryIcon, { 
                backgroundColor: selectedCategories.includes(category.id)
                  ? colors.primaryLight
                  : colors.background
              }]}>
                <Icon 
                  name={selectedCategories.includes(category.id) ? 'check-circle' : 'circle'} 
                  size={24} 
                  color={selectedCategories.includes(category.id) ? colors.primary : colors.textTertiary} 
                />
              </View>
              <View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <View style={styles.categoryStats}>
                  <Text style={styles.categoryStat}>
                    Assigned: {budget.formatCurrency(category.assigned)}
                  </Text>
                  {category.targetAmount > 0 && (
                    <>
                      <Text style={styles.statDivider}>•</Text>
                      <Text style={styles.categoryGoal}>
                        Goal: {budget.formatCurrency(category.targetAmount)}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.categoryCardRight}>
              <Text style={[
                styles.categoryAvailable,
                category.available > 0 && styles.positiveText,
                category.available < 0 && styles.negativeText
              ]}>
                {budget.formatCurrency(category.available)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  rtaBanner: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  rtaBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rtaBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rtaBannerLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  rtaBannerAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  actionCard: {
    width: '48%',
    marginHorizontal: '1%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  selectionInfo: {
    flex: 1,
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  selectionTotal: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectionButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  selectionDivider: {
    fontSize: 14,
    color: colors.border,
  },
  categoriesSection: {
    flex: 1,
    padding: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  selectedCategoryCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  categoryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryStat: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryGoal: {
    fontSize: 12,
    color: colors.success,
  },
  statDivider: {
    fontSize: 12,
    color: colors.textTertiary,
    marginHorizontal: 6,
  },
  categoryCardRight: {
    alignItems: 'flex-end',
  },
  categoryAvailable: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.danger,
  },
  bottomPadding: {
    height: 40,
  },
});

export default QuickBudgetScreen;