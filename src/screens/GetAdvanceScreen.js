// src/screens/GetAdvanceScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import TopBar from '../components/layout/TopBar';

export default function GetAdvanceScreen() {
  const navigation = useNavigation();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubscribe = () => {
    if (agreedToTerms) {
      setIsSubscribed(true);
      console.log('Subscribed to cash advance');
    }
  };

  const toggleTermsAgreement = () => {
    setAgreedToTerms(!agreedToTerms);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <TopBar
        title="Get Advance"
        showBack={true}
        onBackPress={handleBack}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Approved Cash Limit Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>You're approved cash limit: $50</Text>
          
          {/* Price Breakdown */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>This month (pro-rated):</Text>
              <Text style={styles.priceValue}>$3.73</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Starting next month:</Text>
              <Text style={[styles.priceValue, styles.regularPrice]}>$8/month</Text>
            </View>
          </View>

          {/* Note */}
          <Text style={styles.noteText}>
            You're only paying $3.73 for the rest of this month. Starting next month, the regular monthly rate of $8 will apply
          </Text>

          {/* Subscribe Button */}
          <TouchableOpacity
            style={[
              styles.subscribeButton,
              isSubscribed && styles.subscribedButton,
              !agreedToTerms && styles.disabledButton
            ]}
            onPress={handleSubscribe}
            disabled={isSubscribed || !agreedToTerms}
          >
            <Text style={styles.subscribeButtonText}>
              {isSubscribed ? 'Subscribed ✓' : 'Subscribe Now'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.termsCard}>
          <Text style={styles.termsTitle}>
            Terms & Conditions
          </Text>
          <Text style={styles.termsText}>
            Read and agree to the Rules & Regulations for accessing instant cash rewards. By subscribing, you agree to our Terms of Use.
          </Text>
          
          {/* Checkbox for agreement */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={toggleTermsAgreement}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              agreedToTerms && styles.checkboxChecked
            ]}>
              {agreedToTerms && (
                <Icon name="check" size={16} color="#2563EB" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              I have read and agree to the Terms & Conditions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Additional Information */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>💳</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Instant Access</Text>
              <Text style={styles.infoDescription}>
                Get up to $50 instantly after approval
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔄</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Flexible Repayment</Text>
              <Text style={styles.infoDescription}>
                Repay automatically from your linked account
              </Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔒</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Secure & Safe</Text>
              <Text style={styles.infoDescription}>
                Bank-level security for all transactions
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            This service is available for eligible users only. 
            Subscription can be cancelled anytime. 
            See our FAQ for more details.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    lineHeight: 28,
  },
  priceSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
  },
  regularPrice: {
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  subscribeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribedButton: {
    backgroundColor: '#059669',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20,
  },
  infoSection: {
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footerNote: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 16,
    textAlign: 'center',
  },
});