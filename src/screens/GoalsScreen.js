// src/screens/GoalsScreen.js
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  Animated,
  Easing,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation, useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Swipeable,
  TapGestureHandler,
} from 'react-native-gesture-handler';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Goal data model (updated to include accounts)
class Goal {
  constructor(data) {
    this.id = data.id || Date.now();
    this.name = data.name || data.title || 'New Goal';
    this.targetAmount = data.targetAmount || data.targetGoal || 0;
    this.currentAmount = data.currentAmount || data.currentSavings || 0;
    this.startDate = data.startDate || new Date().toISOString();
    
    if (data.targetDate) {
      this.targetDate = data.targetDate;
    } else {
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      this.targetDate = nextYear.toLocaleDateString('en-US', {month: 'short', year: 'numeric'});
    }
    
    this.linkedAccountId = data.linkedAccountId || data.accountId || null;
    this.linkedAccountName = data.linkedAccountName || data.accountName || null;
    this.linkedAccountBalance = data.linkedAccountBalance || data.accountBalance || 0;
    this.status = data.status || 'active';
    this.categoryId = data.categoryId || 6;
    this.categoryName = data.categoryName || 'Custom';
    this.icon = data.icon || null;
    this.monthlyContribution = data.monthlyContribution || data.monthlySavings || 0;
    this.notes = data.notes || '';
    this.color = data.color || '#3F2B96';
    this.transactions = data.transactions || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    // Available accounts for selection
    this.availableAccounts = data.availableAccounts || [
      { id: 'checking1', name: 'Main Checking', balance: 5000, type: 'checking' },
      { id: 'savings1', name: 'High-Yield Savings', balance: 10000, type: 'savings' },
      { id: 'credit1', name: 'Rewards Credit Card', balance: 2000, type: 'credit' },
    ];
  }

  getTargetDateObject() {
    try {
      if (this.targetDate && typeof this.targetDate === 'string') {
        const [month, year] = this.targetDate.split(' ');
        const monthMap = {
          'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
          'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        
        if (monthMap[month] !== undefined && year) {
          return new Date(parseInt(year), monthMap[month], 1);
        }
      }
      return new Date(this.targetDate);
    } catch (error) {
      return new Date();
    }
  }

  get timeProgress() {
    try {
      if (!this.startDate || !this.targetDate) return 0;
      const start = new Date(this.startDate);
      const target = this.getTargetDateObject();
      const today = new Date();

      if (isNaN(start.getTime()) || isNaN(target.getTime())) return 0;

      const totalDays = (target - start) / (1000 * 60 * 60 * 24);
      if (totalDays <= 0 || isNaN(totalDays)) return 0;
      
      const elapsedDays = (today - start) / (1000 * 60 * 60 * 24);
      let percentage = (elapsedDays / totalDays) * 100;
      
      if (isNaN(percentage) || !isFinite(percentage)) return 0;
      
      return Math.min(Math.max(percentage, 0), 100);
    } catch (error) {
      return 0;
    }
  }

  get remainingAmount() {
    return Math.max(this.targetAmount - this.currentAmount, 0);
  }

  get progressPercentage() {
    if (this.targetAmount === 0) return 0;
    return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
  }

  get isCompleted() {
    return this.currentAmount >= this.targetAmount;
  }

  get estimatedCompletionDate() {
    if (this.monthlyContribution <= 0) return 'Add monthly savings to estimate';
    const remainingMonths = Math.ceil(this.remainingAmount / this.monthlyContribution);
    if (remainingMonths > 120) return 'More than 10 years';
    
    const date = new Date();
    date.setMonth(date.getMonth() + remainingMonths);
    return date.toLocaleDateString('en-US', {month: 'short', year: 'numeric'});
  }

  get requiredMonthlyToMeetTarget() {
    if (!this.targetDate) return this.monthlyContribution;
    const today = new Date();
    const target = this.getTargetDateObject();
    const monthsRemaining = (target.getFullYear() - today.getFullYear()) * 12 +
      (target.getMonth() - today.getMonth());

    if (monthsRemaining <= 0) return this.remainingAmount;
    return this.remainingAmount / monthsRemaining;
  }

  get daysRemaining() {
    if (!this.targetDate) return null;
    const target = this.getTargetDateObject();
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
}

// Circular Progress Component
const CircularProgress = ({
  percentage,
  color,
  size = 140,
  strokeWidth = 10,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({value}) => {
      setProgress(value);
    });

    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1500,
      easing: Easing.out(Easing.bezier(0.25, 0.1, 0.25, 1)),
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [percentage]);

  const getProgressColor = () => {
    if (percentage >= 100) return '#34C759';
    if (percentage >= 75) return '#3F2B96';
    if (percentage >= 50) return '#FFB347';
    if (percentage >= 25) return '#FF8C00';
    return '#FF6B6B';
  };

  const progressColor = color || getProgressColor();

  // Calculate the rotation based on progress
  const rotation = (progress / 100) * 360;

  return (
    <View style={[styles.circularProgressContainer, {width: size, height: size}]}>
      {/* Background Circle */}
      <View
        style={[
          styles.circleBackground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: '#F1F5F9',
          },
        ]}
      />

      {/* Progress Indicator */}
      <View
        style={[
          styles.progressIndicator,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: progressColor,
            borderLeftColor: 'transparent',
            borderBottomColor: 'transparent',
            transform: [{ rotate: `${rotation}deg` }],
          },
        ]}
      />

      {/* Inner Circle */}
      <View
        style={[
          styles.circleInner,
          {
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            backgroundColor: '#FFFFFF',
          },
        ]}
      />

      {/* Percentage Text */}
      <View style={styles.percentageContainer}>
        <Text style={[styles.percentageText, {color: progressColor}]}>
          {progress.toFixed(1)}%
        </Text>
        <Text style={styles.percentageLabel}>Complete</Text>
      </View>
    </View>
  );
};

