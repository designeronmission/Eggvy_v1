// src/screens/OfferDetailScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const { width } = Dimensions.get('window');

export default function OfferDetailScreen({ route, navigation }) {
  const { offer } = route.params;
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('offers');

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this offer: ${offer.title} - ${offer.description} from ${offer.vendor}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share offer');
    }
  };

  const handleApply = () => {
    Alert.alert(
      'Apply Now',
      'Proceed with application?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => Alert.alert('Success', 'Application started!') }
      ]
    );
  };

  // Helper function to format keys
  const formatKey = (key) => {
    const words = key.replace(/([A-Z])/g, ' $1').split(' ');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  // Handle tab press for bottom navigation
  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    
    switch(tabId) {
      case 'dashboard':
        navigation.navigate('Dashboard');
        break;
      case 'insights':
        navigation.navigate('Insights');
        break;
      case 'budget':
        navigation.navigate('Budget');
        break;
      case 'goals':
        navigation.navigate('Goals');
        break;
      case 'offers':
        navigation.navigate('AddOffers');
        break;
      default:
        break;
    }
  };

  // Safe back button handler
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <TopBar 
        title="Offer Details" 
        showBack={true} 
        onBackPress={handleBackPress}
        rightIcon="share-outline"
        onRightPress={handleShare}
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Card */}
        <LinearGradient
          colors={offer.gradient || ['#667EEA', '#764BA2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            {/* Vendor Info */}
            <View style={styles.vendorRow}>
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorLogo}>{offer.vendorLogo || '🏢'}</Text>
                <View>
                  <Text style={styles.vendorName}>{offer.vendor}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>★ {offer.rating || '4.5'}</Text>
                    <Text style={styles.usedText}> • {offer.used || '1.2k used'}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  isSaved && styles.saveButtonActive
                ]}
                onPress={() => setIsSaved(!isSaved)}
              >
                <Text style={styles.saveButtonText}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Discount Badge */}
            {offer.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{offer.discount}</Text>
              </View>
            )}

            {/* Title & Description */}
            <Text style={styles.offerTitle}>{offer.title}</Text>
            <Text style={styles.offerDescription}>{offer.description}</Text>

            {/* Expiry */}
            {offer.expiry && (
              <View style={styles.expiryContainer}>
                <Text style={styles.expiryLabel}>Valid until:</Text>
                <Text style={styles.expiryText}>{offer.expiry}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{offer.discount || '20%'}</Text>
              <Text style={styles.statLabel}>Discount</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{offer.used ? offer.used.split(' ')[0] : '1.2k'}</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{offer.rating || '4.5'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Key Features */}
          {offer.details?.features && offer.details.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Key Benefits</Text>
              <View style={styles.featuresList}>
                {offer.details.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Offer Details */}
          {offer.details && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Offer Details</Text>
              <View style={styles.detailsCard}>
                {Object.entries(offer.details).map(([key, value], index, array) => {
                  if (key === 'features') return null;
                  
                  return (
                    <View key={key} style={[
                      styles.detailRow,
                      index < array.length - 1 && styles.detailRowBorder
                    ]}>
                      <Text style={styles.detailLabel}>{formatKey(key)}</Text>
                      <Text style={styles.detailValue}>
                        {Array.isArray(value) ? value.join(', ') : value.toString()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Terms & Conditions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <View style={styles.termsCard}>
              <View style={styles.termsItem}>
                <Text style={styles.termsBullet}>•</Text>
                <Text style={styles.termsText}>Subject to eligibility and credit approval</Text>
              </View>
              <View style={styles.termsItem}>
                <Text style={styles.termsBullet}>•</Text>
                <Text style={styles.termsText}>Terms and conditions apply</Text>
              </View>
              <View style={styles.termsItem}>
                <Text style={styles.termsBullet}>•</Text>
                <Text style={styles.termsText}>Rates and offers subject to change</Text>
              </View>
              <View style={styles.termsItem}>
                <Text style={styles.termsBullet}>•</Text>
                <Text style={styles.termsText}>See {offer.vendor} for full details</Text>
              </View>
            </View>
          </View>

          {/* Similar Offers Preview */}
          <View style={styles.section}>
            <View style={styles.similarHeader}>
              <Text style={styles.sectionTitle}>Similar Offers</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AddOffers')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.similarScroll}
            >
              {[1, 2, 3].map((item) => (
                <TouchableOpacity 
                  key={item} 
                  style={styles.similarCard}
                  onPress={() => navigation.navigate('AddOffers')}
                >
                  <LinearGradient
                    colors={['#667EEA', '#764BA2']}
                    style={styles.similarGradient}
                  >
                    <Text style={styles.similarCardTitle}>Quick Loan</Text>
                    <Text style={styles.similarCardDiscount}>Low APR</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={handleApply}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={offer.gradient || ['#667EEA', '#764BA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.applyGradient}
          >
            <Text style={styles.applyText}>Apply Now</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => Alert.alert('Contact', `Contacting ${offer.vendor}`)}
        >
          <Text style={styles.messageButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroCard: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  heroContent: {
    gap: 16,
  },
  vendorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vendorLogo: {
    fontSize: 40,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  usedText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  saveButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  discountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  offerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 36,
  },
  offerDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  expiryLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  expiryText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666666',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E5E5',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  featuresList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  termsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  termsItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  termsBullet: {
    fontSize: 16,
    color: '#667EEA',
    lineHeight: 20,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
  similarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '500',
  },
  similarScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  similarCard: {
    width: 140,
    height: 100,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  similarGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  similarCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  similarCardDiscount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  applyButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  messageButton: {
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
  },
});