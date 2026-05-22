// src/screens/CreateBudgetScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  StatusBar
} from 'react-native';
import { useBudget } from '../context/BudgetContext';
import Icon from 'react-native-vector-icons/Feather';
import TopBar from '../components/layout/TopBar';
import LinearGradient from 'react-native-linear-gradient';

const PRIMARY_COLOR = '#0A84FF';

const CreateBudgetScreen = ({ navigation }) => {
  const budget = useBudget();
  const [budgetName, setBudgetName] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('bills');
  const [goalType, setGoalType] = useState('monthly');

  const categoryGroups = [
    { id: 'bills', name: 'Bills', icon: 'file-text', color: '#0A84FF' },
    { id: 'wants', name: 'Wants', icon: 'heart', color: '#FF2D55' },
    { id: 'needs', name: 'Needs', icon: 'shield', color: '#34C759' },
  ];

  const handleCreateBudget = async () => {
    if (!budgetName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const amount = parseFloat(budgetAmount) || 0;

    try {
      const currentData = budget.categoryData || {};
      const updatedData = JSON.parse(JSON.stringify(currentData));
      
      if (!updatedData[selectedGroup]) {
        const group = categoryGroups.find(g => g.id === selectedGroup);
        updatedData[selectedGroup] = {
          id: selectedGroup,
          name: group.name,
          categories: [],
          color: group.color,
          icon: group.icon,
          lightColor: `${group.color}20`,
          totalBudgeted: 0,
          totalSpent: 0,
          totalAvailable: 0
        };
      }

      const newCategory = {
        id: `${selectedGroup}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: budgetName.trim(),
        assigned: amount,
        available: amount,
        activity: 0,
        targetAmount: amount > 0 ? amount : 0,
        targetFrequency: goalType === 'monthly' ? 'monthly' : goalType === 'needed' ? 'yearly' : 'custom',
        targetType: amount > 0 ? 'setAside' : 'none',
        targetDay: 'Last Day of the Month',
        dueDate: null,
        color: categoryGroups.find(g => g.id === selectedGroup)?.color || PRIMARY_COLOR,
        type: selectedGroup === 'bills' ? 'bill' : selectedGroup === 'needs' ? 'essential' : 'lifestyle',
        progress: 0
      };

      updatedData[selectedGroup].categories.push(newCategory);
      
      await budget.updateCategoryData(updatedData);
      
      Alert.alert(
        'Success',
        `Category "${budgetName}" created with budget of ${budget.formatCurrency(amount)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating budget:', error);
      Alert.alert('Error', 'Failed to create category');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopBar 
        title="Create Category" 
        showBack 
        onBackPress={() => navigation.goBack()} 
      />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Rent, Groceries, Savings"
            placeholderTextColor="#94A3B8"
            value={budgetName}
            onChangeText={setBudgetName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category Group</Text>
          {categoryGroups.map(group => (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.groupItem,
                selectedGroup === group.id && styles.groupItemSelected
              ]}
              onPress={() => setSelectedGroup(group.id)}
            >
              <View style={styles.groupItemLeft}>
                <View style={[styles.groupIcon, { backgroundColor: `${group.color}20` }]}>
                  <Icon name={group.icon} size={20} color={group.color} />
                </View>
                <Text style={[
                  styles.groupName,
                  selectedGroup === group.id && styles.groupNameSelected
                ]}>
                  {group.name}
                </Text>
              </View>
              {selectedGroup === group.id && (
                <Icon name="check" size={20} color={PRIMARY_COLOR} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Monthly Budget</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              value={budgetAmount}
              onChangeText={setBudgetAmount}
            />
          </View>
        </View>

        {parseFloat(budgetAmount) > 0 && (
          <View style={styles.tipsSection}>
            <Text style={styles.sectionLabel}>Goal Type</Text>
            <View style={styles.goalTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.goalTypeButton,
                  goalType === 'monthly' && styles.goalTypeActive
                ]}
                onPress={() => setGoalType('monthly')}
              >
                <Text style={[
                  styles.goalTypeText,
                  goalType === 'monthly' && styles.goalTypeTextActive
                ]}>
                  Monthly
                </Text>
                <Text style={styles.goalTypeDescription}>
                  Budget this amount each month
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.goalTypeButton,
                  goalType === 'needed' && styles.goalTypeActive
                ]}
                onPress={() => setGoalType('needed')}
              >
                <Text style={[
                  styles.goalTypeText,
                  goalType === 'needed' && styles.goalTypeTextActive
                ]}>
                  Needed
                </Text>
                <Text style={styles.goalTypeDescription}>
                  Save by a specific date
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.goalTypeButton,
                  goalType === 'target' && styles.goalTypeActive
                ]}
                onPress={() => setGoalType('target')}
              >
                <Text style={[
                  styles.goalTypeText,
                  goalType === 'target' && styles.goalTypeTextActive
                ]}>
                  Target
                </Text>
                <Text style={styles.goalTypeDescription}>
                  Build up to a balance
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Icon name="info" size={20} color={PRIMARY_COLOR} />
            <Text style={styles.tipTitle}>Budgeting Tip</Text>
          </View>
          <Text style={styles.tipText}>
            Start with your essential categories like bills and needs. You can always adjust amounts later!
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            !budgetName.trim() && styles.createButtonDisabled
          ]}
          onPress={handleCreateBudget}
          disabled={!budgetName.trim()}
        >
          <LinearGradient
            colors={!budgetName.trim() ? ['#94A3B8', '#94A3B8'] : [PRIMARY_COLOR, '#0066CC']}
            style={styles.createButtonGradient}
          >
            <Text style={styles.createButtonText}>Create Category</Text>
          </LinearGradient>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  groupItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupItemSelected: {
    borderBottomColor: PRIMARY_COLOR,
  },
  groupName: {
    fontSize: 16,
    color: '#0F172A',
  },
  groupNameSelected: {
    color: PRIMARY_COLOR,
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: 20,
    color: '#64748B',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    color: '#0F172A',
    padding: 0,
  },
  tipsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalTypeContainer: {
    marginTop: 8,
  },
  goalTypeButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  goalTypeActive: {
    backgroundColor: '#F0F9FF',
    borderColor: PRIMARY_COLOR,
  },
  goalTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  goalTypeTextActive: {
    color: PRIMARY_COLOR,
  },
  goalTypeDescription: {
    fontSize: 13,
    color: '#64748B',
  },
  tipCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${PRIMARY_COLOR}30`,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_COLOR,
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  createButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CreateBudgetScreen;