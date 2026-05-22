// src/screens/TagManagementScreen.js
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
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

  const { width } = Dimensions.get('window');

const TagManagementScreen = () => {
  const navigation = useNavigation();
  const [bottomNavActive, setBottomNavActive] = useState('insights');
  const [refreshing, setRefreshing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Tags Data
  const [tags, setTags] = useState([
    {
      id: '1',
      name: 'Grocery Shopping',
      type: 'debit',
      description: 'Weekly grocery and household items',
      date: '2025-09-15',
      amount: 156.32,
    },
    {
      id: '2',
      name: 'Salary Deposit',
      type: 'credit',
      description: 'Monthly salary from employer',
      date: '2025-09-01',
      amount: 4250.00,
    },
    {
      id: '3',
      name: 'Netflix Subscription',
      type: 'debit',
      description: 'Monthly streaming service',
      date: '2025-09-10',
      amount: 15.99,
    },
    {
      id: '4',
      name: 'Freelance Payment',
      type: 'credit',
      description: 'Web development project',
      date: '2025-09-05',
      amount: 750.00,
    },
    {
      id: '5',
      name: 'Restaurant Dinner',
      type: 'debit',
      description: 'Dinner with friends',
      date: '2025-09-12',
      amount: 89.50,
    },
    {
      id: '6',
      name: 'Investment Return',
      type: 'credit',
      description: 'Stock dividends',
      date: '2025-09-08',
      amount: 125.75,
    },
    {
      id: '7',
      name: 'Gym Membership',
      type: 'debit',
      description: 'Monthly fitness center',
      date: '2025-09-03',
      amount: 49.99,
    },
  ]);

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
      insights: 'Insights',
    };
    if (navigationMap[tabId]) {
      navigation.navigate(navigationMap[tabId]);
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getTypeColor = (type) => {
    return type === 'credit' ? '#10B981' : '#EF4444';
  };

  const getTypeIcon = (type) => {
    return type === 'credit' ? 'arrow-up' : 'arrow-down';
  };

  const handleEditTag = (tag) => {
    setShowActionMenu(null);
    setEditingTag({ ...tag });
    setShowEditModal(true);
  };

  const handleDeleteTag = (tag) => {
    setShowActionMenu(null);
    Alert.alert(
      'Delete Tag',
      `Are you sure you want to delete "${tag.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            setTags(tags.filter(t => t.id !== tag.id));
            Alert.alert('Success', 'Tag deleted successfully');
          },
          style: 'destructive' 
        },
      ]
    );
  };

  const handleSaveEdit = () => {
    if (!editingTag.name.trim()) {
      Alert.alert('Error', 'Tag name is required');
      return;
    }

    if (editingTag.id) {
      setTags(tags.map(tag => tag.id === editingTag.id ? editingTag : tag));
    } else {
      setTags([{ ...editingTag, id: Date.now().toString() }, ...tags]);
    }
    setShowEditModal(false);
    setEditingTag(null);
    Alert.alert('Success', editingTag.id ? 'Tag updated successfully' : 'Tag added successfully');
  };

  const handleAddNewTag = () => {
    setEditingTag({
      name: '',
      type: 'debit',
      description: '',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
    });
    setShowEditModal(true);
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Action Menu Modal
  const renderActionMenu = () => (
    <Modal
      visible={showActionMenu !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setShowActionMenu(null)}>
      <TouchableOpacity 
        style={styles.actionMenuOverlay} 
        activeOpacity={1} 
        onPress={() => setShowActionMenu(null)}>
        <View style={styles.actionMenuContainer}>
          <View style={styles.actionMenu}>
            <TouchableOpacity 
              style={styles.actionMenuItem} 
              onPress={() => handleEditTag(showActionMenu)}>
              <Icon name="edit-2" size={18} color="#3F2B96" />
              <Text style={styles.actionMenuText}>Edit Tag</Text>
            </TouchableOpacity>
            <View style={styles.actionMenuDivider} />
            <TouchableOpacity 
              style={[styles.actionMenuItem, styles.actionMenuDelete]} 
              onPress={() => handleDeleteTag(showActionMenu)}>
              <Icon name="trash-2" size={18} color="#EF4444" />
              <Text style={[styles.actionMenuText, styles.actionMenuDeleteText]}>Delete Tag</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Edit/Add Modal
  const renderEditModal = () => (
    <Modal 
      visible={showEditModal} 
      transparent 
      animationType="slide" 
      onRequestClose={() => {
        setShowEditModal(false);
        setEditingTag(null);
      }}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingTag?.id ? 'Edit Tag' : 'Add New Tag'}
            </Text>
            <TouchableOpacity onPress={() => {
              setShowEditModal(false);
              setEditingTag(null);
            }}>
              <Icon name="x" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tag Name</Text>
              <TextInput
                style={styles.input}
                value={editingTag?.name}
                onChangeText={(text) => setEditingTag({ ...editingTag, name: text })}
                placeholder="Enter tag name"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    editingTag?.type === 'credit' && styles.typeOptionCreditActive
                  ]}
                  onPress={() => setEditingTag({ ...editingTag, type: 'credit' })}>
                  <Icon name="arrow-up" size={16} color={editingTag?.type === 'credit' ? '#10B981' : '#64748B'} />
                  <Text style={[styles.typeOptionText, editingTag?.type === 'credit' && { color: '#10B981' }]}>
                    Credit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    editingTag?.type === 'debit' && styles.typeOptionDebitActive
                  ]}
                  onPress={() => setEditingTag({ ...editingTag, type: 'debit' })}>
                  <Icon name="arrow-down" size={16} color={editingTag?.type === 'debit' ? '#EF4444' : '#64748B'} />
                  <Text style={[styles.typeOptionText, editingTag?.type === 'debit' && { color: '#EF4444' }]}>
                    Debit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.input}
                value={editingTag?.amount?.toString()}
                onChangeText={(text) => setEditingTag({ ...editingTag, amount: parseFloat(text) || 0 })}
                placeholder="Enter amount"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editingTag?.description}
                onChangeText={(text) => setEditingTag({ ...editingTag, description: text })}
                placeholder="Enter description"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={editingTag?.date}
                onChangeText={(text) => setEditingTag({ ...editingTag, date: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={() => {
                setShowEditModal(false);
                setEditingTag(null);
              }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]} 
              onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Small Tag Card Component
  const TagCard = ({ tag }) => (
    <View style={styles.tagCard}>
      <View style={styles.cardLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${getTypeColor(tag.type)}10` }]}>
          <Icon name={getTypeIcon(tag.type)} size={20} color={getTypeColor(tag.type)} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.tagName}>{tag.name}</Text>
          <Text style={styles.description} numberOfLines={1}>{tag.description}</Text>
          <Text style={styles.date}>{formatDate(tag.date)}</Text>
        </View>
      </View>
      
      <View style={styles.cardRight}>
        <Text style={[styles.amount, { color: getTypeColor(tag.type) }]}>
          {tag.type === 'credit' ? '+' : '-'}{formatCurrency(tag.amount)}
        </Text>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setShowActionMenu(tag)}>
          <Icon name="more-vertical" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <TopBar title="Tag Management" showBack={true} />

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tags..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="x" size={20} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNewTag}>
          <Icon name="plus" size={24} color="#3F2B96" />
        </TouchableOpacity>
      </View>

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

        <View style={styles.tagsList}>
          {filteredTags.length > 0 ? (
            filteredTags.map(tag => <TagCard key={tag.id} tag={tag} />)
          ) : (
            <View style={styles.emptyState}>
              <Icon name="tag" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Tags Found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Try a different search' : 'Tap the + button to add a tag'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {renderActionMenu()}
      {renderEditModal()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tagCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  tagName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  date: {
    fontSize: 11,
    color: '#94A3B8',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuButton: {
    padding: 4,
  },
  // Action Menu
  actionMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionMenuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  actionMenu: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  actionMenuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  actionMenuDelete: {
    marginTop: 0,
  },
  actionMenuText: {
    fontSize: 16,
    color: '#0F172A',
  },
  actionMenuDeleteText: {
    color: '#EF4444',
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  typeOptionCreditActive: {
    borderColor: '#10B981',
    backgroundColor: '#10B98110',
    borderWidth: 2,
  },
  typeOptionDebitActive: {
    borderColor: '#EF4444',
    backgroundColor: '#EF444410',
    borderWidth: 2,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    backgroundColor: '#3F2B96',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 80,
  },
});

export default TagManagementScreen;