// src/screens/AdvanceDetailsScreen.js
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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const { width } = Dimensions.get('window');

const AdvanceDetailsScreen = () => {
  const navigation = useNavigation();
  const [bottomNavActive, setBottomNavActive] = useState('advance');
  const [showFullTransactionId, setShowFullTransactionId] = useState(false);

  const advanceData = {
    amount: 25.00,
    status: 'Success',
    advanceId: 'AID141',
    instantCharge: 2.00,
    disbursement: 23.00,
    transactionOn: '04-10-2026 05:14 AM',
    transactionId: '42751a28-41ec-4620-96ca-1ce78352e3af',
    transactions: [
      {
        id: 1,
        type: 'repayment',
        title: 'Advance Repaid',
        amount: 25.00,
        paymentMethod: '••••0000',
        transactionOn: '04-10-2026 05:30 AM',
        paymentType: 'AID141 - Repayment',
        status: 'Success',
        icon: 'arrow-up',
        color: '#FF6B6B',
        bgColor: '#FFEBEE',
        description: 'You have successfully repaid your advance',
      },
      {
        id: 2,
        type: 'received',
        title: 'Advance Received',
        amount: 23.00,
        paymentMethod: '••••0000',
        transactionOn: '04-10-2026 05:14 AM',
        paymentType: 'AID141 - Received',
        status: 'Success',
        icon: 'arrow-down',
        color: '#34C759',
        bgColor: '#E8F5E9',
        description: 'Advance amount credited to your account',
      },
    ],
  };

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

  // Enhanced Compact Transaction Card Component with Payment Method & Payment Type
  const TransactionCard = ({ transaction }) => (
    <View style={styles.compactTransactionCard}>
      {/* Top Row: Icon, Title, Date, Amount, Status */}
      <View style={styles.compactCardTopRow}>
        <View style={styles.compactCardLeft}>
          <View style={[styles.compactCardIcon, { backgroundColor: transaction.bgColor }]}>
            <Icon name={transaction.icon} size={22} color={transaction.color} />
          </View>
          <View style={styles.compactCardInfo}>
            <Text style={styles.compactCardTitle}>{transaction.title}</Text>
            <Text style={styles.compactCardDate}>{transaction.transactionOn}</Text>
          </View>
        </View>
        <View style={styles.compactCardRight}>
          <Text style={[styles.compactCardAmount, { color: transaction.color }]}>
            {transaction.type === 'repayment' ? '-' : '+'}{formatCurrency(transaction.amount)}
          </Text>
          <View style={[styles.compactCardBadge, { backgroundColor: transaction.bgColor }]}>
            <Text style={[styles.compactCardBadgeText, { color: transaction.color }]}>{transaction.status}</Text>
          </View>
        </View>
      </View>
      
      {/* Payment Method and Payment Type Row - Directly below with minimal gap */}
      <View style={styles.compactCardFooter}>
        <View style={styles.compactCardFooterRow}>
          <View style={styles.compactCardFooterIcon}>
            <Icon name="credit-card" size={12} color="#64748B" />
          </View>
          <Text style={styles.compactCardFooterLabel}>Payment method:</Text>
          <Text style={styles.compactCardFooterValue}>{transaction.paymentMethod}</Text>
        </View>
        <View style={styles.compactCardFooterRow}>
          <View style={styles.compactCardFooterIcon}>
            <Icon name="tag" size={12} color="#64748B" />
          </View>
          <Text style={styles.compactCardFooterLabel}>Payment type:</Text>
          <Text style={styles.compactCardFooterValue}>{transaction.paymentType}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <TopBar title="Advance Details" showBack={true} />

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Amount Card */}
        <LinearGradient
          colors={['#3F2B96', '#2A1B6D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.amountCard}>
          
          <Text style={styles.amountLabel}>Advance Amount</Text>
          <Text style={styles.amountValue}>{formatCurrency(advanceData.amount)}</Text>
          
          <View style={styles.statusBadge}>
            <Icon name="check-circle" size={14} color="#4ADE80" />
            <Text style={styles.statusText}>{advanceData.status}</Text>
          </View>
        </LinearGradient>

        {/* Advance Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <View style={[styles.cardIconBg, { backgroundColor: '#EBF7FF' }]}>
                <Icon name="info" size={16} color="#3F2B96" />
              </View>
              <Text style={styles.cardTitleText}>Advance Details</Text>
            </View>
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="hash" size={14} color="#64748B" />
              </View>
              <Text style={styles.detailLabel}>Adv. ID</Text>
              <Text style={styles.detailValue}>{advanceData.advanceId}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="zap" size={14} color="#64748B" />
              </View>
              <Text style={styles.detailLabel}>Instant Charge</Text>
              <Text style={styles.detailValue}>{formatCurrency(advanceData.instantCharge)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="dollar-sign" size={14} color="#64748B" />
              </View>
              <Text style={styles.detailLabel}>Disbursement</Text>
              <Text style={styles.detailValue}>{formatCurrency(advanceData.disbursement)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="calendar" size={14} color="#64748B" />
              </View>
              <Text style={styles.detailLabel}>Txn. On</Text>
              <Text style={styles.detailValue}>{advanceData.transactionOn}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Icon name="credit-card" size={14} color="#64748B" />
              </View>
              <Text style={styles.detailLabel}>Txn. ID</Text>
              <View style={styles.transactionIdContainer}>
                <Text style={[styles.detailValue, styles.monoText]} numberOfLines={1}>
                  {truncateTransactionId(advanceData.transactionId)}
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
          </View>
        </View>

        {/* Transaction Summary Card with Payment Method & Payment Type */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <View style={[styles.cardIconBg, { backgroundColor: '#FFF3E0' }]}>
                <Icon name="list" size={16} color="#FFB347" />
              </View>
              <Text style={styles.cardTitleText}>Transaction Summary</Text>
            </View>
          </View>

          {advanceData.transactions.map((transaction, index) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </View>

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
  
  // Amount Card Styles
  amountCard: {
    borderRadius: 24,
    margin: 16,
    marginTop: 10,
    padding: 24,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
  
  // Enhanced Compact Transaction Card Styles
  compactTransactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    padding: 14,
  },
  compactCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  compactCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 2,
  },
  compactCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCardInfo: {
    flex: 1,
  },
  compactCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  compactCardDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  compactCardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  compactCardAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  compactCardBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compactCardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  compactCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    gap: 8,
  },
  compactCardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  compactCardFooterIcon: {
    width: 20,
    alignItems: 'center',
    marginRight: 6,
  },
  compactCardFooterLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginRight: 4,
  },
  compactCardFooterValue: {
    fontSize: 11,
    fontWeight: '500',
    color: '#0F172A',
    flex: 1,
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

export default AdvanceDetailsScreen;