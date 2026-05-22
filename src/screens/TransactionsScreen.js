// src/screens/TransactionsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

const TransactionsScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [categories, setCategories] = useState([]);

  // Load transactions from storage
  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  // Refresh when screen focuses
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions();
      loadCategories();
    });
    return unsubscribe;
  }, [navigation]);

  const loadTransactions = async () => {
    try {
      const stored = await AsyncStorage.getItem('transactions');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTransactions(parsed);
        applyFilters(parsed, selectedCategory, searchQuery);
      } else {
        setTransactions([]);
        setFilteredTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem('budget_data');
      if (stored) {
        const budgetData = JSON.parse(stored);
        const cats = [];
        Object.keys(budgetData).forEach(groupKey => {
          budgetData[groupKey].categories.forEach(cat => {
            cats.push({
              id: cat.id,
              name: cat.name,
              group: budgetData[groupKey].name,
              color: budgetData[groupKey].color
            });
          });
        });
        setCategories(cats);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

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
        navigation.navigate('Offers');
        break;
      default:
        break;
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.color : '#64748B';
  };

  const applyFilters = (transList, category, query) => {
    let filtered = [...transList];
    
    if (category !== 'all') {
      filtered = filtered.filter(t => t.categoryId === category);
    }
    
    if (query.trim()) {
      filtered = filtered.filter(t => 
        t.payee.toLowerCase().includes(query.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredTransactions(filtered);
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    applyFilters(transactions, categoryId, searchQuery);
    setShowFilterModal(false);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(transactions, selectedCategory, text);
  };

  const handleDeleteTransaction = (transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete this transaction to ${transaction.payee}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove from transactions
              const updatedTransactions = transactions.filter(t => t.id !== transaction.id);
              await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
              
              // Update category available amount
              const budgetData = await AsyncStorage.getItem('budget_data');
              if (budgetData) {
                const parsed = JSON.parse(budgetData);
                Object.keys(parsed).forEach(groupKey => {
                  const group = parsed[groupKey];
                  const catIndex = group.categories.findIndex(c => c.id === transaction.categoryId);
                  if (catIndex !== -1) {
                    group.categories[catIndex].available += transaction.amount;
                    group.categories[catIndex].activity += transaction.amount;
                  }
                });
                await AsyncStorage.setItem('budget_data', JSON.stringify(parsed));
              }
              
              setTransactions(updatedTransactions);
              applyFilters(updatedTransactions, selectedCategory, searchQuery);
              Alert.alert('Success', 'Transaction deleted successfully');
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          }
        }
      ]
    );
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionLeft}>
          <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.categoryId) }]} />
          <View>
            <Text style={styles.payeeName}>{item.payee}</Text>
            <Text style={styles.categoryName}>{getCategoryName(item.categoryId)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDeleteTransaction(item)}>
          <Icon name="trash-2" size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={14} color="#64748B" />
          <Text style={styles.detailText}>{formatDate(item.date)}</Text>
        </View>
        <Text style={[styles.amount, { color: item.type === 'expense' ? '#DC2626' : '#34C759' }]}>
          {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
        </Text>
      </View>
      
      {item.notes ? (
        <View style={styles.notesContainer}>
          <Icon name="file-text" size={14} color="#64748B" />
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      ) : null}
      
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TopBar 
        title="Transactions" 
        showBack={true} 
        onBackPress={handleBackPress}
      />

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Icon name="x" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity 
          style={[styles.filterButton, selectedCategory !== 'all' && styles.filterButtonActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon 
            name="filter" 
            size={18} 
            color={selectedCategory !== 'all' ? '#0A84FF' : '#64748B'} 
          />
        </TouchableOpacity>
      </View>

      {/* Filter Indicator */}
      {selectedCategory !== 'all' && (
        <View style={styles.activeFilter}>
          <Text style={styles.activeFilterText}>
            Filtering by: {getCategoryName(selectedCategory)}
          </Text>
          <TouchableOpacity onPress={() => handleCategoryFilter('all')}>
            <Icon name="x" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      )}

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Icon name="list" size={48} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>No Transactions</Text>
          <Text style={styles.emptyDescription}>
            {transactions.length === 0 
              ? "You haven't added any transactions yet. Tap the + button on the Budget screen to add your first transaction."
              : "No transactions match your search criteria."}
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Category</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <TouchableOpacity 
                style={[styles.filterOption, selectedCategory === 'all' && styles.filterOptionSelected]}
                onPress={() => handleCategoryFilter('all')}
              >
                <Text style={styles.filterOptionText}>All Categories</Text>
                {selectedCategory === 'all' && <Icon name="check" size={18} color="#0A84FF" />}
              </TouchableOpacity>
              
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat.id}
                  style={[styles.filterOption, selectedCategory === cat.id && styles.filterOptionSelected]}
                  onPress={() => handleCategoryFilter(cat.id)}
                >
                  <View style={styles.filterOptionLeft}>
                    <View style={[styles.filterDot, { backgroundColor: cat.color || '#0A84FF' }]} />
                    <View>
                      <Text style={styles.filterOptionText}>{cat.name}</Text>
                      <Text style={styles.filterGroupText}>{cat.group}</Text>
                    </View>
                  </View>
                  {selectedCategory === cat.id && <Icon name="check" size={18} color="#0A84FF" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BottomNav activeTab="budget" onTabPress={handleTabPress} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    padding: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#E8F1FF',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeFilterText: {
    fontSize: 13,
    color: '#0A84FF',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  payeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  categoryName: {
    fontSize: 13,
    color: '#64748B',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#64748B',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  notesText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterOptionSelected: {
    backgroundColor: '#F8FAFC',
  },
  filterOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterOptionText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  filterGroupText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});

export default TransactionsScreen;