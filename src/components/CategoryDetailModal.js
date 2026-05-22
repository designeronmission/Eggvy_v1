    // src/components/CategoryDetailModal.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const CategoryDetailModal = ({ 
  visible, 
  onClose, 
  category, 
  onEditBudget, 
  onDelete,
  formatCurrency,
  transactions = []
}) => {
  if (!category) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{category.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Category Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Budget</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(category.assigned || 0)}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Spent</Text>
                <Text style={[styles.statValue, styles.spentValue]}>
                  {formatCurrency(category.spent || 0)}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Left</Text>
                <Text
                  style={[
                    styles.statValue,
                    (category.remainingBalance || 0) >= 0
                      ? styles.positiveValue
                      : styles.negativeValue,
                  ]}>
                  {formatCurrency(category.remainingBalance || 0)}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>Progress</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        category.assigned > 0
                          ? Math.min(
                              ((category.spent || 0) / category.assigned) * 100,
                              100
                            )
                          : 0
                      }%`,
                      backgroundColor:
                        (category.spent || 0) > (category.assigned || 0) &&
                        category.assigned > 0
                          ? '#DC2626'
                          : '#3F2B96',
                    },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>Spent: {formatCurrency(category.spent || 0)}</Text>
                <Text style={styles.progressLabel}>
                  {Math.round(
                    category.assigned > 0
                      ? Math.min(
                          ((category.spent || 0) / category.assigned) * 100,
                          100
                        )
                      : 0
                  )}
                  %
                </Text>
              </View>
            </View>

            {/* Transactions List */}
            <View style={styles.transactionsSection}>
              <Text style={styles.sectionTitle}>Transactions</Text>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <View key={index} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <Text style={styles.transactionPayee}>{transaction.payee}</Text>
                      <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                    </View>
                    <Text style={styles.transactionAmount}>
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No transactions yet</Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => onEditBudget(category)}>
                <Icon name="edit-2" size={18} color="#3F2B96" />
                <Text style={styles.editButtonText}>Edit Budget</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(category.id)}>
                <Icon name="trash-2" size={18} color="#DC2626" />
                <Text style={styles.deleteButtonText}>Delete Category</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  spentValue: {
    color: '#DC2626',
  },
  positiveValue: {
    color: '#10B981',
  },
  negativeValue: {
    color: '#DC2626',
  },
  progressSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  transactionsSection: {
    marginBottom: 24,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionPayee: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F172A',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: '#64748B',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
    paddingVertical: 20,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#3F2B9620',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3F2B96',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#DC262620',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default CategoryDetailModal;