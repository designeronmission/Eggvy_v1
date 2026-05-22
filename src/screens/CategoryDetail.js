// src/screens/CategoryDetail.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import TopBar from '../components/layout/TopBar';
import SetBudgetModal from '../components/SetBudgetModal';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const CategoryDetail = ({ navigation, route }) => {
  const { category, currentMonth } = route.params;
  const [showSetBudgetModal, setShowSetBudgetModal] = useState(false);
  const [categoryData, setCategoryData] = useState(category);
  const [transactions, setTransactions] = useState(category.transactions || []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCategoryData();
    }, [])
  );

  const loadCategoryData = async () => {
    try {
      // Load latest budget data
      const budgetData = await AsyncStorage.getItem('budget_data');
      const transactionsData = await AsyncStorage.getItem('transactions');
      
      if (budgetData) {
        const parsedBudget = JSON.parse(budgetData);
        let updatedCategory = null;
        
        // Find the updated category
        Object.keys(parsedBudget).forEach(groupKey => {
          const group = parsedBudget[groupKey];
          const cat = group.categories.find(c => c.id === category.id);
          if (cat) {
            updatedCategory = cat;
          }
        });

        if (updatedCategory) {
          // Load latest transactions for this category
          if (transactionsData) {
            const parsedTransactions = JSON.parse(transactionsData);
            const monthTransactions = parsedTransactions.filter(t => 
              t.categoryId === category.id && t.date.startsWith(currentMonth)
            );
            
            const spent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
            
            setCategoryData({
              ...updatedCategory,
              spent,
              transactions: monthTransactions,
              remainingBalance: updatedCategory.assigned - spent,
            });
            setTransactions(monthTransactions);
          }
        }
      }
    } catch (error) {
      console.error('Error loading category data:', error);
    }
  };

  const formatCurrency = amount => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(amount || 0);
    } catch (error) {
      return `$${amount || 0}`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEditBudget = () => {
    setShowSetBudgetModal(true);
  };

  const handleSaveBudget = async (categoryId, budgetAmount) => {
    try {
      const budgetData = await AsyncStorage.getItem('budget_data');
      if (budgetData) {
        const parsed = JSON.parse(budgetData);
        let updatedCategory = null;
        
        Object.keys(parsed).forEach(groupKey => {
          const group = parsed[groupKey];
          const catIndex = group.categories.findIndex(c => c.id === categoryId);
          if (catIndex !== -1) {
            const oldAmount = group.categories[catIndex].assigned;
            const difference = budgetAmount - oldAmount;
            
            group.categories[catIndex].assigned = budgetAmount;
            group.categories[catIndex].available += difference;
            updatedCategory = group.categories[catIndex];
          }
        });

        if (updatedCategory) {
          await AsyncStorage.setItem('budget_data', JSON.stringify(parsed));
          
          // Refresh data
          await loadCategoryData();
          
          Alert.alert('Success', 'Budget updated successfully');
        }
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      Alert.alert('Error', 'Failed to update budget');
    }
    setShowSetBudgetModal(false);
  };

  const handleDeleteCategory = () => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? All associated transactions will also be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from budget data
              const budgetData = await AsyncStorage.getItem('budget_data');
              if (budgetData) {
                const parsed = JSON.parse(budgetData);
                
                Object.keys(parsed).forEach(groupKey => {
                  const group = parsed[groupKey];
                  const catIndex = group.categories.findIndex(c => c.id === category.id);
                  if (catIndex !== -1) {
                    group.categories.splice(catIndex, 1);
                  }
                });

                await AsyncStorage.setItem('budget_data', JSON.stringify(parsed));
              }

              // Delete associated transactions
              const transactionsData = await AsyncStorage.getItem('transactions');
              if (transactionsData) {
                const parsed = JSON.parse(transactionsData);
                const filtered = parsed.filter(t => t.categoryId !== category.id);
                await AsyncStorage.setItem('transactions', JSON.stringify(filtered));
              }

              Alert.alert('Success', 'Category deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const spent = categoryData.spent || 0;
  const assigned = categoryData.assigned || 0;
  const remaining = categoryData.remainingBalance || 0;
  const spentPercentage = assigned > 0 ? Math.min((spent / assigned) * 100, 100) : 0;
  const isOverBudget = spent > assigned && assigned > 0;

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title={categoryData.name} showBack={true} onBackPress={handleBackPress} />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Section with Category Name */}
        <View style={styles.heroSection}>
          <View style={[styles.categoryIcon, { backgroundColor: '#3F2B9610' }]}>
            <Icon name="folder" size={32} color="#3F2B96" />
          </View>
          <Text style={styles.heroTitle}>{categoryData.name}</Text>
          {transactions.length > 0 && (
            <View style={styles.transactionCountBadge}>
              <Icon name="list" size={14} color="#64748B" />
              <Text style={styles.transactionCountText}>{transactions.length} transactions</Text>
            </View>
          )}
        </View>

        {/* Main Stats Card */}
        <View style={styles.mainStatsCard}>
          <View style={styles.mainStatItem}>
            <Text style={styles.mainStatLabel}>Planned Budget</Text>
            <Text style={styles.mainStatValue}>{formatCurrency(assigned)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.mainStatItem}>
            <Text style={styles.mainStatLabel}>Actual Spending</Text>
            <Text style={[styles.mainStatValue, styles.spentText]}>{formatCurrency(spent)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.mainStatItem}>
            <Text style={styles.mainStatLabel}>Left to Spend</Text>
            <Text
              style={[
                styles.mainStatValue,
                remaining >= 0 ? styles.positiveText : styles.negativeText,
              ]}>
              {formatCurrency(remaining)}
            </Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={styles.progressPercentage}>{Math.round(spentPercentage)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${spentPercentage}%`,
                  backgroundColor: isOverBudget ? '#DC2626' : '#3F2B96',
                },
              ]}
            />
          </View>
          <View style={styles.progressFooter}>
            <Text style={styles.progressFooterText}>
              {formatCurrency(spent)} of {formatCurrency(assigned)}
            </Text>
            {isOverBudget && (
              <View style={styles.overBudgetBadge}>
                <Icon name="alert-triangle" size={12} color="#DC2626" />
                <Text style={styles.overBudgetText}>
                  Over by {formatCurrency(spent - assigned)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions</Text>
            {transactions.length > 0 && (
              <Text style={styles.transactionTotal}>
                Total: {formatCurrency(spent)}
              </Text>
            )}
          </View>
          
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <View style={styles.transactionIcon}>
                    <Icon name="shopping-bag" size={14} color="#64748B" />
                  </View>
                  <View>
                    <Text style={styles.transactionPayee}>{transaction.payee}</Text>
                    <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                  </View>
                </View>
                <Text style={styles.transactionAmount}>
                  -{formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Icon name="list" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Tap the + button on the budget screen to add your first transaction
              </Text>
            </View>
          )}
        </View>

        {/* Add some bottom padding for scroll content */}
        <View style={styles.scrollBottomPadding} />
      </ScrollView>

      {/* Fixed Action Buttons at Bottom */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEditBudget}>
          <Icon name="edit-2" size={18} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Budget</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteCategory}>
          <Icon name="trash-2" size={18} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Delete Category</Text>
        </TouchableOpacity>
      </View>

      {/* Set Budget Modal */}
      <SetBudgetModal
        visible={showSetBudgetModal}
        onClose={() => setShowSetBudgetModal(false)}
        category={categoryData}
        onSave={handleSaveBudget}
        totalBalance={0}
        formatCurrency={formatCurrency}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 8,
  },
  scrollBottomPadding: {
    height: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  transactionCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  transactionCountText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  mainStatsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    gap: 7,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mainStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  mainStatLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  mainStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  spentText: {
    color: '#DC2626',
  },
  positiveText: {
    color: '#10B981',
  },
  negativeText: {
    color: '#DC2626',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E2E8F0',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  progressPercentage: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3F2B96',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressFooterText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  overBudgetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  overBudgetText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  transactionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  transactionTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionPayee: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748B',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  fixedButtonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3F2B96',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CategoryDetail;