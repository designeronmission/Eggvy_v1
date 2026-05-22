import React, { useRef, useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  AppState
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = 222;
const CARD_HEIGHT = 143;
const CARD_GAP = 16;
const MODAL_CARD_HEIGHT = height * 0.8;

// Mock Data - Local accounts data
const MOCK_ACCOUNTS = [
  {
    _id: '1',
    title: 'Premium Savings',
    account: 'Savings Account',
    balance: '$45,678.90',
    accountType: 'Savings Account',
    accountNumber: '**** **** **** 4589',
    cardHolder: 'JOHN SMITH',
    expiryDate: '12/25',
    colors: ['#ad5389', '#3c1053'],
    availableBalance: '$45,678.90',
    currency: 'USD',
    routingNumber: '021000021',
    swiftCode: 'BOFAUS3N',
    interestRate: '2.5% APR',
    openedDate: '2023-01-15',
    transactions: [
      {
        id: 't1',
        description: 'Walmart',
        date: '2024-01-15',
        amount: '-$234.56',
        status: 'Completed'
      },
      {
        id: 't2',
        description: 'Salary Deposit',
        date: '2024-01-14',
        amount: '+$5,000.00',
        status: 'Completed'
      },
      {
        id: 't3',
        description: 'Netflix Subscription',
        date: '2024-01-13',
        amount: '-$15.99',
        status: 'Pending'
      },
      {
        id: 't4',
        description: 'Transfer to Savings',
        date: '2024-01-12',
        amount: '-$500.00',
        status: 'Completed'
      }
    ]
  },
  {
    _id: '2',
    title: 'Business Checking',
    account: 'Business Account',
    balance: '$128,450.25',
    accountType: 'Business Checking',
    accountNumber: '**** **** **** 7821',
    cardHolder: 'JOHN SMITH',
    expiryDate: '09/24',
    colors: ['#090f38', '#05033e'],
    availableBalance: '$125,000.25',
    currency: 'USD',
    routingNumber: '026009593',
    swiftCode: 'WFBIUS6S',
    interestRate: '0.1% APR',
    openedDate: '2022-06-20',
    transactions: [
      {
        id: 't5',
        description: 'Client Payment - ABC Corp',
        date: '2024-01-15',
        amount: '+$15,000.00',
        status: 'Completed'
      },
      {
        id: 't6',
        description: 'Office Rent',
        date: '2024-01-14',
        amount: '-$3,500.00',
        status: 'Completed'
      },
      {
        id: 't7',
        description: 'Software Subscription',
        date: '2024-01-13',
        amount: '-$299.99',
        status: 'Completed'
      },
      {
        id: 't8',
        description: 'Payroll Transfer',
        date: '2024-01-12',
        amount: '-$8,500.00',
        status: 'Completed'
      }
    ]
  },
  {
    _id: '3',
    title: 'Student Account',
    account: 'Student Checking',
    balance: '$2,350.80',
    accountType: 'Student Account',
    accountNumber: '**** **** **** 1234',
    cardHolder: 'JOHN SMITH',
    expiryDate: '03/26',
    colors: ['#022d23', '#1a5966'],
    availableBalance: '$2,350.80',
    currency: 'USD',
    routingNumber: '121000248',
    swiftCode: 'CHASUS33',
    interestRate: '0.01% APR',
    openedDate: '2023-08-10',
    transactions: [
      {
        id: 't9',
        description: 'Bookstore',
        date: '2024-01-15',
        amount: '-$125.50',
        status: 'Completed'
      },
      {
        id: 't10',
        description: 'Allowance Transfer',
        date: '2024-01-14',
        amount: '+$500.00',
        status: 'Completed'
      },
      {
        id: 't11',
        description: 'Coffee Shop',
        date: '2024-01-13',
        amount: '-$8.75',
        status: 'Completed'
      },
      {
        id: 't12',
        description: 'Spotify',
        date: '2024-01-12',
        amount: '-$9.99',
        status: 'Pending'
      }
    ]
  },
  {
    _id: '4',
    title: 'Travel Rewards',
    account: 'Credit Card',
    balance: '$2,150.45',
    accountType: 'Credit Card',
    accountNumber: '**** **** **** 5678',
    cardHolder: 'JOHN SMITH',
    expiryDate: '07/25',
    colors: ['#2b5876', '#4e4376'],
    availableBalance: '$7,850.00',
    currency: 'USD',
    routingNumber: 'N/A',
    swiftCode: 'CITIUS33',
    interestRate: '18.5% APR',
    openedDate: '2023-03-05',
    transactions: [
      {
        id: 't13',
        description: 'Flight Tickets',
        date: '2024-01-15',
        amount: '-$650.00',
        status: 'Completed'
      },
      {
        id: 't14',
        description: 'Hotel Booking',
        date: '2024-01-14',
        amount: '-$320.50',
        status: 'Pending'
      },
      {
        id: 't15',
        description: 'Restaurant',
        date: '2024-01-13',
        amount: '-$78.90',
        status: 'Completed'
      },
      {
        id: 't16',
        description: 'Points Redemption',
        date: '2024-01-12',
        amount: '+$50.00',
        status: 'Completed'
      }
    ]
  }
];

const AccountCards = () => {
  const scrollViewRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // ============= MOCK DATA FUNCTIONS =============

  // Simulate fetching accounts with loading state
  const fetchAccounts = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('📦 Loading mock accounts:', MOCK_ACCOUNTS.length, 'accounts');
      setCards(MOCK_ACCOUNTS);
      
    } catch (err) {
      console.error('❌ Error loading accounts:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Get fresh card data (simulates API call)
  const getFreshCardData = (cardId) => {
    return cards.find(card => card._id === cardId) || null;
  };

  // Close modal function
  const closeModal = () => {
    setModalVisible(false);
    setSelectedCard(null);
  };

  // Open card details with fresh data
  const openCardDetails = (card) => {
    console.log('Opening card details for:', card.title);
    
    // Get fresh data (simulates API call)
    const freshCard = getFreshCardData(card._id);
    setSelectedCard(freshCard || card);
    setModalVisible(true);
  };

  // Handle scroll
  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
    setActiveIndex(index);
  };

  const scrollToIndex = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * (CARD_WIDTH + CARD_GAP),
        animated: true,
      });
      setActiveIndex(index);
    }
  };

  // Pull to refresh - simulate refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccounts(false);
  };

  // Simulate real-time updates (optional)
  useEffect(() => {
    // This simulates occasional updates to show the reactive nature
    // Comment out if not needed
    const interval = setInterval(() => {
      // Randomly update a transaction to simulate real-time changes
      // This is optional and can be removed
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Initial load
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Render detailed card modal
  const renderDetailedCard = () => {
    if (!selectedCard) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.backButton} onPress={closeModal}>
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Account Details</Text>
            <View style={styles.placeholderButton} />
          </View>

          <View style={styles.detailedCardWrapper}>
            <LinearGradient
              colors={selectedCard.colors || ['#ad5389', '#3c1053']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.detailedCard}
            >
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.detailedCardContent}
              >
                {/* Card Front Section */}
                <View style={styles.cardFrontSection}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{selectedCard.title}</Text>
                    <View style={styles.bankLogo}>
                      <Text style={styles.bankLogoText}>BANK</Text>
                    </View>
                  </View>

                  <Text style={styles.cardAccount}>{selectedCard.account}</Text>
                  <Text style={styles.cardBalance}>{selectedCard.balance}</Text>

                  <View style={styles.divider} />

                  <Text style={styles.accountType}>{selectedCard.accountType}</Text>
                  <Text style={styles.cardNumber}>{selectedCard.accountNumber}</Text>

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.cardLabel}>CARD HOLDER</Text>
                      <Text style={styles.cardValue}>{selectedCard.cardHolder}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardLabel}>EXPIRES</Text>
                      <Text style={styles.cardValue}>{selectedCard.expiryDate}</Text>
                    </View>
                  </View>
                </View>

                {/* Account Summary Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Account Summary</Text>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Available Balance</Text>
                      <Text style={styles.infoValue}>{selectedCard.availableBalance || selectedCard.balance}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Account Type</Text>
                      <Text style={styles.infoValue}>{selectedCard.accountType}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Currency</Text>
                      <Text style={styles.infoValue}>{selectedCard.currency || 'USD'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Routing Number</Text>
                      <Text style={styles.infoValue}>{selectedCard.routingNumber}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>SWIFT Code</Text>
                      <Text style={styles.infoValue}>{selectedCard.swiftCode}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Interest Rate</Text>
                      <Text style={styles.infoValue}>{selectedCard.interestRate}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Opened Date</Text>
                      <Text style={styles.infoValue}>
                        {selectedCard.openedDate ? new Date(selectedCard.openedDate).toLocaleDateString() : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Recent Transactions Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Recent Transactions</Text>
                  {selectedCard.transactions && selectedCard.transactions.length > 0 ? (
                    selectedCard.transactions.map((tx, index) => (
                      <View key={tx.id || index} style={styles.transactionItem}>
                        <View style={styles.transactionLeft}>
                          <View style={styles.transactionIcon}>
                            <Icon 
                              name={tx.amount && tx.amount.includes('+') ? 'call-received' : 'call-made'} 
                              size={16} 
                              color={tx.amount && tx.amount.includes('+') ? '#4CAF50' : '#FF5252'} 
                            />
                          </View>
                          <View style={styles.transactionDetails}>
                            <Text style={styles.transactionDesc}>{tx.description}</Text>
                            <Text style={styles.transactionDate}>{tx.date}</Text>
                          </View>
                        </View>
                        <View style={styles.transactionRight}>
                          <Text style={[
                            styles.transactionAmount,
                            tx.amount && tx.amount.includes('+') ? styles.positiveAmount : styles.negativeAmount
                          ]}>
                            {tx.amount}
                          </Text>
                          <Text style={styles.transactionStatus}>{tx.status}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noTransactions}>No transactions yet</Text>
                  )}
                </View>

                {/* Quick Actions Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
                    >
                      <Feather name="send" size={20} color="#FFF" />
                      <Text style={styles.actionText}>Send</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
                    >
                      <Feather name="download" size={20} color="#FFF" />
                      <Text style={styles.actionText}>Receive</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon!')}
                    >
                      <Feather name="refresh-cw" size={20} color="#FFF" />
                      <Text style={styles.actionText}>Transfer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={{ height: 30 }} />
              </ScrollView>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading your accounts...</Text>
      </View>
    );
  }

  // Empty state (shouldn't happen with mock data, but keeping for safety)
  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="account-balance" size={50} color="#999" />
        <Text style={styles.emptyText}>No accounts found</Text>
        <Text style={styles.emptySubText}>Pull down to refresh</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main render
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsWrapper}
        onMomentumScrollEnd={handleScrollEnd}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
      >
        {cards.map((card) => (
          <TouchableOpacity
            key={card._id}
            activeOpacity={0.9}
            onPress={() => openCardDetails(card)}
          >
            <LinearGradient
              colors={card.colors || ['#ad5389', '#3c1053']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Decorative circles */}
              <View style={styles.circleTopRight}>
                <View style={[styles.circle, {
                  borderWidth: 21,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  width: 98,
                  height: 98
                }]} />
              </View>

              <View style={styles.circleBottomLeft}>
                <View style={[styles.circle, {
                  borderWidth: 21,
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                  width: 124,
                  height: 124
                }]} />
              </View>

              {/* Icons */}
              <View style={styles.iconGroup}>
                <View style={styles.iconContainer}>
                  <Entypo name="star" size={10} color="#FFF" style={{ opacity: 0.5 }} />
                  <Entypo name="star" size={6} color="#FFF" style={{ opacity: 0.39, marginLeft: 8 }} />
                </View>
                <View style={styles.iconContainer}>
                  <Entypo name="triangle-up" size={8} color="#FFF" style={{ opacity: 0.5 }} />
                  <Entypo name="triangle-down" size={6} color="#FFF" style={{ opacity: 0.39, marginLeft: 10 }} />
                </View>
                <View style={[styles.largeCircle, { backgroundColor: 'rgba(255, 255, 255, 0.19)' }]} />
              </View>

              {/* Card content */}
              <Text style={styles.cardTitleSmall}>{card.title}</Text>
              <Text style={styles.cardAccountSmall}>{card.account}</Text>
              <Text style={styles.cardBalanceSmall}>Balance: {card.balance}</Text>
              <Text style={styles.cardHolderSmall}>{card.cardHolder}</Text>

              <View style={styles.cardButton}>
                <Text style={styles.cardButtonText}>View Account</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Page indicators */}
      <View style={styles.carouselIndicators}>
        {cards.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToIndex(index)}
            style={[
              styles.dotIndicator,
              activeIndex === index && styles.dotIndicatorActive,
            ]}
          />
        ))}
      </View>

      {/* Detailed card modal */}
      {renderDetailedCard()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
  },
  emptySubText: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
  },
  cardsWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  circleTopRight: {
    position: 'absolute',
    left: 158,
    top: -29,
  },
  circleBottomLeft: {
    position: 'absolute',
    left: -48,
    top: 76,
  },
  circle: {
    borderRadius: 50,
    borderStyle: 'solid',
  },
  iconGroup: {
    position: 'absolute',
    left: 185,
    top: 8,
    width: 30,
    height: 26,
    alignItems: 'flex-end',
  },
  iconContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  largeCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
  cardTitleSmall: {
    position: 'absolute',
    left: 9,
    top: 20,
    width: 178,
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardAccountSmall: {
    position: 'absolute',
    left: 10,
    top: 40,
    width: 178,
    color: '#e1e1e1',
    fontSize: 8,
    fontWeight: '500',
  },
  cardBalanceSmall: {
    position: 'absolute',
    left: 10,
    top: 55,
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardHolderSmall: {
    position: 'absolute',
    left: 10,
    top: 70,
    color: 'white',
    fontSize: 8,
    opacity: 0.8,
  },
  cardButton: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -69.5 }],
    top: 95,
    width: 139,
    height: 27,
    borderRadius: 3,
    borderWidth: 0.4,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  cardButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  dotIndicatorActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#373737',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 40,
    height: 40,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailedCardWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  detailedCard: {
    width: '100%',
    height: MODAL_CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
  },
  detailedCardContent: {
    padding: 20,
  },
  cardFrontSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bankLogo: {
    width: 50,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankLogoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardAccount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 5,
  },
  cardBalance: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 15,
  },
  accountType: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 5,
  },
  cardNumber: {
    color: 'white',
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 20,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
    marginBottom: 2,
  },
  cardValue: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoGrid: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  infoValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDesc: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionDate: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#FF5252',
  },
  transactionStatus: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
    marginTop: 2,
  },
  noTransactions: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 80,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
});

export default AccountCards;