export default function GoalsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('byGoal');
  const [bottomNavActive, setBottomNavActive] = useState('goals');
  const [goals, setGoals] = useState([]);
  const [showGoalDetails, setShowGoalDetails] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributeAmount, setContributeAmount] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupedByAccount, setGroupedByAccount] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // New state for account selection
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [currentAction, setCurrentAction] = useState(null); // 'contribute' or 'withdraw'

  const doubleTapRef = useRef();

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    if (route.params?.newGoal) {
      handleNewGoal(route.params.newGoal);
    }
  }, [route.params?.newGoal]);

  useEffect(() => {
    if (activeTab === 'byAccount' && goals.length > 0) {
      const grouped = {};
      goals.forEach(goal => {
        const accountName = goal.linkedAccountName || 'Unlinked';
        if (!grouped[accountName]) {
          grouped[accountName] = {
            accountName,
            accountBalance: goal.linkedAccountBalance || 0,
            goals: [],
          };
        }
        grouped[accountName].goals.push(goal);
      });
      setGroupedByAccount(grouped);
    }
  }, [activeTab, goals]);

  const handleTabPress = (tabId) => {
    setBottomNavActive(tabId);
    switch (tabId) {
      case 'dashboard':
        navigation.navigate('Dashboard');
        break;
      case 'insights':
        navigation.navigate('Insights');
        break;
      case 'budget':
        navigation.navigate('Budget');
        break;
      case 'offers':
        navigation.navigate('Offers');
        break;
      default:
        break;
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGoals().then(() => setRefreshing(false));
  }, []);

  const showQuickActions = (goal) => {
    Alert.alert(
      goal.name,
      'Quick Actions',
      [
        {
          text: '💰 Contribute',
          onPress: () => {
            setSelectedGoal(goal);
            setSelectedAccount(null);
            setCurrentAction('contribute');
            setShowContributeModal(true);
          },
        },
        {
          text: '💸 Withdraw',
          onPress: () => {
            setSelectedGoal(goal);
            setSelectedAccount(null);
            setCurrentAction('withdraw');
            setShowWithdrawModal(true);
          },
        },
        {
          text: goal.status === 'active' ? '⏸️ Pause' : '▶️ Resume',
          onPress: () => {
            setSelectedGoal(goal);
            toggleGoalStatus();
          },
        },
        {
          text: '📊 View Details',
          onPress: () => handleGoalPress(goal),
        },
        {text: '❌ Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  const handleDoubleTap = (goal) => {
    setSelectedGoal(goal);
    setSelectedAccount(null);
    setCurrentAction('contribute');
    setContributeAmount('50');
    setShowContributeModal(true);
  };

  const renderRightActions = (goal) => (
    <TouchableOpacity
      style={styles.swipeDeleteAction}
      onPress={() => {
        setSelectedGoal(goal);
        setShowDeleteModal(true);
      }}>
      <LinearGradient
        colors={['#FF6B6B', '#EE5A5A']}
        style={styles.swipeGradient}>
        <Icon name="trash-2" size={24} color="#FFF" />
        <Text style={styles.swipeText}>Delete</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderLeftActions = (goal) => (
    <TouchableOpacity
      style={styles.swipeContributeAction}
      onPress={() => {
        setSelectedGoal(goal);
        setSelectedAccount(null);
        setCurrentAction('contribute');
        setShowContributeModal(true);
      }}>
      <LinearGradient
        colors={['#34C759', '#2AB84C']}
        style={styles.swipeGradient}>
        <Icon name="plus-circle" size={24} color="#FFF" />
        <Text style={styles.swipeText}>Add</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const storedGoals = await AsyncStorage.getItem('user_goals');

      if (storedGoals) {
        const parsedGoals = JSON.parse(storedGoals);
        const goalInstances = parsedGoals.map(g => new Goal(g));
        setGoals(goalInstances);
      } else {
        setGoals([]);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewGoal = async (goalData) => {
    try {
      const storedGoals = await AsyncStorage.getItem('user_goals');
      let existingGoals = [];

      if (storedGoals) {
        const parsedGoals = JSON.parse(storedGoals);
        existingGoals = parsedGoals.map(g => new Goal(g));
      }

      const newGoal = new Goal(goalData);

      const exists = existingGoals.some(g => g.id === newGoal.id);
      if (exists) {
        Alert.alert('Info', 'This goal already exists');
        navigation.setParams({newGoal: undefined});
        return;
      }

      const updatedGoals = [...existingGoals, newGoal];
      await saveGoals(updatedGoals);
      setGoals(updatedGoals);
      navigation.setParams({newGoal: undefined});
      Alert.alert('Success', 'Goal created successfully!');
    } catch (error) {
      console.error('Error handling new goal:', error);
      Alert.alert('Error', 'Failed to create goal');
    }
  };

  const saveGoals = async (updatedGoals) => {
    try {
      const goalsForStorage = updatedGoals.map(g => ({
        id: g.id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        startDate: g.startDate,
        targetDate: g.targetDate,
        linkedAccountId: g.linkedAccountId,
        linkedAccountName: g.linkedAccountName,
        linkedAccountBalance: g.linkedAccountBalance,
        status: g.status,
        categoryId: g.categoryId,
        categoryName: g.categoryName,
        icon: g.icon,
        monthlyContribution: g.monthlyContribution,
        notes: g.notes,
        color: g.color,
        transactions: g.transactions,
        createdAt: g.createdAt,
        availableAccounts: g.availableAccounts,
      }));

      await AsyncStorage.setItem('user_goals', JSON.stringify(goalsForStorage));
      return true;
    } catch (error) {
      console.error('Error saving goals:', error);
      throw error;
    }
  };

  const updateGoal = async (updatedGoal) => {
    const updatedGoals = goals.map(g =>
      g.id === updatedGoal.id ? updatedGoal : g,
    );
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);
  };

  const deleteGoal = async (goalId) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    setGoals(updatedGoals);
    await saveGoals(updatedGoals);
    setShowDeleteModal(false);
    setShowGoalDetails(false);
    Alert.alert('Success', 'Goal deleted successfully');
  };

  // Format date and time for display
  const formatTransactionDateTime = (isoString) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format time
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    // Format date
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
      return `${dateStr} at ${timeStr}`;
    }
  };

  // Updated handleContribute with account selection
  const handleContribute = async () => {
    if (!contributeAmount || parseFloat(contributeAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedAccount) {
      Alert.alert('Error', 'Please select an account');
      return;
    }

    const amount = parseFloat(contributeAmount);
    const now = new Date().toISOString();
    
    // Create new transaction
    const newTransaction = {
      id: Date.now().toString(),
      type: 'contribute',
      amount: amount,
      date: now,
      accountId: selectedAccount.id,
      accountName: selectedAccount.name,
      accountType: selectedAccount.type,
      note: `Contributed from ${selectedAccount.name}`,
    };

    // Create updated goal
    const updatedGoal = new Goal({
      ...selectedGoal,
      currentAmount: (selectedGoal?.currentAmount || 0) + amount,
      transactions: [
        newTransaction,
        ...(selectedGoal?.transactions || []),
      ],
    });

    await updateGoal(updatedGoal);
    setSelectedGoal(updatedGoal);
    setContributeAmount('');
    setSelectedAccount(null);
    setShowAccountSelector(false);
    setShowContributeModal(false);
    setCurrentAction(null);
    
    if (updatedGoal.progressPercentage >= 100) {
      Alert.alert('🎉 Congratulations!', 'You\'ve reached your goal!');
    } else {
      Alert.alert('Success', `$${amount.toFixed(2)} added to your goal from ${selectedAccount.name}`);
    }
  };

  // Updated handleWithdraw with account selection
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedAccount) {
      Alert.alert('Error', 'Please select an account');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (amount > (selectedGoal?.currentAmount || 0)) {
      Alert.alert('Error', `Insufficient funds. You only have ${formatCurrency(selectedGoal?.currentAmount || 0)} in this goal.`);
      return;
    }

    const now = new Date().toISOString();
    
    // Create new transaction
    const newTransaction = {
      id: Date.now().toString(),
      type: 'withdraw',
      amount: -amount,
      date: now,
      accountId: selectedAccount.id,
      accountName: selectedAccount.name,
      accountType: selectedAccount.type,
      note: `Withdrawn to ${selectedAccount.name}`,
    };

    // Create updated goal
    const updatedGoal = new Goal({
      ...selectedGoal,
      currentAmount: (selectedGoal?.currentAmount || 0) - amount,
      transactions: [
        newTransaction,
        ...(selectedGoal?.transactions || []),
      ],
    });

    await updateGoal(updatedGoal);
    setSelectedGoal(updatedGoal);
    setWithdrawAmount('');
    setSelectedAccount(null);
    setShowAccountSelector(false);
    setShowWithdrawModal(false);
    setCurrentAction(null);
    Alert.alert('Success', `$${amount.toFixed(2)} withdrawn from your goal to ${selectedAccount.name}`);
  };

  const toggleGoalStatus = async () => {
    if (!selectedGoal) return;
    
    const updatedGoal = new Goal({
      ...selectedGoal,
      status: selectedGoal.status === 'active' ? 'paused' : 'active',
    });
    await updateGoal(updatedGoal);
    setSelectedGoal(updatedGoal);
    Alert.alert(
      'Success',
      `Goal ${updatedGoal.status === 'active' ? 'resumed' : 'paused'}`,
    );
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleCreateGoal = () => {
    navigation.navigate('CreateGoalStep1');
  };

  const handleGoalPress = (goal) => {
    setSelectedGoal(goal);
    setShowGoalDetails(true);
  };

  const getGoalIconSource = (categoryId) => {
    const iconMap = {
      1: require('../assets/images/car-goal.png'),
      2: require('../assets/images/emergency-goal.png'),
      3: require('../assets/images/home-goal.png'),
      4: require('../assets/images/wedding-goal.png'),
      5: require('../assets/images/vacation-goal.png'),
      6: require('../assets/images/custom-goal.png'),
    };
    return iconMap[categoryId] || require('../assets/images/custom-goal.png');
  };

  const getAccountIcon = (type) => {
    switch(type) {
      case 'checking': return 'credit-card';
      case 'savings': return 'trending-up';
      case 'credit': return 'pie-chart';
      default: return 'circle';
    }
  };

  const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalCurrent = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const totalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  const formatCurrency = (amount) => {
    return `$${(amount || 0).toFixed(2)}`;
  };

  // Render account selector modal
  const renderAccountSelector = () => (
    <Modal
      visible={showAccountSelector}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAccountSelector(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.accountSelectorModal]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAccountSelector(false)}>
              <Icon name="x" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Account</Text>
            <View style={{width: 24}} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.accountList}>
              {selectedGoal?.availableAccounts?.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={[
                    styles.accountItem,
                    selectedAccount?.id === account.id && styles.selectedAccountItem,
                  ]}
                  onPress={() => {
                    setSelectedAccount(account);
                    setShowAccountSelector(false);
                  }}>
                  <LinearGradient
                    colors={selectedAccount?.id === account.id 
                      ? ['#3F2B9620', '#2A1B6D20']
                      : ['#F8FAFC', '#F1F5F9']}
                    style={styles.accountItemGradient}>
                    <View style={styles.accountItemLeft}>
                      <View style={[
                        styles.accountIcon,
                        { backgroundColor: selectedAccount?.id === account.id ? '#3F2B96' : '#E2E8F0' }
                      ]}>
                        <Icon 
                          name={getAccountIcon(account.type)} 
                          size={16} 
                          color={selectedAccount?.id === account.id ? '#FFF' : '#64748B'} 
                        />
                      </View>
                      <View style={styles.accountInfo}>
                        <Text style={styles.accountName}>{account.name}</Text>
                        <Text style={styles.accountBalance}>
                          Balance: {formatCurrency(account.balance)}
                        </Text>
                      </View>
                    </View>
                    {selectedAccount?.id === account.id && (
                      <Icon name="check-circle" size={20} color="#34C759" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderByGoal = () => (
    <View style={styles.goalsList}>
      {goals.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="target" size={48} color="#CBD5E1" />
          <Text style={styles.emptyStateTitle}>No Goals Yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first financial goal to start tracking your progress
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={handleCreateGoal}>
            <LinearGradient
              colors={['#3F2B96', '#2A1B6D']}
              style={styles.emptyStateButtonGradient}>
              <Icon name="plus" size={18} color="#FFF" />
              <Text style={styles.emptyStateButtonText}>Create Goal</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        goals.map(goal => (
          <TapGestureHandler
            key={`tap-${goal.id}`}
            ref={doubleTapRef}
            numberOfTaps={2}
            onActivated={() => handleDoubleTap(goal)}>
            <View>
              <Swipeable
                key={goal.id}
                renderRightActions={() => renderRightActions(goal)}
                renderLeftActions={() => renderLeftActions(goal)}
                overshootRight={false}
                overshootLeft={false}
                friction={2}
                rightThreshold={40}
                leftThreshold={40}>
                <TouchableOpacity
                  style={styles.goalCard}
                  onPress={() => handleGoalPress(goal)}
                  onLongPress={() => showQuickActions(goal)}
                  delayLongPress={500}
                  activeOpacity={0.7}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalIconContainer}>
                      <Image
                        source={getGoalIconSource(goal.categoryId)}
                        style={styles.goalImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.goalHeaderInfo}>
                      <Text style={styles.goalTitle}>{goal.name}</Text>
                      <Text style={styles.goalSubtitle}>
                        {goal.linkedAccountName || 'No account linked'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.goalStatus,
                        {
                          backgroundColor:
                            goal.status === 'active'
                              ? '#34C75920'
                              : '#FF6B6B20',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.goalStatusText,
                          {
                            color:
                              goal.status === 'active' ? '#34C759' : '#FF6B6B',
                          },
                        ]}>
                        {goal.status === 'active' ? 'Active' : 'Paused'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.goalAmounts}>
                    <View style={styles.goalAmountItem}>
                      <Text style={styles.goalAmountLabel}>Current</Text>
                      <Text style={styles.goalAmountValue}>
                        {formatCurrency(goal.currentAmount)}
                      </Text>
                    </View>
                    <View style={styles.goalAmountItem}>
                      <Text style={styles.goalAmountLabel}>Target</Text>
                      <Text style={styles.goalAmountValue}>
                        {formatCurrency(goal.targetAmount)}
                      </Text>
                    </View>
                    <View style={styles.goalAmountItem}>
                      <Text style={styles.goalAmountLabel}>Remaining</Text>
                      <Text
                        style={[styles.goalAmountValue, {color: '#E56772'}]}>
                        {formatCurrency(goal.remainingAmount)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.goalProgressSection}>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${goal.progressPercentage}%`,
                              backgroundColor: goal.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                    <View style={styles.progressStats}>
                      <Text style={styles.progressPercent}>
                        {goal.progressPercentage.toFixed(1)}%
                      </Text>
                      <Text style={styles.targetDate}>
                        Due {goal.targetDate}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.monthlyContribution}>
                    <Icon name="calendar" size={14} color="#64748B" />
                    <Text style={styles.monthlyContributionText}>
                      Saving ${goal.monthlyContribution.toFixed(2)}/month
                    </Text>
                    {goal.timeProgress > 0 && (
                      <View style={styles.timeProgress}>
                        <Text style={styles.timeProgressText}>
                          {goal.timeProgress.toFixed(0)}% time elapsed
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Swipeable>
            </View>
          </TapGestureHandler>
        ))
      )}
    </View>
  );

  const renderByAccount = () => (
    <View style={styles.goalsList}>
      {Object.keys(groupedByAccount).length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="target" size={48} color="#CBD5E1" />
          <Text style={styles.emptyStateTitle}>No Goals Yet</Text>
          <Text style={styles.emptyStateText}>
            Create your first financial goal to start tracking your progress
          </Text>
        </View>
      ) : (
        Object.values(groupedByAccount).map((group, index) => (
          <View key={index} style={styles.accountGroup}>
            <View style={styles.accountGroupHeader}>
              <View style={styles.accountGroupInfo}>
                <Icon name="credit-card" size={18} color="#3F2B96" />
                <Text style={styles.accountGroupName}>{group.accountName}</Text>
              </View>
              <Text style={styles.accountGroupBalance}>
                Balance: {formatCurrency(group.accountBalance)}
              </Text>
            </View>

            {group.goals.map(goal => (
              <TapGestureHandler
                key={`tap-${goal.id}`}
                ref={doubleTapRef}
                numberOfTaps={2}
                onActivated={() => handleDoubleTap(goal)}>
                <View>
                  <TouchableOpacity
                    key={goal.id}
                    style={styles.accountGoalCard}
                    onPress={() => handleGoalPress(goal)}
                    onLongPress={() => showQuickActions(goal)}
                    delayLongPress={500}
                    activeOpacity={0.7}>
                    <View style={styles.accountGoalHeader}>
                      <View style={styles.accountGoalIcon}>
                        <Image
                          source={getGoalIconSource(goal.categoryId)}
                          style={styles.accountGoalImage}
                        />
                      </View>
                      <View style={styles.accountGoalInfo}>
                        <Text style={styles.accountGoalName}>{goal.name}</Text>
                        <Text style={styles.accountGoalProgress}>
                          {formatCurrency(goal.currentAmount)} /{' '}
                          {formatCurrency(goal.targetAmount)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.accountGoalStatus,
                          {backgroundColor: goal.color + '20'},
                        ]}>
                        <Text
                          style={[
                            styles.accountGoalStatusText,
                            {color: goal.color},
                          ]}>
                          {goal.progressPercentage.toFixed(0)}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.accountGoalBar}>
                      <View
                        style={[
                          styles.accountGoalFill,
                          {
                            width: `${goal.progressPercentage}%`,
                            backgroundColor: goal.color,
                          },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </TapGestureHandler>
            ))}
          </View>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title="Goals" showBack={true} onBackPress={handleBackPress} />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3F2B96']}
            tintColor="#3F2B96"
          />
        }>
        <LinearGradient
          colors={['#3F2B96', '#2A1B6D']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.totalProgressCard}>
          <View style={styles.totalProgressHeader}>
            <View style={styles.totalProgressLeft}>
              <View style={styles.totalProgressIcon}>
                <Icon name="trending-up" size={20} color="#3F2B96" />
              </View>
              <Text style={styles.totalProgressTitle}>Total Progress</Text>
            </View>
            <TouchableOpacity
              style={styles.addGoalButton}
              onPress={handleCreateGoal}>
              <View style={styles.addButtonCircle}>
                <Icon name="plus" size={18} color="#3F2B96" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.totalProgressAmounts}>
            <Text style={styles.totalCurrentAmount}>
              {formatCurrency(totalCurrent)}
            </Text>
            <Text style={styles.totalTargetAmount}>
              / {formatCurrency(totalTarget)}
            </Text>
          </View>

          <View style={styles.totalProgressBarContainer}>
            <View style={styles.totalProgressBarBg}>
              <View
                style={[
                  styles.totalProgressBarFill,
                  {width: `${totalProgress}%`},
                ]}
              />
            </View>
            <Text style={styles.totalProgressPercent}>
              {totalProgress.toFixed(1)}% Complete
            </Text>
          </View>

          <View style={styles.totalStats}>
            <View style={styles.totalStat}>
              <Text style={styles.totalStatLabel}>Active Goals</Text>
              <Text style={styles.totalStatValue}>
                {goals.filter(g => g.status === 'active').length}
              </Text>
            </View>
            <View style={styles.totalStatDivider} />
            <View style={styles.totalStat}>
              <Text style={styles.totalStatLabel}>Completed</Text>
              <Text style={styles.totalStatValue}>
                {goals.filter(g => g.isCompleted).length}
              </Text>
            </View>
            <View style={styles.totalStatDivider} />
            <View style={styles.totalStat}>
              <Text style={styles.totalStatLabel}>Total Saved</Text>
              <Text style={styles.totalStatValue}>
                {formatCurrency(totalCurrent)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'byGoal' && styles.activeTab]}
            onPress={() => setActiveTab('byGoal')}>
            <View
              style={[
                styles.tabIconContainer,
                {
                  backgroundColor:
                    activeTab === 'byGoal' ? '#E8F1FF' : '#F1F5F9',
                },
              ]}>
              <Icon
                name="target"
                size={18}
                color={activeTab === 'byGoal' ? '#3F2B96' : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.tabText,
                activeTab === 'byGoal' && styles.activeTabText,
              ]}>
              By Goal
            </Text>
            {activeTab === 'byGoal' && (
              <View
                style={[styles.tabIndicator, {backgroundColor: '#3F2B96'}]}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'byAccount' && styles.activeTab]}
            onPress={() => setActiveTab('byAccount')}>
            <View
              style={[
                styles.tabIconContainer,
                {
                  backgroundColor:
                    activeTab === 'byAccount' ? '#E8F1FF' : '#F1F5F9',
                },
              ]}>
              <Icon
                name="briefcase"
                size={18}
                color={activeTab === 'byAccount' ? '#3F2B96' : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.tabText,
                activeTab === 'byAccount' && styles.activeTabText,
              ]}>
              By Account
            </Text>
            {activeTab === 'byAccount' && (
              <View
                style={[styles.tabIndicator, {backgroundColor: '#3F2B96'}]}
              />
            )}
          </TouchableOpacity>
        </View>

        {activeTab === 'byGoal' ? renderByGoal() : renderByAccount()}

        {goals.length > 0 && (
          <TouchableOpacity
            style={styles.addNewGoalCard}
            onPress={handleCreateGoal}>
            <View style={styles.addNewGoalContent}>
              <Icon name="plus-circle" size={24} color="#3F2B96" />
              <Text style={styles.addNewGoalText}>Create Another Goal</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FAB Button - Only shows when there are no goals */}
      {goals.length === 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleCreateGoal}>
          <LinearGradient
            colors={['#3F2B96', '#2A1B6D']}
            style={styles.fabGradient}>
            <Icon name="plus" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Goal Details Modal */}
      <Modal
        visible={showGoalDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGoalDetails(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalHeaderButton}
                onPress={() => setShowGoalDetails(false)}>
                <Icon name="x" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Goal Details</Text>
              <TouchableOpacity
                style={styles.modalHeaderButton}
                onPress={() => setShowDeleteModal(true)}>
                <Icon name="trash-2" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>

            {selectedGoal && (
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContentWithPadding}>
                <View style={styles.modernGoalHeader}>
                  <LinearGradient
                    colors={[
                      selectedGoal.color + '20',
                      selectedGoal.color + '40',
                    ]}
                    style={styles.modernIconContainer}>
                    <Image
                      source={getGoalIconSource(selectedGoal.categoryId)}
                      style={styles.modernGoalImage}
                      resizeMode="contain"
                    />
                  </LinearGradient>
                  <View style={styles.modernTextContainer}>
                    <Text style={styles.modernGoalName}>
                      {selectedGoal.name}
                    </Text>
                    <View style={styles.modernCategoryBadge}>
                      <Text style={styles.modernCategoryText}>
                        {selectedGoal.categoryName || 'Custom Goal'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modernProgressContainer}>
                  <CircularProgress
                    percentage={selectedGoal.progressPercentage}
                    color={
                      selectedGoal.progressPercentage >= 100
                        ? '#34C759'
                        : selectedGoal.color
                    }
                    size={160}
                    strokeWidth={12}
                  />

                  {selectedGoal.progressPercentage >= 100 && (
                    <View style={styles.achievementBadge}>
                      <Icon name="check" size={16} color="#FFF" />
                    </View>
                  )}
                </View>

                <View style={styles.modernMetricsGrid}>
                  <LinearGradient
                    colors={['#F8FAFC', '#FFFFFF']}
                    style={styles.modernMetricCard}>
                    <Text style={styles.modernMetricLabel}>Current</Text>
                    <Text style={styles.modernMetricValue}>
                      {formatCurrency(selectedGoal.currentAmount)}
                    </Text>
                  </LinearGradient>

                  <LinearGradient
                    colors={['#F8FAFC', '#FFFFFF']}
                    style={styles.modernMetricCard}>
                    <Text style={styles.modernMetricLabel}>Target</Text>
                    <Text style={styles.modernMetricValue}>
                      {formatCurrency(selectedGoal.targetAmount)}
                    </Text>
                  </LinearGradient>

                  <LinearGradient
                    colors={['#F8FAFC', '#FFFFFF']}
                    style={styles.modernMetricCard}>
                    <Text style={styles.modernMetricLabel}>Remaining</Text>
                    <Text
                      style={[styles.modernMetricValue, {color: '#E56772'}]}>
                      {formatCurrency(selectedGoal.remainingAmount)}
                    </Text>
                  </LinearGradient>
                </View>

                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.modernDetailsCard}>
                  <View style={styles.modernDetailRow}>
                    <View style={styles.modernDetailIcon}>
                      <Icon name="calendar" size={16} color="#3F2B96" />
                    </View>
                    <View style={styles.modernDetailContent}>
                      <Text style={styles.modernDetailLabel}>Target Date</Text>
                      <Text style={styles.modernDetailValue}>
                        {selectedGoal.targetDate}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modernDetailRow}>
                    <View style={styles.modernDetailIcon}>
                      <Icon name="dollar-sign" size={16} color="#3F2B96" />
                    </View>
                    <View style={styles.modernDetailContent}>
                      <Text style={styles.modernDetailLabel}>
                        Monthly Savings
                      </Text>
                      <Text style={styles.modernDetailValue}>
                        {formatCurrency(selectedGoal.monthlyContribution)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modernDetailRow}>
                    <View style={styles.modernDetailIcon}>
                      <Icon name="credit-card" size={16} color="#3F2B96" />
                    </View>
                    <View style={styles.modernDetailContent}>
                      <Text style={styles.modernDetailLabel}>
                        Linked Account
                      </Text>
                      <Text style={styles.modernDetailValue}>
                        {selectedGoal.linkedAccountName || 'None'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modernDetailRow}>
                    <View style={styles.modernDetailIcon}>
                      <Icon name="activity" size={16} color="#3F2B96" />
                    </View>
                    <View style={styles.modernDetailContent}>
                      <Text style={styles.modernDetailLabel}>Status</Text>
                      <View
                        style={[
                          styles.modernStatusBadge,
                          {
                            backgroundColor:
                              selectedGoal.status === 'active'
                                ? '#34C75920'
                                : '#FF6B6B20',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.modernStatusText,
                            {
                              color:
                                selectedGoal.status === 'active'
                                  ? '#34C759'
                                  : '#FF6B6B',
                            },
                          ]}>
                          {selectedGoal.status === 'active'
                            ? 'Active'
                            : 'Paused'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>

                <LinearGradient
                  colors={['#3F2B96', '#2A1B6D']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.modernProjectionsCard}>
                  
                  <View style={styles.projectionHeader}>
                    <Text style={styles.modernProjectionsTitle}>Savings Forecast</Text>
                  </View>

                  <View style={styles.modernProjectionRow}>
                    <View style={styles.projectionLabelContainer}>
                      <Icon name="calendar" size={14} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.modernProjectionLabel}>Est. completion</Text>
                    </View>
                    <Text style={styles.modernProjectionValue}>
                      {selectedGoal.estimatedCompletionDate === 'Add monthly savings to estimate' 
                        ? 'Add monthly savings to see estimate' 
                        : selectedGoal.estimatedCompletionDate}
                    </Text>
                  </View>

                  {!selectedGoal.isCompleted && selectedGoal.remainingAmount > 0 && (
                    <>
                      <View style={styles.modernProjectionRow}>
                        <View style={styles.projectionLabelContainer}>
                          <Icon name="dollar-sign" size={14} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.modernProjectionLabel}>Monthly needed</Text>
                        </View>
                        <Text style={[
                          styles.modernProjectionValue,
                          selectedGoal.monthlyContribution >= selectedGoal.requiredMonthlyToMeetTarget 
                            ? styles.onTrackValue 
                            : styles.needsAdjustmentValue
                        ]}>
                          {formatCurrency(selectedGoal.requiredMonthlyToMeetTarget)}
                        </Text>
                      </View>

                      <View style={styles.modernProjectionRow}>
                        <View style={styles.projectionLabelContainer}>
                          <Icon name="clock" size={14} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.modernProjectionLabel}>Your monthly</Text>
                        </View>
                        <Text style={styles.modernProjectionValue}>
                          {formatCurrency(selectedGoal.monthlyContribution)}
                        </Text>
                      </View>
                    </>
                  )}

                  {selectedGoal.startDate && selectedGoal.targetDate && (
                    <View style={styles.timeProgressSection}>
                      <View style={styles.modernProjectionRow}>
                        <View style={styles.projectionLabelContainer}>
                          <Icon name="pie-chart" size={14} color="rgba(255,255,255,0.8)" />
                          <Text style={styles.modernProjectionLabel}>Time elapsed</Text>
                        </View>
                        <Text style={styles.modernProjectionValue}>
                          {!isNaN(selectedGoal.timeProgress) ? selectedGoal.timeProgress.toFixed(0) : '0'}%
                        </Text>
                      </View>
                      
                      <View style={styles.modernProgressBar}>
                        <View
                          style={[
                            styles.modernProgressFill,
                            {width: `${!isNaN(selectedGoal.timeProgress) ? selectedGoal.timeProgress : 0}%`},
                          ]}
                        />
                      </View>
                      
                      <View style={styles.timeDatesRow}>
                        <Text style={styles.timeDateText}>
                          Started: {new Date(selectedGoal.startDate).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}
                        </Text>
                        <Text style={styles.timeDateText}>
                          Target: {selectedGoal.targetDate}
                        </Text>
                      </View>
                    </View>
                  )}

                  {!selectedGoal.isCompleted && selectedGoal.remainingAmount > 0 && (
                    <View style={styles.statusMessageContainer}>
                      <Icon 
                        name={
                          selectedGoal.monthlyContribution >= selectedGoal.requiredMonthlyToMeetTarget
                            ? 'check-circle'
                            : 'info'
                        } 
                        size={16} 
                        color={
                          selectedGoal.monthlyContribution >= selectedGoal.requiredMonthlyToMeetTarget
                            ? '#4ADE80'
                            : '#FFB347'
                        } 
                      />
                      <Text style={[
                        styles.statusMessageText,
                        selectedGoal.monthlyContribution >= selectedGoal.requiredMonthlyToMeetTarget
                          ? styles.onTrackMessage
                          : styles.adjustmentNeededMessage
                      ]}>
                        {selectedGoal.monthlyContribution >= selectedGoal.requiredMonthlyToMeetTarget
                          ? "You're on track to meet your goal!"
                          : `Save ${formatCurrency(selectedGoal.requiredMonthlyToMeetTarget - selectedGoal.monthlyContribution)} more per month to stay on track`}
                      </Text>
                    </View>
                  )}

                  {selectedGoal.isCompleted && (
                    <View style={[styles.statusMessageContainer, styles.achievedContainer]}>
                      <Icon name="award" size={16} color="#FFD700" />
                      <Text style={styles.achievedMessage}>
                        🎉 Congratulations! You've achieved your goal!
                      </Text>
                    </View>
                  )}
                </LinearGradient>

                {selectedGoal.notes ? (
                  <View style={styles.notesCard}>
                    <Text style={styles.notesTitle}>Notes</Text>
                    <Text style={styles.notesText}>{selectedGoal.notes}</Text>
                  </View>
                ) : null}

                {selectedGoal.transactions &&
                  selectedGoal.transactions.length > 0 && (
                    <View style={styles.transactionsCard}>
                      <Text style={styles.transactionsTitle}>
                        Recent Activity
                      </Text>
                      {selectedGoal.transactions
                        .slice(0, 10)
                        .map((t) => (
                          <View key={t.id} style={styles.transactionRow}>
                            <View style={styles.transactionLeft}>
                              <View style={styles.transactionIconContainer}>
                                <Icon
                                  name={
                                    t.type === 'contribute'
                                      ? 'arrow-down'
                                      : 'arrow-up'
                                  }
                                  size={14}
                                  color={
                                    t.type === 'contribute'
                                      ? '#34C759'
                                      : '#FF6B6B'
                                  }
                                />
                              </View>
                              <View style={styles.transactionDetails}>
                                <View style={styles.transactionTypeRow}>
                                  <Text style={styles.transactionType}>
                                    {t.type === 'contribute' ? 'Contribution' : 'Withdrawal'}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.transactionAmount,
                                      {
                                        color:
                                          t.type === 'contribute'
                                            ? '#34C759'
                                            : '#FF6B6B',
                                      },
                                    ]}>
                                    {t.type === 'contribute' ? '+' : '-'}
                                    {formatCurrency(Math.abs(t.amount))}
                                  </Text>
                                </View>
                                <View style={styles.transactionMeta}>
                                  <View style={styles.transactionAccount}>
                                    <Icon name="credit-card" size={10} color="#94A3B8" />
                                    <Text style={styles.transactionAccountText}>
                                      {t.accountName || 'Unknown Account'}
                                    </Text>
                                  </View>
                                  <Text style={styles.transactionTime}>
                                    {formatTransactionDateTime(t.date)}
                                  </Text>
                                </View>
                                {t.note && (
                                  <Text style={styles.transactionNote}>{t.note}</Text>
                                )}
                              </View>
                            </View>
                          </View>
                        ))}
                    </View>
                  )}

                <View style={{height: 100}} />
              </ScrollView>
            )}

            {/* Fixed Bottom Action Buttons */}
            <View style={styles.fixedBottomButtons}>
              <View style={styles.fixedButtonsRow}>
                <TouchableOpacity
                  style={styles.fixedActionButton}
                  onPress={() => {
                    setShowGoalDetails(false);
                    setTimeout(() => {
                      setSelectedAccount(null);
                      setCurrentAction('contribute');
                      setShowContributeModal(true);
                    }, 300);
                  }}
                  activeOpacity={0.9}>
                  <LinearGradient
                    colors={['#34C759', '#2AB84C']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.fixedButtonGradient}>
                    <Icon name="plus-circle" size={18} color="#FFF" />
                    <Text style={styles.fixedButtonText}>Add</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fixedActionButton}
                  onPress={() => {
                    setShowGoalDetails(false);
                    setTimeout(() => {
                      setSelectedAccount(null);
                      setCurrentAction('withdraw');
                      setShowWithdrawModal(true);
                    }, 300);
                  }}
                  activeOpacity={0.9}>
                  <LinearGradient
                    colors={['#FF6B6B', '#EE5A5A']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.fixedButtonGradient}>
                    <Icon name="minus-circle" size={18} color="#FFF" />
                    <Text style={styles.fixedButtonText}>Withdraw</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fixedActionButton}
                  onPress={() => {
                    toggleGoalStatus();
                  }}
                  activeOpacity={0.9}>
                  <LinearGradient
                    colors={selectedGoal?.status === 'active' 
                      ? ['#FFB347', '#FF8C00'] 
                      : ['#34C759', '#2AB84C']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.fixedButtonGradient}>
                    <Icon
                      name={selectedGoal?.status === 'active' ? 'pause-circle' : 'play-circle'}
                      size={18}
                      color="#FFF"
                    />
                    <Text style={styles.fixedButtonText}>
                      {selectedGoal?.status === 'active' ? 'Pause' : 'Resume'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Contribute Modal with Account Selection */}
      <Modal
        visible={showContributeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowContributeModal(false);
          setSelectedAccount(null);
          setCurrentAction(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                setShowContributeModal(false);
                setSelectedAccount(null);
                setCurrentAction(null);
              }}>
                <Icon name="x" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add Money to Goal</Text>
              <View style={{width: 24}} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                <Text style={styles.modalGoalName}>{selectedGoal?.name}</Text>

                {/* Account Selection Button */}
                <TouchableOpacity
                  style={styles.accountSelectorButton}
                  onPress={() => setShowAccountSelector(true)}>
                  <LinearGradient
                    colors={selectedAccount ? ['#3F2B9620', '#2A1B6D20'] : ['#F8FAFC', '#F1F5F9']}
                    style={styles.accountSelectorGradient}>
                    <View style={styles.accountSelectorLeft}>
                      <View style={[
                        styles.accountSelectorIcon,
                        { backgroundColor: selectedAccount ? '#3F2B96' : '#E2E8F0' }
                      ]}>
                        <Icon 
                          name={selectedAccount ? getAccountIcon(selectedAccount.type) : 'credit-card'} 
                          size={16} 
                          color={selectedAccount ? '#FFF' : '#64748B'} 
                        />
                      </View>
                      <View>
                        <Text style={styles.accountSelectorLabel}>From Account</Text>
                        <Text style={styles.accountSelectorValue}>
                          {selectedAccount ? selectedAccount.name : 'Select an account'}
                        </Text>
                      </View>
                    </View>
                    <Icon name="chevron-down" size={20} color="#64748B" />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Amount Input */}
                <View style={styles.modalAmountContainer}>
                  <Text style={styles.modalCurrencySymbol}>$</Text>
                  <TextInput
                    style={styles.modalAmountInput}
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                    value={contributeAmount}
                    onChangeText={setContributeAmount}
                    autoFocus
                  />
                </View>

                {/* Quick Amount Buttons */}
                <View style={styles.quickAmountButtons}>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => setContributeAmount('50')}>
                    <Text style={styles.quickAmountText}>+$50</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => setContributeAmount('100')}>
                    <Text style={styles.quickAmountText}>+$100</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => setContributeAmount('200')}>
                    <Text style={styles.quickAmountText}>+$200</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => setContributeAmount('500')}>
                    <Text style={styles.quickAmountText}>+$500</Text>
                  </TouchableOpacity>
                </View>

                {/* Summary */}
                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Current Balance:</Text>
                    <Text style={styles.modalInfoValue}>
                      {formatCurrency(selectedGoal?.currentAmount || 0)}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>After Contribution:</Text>
                    <Text
                      style={[
                        styles.modalInfoValue,
                        {color: '#34C759', fontWeight: '700'},
                      ]}>
                      {formatCurrency(
                        (selectedGoal?.currentAmount || 0) +
                          (parseFloat(contributeAmount) || 0),
                      )}
                    </Text>
                  </View>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                  style={[styles.modalConfirmButton, !selectedAccount && styles.disabledButton]}
                  onPress={handleContribute}
                  disabled={!selectedAccount}>
                  <LinearGradient
                    colors={selectedAccount ? ['#34C759', '#2AB84C'] : ['#CBD5E1', '#94A3B8']}
                    style={styles.modalConfirmGradient}>
                    <Text style={styles.modalConfirmText}>Confirm Contribution</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal with Account Selection */}
      <Modal
        visible={showWithdrawModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowWithdrawModal(false);
          setSelectedAccount(null);
          setCurrentAction(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                setShowWithdrawModal(false);
                setSelectedAccount(null);
                setCurrentAction(null);
              }}>
                <Icon name="x" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Withdraw from Goal</Text>
              <View style={{width: 24}} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                <Text style={styles.modalGoalName}>{selectedGoal?.name}</Text>

                {/* Account Selection Button */}
                <TouchableOpacity
                  style={styles.accountSelectorButton}
                  onPress={() => setShowAccountSelector(true)}>
                  <LinearGradient
                    colors={selectedAccount ? ['#3F2B9620', '#2A1B6D20'] : ['#F8FAFC', '#F1F5F9']}
                    style={styles.accountSelectorGradient}>
                    <View style={styles.accountSelectorLeft}>
                      <View style={[
                        styles.accountSelectorIcon,
                        { backgroundColor: selectedAccount ? '#3F2B96' : '#E2E8F0' }
                      ]}>
                        <Icon 
                          name={selectedAccount ? getAccountIcon(selectedAccount.type) : 'credit-card'} 
                          size={16} 
                          color={selectedAccount ? '#FFF' : '#64748B'} 
                        />
                      </View>
                      <View>
                        <Text style={styles.accountSelectorLabel}>To Account</Text>
                        <Text style={styles.accountSelectorValue}>
                          {selectedAccount ? selectedAccount.name : 'Select an account'}
                        </Text>
                      </View>
                    </View>
                    <Icon name="chevron-down" size={20} color="#64748B" />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Amount Input */}
                <View style={styles.modalAmountContainer}>
                  <Text style={styles.modalCurrencySymbol}>$</Text>
                  <TextInput
                    style={styles.modalAmountInput}
                    placeholder="0.00"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    autoFocus
                  />
                </View>

                {/* Quick Amount Buttons */}
                <View style={styles.quickAmountButtons}>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => {
                      const amount = Math.min(50, selectedGoal?.currentAmount || 0);
                      setWithdrawAmount(amount.toString());
                    }}>
                    <Text style={styles.quickAmountText}>$50</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => {
                      const amount = Math.min(100, selectedGoal?.currentAmount || 0);
                      setWithdrawAmount(amount.toString());
                    }}>
                    <Text style={styles.quickAmountText}>$100</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => {
                      const amount = Math.min(200, selectedGoal?.currentAmount || 0);
                      setWithdrawAmount(amount.toString());
                    }}>
                    <Text style={styles.quickAmountText}>$200</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickAmountButton}
                    onPress={() => {
                      setWithdrawAmount(selectedGoal?.currentAmount?.toString() || '0');
                    }}>
                    <Text style={styles.quickAmountText}>Max</Text>
                  </TouchableOpacity>
                </View>

                {/* Summary */}
                <View style={styles.modalInfo}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Current Balance:</Text>
                    <Text style={styles.modalInfoValue}>
                      {formatCurrency(selectedGoal?.currentAmount || 0)}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>After Withdrawal:</Text>
                    <Text
                      style={[
                        styles.modalInfoValue,
                        {color: '#FF6B6B', fontWeight: '700'},
                      ]}>
                      {formatCurrency(
                        Math.max(
                          (selectedGoal?.currentAmount || 0) -
                            (parseFloat(withdrawAmount) || 0),
                          0,
                        ),
                      )}
                    </Text>
                  </View>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                  style={[styles.modalConfirmButton, !selectedAccount && styles.disabledButton]}
                  onPress={handleWithdraw}
                  disabled={!selectedAccount}>
                  <LinearGradient
                    colors={selectedAccount ? ['#FF6B6B', '#EE5A5A'] : ['#CBD5E1', '#94A3B8']}
                    style={styles.modalConfirmGradient}>
                    <Text style={styles.modalConfirmText}>Confirm Withdrawal</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Account Selector Modal */}
      {renderAccountSelector()}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.deleteModalNew]}>
            <View style={styles.deleteIconContainer}>
              <Icon name="alert-triangle" size={40} color="#FF6B6B" />
            </View>
            <Text style={styles.deleteTitleNew}>Delete Goal?</Text>
            <Text style={styles.deleteMessageNew}>
              Are you sure you want to delete "{selectedGoal?.name}"? This action cannot be undone.
            </Text>

            <View style={styles.deleteButtonsContainer}>
              <TouchableOpacity
                style={[styles.deleteButtonNew, styles.cancelDeleteNew]}
                onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelDeleteTextNew}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteButtonNew, styles.confirmDeleteNew]}
                onPress={() => deleteGoal(selectedGoal?.id)}>
                <LinearGradient
                  colors={['#FF6B6B', '#EE5A5A']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.confirmDeleteGradientNew}>
                  <Icon name="trash-2" size={18} color="#FFF" />
                  <Text style={styles.confirmDeleteTextNew}>Delete</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNav activeTab={bottomNavActive} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  totalProgressCard: {
    borderRadius: 14,
    margin: 16,
    marginTop: 10,
    padding: 16,
  },
  totalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalProgressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalProgressIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addGoalButton: {
    padding: 4,
  },
  addButtonCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalProgressAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  totalCurrentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  totalTargetAmount: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  totalProgressBarContainer: {
    marginBottom: 16,
  },
  totalProgressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  totalProgressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  totalProgressPercent: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  totalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  totalStat: {
    alignItems: 'center',
    flex: 1,
  },
  totalStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  totalStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  totalStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    position: 'relative',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#F8FAFC',
  },
  tabIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -4,
    left: 20,
    right: 20,
    height: 2,
    borderRadius: 1,
  },
  goalsList: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 20,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  goalImage: {
    width: '100%',
    height: '100%',
  },
  goalHeaderInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  goalStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  goalAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  goalAmountItem: {
    alignItems: 'center',
    flex: 1,
  },
  goalAmountLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  goalAmountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  goalProgressSection: {
    marginBottom: 12,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 6,
  },
  progressBarBg: {
    backgroundColor: '#F1F5F9',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  targetDate: {
    fontSize: 12,
    color: '#64748B',
  },
  monthlyContribution: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  monthlyContributionText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  timeProgress: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timeProgressText: {
    fontSize: 10,
    color: '#64748B',
  },
  accountGroup: {
    marginBottom: 20,
  },
  accountGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  accountGroupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountGroupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  accountGroupBalance: {
    fontSize: 14,
    color: '#64748B',
  },
  accountGoalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accountGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountGoalIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 10,
  },
  accountGoalImage: {
    width: 20,
    height: 20,
  },
  accountGoalInfo: {
    flex: 1,
  },
  accountGoalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  accountGoalProgress: {
    fontSize: 12,
    color: '#64748B',
  },
  accountGoalStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accountGoalStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  accountGoalBar: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  accountGoalFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyStateButton: {
    marginTop: 24,
    borderRadius: 30,
    overflow: 'hidden',
  },
  emptyStateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addNewGoalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  addNewGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  addNewGoalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3F2B96',
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
  bottomSpacer: {
    height: 90,
  },
  swipeDeleteAction: {
    width: 100,
    height: '90%',
    marginVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  swipeContributeAction: {
    width: 100,
    height: '90%',
    marginVertical: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  swipeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  swipeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    flex: 1,
  },
  scrollContentWithPadding: {
    paddingBottom: 20,
  },
  modernGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  modernIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modernGoalImage: {
    width: 55,
    height: 55,
  },
  modernTextContainer: {
    flex: 1,
  },
  modernGoalName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  modernCategoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  modernCategoryText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 24,
  },
  circleBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  circleInner: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 2,
  },
  percentageLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  modernProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  achievementBadge: {
    position: 'absolute',
    top: 10,
    right: 80,
    backgroundColor: '#34C759',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modernMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  modernMetricCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modernMetricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },
  modernMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modernDetailsCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modernDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modernDetailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modernDetailContent: {
    flex: 1,
  },
  modernDetailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  modernDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  modernStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  modernStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modernProjectionsCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#3F2B96',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modernProjectionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  modernProjectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modernProjectionLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  modernProjectionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modernProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  modernProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  projectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  projectionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeProgressSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statusMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  statusMessageText: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  onTrackMessage: {
    color: '#4ADE80',
  },
  adjustmentNeededMessage: {
    color: '#FFB347',
  },
  onTrackValue: {
    color: '#4ADE80',
  },
  needsAdjustmentValue: {
    color: '#FFB347',
  },
  achievedContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  achievedMessage: {
    flex: 1,
    fontSize: 13,
    color: '#FFD700',
    fontWeight: '600',
  },
  timeDatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  timeDateText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  notesCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  transactionsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  transactionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  transactionAccountText: {
    fontSize: 11,
    color: '#64748B',
  },
  transactionTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  transactionNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalBody: {
    paddingVertical: 20,
  },
  modalGoalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalCurrencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: '#0F172A',
    marginRight: 8,
  },
  modalAmountInput: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    minWidth: 150,
    padding: 0,
  },
  modalInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalInfoLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  modalInfoValue: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  fixedBottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  fixedButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  fixedActionButton: {
    flex: 1,
    borderRadius: 5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  fixedButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 4,
  },
  fixedButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  quickAmountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F2B96',
  },
  modalConfirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modalConfirmGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteModalNew: {
    alignItems: 'center',
    padding: 24,
    width: '100%',
    alignSelf: 'center',
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  deleteTitleNew: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteMessageNew: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  deleteButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'space-between',
  },
  deleteButtonNew: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cancelDeleteNew: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  confirmDeleteNew: {
    backgroundColor: 'transparent',
    shadowColor: '#FF6B6B',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmDeleteGradientNew: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  cancelDeleteTextNew: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: 0.3,
  },
  confirmDeleteTextNew: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  accountSelectorButton: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accountSelectorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accountSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountSelectorIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountSelectorLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  accountSelectorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  disabledButton: {
    opacity: 0.5,
  },
  accountSelectorModal: {
    maxHeight: '70%',
  },
  accountList: {
    paddingVertical: 20,
    gap: 12,
  },
  accountItem: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedAccountItem: {
    borderColor: '#3F2B96',
    borderWidth: 2,
  },
  accountItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  accountBalance: {
    fontSize: 12,
    color: '#64748B',
  },
});