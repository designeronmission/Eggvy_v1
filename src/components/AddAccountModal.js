// src/components/AddAccountModal.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AddAccountModal = ({ visible, onClose, onAddAccount }) => {
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('checking');
  const [openingBalance, setOpeningBalance] = useState('');
  const [openingDate, setOpeningDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [step, setStep] = useState(1); // 1: account details, 2: initial balance
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const scrollViewRef = useRef(null);

  // Modern account types with trendy icons
  const accountTypes = [
    { 
      id: 'checking', 
      name: 'Checking', 
      icon: 'credit-card',
      bgColor: '#E3F2FD',
      iconColor: '#1976D2',
      description: 'Everyday spending'
    },
    { 
      id: 'savings', 
      name: 'Savings', 
      icon: 'trending-up',
      bgColor: '#E8F5E9',
      iconColor: '#2E7D32',
      description: 'Save for goals'
    },
    { 
      id: 'cash', 
      name: 'Cash', 
      icon: 'dollar-sign',
      bgColor: '#FFF3E0',
      iconColor: '#F57C00',
      description: 'Physical currency'
    },
    { 
      id: 'credit', 
      name: 'Credit Card', 
      icon: 'zap',
      bgColor: '#FFEBEE',
      iconColor: '#C62828',
      description: 'Track payments'
    },
  ];

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setKeyboardOffset(40); // Small offset to adjust for keyboard
        // Scroll to the balance input when keyboard appears
        if (step === 2 && scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current.scrollTo({ y: 200, animated: true });
          }, 100);
        }
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardOffset(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [step]);

  const handleNext = () => {
    if (step === 1) {
      if (!accountName.trim()) {
        Alert.alert('Error', 'Please enter an account name');
        return;
      }
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onClose();
    }
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (!openingBalance || parseFloat(openingBalance) <= 0) {
      Alert.alert('Error', 'Please enter a valid opening balance');
      return;
    }

    const newAccount = {
      id: Date.now().toString(),
      name: accountName,
      type: accountType,
      balance: parseFloat(openingBalance),
      openingDate: openingDate.toISOString(),
      isManual: true
    };

    onAddAccount(newAccount, parseFloat(openingBalance));
    
    // Reset form
    setAccountName('');
    setAccountType('checking');
    setOpeningBalance('');
    setOpeningDate(new Date());
    setStep(1);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `$${num.toFixed(2)}`;
  };

  const handleBalanceChange = (text) => {
    // Remove non-numeric characters except decimal
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimals
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;
    setOpeningBalance(cleaned);
  };

  const selectedType = accountTypes.find(t => t.id === accountType);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setOpeningDate(selectedDate);
    }
  };

  const handleBalanceFocus = () => {
    // Scroll to the balance input when it receives focus
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollTo({ y: 200, animated: true });
      }, 100);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { marginBottom: Platform.OS === 'ios' ? keyboardOffset : 0 }
          ]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack}>
                <Icon name="arrow-left" size={24} color="#0F172A" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {step === 1 ? 'Add Account' : 'Opening Balance'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="x" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
                <Text style={[styles.progressStepText, step >= 1 && styles.progressStepTextActive]}>1</Text>
              </View>
              <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
              <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
                <Text style={[styles.progressStepText, step >= 2 && styles.progressStepTextActive]}>2</Text>
              </View>
            </View>

            <ScrollView 
              ref={scrollViewRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              {step === 1 ? (
                /* Step 1: Account Details */
                <View style={styles.stepContainer}>
                  <Text style={styles.label}>Account Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., My Checking Account"
                    placeholderTextColor="#94A3B8"
                    value={accountName}
                    onChangeText={setAccountName}
                    returnKeyType="next"
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />

                  <Text style={styles.label}>Account Type</Text>
                  <View style={styles.accountTypesGrid}>
                    {accountTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.accountTypeCard,
                          accountType === type.id && styles.accountTypeCardActive
                        ]}
                        onPress={() => setAccountType(type.id)}
                      >
                        <View style={[
                          styles.accountTypeIcon,
                          { backgroundColor: type.bgColor }
                        ]}>
                          <Icon 
                            name={type.icon} 
                            size={24} 
                            color={type.iconColor} 
                          />
                        </View>
                        <Text style={[
                          styles.accountTypeName,
                          accountType === type.id && styles.accountTypeNameActive
                        ]}>
                          {type.name}
                        </Text>
                        <Text style={styles.accountTypeDesc}>{type.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Opening Date (Optional)</Text>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateText}>
                      {openingDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                    <Icon name="calendar" size={20} color="#64748B" />
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={openingDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                    />
                  )}
                </View>
              ) : (
                /* Step 2: Opening Balance */
                <View style={styles.stepContainer}>
                  <View style={styles.balanceHeader}>
                    <View style={[styles.selectedTypeIcon, { backgroundColor: selectedType?.bgColor }]}>
                      <Icon name={selectedType?.icon} size={32} color={selectedType?.iconColor} />
                    </View>
                    <View style={styles.selectedTypeInfo}>
                      <Text style={styles.selectedTypeName}>{selectedType?.name}</Text>
                      <Text style={styles.selectedTypeDesc}>{accountName}</Text>
                    </View>
                  </View>

                  <View style={styles.balanceIconContainer}>
                    <View style={styles.balanceIcon}>
                      <Icon name="dollar-sign" size={40} color="#0A84FF" />
                    </View>
                  </View>

                  <Text style={styles.balanceTitle}>
                    What's the current balance?
                  </Text>
                  <Text style={styles.balanceSubtitle}>
                    This will be added to your "Ready to Assign" fund
                  </Text>

                  <View style={styles.balanceInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.balanceInput}
                      placeholder="0.00"
                      placeholderTextColor="#94A3B8"
                      keyboardType="decimal-pad"
                      value={openingBalance}
                      onChangeText={handleBalanceChange}
                      onFocus={handleBalanceFocus}
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />
                  </View>

                  {openingBalance && (
                    <View style={styles.previewContainer}>
                      <Text style={styles.previewLabel}>Ready to Assign will be:</Text>
                      <Text style={styles.previewAmount}>
                        {formatCurrency(openingBalance)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.infoBox}>
                    <Icon name="info" size={16} color="#0A84FF" />
                    <Text style={styles.infoText}>
                      You can always add more accounts or adjust balances later
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Fixed Bottom Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <LinearGradient
                  colors={['#E56772', '#E56772']}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>
                    {step === 1 ? 'Next' : 'Add Account'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: '#8baaff',
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  progressStepTextActive: {
    color: '#ffffff',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#3F2B96',
  },
  stepContainer: {
    marginBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  accountTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  accountTypeCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  accountTypeCardActive: {
    borderColor: '#0A84FF',
    borderWidth: 2,
    backgroundColor: '#F0F9FF',
  },
  accountTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 4,
  },
  accountTypeDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  accountTypeNameActive: {
    color: '#0A84FF',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
  },
  dateText: {
    fontSize: 16,
    color: '#0F172A',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  selectedTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedTypeInfo: {
    flex: 1,
  },
  selectedTypeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  selectedTypeDesc: {
    fontSize: 14,
    color: '#64748B',
  },
  balanceIconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  balanceIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  balanceSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  balanceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#0A84FF',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '600',
    color: '#262626',
    marginRight: 8,
  },
  balanceInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '600',
    color: '#0F172A',
    padding: 0,
  },
  previewContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  previewLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  previewAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0A84FF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#0A84FF',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  nextButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AddAccountModal;