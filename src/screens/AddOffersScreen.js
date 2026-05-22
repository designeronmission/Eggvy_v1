// src/screens/AddOffersScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const HEADER_HEIGHT = 60;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 47 : StatusBar.currentHeight || 0;

export default function AddOffersScreen({ navigation }) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('offers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const scrollViewRef = useRef(null);

  // Categories with icons matching our theme
  const categories = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'quick-loans', label: 'Loans', icon: 'attach-money' },
    { id: 'cash-advances', label: 'Advances', icon: 'trending-up' },
    { id: 'fuel', label: 'Fuel', icon: 'local-gas-station' },
    { id: 'telemedicine', label: 'Health', icon: 'medical-services' },
    { id: 'roadside', label: 'Roadside', icon: 'car-repair' },
    { id: 'electronics', label: 'Tech', icon: 'laptop' },
    { id: 'travel-insurance', label: 'Travel', icon: 'flight' },
    { id: 'shopping', label: 'Shop', icon: 'shopping-bag' },
    { id: 'dining', label: 'Dining', icon: 'restaurant' },
    { id: 'entertainment', label: 'Entertainment', icon: 'movie' },
  ];

  // Enhanced offers with better formatting
  const [offers] = useState([
    // Financial Offers
    {
      id: '1',
      title: 'Emergency Loan',
      description: 'Instant approval up to $5,000',
      discount: '5.99% APR',
      category: 'quick-loans',
      expiry: 'Limited time',
      vendor: 'QuickCash',
      vendorLogo: '💰',
      used: '1.2k',
      rating: 4.8,
      gradient: ['#ad5389', '#3c1053'], // Matching theme colors
      featured: true,
    },
    {
      id: '2',
      title: 'Salary Advance',
      description: 'Get 50% of salary early',
      discount: '0% Interest',
      category: 'cash-advances',
      expiry: 'Monthly',
      vendor: 'PayDay',
      vendorLogo: '💳',
      used: '3.4k',
      rating: 4.9,
      gradient: ['#3f2b96', '#4d6fc6'],
      featured: true,
    },
    {
      id: '3',
      title: 'Debt Consolidation',
      description: 'Combine debts into one payment',
      discount: 'Save 25%',
      category: 'quick-loans',
      expiry: 'Mar 30',
      vendor: 'ConsolidateNow',
      vendorLogo: '🔄',
      used: '892',
      rating: 4.7,
      gradient: ['#4568DC', '#B06AB3'],
    },
    {
      id: '4',
      title: 'Line of Credit',
      description: 'Flexible credit when you need it',
      discount: 'No Fees',
      category: 'quick-loans',
      expiry: 'Limited',
      vendor: 'FlexiCredit',
      vendorLogo: '💳',
      used: '1.5k',
      rating: 4.6,
      gradient: ['#11998e', '#148e43'],
    },

    // Fuel & Auto
    {
      id: '5',
      title: 'Shell Fuel Discount',
      description: '20¢ off per gallon',
      discount: '20¢ OFF',
      category: 'fuel',
      expiry: 'Apr 15',
      vendor: 'Shell',
      vendorLogo: '⛽',
      used: '5.2k',
      rating: 4.5,
      gradient: ['#FFD700', '#FFA500'],
    },
    {
      id: '6',
      title: 'Exxon Rewards+',
      description: 'Double points on fuel',
      discount: '2X Points',
      category: 'fuel',
      expiry: 'May 1',
      vendor: 'Exxon',
      vendorLogo: '🔰',
      used: '3.8k',
      rating: 4.7,
      gradient: ['#E31B23', '#B22222'],
    },

    // Health
    {
      id: '7',
      title: 'Doctor On Demand',
      description: 'Free virtual consultations',
      discount: 'FREE VISIT',
      category: 'telemedicine',
      expiry: 'Always',
      vendor: 'HealthFirst',
      vendorLogo: '🏥',
      used: '7.5k',
      rating: 4.9,
      gradient: ['#11998e', '#38ef7d'],
      featured: true,
    },
    {
      id: '8',
      title: 'Mental Health',
      description: '3 free therapy sessions',
      discount: '3 FREE',
      category: 'telemedicine',
      expiry: 'May 15',
      vendor: 'Talkspace',
      vendorLogo: '🧠',
      used: '1.8k',
      rating: 4.8,
      gradient: ['#8E2DE2', '#4A00E0'],
    },

    // Shopping
    {
      id: '9',
      title: 'Amazon Prime',
      description: '30-day free trial + $5 credit',
      discount: '$5 CREDIT',
      category: 'shopping',
      expiry: 'Always',
      vendor: 'Amazon',
      vendorLogo: '📦',
      used: '15.2k',
      rating: 5.0,
      gradient: ['#FF9900', '#FFB700'],
      featured: true,
    },
    {
      id: '10',
      title: 'Walmart+',
      description: '50% off annual membership',
      discount: '50% OFF',
      category: 'shopping',
      expiry: 'May 31',
      vendor: 'Walmart',
      vendorLogo: '🛒',
      used: '4.8k',
      rating: 4.6,
      gradient: ['#0071CE', '#004C8C'],
    },

    // Entertainment
    {
      id: '11',
      title: 'Netflix Premium',
      description: 'First 2 months half price',
      discount: '50% OFF',
      category: 'entertainment',
      expiry: 'Apr 20',
      vendor: 'Netflix',
      vendorLogo: '📺',
      used: '12.5k',
      rating: 4.8,
      gradient: ['#E50914', '#B20710'],
    },
    {
      id: '12',
      title: 'Spotify Student',
      description: 'Includes Hulu + SHOWTIME',
      discount: '$4.99/MO',
      category: 'entertainment',
      expiry: 'Always',
      vendor: 'Spotify',
      vendorLogo: '🎵',
      used: '9.7k',
      rating: 4.9,
      gradient: ['#1DB954', '#191414'],
    },

    // Dining
    {
      id: '13',
      title: 'Restaurant Cashback',
      description: '10% back at 500+ restaurants',
      discount: '10% BACK',
      category: 'dining',
      expiry: 'Monthly',
      vendor: 'Dining Rewards',
      vendorLogo: '🍽️',
      used: '8.3k',
      rating: 4.4,
      gradient: ['#FF512F', '#DD2476'],
    },

    // Travel
    {
      id: '14',
      title: 'Flight Discounts',
      description: '15% off domestic flights',
      discount: '15% OFF',
      category: 'travel-insurance',
      expiry: 'Jun 30',
      vendor: 'Delta',
      vendorLogo: '✈️',
      used: '6.7k',
      rating: 4.6,
      gradient: ['#003366', '#0066CC'],
    },
    {
      id: '15',
      title: 'Hotel Upgrade',
      description: 'Complimentary room upgrade',
      discount: 'UPGRADE',
      category: 'travel-insurance',
      expiry: 'Dec 31',
      vendor: 'Marriott',
      vendorLogo: '🏨',
      used: '3.1k',
      rating: 4.8,
      gradient: ['#662D8C', '#ED1E79'],
    },
  ]);

  // Filter offers based on category and search
  const filteredOffers = offers.filter(offer => {
    const matchesCategory = activeCategory === 'all' || offer.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured offers (top picks)
  const featuredOffers = offers.filter(offer => offer.featured);

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
      default:
        break;
    }
  };

  const handleOfferPress = (offer) => {
    navigation.navigate('OfferDetail', { offer });
  };

  const renderCategoryItem = (category) => {
    const isActive = activeCategory === category.id;
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryItem,
          isActive && styles.activeCategoryItem
        ]}
        onPress={() => setActiveCategory(category.id)}
        activeOpacity={0.7}
      >
        <Icon 
          name={category.icon} 
          size={20} 
          color={isActive ? '#FFF' : '#666'} 
        />
        <Text style={[
          styles.categoryText,
          isActive && styles.activeCategoryText
        ]}>
          {category.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderOfferCard = (offer) => {
    return (
      <TouchableOpacity
        key={offer.id}
        activeOpacity={0.9}
        onPress={() => handleOfferPress(offer)}
        style={styles.cardContainer}
      >
        <LinearGradient
          colors={offer.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Card Background Pattern */}
          <View style={styles.cardCircle1} />
          <View style={styles.cardCircle2} />
          
          <View style={styles.cardHeader}>
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorLogo}>{offer.vendorLogo}</Text>
              <View>
                <Text style={styles.vendorName}>{offer.vendor}</Text>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={12} color="#FFD700" />
                  <Text style={styles.ratingText}>{offer.rating}</Text>
                  <Text style={styles.usedText}> • {offer.used} used</Text>
                </View>
              </View>
            </View>
            <View style={styles.expiryBadge}>
              <Icon name="access-time" size={12} color="#FFF" />
              <Text style={styles.expiryText}>{offer.expiry}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{offer.discount}</Text>
            </View>
            <Text style={styles.cardTitle}>{offer.title}</Text>
            <Text style={styles.cardDescription}>{offer.description}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View Deal</Text>
              <Icon name="arrow-forward" size={16} color="#FFF" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderFeaturedCard = (offer) => {
    return (
      <TouchableOpacity
        key={offer.id}
        activeOpacity={0.9}
        onPress={() => handleOfferPress(offer)}
        style={styles.featuredCardContainer}
      >
        <LinearGradient
          colors={offer.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredCard}
        >
          <View style={styles.featuredCardContent}>
            <View>
              <View style={styles.featuredBadge}>
                <Icon name="stars" size={14} color="#FFD700" />
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
              <Text style={styles.featuredTitle}>{offer.title}</Text>
              <Text style={styles.featuredDescription}>{offer.description}</Text>
              <View style={styles.featuredFooter}>
                <Text style={styles.featuredDiscount}>{offer.discount}</Text>
                <View style={styles.featuredRating}>
                  <Icon name="star" size={14} color="#FFD700" />
                  <Text style={styles.featuredRatingText}>{offer.rating}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.featuredVendorLogo}>{offer.vendorLogo}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const handleBackPress = () => {
    navigation?.navigate?.('Dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <TopBar 
        title="Offers" 
        showBack={true} 
        onBackPress={handleBackPress}
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search offers, vendors..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Featured Section */}
        {activeCategory === 'all' && searchQuery === '' && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}> Featured Deals</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.featuredScroll}
            >
              {featuredOffers.map(renderFeaturedCard)}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map(renderCategoryItem)}
          </ScrollView>
        </View>

        {/* Offers Grid */}
        <View style={styles.offersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {filteredOffers.length} {activeCategory === 'all' ? 'All Offers' : categories.find(c => c.id === activeCategory)?.label}
            </Text>
            <TouchableOpacity style={styles.filterButton}>
              <Icon name="filter-list" size={20} color="#666" />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {filteredOffers.length > 0 ? (
            filteredOffers.map(renderOfferCard)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="search-off" size={60} color="#CCC" />
              <Text style={styles.emptyStateTitle}>No offers found</Text>
              <Text style={styles.emptyStateText}>Try adjusting your search or category</Text>
            </View>
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  featuredSection: {
    paddingTop: 20,
    paddingLeft: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#E56772',
    fontWeight: '600',
  },
  featuredScroll: {
    marginBottom: 10,
  },
  featuredCardContainer: {
    width: 280,
    height: 170,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  featuredCard: {
    flex: 1,
    padding: 20,
  },
  featuredCardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
  },
  featuredBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  featuredDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
    width: '70%',
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredDiscount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredRatingText: {
    color: '#FFF',
    fontSize: 12,
    marginLeft: 2,
  },
  featuredVendorLogo: {
    fontSize: 40,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoriesScroll: {
    marginTop: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
  },
  activeCategoryItem: {
    backgroundColor: '#E56772',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  activeCategoryText: {
    color: '#FFF',
  },
  offersSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  cardContainer: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  cardCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -30,
    right: -30,
  },
  cardCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -50,
    left: -50,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorLogo: {
    fontSize: 30,
    marginRight: 10,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 2,
    fontWeight: '600',
  },
  usedText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  expiryText: {
    fontSize: 11,
    color: '#FFF',
    marginLeft: 4,
  },
  cardBody: {
    flex: 1,
  },
  discountBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    marginBottom: 10,
  },
  discountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 15,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  spacer: {
    height: 20,
  },
});