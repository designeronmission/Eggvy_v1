// src/components/Dashboard/CashLimitCard.js
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const CashLimitCard = ({ onGetNowPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Top Section */}
        <View style={styles.topSection}>
          <View style={styles.badgeContainer}>
            <Icon name="check-circle" size={16} color="#10B981" />
            <Text style={styles.badgeText}>Approved</Text>
          </View>
          <View style={styles.iconContainer}>
            <Icon name="credit-card" size={20} color="#6366F1" />
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.labelText}>Your approved cash limit</Text>
          <Text style={styles.amountText}>$50.00</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Available Limit</Text>
            <Text style={styles.progressValue}>$50.00</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '100%' }]} />
          </View>
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={styles.limitInfo}>
            <Icon name="trending-up" size={16} color="#64748B" />
            <Text style={styles.limitInfoText}>0% Interest</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.getNowButton}
            onPress={onGetNowPress}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>Get Now</Text>
            <Icon name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Modern Light Theme Card
export const CashLimitCardModern = ({ onGetNowPress }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.modernCard}>
        
        {/* Header */}
        <View style={styles.modernHeader}>
          <View style={styles.modernIconCircle}>
            <Icon name="zap" size={20} color="#6366F1" />
          </View>
          <View style={styles.modernBadge}>
            <Icon name="shield" size={12} color="#10B981" />
            <Text style={styles.modernBadgeText}>Pre-approved</Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.modernAmountSection}>
          <Text style={styles.modernLabel}>Cash Limit</Text>
          <View style={styles.modernAmountRow}>
            <Text style={styles.modernCurrency}>$</Text>
            <Text style={styles.modernAmount}>50.00</Text>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#E0F2FE' }]}>
              <Icon name="check-circle" size={16} color="#0284C7" />
            </View>
            <Text style={styles.featureValue}>$50.00</Text>
            <Text style={styles.featureLabel}>Available</Text>
          </View>
          
          <View style={styles.featureDivider} />
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="percent" size={16} color="#16A34A" />
            </View>
            <Text style={styles.featureValue}>0%</Text>
            <Text style={styles.featureLabel}>Interest</Text>
          </View>
          
          <View style={styles.featureDivider} />
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#FEF9C3' }]}>
              <Icon name="clock" size={16} color="#CA8A04" />
            </View>
            <Text style={styles.featureValue}>24/7</Text>
            <Text style={styles.featureLabel}>Access</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.modernButton}
          onPress={onGetNowPress}>
          <Text style={styles.modernButtonText}>Get Cash Now</Text>
          <Icon name="arrow-right-circle" size={18} color="#6366F1" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

// Minimalist Light Card
export const CashLimitCardMinimal = ({ onGetNowPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.minimalCard}>
        {/* Top Row */}
        <View style={styles.minimalTopRow}>
          <View style={styles.minimalBadge}>
            <Icon name="check" size={12} color="#FFFFFF" />
            <Text style={styles.minimalBadgeText}>Active</Text>
          </View>
          <Text style={styles.minimalCardNumber}>•••• 4582</Text>
        </View>

        {/* Amount */}
        <Text style={styles.minimalLabel}>Cash Limit</Text>
        <Text style={styles.minimalAmount}>$50.00</Text>

        {/* Bottom Row */}
        <View style={styles.minimalBottomRow}>
          <View>
            <Text style={styles.minimalSmallLabel}>Available</Text>
            <Text style={styles.minimalSmallValue}>$50.00</Text>
          </View>
          
          <View style={styles.minimalDivider} />
          
          <View>
            <Text style={styles.minimalSmallLabel}>Interest</Text>
            <Text style={styles.minimalSmallValue}>0%</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.minimalButton}
            onPress={onGetNowPress}>
            <Icon name="arrow-right" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Premium Light Card with Elevated Design
export const CashLimitCardPremium = ({ onGetNowPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.premiumCard}>
        {/* Background Pattern */}
        <View style={styles.premiumPattern}>
          <View style={styles.patternCircle1} />
          <View style={styles.patternCircle2} />
        </View>

        {/* Chip Icon */}
        <View style={styles.premiumChip}>
          <View style={styles.chipLine} />
          <View style={styles.chipLine} />
          <View style={styles.chipLine} />
        </View>

        {/* Status Row */}
        <View style={styles.premiumStatusRow}>
          <View style={styles.premiumBadge}>
            <Icon name="check-circle" size={14} color="#10B981" />
            <Text style={styles.premiumBadgeText}>Approved</Text>
          </View>
          <Text style={styles.premiumDate}>Valid until 12/25</Text>
        </View>

        {/* Amount */}
        <Text style={styles.premiumAmount}>$50.00</Text>
        <Text style={styles.premiumSubtext}>Available limit</Text>

        {/* Features */}
        <View style={styles.premiumFeatures}>
          <View style={styles.premiumFeature}>
            <Icon name="clock" size={14} color="#6366F1" />
            <Text style={styles.premiumFeatureText}>Instant access</Text>
          </View>
          <View style={styles.premiumFeature}>
            <Icon name="percent" size={14} color="#10B981" />
            <Text style={styles.premiumFeatureText}>0% interest</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={styles.premiumButton}
          onPress={onGetNowPress}>
          <Text style={styles.premiumButtonText}>Get Now</Text>
          <Icon name="chevron-right" size={18} color="#6366F1" />
        </TouchableOpacity>

        {/* Company Name */}
        <Text style={styles.premiumCompany}>FinTech • Premium</Text>
      </View>
    </View>
  );
};

