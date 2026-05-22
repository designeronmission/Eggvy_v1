// src/screens/InsightsScreen.js
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';
import TransactionsTab from './TransactionsTab';
import CategoriesTab from './CategoriesTab';

const { width } = Dimensions.get('window');

const InsightsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('transactions');
  const [bottomNavActive, setBottomNavActive] = useState('insights');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Summary Data
  const summaryData = {
    totalSpending: 5870,
    totalIncome: 6254,
    netCashflow: -384,
    activeGoals: 3,
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleTabPress = (tabId) => {
    setBottomNavActive(tabId);
    const navigationMap = {
      dashboard: 'Dashboard',
      budget: 'Budget',
      goals: 'Goals',
      offers: 'Offers',
    };
    if (navigationMap[tabId]) {
      navigation.navigate(navigationMap[tabId]);
    }
  };

  const getMonthName = (value) => {
    const months = {
      all: 'Last 90 Days',
      '2025-09': 'September 2025',
      '2025-08': 'August 2025',
      '2025-07': 'July 2025',
      '2025-06': 'June 2025',
      '2025-05': 'May 2025',
      '2025-04': 'April 2025',
      '2025-03': 'March 2025',
    };
    return months[value] || 'Last 90 Days';
  };

  const getAccountName = (value) => {
    const accounts = {
      all: 'All Accounts',
      checking: 'Checking Account (•••9007)',
      savings: 'Savings Account (•••7600)',
      credit: 'Credit Card (•••0141)',
    };
    return accounts[value] || 'All Accounts';
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  // Month Selector Modal
  const renderMonthSelector = () => (
    <Modal visible={showMonthSelector} transparent animationType="slide" onRequestClose={() => setShowMonthSelector(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Period</Text>
            <TouchableOpacity onPress={() => setShowMonthSelector(false)}>
              <Icon name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {['all', '2025-09', '2025-08', '2025-07', '2025-06', '2025-05', '2025-04', '2025-03'].map(month => (
            <TouchableOpacity
              key={month}
              style={[styles.selectorOption, selectedMonth === month && styles.selectorOptionActive]}
              onPress={() => {
                setSelectedMonth(month);
                setShowMonthSelector(false);
              }}>
              <Text style={[styles.selectorOptionText, selectedMonth === month && styles.selectorOptionTextActive]}>
                {getMonthName(month)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  // Account Selector Modal
  const renderAccountSelector = () => (
    <Modal visible={showAccountSelector} transparent animationType="slide" onRequestClose={() => setShowAccountSelector(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Account</Text>
            <TouchableOpacity onPress={() => setShowAccountSelector(false)}>
              <Icon name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {['all', 'checking', 'savings', 'credit'].map(account => (
            <TouchableOpacity
              key={account}
              style={[styles.selectorOption, selectedAccount === account && styles.selectorOptionActive]}
              onPress={() => {
                setSelectedAccount(account);
                setShowAccountSelector(false);
              }}>
              <Text style={[styles.selectorOptionText, selectedAccount === account && styles.selectorOptionTextActive]}>
                {getAccountName(account)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopBar title="Insights" showBack={false} />

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

        {/* Summary Card with Filters */}
        <LinearGradient
          colors={['#3F2B96', '#2A1B6D']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.summaryCard}>
          
          {/* Filter Row - Date & Account Selectors */}
          <View style={styles.filterRow}>
              
            <TouchableOpacity 
              style={styles.filterChip} 
              onPress={() => setShowAccountSelector(true)}>
              <Icon name="credit-card" size={14} color="#3F2B96" />
              <Text style={styles.filterChipText}>{getAccountName(selectedAccount)}</Text>
              <Icon name="chevron-down" size={14} color="#3F2B96" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterChip} 
              onPress={() => setShowMonthSelector(true)}>
              <Icon name="calendar" size={14} color="#3F2B96" />
              <Text style={styles.filterChipText}>{getMonthName(selectedMonth)}</Text>
              <Icon name="chevron-down" size={14} color="#3F2B96" />
            </TouchableOpacity>

          </View>
        </LinearGradient>

        {/* Tab Bar */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
            onPress={() => setActiveTab('transactions')}>
            <View
              style={[
                styles.tabIconContainer,
                {
                  backgroundColor:
                    activeTab === 'transactions' ? '#E8F1FF' : '#F1F5F9',
                },
              ]}>
              <Icon
                name="list"
                size={18}
                color={activeTab === 'credit-card' ? '#3F2B96' : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.tabText,
                activeTab === 'transactions' && styles.activeTabText,
              ]}>
              Transactions
            </Text>
            {activeTab === 'transactions' && (
              <View
                style={[styles.tabIndicator, {backgroundColor: '#3F2B96'}]}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
            onPress={() => setActiveTab('categories')}>
            <View
              style={[
                styles.tabIconContainer,
                {
                  backgroundColor:
                    activeTab === 'categories' ? '#E8F1FF' : '#F1F5F9',
                },
              ]}>
              <Icon
                name="pie-chart"
                size={18}
                color={activeTab === 'categories' ? '#3F2B96' : '#64748B'}
              />
            </View>
            <Text
              style={[
                styles.tabText,
                activeTab === 'categories' && styles.activeTabText,
              ]}>
              Categories
            </Text>
            {activeTab === 'categories' && (
              <View
                style={[styles.tabIndicator, {backgroundColor: '#3F2B96'}]}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'transactions' ? <TransactionsTab /> : <CategoriesTab />}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {renderMonthSelector()}
      {renderAccountSelector()}
      <BottomNav activeTab={bottomNavActive} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  // Filter Row
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '500',
  },
  // Summary Card
  summaryCard: {
    borderRadius: 16,
    margin: 16,
    marginTop: 10,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  summaryIncome: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryTotal: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  summaryProgressBarContainer: {
    marginBottom: 16,
  },
  summaryProgressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  summaryProgressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  summaryProgressPercent: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  summaryStat: {
    alignItems: 'center',
    flex: 1,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  // Tab Bar
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 5,
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
  bottomSpacer: {
    height: 80,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  selectorOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectorOptionActive: {
    backgroundColor: '#F1F5F9',
  },
  selectorOptionText: {
    fontSize: 16,
    color: '#0F172A',
  },
  selectorOptionTextActive: {
    color: '#3F2B96',
    fontWeight: '600',
  },
});

export default InsightsScreen;