// src/screens/SubscriptionDetailsScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const { width } = Dimensions.get('window');

const SubscriptionDetailsScreen = () => {
  const navigation = useNavigation();
  const [bottomNavActive, setBottomNavActive] = useState('subscription');
  const [showFullTransactionId, setShowFullTransactionId] = useState(false);

  const subscriptionData = {
    planName: 'Free Plan',
    price: 10.00,
    approvedAmount: 20,
    subscriptionId: 'SID34',
    transactionId: '56e2ef5e-9bf2-4f39-b17f-d1fcd0bd560d',
    subscribedOn: '03-19-2026 09:30 am',
    period: {
      start: '03-19-2026',
      end: '03-31-2026',
    },
    frequency: 'Monthly',
    transactionStatus: 'Success',
    nextPayment: '04-01-2026',
    status: 'Active',
    limits: {
      min: 20,
      max: 200,
    },
    transactions: [
      { id: 1, date: '03-19-2026', amount: 10.00, type: 'debit', status: 'Success', description: 'Subscription Fee - Free Plan' },
      { id: 2, date: '02-19-2026', amount: 10.00, type: 'debit', status: 'Success', description: 'Subscription Fee - Free Plan' },
      { id: 3, date: '01-19-2026', amount: 10.00, type: 'debit', status: 'Success', description: 'Subscription Fee - Free Plan' },
      { id: 4, date: '12-19-2025', amount: 10.00, type: 'debit', status: 'Success', description: 'Subscription Fee - Free Plan' },
    ],
  };

  const features = [
    { id: 1, name: 'Budgeting', icon: 'pie-chart', color: '#3F2B96', bgColor: '#EBF7FF', description: 'Track your expenses and save more' },
    { id: 2, name: 'Bank Reporting', icon: 'trending-up', color: '#4ECDC4', bgColor: '#E8F0FE', description: 'Real-time bank insights' },
    { id: 3, name: 'Credit Score', icon: 'bar-chart-2', color: '#34C759', bgColor: '#E8F5E9', description: 'Monitor your credit health' },
    { id: 4, name: 'Get Advance', icon: 'dollar-sign', color: '#FFB347', bgColor: '#FFF3E0', description: 'Get cash advances instantly' },
    { id: 5, name: 'Instant Funding', icon: 'zap', color: '#FF6B6B', bgColor: '#FFEBEE', description: 'Fast funding to your account' },
  ];

  const handleTabPress = (tabId) => {
    setBottomNavActive(tabId);
    const navigationMap = {
      dashboard: 'Dashboard',
      insights: 'Insights',
      budget: 'Budget',
      goals: 'Goals',
      offers: 'Offers',
    };
    if (navigationMap[tabId]) {
      navigation.navigate(navigationMap[tabId]);
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const truncateTransactionId = (id) => {
    if (showFullTransactionId) return id;
    return `${id.substring(0, 16)}...`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <TopBar title="Subscription Details" showBack={true} />

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Plan Overview Card */}
        <LinearGradient
          colors={['#3F2B96', '#2A1B6D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.planCard}>
          
          <View style={styles.planHeader}>
            <View style={styles.planIconContainer}>
              <Icon name="award" size={28} color="#3F2B96" />
            </View>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Current Plan</Text>
            </View>
          </View>
          
          <Text style={styles.planName}>{subscriptionData.planName}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.planPrice}>{formatCurrency(subscriptionData.price)}</Text>
            <Text style={styles.planPeriod}>/month</Text>
          </View>
          
          <View style={styles.approvedContainer}>
            <Icon name="check-circle" size={18} color="#4ADE80" />
            <Text style={styles.approvedText}>
              You are Approved for <Text style={styles.approvedAmount}>${subscriptionData.approvedAmount}</Text>
            </Text>
          </View>
        </LinearGradient>

        {/* Plan Features - List View */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <View style={[styles.cardIconBg, { backgroundColor: '#EBF7FF' }]}>
                <Icon name="grid" size={16} color="#3F2B96" />
              </View>
              <Text style={styles.cardTitleText}>Plan Features</Text>
            </View>
          </View>

          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View key={feature.id} style={[
                styles.featureListItem,
                index === features.length - 1 && styles.lastFeatureItem
              ]}>
                <View style={styles.featureLeft}>
                  <View style={[styles.featureListIcon, { backgroundColor: feature.bgColor }]}>
                    <Icon name={feature.icon} size={18} color={feature.color} />
                  </View>
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureListName}>{feature.name}</Text>
                    <Text style={styles.featureListDesc}>{feature.description}</Text>
                  </View>
                </View>
                <View style={styles.featureCheck}>
                  <Icon name="check-circle" size={18} color="#34C759" />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Key Information Section */}
        <View style={styles.keyInfoSection}>
          <View style={styles.keyInfoGrid}>
            <View style={styles.keyInfoCard}>
              <View style={styles.keyInfoIcon}>
                <Icon name="calendar" size={18} color="#3F2B96" />
              </View>
              <Text style={styles.keyInfoLabel}>Next Payment</Text>
              <Text style={styles.keyInfoValue}>{subscriptionData.nextPayment}</Text>
              <Text style={styles.keyInfoNote}>Auto-debit on this date</Text>
            </View>
            
            <View style={styles.keyInfoCard}>
              <View style={[styles.keyInfoIcon, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="check-circle" size={18} color="#2C752C" />
              </View>
              <Text style={styles.keyInfoLabel}>Status</Text>
              <Text style={[styles.keyInfoValue, { color: '#2C752C' }]}>{subscriptionData.status}</Text>
              <Text style={styles.keyInfoNote}>Subscription active</Text>
            </View>
          </View>
        </View>

        {/* Subscription Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <View style={[styles.cardIconBg, { backgroundColor: '#EBF7FF' }]}>
                <Icon name="file-text" size={16} color="#3F2B96" />
              </View>
              <Text style={styles.cardTitleText}>Subscription Details</Text>
            </View>
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="hash" size={14} color="#64748B" />
              </View>
              <Text style={styles.detailLabel}>Subscription ID</Text>
              <Text style={styles.detailValue}>{subscriptionData.subscriptionId}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="credit-card" size={14} color="#64748B" />
              </View>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <View style={styles.transactionIdContainer}>
                <Text style={[styles.detailValue, styles.monoText]} numberOfLines={1}>
                  {truncateTransactionId(subscriptionData.transactionId)}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowFullTransactionId(!showFullTransactionId)}
                  style={styles.eyeIcon}>
                  <Icon 
                    name={showFullTransactionId ? "eye-off" : "eye"} 
                    size={16} 
                    color="#64748B" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="calendar" size={14} color="#64748B" />
              </View>
              <Text style={styles.detailLabel}>Subscribed On</Text>
              <Text style={styles.detailValue}>{subscriptionData.subscribedOn}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="clock" size={14} color="#64748B" />
              </View>
              <Text style={styles.detailLabel}>Billing Period</Text>
              <Text style={styles.detailValue}>
                {subscriptionData.period.start} - {subscriptionData.period.end}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="repeat" size={14} color="#64748B" />
              </View>
              <Text style={styles.detailLabel}>Frequency</Text>
              <Text style={styles.detailValue}>{subscriptionData.frequency}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="trending-up" size={14} color="#64748B" />
              </View>
              <Text style={styles.detailLabel}>Transaction Status</Text>
              <View style={[styles.statusBadge, styles.successBadge]}>
                <Icon name="check-circle" size={10} color="#2C752C" />
                <Text style={styles.statusText}>{subscriptionData.transactionStatus}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cash Limits Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <View style={[styles.cardIconBg, { backgroundColor: '#FFF3E0' }]}>
                <Icon name="lock" size={16} color="#FFB347" />
              </View>
              <Text style={styles.cardTitleText}>Cash Limits</Text>
            </View>
          </View>

          <View style={styles.cashLimitsContainer}>
            {/* Minimum Limit */}
            <View style={styles.cashLimitBox}>
              <View style={[styles.cashLimitIcon, { backgroundColor: '#FFEBEE' }]}>
                <Icon name="arrow-down" size={20} color="#FF6B6B" />
              </View>
              <View style={styles.cashLimitContent}>
                <Text style={styles.cashLimitLabel}>Minimum Cash Limit</Text>
                <Text style={styles.cashLimitValue}>${subscriptionData.limits.min}</Text>
                <Text style={styles.cashLimitNote}>Lowest amount you can withdraw</Text>
              </View>
            </View>

            <View style={styles.cashLimitDivider} />

            {/* Maximum Limit */}
            <View style={styles.cashLimitBox}>
              <View style={[styles.cashLimitIcon, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="arrow-up" size={20} color="#34C759" />
              </View>
              <View style={styles.cashLimitContent}>
                <Text style={styles.cashLimitLabel}>Maximum Cash Limit</Text>
                <Text style={styles.cashLimitValue}>${subscriptionData.limits.max}</Text>
                <Text style={styles.cashLimitNote}>Highest amount you can withdraw</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction History Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <View style={[styles.cardIconBg, { backgroundColor: '#E8F0FE' }]}>
                <Icon name="clock" size={16} color="#4ECDC4" />
              </View>
              <Text style={styles.cardTitleText}>Transaction History</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View all</Text>
              <Icon name="chevron-right" size={14} color="#1a5f7a" />
            </TouchableOpacity>
          </View>

          {subscriptionData.transactions.map((transaction, idx) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[styles.transactionIcon, { backgroundColor: '#FFEBEE' }]}>
                  <Icon name="credit-card" size={16} color="#FF6B6B" />
                </View>
                <View>
                  <Text style={styles.transactionDesc}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[styles.transactionAmount, styles.debitText]}>
                  -{formatCurrency(transaction.amount)}
                </Text>
                <View style={[styles.transactionStatusBadge, styles.successBadge]}>
                  <Text style={styles.transactionStatusText}>{transaction.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Upgrade Plan Banner */}
        <LinearGradient
          colors={['#3F2B96', '#2A1B6D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.upgradeBanner}>
          <View style={styles.upgradeBannerContent}>
            <View>
              <Text style={styles.upgradeBannerTitle}>Manage Your Subscription</Text>
              <Text style={styles.upgradeBannerText}>
               You’re in control. Cancel your subscription anytime
              </Text>
            </View>
            <TouchableOpacity style={styles.upgradeBannerButton}>
              <Text style={styles.upgradeBannerButtonText}>Unsubscribe</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Icon name="help-circle" size={20} color="#94A3B8" />
          <Text style={styles.helpText}>
            Need help? <Text style={styles.helpLink}>Contact Support</Text>
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomNav activeTab={bottomNavActive} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Plan Card Styles
  planCard: {
    borderRadius: 24,
    margin: 16,
    marginTop: 10,
    padding: 20,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  approvedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 8,
  },
  approvedText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  approvedAmount: {
    fontWeight: '700',
    color: '#4ADE80',
  },
  
  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a5f7a',
  },
  
  // Plan Features List Styles
  featuresList: {
    marginTop: 4,
  },
  featureListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastFeatureItem: {
    borderBottomWidth: 0,
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  featureListIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureListName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  featureListDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  featureCheck: {
    width: 28,
    alignItems: 'center',
  },
  
  // Key Information Section
  keyInfoSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  keyInfoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  keyInfoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  keyInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  keyInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  keyInfoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  keyInfoNote: {
    fontSize: 9,
    color: '#94A3B8',
  },
  
  // Details List Styles
  detailsList: {
    gap: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    width: 110,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  monoText: {
    fontFamily: 'monospace',
    fontSize: 11,
  },
  transactionIdContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeIcon: {
    padding: 4,
  },
  
  // Status Badges
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  successBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2C752C',
  },
  
  // Cash Limits Styles
  cashLimitsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
  },
  cashLimitBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cashLimitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cashLimitContent: {
    flex: 1,
  },
  cashLimitLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  cashLimitValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  cashLimitNote: {
    fontSize: 9,
    color: '#94A3B8',
  },
  cashLimitDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 12,
  },
  
  // Transaction History Styles
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  debitText: {
    color: '#FF6B6B',
  },
  transactionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  transactionStatusText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#2C752C',
  },
  
  // Upgrade Banner
  upgradeBanner: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  upgradeBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upgradeBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    width: 200,
  },
  upgradeBannerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    width: 180,
  },
  upgradeBannerButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upgradeBannerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3F2B96',
  },
  
  // Help Section
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  helpText: {
    fontSize: 12,
    color: '#64748B',
  },
  helpLink: {
    color: '#3F2B96',
    fontWeight: '600',
  },
  
  bottomSpacer: {
    height: 80,
  },
});

export default SubscriptionDetailsScreen;