// Compact Card for Small Spaces
export const CashLimitCardCompact = ({ onGetNowPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.compactCard}>
        <View style={styles.compactLeft}>
          <View style={styles.compactIcon}>
            <Icon name="credit-card" size={20} color="#6366F1" />
          </View>
          <View>
            <Text style={styles.compactLabel}>Cash Limit</Text>
            <Text style={styles.compactAmount}>$50.00</Text>
          </View>
        </View>
        
        <View style={styles.compactRight}>
          <View style={styles.compactBadge}>
            <Text style={styles.compactBadgeText}>Approved</Text>
          </View>
          <TouchableOpacity 
            style={styles.compactButton}
            onPress={onGetNowPress}>
            <Icon name="arrow-right" size={18} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CashLimitCard;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 8,
    width: width - 32,
    alignSelf: 'center',
  },
  // Original Light Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: {
    marginBottom: 20,
  },
  labelText: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 4,
  },
  amountText: {
    color: '#0F172A',
    fontSize: 36,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  progressValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  limitInfoText: {
    color: '#64748B',
    fontSize: 13,
  },
  getNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    gap: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Modern Light Card
  modernCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modernIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  modernBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '500',
  },
  modernAmountSection: {
    marginBottom: 24,
  },
  modernLabel: {
    color: '#64748B',
    fontSize: 13,
    marginBottom: 8,
  },
  modernAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  modernCurrency: {
    color: '#0F172A',
    fontSize: 24,
    fontWeight: '500',
    marginRight: 2,
  },
  modernAmount: {
    color: '#0F172A',
    fontSize: 42,
    fontWeight: '700',
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureValue: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureLabel: {
    color: '#64748B',
    fontSize: 10,
  },
  featureDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  modernButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modernButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  // Minimalist Light Card
  minimalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  minimalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  minimalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  minimalBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  minimalCardNumber: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  minimalLabel: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 4,
  },
  minimalAmount: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  minimalBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  minimalSmallLabel: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 2,
  },
  minimalSmallValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  minimalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  minimalButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  // Premium Light Card
  premiumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
    overflow: 'hidden',
  },
  premiumPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  patternCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
  },
  patternCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F0FDF4',
  },
  premiumChip: {
    width: 40,
    height: 30,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  chipLine: {
    width: 20,
    height: 2,
    backgroundColor: '#94A3B8',
    marginVertical: 2,
  },
  premiumStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  premiumBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '500',
  },
  premiumDate: {
    color: '#94A3B8',
    fontSize: 11,
  },
  premiumAmount: {
    color: '#0F172A',
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 4,
  },
  premiumSubtext: {
    color: '#64748B',
    fontSize: 14,
    marginBottom: 16,
  },
  premiumFeatures: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  premiumFeatureText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '500',
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  premiumButtonText: {
    color: '#6366F1',
    fontSize: 15,
    fontWeight: '600',
  },
  premiumCompany: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'right',
  },
  // Compact Card
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactLabel: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 2,
  },
  compactAmount: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
  },
  compactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compactBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '500',
  },
  compactButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});

// Usage example in Dashboard:
/*
import CashLimitCard, { 
  CashLimitCardModern, 
  CashLimitCardMinimal, 
  CashLimitCardPremium,
  CashLimitCardCompact 
} from '../components/Dashboard/CashLimitCard';

const Dashboard = () => {
  const handleGetNow = () => {
    console.log('Get Now pressed');
    // Navigate to cash limit details or start application
  };

  return (
    <ScrollView style={{ backgroundColor: '#F8FAFC' }}>
      <CashLimitCard onGetNowPress={handleGetNow} />
      <CashLimitCardModern onGetNowPress={handleGetNow} />
      <CashLimitCardMinimal onGetNowPress={handleGetNow} />
      <CashLimitCardPremium onGetNowPress={handleGetNow} />
      <CashLimitCardCompact onGetNowPress={handleGetNow} />
    </ScrollView>
  );
};
*/