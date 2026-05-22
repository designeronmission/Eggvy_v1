// src/screens/AssignMoneyScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBudget } from '../context/BudgetContext';
import Icon from 'react-native-vector-icons/Feather';
import TopBar from '../components/layout/TopBar';

const PRIMARY_COLOR = '#0A84FF';

const AssignMoneyScreen = ({ navigation }) => {
  const budget = useBudget();
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasAccounts, setHasAccounts] = useState(true);

  useEffect(() => {
    checkAccounts();
  }, []);

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
          'You need to add an account before you can assign money.',
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

  useEffect(() => {
    if (budget?.categoryData) {
      try {
        const allCategories = [];
        
        Object.keys(budget.categoryData).forEach(groupKey => {
          const group = budget.categoryData[groupKey];
          if (group && group.categories && Array.isArray(group.categories)) {
            group.categories.forEach(category => {
              if (category && category.id) {
                allCategories.push({
                  id: category.id,
                  name: category.name,
                  groupName: group.name || groupKey,
                  available: category.available || 0,
                  assigned: category.assigned || 0,
                  color: category.color || PRIMARY_COLOR,
                });
              }
            });
          }
        });
        
        setCategories(allCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    }
  }, [budget?.categoryData]);

  const filteredCategories = categories.filter(category => {
    if (!category) return false;
    const matchesSearch = searchQuery === '' || 
      (category.name && category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (category.groupName && category.groupName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  const handleSelectCategory = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  const handleAssignMoney = async () => {
    if (!hasAccounts) {
      Alert.alert('No Accounts', 'Please add an account first');
      navigation.navigate('Budget', { openAddAccount: true });
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    const assignAmount = parseFloat(amount);
    if (!assignAmount || assignAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (assignAmount > budget.readyToAssign) {
      Alert.alert(
        'Insufficient Funds',
        `You only have ${budget.formatCurrency(budget.readyToAssign)} ready to assign.`
      );
      return;
    }

    setIsLoading(true);
    try {
      await budget.assignMoneyToCategory(selectedCategoryId, assignAmount);
      
      Alert.alert(
        'Success',
        `Assigned ${budget.formatCurrency(assignAmount)} to ${
          categories.find(c => c.id === selectedCategoryId)?.name
        }`
      );
      
      navigation.goBack();
    } catch (error) {
      console.error('Error assigning money:', error);
      Alert.alert('Error', error.message || 'Failed to assign money');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignAll = async () => {
    if (!hasAccounts) {
      Alert.alert('No Accounts', 'Please add an account first');
      navigation.navigate('Budget', { openAddAccount: true });
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (budget.readyToAssign <= 0) {
      Alert.alert('No Funds', 'You have no money ready to assign');
      return;
    }

    Alert.alert(
      'Assign All',
      `Assign all ${budget.formatCurrency(budget.readyToAssign)} to ${categories.find(c => c.id === selectedCategoryId)?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign All',
          onPress: async () => {
            setIsLoading(true);
            try {
              await budget.assignMoneyToCategory(selectedCategoryId, budget.readyToAssign);
              Alert.alert('Success', `Assigned all available funds`);
              navigation.goBack();
            } catch (error) {
              console.error('Error assigning all money:', error);
              Alert.alert('Error', error.message || 'Failed to assign money');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  if (!hasAccounts) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <TopBar 
          title="Assign Money" 
          showBack 
          onBackPress={() => navigation.goBack()} 
        />
        <View style={styles.noAccountsContainer}>
          <View style={styles.noAccountsIcon}>
            <Icon name="credit-card" size={48} color="#94A3B8" />
          </View>
          <Text style={styles.noAccountsTitle}>No Accounts Found</Text>
          <Text style={styles.noAccountsText}>
            You need to add an account before you can assign money.
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopBar 
        title="Assign Money" 
        showBack 
        onBackPress={() => navigation.goBack()} 
      />

      <View style={styles.rtaCard}>
        <View style={styles.rtaContent}>
          <View>
            <Text style={styles.rtaLabel}>Ready to Assign</Text>
            <Text style={styles.rtaAmount}>
              {budget.formatCurrency(budget.readyToAssign)}
            </Text>
          </View>
          <View style={styles.rtaIcon}>
            <Icon name="dollar-sign" size={24} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>Amount to assign</Text>
        <View style={styles.amountInputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            placeholderTextColor="#94A3B8"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            editable={!isLoading}
          />
        </View>
        {selectedCategory && budget.readyToAssign > 0 && (
          <TouchableOpacity 
            style={styles.assignAllLink}
            onPress={handleAssignAll}
          >
            <Text style={styles.assignAllText}>Assign all available</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            editable={!isLoading}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.categoriesList}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Select a category</Text>
        
        {filteredCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="folder" size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No categories found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery 
                ? 'Try a different search term' 
                : 'Create a category to start budgeting'}
            </Text>
          </View>
        ) : (
          filteredCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategoryId === category.id && styles.selectedCategory,
              ]}
              onPress={() => handleSelectCategory(category.id)}
              disabled={isLoading}
            >
              <View style={styles.categoryInfo}>
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <View style={styles.categoryDetails}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryGroup}>{category.groupName}</Text>
                </View>
              </View>
              <View style={styles.categoryAmounts}>
                <Text style={styles.categoryAvailable}>
                  {budget.formatCurrency(category.available)}
                </Text>
                <Text style={styles.categoryAssigned}>
                  Assigned: {budget.formatCurrency(category.assigned)}
                </Text>
              </View>
              {selectedCategoryId === category.id && (
                <View style={styles.checkmark}>
                  <Icon name="check-circle" size={24} color={PRIMARY_COLOR} />
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
        
        <View style={{ height: 20 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.assignButton, 
            (!selectedCategoryId || !amount || isLoading) && styles.disabledButton
          ]}
          onPress={handleAssignMoney}
          disabled={!selectedCategoryId || !amount || isLoading}
        >
          <Text style={styles.assignButtonText}>
            {isLoading 
              ? 'Assigning...' 
              : selectedCategory 
                ? `Assign to ${selectedCategory.name}`
                : 'Select a category'
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  addAccountButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addAccountButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rtaCard: {
    margin: 16,
    backgroundColor: '#0A84FF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
  amountSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#64748B',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: '#0F172A',
    padding: 0,
  },
  assignAllLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  assignAllText: {
    fontSize: 13,
    color: '#0A84FF',
    fontWeight: '500',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    marginLeft: 8,
    padding: 0,
  },
  categoriesList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCategory: {
    borderColor: PRIMARY_COLOR,
    borderWidth: 2,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  categoryGroup: {
    fontSize: 12,
    color: '#64748B',
  },
  categoryAmounts: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  categoryAvailable: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  categoryAssigned: {
    fontSize: 11,
    color: '#64748B',
  },
  checkmark: {
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  assignButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  assignButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AssignMoneyScreen;