// src/screens/CategoryDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import TopBar from '../components/layout/TopBar';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const { width } = Dimensions.get('window');
const PRIMARY_COLOR = '#0A84FF';

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

const CategoryDetailScreen = ({ route, navigation }) => {
  const { categoryId } = route.params;
  
  const {
    categoryName = '',
    categoryGroup = '',
    assignedAmount = 0,
    availableAmount = 0,
    activityAmount = 0,
    targetAmount: initialTargetAmount = 0,
    targetFrequency: initialTargetFrequency = 'monthly',
    targetType: initialTargetType = 'setAside',
    targetDay: initialTargetDay = 'Last Day of the Month',
    targetDate: initialTargetDate = null,
  } = route.params;

  const [category, setCategory] = useState({
    id: categoryId,
    name: categoryName,
    groupName: categoryGroup,
    assigned: assignedAmount,
    available: availableAmount,
    activity: activityAmount,
    targetAmount: initialTargetAmount,
    targetFrequency: initialTargetFrequency,
    targetType: initialTargetType,
    targetDay: initialTargetDay,
    targetDate: initialTargetDate,
    targetProgress: initialTargetAmount > 0 ? (availableAmount / initialTargetAmount) * 100 : 0,
  });

  const [readyToAssign, setReadyToAssign] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState('');
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [targetFrequency, setTargetFrequency] = useState(initialTargetFrequency);
  const [targetType, setTargetType] = useState(initialTargetType);
  const [targetAmount, setTargetAmount] = useState(initialTargetAmount > 0 ? initialTargetAmount.toString() : '');
  const [targetDay, setTargetDay] = useState(initialTargetDay);
  const [targetDate, setTargetDate] = useState(initialTargetDate ? new Date(initialTargetDate) : new Date());
  
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const rta = await loadReadyToAssign();
    setReadyToAssign(rta);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const handleAssignMoney = () => {
    setIsEditing(true);
    setEditedAmount('');
  };

  const handleSaveAssignment = async () => {
    const amount = parseFloat(editedAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount > readyToAssign) {
      Alert.alert(
        'Insufficient Funds',
        `You only have ${formatCurrency(readyToAssign)} ready to assign.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Assign All', 
            onPress: async () => {
              setIsLoading(true);
              try {
                await assignMoneyToCategory(readyToAssign);
                setIsEditing(false);
                Alert.alert('Success', `Assigned ${formatCurrency(readyToAssign)} to ${category.name}`);
                navigation.goBack();
              } catch (error) {
                console.error('Error assigning all money:', error);
                Alert.alert('Error', 'Failed to assign money');
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
      return;
    }

    setIsLoading(true);
    try {
      await assignMoneyToCategory(amount);
      setIsEditing(false);
      Alert.alert('Success', `Assigned ${formatCurrency(amount)} to ${category.name}`);
      navigation.goBack();
    } catch (error) {
      console.error('Error assigning money:', error);
      Alert.alert('Error', 'Failed to assign money');
    } finally {
      setIsLoading(false);
    }
  };

  const assignMoneyToCategory = async (amount) => {
    // Load current data
    const budgetData = await loadBudgetData();
    if (!budgetData) return;

    let updated = false;

    // Find and update the category
    Object.keys(budgetData).forEach(groupKey => {
      const group = budgetData[groupKey];
      if (group?.categories) {
        const categoryIndex = group.categories.findIndex(c => c.id === categoryId);
        if (categoryIndex !== -1) {
          group.categories[categoryIndex].assigned = (group.categories[categoryIndex].assigned || 0) + amount;
          group.categories[categoryIndex].available = (group.categories[categoryIndex].available || 0) + amount;
          updated = true;
        }
      }
    });

    if (updated) {
      // Save budget data
      await saveBudgetData(budgetData);
      
      // Update ready to assign
      const newRTA = readyToAssign - amount;
      setReadyToAssign(newRTA);
      await saveReadyToAssign(newRTA);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date) => {
    setTargetDate(date);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    setTargetDay(formattedDate);
    hideDatePicker();
  };

  const handleSaveTarget = async () => {
    const amount = parseFloat(targetAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid target amount');
      return;
    }

    setIsLoading(true);
    try {
      // Load current data
      const budgetData = await loadBudgetData();
      if (!budgetData) return;

      // Find and update the category
      Object.keys(budgetData).forEach(groupKey => {
        const group = budgetData[groupKey];
        if (group?.categories) {
          const categoryIndex = group.categories.findIndex(c => c.id === categoryId);
          if (categoryIndex !== -1) {
            group.categories[categoryIndex].targetAmount = amount;
            group.categories[categoryIndex].targetFrequency = targetFrequency;
            group.categories[categoryIndex].targetType = targetType;
            group.categories[categoryIndex].targetDay = targetDay;
            group.categories[categoryIndex].targetDate = targetDate.toISOString();
          }
        }
      });

      // Save budget data
      await saveBudgetData(budgetData);
      
      // Update local state
      setCategory(prev => ({
        ...prev,
        targetAmount: amount,
        targetFrequency,
        targetType,
        targetDay,
        targetDate: targetDate.toISOString(),
        targetProgress: (category.available / amount) * 100
      }));
      
      setShowTargetModal(false);
      setTargetAmount('');
      Alert.alert('Success', `Target set to ${formatCurrency(amount)} ${targetFrequency}`);
    } catch (error) {
      console.error('Error saving target:', error);
      Alert.alert('Error', 'Failed to save target');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTarget = async () => {
    Alert.alert(
      'Delete Target',
      'Are you sure you want to delete this target?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              // Load current data
              const budgetData = await loadBudgetData();
              if (!budgetData) return;

              // Find and update the category
              Object.keys(budgetData).forEach(groupKey => {
                const group = budgetData[groupKey];
                if (group?.categories) {
                  const categoryIndex = group.categories.findIndex(c => c.id === categoryId);
                  if (categoryIndex !== -1) {
                    group.categories[categoryIndex].targetAmount = 0;
                    group.categories[categoryIndex].targetFrequency = 'monthly';
                    group.categories[categoryIndex].targetType = 'setAside';
                    group.categories[categoryIndex].targetDay = 'Last Day of the Month';
                    group.categories[categoryIndex].targetDate = null;
                  }
                }
              });

              // Save budget data
              await saveBudgetData(budgetData);
              
              // Update local state
              setCategory(prev => ({
                ...prev,
                targetAmount: 0,
                targetFrequency: 'monthly',
                targetType: 'setAside',
                targetDay: 'Last Day of the Month',
                targetDate: null,
                targetProgress: 0
              }));
              
              setShowTargetModal(false);
            } catch (error) {
              console.error('Error deleting target:', error);
              Alert.alert('Error', 'Failed to delete target');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleMoveMoney = () => {
    navigation.navigate('MoveMoneyScreen', {
      fromCategoryId: category.id,
      fromCategoryName: category.name,
      fromCategoryAmount: category.assigned,
      fromCategoryAvailable: category.available,
    });
  };

  const progressPercentage = category.targetAmount > 0 
    ? Math.min((category.available / category.targetAmount) * 100, 100) : 0;
  const remainingForTarget = category.targetAmount > 0 
    ? Math.max(category.targetAmount - category.available, 0) : 0;

  const getFrequencyLabel = (freq) => {
    switch(freq) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      case 'custom': return 'Custom';
      default: return 'Monthly';
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Select a date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopBar title={category.name} showBack onBackPress={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIconContainer}>
            <Icon name="folder" size={32} color={PRIMARY_COLOR} />
          </View>
          <View style={styles.heroInfo}>
            <Text style={styles.heroLabel}>Available Balance</Text>
            <Text style={styles.heroAmount}>
              {formatCurrency(category.available)}
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Assigned</Text>
                <Text style={styles.heroStatValue}>{formatCurrency(category.assigned)}</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Activity</Text>
                <Text style={[
                  styles.heroStatValue, 
                  { color: category.activity < 0 ? '#DC2626' : '#34C759' }
                ]}>
                  {category.activity < 0 ? '-' : '+'}{formatCurrency(Math.abs(category.activity))}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleAssignMoney}
            disabled={isLoading}
          >
            <Icon name="dollar-sign" size={20} color={PRIMARY_COLOR} />
            <Text style={styles.quickActionText}>Assign</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleMoveMoney}
            disabled={isLoading}
          >
            <Icon name="arrow-right-circle" size={20} color={PRIMARY_COLOR} />
            <Text style={styles.quickActionText}>Move</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => setShowTargetModal(true)}
            disabled={isLoading}
          >
            <Icon name="target" size={20} color={PRIMARY_COLOR} />
            <Text style={styles.quickActionText}>Target</Text>
          </TouchableOpacity>
        </View>

        {isEditing && (
          <View style={styles.editSection}>
            <Text style={styles.editTitle}>Assign Money to {category.name}</Text>
            <View style={styles.editInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.editInput}
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                value={editedAmount}
                onChangeText={setEditedAmount}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveAssignment}
                editable={!isLoading}
              />
            </View>
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.editCancelButton} 
                onPress={() => setIsEditing(false)}
                disabled={isLoading}
              >
                <Text style={styles.editCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editSaveButton, isLoading && styles.disabledButton]} 
                onPress={handleSaveAssignment}
                disabled={isLoading}
              >
                <Text style={styles.editSaveText}>{isLoading ? 'Saving...' : 'Assign'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.targetSection}>
          <View style={styles.targetHeader}>
            <View style={styles.targetTitleContainer}>
              <Icon name="target" size={18} color={PRIMARY_COLOR} />
              <Text style={styles.targetTitle}>
                {category.targetAmount > 0 ? `${getFrequencyLabel(category.targetFrequency)} Target` : 'Set a Target'}
              </Text>
            </View>
            {category.targetAmount > 0 && (
              <TouchableOpacity onPress={() => setShowTargetModal(true)} disabled={isLoading}>
                <Text style={styles.targetEditText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {category.targetAmount > 0 ? (
            <>
              <View style={styles.targetAmountContainer}>
                <Text style={styles.targetLabel}>I need</Text>
                <Text style={styles.targetAmount}>{formatCurrency(category.targetAmount)}</Text>
              </View>
              <View style={styles.targetDueContainer}>
                <Icon name="calendar" size={16} color="#64748B" />
                <Text style={styles.targetDueLabel}>By</Text>
                <Text style={styles.targetDueDate}>
                  {category.targetDate ? formatDisplayDate(category.targetDate) : category.targetDay}
                </Text>
              </View>
              <View style={styles.targetProgressContainer}>
                <View style={styles.targetProgressHeader}>
                  <Text style={styles.targetProgressLabel}>Progress</Text>
                  <Text style={styles.targetProgressPercentage}>{Math.round(progressPercentage)}%</Text>
                </View>
                <View style={styles.targetProgressTrack}>
                  <View style={[styles.targetProgressFill, { width: `${progressPercentage}%` }]} />
                </View>
                <View style={styles.targetProgressStats}>
                  <Text style={styles.targetProgressStat}>
                    <Text style={styles.targetProgressStatValue}>{formatCurrency(category.available)}</Text> saved
                  </Text>
                  <Text style={styles.targetProgressStat}>
                    <Text style={styles.targetProgressStatValue}>{formatCurrency(remainingForTarget)}</Text> remaining
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.deleteTargetButton} onPress={handleDeleteTarget} disabled={isLoading}>
                <Icon name="trash-2" size={16} color="#DC2626" />
                <Text style={styles.deleteTargetText}>Delete Target</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.noTargetCard} onPress={() => setShowTargetModal(true)} disabled={isLoading}>
              <View style={styles.noTargetIcon}>
                <Icon name="plus" size={24} color={PRIMARY_COLOR} />
              </View>
              <View style={styles.noTargetContent}>
                <Text style={styles.noTargetTitle}>Set a spending target</Text>
                <Text style={styles.noTargetDescription}>Choose weekly, monthly, yearly, or custom</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <View style={styles.transactionsTitleContainer}>
              <Icon name="clock" size={18} color="#0F172A" />
              <Text style={styles.transactionsTitle}>Recent Transactions</Text>
            </View>
          </View>
          <View style={styles.emptyTransactions}>
            <View style={styles.emptyIcon}>
              <Icon name="clock" size={32} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyDescription}>Tap "Assign" to add money or record spending</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal visible={showTargetModal} animationType="slide" transparent onRequestClose={() => setShowTargetModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set a target</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowTargetModal(false)} disabled={isLoading}>
                <Icon name="x" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.frequencyContainer}>
                {['weekly', 'monthly', 'yearly', 'custom'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton, 
                      targetFrequency === freq && styles.frequencyButtonActive
                    ]}
                    onPress={() => setTargetFrequency(freq)}
                    disabled={isLoading}
                  >
                    <Text style={[
                      styles.frequencyButtonText,
                      targetFrequency === freq && styles.frequencyButtonTextActive
                    ]}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.targetAmountInputContainer}>
                <Text style={styles.targetInputLabel}>I need</Text>
                <View style={styles.targetAmountInputRow}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.targetAmountInput}
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                    value={targetAmount}
                    onChangeText={setTargetAmount}
                    autoFocus
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.dueDateContainer}>
                <Text style={styles.dueDateLabel}>By</Text>
                <TouchableOpacity style={styles.dueDateSelector} onPress={showDatePicker} disabled={isLoading}>
                  <Text style={styles.dueDateSelectorText}>
                    {targetDay && targetDay !== 'Last Day of the Month' 
                      ? targetDay 
                      : targetDate.toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                  </Text>
                  <Icon name="calendar" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                date={targetDate}
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalCancelButton} 
                  onPress={() => setShowTargetModal(false)}
                  disabled={isLoading}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalSaveButton, isLoading && styles.disabledButton]} 
                  onPress={handleSaveTarget}
                  disabled={isLoading}
                >
                  <Text style={styles.modalSaveButtonText}>{isLoading ? 'Saving...' : 'Save Target'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Keep all your existing styles - they remain the same
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroInfo: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: {
    flex: 1,
  },
  heroStatLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: PRIMARY_COLOR,
    marginLeft: 6,
  },
  editSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 16,
  },
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 20,
    color: '#64748B',
    marginRight: 8,
  },
  editInput: {
    flex: 1,
    fontSize: 20,
    color: '#0F172A',
    padding: 0,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  editCancelText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  editSaveButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
  },
  editSaveText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  targetSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  targetTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    marginLeft: 8,
  },
  targetEditText: {
    fontSize: 13,
    fontWeight: '500',
    color: PRIMARY_COLOR,
  },
  targetAmountContainer: {
    marginBottom: 12,
  },
  targetLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  targetAmount: {
    fontSize: 26,
    fontWeight: '600',
    color: '#0F172A',
  },
  targetDueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  targetDueLabel: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
    marginRight: 8,
  },
  targetDueDate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
    flex: 1,
  },
  targetProgressContainer: {
    marginBottom: 12,
  },
  targetProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  targetProgressLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  targetProgressPercentage: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  targetProgressTrack: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  targetProgressFill: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 2,
  },
  targetProgressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  targetProgressStat: {
    fontSize: 11,
    color: '#64748B',
  },
  targetProgressStatValue: {
    fontWeight: '500',
    color: '#0F172A',
  },
  deleteTargetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
  },
  deleteTargetText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
    marginLeft: 6,
  },
  noTargetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  noTargetIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noTargetContent: {
    flex: 1,
  },
  noTargetTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  noTargetDescription: {
    fontSize: 12,
    color: '#64748B',
  },
  transactionsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionsTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    marginLeft: 8,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  bottomPadding: {
    height: 40,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalCloseButton: {
    padding: 4,
  },
  frequencyContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  frequencyButtonActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  frequencyButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  frequencyButtonTextActive: {
    color: '#FFFFFF',
  },
  targetAmountInputContainer: {
    marginBottom: 16,
  },
  targetInputLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  targetAmountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  targetAmountInput: {
    flex: 1,
    fontSize: 24,
    color: '#0F172A',
    padding: 0,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dueDateLabel: {
    fontSize: 13,
    color: '#64748B',
    marginRight: 16,
    width: 40,
  },
  dueDateSelector: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateSelectorText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    marginRight: 8,
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    marginLeft: 8,
  },
  modalSaveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default CategoryDetailScreen;