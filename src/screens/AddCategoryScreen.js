// src/screens/AddCategoryScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar
} from 'react-native';
import { useBudget } from '../context/BudgetContext';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import TopBar from '../components/layout/TopBar';
import { saveBudgetData } from '../services/BudgetStorage';

const GROUP_COLORS = {
  bills: '#0A84FF',
  wants: '#FF2D55',
  needs: '#34C759'
};

const GROUP_ICONS = {
  bills: 'file-text',
  wants: 'heart',
  needs: 'shield'
};

const AddCategoryScreen = ({ navigation, route }) => {
  const budget = useBudget();
  const { group = 'bills' } = route.params || {};
  
  const [categoryName, setCategoryName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(group);
  const [monthlyBudget, setMonthlyBudget] = useState('');

  const groups = [
    { id: 'bills', name: 'Bills', color: '#0A84FF', icon: 'file-text' },
    { id: 'wants', name: 'Wants', color: '#FF2D55', icon: 'heart' },
    { id: 'needs', name: 'Needs', color: '#34C759', icon: 'shield' }
  ];

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const currentData = budget.categoryData || {};
      const updatedData = JSON.parse(JSON.stringify(currentData));
      
      if (!updatedData[selectedGroup]) {
        updatedData[selectedGroup] = {
          id: selectedGroup,
          name: groups.find(g => g.id === selectedGroup).name,
          categories: [],
          color: GROUP_COLORS[selectedGroup],
          icon: GROUP_ICONS[selectedGroup],
          lightColor: `${GROUP_COLORS[selectedGroup]}20`,
          totalBudgeted: 0,
          totalSpent: 0,
          totalAvailable: 0
        };
      }

      const budgetAmount = monthlyBudget ? parseFloat(monthlyBudget) : 0;
      
      const newCategory = {
        id: `${selectedGroup}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: categoryName.trim(),
        assigned: 0,
        available: 0,
        activity: 0,
        targetAmount: budgetAmount,
        targetFrequency: 'monthly',
        targetType: budgetAmount > 0 ? 'setAside' : 'none',
        targetDay: 'Last Day of the Month',
        dueDate: null,
        color: GROUP_COLORS[selectedGroup],
        type: selectedGroup === 'bills' ? 'bill' : selectedGroup === 'needs' ? 'essential' : 'lifestyle',
        progress: 0
      };

      updatedData[selectedGroup].categories.push(newCategory);
      
      await budget.updateCategoryData(updatedData);
      await saveBudgetData(updatedData);
      
      Alert.alert('Success', 'Category added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopBar 
        title="Add Category" 
        showBack 
        onBackPress={() => navigation.goBack()} 
      />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Category Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Rent, Groceries, Dining Out"
            placeholderTextColor="#94A3B8"
            value={categoryName}
            onChangeText={setCategoryName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category Group</Text>
          <View style={styles.groupButtons}>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.groupButton,
                  selectedGroup === group.id && styles.groupButtonActive,
                  selectedGroup === group.id && { borderColor: group.color }
                ]}
                onPress={() => setSelectedGroup(group.id)}
              >
                <View style={[
                  styles.groupIcon,
                  { backgroundColor: selectedGroup === group.id ? `${group.color}20` : '#F1F5F9' }
                ]}>
                  <Icon 
                    name={group.icon} 
                    size={20} 
                    color={selectedGroup === group.id ? group.color : '#64748B'} 
                  />
                </View>
                <Text style={[
                  styles.groupButtonText,
                  selectedGroup === group.id && { color: group.color, fontWeight: '600' }
                ]}>
                  {group.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Monthly Budget (Optional)</Text>
          <View style={styles.budgetInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.budgetInput}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              value={monthlyBudget}
              onChangeText={setMonthlyBudget}
            />
          </View>
          <Text style={styles.hint}>
            You can set a target amount later in category details
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !categoryName.trim() && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!categoryName.trim()}
        >
          <LinearGradient
            colors={!categoryName.trim() ? ['#94A3B8', '#94A3B8'] : ['#0A84FF', '#0066CC']}
            style={styles.saveButtonGradient}
          >
            <Text style={styles.saveButtonText}>Add Category</Text>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  groupButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  groupButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  groupButtonActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    fontSize: 18,
    color: '#0F172A',
    padding: 0,
  },
  hint: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddCategoryScreen;