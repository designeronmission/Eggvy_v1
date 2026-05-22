// src/screens/CategoriesTab.js - With Compact Horizontal Scroll for Attention Cards
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

const CategoriesTab = () => {
  // State for tracking scroll positions of attention cards
  const [attentionScrollPosition, setAttentionScrollPosition] = useState(0);
  const attentionScrollRef = useRef(null);

  // Categories Data
  const categoriesData = {
    totalSpending: 5870.00,
    topCategory: 'Housing',
    discretionary: 2108.00,
    avgDailySpend: 189.00,
    
    // Attention Alerts - Compact version
    attentionAlerts: [
      {
        type: 'warning',
        title: '3 Categories Over Budget',
        subtitle: 'Exceeding by $394',
        action: 'Review',
        icon: 'alert-triangle',
        color: '#FF6B6B',
        bgColor: '#FFEBEE',
      },
      {
        type: 'info',
        title: 'Spending Insight',
        subtitle: '36% of total expenses',
        action: 'View',
        icon: 'trending-up',
        color: '#FFB347',
        bgColor: '#FFF3E0',
      },
      {
        type: 'success',
        title: 'On Track Categories',
        subtitle: 'Under budget by $80',
        action: 'Details',
        icon: 'check-circle',
        color: '#34C759',
        bgColor: '#E8F5E9',
      },
    ],
    
    spendingByCategory: [
      {
        name: 'Housing',
        amount: 1750.00,
        transactions: 2,
        vsLastMonth: 112,
        trend: 'up',
        color: '#2C752C',
        icon: 'home',
        progress: 35,
      },
      {
        name: 'Food & Dining',
        amount: 1057.00,
        transactions: 34,
        vsLastMonth: 40,
        trend: 'down',
        color: '#E3B52B',
        icon: 'coffee',
        progress: 35,
      },
      {
        name: 'Transportation',
        amount: 680.00,
        transactions: 12,
        vsLastMonth: 25,
        trend: 'up',
        color: '#FF6B6B',
        icon: 'truck',
        progress: 45,
      },
      {
        name: 'Shopping',
        amount: 820.00,
        transactions: 15,
        vsLastMonth: 45,
        trend: 'up',
        color: '#4ECDC4',
        icon: 'shopping-bag',
        progress: 55,
      },
      {
        name: 'Healthcare',
        amount: 320.00,
        transactions: 6,
        vsLastMonth: 10,
        trend: 'down',
        color: '#45B7D1',
        icon: 'heart',
        progress: 20,
      },
      {
        name: 'Entertainment',
        amount: 450.00,
        transactions: 8,
        vsLastMonth: 15,
        trend: 'down',
        color: '#DDA0DD',
        icon: 'tv',
        progress: 30,
      },
    ],
    
    budgetVariance: {
      totalBudgeted: 5570.00,
      actualSpend: 5870.00,
      variance: 320.00,
      categoriesOverBudget: 3,
      categories: [
        {
          name: 'Housing',
          budget: 1593.00,
          actual: 1750.00,
          variance: 157,
          status: 'over',
          icon: 'home',
          color: '#2C752C',
        },
        {
          name: 'Food & Dining',
          budget: 900.00,
          actual: 1057.00,
          variance: 157,
          status: 'over',
          icon: 'coffee',
          color: '#E3B52B',
        },
        {
          name: 'Transportation',
          budget: 600.00,
          actual: 680.00,
          variance: 80,
          status: 'over',
          icon: 'truck',
          color: '#FF6B6B',
        },
        {
          name: 'Shopping',
          budget: 700.00,
          actual: 820.00,
          variance: 120,
          status: 'over',
          icon: 'shopping-bag',
          color: '#4ECDC4',
        },
        {
          name: 'Healthcare',
          budget: 350.00,
          actual: 320.00,
          variance: -30,
          status: 'under',
          icon: 'heart',
          color: '#45B7D1',
        },
        {
          name: 'Entertainment',
          budget: 500.00,
          actual: 450.00,
          variance: -50,
          status: 'under',
          icon: 'tv',
          color: '#DDA0DD',
        },
      ],
    },
    
    taggedTransactions: {
      totalTagged: 94,
      tagged: 81,
      untagged: 13,
      customTags: 6,
      feed: [
        { name: 'Whole Foods', date: '24 Mar 2026', amount: 87, type: 'debit', tag: 'Groceries', icon: 'shopping-bag', color: '#2C752C' },
        { name: 'Netflix', date: '01 Mar 2026', amount: 18.99, type: 'debit', tag: 'Subscription', icon: 'tv', color: '#E3B52B' },
        { name: 'Shell Gas', date: '20 Mar 2026', amount: 68, type: 'debit', tag: 'Transport', icon: 'truck', color: '#FF6B6B' },
        { name: 'Amazon', date: '15 Mar 2026', amount: 143, type: 'debit', tag: 'Shopping', icon: 'box', color: '#4ECDC4' },
        { name: 'Starbucks', date: '10 Mar 2026', amount: 7.80, type: 'debit', tag: 'Food', icon: 'coffee', color: '#DDA0DD' },
      ],
    },
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const getProgressWidth = (actual, budget) => {
    const percentage = (actual / budget) * 100;
    return Math.min(percentage, 100);
  };

  // Handle scroll for attention dots
  const handleAttentionScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const cardWidth = width * 0.55 + 12; // Card width + gap (narrower for compact cards)
    const activeIndex = Math.round(offsetX / cardWidth);
    setAttentionScrollPosition(activeIndex);
  };

  // Scroll dots for attention cards
  const AttentionScrollDots = () => {
    const dataLength = categoriesData.attentionAlerts.length;
    const activeIndex = attentionScrollPosition;
    
    if (dataLength <= 1) return null;
    
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: dataLength }).map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              activeIndex === index && styles.dotActive,
            ]}
            onPress={() => {
              const cardWidth = width * 0.55 + 12;
              const scrollToX = index * cardWidth;
              if (attentionScrollRef.current) {
                attentionScrollRef.current.scrollTo({ x: scrollToX, animated: true });
              }
              setAttentionScrollPosition(index);
            }}
          />
        ))}
      </View>
    );
  };

  // Compact Attention Alert Card Component
  const AttentionAlert = ({ alert }) => (
    <TouchableOpacity 
      style={[styles.attentionCard, { backgroundColor: alert.bgColor, borderLeftColor: alert.color }]}
      activeOpacity={0.9}
    >
      <View style={styles.attentionContent}>
        <View style={[styles.attentionIcon, { backgroundColor: alert.color + '20' }]}>
          <Icon name={alert.icon} size={18} color={alert.color} />
        </View>
        <View style={styles.attentionTextContainer}>
          <Text style={[styles.attentionTitle, { color: alert.color }]} numberOfLines={1}>
            {alert.title}
          </Text>
          <Text style={styles.attentionSubtitle} numberOfLines={1}>
            {alert.subtitle}
          </Text>
        </View>
        <TouchableOpacity style={[styles.attentionButton, { borderColor: alert.color }]}>
          <Text style={[styles.attentionButtonText, { color: alert.color }]}>{alert.action}</Text>
          <Icon name="chevron-right" size={12} color={alert.color} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // KPI Grid Component
  const KPIGrid = () => (
    <View style={styles.kpiGrid2x2}>
      <View style={styles.kpiCard2x2}>
        <Text style={styles.kpiLabel2x2}>Total Spending</Text>
        <Text style={styles.kpiValue2x2}>{formatCurrency(categoriesData.totalSpending)}</Text>
      </View>
      <View style={styles.kpiCard2x2}>
        <Text style={styles.kpiLabel2x2}>Top Category</Text>
        <Text style={styles.kpiValue2x2}>{categoriesData.topCategory}</Text>
      </View>
      <View style={styles.kpiCard2x2}>
        <Text style={styles.kpiLabel2x2}>Discretionary</Text>
        <Text style={styles.kpiValue2x2}>{formatCurrency(categoriesData.discretionary)}</Text>
      </View>
      <View style={styles.kpiCard2x2}>
        <Text style={styles.kpiLabel2x2}>Avg Daily Spend</Text>
        <Text style={styles.kpiValue2x2}>{formatCurrency(categoriesData.avgDailySpend)}</Text>
      </View>
    </View>
  );

  // Spending by Category Component (Normal Vertical Layout)
  const SpendingByCategory = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <View style={[styles.cardIconBg, { backgroundColor: '#EBF7FF' }]}>
            <Icon name="pie-chart" size={16} color="#3F2B96" />
          </View>
          <Text style={styles.cardTitleText}>Spending by Category</Text>
        </View>
      </View>

      {categoriesData.spendingByCategory.map((item, idx) => (
        <View key={idx} style={styles.categoryItem}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryName}>
              <View style={[styles.categoryIcon, { backgroundColor: `${item.color}15` }]}>
                <Icon name={item.icon} size={14} color={item.color} />
              </View>
              <Text style={styles.categoryNameText}>{item.name}</Text>
            </View>
            <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryInfoLeft}>{item.transactions} transactions</Text>
            <Text style={[styles.categoryInfoRight, item.trend === 'up' ? styles.trendUp : styles.trendDown]}>
              {item.trend === 'up' ? '↑' : '↓'} ${Math.abs(item.vsLastMonth)} vs last month
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  // Budget Variance Component
  const BudgetVariance = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <View style={[styles.cardIconBg, { backgroundColor: '#FFEBEE' }]}>
            <Icon name="trending-down" size={16} color="#FF6B6B" />
          </View>
          <Text style={styles.cardTitleText}>Budget Variance</Text>
        </View>
      </View>

      {/* 2x2 Grid for Budget Summary */}
      <View style={styles.statsGrid2x2}>
        <View style={styles.statCard2x2}>
          <Text style={styles.statValue2x2}>{formatCurrency(categoriesData.budgetVariance.totalBudgeted)}</Text>
          <Text style={styles.statLabel2x2}>Total Budgeted</Text>
        </View>
        <View style={styles.statCard2x2}>
          <Text style={styles.statValue2x2}>{formatCurrency(categoriesData.budgetVariance.actualSpend)}</Text>
          <Text style={styles.statLabel2x2}>Actual Spend</Text>
        </View>
        <View style={styles.statCard2x2}>
          <Text style={[styles.statValue2x2, styles.redText]}>+${categoriesData.budgetVariance.variance.toFixed(2)}</Text>
          <Text style={styles.statLabel2x2}>Variance</Text>
        </View>
        <View style={styles.statCard2x2}>
          <Text style={[styles.statValue2x2, styles.redText]}>{categoriesData.budgetVariance.categoriesOverBudget}</Text>
          <Text style={styles.statLabel2x2}>Over Budget Cats</Text>
        </View>
      </View>

      <Text style={styles.sectionSubtitle}>Budget vs Actual by Category</Text>

      {categoriesData.budgetVariance.categories.map((item, idx) => {
        const progressWidth = getProgressWidth(item.actual, item.budget);
        const isOverBudget = item.status === 'over';
        
        return (
          <View key={idx} style={styles.budgetCategoryItem}>
            <View style={styles.budgetCategoryHeader}>
              <View style={styles.budgetCategoryLeft}>
                <View style={[styles.budgetCategoryIcon, { backgroundColor: `${item.color}15` }]}>
                  <Icon name={item.icon} size={14} color={item.color} />
                </View>
                <Text style={styles.budgetCategoryName}>{item.name}</Text>
              </View>
              <View style={[styles.budgetStatusBadge, isOverBudget ? styles.overBudgetBadge : styles.underBudgetBadge]}>
                <Text style={[styles.budgetStatusText, isOverBudget ? styles.overBudgetText : styles.underBudgetText]}>
                  {isOverBudget ? 'Over Budget' : 'Under Budget'}
                </Text>
              </View>
            </View>
            
            <View style={styles.budgetProgressBar}>
              <View style={[styles.budgetProgressFill, { width: `${progressWidth}%`, backgroundColor: isOverBudget ? '#FF6B6B' : '#34C759' }]} />
            </View>
            
            <View style={styles.budgetValuesRow}>
              <Text style={styles.budgetValueText}>Budget: {formatCurrency(item.budget)}</Text>
              <Text style={styles.budgetValueText}>Actual: {formatCurrency(item.actual)}</Text>
              <Text style={[styles.budgetValueText, isOverBudget ? styles.redText : styles.greenText]}>
                Variance: {item.variance > 0 ? '+' : ''}{formatCurrency(item.variance)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  // Tagged Transactions Component (Normal Vertical Layout)
  const TaggedTransactions = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <View style={[styles.cardIconBg, { backgroundColor: '#FFF3E0' }]}>
            <Icon name="tag" size={16} color="#FFB347" />
          </View>
          <Text style={styles.cardTitleText}>Tagged Transactions</Text>
        </View>
      </View>

      {/* 2x2 Grid for Tag Stats */}
      <View style={styles.statsGrid2x2}>
        <View style={styles.statCard2x2}>
          <Text style={styles.statValue2x2}>{categoriesData.taggedTransactions.totalTagged}</Text>
          <Text style={styles.statLabel2x2}>Total Transactions</Text>
        </View>
        <View style={styles.statCard2x2}>
          <Text style={[styles.statValue2x2, { color: '#34C759' }]}>{categoriesData.taggedTransactions.tagged}</Text>
          <Text style={styles.statLabel2x2}>Tagged</Text>
        </View>
        <View style={styles.statCard2x2}>
          <Text style={[styles.statValue2x2, { color: '#FF6B6B' }]}>{categoriesData.taggedTransactions.untagged}</Text>
          <Text style={styles.statLabel2x2}>Untagged</Text>
        </View>
        <View style={styles.statCard2x2}>
          <Text style={[styles.statValue2x2, { color: '#FFB347' }]}>{categoriesData.taggedTransactions.customTags}</Text>
          <Text style={styles.statLabel2x2}>Custom Tags</Text>
        </View>
      </View>

      <Text style={styles.sectionSubtitle}>Tagged Transaction Feed</Text>

      {categoriesData.taggedTransactions.feed.map((item, idx) => (
        <View key={idx} style={styles.feedItem}>
          <View style={styles.feedLeft}>
            <View style={[styles.feedIcon, { backgroundColor: `${item.color}15` }]}>
              <Icon name={item.icon} size={16} color={item.color} />
            </View>
            <View>
              <Text style={styles.feedName}>{item.name}</Text>
              <Text style={styles.feedDate}>{item.date}</Text>
            </View>
          </View>
          <View style={styles.feedRight}>
            <Text style={[styles.feedAmount, styles.negative]}>-{formatCurrency(item.amount)}</Text>
            <View style={[styles.feedTag, { backgroundColor: `${item.color}15` }]}>
              <Text style={[styles.feedTagText, { color: item.color }]}>{item.tag}</Text>
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View all transactions</Text>
        <Icon name="chevron-right" size={14} color="#1a5f7a" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Attention Alerts Section - Horizontal Scroll with Compact Cards */}
      <View style={styles.attentionSection}>
        <View style={styles.attentionHeaderRow}>
          <Icon name="bell" size={16} color="#3F2B96" />
          <Text style={styles.attentionSectionTitle}>Need your attention</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.attentionScrollContent}
          decelerationRate="fast"
          ref={attentionScrollRef}
          onScroll={handleAttentionScroll}
          scrollEventThrottle={16}
        >
          {categoriesData.attentionAlerts.map((alert, idx) => (
            <AttentionAlert key={idx} alert={alert} />
          ))}
        </ScrollView>
        
        <AttentionScrollDots />
      </View>

      {/* KPI Grid */}
      <KPIGrid />

      {/* Spending by Category - Normal Vertical Layout */}
      <SpendingByCategory />

      {/* Budget Variance */}
      <BudgetVariance />

      {/* Tagged Transactions - Normal Vertical Layout */}
      <TaggedTransactions />

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
  
  // Attention Section Styles
  attentionSection: {
    marginBottom: 16,
    marginTop: 4,
  },
  attentionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  attentionSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  attentionScrollContent: {
    paddingHorizontal: 4,
    gap: 10,
  },
  // Compact Attention Card
  attentionCard: {
    width: width * 0.80,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  attentionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attentionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attentionTextContainer: {
    flex: 1,
  },
  attentionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  attentionSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  attentionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attentionButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  
  // Scroll Dots Styles
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#3F2B96',
  },
  
  // 2x2 KPI Grid Styles
  kpiGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard2x2: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
  },
  kpiLabel2x2: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  kpiValue2x2: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0F172A',
  },
  
  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
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
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  
  // Category Item Styles (Normal Vertical Layout)
  categoryItem: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  categoryInfoLeft: {
    fontSize: 11,
    color: '#64748B',
  },
  categoryInfoRight: {
    fontSize: 11,
    fontWeight: '500',
  },
  trendUp: {
    color: '#FF6B6B',
  },
  trendDown: {
    color: '#34C759',
  },
  
  // 2x2 Stats Grid
  statsGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard2x2: {
    width: (width - 84) / 2,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statValue2x2: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  statLabel2x2: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  
  // Section Subtitle
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 14,
  },
  
  // Budget Variance Styles
  budgetCategoryItem: {
    marginBottom: 18,
  },
  budgetCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  budgetCategoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  budgetStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  overBudgetBadge: {
    backgroundColor: '#FFEBEE',
  },
  underBudgetBadge: {
    backgroundColor: '#E8F5E9',
  },
  budgetStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  overBudgetText: {
    color: '#FF6B6B',
  },
  underBudgetText: {
    color: '#34C759',
  },
  budgetProgressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  budgetValueText: {
    fontSize: 10,
    color: '#64748B',
  },
  
  // Tagged Transactions Styles (Normal Vertical Layout)
  feedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  feedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  feedIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  feedDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  feedRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  feedAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  negative: {
    color: '#FF6B6B',
  },
  feedTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  feedTagText: {
    fontSize: 9,
    fontWeight: '500',
  },
  
  // View All Button
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingVertical: 10,  
    gap: 6,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a5f7a',
  },
  
  // Text Colors
  redText: {
    color: '#FF6B6B',
  },
  greenText: {
    color: '#34C759',
  },
  
  bottomPadding: {
    height: 20,
  },
});

export default CategoriesTab;