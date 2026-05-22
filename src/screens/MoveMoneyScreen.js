// src/screens/MoveMoneyScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import TopBar from '../components/layout/TopBar';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 47 : StatusBar.currentHeight || 0;

// Storage helper functions
const loadBudgetData = async () => {
  try {
    const stored = await AsyncStorage.getItem('budget_data');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading budget data:', error);
    return null;
  }
};

const saveBudgetData = async (data) => {
  try {
    await AsyncStorage.setItem('budget_data', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving budget data:', error);
    return false;
  }
};

const loadReadyToAssign = async () => {
  try {
    const stored = await AsyncStorage.getItem('ready_to_assign');
    return stored ? parseFloat(stored) : 0;
  } catch (error) {
    console.error('Error loading ready to assign:', error);
    return 0;
  }
};

const saveReadyToAssign = async (amount) => {
  try {
    await AsyncStorage.setItem('ready_to_assign', amount.toString());
  } catch (error) {
    console.error('Error saving ready to assign:', error);
  }
};

const MoveMoneyScreen = ({ navigation, route }) => {
  const { 
    fromCategoryId, 
    fromCategoryName, 
    fromCategoryAmount, 
    fromCategoryAvailable,
    activeTab,
    currentMonth 
  } = route.params || {};
  
  const [fromCategory, setFromCategory] = useState(null);
  const [toCategory, setToCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('select-from');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (fromCategoryId && categories.length > 0) {
      const category = findCategoryById(fromCategoryId);
      if (category) {
        setFromCategory(category);
        setStep('select-to');
      }
    }
  }, [fromCategoryId, categories]);

  const loadCategories = async () => {
    const budgetData = await loadBudgetData();
    if (!budgetData) return;

    const allCategories = [];
    
    Object.keys(budgetData).forEach(groupKey => {
      const group = budgetData[groupKey];
      if (group && group.categories && Array.isArray(group.categories)) {
        group.categories.forEach(cat => {
          if (cat && cat.id) {
            allCategories.push({
              ...cat,
              groupName: group.name || groupKey,
              groupColor: group.color || '#0A84FF',
              groupLightColor: group.lightColor || '#E8F1FF'
            });
          }
        });
      }
    });
    
    setCategories(allCategories);
  };

  const findCategoryById = (id) => {
    return categories.find(cat => cat.id === id);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const handleFromCategorySelect = (category) => {
    setFromCategory(category);
    setStep('select-to');
  };

  const handleToCategorySelect = (category) => {
    if (category.id === fromCategory.id) {
      Alert.alert('Invalid Selection', 'Cannot move money to the same category');
      return;
    }
    setToCategory(category);
    setAmount('');
    setStep('amount');
  };

  const moveAmount = async (amountToMove) => {
    setIsLoading(true);
    try {
      // Load current data
      const budgetData = await loadBudgetData();
      if (!budgetData) return;

      // Update from category (subtract)
      let fromUpdated = false;
      let toUpdated = false;

      Object.keys(budgetData).forEach(groupKey => {
        const group = budgetData[groupKey];
        if (group?.categories) {
          // Update from category
          const fromIndex = group.categories.findIndex(c => c.id === fromCategory.id);
          if (fromIndex !== -1) {
            group.categories[fromIndex].assigned = (group.categories[fromIndex].assigned || 0) - amountToMove;
            group.categories[fromIndex].available = (group.categories[fromIndex].available || 0) - amountToMove;
            fromUpdated = true;
          }

          // Update to category
          const toIndex = group.categories.findIndex(c => c.id === toCategory.id);
          if (toIndex !== -1) {
            group.categories[toIndex].assigned = (group.categories[toIndex].assigned || 0) + amountToMove;
            group.categories[toIndex].available = (group.categories[toIndex].available || 0) + amountToMove;
            toUpdated = true;
          }
        }
      });

      if (fromUpdated && toUpdated) {
        // Save updated budget data
        await saveBudgetData(budgetData);
        
        Alert.alert(
          'Success!',
          `Moved ${formatCurrency(amountToMove)} from ${fromCategory.name} to ${toCategory.name}`,
          [
            {
              text: 'Done',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to update categories');
      }
    } catch (error) {
      console.error('Error moving money:', error);
      Alert.alert('Error', 'Failed to move money');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMove = () => {
    const numAmount = parseFloat(amount) || 0;

    if (numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an amount greater than 0');
      return;
    }

    if (numAmount > fromCategory.available) {
      Alert.alert(
        'Insufficient Funds',
        `You only have ${formatCurrency(fromCategory.available)} available in ${fromCategory.name}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Move All', onPress: () => moveAllAmount() }
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Move',
      `Move ${formatCurrency(numAmount)} from ${fromCategory.name} to ${toCategory.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move',
          onPress: () => moveAmount(numAmount)
        }
      ]
    );
  };

  const moveAllAmount = () => {
    Alert.alert(
      'Confirm Move',
      `Move all ${formatCurrency(fromCategory.available)} from ${fromCategory.name} to ${toCategory.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Move All',
          onPress: () => moveAmount(fromCategory.available)
        }
      ]
    );
  };

  const renderCategorySelection = (type, title, filter) => {
    const availableCategories = categories.filter(filter);

    return (
      <View style={styles.selectionContainer}>
        <View style={styles.selectionHeader}>
          <View style={[styles.selectionIcon, { 
            backgroundColor: type === 'from' ? '#FFE5E9' : '#E6F7E6'
          }]}>
            <Icon 
              name={type === 'from' ? 'arrow-up' : 'arrow-down'} 
              size={24} 
              color={type === 'from' ? '#FF2D55' : '#34C759'} 
            />
          </View>
          <View>
            <Text style={styles.selectionTitle}>{title}</Text>
            {type === 'from' && fromCategory && (
              <Text style={styles.selectionSubtitle}>
                Available: {formatCurrency(fromCategory.available)}
              </Text>
            )}
          </View>
        </View>

        <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
          {availableCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                (type === 'from' && fromCategory?.id === category.id) && styles.selectedCategoryCard
              ]}
              onPress={() => type === 'from' 
                ? handleFromCategorySelect(category)
                : handleToCategorySelect(category)
              }
              activeOpacity={0.7}
            >
              <View style={styles.categoryCardLeft}>
                <View style={[styles.categoryIcon, { 
                  backgroundColor: category.groupLightColor 
                }]}>
                  <Icon 
                    name={type === 'from' ? 'arrow-up' : 'arrow-down'} 
                    size={20} 
                    color={category.groupColor} 
                  />
                </View>
                <View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryGroup}>{category.groupName}</Text>
                  <Text style={styles.categoryAvailable}>
                    Available: {formatCurrency(category.available)}
                  </Text>
                </View>
              </View>
              <View style={styles.categoryCardRight}>
                <Text style={styles.categoryAssigned}>
                  {formatCurrency(category.assigned)}
                </Text>
                <Icon name="chevron-right" size={20} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <TopBar
        title="Move Money"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {step === 'select-from' && renderCategorySelection(
        'from',
        'Select category to move FROM',
        cat => cat.available > 0
      )}

      {step === 'select-to' && fromCategory && renderCategorySelection(
        'to',
        'Select category to move TO',
        cat => cat.id !== fromCategory.id
      )}

      {step === 'amount' && fromCategory && toCategory && (
        <View style={styles.amountContainer}>
          <View style={styles.transferSummary}>
            <View style={styles.transferFrom}>
              <Text style={styles.transferLabel}>FROM</Text>
              <View style={styles.transferCategory}>
                <View style={[styles.transferIcon, { backgroundColor: '#FFE5E9' }]}>
                  <Icon name="arrow-up" size={20} color="#FF2D55" />
                </View>
                <Text style={styles.transferCategoryName}>{fromCategory.name}</Text>
                <Text style={styles.transferGroupName}>{fromCategory.groupName}</Text>
              </View>
              <Text style={styles.transferAmount}>
                {formatCurrency(fromCategory.available)}
              </Text>
            </View>

            <View style={styles.transferArrow}>
              <View style={styles.arrowCircle}>
                <Icon name="arrow-right" size={24} color="#0A84FF" />
              </View>
            </View>

            <View style={styles.transferTo}>
              <Text style={styles.transferLabel}>TO</Text>
              <View style={styles.transferCategory}>
                <View style={[styles.transferIcon, { backgroundColor: '#E6F7E6' }]}>
                  <Icon name="arrow-down" size={20} color="#34C759" />
                </View>
                <Text style={styles.transferCategoryName}>{toCategory.name}</Text>
                <Text style={styles.transferGroupName}>{toCategory.groupName}</Text>
              </View>
              <Text style={styles.transferAmount}>
                {formatCurrency(toCategory.available)}
              </Text>
            </View>
          </View>

          <View style={styles.amountInputSection}>
            <Text style={styles.amountLabel}>Enter amount to move</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                autoFocus={true}
                returnKeyType="done"
                onSubmitEditing={handleMove}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.balanceInfo}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>After moving FROM</Text>
              <Text style={[styles.balanceValue, styles.dangerText]}>
                {formatCurrency(Math.max(fromCategory.available - parseFloat(amount || 0), 0))}
              </Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>After moving TO</Text>
              <Text style={[styles.balanceValue, styles.successText]}>
                {formatCurrency(toCategory.available + parseFloat(amount || 0))}
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.moveButton,
                (!amount || parseFloat(amount) <= 0 || isLoading) && styles.moveButtonDisabled
              ]}
              onPress={handleMove}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            >
              <Text style={styles.moveButtonText}>
                {isLoading ? 'Moving...' : 'Move Money'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.moveAllButton, isLoading && styles.moveButtonDisabled]}
              onPress={moveAllAmount}
              disabled={isLoading}
            >
              <Text style={styles.moveAllButtonText}>
                {isLoading ? 'Moving...' : 'Move All Available'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// Keep all your existing styles - they remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  selectionContainer: {
    flex: 1,
    padding: 16,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  selectionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  selectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  categoryList: {
    flex: 1,
  },
  categoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCategoryCard: {
    borderWidth: 2,
    borderColor: '#0A84FF',
    backgroundColor: '#F0F9FF',
  },
  categoryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  categoryGroup: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  categoryAvailable: {
    fontSize: 12,
    color: '#64748B',
  },
  categoryCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryAssigned: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginRight: 8,
  },
  amountContainer: {
    flex: 1,
    padding: 16,
  },
  transferSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  transferFrom: {
    flex: 1,
    alignItems: 'center',
  },
  transferTo: {
    flex: 1,
    alignItems: 'center',
  },
  transferLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
  },
  transferCategory: {
    alignItems: 'center',
    marginBottom: 8,
  },
  transferIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  transferCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  transferGroupName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  transferAmount: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  transferArrow: {
    paddingHorizontal: 12,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountInputSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    color: '#0F172A',
    padding: 0,
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  successText: {
    color: '#34C759',
  },
  dangerText: {
    color: '#DC2626',
  },
  balanceDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  moveButton: {
    backgroundColor: '#E56772',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  moveButtonDisabled: {
    backgroundColor: '#F1F5F9',
  },
  moveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  moveAllButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  moveAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
});

export default MoveMoneyScreen;