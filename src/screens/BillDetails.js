import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  SafeAreaView,
  Animated,
  Keyboard
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import TopBar from '../components/layout/TopBar';

const PRIMARY_COLOR = '#5F2B80';

export default function BillDetails({ route, navigation }) {
  const { bill } = route.params;
  const [currentBill, setCurrentBill] = useState(bill);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedAmount, setEditedAmount] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  // Refs for input focus
  const titleInputRef = useRef(null);
  const amountInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  // Animation for pulse effect
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Mock bill history data with more realistic entries
  const [billHistory] = useState([
    {
      action: 'Payment Made',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      amount: '$230.00',
      status: 'completed',
      method: 'Credit Card'
    },
    {
      action: 'Payment Received',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      amount: '$230.00',
      status: 'completed',
      method: 'Bank Transfer'
    },
    {
      action: 'Bill Created',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: '$230.00',
      status: 'completed',
      method: 'System'
    }
  ]);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    const numericValue = typeof amount === 'string' 
      ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) 
      : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(numericValue || 0);
  };

  // Helper function to calculate due status
  const getDueStatus = (dueDate) => {
    if (!dueDate) return 'Due in 7 days';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return 'Due in 7 days';
  };

  // Get badge style based on status
  const getBadgeStyle = (status) => {
    if (status === 'Today' || status === 'Overdue') {
      return [styles.statusBadge, { backgroundColor: '#DC2626' }];
    } else if (status === 'Tomorrow' || status?.includes('Due in')) {
      return [styles.statusBadge, { backgroundColor: '#FBBF24' }];
    } else if (status === 'Paid') {
      return [styles.statusBadge, { backgroundColor: '#10B981' }];
    }
    return [styles.statusBadge, { backgroundColor: '#94A3B8' }];
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format time for history with better formatting
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return `Today at ${date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })}`;
      } else if (diffDays === 1) {
        return `Yesterday at ${date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })}`;
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch (error) {
      return '';
    }
  };

  // Handle edit bill
  const handleEditBill = () => {
    setEditedTitle(currentBill.title || '');
    
    const numericValue = typeof currentBill.amount === 'string'
      ? currentBill.amount.replace(/[^0-9.-]+/g, '')
      : currentBill.amount?.toString() || '';
    setEditedAmount(numericValue);
    
    setEditedDescription(currentBill.description || currentBill.accountNumber || '');
    setIsEditing(true);
    
    // Focus on title input after edit mode is enabled
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  };

  // Handle save edited bill
  const handleSaveBill = () => {
    if (!editedTitle.trim()) {
      Alert.alert('Invalid Title', 'Please enter a bill title');
      titleInputRef.current?.focus();
      return;
    }

    const amount = parseFloat(editedAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      amountInputRef.current?.focus();
      return;
    }

    const formattedAmount = `$${amount.toFixed(2)}`;
    
    setCurrentBill({
      ...currentBill,
      title: editedTitle.trim(),
      amount: formattedAmount,
      description: editedDescription.trim() || currentBill.accountNumber
    });
    
    setIsEditing(false);
    Keyboard.dismiss();
    Alert.alert('Success', 'Bill updated successfully');
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    Keyboard.dismiss();
  };

  // Handle keyboard submit (tick button)
  const handleSubmitEditing = (field) => {
    if (field === 'title') {
      amountInputRef.current?.focus();
    } else if (field === 'amount') {
      descriptionInputRef.current?.focus();
    } else if (field === 'description') {
      handleSaveBill();
    }
  };

  // Handle delete bill
  const handleDeleteBill = () => {
    Alert.alert(
      'Delete Bill',
      `Are you sure you want to delete "${currentBill.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            Alert.alert('Success', 'Bill deleted successfully');
            navigation.goBack();
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Calculate summary stats
  const totalPayments = billHistory.length;
  const lastPayment = billHistory[0]?.amount || '$0.00';
  const onTimePercentage = '100%';

  return (
    <View style={styles.container}>
      <TopBar 
        title="Bill Details"
        showBack
        onBackPress={() => navigation.goBack()}
        backgroundColor="#FFFFFF"
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isEditing && { paddingBottom: 20 } // Remove extra padding for bottom buttons when editing
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconContainer}>
            <Feather name="file-text" size={32} color={PRIMARY_COLOR} />
          </View>
          <View style={styles.heroInfo}>
            <View style={styles.heroTitleRow}>
              {isEditing ? (
                <TextInput
                  ref={titleInputRef}
                  style={styles.editTitleInput}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  placeholder="Bill Title"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="next"
                  onSubmitEditing={() => handleSubmitEditing('title')}
                  blurOnSubmit={false}
                />
              ) : (
                <Text style={styles.heroTitle}>{currentBill.title}</Text>
              )}
              {!isEditing && (
                <View style={getBadgeStyle(currentBill.dueStatus || getDueStatus(currentBill.dueDate))}>
                  <Text style={styles.badgeText}>{currentBill.dueStatus || getDueStatus(currentBill.dueDate)}</Text>
                </View>
              )}
            </View>
            <View style={styles.heroAmountRow}>
              {isEditing ? (
                <View style={styles.editInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    ref={amountInputRef}
                    style={styles.editInput}
                    value={editedAmount}
                    onChangeText={setEditedAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="next"
                    onSubmitEditing={() => handleSubmitEditing('amount')}
                    blurOnSubmit={false}
                  />
                </View>
              ) : (
                <Text style={styles.heroAmount}>
                  {formatCurrency(currentBill.amount)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Edit Mode - Description Field */}
        {isEditing && (
          <View style={styles.editDescriptionContainer}>
            <Text style={styles.editLabel}>Description</Text>
            <TextInput
              ref={descriptionInputRef}
              style={styles.editDescriptionInput}
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Enter description"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={2}
              returnKeyType="done"
              onSubmitEditing={handleSaveBill}
              blurOnSubmit={false}
            />
          </View>
        )}

        {/* Edit Actions - Only show when editing */}
        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity 
              style={styles.editCancelButton} 
              onPress={handleCancelEdit}
            >
              <Text style={styles.editCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editSaveButton]} 
              onPress={handleSaveBill}
            >
              <Text style={styles.editSaveText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Enhanced Bill History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <View style={styles.historyHeaderLeft}>
              <View style={styles.historyIconContainer}>
                <Feather name="clock" size={18} color={PRIMARY_COLOR} />
              </View>
              <Text style={styles.historyTitle}>Payment History</Text>
            </View>
            <TouchableOpacity style={styles.historyFilterButton}>
              <Feather name="filter" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          {billHistory.length > 0 ? (
            <View style={styles.historyList}>
              {/* Summary Card */}
              <View style={styles.historySummaryCard}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Payments</Text>
                  <Text style={styles.summaryValue}>{totalPayments}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Last Payment</Text>
                  <Text style={styles.summaryValue}>{lastPayment}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>On Time</Text>
                  <View style={styles.onTimeBadge}>
                    <Text style={styles.onTimeText}>{onTimePercentage}</Text>
                  </View>
                </View>
              </View>

              {/* Timeline */}
              <View style={styles.timelineContainer}>
                <Text style={styles.timelineTitle}>Recent Activity</Text>
                
                {billHistory.map((item, index) => (
                  <View key={index} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineDot,
                        index === 0 && styles.timelineDotLatest
                      ]}>
                        {index === 0 && (
                          <Animated.View 
                            style={[
                              styles.timelinePulse,
                              { transform: [{ scale: pulseAnim }] }
                            ]} 
                          />
                        )}
                      </View>
                      {index < billHistory.length - 1 && <View style={styles.timelineLine} />}
                    </View>
                    
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Text style={styles.timelineAction}>{item.action}</Text>
                        <View style={styles.timelineBadge}>
                          <Text style={styles.timelineBadgeText}>
                            {index === 0 ? 'Latest' : `Event ${billHistory.length - index}`}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.timelineDetails}>
                        <View style={styles.timelineDetailItem}>
                          <Feather name="calendar" size={12} color="#94A3B8" />
                          <Text style={styles.timelineDetailText}>
                            {formatDateTime(item.date)}
                          </Text>
                        </View>
                        
                        <View style={styles.timelineDetailItem}>
                          <Feather name="dollar-sign" size={12} color="#94A3B8" />
                          <Text style={[
                            styles.timelineDetailText,
                            styles.timelineAmount
                          ]}>
                            {item.amount}
                          </Text>
                        </View>

                        {item.method && (
                          <View style={styles.timelineDetailItem}>
                            <Feather name="credit-card" size={12} color="#94A3B8" />
                            <Text style={styles.timelineDetailText}>
                              {item.method}
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Status Indicator */}
                      <View style={styles.timelineStatus}>
                        <View style={styles.statusIndicator}>
                          <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                          <Text style={styles.statusText}>Completed</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* View All Button */}
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View Full History</Text>
                <Feather name="chevron-right" size={16} color={PRIMARY_COLOR} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <View style={styles.emptyIconContainer}>
                <Feather name="clock" size={32} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>No History Yet</Text>
              <Text style={styles.emptyText}>
                Payment history will appear here once you make your first payment
              </Text>
            </View>
          )}
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsHeader}>
            <Feather name="info" size={18} color="#0F172A" />
            <Text style={styles.detailsTitle}>Bill Details</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Feather name="user" size={16} color="#64748B" />
                <Text style={styles.detailLabel}>Description</Text>
              </View>
              <Text style={styles.detailValue}>
                {currentBill.description || currentBill.accountNumber || 'No description'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Feather name="calendar" size={16} color="#64748B" />
                <Text style={styles.detailLabel}>Due Date</Text>
              </View>
              <Text style={styles.detailValue}>{formatDate(currentBill.dueDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Feather name="repeat" size={16} color="#64748B" />
                <Text style={styles.detailLabel}>Recurring</Text>
              </View>
              <Text style={styles.detailValue}>{currentBill.recurring ? 'Yes' : 'No'}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Feather name="folder" size={16} color="#64748B" />
                <Text style={styles.detailLabel}>Category</Text>
              </View>
              <Text style={styles.detailValue}>{currentBill.category || 'Uncategorized'}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabelContainer}>
                <Feather name="info" size={16} color="#64748B" />
                <Text style={styles.detailLabel}>Status</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: currentBill.paid ? '#10B981' : '#DC2626' }]} />
                <Text style={[styles.detailValue, { color: currentBill.paid ? '#10B981' : '#DC2626' }]}>
                  {currentBill.paid ? 'Paid' : 'Unpaid'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Buttons - Only show when not editing */}
      {!isEditing && (
        <SafeAreaView style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.bottomButton, styles.editButton]}
            onPress={handleEditBill}
          >
            <Text style={styles.bottomButtonText}>Edit Bill</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.bottomButton, styles.deleteButton]}
            onPress={handleDeleteBill}
          >
            <Text style={styles.bottomButtonText}>Delete Bill</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Hero Card
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroInfo: {
    flex: 1,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  editTitleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY_COLOR,
    paddingVertical: 4,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F172A',
  },
  // Edit Input
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: PRIMARY_COLOR,
    paddingBottom: 4,
    minWidth: 100,
  },
  currencySymbol: {
    fontSize: 16,
    color: PRIMARY_COLOR,
    marginRight: 4,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    padding: 0,
  },
  editDescriptionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editLabel: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  editDescriptionInput: {
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  // Edit Actions
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  editCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  editCancelText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  editSaveButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
  },
  editSaveText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  // History Section - Enhanced
  historySection: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  historyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  historyFilterButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  // Summary Card
  historySummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 5,
    marginTop: 16,
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  onTimeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  onTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  // Timeline
  timelineContainer: {
    paddingHorizontal: 16,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY_COLOR,
    borderWidth: 2,
    borderColor: '#F3E8FF',
    zIndex: 2,
  },
  timelineDotLatest: {
    backgroundColor: '#10B981',
    borderColor: '#D1FAE5',
    position: 'relative',
  },
  timelinePulse: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 14,
    backgroundColor: '#10B981',
    opacity: 0.3,
  },
  timelineLine: {
    position: 'absolute',
    top: 12,
    left: 11,
    width: 2,
    height: 45,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timelineAction: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  timelineBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 8,
  },
  timelineBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
  },
  timelineDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  timelineDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timelineDetailText: {
    fontSize: 12,
    color: '#64748B',
  },
  timelineAmount: {
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  timelineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
  // View All Button
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  // Empty State
  emptyHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Details Section
  detailsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
    marginLeft: 8,
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
    maxWidth: '90%',
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  // Bottom Fixed Buttons
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    gap: 12,
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});