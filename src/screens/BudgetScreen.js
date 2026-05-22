// src/screens/BudgetScreen.js
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useBudget} from '../context/BudgetContext';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';
import SetBudgetModal from '../components/SetBudgetModal';
import AddCategoryModal from '../components/AddCategoryModal';
import AddGroupModal from '../components/AddGroupModal.js';
import EditGroupModal from '../components/EditGroupModal.js';

const BudgetScreen = ({navigation, route}) => {
  const budget = useBudget();
  const scrollViewRef = useRef(null);

  // State variables
  const [activeCategoryTab, setActiveCategoryTab] = useState('bills');
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonthDisplay, setCurrentMonthDisplay] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showSetBudgetModal, setShowSetBudgetModal] = useState(false);
  const [selectedCategoryForBudget, setSelectedCategoryForBudget] =
    useState(null);
  const [pickerMode, setPickerMode] = useState('transaction');
  const [transactionForm, setTransactionForm] = useState({
    payee: '',
    amount: '',
    category: '',
    categoryId: null,
    date: new Date().toISOString().split('T')[0],
  });
  const [categoriesList, setCategoriesList] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalBudgeted, setTotalBudgeted] = useState(0);
  const [groupTabs, setGroupTabs] = useState([]);

  // Group configurations
  const [groupConfig, setGroupConfig] = useState({
    bills: {
      id: 'bills',
      name: 'Bills',
      icon: 'file-text',
      color: '#0A84FF',
      lightColor: '#E8F1FF',
      isCustom: false,
    },
    wants: {
      id: 'wants',
      name: 'Wants',
      icon: 'heart',
      color: '#FF2D55',
      lightColor: '#FFE5E9',
      isCustom: false,
    },
    needs: {
      id: 'needs',
      name: 'Needs',
      icon: 'shield',
      color: '#34C759',
      lightColor: '#E6F7E6',
      isCustom: false,
    },
  });

  // Load custom groups from storage
  useEffect(() => {
    loadCustomGroups();
  }, []);

  // Update group tabs when categoryData changes
  useEffect(() => {
    if (budget.categoryData) {
      const groups = Object.keys(budget.categoryData).map(key => ({
        id: key,
        name: budget.categoryData[key].name,
        ...groupConfig[key],
      }));
      setGroupTabs(groups);
    }
  }, [budget.categoryData, groupConfig]);

  // Recalculate totals when transactions or categoryData changes
  useEffect(() => {
    calculateTotals();
  }, [budget.categoryData, budget.transactions, budget.currentMonth]);

  const loadCustomGroups = async () => {
    try {
      const storedGroups = await AsyncStorage.getItem('custom_groups');
      if (storedGroups) {
        const customGroups = JSON.parse(storedGroups);
        setGroupConfig(prev => ({...prev, ...customGroups}));
      }
    } catch (error) {
      console.error('Error loading custom groups:', error);
    }
  };

  const handleAddGroup = async (groupName, icon, color) => {
    try {
      const groupId = `group_${Date.now()}`;
      const newGroup = {
        id: groupId,
        name: groupName,
        icon: icon || 'folder',
        color: color || '#3F2B96',
        lightColor: color ? `${color}20` : '#3F2B9620',
        isCustom: true,
      };

      // Update groupConfig
      const updatedGroupConfig = {...groupConfig, [groupId]: newGroup};
      setGroupConfig(updatedGroupConfig);
      await AsyncStorage.setItem('custom_groups', JSON.stringify(updatedGroupConfig));

      // Update categoryData with new group
      const updatedData = {...budget.categoryData, [groupId]: {
        name: groupName,
        categories: []
      }};
      await AsyncStorage.setItem('budget_data', JSON.stringify(updatedData));
      budget.setCategoryData(updatedData);

      // Set as active tab
      setActiveCategoryTab(groupId);
      
      Alert.alert('Success', 'Group added successfully');
      setShowAddDropdown(false);
      setShowAddGroupModal(false);
    } catch (error) {
      console.error('Error adding group:', error);
      Alert.alert('Error', 'Failed to add group');
    }
  };

  const handleEditGroup = async (groupId, newName, newIcon, newColor) => {
    try {
      // Update groupConfig
      const updatedGroupConfig = {...groupConfig};
      if (updatedGroupConfig[groupId]) {
        updatedGroupConfig[groupId] = {
          ...updatedGroupConfig[groupId],
          name: newName,
          icon: newIcon,
          color: newColor,
          lightColor: `${newColor}20`,
        };
      }
      setGroupConfig(updatedGroupConfig);
      await AsyncStorage.setItem('custom_groups', JSON.stringify(updatedGroupConfig));

      // Update categoryData group name
      const updatedData = {...budget.categoryData};
      if (updatedData[groupId]) {
        updatedData[groupId].name = newName;
      }
      await AsyncStorage.setItem('budget_data', JSON.stringify(updatedData));
      budget.setCategoryData(updatedData);

      Alert.alert('Success', 'Group updated successfully');
      setShowEditGroupModal(false);
      setShowGroupMenu(false);
    } catch (error) {
      console.error('Error editing group:', error);
      Alert.alert('Error', 'Failed to edit group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    // Prevent deleting default groups
    if (groupId === 'bills' || groupId === 'wants' || groupId === 'needs') {
      Alert.alert('Cannot Delete', 'Default groups cannot be deleted');
      setShowGroupMenu(false);
      return;
    }

    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${groupConfig[groupId]?.name}" group? All categories in this group will also be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove from groupConfig
              const updatedGroupConfig = {...groupConfig};
              delete updatedGroupConfig[groupId];
              setGroupConfig(updatedGroupConfig);
              await AsyncStorage.setItem('custom_groups', JSON.stringify(updatedGroupConfig));

              // Remove from categoryData
              const updatedData = {...budget.categoryData};
              delete updatedData[groupId];
              await AsyncStorage.setItem('budget_data', JSON.stringify(updatedData));
              budget.setCategoryData(updatedData);

              // Set active tab to bills if current tab was deleted
              if (activeCategoryTab === groupId) {
                setActiveCategoryTab('bills');
              }

              Alert.alert('Success', 'Group deleted successfully');
              setShowGroupMenu(false);
            } catch (error) {
              console.error('Error deleting group:', error);
              Alert.alert('Error', 'Failed to delete group');
            }
          },
        },
      ]
    );
  };

  // Load categories list
  useEffect(() => {
    loadCategoriesList();
  }, [budget.categoryData]);

  const calculateTotals = () => {
    let spent = 0;
    let budgeted = 0;

    if (budget.categoryData && budget.transactions) {
      // Filter transactions for current month
      const monthTransactions = budget.transactions.filter(t => {
        if (!t.date) return false;
        // Handle different date formats
        const transactionMonth = t.date.substring(0, 7); // YYYY-MM
        return transactionMonth === budget.currentMonth;
      });
      
      spent = monthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

      // Calculate total budgeted from all categories
      Object.keys(budget.categoryData).forEach(groupKey => {
        const group = budget.categoryData[groupKey];
        if (group?.categories) {
          group.categories.forEach(cat => {
            budgeted += cat.assigned || 0;
          });
        }
      });
    }

    setTotalSpent(spent);
    setTotalBudgeted(budgeted);
  };

  // Update month display
  useEffect(() => {
    if (budget.currentMonth) {
      const [year, month] = budget.currentMonth.split('-');
      // Validate year and month
      if (year && month && !isNaN(parseInt(year)) && !isNaN(parseInt(month))) {
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          setCurrentMonthDisplay(
            date.toLocaleDateString('en-US', {month: 'short', year: 'numeric'})
          );
        } else {
          // Fallback to current month if invalid
          const now = new Date();
          setCurrentMonthDisplay(
            now.toLocaleDateString('en-US', {month: 'short', year: 'numeric'})
          );
        }
      }
    }
  }, [budget.currentMonth]);

  const loadCategoriesList = () => {
    const list = [];
    if (budget.categoryData) {
      Object.keys(budget.categoryData).forEach(groupKey => {
        const group = budget.categoryData[groupKey];
        if (group?.categories) {
          group.categories.forEach(cat => {
            list.push({
              id: cat.id, 
              name: cat.name, 
              group: group.name, 
              groupId: groupKey
            });
          });
        }
      });
    }
    setCategoriesList(list);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCustomGroups();
    await budget.refreshData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePreviousMonth = () => {
    if (!budget.currentMonth) return;
    
    const [year, month] = budget.currentMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 2, 1);
    
    // Check if date is valid
    if (!isNaN(date.getTime())) {
      const newMonth = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;
      budget.changeMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    if (!budget.currentMonth) return;
    
    const [year, month] = budget.currentMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month), 1);
    
    // Check if date is valid
    if (!isNaN(date.getTime())) {
      const newMonth = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`;
      budget.changeMonth(newMonth);
    }
  };

  const handleAddCategory = () => {
    setShowAddCategoryModal(true);
    setShowAddDropdown(false);
  };

  const handleSaveCategory = async (categoryName, groupId) => {
    try {
      const newCategory = {
        id: `${groupId}_${Date.now()}`,
        name: categoryName,
        assigned: 0,
        available: 0,
        activity: 0,
      };

      const updatedData = {...budget.categoryData};
      if (!updatedData[groupId]) {
        updatedData[groupId] = { name: 'New Group', categories: [] };
      }
      updatedData[groupId].categories.push(newCategory);

      await AsyncStorage.setItem('budget_data', JSON.stringify(updatedData));
      budget.setCategoryData(updatedData);

      loadCategoriesList();
      Alert.alert('Success', 'Category added successfully');
      setShowAddCategoryModal(false);
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleSetBudget = category => {
    setSelectedCategoryForBudget(category);
    setShowSetBudgetModal(true);
  };

  const handleGlobalSetBudget = () => {
    setPickerMode('budget');
    setSelectedCategoryForBudget(null);
    setShowCategoryPicker(true);
  };

  const handleCategorySelectForBudget = category => {
    setShowCategoryPicker(false);
    setPickerMode('transaction');
    let foundCategory = null;
    Object.keys(budget.categoryData).forEach(groupKey => {
      const group = budget.categoryData[groupKey];
      if (group?.categories) {
        const cat = group.categories.find(c => c.id === category.id);
        if (cat) {
          foundCategory = {...cat, group: group.name, groupId: groupKey};
        }
      }
    });
    if (foundCategory) {
      setSelectedCategoryForBudget(foundCategory);
      setShowSetBudgetModal(true);
    }
  };

  const handleSaveBudget = async (categoryId, budgetAmount) => {
    const success = await budget.setCategoryBudget(categoryId, budgetAmount);
    if (success) {
      setShowSetBudgetModal(false);
      setSelectedCategoryForBudget(null);
      // Recalculate totals after budget update
      calculateTotals();
    }
  };

  const handleCategoryPress = category => {
    const {spent, count, transactions} = budget.getCategorySpent(category.id);

    navigation.navigate('CategoryDetail', {
      category: {
        ...category,
        spent,
        transactionCount: count,
        transactions: transactions,
        remainingBalance: (category.assigned || 0) - spent,
      },
      currentMonth: budget.currentMonth,
    });
  };

  const handleAddTransaction = () => {
    setTransactionForm({
      payee: '',
      amount: '',
      category: '',
      categoryId: null,
      date: new Date().toISOString().split('T')[0],
    });
    setShowTransactionModal(true);
  };

  const handleSelectCategory = category => {
    setTransactionForm({
      ...transactionForm,
      category: category.name,
      categoryId: category.id,
    });
    setShowCategoryPicker(false);
    setPickerMode('transaction');
  };

  const handleSubmitTransaction = async () => {
    // Validate inputs
    if (!transactionForm.payee.trim()) {
      Alert.alert('Error', 'Please enter a payee');
      return;
    }
    
    const amount = parseFloat(transactionForm.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return;
    }
    
    if (!transactionForm.categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(transactionForm.date)) {
      Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }

    const newTransaction = {
      id: `t${Date.now()}`,
      categoryId: transactionForm.categoryId,
      amount: amount,
      date: transactionForm.date,
      payee: transactionForm.payee.trim(),
      type: 'expense',
    };

    const success = await budget.addTransaction(newTransaction);
    if (success) {
      setShowTransactionModal(false);
      // Recalculate totals after adding transaction
      calculateTotals();
      Alert.alert('Success', 'Transaction added successfully');
    }
  };

  const scrollToTab = (tabId) => {
    const index = groupTabs.findIndex(tab => tab.id === tabId);
    if (index !== -1 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * 100,
        animated: true,
      });
    }
  };

  if (budget.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <TopBar
          title="Budget"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0A84FF" />
          <Text style={styles.loadingText}>Loading your budget...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeData = budget.categoryData[activeCategoryTab] || {
    name: groupConfig[activeCategoryTab]?.name || 'Categories',
    categories: [],
  };

  // Calculate group totals for active tab
  let groupBudgeted = 0;
  let groupSpent = 0;
  if (activeData.categories) {
    activeData.categories.forEach(cat => {
      groupBudgeted += cat.assigned || 0;
      const {spent} = budget.getCategorySpent(cat.id);
      groupSpent += spent;
    });
  }
  const groupRemaining = groupBudgeted - groupSpent;
  const groupProgressPercentage =
    groupBudgeted > 0 ? Math.min((groupSpent / groupBudgeted) * 100, 100) : 0;

  // Get all groups for tabs
  const allGroups = Object.keys(budget.categoryData || {}).map(key => ({
    id: key,
    name: budget.categoryData[key]?.name || key,
    color: groupConfig[key]?.color || '#3F2B96',
    lightColor: groupConfig[key]?.lightColor || '#3F2B9620',
    icon: groupConfig[key]?.icon || 'folder',
  }));

  // Check if we have more than 3 groups
  const hasManyGroups = allGroups.length > 3;

  // Check if current group is custom (not default)
  const isCurrentGroupCustom = activeCategoryTab !== 'bills' && 
                               activeCategoryTab !== 'wants' && 
                               activeCategoryTab !== 'needs';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopBar
        title="Budget"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Month Navigation */}
      <View style={styles.monthSwitchContainer}>
        <View style={styles.monthNavigation}>
          <TouchableOpacity
            style={styles.monthArrowButton}
            onPress={handlePreviousMonth}>
            <Icon name="chevron-left" size={18} color="#1c1c1c" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{currentMonthDisplay}</Text>
          <TouchableOpacity
            style={styles.monthArrowButton}
            onPress={handleNextMonth}>
            <Icon name="chevron-right" size={18} color="#1c1c1c" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.topAddButton}
          onPress={handleAddTransaction}>
          <Icon name="plus-circle" size={16} color="#0A84FF" />
          <Text style={styles.topAddButtonText}>Add Transaction</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <LinearGradient
        colors={['#3F2B96', '#2A1B6D']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Monthly Summary</Text>
          <TouchableOpacity
            onPress={handleGlobalSetBudget}
            style={styles.addBudgetButton}>
            <Icon name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.addBudgetButtonText}>Set Budget</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatLabel}>Planned Budget</Text>
            <Text style={styles.summaryStatValue}>
              {budget.formatCurrency(totalBudgeted)}
            </Text>
          </View>

          <View style={styles.summaryStatDivider} />

          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatLabel}>Actual Spending</Text>
            <Text style={[styles.summaryStatValue, styles.spentValue]}>
              {budget.formatCurrency(totalSpent)}
            </Text>
          </View>

          <View style={styles.summaryStatDivider} />

          <View style={styles.summaryStat}>
            <Text style={styles.summaryStatLabel}>Left to Spend</Text>
            <Text
              style={[
                styles.summaryStatValue,
                totalBudgeted - totalSpent >= 0
                  ? styles.positiveValue
                  : styles.negativeValue,
              ]}>
              {budget.formatCurrency(totalBudgeted - totalSpent)}
            </Text>
          </View>
        </View>

        {/* Overall Progress Bar */}
        {totalBudgeted > 0 && (
          <View style={styles.overallProgressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.summaryProgressLabel}>Overall Progress</Text>
              <Text style={styles.summaryProgressPercentage}>
                {Math.min(Math.round((totalSpent / totalBudgeted) * 100), 100)}%
              </Text>
            </View>
            <View style={styles.summaryProgressTrack}>
              <View
                style={[
                  styles.summaryProgressFill,
                  {
                    width: `${Math.min(
                      (totalSpent / totalBudgeted) * 100,
                      100,
                    )}%`,
                    backgroundColor: totalSpent > totalBudgeted ? '#DC2626' : '#4ADE80',
                  },
                ]}
              />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.summaryProgressFooterText}>
                {budget.formatCurrency(totalSpent)} of{' '}
                {budget.formatCurrency(totalBudgeted)}
              </Text>
              {totalSpent > totalBudgeted && (
                <View style={styles.overBudgetBadge}>
                  <Icon name="alert-triangle" size={10} color="#DC2626" />
                  <Text style={styles.overBudgetText}>
                    Over by {budget.formatCurrency(totalSpent - totalBudgeted)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0A84FF"
          />
        }>
        {/* Categories Header with Add Dropdown */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          <View style={styles.addButtonContainer}>
            <TouchableOpacity
              style={styles.addMainButton}
              onPress={() => setShowAddDropdown(!showAddDropdown)}>
              <Icon name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.addMainButtonText}>Add</Text>
            </TouchableOpacity>
            
            {/* Dropdown Menu */}
            {showAddDropdown && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowAddDropdown(false);
                    setShowAddGroupModal(true);
                  }}>
                  <Icon name="grid" size={18} color="#3F2B96" />
                  <Text style={styles.dropdownItemText}>Add Group</Text>
                </TouchableOpacity>
                <View style={styles.dropdownDivider} />
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleAddCategory}>
                  <Icon name="plus-circle" size={18} color="#3F2B96" />
                  <Text style={styles.dropdownItemText}>Add Category</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Tabs - Conditional rendering based on number of groups */}
        {hasManyGroups ? (
          // Horizontal Scrollable Tabs for many groups
          <View style={styles.tabsWrapper}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollContent}>
              {allGroups.map(tab => {
                const isActive = activeCategoryTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[
                      styles.horizontalTab,
                      isActive && styles.activeHorizontalTab,
                      {borderColor: isActive ? tab.color : '#E2E8F0'}
                    ]}
                    onPress={() => {
                      setActiveCategoryTab(tab.id);
                      scrollToTab(tab.id);
                    }}>
                    <View
                      style={[
                        styles.horizontalTabIcon,
                        {backgroundColor: isActive ? tab.lightColor : '#F1F5F9'},
                      ]}>
                      <Icon
                        name={tab.icon}
                        size={16}
                        color={isActive ? tab.color : '#64748B'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.horizontalTabText,
                        isActive && styles.activeHorizontalTabText,
                        {color: isActive ? tab.color : '#64748B'}
                      ]}>
                      {tab.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          // Original centered tabs for 3 or fewer groups
          <View style={styles.originalTabsContainer}>
            {allGroups.map(tab => {
              const isActive = activeCategoryTab === tab.id;
              const config = groupConfig[tab.id] || tab;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.originalTab, isActive && styles.originalActiveTab]}
                  onPress={() => setActiveCategoryTab(tab.id)}>
                  <View
                    style={[
                      styles.originalTabIconContainer,
                      {backgroundColor: isActive ? config.lightColor : '#F1F5F9'},
                    ]}>
                    <Icon
                      name={config.icon}
                      size={16}
                      color={isActive ? config.color : '#64748B'}
                    />
                  </View>
                  <Text
                    style={[styles.originalTabText, isActive && styles.originalActiveTabText]}>
                    {tab.name}
                  </Text>
                  {isActive && (
                    <View
                      style={[
                        styles.originalTabIndicator,
                        {backgroundColor: config.color},
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Group Summary Card with Menu */}
        <View style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <View style={styles.groupTitleContainer}>
              <View
                style={[
                  styles.groupIcon,
                  {backgroundColor: groupConfig[activeCategoryTab]?.lightColor || '#3F2B9620'},
                ]}>
                <Icon
                  name={groupConfig[activeCategoryTab]?.icon || 'folder'}
                  size={18}
                  color={groupConfig[activeCategoryTab]?.color || '#3F2B96'}
                />
              </View>
              <View>
                <Text style={styles.groupName}>{activeData.name} Overview</Text>
                <Text style={styles.groupSubtitle}>
                  {activeData.categories?.length || 0} categories
                </Text>
              </View>
            </View>
            
            {/* Three dots menu for group options */}
            {isCurrentGroupCustom && (
              <View style={styles.groupMenuContainer}>
                <TouchableOpacity
                  style={styles.groupMenuButton}
                  onPress={() => setShowGroupMenu(!showGroupMenu)}>
                  <Icon name="more-vertical" size={20} color="#64748B" />
                </TouchableOpacity>
                
                {/* Group Menu Dropdown */}
                {showGroupMenu && (
                  <View style={styles.groupDropdownMenu}>
                    <TouchableOpacity
                      style={styles.groupDropdownItem}
                      onPress={() => {
                        setShowGroupMenu(false);
                        setShowEditGroupModal(true);
                      }}>
                      <Icon name="edit-2" size={18} color="#3F2B96" />
                      <Text style={styles.groupDropdownItemText}>Edit Group</Text>
                    </TouchableOpacity>
                    <View style={styles.groupDropdownDivider} />
                    <TouchableOpacity
                      style={[styles.groupDropdownItem, styles.deleteItem]}
                      onPress={() => handleDeleteGroup(activeCategoryTab)}>
                      <Icon name="trash-2" size={18} color="#DC2626" />
                      <Text style={[styles.groupDropdownItemText, styles.deleteText]}>Delete Group</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.groupStatsRow}>
            <View style={styles.groupStat}>
              <Text style={styles.groupStatLabel}>Planned Budget</Text>
              <Text style={styles.groupStatValue}>
                {budget.formatCurrency(groupBudgeted)}
              </Text>
            </View>
            <View style={styles.groupStatDivider} />
            <View style={styles.groupStat}>
              <Text style={styles.groupStatLabel}>Actual Spending</Text>
              <Text style={styles.groupStatValue}>
                {budget.formatCurrency(groupSpent)}
              </Text>
            </View>
            <View style={styles.groupStatDivider} />
            <View style={styles.groupStat}>
              <Text style={styles.groupStatLabel}>Left to Spend</Text>
              <Text
                style={[
                  styles.groupStatValue,
                  groupRemaining >= 0
                    ? styles.positiveText
                    : styles.negativeText,
                ]}>
                {budget.formatCurrency(groupRemaining)}
              </Text>
            </View>
          </View>
        </View>

        {/* Categories List */}
        <View style={styles.categoriesContainer}>
          {activeData.categories && activeData.categories.length > 0 ? (
            activeData.categories.map(category => {
              const assigned = category.assigned || 0;
              const {spent, count} = budget.getCategorySpent(category.id);
              const remaining = assigned - spent;
              const hasBudget = assigned > 0;
              const progressPercentage =
                assigned > 0 ? Math.min((spent / assigned) * 100, 100) : 0;
              const isOverBudget = spent > assigned && assigned > 0;

              return (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category)}
                  activeOpacity={0.7}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryTitleSection}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      {count > 0 && (
                        <View style={styles.countBadge}>
                          <Text style={styles.countBadgeText}>{count}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.categoryRightSection}>
                      {hasBudget ? (
                        <View style={styles.budgetPill}>
                          <Text style={styles.budgetPillText}>
                            {budget.formatCurrency(assigned)}
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.headerSetBudgetButton}
                          onPress={() => handleSetBudget(category)}>
                          <Icon name="plus-circle" size={14} color="#3F2B96" />
                          <Text style={styles.headerSetBudgetText}>
                            Set Budget
                          </Text>
                        </TouchableOpacity>
                      )}
                      <Icon name="chevron-right" size={20} color="#94A3B8" />
                    </View>
                  </View>

                  {/* Progress Bar */}
                  {hasBudget && (
                    <View style={styles.categoryProgressSection}>
                      <View style={styles.categoryProgressHeader}>
                        <Text style={styles.categoryProgressLabel}>Spent</Text>
                        <Text
                          style={[
                            styles.categoryProgressPercentage,
                            isOverBudget && styles.overBudgetPercentage,
                          ]}>
                          {Math.round(progressPercentage)}%
                        </Text>
                      </View>
                      <View style={styles.categoryProgressTrack}>
                        <View
                          style={[
                            styles.categoryProgressFill,
                            {
                              width: `${progressPercentage}%`,
                              backgroundColor: isOverBudget
                                ? '#DC2626'
                                : '#3F2B96',
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.categoryProgressFooter}>
                        <Text style={styles.categoryProgressFooterText}>
                          Spent {budget.formatCurrency(spent)} of {budget.formatCurrency(assigned)}
                        </Text>
                        {isOverBudget && (
                          <View style={styles.overBudgetBadge}>
                            <Icon
                              name="alert-triangle"
                              size={10}
                              color="#DC2626"
                            />
                            <Text style={styles.overBudgetText}>
                              Over by {budget.formatCurrency(spent - assigned)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {!hasBudget && (
                    <View style={styles.categoryProgressSection}>
                      <View style={styles.categoryProgressHeader}>
                        <Text style={styles.categoryProgressLabel}>No Budget Set</Text>
                      </View>
                      <View style={styles.categoryProgressFooter}>
                        <Text style={styles.categoryProgressFooterText}>
                          Spent {budget.formatCurrency(spent)}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyCategories}>
              <Icon name="folder" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No categories yet</Text>
              <Text style={styles.emptyDescription}>
                Tap the + button above to add your first category
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddTransaction}
        activeOpacity={0.9}>
        <LinearGradient
          colors={['#3F2B96', '#2A1B6D']}
          style={styles.fabGradient}>
          <Icon name="plus" size={24} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Group Modal */}
      <AddGroupModal
        visible={showAddGroupModal}
        onClose={() => {
          setShowAddGroupModal(false);
          setShowAddDropdown(false);
        }}
        onSave={handleAddGroup}
      />

      {/* Edit Group Modal */}
      <EditGroupModal
        visible={showEditGroupModal}
        onClose={() => {
          setShowEditGroupModal(false);
          setShowGroupMenu(false);
        }}
        onSave={handleEditGroup}
        group={groupConfig[activeCategoryTab]}
        groupId={activeCategoryTab}
      />

      {/* Add Category Modal */}
      <AddCategoryModal
        visible={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setShowAddDropdown(false);
        }}
        onSave={handleSaveCategory}
        groupId={activeCategoryTab}
        groupName={activeData.name}
        groups={allGroups}
      />

      {/* Set Budget Modal */}
      {selectedCategoryForBudget && (
        <SetBudgetModal
          visible={showSetBudgetModal}
          onClose={() => {
            setShowSetBudgetModal(false);
            setSelectedCategoryForBudget(null);
          }}
          category={selectedCategoryForBudget}
          onSave={handleSaveBudget}
          totalBalance={totalBudgeted}
          formatCurrency={budget.formatCurrency}
        />
      )}

      {/* Add Transaction Modal */}
      <Modal
        visible={showTransactionModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTransactionModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <TouchableOpacity onPress={() => setShowTransactionModal(false)}>
                <Icon name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Payee <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter payee name"
                  placeholderTextColor="#94A3B8"
                  value={transactionForm.payee}
                  onChangeText={text =>
                    setTransactionForm({...transactionForm, payee: text})
                  }
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Amount <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                    value={transactionForm.amount}
                    onChangeText={text =>
                      setTransactionForm({...transactionForm, amount: text})
                    }
                  />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Date <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94A3B8"
                    value={transactionForm.date}
                    onChangeText={text =>
                      setTransactionForm({...transactionForm, date: text})
                    }
                  />
                  <Icon name="calendar" size={16} color="#64748B" />
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>
                  Category <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.selectField}
                  onPress={() => {
                    setPickerMode('transaction');
                    setSelectedCategoryForBudget(null);
                    setShowCategoryPicker(true);
                  }}>
                  <Text
                    style={[
                      styles.selectFieldText,
                      !transactionForm.category && styles.placeholderText,
                    ]}>
                    {transactionForm.category || 'Select a category...'}
                  </Text>
                  <Icon name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitTransaction}>
                <LinearGradient
                  colors={['#5F2B80', '#40135c']}
                  style={styles.submitButtonGradient}>
                  <Text style={styles.submitButtonText}>Add Transaction</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryPicker(false)}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>
                {pickerMode === 'transaction'
                  ? 'Select Category'
                  : 'Select Category for Budget'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCategoryPicker(false);
                  setPickerMode('transaction');
                }}>
                <Icon name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {allGroups.map(group => {
                const groupCategories = categoriesList.filter(cat => cat.groupId === group.id);
                if (groupCategories.length === 0) return null;
                
                return (
                  <View key={group.id} style={styles.pickerGroupContainer}>
                    <View style={[styles.pickerGroupHeader, {borderLeftColor: group.color}]}>
                      <Icon name={group.icon} size={16} color={group.color} />
                      <Text style={styles.pickerGroupTitle}>{group.name}</Text>
                    </View>
                    {groupCategories.map(category => (
                      <TouchableOpacity
                        key={category.id}
                        style={styles.pickerItem}
                        onPress={() => {
                          if (pickerMode === 'transaction') {
                            handleSelectCategory(category);
                          } else {
                            handleCategorySelectForBudget(category);
                          }
                        }}>
                        <Text style={styles.pickerItemText}>
                          {category.name}
                        </Text>
                        {(transactionForm.category === category.name ||
                          selectedCategoryForBudget?.name === category.name) && (
                          <Icon name="check" size={18} color={group.color} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomNav activeTab="budget" onTabPress={() => {}} />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
  },
  // Month Navigation
  monthSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  monthArrowButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    minWidth: 100,
    textAlign: 'center',
  },
  topAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#0A84FF20',
  },
  topAddButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A84FF',
  },
  // Summary Card
  summaryCard: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    padding: 16,
    paddingBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addBudgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  addBudgetButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  summaryStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  spentValue: {
    color: '#ffffff',
  },
  positiveValue: {
    color: '#4ADE80',
  },
  negativeValue: {
    color: '#FF6B6B',
  },
  // Summary Progress Bar Styles
  overallProgressContainer: {
    marginTop: 5,
  },
  summaryProgressLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  summaryProgressPercentage: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 6,
  },
  summaryProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryProgressFooterText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  // Regular Progress Bar Styles
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 5,
  },
  progressFooterText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  // Category Progress Bar Styles
  categoryProgressSection: {
    marginBottom: 12,
    marginTop: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  categoryProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryProgressLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryProgressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  categoryProgressTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryProgressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryProgressFooterText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  overBudgetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  overBudgetText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
  },
  overBudgetPercentage: {
    color: '#DC2626',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  // Categories Header with Add Dropdown
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  addButtonContainer: {
    position: 'relative',
  },
  addMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3F2B96',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#3F2B96',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addMainButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  // Original Tabs (for 3 or fewer groups)
  originalTabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  originalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    position: 'relative',
    gap: 6,
  },
  originalActiveTab: {
    backgroundColor: '#F8FAFC',
  },
  originalTabIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  originalTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  originalActiveTabText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  originalTabIndicator: {
    position: 'absolute',
    bottom: -4,
    left: 20,
    right: 20,
    height: 2,
    borderRadius: 1,
  },
  // Horizontal Scrollable Tabs (for many groups)
  tabsWrapper: {
    marginBottom: 16,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  horizontalTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  activeHorizontalTab: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
  },
  horizontalTabIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeHorizontalTabText: {
    fontWeight: '700',
  },
  // Group Card
  groupCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  groupHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  groupSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  groupMenuContainer: {
    position: 'relative',
  },
  groupMenuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  groupDropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  groupDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  groupDropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  groupDropdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  deleteItem: {
    // No additional styles needed
  },
  deleteText: {
    color: '#DC2626',
  },
  groupStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  groupStat: {
    flex: 1,
    alignItems: 'center',
  },
  groupStatDivider: {
    width: 1,
    height: 25,
    backgroundColor: '#E2E8F0',
  },
  groupStatLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  groupStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  groupProgressSection: {
    marginTop: 12,
  },
  positiveText: {
    color: '#10B981',
  },
  negativeText: {
    color: '#DC2626',
  },
  // Categories Container
  categoriesContainer: {
    marginHorizontal: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetPill: {
    backgroundColor: '#3F2B9610',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3F2B9620',
  },
  budgetPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F2B96',
  },
  headerSetBudgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#3F2B9620',
  },
  headerSetBudgetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3F2B96',
  },
  emptyCategories: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    shadowColor: '#3F2B96',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#DC2626',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    padding: 0,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    padding: 0,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  selectFieldText: {
    fontSize: 15,
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Enhanced Picker Styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  pickerGroupContainer: {
    marginBottom: 16,
  },
  pickerGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 4,
    borderLeftWidth: 4,
  },
  pickerGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginLeft: 32,
  },
  pickerItemText: {
    fontSize: 15,
    color: '#0F172A',
  },
});

export default BudgetScreen;