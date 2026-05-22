// src/screens/CreateGoalStep2Screen.js
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  Alert,
  SafeAreaView,
  Animated,
} from "react-native";
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from "@react-navigation/native";
import LinearGradient from 'react-native-linear-gradient';

export default function CreateGoalStep2Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { category, selectedGoal } = route.params;
  
  // Goal Details State
  const [targetName, setTargetName] = useState(category?.title || "New Goal");
  const [targetAmount, setTargetAmount] = useState("");
  const [monthlySavings, setMonthlySavings] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [notes, setNotes] = useState("");
  
  // Target Type State
  const [targetType, setTargetType] = useState("set"); // "set" or "flexible"
  
  // Date Pickers State
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  
  // Calculated monthly amount
  const [calculatedMonthly, setCalculatedMonthly] = useState(null);
  
  // Modal States
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGoalCreatedModal, setShowGoalCreatedModal] = useState(false);
  
  // New Account Form State
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const [newAccountType, setNewAccountType] = useState("savings");
  
  // Contribute State
  const [contributeAmount, setContributeAmount] = useState("");
  const [contributeNote, setContributeNote] = useState("");
  
  // Animation for success modal
  const [scaleValue] = useState(new Animated.Value(0));
  
  // Initial bank accounts
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, name: "Primary Savings", bank: "Chase", balance: 4500, type: "savings", accountNumber: "•••• 4567", color: "#4A90E2" },
    { id: 2, name: "Investment Account", bank: "Vanguard", balance: 12500, type: "investment", accountNumber: "•••• 8901", color: "#34C759" },
    { id: 3, name: "Emergency Fund", bank: "Wells Fargo", balance: 10000, type: "savings", accountNumber: "•••• 2345", color: "#FF6B6B" },
    { id: 4, name: "Main Checking", bank: "Bank of America", balance: 3200, type: "checking", accountNumber: "•••• 6789", color: "#FFB347" },
  ]);

  // Animation for success modal
  const animateSuccessModal = (show) => {
    if (show) {
      setShowSuccessModal(true);
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(scaleValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setShowSuccessModal(false));
        }, 2000);
      });
    }
  };

  // Get account icon based on type
  const getAccountIcon = (type) => {
    switch(type) {
      case 'checking': return 'credit-card';
      case 'savings': return 'trending-up';
      case 'investment': return 'pie-chart';
      default: return 'circle';
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatCurrencyInput = (value) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    return cleanValue;
  };

  const handleTargetAmountChange = (text) => {
    const formatted = formatCurrencyInput(text);
    setTargetAmount(formatted);
    calculateMonthlyFromDate(formatted, startDate, targetDate);
  };

  const handleMonthlySavingsChange = (text) => {
    const formatted = formatCurrencyInput(text);
    setMonthlySavings(formatted);
  };

  const handleStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
    
    if (targetType === "set" && targetDate < currentDate) {
      const newTargetDate = new Date(currentDate);
      newTargetDate.setMonth(newTargetDate.getMonth() + 1);
      setTargetDate(newTargetDate);
    }
    
    if (targetType === "set") {
      calculateMonthlyFromDate(targetAmount, currentDate, targetDate);
    }
  };

  const handleTargetDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || targetDate;
    setShowTargetDatePicker(Platform.OS === 'ios');
    
    if (currentDate >= startDate) {
      setTargetDate(currentDate);
      calculateMonthlyFromDate(targetAmount, startDate, currentDate);
    } else {
      Alert.alert("Invalid Date", "Target date must be after start date");
    }
  };

  const showStartDatepicker = () => {
    setShowStartDatePicker(true);
  };

  const showTargetDatepicker = () => {
    setShowTargetDatePicker(true);
  };

  const calculateMonthlyFromDate = (amount, start, target) => {
    if (!amount || parseFloat(amount) <= 0) return;
    const targetAmountNum = parseFloat(amount) || 0;
    const monthsRemaining = (target.getFullYear() - start.getFullYear()) * 12 + 
                           (target.getMonth() - start.getMonth());
    if (monthsRemaining <= 0) {
      setCalculatedMonthly(targetAmountNum);
    } else {
      const monthly = targetAmountNum / monthsRemaining;
      setCalculatedMonthly(monthly);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const calculateDuration = () => {
    const months = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (targetDate.getMonth() - startDate.getMonth());
    const weeks = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24 * 7));
    const days = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));
    
    if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''}`;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const getEstimatedCompletionDate = () => {
    if (!targetAmount || !monthlySavings) return null;
    
    const targetAmountNum = parseFloat(targetAmount) || 0;
    const monthlyNum = parseFloat(monthlySavings) || 0;
    
    if (monthlyNum <= 0) return null;
    
    const monthsNeeded = Math.ceil(targetAmountNum / monthlyNum);
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + monthsNeeded);
    
    return formatMonthYear(date);
  };

  const handleAddAccount = () => {
    if (!newAccountName.trim() || !newAccountBalance) {
      Alert.alert("Error", "Please enter account name and balance");
      return;
    }

    const balanceNum = parseFloat(newAccountBalance) || 0;
    const newAccount = {
      id: Date.now(),
      name: newAccountName,
      bank: "Custom Bank",
      balance: balanceNum,
      type: newAccountType,
      accountNumber: "•••• NEW",
      color: getRandomColor(),
    };

    setBankAccounts([...bankAccounts, newAccount]);
    setSelectedAccount(newAccount);
    resetNewAccountForm();
    setShowAddAccountModal(false);
    setShowAccountSelector(false);
    
    animateSuccessModal(true);
  };

  const getRandomColor = () => {
    const colors = ['#4A90E2', '#34C759', '#FF6B6B', '#FFB347', '#9B59B6', '#3498DB'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const resetNewAccountForm = () => {
    setNewAccountName("");
    setNewAccountBalance("");
    setNewAccountType("savings");
  };

  const handleCreateGoal = () => {
    if (!targetName.trim()) {
      Alert.alert("Required", "Please enter a goal name");
      return;
    }
    
    if (!targetAmount) {
      Alert.alert("Required", "Please enter target amount");
      return;
    }
    
    if (targetType === "set" && !calculatedMonthly) {
      Alert.alert("Required", "Please check your dates");
      return;
    }
    
    if (targetType === "flexible" && !monthlySavings) {
      Alert.alert("Required", "Please enter monthly savings amount");
      return;
    }
    
    if (!selectedAccount) {
      Alert.alert("Required", "Please select an account");
      return;
    }

    const targetAmountNum = parseFloat(targetAmount) || 0;
    const monthlySavingsNum = targetType === "set" 
      ? (calculatedMonthly || 0) 
      : (parseFloat(monthlySavings) || 0);

    const duration = targetType === "set" ? calculateDuration() : "Flexible";
    
    const newGoal = {
      id: Date.now(),
      name: targetName,
      title: targetName,
      targetAmount: targetAmountNum,
      targetGoal: targetAmountNum,
      currentAmount: 0,
      currentSavings: 0,
      startDate: startDate.toISOString(),
      targetDate: targetType === "set" ? formatDate(targetDate) : "Flexible",
      createdAt: new Date().toISOString(),
      duration: duration,
      targetType: targetType,
      linkedAccountId: selectedAccount.id,
      linkedAccountName: selectedAccount.name,
      linkedAccountBalance: selectedAccount.balance,
      accountId: selectedAccount.id,
      accountName: selectedAccount.name,
      accountBalance: selectedAccount.balance,
      status: "active",
      categoryId: selectedGoal || category?.id || 6,
      categoryName: category?.title || "Custom",
      monthlyContribution: monthlySavingsNum,
      monthlySavings: monthlySavingsNum,
      notes: notes || "",
      color: category?.color || "#4A90E2",
      transactions: [],
      spentAmount: 0,
      stillToSave: targetAmountNum,
      progress: 0,
      icon: null,
      availableAccounts: bankAccounts,
    };

    setShowGoalCreatedModal(true);
    setTimeout(() => {
      setShowGoalCreatedModal(false);
      navigation.navigate("Goals", { newGoal: newGoal });
    }, 2000);
  };

  const handleContributePress = () => {
    setContributeAmount("");
    setContributeNote("");
    setShowContributeModal(true);
  };

  const handleContribute = () => {
    if (!contributeAmount || parseFloat(contributeAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    const amount = parseFloat(contributeAmount);
    
    if (amount > (selectedAccount?.balance || 0)) {
      Alert.alert("Error", `Insufficient funds. You only have $${selectedAccount?.balance.toLocaleString()} in this account.`);
      return;
    }

    // Update account balance
    const updatedAccounts = bankAccounts.map(acc => {
      if (acc.id === selectedAccount.id) {
        return {
          ...acc,
          balance: acc.balance - amount
        };
      }
      return acc;
    });

    setBankAccounts(updatedAccounts);
    
    const updatedAccount = updatedAccounts.find(acc => acc.id === selectedAccount.id);
    setSelectedAccount(updatedAccount);

    setShowContributeModal(false);
    animateSuccessModal(true);
  };

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
              <Icon name="x" size={24} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Account</Text>
            <View style={{width: 24}} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.accountList}>
              {bankAccounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.accountItem}
                  onPress={() => {
                    setSelectedAccount(account);
                    setShowAccountSelector(false);
                  }}>
                  <LinearGradient
                    colors={selectedAccount?.id === account.id 
                      ? ['#3F2B9610', '#2A1B6D10']
                      : ['#FFFFFF', '#F8FAFC']}
                    style={styles.accountItemGradient}>
                    <View style={styles.accountItemLeft}>
                      <View style={[styles.accountIcon, { backgroundColor: account.color + '20' }]}>
                        <Icon 
                          name={getAccountIcon(account.type)} 
                          size={20} 
                          color={account.color} 
                        />
                      </View>
                      <View style={styles.accountInfo}>
                        <Text style={styles.accountName}>{account.name}</Text>
                        <Text style={styles.accountBank}>{account.bank} • {account.accountNumber}</Text>
                        <Text style={[styles.accountBalance, { color: account.color }]}>
                          ${account.balance.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    {selectedAccount?.id === account.id && (
                      <View style={[styles.selectedCheck, { backgroundColor: account.color }]}>
                        <Icon name="check" size={16} color="#FFF" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.addAccountSelectorButton}
                onPress={() => {
                  setShowAccountSelector(false);
                  setShowAddAccountModal(true);
                }}>
                <LinearGradient
                  colors={['#F8FAFC', '#F1F5F9']}
                  style={styles.addAccountSelectorGradient}>
                  <View style={styles.addAccountSelectorLeft}>
                    <View style={styles.addAccountSelectorIcon}>
                      <Icon name="plus" size={20} color="#0A84FF" />
                    </View>
                    <View>
                      <Text style={styles.addAccountSelectorText}>Add New Account</Text>
                      <Text style={styles.addAccountSelectorSubtext}>Link another account to your goals</Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={20} color="#64748B" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderContributeModal = () => (
    <Modal
      visible={showContributeModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowContributeModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.transactionModal]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowContributeModal(false)}>
              <Icon name="x" size={24} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Money to Goal</Text>
            <View style={{width: 24}} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.transactionModalBody}>
              {/* Account Info */}
              <View style={styles.transactionAccountCard}>
                <View style={[styles.transactionAccountIcon, { backgroundColor: selectedAccount?.color + '20' }]}>
                  <Icon name={getAccountIcon(selectedAccount?.type)} size={24} color={selectedAccount?.color} />
                </View>
                <View style={styles.transactionAccountInfo}>
                  <Text style={styles.transactionAccountName}>{selectedAccount?.name}</Text>
                  <Text style={styles.transactionAccountDetail}>
                    {selectedAccount?.bank} • {selectedAccount?.accountNumber}
                  </Text>
                  <Text style={[styles.transactionAccountBalance, { color: selectedAccount?.color }]}>
                    Available: ${selectedAccount?.balance.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Amount Input */}
              <View style={styles.transactionAmountContainer}>
                <Text style={styles.transactionCurrencySymbol}>$</Text>
                <TextInput
                  style={styles.transactionAmountInput}
                  placeholder="0.00"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="decimal-pad"
                  value={contributeAmount}
                  onChangeText={setContributeAmount}
                  autoFocus
                />
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmountGrid}>
                {[10, 25, 50, 100, 250, 500].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickAmountButton}
                    onPress={() => setContributeAmount(amount.toString())}>
                    <Text style={styles.quickAmountText}>${amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Note Input */}
              <View style={styles.transactionNoteContainer}>
                <Text style={styles.transactionNoteLabel}>Note (Optional)</Text>
                <TextInput
                  style={styles.transactionNoteInput}
                  placeholder="Add a note for this contribution"
                  placeholderTextColor="#94A3B8"
                  value={contributeNote}
                  onChangeText={setContributeNote}
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Summary */}
              <View style={styles.transactionSummary}>
                <View style={styles.transactionSummaryRow}>
                  <Text style={styles.transactionSummaryLabel}>From Account</Text>
                  <Text style={styles.transactionSummaryValue}>{selectedAccount?.name}</Text>
                </View>
                <View style={styles.transactionSummaryRow}>
                  <Text style={styles.transactionSummaryLabel}>Contribution Amount</Text>
                  <Text style={[styles.transactionSummaryValue, { color: '#34C759', fontWeight: '700' }]}>
                    ${contributeAmount ? parseFloat(contributeAmount).toFixed(2) : '0.00'}
                  </Text>
                </View>
                <View style={styles.transactionSummaryRow}>
                  <Text style={styles.transactionSummaryLabel}>New Account Balance</Text>
                  <Text style={styles.transactionSummaryValue}>
                    ${((selectedAccount?.balance || 0) - (parseFloat(contributeAmount) || 0)).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[styles.transactionConfirmButton, !contributeAmount && styles.transactionConfirmButtonDisabled]}
                onPress={handleContribute}
                disabled={!contributeAmount}>
                <LinearGradient
                  colors={!contributeAmount ? ['#CBD5E1', '#94A3B8'] : ['#34C759', '#2AB84C']}
                  style={styles.transactionConfirmGradient}>
                  <Text style={styles.transactionConfirmText}>Confirm Contribution</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSuccessModal(false)}>
      <View style={styles.successModalOverlay}>
        <Animated.View style={[styles.successModalContent, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.successIconContainer}>
            <Icon name="check-circle" size={60} color="#34C759" />
          </View>
          <Text style={styles.successTitle}>Success!</Text>
          <Text style={styles.successMessage}>
            ${contributeAmount} added to your goal from {selectedAccount?.name}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderGoalCreatedModal = () => (
    <Modal
      visible={showGoalCreatedModal}
      transparent={true}
      animationType="fade">
      <View style={styles.successModalOverlay}>
        <View style={styles.goalCreatedModal}>
          <LinearGradient
            colors={['#3F2B96', '#2A1B6D']}
            style={styles.goalCreatedGradient}>
            <View style={styles.goalCreatedIcon}>
              <Icon name="check-circle" size={50} color="#FFF" />
            </View>
            <Text style={styles.goalCreatedTitle}>Goal Created!</Text>
            <Text style={styles.goalCreatedMessage}>
              Your goal "{targetName}" has been created successfully
            </Text>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3F2B96', '#2A1B6D']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Goal</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, styles.progressCircleCompleted]}>
              <Icon name="check" size={12} color="#FFFFFF" />
            </View>
            <Text style={styles.progressText}>Category</Text>
          </View>
          <View style={[styles.progressLine, styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, styles.progressCircleActive]}>
              <Text style={styles.progressCircleText}>2</Text>
            </View>
            <Text style={[styles.progressText, styles.progressTextActive]}>Details</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressCircleText}>3</Text>
            </View>
            <Text style={styles.progressText}>Review</Text>
          </View>
        </View>

        {/* Target Name Input */}
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Goal Name</Text>
          <View style={styles.inputContainer}>
            <Icon name="edit-2" size={18} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your goal name"
              placeholderTextColor="#94A3B8"
              value={targetName}
              onChangeText={setTargetName}
            />
          </View>
        </View>

        {/* Target Amount */}
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Target Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              value={targetAmount}
              onChangeText={handleTargetAmountChange}
            />
          </View>
        </View>

        {/* Target Type Selection */}
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Goal Timeline</Text>
          <View style={styles.targetTypeCards}>
            <TouchableOpacity
              style={[
                styles.targetTypeCard,
                targetType === "set" && styles.targetTypeCardSelected,
              ]}
              onPress={() => setTargetType("set")}>
              <View style={[
                styles.targetTypeIcon,
                { backgroundColor: targetType === "set" ? '#3F2B9620' : '#F1F5F9' }
              ]}>
                <Icon 
                  name="calendar" 
                  size={20} 
                  color={targetType === "set" ? '#3F2B96' : '#64748B'} 
                />
              </View>
              <View style={styles.targetTypeContent}>
                <Text style={[
                  styles.targetTypeCardTitle,
                  targetType === "set" && styles.targetTypeCardTitleSelected
                ]}>Set Date</Text>
                <Text style={styles.targetTypeCardDesc}>
                  Target a specific completion date
                </Text>
              </View>
              {targetType === "set" && (
                <View style={styles.targetTypeCheck}>
                  <Icon name="check-circle" size={20} color="#3F2B96" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.targetTypeCard,
                targetType === "flexible" && styles.targetTypeCardSelected,
              ]}
              onPress={() => setTargetType("flexible")}>
              <View style={[
                styles.targetTypeIcon,
                { backgroundColor: targetType === "flexible" ? '#3F2B9620' : '#F1F5F9' }
              ]}>
                <Icon 
                  name="clock" 
                  size={20} 
                  color={targetType === "flexible" ? '#3F2B96' : '#64748B'} 
                />
              </View>
              <View style={styles.targetTypeContent}>
                <Text style={[
                  styles.targetTypeCardTitle,
                  targetType === "flexible" && styles.targetTypeCardTitleSelected
                ]}>Flexible</Text>
                <Text style={styles.targetTypeCardDesc}>
                  Save at your own pace with monthly contributions
                </Text>
              </View>
              {targetType === "flexible" && (
                <View style={styles.targetTypeCheck}>
                  <Icon name="check-circle" size={20} color="#3F2B96" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Start Date - Always Show */}
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Start Date</Text>
          <TouchableOpacity 
            style={styles.datePicker}
            onPress={showStartDatepicker}>
            <View style={styles.datePickerLeft}>
              <View style={styles.dateIconContainer}>
                <Icon name="play" size={16} color="#3F2B96" />
              </View>
              <View>
                <Text style={styles.dateLabel}>When you start saving</Text>
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              </View>
            </View>
            <Icon name="chevron-down" size={20} color="#64748B" />
          </TouchableOpacity>
          
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={handleStartDateChange}
            />
          )}
        </View>

        {/* Conditional Fields based on Target Type */}
        {targetType === "set" ? (
          // SET MODE - Show Target Date and Calculated Monthly
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Target Date</Text>
            <TouchableOpacity 
              style={styles.datePicker}
              onPress={showTargetDatepicker}>
              <View style={styles.datePickerLeft}>
                <View style={styles.dateIconContainer}>
                  <Icon name="target" size={16} color="#FF6B6B" />
                </View>
                <View>
                  <Text style={styles.dateLabel}>When you want to reach your goal</Text>
                  <Text style={styles.dateText}>{formatDate(targetDate)}</Text>
                </View>
              </View>
              <Icon name="chevron-down" size={20} color="#64748B" />
            </TouchableOpacity>
            
            {showTargetDatePicker && (
              <DateTimePicker
                value={targetDate}
                mode="date"
                display="default"
                onChange={handleTargetDateChange}
                minimumDate={startDate}
              />
            )}

            {/* Duration & Calculation */}
            {targetAmount && calculatedMonthly && (
              <View style={styles.calculationCard}>
                <View style={styles.durationBadge}>
                  <Icon name="clock" size={14} color="#64748B" />
                  <Text style={styles.durationText}>{calculateDuration()}</Text>
                </View>
                
                <View style={styles.monthlyCalculation}>
                  <Text style={styles.monthlyLabel}>Required Monthly Savings</Text>
                  <Text style={styles.monthlyAmount}>${calculatedMonthly.toFixed(2)}</Text>
                </View>

                <View style={styles.calculationNote}>
                  <Icon name="info" size={14} color="#64748B" />
                  <Text style={styles.calculationNoteText}>
                    Save this amount each month to reach your goal by {formatMonthYear(targetDate)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          // FLEXIBLE MODE - Show Monthly Savings Input and Estimation
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Monthly Savings</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="How much can you save each month?"
                placeholderTextColor="#94A3B8"
                keyboardType="decimal-pad"
                value={monthlySavings}
                onChangeText={handleMonthlySavingsChange}
              />
            </View>

            {targetAmount && monthlySavings && (
              <View style={styles.estimationCard}>
                <Icon name="clock" size={20} color="#3F2B96" />
                <View style={styles.estimationContent}>
                  <Text style={styles.estimationLabel}>Estimated Completion</Text>
                  <Text style={styles.estimationDate}>
                    {getEstimatedCompletionDate() || 'Add amount to calculate'}
                  </Text>
                  <Text style={styles.estimationNote}>
                    Based on saving ${formatCurrency(monthlySavings)} monthly starting {formatMonthYear(startDate)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Account Selection */}
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Linked Account</Text>
          
          {selectedAccount ? (
            <View style={styles.selectedAccountCard}>
              <LinearGradient
                colors={[selectedAccount.color + '10', selectedAccount.color + '20']}
                style={styles.selectedAccountGradient}>
                <View style={styles.selectedAccountLeft}>
                  <View style={[styles.selectedAccountIcon, { backgroundColor: selectedAccount.color + '20' }]}>
                    <Icon name={getAccountIcon(selectedAccount.type)} size={24} color={selectedAccount.color} />
                  </View>
                  <View style={styles.selectedAccountInfo}>
                    <Text style={styles.selectedAccountName}>{selectedAccount.name}</Text>
                    <Text style={styles.selectedAccountDetail}>
                      {selectedAccount.bank} • {selectedAccount.accountNumber}
                    </Text>
                    <Text style={[styles.selectedAccountBalance, { color: selectedAccount.color }]}>
                      ${selectedAccount.balance.toLocaleString()}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.changeAccountButton}
                  onPress={() => setShowAccountSelector(true)}>
                  <Text style={styles.changeAccountText}>Change</Text>
                </TouchableOpacity>
              </LinearGradient>

              {/* Contribute Button */}
              <TouchableOpacity 
                style={styles.contributeButton}
                onPress={handleContributePress}>
                <LinearGradient
                  colors={['#34C759', '#2AB84C']}
                  style={styles.contributeButtonGradient}>
                  <Icon name="arrow-down" size={20} color="#FFFFFF" />
                  <Text style={styles.contributeButtonText}>Add Money to Goal</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectAccountButton}
              onPress={() => setShowAccountSelector(true)}>
              <LinearGradient
                colors={['#F8FAFC', '#F1F5F9']}
                style={styles.selectAccountGradient}>
                <View style={styles.selectAccountLeft}>
                  <View style={styles.selectAccountIcon}>
                    <Icon name="credit-card" size={20} color="#3F2B96" />
                  </View>
                  <View>
                    <Text style={styles.selectAccountText}>Select an account</Text>
                    <Text style={styles.selectAccountSubtext}>Choose where to save your money</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color="#64748B" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Notes */}
        <View style={styles.formCard}>
          <Text style={styles.formLabel}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes or reminders about your goal"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity 
          style={[
            styles.createButton,
            (!targetName.trim() || !targetAmount || 
             (targetType === "set" ? !calculatedMonthly : !monthlySavings) || 
             !selectedAccount) && styles.createButtonDisabled
          ]}
          onPress={handleCreateGoal}
          disabled={
            !targetName.trim() || 
            !targetAmount || 
            (targetType === "set" ? !calculatedMonthly : !monthlySavings) || 
            !selectedAccount
          }>
          <LinearGradient
            colors={['#3F2B96', '#2A1B6D']}
            style={styles.createButtonGradient}>
            <Text style={styles.createButtonText}>Create Goal</Text>
            <Icon name="arrow-right" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      {renderAccountSelector()}
      {renderContributeModal()}
      {renderSuccessModal()}
      {renderGoalCreatedModal()}

      {/* Add Account Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddAccountModal}
        onRequestClose={() => {
          setShowAddAccountModal(false);
          resetNewAccountForm();
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Account</Text>
              <TouchableOpacity onPress={() => {
                setShowAddAccountModal(false);
                resetNewAccountForm();
              }}>
                <Icon name="x" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.addAccountForm}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Account Name</Text>
                  <View style={styles.inputContainer}>
                    <Icon name="briefcase" size={18} color="#64748B" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., High-Yield Savings"
                      placeholderTextColor="#94A3B8"
                      value={newAccountName}
                      onChangeText={setNewAccountName}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Current Balance</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      placeholderTextColor="#94A3B8"
                      keyboardType="decimal-pad"
                      value={newAccountBalance}
                      onChangeText={setNewAccountBalance}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Account Type</Text>
                  <View style={styles.accountTypeGrid}>
                    {[
                      { type: 'checking', label: 'Checking', icon: 'credit-card' },
                      { type: 'savings', label: 'Savings', icon: 'trending-up' },
                      { type: 'investment', label: 'Investment', icon: 'pie-chart' },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.type}
                        style={[
                          styles.accountTypeItem,
                          newAccountType === item.type && styles.accountTypeItemSelected,
                        ]}
                        onPress={() => setNewAccountType(item.type)}>
                        <View style={[
                          styles.accountTypeIcon,
                          { backgroundColor: newAccountType === item.type ? '#3F2B96' : '#F1F5F9' }
                        ]}>
                          <Icon 
                            name={item.icon} 
                            size={20} 
                            color={newAccountType === item.type ? '#FFFFFF' : '#64748B'} 
                          />
                        </View>
                        <Text style={[
                          styles.accountTypeLabel,
                          newAccountType === item.type && styles.accountTypeLabelSelected
                        ]}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setShowAddAccountModal(false);
                      resetNewAccountForm();
                    }}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleAddAccount}>
                    <LinearGradient
                      colors={['#3F2B96', '#2A1B6D']}
                      style={styles.saveButtonGradient}>
                      <Text style={styles.saveButtonText}>Add Account</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressCircleActive: {
    backgroundColor: '#3F2B96',
  },
  progressCircleCompleted: {
    backgroundColor: '#34C759',
  },
  progressCircleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  progressText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  progressTextActive: {
    color: '#3F2B96',
    fontWeight: '600',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#3F2B96',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 12,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    paddingVertical: 12,
  },
  targetTypeCards: {
    gap: 8,
  },
  targetTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  targetTypeCardSelected: {
    borderColor: '#3F2B96',
    backgroundColor: '#FFFFFF',
  },
  targetTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  targetTypeContent: {
    flex: 1,
  },
  targetTypeCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  targetTypeCardTitleSelected: {
    color: '#3F2B96',
  },
  targetTypeCardDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  targetTypeCheck: {
    marginLeft: 8,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  datePickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  calculationCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  durationText: {
    fontSize: 13,
    color: '#64748B',
  },
  monthlyCalculation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthlyLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  monthlyAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3F2B96',
  },
  calculationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  calculationNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  estimationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 12,
  },
  estimationContent: {
    flex: 1,
  },
  estimationLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  estimationDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3F2B96',
    marginBottom: 4,
  },
  estimationNote: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 14,
  },
  selectedAccountCard: {
    gap: 12,
  },
  selectedAccountGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
  },
  selectedAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedAccountIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedAccountInfo: {
    flex: 1,
  },
  selectedAccountName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  selectedAccountDetail: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  selectedAccountBalance: {
    fontSize: 14,
    fontWeight: '600',
  },
  changeAccountButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  changeAccountText: {
    fontSize: 12,
    color: '#3F2B96',
    fontWeight: '500',
  },
  contributeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  contributeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  contributeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectAccountButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  selectAccountGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  selectAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectAccountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectAccountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  selectAccountSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  createButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3F2B96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  accountSelectorModal: {
    maxHeight: '80%',
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
  accountItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  accountBank: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAccountSelectorButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3F2B96',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addAccountSelectorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  addAccountSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addAccountSelectorIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAccountSelectorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3F2B96',
  },
  addAccountSelectorSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  transactionModal: {
    maxHeight: '80%',
  },
  transactionModalBody: {
    paddingVertical: 20,
  },
  transactionAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  transactionAccountIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionAccountInfo: {
    flex: 1,
  },
  transactionAccountName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  transactionAccountDetail: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  transactionAccountBalance: {
    fontSize: 13,
    fontWeight: '500',
  },
  transactionAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  transactionCurrencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 8,
  },
  transactionAmountInput: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    minWidth: 150,
    padding: 0,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  quickAmountButton: {
    width: '31%',
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3F2B96',
  },
  transactionNoteContainer: {
    marginBottom: 20,
  },
  transactionNoteLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  transactionNoteInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  transactionSummary: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  transactionSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  transactionSummaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  transactionSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  transactionConfirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  transactionConfirmButtonDisabled: {
    opacity: 0.5,
  },
  transactionConfirmGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  transactionConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  goalCreatedModal: {
    width: '80%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  goalCreatedGradient: {
    padding: 32,
    alignItems: 'center',
  },
  goalCreatedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalCreatedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  goalCreatedMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  addAccountForm: {
    gap: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  accountTypeGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  accountTypeItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accountTypeItemSelected: {
    borderColor: '#3F2B96',
    backgroundColor: '#FFFFFF',
  },
  accountTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountTypeLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  accountTypeLabelSelected: {
    color: '#3F2B96',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});