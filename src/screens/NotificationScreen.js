// src/screens/NotificationScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [masterToggle, setMasterToggle] = useState(true);
  
  // Category toggles state
  const [categoryToggles, setCategoryToggles] = useState({
    spending: true,
    income: true,
    bills: true,
    bank: true,
    goals: true,
  });

  // Individual notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    availableToSpendLow: { push: true, email: false, sms: false },
    largeTransaction: { push: false, email: false, sms: false },
    plannedExpense: { push: false, email: false, sms: false },
    spendingUpdate: { push: true, email: false, sms: false },
    watchlistOverTarget: { push: false, email: false, sms: false },
    uncategorizedTransactions: { push: false, email: false, sms: false },
    incomeReceived: { push: false, email: false, sms: false },
    largeDeposit: { push: true, email: false, sms: false },
    extraPaycheckMonth: { push: false, email: false, sms: false },
    billPaid: { push: false, email: false, sms: false },
    billsToIncomePercentage: { push: false, email: false, sms: false },
    upcomingBills: { push: false, email: false, sms: false },
    refundStatus: { push: false, email: false, sms: false },
    lowBankBalance: { push: true, email: false, sms: false },
    projectedLowBalance: { push: false, email: false, sms: false },
    bankFee: { push: true, email: false, sms: false },
    goalContribution: { push: false, email: false, sms: false },
  });

  // Map categories to their notification keys for quick lookup
  const categoryMap = {
    spending: ['availableToSpendLow', 'largeTransaction', 'plannedExpense', 'spendingUpdate', 'watchlistOverTarget', 'uncategorizedTransactions'],
    income: ['incomeReceived', 'largeDeposit', 'extraPaycheckMonth'],
    bills: ['billPaid', 'billsToIncomePercentage', 'upcomingBills', 'refundStatus'],
    bank: ['lowBankBalance', 'projectedLowBalance', 'bankFee'],
    goals: ['goalContribution'],
  };

  // Toggle master switch - instant
  const toggleMasterSwitch = useCallback(() => {
    setMasterToggle(prev => !prev);
  }, []);

  // Toggle category and all its notifications - instant
  const toggleCategory = useCallback((category) => {
    if (!masterToggle) return;
    
    // Update category toggle immediately
    setCategoryToggles(prev => {
      const newState = !prev[category];
      return {
        ...prev,
        [category]: newState
      };
    });

    // Update all notifications in this category instantly
    setNotificationSettings(prev => {
      const updated = { ...prev };
      const keys = categoryMap[category];
      
      keys.forEach(key => {
        if (updated[key]) {
          updated[key] = {
            ...updated[key],
            push: !prev[category] // Toggle based on current category state
          };
        }
      });
      
      return updated;
    });
  }, [masterToggle]);

  // Toggle individual notification - instant
  const toggleNotificationType = useCallback((itemKey, type) => {
    if (!masterToggle) return;
    
    // Update notification immediately
    setNotificationSettings(prev => {
      const newValue = !prev[itemKey][type];
      const updated = {
        ...prev,
        [itemKey]: {
          ...prev[itemKey],
          [type]: newValue
        }
      };

      // Update category toggle based on new state (only if this is a push toggle)
      if (type === 'push') {
        // Find which category this notification belongs to
        let targetCategory = null;
        for (const [category, keys] of Object.entries(categoryMap)) {
          if (keys.includes(itemKey)) {
            targetCategory = category;
            break;
          }
        }

        if (targetCategory) {
          // Check if any notification in this category has push enabled
          const hasActivePush = categoryMap[targetCategory].some(key => 
            updated[key]?.push === true
          );
          
          setCategoryToggles(catPrev => ({
            ...catPrev,
            [targetCategory]: hasActivePush
          }));
        }
      }

      return updated;
    });
  }, [masterToggle]);

  const NotificationItem = React.memo(({ label, itemKey, showEditIcon = false }) => (
    <View style={styles.notificationItem}>
      <View style={styles.labelContainer}>
        <Text style={[
          styles.notificationLabel,
          !masterToggle && styles.disabledText
        ]}>{label}</Text>
        {showEditIcon && (
          <TouchableOpacity 
            style={styles.editIcon}
            disabled={!masterToggle}
          >
            <MaterialIcon 
              name="edit" 
              size={14} 
              color={masterToggle ? "#000000" : "#CCCCCC"} 
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.toggleGroup}>
        {/* Push Toggle */}
        <TouchableOpacity 
          style={[
            styles.toggleSwitch,
            notificationSettings[itemKey]?.push && styles.toggleSwitchActive,
            !masterToggle && styles.toggleSwitchDisabled
          ]}
          onPress={() => toggleNotificationType(itemKey, 'push')}
          disabled={!masterToggle}
        >
          <View style={[
            styles.toggleDot,
            notificationSettings[itemKey]?.push && styles.toggleDotActive,
            !masterToggle && styles.toggleDotDisabled
          ]} />
        </TouchableOpacity>
        
        {/* Email Toggle */}
        <TouchableOpacity 
          style={[
            styles.toggleSwitch,
            notificationSettings[itemKey]?.email && styles.toggleSwitchActive,
            !masterToggle && styles.toggleSwitchDisabled
          ]}
          onPress={() => toggleNotificationType(itemKey, 'email')}
          disabled={!masterToggle}
        >
          <View style={[
            styles.toggleDot,
            notificationSettings[itemKey]?.email && styles.toggleDotActive,
            !masterToggle && styles.toggleDotDisabled
          ]} />
        </TouchableOpacity>
        
        {/* SMS Toggle */}
        <TouchableOpacity 
          style={[
            styles.toggleSwitch,
            notificationSettings[itemKey]?.sms && styles.toggleSwitchActive,
            !masterToggle && styles.toggleSwitchDisabled
          ]}
          onPress={() => toggleNotificationType(itemKey, 'sms')}
          disabled={!masterToggle}
        >
          <View style={[
            styles.toggleDot,
            notificationSettings[itemKey]?.sms && styles.toggleDotActive,
            !masterToggle && styles.toggleDotDisabled
          ]} />
        </TouchableOpacity>
      </View>
    </View>
  ));

  const SectionHeader = React.memo(({ title, category }) => (
    <View style={styles.sectionHeader}>
      <Text style={[
        styles.sectionTitle,
        !masterToggle && styles.disabledText
      ]}>{title}</Text>
      <TouchableOpacity 
        style={[
          styles.categoryToggle,
          categoryToggles[category] && styles.categoryToggleActive,
          !masterToggle && styles.categoryToggleDisabled
        ]}
        onPress={() => toggleCategory(category)}
        disabled={!masterToggle}
      >
        <View style={[
          styles.categoryToggleDot,
          categoryToggles[category] && styles.categoryToggleDotActive,
          !masterToggle && styles.categoryToggleDotDisabled
        ]} />
      </TouchableOpacity>
    </View>
  ));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Custom Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alerts & Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Master Toggle - Pause all notifications */}
      <View style={styles.masterContainer}>
        <Text style={styles.masterTitle}>Pause all notifications</Text>
        <TouchableOpacity 
          style={[
            styles.masterToggle,
            masterToggle && styles.masterToggleActive
          ]}
          onPress={toggleMasterSwitch}
        >
          <View style={[
            styles.masterToggleDot,
            masterToggle && styles.masterToggleDotActive
          ]} />
        </TouchableOpacity>
      </View>

      {/* Notification Bar */}
      <View style={[styles.notificationBar, !masterToggle && styles.notificationBarDisabled]}>
        <View style={styles.notificationBarLeft}>
          <View style={[styles.notificationIcon, !masterToggle && styles.notificationIconDisabled]}>
            <Icon name="bell" size={16} color={masterToggle ? "#541F76" : "#999999"} />
          </View>
          <Text style={[styles.notificationBarText, !masterToggle && styles.disabledText]}>
            Notifications
          </Text>
        </View>
        <View style={styles.notificationActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, !masterToggle && styles.actionBtnDisabled]}
            disabled={!masterToggle}
          >
            <MaterialIcon name="email" size={16} color={masterToggle ? "#5F2B80" : "#999999"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, !masterToggle && styles.actionBtnDisabled]}
            disabled={!masterToggle}
          >
            <MaterialIcon name="message" size={16} color={masterToggle ? "#5F2B80" : "#999999"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, !masterToggle && styles.actionBtnDisabled]}
            disabled={!masterToggle}
          >
            <MaterialIcon name="chat" size={16} color={masterToggle ? "#5F2B80" : "#999999"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Spending & Budget Alerts */}
        <View style={styles.section}>
          <SectionHeader title="Spending & Budget Alerts" category="spending" />
          <NotificationItem label="Available to spend low" itemKey="availableToSpendLow" showEditIcon={true} />
          <NotificationItem label="Large transaction" itemKey="largeTransaction" />
          <NotificationItem label="Planned expense nearing or over limit" itemKey="plannedExpense" />
          <NotificationItem label="Spending update" itemKey="spendingUpdate" />
          <NotificationItem label="Watchlist approaching or over target" itemKey="watchlistOverTarget" />
          <NotificationItem label="Uncategorized transactions" itemKey="uncategorizedTransactions" />
        </View>

        {/* Income & Deposits */}
        <View style={styles.section}>
          <SectionHeader title="Income & Deposits" category="income" />
          <NotificationItem label="Income received" itemKey="incomeReceived" />
          <NotificationItem label="Large deposit" itemKey="largeDeposit" />
          <NotificationItem label="Extra paycheck month" itemKey="extraPaycheckMonth" />
        </View>

        {/* Bills & Subscriptions */}
        <View style={styles.section}>
          <SectionHeader title="Bills & Subscriptions" category="bills" />
          <NotificationItem label="Bill paid" itemKey="billPaid" />
          <NotificationItem label="Bills to income percentage" itemKey="billsToIncomePercentage" />
          <NotificationItem label="Upcoming bills" itemKey="upcomingBills" />
          <NotificationItem label="Refund status" itemKey="refundStatus" />
        </View>

        {/* Bank & Cash Flow Alerts */}
        <View style={styles.section}>
          <SectionHeader title="Bank & Cash Flow Alerts" category="bank" />
          <NotificationItem label="Low bank account balance" itemKey="lowBankBalance" showEditIcon={true} />
          <NotificationItem label="Projected low bank account balance" itemKey="projectedLowBalance" />
          <NotificationItem label="Bank fee" itemKey="bankFee" showEditIcon={true} />
          <NotificationItem label="Refund status" itemKey="refundStatus" />
        </View>

        {/* Goals & Savings */}
        <View style={styles.section}>
          <SectionHeader title="Goals & Savings" category="goals" />
          <NotificationItem label="Goal contribution" itemKey="goalContribution" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  masterContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  masterTitle: {
    color: '#4D1770',
    fontSize: 18,
    fontWeight: '600',
  },
  masterToggle: {
    width: 41,
    height: 19,
    backgroundColor: '#F2F2F2',
    borderRadius: 12.5,
    position: 'relative',
  },
  masterToggleActive: {
    backgroundColor: '#5F2B80',
  },
  masterToggleDot: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#C4C4C4',
    position: 'absolute',
    left: 2,
    top: 2,
  },
  masterToggleDotActive: {
    left: 24,
    backgroundColor: '#FFFFFF',
  },
  notificationBar: {
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(105.861deg, rgb(95, 43, 128) 2.3894%, rgb(58, 0, 94) 103.83%)',
    borderRadius: 5,
    padding: 15,
    marginHorizontal: 5,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  notificationBarDisabled: {
    opacity: 0.5,
  },
  notificationBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 30,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconDisabled: {
    backgroundColor: '#F0F0F0',
  },
  notificationBarText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 31,
    height: 31,
    backgroundColor: '#FFFFFF',
    borderRadius: 15.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDisabled: {
    backgroundColor: '#F0F0F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 4.5,
    paddingTop: 20,
    paddingBottom: 140,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  sectionTitle: {
    color: '#171717',
    fontSize: 17,
    fontWeight: '600',
  },
  categoryToggle: {
    width: 35,
    height: 16,
    backgroundColor: '#F2F2F2',
    borderRadius: 12.5,
    position: 'relative',
  },
  categoryToggleActive: {
    backgroundColor: '#5F2B80',
  },
  categoryToggleDisabled: {
    opacity: 0.5,
  },
  categoryToggleDot: {
    width: 12.8,
    height: 12.6,
    borderRadius: 6.3,
    backgroundColor: '#C4C4C4',
    position: 'absolute',
    left: 2,
    top: 1.7,
  },
  categoryToggleDotActive: {
    left: 20.2,
    backgroundColor: '#FFFFFF',
  },
  categoryToggleDotDisabled: {
    backgroundColor: '#E0E0E0',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 9,
  },
  labelContainer: {
    flex: 1,
    maxWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  notificationLabel: {
    color: '#5B5B5B',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  disabledText: {
    color: '#CCCCCC',
  },
  editIcon: {
    marginLeft: 5,
    padding: 2,
  },
  toggleGroup: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 'auto',
  },
  toggleSwitch: {
    width: 30,
    height: 19,
    backgroundColor: '#D9D9D9',
    borderRadius: 60,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#D9D9D9',
  },
  toggleSwitchActive: {
    backgroundColor: '#5F2B80',
    borderColor: '#5F2B80',
  },
  toggleSwitchDisabled: {
    opacity: 0.5,
  },
  toggleDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#6D6D6D',
    position: 'absolute',
    left: 4,
    top: 3,
  },
  toggleDotActive: {
    left: 15,
    backgroundColor: '#FFFFFF',
  },
  toggleDotDisabled: {
    backgroundColor: '#E0E0E0',
  },
});