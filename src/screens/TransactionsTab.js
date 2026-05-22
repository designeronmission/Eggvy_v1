// src/screens/TransactionsTab.js
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const TransactionsTab = () => {
  // State for tracking scroll positions of each KPI group
  const [scrollPositions, setScrollPositions] = useState({});
  const scrollViewRefs = useRef({});

  // Complete Financial Data with all reports
  const financialData = {
    // GROUP 1: CASHFLOW METRICS
    cashflowKPIs: [
      { 
        label: 'Total Income', 
        value: 4653.99, 
        prefix: '$', 
        icon: 'trending-up', 
        color: '#34C759', 
        bgColor: '#E8F5E9',
        detail: '↑ +2.3% from last month',
      },
      { 
        label: 'Total Expenses', 
        value: 4173.72, 
        prefix: '$', 
        icon: 'trending-down', 
        color: '#FF6B6B', 
        bgColor: '#FFEBEE',
        detail: '↓ -1.5% from last month',
      },
      { 
        label: 'Net Savings', 
        value: 480.27, 
        prefix: '$', 
        icon: 'save', 
        color: '#2C752C', 
        bgColor: '#E8F5E9',
        detail: '10.3% savings rate',
      },
    ],
    
    // GROUP 2: SPENDING METRICS
    spendingKPIs: [
      { 
        label: 'Food & Dining', 
        value: 1283.53, 
        prefix: '$', 
        icon: 'coffee', 
        color: '#FFB347', 
        bgColor: '#FFF3E0',
        detail: '62% of food budget',
        alert: '🔥 High spending'
      },
      { 
        label: 'Food Delivery', 
        value: 792.63, 
        prefix: '$', 
        icon: 'package', 
        color: '#FF8C00', 
        bgColor: '#FFF3E0',
        detail: 'Uber Eats + DoorDash',
        alert: '⚠️ 38 orders'
      },
      { 
        label: 'Shopping', 
        value: 331.88, 
        prefix: '$', 
        icon: 'shopping-bag', 
        color: '#4ECDC4', 
        bgColor: '#E8F0FE',
        detail: 'Amazon + Retail',
      },
      { 
        label: 'Auto & Transport', 
        value: 1034.90, 
        prefix: '$', 
        icon: 'truck', 
        color: '#E3B52B', 
        bgColor: '#FFF8E1',
        detail: 'Loan + Insurance + Gas',
      },
      { 
        label: 'Hotel & Travel', 
        value: 1177.85, 
        prefix: '$', 
        icon: 'map-pin', 
        color: '#45B7D1', 
        bgColor: '#E8F0FE',
        detail: 'Hotels.com, La Quinta',
      },
    ],
    
    // GROUP 3: FEES & CHARGES
    feesKPIs: [
      { 
        label: 'Total Fees Paid', 
        value: 102.00, 
        prefix: '$', 
        icon: 'alert-triangle', 
        color: '#FF3B30', 
        bgColor: '#FFEBEE',
        detail: 'Avoidable charges',
        alert: '⚠️ Set up autopay'
      },
      { 
        label: 'Late Fees', 
        value: 39.00, 
        prefix: '$', 
        icon: 'clock', 
        color: '#FF3B30', 
        bgColor: '#FFEBEE',
        detail: 'Missed due dates',
      },
      { 
        label: 'Overdraft Fees', 
        value: 13.00, 
        prefix: '$', 
        icon: 'alert-circle', 
        color: '#FF6B6B', 
        bgColor: '#FFEBEE',
        detail: 'Low balance alerts needed',
      },
      { 
        label: 'ATM Fees', 
        value: 20.00, 
        prefix: '$', 
        icon: 'credit-card', 
        color: '#64748B', 
        bgColor: '#F1F5F9',
        detail: 'Out-of-network',
      },
      { 
        label: 'Interest Charges', 
        value: 21.71, 
        prefix: '$', 
        icon: 'percent', 
        color: '#FF6B6B', 
        bgColor: '#FFEBEE',
        detail: 'Credit card balance',
      },
      { 
        label: 'Maintenance Fees', 
        value: 28.00, 
        prefix: '$', 
        icon: 'settings',  
        color: '#64748B', 
        bgColor: '#F1F5F9',
        detail: 'Keep $500 min balance',
      },
    ],
    
    // GROUP 4: DEBT & OBLIGATIONS
    debtKPIs: [
      { 
        label: 'Monthly Loans', 
        value: 1017.63, 
        prefix: '$', 
        icon: 'file-text', 
        color: '#294F9B', 
        bgColor: '#E8F0FE',
        detail: '24% of expenses',
      },
      { 
        label: 'BNPL Spending', 
        value: 350.31, 
        prefix: '$', 
        icon: 'credit-card', 
        color: '#DDA0DD', 
        bgColor: '#F3E5F5',
        detail: '9 active plans',
        alert: '⚠️ Payment fatigue risk'
      },
      { 
        label: 'Cash Advances', 
        value: 992.97, 
        prefix: '$', 
        icon: 'dollar-sign', 
        color: '#FF6B6B', 
        bgColor: '#FFEBEE',
        detail: 'High interest',
        alert: '⚠️ Avoid if possible'
      },
      { 
        label: 'Total Remaining Debt', 
        value: 4600, 
        prefix: '$', 
        icon: 'trending-down', 
        color: '#FF6B6B', 
        bgColor: '#FFEBEE',
        detail: '3.8 years to payoff',
      },
    ],
    
    // GROUP 5: SUBSCRIPTIONS & SERVICES
    subscriptionsKPIs: [
      { 
        label: 'Active Subs', 
        value: 67.94, 
        prefix: '$', 
        icon: 'repeat', 
        color: '#45B7D1', 
        bgColor: '#E8F0FE',
        detail: '8 active services',
      },
      { 
        label: 'Unused Value', 
        value: 35.00, 
        prefix: '$', 
        icon: 'trash-2', 
        color: '#FF6B6B', 
        bgColor: '#FFEBEE',
        detail: 'Cancel to save',
        alert: '💡 Review subscriptions'
      },
      { 
        label: 'Yearly Total', 
        value: 815.28, 
        prefix: '$', 
        icon: 'calendar', 
        color: '#45B7D1', 
        bgColor: '#E8F0FE',
        detail: 'Annual subscription cost',
      },
    ],
    
    // GROUP 6: ATM & CASH
    atmKPIs: [
      { 
        label: 'ATM Withdrawals', 
        value: 773.00, 
        prefix: '$', 
        icon: 'credit-card', 
        color: '#64748B', 
        bgColor: '#F1F5F9',
        detail: '8 withdrawals',
      },
      { 
        label: 'ATM Fees Paid', 
        value: 20.00, 
        prefix: '$', 
        icon: 'alert-circle', 
        color: '#FFB347', 
        bgColor: '#FFF3E0',
        detail: 'Use in-network ATMs',
      },
    ],
    
    // Income vs Expense
    monthlyIncome: 4653.99,
    monthlyExpenses: 4173.72,
    monthlyGap: 480.27,
    
    // Uber Eats & DoorDash Analysis
    uberEats: {
      totalSpent: 518.41,
      transactionCount: 29,
      averagePerOrder: 17.88,
      percentageOfFood: 40,
      recommendation: 'Reduce to 2-3 times per week',
      potentialSavings: 259.00,
    },
    doorDash: {
      totalSpent: 274.22,
      transactionCount: 9,
      averagePerOrder: 30.47,
      percentageOfFood: 21,
      recommendation: 'Use pickup option to save fees',
      potentialSavings: 82.00,
    },
    totalFoodDelivery: 792.63,
    
    // Fee Analysis
    feeAnalysis: {
      totalFees: 102.00,
      overdraftFees: 13.00,
      latePaymentFees: 39.00,
      maintenanceFees: 28.00,
      interestCharges: 21.71,
      atmFees: 20.00,
      potentialSavings: 102.00,
      recommendation: 'Set up autopay and maintain minimum balance',
      feeEvents: [
        { description: 'Overdraft Item Fee', date: '24 May 2024', amount: -13.00, avoidable: true },
        { description: 'Late Fee — Credit Card', date: '14 Sep 2024', amount: -39.00, avoidable: true },
        { description: 'Monthly Maintenance Fee', date: '07 Sep 2024', amount: -8.00, avoidable: false },
        { description: 'Interest Charge — Purchases', date: '17 Sep 2024', amount: -11.40, avoidable: true },
        { description: 'Withdrawal Limit Fee', date: '08 Aug 2024', amount: -10.00, avoidable: true },
      ],
    },
    
    // Loan Analysis
    loanAnalysis: {
      totalMonthlyPayments: 1017.63,
      totalRemainingDebt: 46000,
      estimatedPayoffYears: 3.8,
      loans: [
        { name: 'OneMain Financial', type: 'Personal Loan', amount: -300.33, frequency: 'Monthly', remaining: 4300, interestRate: '24.99%' },
        { name: 'Toyota Auto Loan', type: 'Auto Loan', amount: -344.43, frequency: 'Monthly', remaining: 12400, interestRate: '6.99%' },
        { name: 'LendingPoint', type: 'Personal Loan', amount: -101.70, frequency: 'Monthly', remaining: 2500, interestRate: '29.99%' },
        { name: 'Cashback Loans', type: 'Short-term Loan', amount: -300.00, frequency: 'Variable', remaining: 600, interestRate: 'High' },
      ],
    },
    
    // BNPL Analysis
    bnplAnalysis: {
      totalSpent: 350.31,
      totalActivePlans: 9,
      averagePayment: 38.92,
      services: [
        { name: 'Afterpay', amount: 175.75, transactions: 9, activePlans: 3, nextPayment: 'Mar 25, 2026' },
        { name: 'Klarna', amount: 112.84, transactions: 7, activePlans: 4, nextPayment: 'Mar 28, 2026' },
        { name: 'Sezzle', amount: 35.33, transactions: 2, activePlans: 1, nextPayment: 'Apr 01, 2026' },
        { name: 'Affirm', amount: 26.39, transactions: 1, activePlans: 1, nextPayment: 'Apr 05, 2026' },
      ],
      insight: 'Using BNPL services for everyday purchases can lead to payment fatigue',
    },
    
    // Subscriptions
    subscriptions: {
      totalMonthly: 67.94,
      totalYearly: 815.28,
      unusedValue: 35.00,
      items: [
        { name: 'Amazon Prime', amount: 16.30, category: 'Shopping', active: true, used: true, value: 'High' },
        { name: 'CVS CarePass', amount: 5.44, category: 'Pharmacy', active: true, used: false, value: 'Low' },
        { name: 'Peacock TV', amount: 4.99, category: 'Entertainment', active: true, used: false, value: 'Low' },
        { name: 'Apple Services', amount: 10.98, category: 'Entertainment', active: true, used: true, value: 'Medium' },
        { name: 'Planet Fitness', amount: 7.00, category: 'Gym', active: true, used: true, value: 'High' },
        { name: 'Hulu', amount: 6.99, category: 'Entertainment', active: true, used: false, value: 'Low' },
        { name: 'Roku (WarnerMedia)', amount: 9.99, category: 'Entertainment', active: true, used: false, value: 'Low' },
        { name: 'Brigit Membership', amount: 9.99, category: 'Financial', active: true, used: true, value: 'Medium' },
      ],
    },
    
    // Cash Advance Services
    cashAdvanceServices: [
      { name: 'Cashback Loans', amount: 600.00, frequency: 'Variable', fee: 'High Interest', warning: 'Consider alternatives' },
      { name: 'Brigit', amount: 110.98, frequency: 'Monthly', fee: '$9.99/mo', warning: 'Subscription fee adds up' },
      { name: 'Albert Instant', amount: 206.99, frequency: 'Variable', fee: 'Transfer fee', warning: 'Use only for emergencies' },
      { name: 'Empower', amount: 75.00, frequency: 'Variable', fee: 'Subscription', warning: 'Evaluate necessity' },
    ],
    
    // ATM Report
    atmReport: {
      atmWithdrawalsThisMonth: 8,
      totalWithdrawals: 773.00,
      atmFees: 20.00,
      potentialSavings: 20.00,
      transactions: [
        { amount: 200.00, merchant: 'BKOFAMERICA ATM — Corona', date: '25 Mar 2026', type: 'In-Network', fees: 0 },
        { amount: 84.00, merchant: 'TNSSMART ATM — Valley Center', date: '24 Mar 2026', type: 'Out-of-Network', fees: 3.50 },
        { amount: 44.00, merchant: 'TNSSMART ATM — Valley Center', date: '23 Mar 2026', type: 'Out-of-Network', fees: 2.50 },
        { amount: 100.00, merchant: 'BKOFAMERICA ATM — Corona', date: '20 Mar 2026', type: 'In-Network', fees: 0 },
      ],
    },
    
    // Recent Transactions
    recentTransactions: [
      { name: 'Interest Charge', category: 'Finance Fee', date: '09/17/2024', time: '02.28 PM', amount: -11.40, type: 'debit', icon: 'alert-circle', color: '#FF6B6B', avoidable: true },
      { name: 'Online Payment From Check', category: 'Credit Card Payment', date: '09/16/2024', time: '11.28 AM', amount: 40.00, type: 'credit', icon: 'arrow-down', color: '#34C759', avoidable: false },
      { name: 'Brigit Protection', category: 'Financial', date: '09/16/2024', time: '11.59 AM', amount: -50.99, type: 'debit', icon: 'shield', color: '#FF6B6B', avoidable: true },
      { name: 'Amazon Shopping', category: 'Shopping', date: '09/16/2024', time: '03.45 PM', amount: -20.64, type: 'debit', icon: 'shopping-bag', color: '#FF6B6B', avoidable: false },
      { name: 'CVS Pharmacy', category: 'Pharmacy', date: '09/16/2024', time: '09.15 AM', amount: -5.44, type: 'debit', icon: 'heart', color: '#FF6B6B', avoidable: false },
      { name: 'Action Gypsum', category: 'Paycheck', date: '09/16/2024', time: '11.59 AM', amount: 738.39, type: 'credit', icon: 'briefcase', color: '#34C759', avoidable: false },
      { name: 'Uber Eats', category: 'Food & Dining', date: '09/15/2024', time: '07.30 PM', amount: -38.90, type: 'debit', icon: 'coffee', color: '#FF6B6B', avoidable: true },
      { name: 'Late Fee', category: 'Fee', date: '09/14/2024', time: '12.00 PM', amount: -39.00, type: 'debit', icon: 'alert-triangle', color: '#FF3B30', avoidable: true },
    ],
  };

  const formatCurrency = (amount) => {
    const absAmount = Math.abs(amount);
    return `$${absAmount.toFixed(2)}`;
  };

  const formatAmountWithSign = (amount) => {
    const sign = amount > 0 ? '+' : '-';
    return `${sign}${formatCurrency(amount)}`;
  };

  // Handle scroll to calculate active dot
  const handleScroll = (groupId, event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const cardWidth = width * 0.42 + 10; // Card width + gap
    const activeIndex = Math.round(offsetX / cardWidth);
    setScrollPositions(prev => ({ ...prev, [groupId]: activeIndex }));
  };

  // Scroll dots component
  const ScrollDots = ({ groupId, dataLength }) => {
    const activeIndex = scrollPositions[groupId] || 0;
    
    return (
      <View style={styles.dotsContainer}>
        {dataLength > 1 && Array.from({ length: dataLength }).map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              activeIndex === index && styles.dotActive,
            ]}
            onPress={() => {
              const cardWidth = width * 0.42 + 10;
              const scrollToX = index * cardWidth;
              if (scrollViewRefs.current[groupId]) {
                scrollViewRefs.current[groupId].scrollTo({ x: scrollToX, animated: true });
              }
              setScrollPositions(prev => ({ ...prev, [groupId]: index }));
            }}
          />
        ))}
      </View>
    );
  };

  // KPI Group Component with scroll dots
  const KPIGroup = ({ groupId, title, icon, data }) => (
    <View style={styles.kpiGroup}>
      <View style={styles.kpiGroupHeader}>
        <View style={styles.kpiGroupIcon}>
          <Icon name={icon} size={16} color="#3F2B96" />
        </View>
        <Text style={styles.kpiGroupTitle}>{title}</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kpiScrollContent}
        decelerationRate="fast"
        ref={ref => scrollViewRefs.current[groupId] = ref}
        onScroll={(event) => handleScroll(groupId, event)}
        scrollEventThrottle={16}>

        {data.map((kpi, index) => (
          <View key={index} style={styles.kpiCard}>
            <View style={styles.kpiRow}>
              <View style={[styles.kpiIcon, { backgroundColor: kpi.bgColor }]}>
                <Icon name={kpi.icon} size={18} color={kpi.color} />
              </View>
              <View style={styles.kpiContent}>
                <Text style={styles.kpiValue}>
                  {kpi.prefix}{kpi.value.toFixed(2)}
                </Text>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
              </View>
            </View>
            <Text style={[styles.kpiDetail, { color: kpi.color }]} numberOfLines={1}>
              {kpi.detail}
            </Text>
            {kpi.alert && (
              <View style={styles.kpiAlert}>
                <Text style={styles.kpiAlertText}>{kpi.alert}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      
      <ScrollDots groupId={groupId} dataLength={data.length}/>
    </View>
  );

  // Savings Opportunity Component
  const SavingsOpportunity = ({ title, savings, items }) => (
    <View style={styles.savingsCard}>
      <View style={styles.savingsHeader}>
        <View style={[styles.savingsIcon, { backgroundColor: '#E8F5E9' }]}>
          <Icon name="trending-up" size={24} color="#2C752C" />
        </View>
        <View>
          <Text style={styles.savingsTitle}>{title}</Text>
          <Text style={styles.savingsSubtitle}>Opportunities identified</Text>
        </View>
      </View>
      <View style={styles.savingsGrid}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.savingsItem}>
            <Text style={styles.savingsAmount}>{formatCurrency(item.savings)}</Text>
            <Text style={styles.savingsLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.savingsTotal}>
        <Text style={styles.savingsTotalLabel}>Total Potential Savings</Text>
        <Text style={styles.savingsTotalAmount}>{formatCurrency(savings)}/month</Text>
      </View>
    </View>
  );

  // Report Card Component
  const ReportCard = ({ title, icon, iconColor, children }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <View style={[styles.cardIconBg, { backgroundColor: `${iconColor}15` }]}>
            <Icon name={icon} size={16} color={iconColor} />
          </View>
          <Text style={styles.cardTitleText}>{title}</Text>
        </View>
      </View>
      {children}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* ========== KPI GROUPS SECTION ========== */}
      
      {/* GROUP 1: Cashflow Metrics */}
      <KPIGroup 
        groupId="cashflow"
        title="Cashflow Overview" 
        icon="trending-up" 
        data={financialData.cashflowKPIs} 
      />

      {/* GROUP 2: Spending Metrics */}
      <KPIGroup 
        groupId="spending"
        title="Spending Analysis" 
        icon="shopping-bag" 
        data={financialData.spendingKPIs} 
      />

      {/* GROUP 3: Fees & Charges */}
      <KPIGroup 
        groupId="fees"
        title="Fees & Penalties" 
        icon="alert-triangle" 
        data={financialData.feesKPIs} 
      />

      {/* GROUP 4: Debt & Obligations */}
      <KPIGroup 
        groupId="debt"
        title="Debt & Obligations" 
        icon="file-text" 
        data={financialData.debtKPIs} 
      />



      {/* ========== SAVINGS OPPORTUNITIES ========== */}
      
      <SavingsOpportunity 
        title="Potential Monthly Savings"
        savings={478}
        items={[
          { label: 'Reduce Uber Eats', savings: 259 },
          { label: 'Avoid Fees', savings: 102 },
          { label: 'DoorDash Pickup', savings: 82 },
          { label: 'Unused Subscriptions', savings: 35 },
        ]}/>

      {/* ========== REPORTS SECTION ========== */}
      
      {/* Income vs Expense Report */}
      <ReportCard title="Income vs Expenses" icon="bar-chart-2" iconColor="#FF6B6B">
        <View style={styles.incomeExpenseSection}>
          <View style={styles.incomeCol}>
            <Text style={styles.sectionLabel}>Monthly Income</Text>
            <Text style={[styles.amount, styles.incomeAmount]}>
              {formatCurrency(financialData.monthlyIncome)}
            </Text>
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={styles.badgeText}>↑ +2.3% from last month</Text>
            </View>
          </View>
          
          <View style={styles.dividerVertical} />
          
          <View style={styles.expenseCol}>
            <Text style={styles.sectionLabel}>Monthly Expenses</Text>
            <Text style={[styles.amount, styles.expenseAmount]}>
              {formatCurrency(financialData.monthlyExpenses)}
            </Text>
            <View style={[styles.badge, styles.badgeRed]}>
              <Text style={styles.badgeText}>↓ -1.5% from last month</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressLabel}>
            <Text style={styles.progressLabelText}>Expense to Income Ratio</Text>
            <Text style={styles.progressLabelValue}>{Math.round((financialData.monthlyExpenses / financialData.monthlyIncome) * 100)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(financialData.monthlyExpenses / financialData.monthlyIncome) * 100}%`, backgroundColor: '#FF6B6B' }]} />
          </View>
          <Text style={styles.progressNote}>Recommended: Keep below 80%</Text>
        </View>

        <View style={styles.infoMessage}>
          <Icon name="info" size={14} color="#C7A003" />
          <Text style={styles.infoText}>
            You saved {formatCurrency(financialData.monthlyGap)} this month. Great job!
          </Text>
        </View>
      </ReportCard>


      {/* Food & Dining Analysis */}
      <ReportCard title="Food & Dining Analysis" icon="coffee" iconColor="#FFB347">
        <View style={styles.foodDeliveryGrid}>
          <View style={styles.foodDeliveryStat}>
            <Text style={styles.foodDeliveryValue}>{formatCurrency(financialData.uberEats.totalSpent)}</Text>
            <Text style={styles.foodDeliveryLabel}>Uber Eats</Text>
            <Text style={styles.foodDeliverySub}>{financialData.uberEats.transactionCount} orders</Text>
            <Text style={styles.foodDeliveryAvg}>Avg ${financialData.uberEats.averagePerOrder}/order</Text>
          </View>
          <View style={styles.foodDeliveryStat}>
            <Text style={styles.foodDeliveryValue}>{formatCurrency(financialData.doorDash.totalSpent)}</Text>
            <Text style={styles.foodDeliveryLabel}>DoorDash</Text>
            <Text style={styles.foodDeliverySub}>{financialData.doorDash.transactionCount} orders</Text>
            <Text style={styles.foodDeliveryAvg}>Avg ${financialData.doorDash.averagePerOrder}/order</Text>
          </View>
        </View>

        <View style={styles.savingsOpportunityBox}>
          <Text style={styles.savingsOpportunityTitle}>💰 Savings Opportunity</Text>
          <Text style={styles.savingsOpportunityText}>
            Reduce Uber Eats to 2-3 times per week: Save ${financialData.uberEats.potentialSavings}/month
          </Text>
          <Text style={styles.savingsOpportunityText}>
            Use DoorDash pickup option: Save ${financialData.doorDash.potentialSavings}/month
          </Text>
        </View>

        <View style={styles.alertWarning}>
          <Icon name="alert-circle" size={16} color="#B6843D" />
          <Text style={styles.alertWarningText}>
            You spent {formatCurrency(financialData.totalFoodDelivery)} on Food Delivery. That's 62% of your food budget!
          </Text>
        </View>
      </ReportCard>

      {/* Fee Analysis Report */}
      <ReportCard title="Fee Analysis Report" icon="alert-triangle" iconColor="#FF6B6B">
        <View style={styles.statsGrid2x2}>
          <View style={styles.statCard2x2}>
            <Text style={[styles.statValue2x2, { color: '#FF3B30' }]}>{formatCurrency(financialData.feeAnalysis.totalFees)}</Text>
            <Text style={styles.statLabel2x2}>Total Fees Paid</Text>
          </View>
          <View style={styles.statCard2x2}>
            <Text style={styles.statValue2x2}>{formatCurrency(financialData.feeAnalysis.latePaymentFees)}</Text>
            <Text style={styles.statLabel2x2}>Late Fees</Text>
          </View>
          <View style={styles.statCard2x2}>
            <Text style={styles.statValue2x2}>{formatCurrency(financialData.feeAnalysis.overdraftFees)}</Text>
            <Text style={styles.statLabel2x2}>Overdraft Fees</Text>
          </View>
          <View style={styles.statCard2x2}>
            <Text style={styles.statValue2x2}>{formatCurrency(financialData.feeAnalysis.interestCharges)}</Text>
            <Text style={styles.statLabel2x2}>Interest Charges</Text>
          </View>
        </View>

        {financialData.feeAnalysis.feeEvents.filter(f => f.avoidable).slice(0, 3).map((event, idx) => (
          <View key={idx} style={styles.feeEventItem}>
            <View>
              <Text style={styles.feeEventDesc}>{event.description}</Text>
              <Text style={styles.feeEventDate}>{event.date}</Text>
            </View>
            <View style={styles.feeEventRight}>
              <Text style={styles.feeEventAmount}>{formatAmountWithSign(event.amount)}</Text>
              {event.avoidable && (
                <View style={styles.avoidableBadge}>
                  <Text style={styles.avoidableText}>Avoidable</Text>
                </View>
              )}
            </View>
          </View>
        ))}

        <View style={styles.savingsOpportunityBox}>
          <Text style={styles.savingsOpportunityTitle}>💰 Potential Savings: {formatCurrency(financialData.feeAnalysis.potentialSavings)}</Text>
          <Text style={styles.savingsOpportunityText}>{financialData.feeAnalysis.recommendation}</Text>
        </View>

        <View style={styles.alertWarning}>
          <Icon name="alert-circle" size={16} color="#B6843D" />
          <Text style={styles.alertWarningText}>
            You've paid {formatCurrency(financialData.feeAnalysis.totalFees)} in avoidable fees. Set up autopay to prevent this!
          </Text>
        </View>
      </ReportCard>

      {/* BNPL Analysis */}
      <ReportCard title="Buy Now Pay Later (BNPL) Usage" icon="credit-card" iconColor="#DDA0DD">
        <View style={styles.bnplSummary}>
          <View style={styles.bnplSummaryItem}>
            <Text style={styles.bnplSummaryValue}>{formatCurrency(financialData.bnplAnalysis.totalSpent)}</Text>
            <Text style={styles.bnplSummaryLabel}>Total BNPL Spend</Text>
          </View>
          <View style={styles.bnplSummaryItem}>
            <Text style={styles.bnplSummaryValue}>{financialData.bnplAnalysis.totalActivePlans}</Text>
            <Text style={styles.bnplSummaryLabel}>Active Plans</Text>
          </View>
          <View style={styles.bnplSummaryItem}>
            <Text style={styles.bnplSummaryValue}>{formatCurrency(financialData.bnplAnalysis.averagePayment)}</Text>
            <Text style={styles.bnplSummaryLabel}>Avg Payment</Text>
          </View>
        </View>

        {financialData.bnplAnalysis.services.map((service, idx) => (
          <View key={idx} style={styles.bnplItem}>
            <View>
              <Text style={styles.bnplName}>{service.name}</Text>
              <Text style={styles.bnplCount}>{service.transactions} transactions</Text>
              <Text style={styles.bnplNext}>Next payment: {service.nextPayment}</Text>
            </View>
            <View style={styles.bnplRight}>
              <Text style={styles.bnplAmount}>{formatCurrency(service.amount)}</Text>
              <View style={styles.bnplActiveBadge}>
                <Text style={styles.bnplActiveText}>{service.activePlans} active</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.alertWarning}>
          <Icon name="alert-circle" size={16} color="#B6843D" />
          <Text style={styles.alertWarningText}>
            {financialData.bnplAnalysis.insight}. You have {financialData.bnplAnalysis.totalActivePlans} active BNPL plans.
          </Text>
        </View>
      </ReportCard>

      {/* Subscription Analysis */}
      <ReportCard title="Active Subscriptions" icon="repeat" iconColor="#45B7D1">
        <View style={styles.subscriptionTotal}>
          <View>
            <Text style={styles.subscriptionTotalLabel}>Monthly Total</Text>
            <Text style={styles.subscriptionTotalAmount}>{formatCurrency(financialData.subscriptions.totalMonthly)}</Text>
          </View>
          <View>
            <Text style={styles.subscriptionTotalLabel}>Yearly Total</Text>
            <Text style={styles.subscriptionTotalAmount}>{formatCurrency(financialData.subscriptions.totalYearly)}</Text>
          </View>
          <View>
            <Text style={styles.subscriptionTotalLabel}>Unused Value</Text>
            <Text style={[styles.subscriptionTotalAmount, { color: '#FF6B6B' }]}>{formatCurrency(financialData.subscriptions.unusedValue)}/mo</Text>
          </View>
        </View>

        {financialData.subscriptions.items.map((item, idx) => (
          <View key={idx} style={styles.subscriptionItem}>
            <View>
              <Text style={styles.subscriptionName}>{item.name}</Text>
              <Text style={styles.subscriptionCategory}>{item.category}</Text>
            </View>
            <View style={styles.subscriptionRight}>
              <Text style={styles.subscriptionAmount}>{formatCurrency(item.amount)}/mo</Text>
              {!item.used && (
                <View style={styles.unusedBadge}>
                  <Text style={styles.unusedText}>Not used</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ReportCard>

      {/* Loan Payment Report */}
      <ReportCard title="Monthly Loan Obligations" icon="file-text" iconColor="#294F9B">
        {financialData.loanAnalysis.loans.map((loan, idx) => (
          <View key={idx} style={styles.loanItem}>
            <View>
              <Text style={styles.loanName}>{loan.name}</Text>
              <Text style={styles.loanType}>{loan.type} • {loan.frequency}</Text>
              <Text style={styles.loanRemaining}>Remaining: {formatCurrency(loan.remaining)}</Text>
            </View>
            <View style={styles.loanRight}>
              <Text style={styles.loanAmount}>{formatAmountWithSign(loan.amount)}</Text>
              <Text style={styles.loanRate}>{loan.interestRate}</Text>
            </View>
          </View>
        ))}

        <View style={styles.loanTotalBox}>
          <View>
            <Text style={styles.loanTotalLabel}>Total monthly payments</Text>
            <Text style={styles.loanTotalAmount}>{formatCurrency(financialData.loanAnalysis.totalMonthlyPayments)}</Text>
          </View>
          <View>
            <Text style={styles.loanTotalLabel}>Total remaining debt</Text>
            <Text style={styles.loanTotalAmount}>{formatCurrency(financialData.loanAnalysis.totalRemainingDebt)}</Text>
          </View>
        </View>

        <View style={styles.alertInfo}>
          <Icon name="info" size={16} color="#1a5f7a" />
          <Text style={styles.alertInfoText}>
            At current rate, debt payoff in ~{financialData.loanAnalysis.estimatedPayoffYears} years
          </Text>
        </View>
      </ReportCard>

      {/* Cash Advance Services */}
      <ReportCard title="Cash Advance Services" icon="dollar-sign" iconColor="#FF6B6B">
        {financialData.cashAdvanceServices.map((service, idx) => (
          <View key={idx} style={styles.cashAdvanceItem}>
            <View>
              <Text style={styles.cashAdvanceName}>{service.name}</Text>
              <Text style={styles.cashAdvanceFee}>{service.fee}</Text>
            </View>
            <View style={styles.cashAdvanceRight}>
              <Text style={styles.cashAdvanceAmount}>{formatCurrency(service.amount)}</Text>
              <Text style={styles.cashAdvanceFreq}>{service.frequency}</Text>
            </View>
          </View>
        ))}

        <View style={styles.alertDanger}>
          <Icon name="alert-octagon" size={16} color="#FF3B30" />
          <Text style={styles.alertDangerText}>
            These services have high interest rates and fees. Consider building an emergency fund to avoid them.
          </Text>
        </View>
      </ReportCard>

      {/* ATM Withdrawal Report */}
      <ReportCard title="ATM Activity" icon="credit-card" iconColor="#4ECDC4">
        <View style={styles.atmStatsContainer}>
          <View style={styles.atmStatCard}>
            <Text style={styles.atmStatValue}>{financialData.atmReport.atmWithdrawalsThisMonth}</Text>
            <Text style={styles.atmStatLabel}>Withdrawals</Text>
          </View>
          <View style={styles.atmStatCard}>
            <Text style={styles.atmStatValue}>{formatCurrency(financialData.atmReport.totalWithdrawals)}</Text>
            <Text style={styles.atmStatLabel}>Total Cash</Text>
          </View>
          <View style={styles.atmStatCard}>
            <Text style={[styles.atmStatValue, { color: '#FFB347' }]}>{formatCurrency(financialData.atmReport.atmFees)}</Text>
            <Text style={styles.atmStatLabel}>ATM Fees</Text>
          </View>
        </View>

        {financialData.atmReport.transactions.map((tx, idx) => (
          <View key={idx} style={styles.atmTransactionItem}>
            <View style={styles.atmTransactionLeft}>
              <View style={[styles.atmTransactionBadge, tx.type === 'In-Network' ? styles.networkBadge : styles.outNetworkBadge]}>
                <Icon name={tx.type === 'In-Network' ? 'check' : 'alert-circle'} size={14} color={tx.type === 'In-Network' ? '#2C752C' : '#FF6B6B'} />
              </View>
              <View style={styles.atmTransactionDetails}>
                <Text style={styles.atmTransactionMerchant}>{tx.merchant}</Text>
                <Text style={styles.atmTransactionDate}>{tx.date}</Text>
              </View>
            </View>
            <View style={styles.atmTransactionRight}>
              <Text style={styles.atmTransactionAmount}>{formatCurrency(tx.amount)}</Text>
              <View style={[styles.atmTransactionFeeBadge, tx.type === 'In-Network' ? styles.feeWaivedBadge : styles.feeChargedBadge]}>
                <Text style={[styles.atmTransactionFeeText, tx.type === 'In-Network' ? styles.feeWaivedText : styles.feeChargedText]}>
                  {tx.fees > 0 ? `-${formatCurrency(tx.fees)} fee` : 'Fee waived'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.savingsOpportunityBox}>
          <Text style={styles.savingsOpportunityTitle}>💰 Potential Savings: {formatCurrency(financialData.atmReport.potentialSavings)}</Text>
          <Text style={styles.savingsOpportunityText}>Use in-network ATMs to avoid fees</Text>
        </View>
      </ReportCard>

      {/* Recent Transactions */}
      <ReportCard title="Recent Transactions" icon="list" iconColor="#64748B">
        {financialData.recentTransactions.map((tx, idx) => (
          <View key={idx} style={styles.transactionCard}>
            <View style={[styles.transactionIcon, { backgroundColor: `${tx.color}15` }]}>
              <Icon name={tx.icon} size={20} color={tx.color} />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionName}>{tx.name}</Text>
              <Text style={styles.transactionCategory}>{tx.category}</Text>
              <Text style={styles.transactionTime}>{tx.date} • {tx.time}</Text>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[styles.transactionAmount, tx.amount < 0 ? styles.debitText : styles.creditText]}>
                {formatAmountWithSign(tx.amount)}
              </Text>
              {tx.avoidable && tx.amount < 0 && (
                <View style={styles.avoidableTransactionBadge}>
                  <Text style={styles.avoidableTransactionText}>Avoidable</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ReportCard>
      
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
  
  // KPI Group Styles
  kpiGroup: {
    marginBottom: 20,
    marginTop: 4,
  },
  kpiGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  kpiGroupIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  kpiScrollContent: {
    paddingHorizontal: 4,
    gap: 10,
  },
  kpiCard: {
    width: width * 0.42,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiContent: {
    flex: 1,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  kpiDetail: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 6,
  },
  kpiAlert: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  kpiAlertText: {
    fontSize: 9,
    color: '#B6843D',
    fontWeight: '500',
  },
  
  // Scroll Dots Styles
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 10,
    backgroundColor: '#5945b2',
  },
  
  // Savings Card
  savingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  savingsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  savingsSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  savingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  savingsItem: {
    width: (width - 86) / 2,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  savingsAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C752C',
    marginBottom: 4,
  },
  savingsLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  savingsTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  savingsTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  savingsTotalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C752C',
  },
  
  // Report Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
    flex: 1,
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Income vs Expense
  incomeExpenseSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  dividerVertical: {
    width: 1,
    height: 90,
    backgroundColor: '#E2E8F0',
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -0.5 }, { translateY: -45 }],
  },
  incomeCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  expenseCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#8f8f8f',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  amount: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  incomeAmount: {
    color: '#000000',
  },
  expenseAmount: {
    color: '#a34242',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'center',
  },
  badgeGreen: {
    backgroundColor: '#e8ffe4',
  },
  badgeRed: {
    backgroundColor: '#ffe4e4',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2c752c',
    textAlign: 'center',
  },
  progressBarContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabelText: {
    fontSize: 12,
    color: '#64748B',
  },
  progressLabelValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressNote: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'right',
  },
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#8c8c8c',
    fontWeight: '600',
  },
  
  // Category Progress
  categoryProgressItem: {
    marginBottom: 16,
  },
  categoryProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryProgressName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  categoryProgressDetail: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  categoryProgressAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  categoryProgressPercent: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  
  // Food & Dining
  foodDeliveryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  foodDeliveryStat: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  foodDeliveryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  foodDeliveryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 2,
  },
  foodDeliverySub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  foodDeliveryAvg: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFB347',
    marginTop: 4,
  },
  
  // Savings Opportunity Box
  savingsOpportunityBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  savingsOpportunityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C752C',
    marginBottom: 6,
  },
  savingsOpportunityText: {
    fontSize: 12,
    color: '#2C752C',
    marginBottom: 2,
  },
  
  // Stats Grid
  statsGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard2x2: {
    width: (width - 76) / 2,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue2x2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  statLabel2x2: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  
  // Fee Analysis
  feeEventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  feeEventDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  feeEventDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  feeEventRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  feeEventAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  avoidableBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  avoidableText: {
    fontSize: 9,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  
  // BNPL
  bnplSummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  bnplSummaryItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  bnplSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  bnplSummaryLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  bnplItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bnplName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  bnplCount: {
    fontSize: 10,
    color: '#64748B',
  },
  bnplNext: {
    fontSize: 9,
    color: '#FFB347',
    marginTop: 2,
  },
  bnplRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  bnplAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  bnplActiveBadge: {
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bnplActiveText: {
    fontSize: 9,
    color: '#DDA0DD',
    fontWeight: '500',
  },
  
  // Subscriptions
  subscriptionTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  subscriptionTotalLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  subscriptionTotalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  subscriptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subscriptionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
  },
  subscriptionCategory: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  subscriptionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  subscriptionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  unusedBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unusedText: {
    fontSize: 9,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  
  // Loans
  loanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  loanName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  loanType: {
    fontSize: 11,
    color: '#64748B',
  },
  loanRemaining: {
    fontSize: 10,
    color: '#FFB347',
    marginTop: 2,
  },
  loanRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  loanAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  loanRate: {
    fontSize: 10,
    color: '#64748B',
  },
  loanTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  loanTotalLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  loanTotalAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  
  // Cash Advance
  cashAdvanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cashAdvanceName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  cashAdvanceFee: {
    fontSize: 11,
    color: '#FF6B6B',
  },
  cashAdvanceRight: {
    alignItems: 'flex-end',
  },
  cashAdvanceAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  cashAdvanceFreq: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  
  // Alert Styles
  alertWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginTop: 12,
  },
  alertWarningText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#B6843D',
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginTop: 12,
  },
  alertInfoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#1a5f7a',
  },
  alertDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 10,
    gap: 10,
    marginTop: 12,
  },
  alertDangerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#FF3B30',
  },
  
  // ATM Styles
  atmStatsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  atmStatCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  atmStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  atmStatLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  atmTransactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  atmTransactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 2,
  },
  atmTransactionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkBadge: {
    backgroundColor: '#E8F5E9',
  },
  outNetworkBadge: {
    backgroundColor: '#FFEBEE',
  },
  atmTransactionDetails: {
    flex: 1,
  },
  atmTransactionMerchant: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 4,
  },
  atmTransactionDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  atmTransactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  atmTransactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  atmTransactionFeeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  feeWaivedBadge: {
    backgroundColor: '#E8F5E9',
  },
  feeChargedBadge: {
    backgroundColor: '#FFEBEE',
  },
  atmTransactionFeeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  feeWaivedText: {
    color: '#2C752C',
  },
  feeChargedText: {
    color: '#FF6B6B',
  },
  
  // Recent Transactions
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  creditText: {
    color: '#34C759',
  },
  debitText: {
    color: '#FF6B6B',
  },
  avoidableTransactionBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  avoidableTransactionText: {
    fontSize: 9,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  
  bottomPadding: {
    height: 20,
  },
});

export default TransactionsTab;