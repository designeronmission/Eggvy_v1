import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

export default function BillsSection({ bills }) {
  const navigation = useNavigation();

  const handleBillPress = (bill) => {
    navigation.navigate('BillDetails', { bill });
  };

  // If no bills provided, use default data or return null
  const displayBills = bills || [
    {
      _id: '1',
      title: 'Credit Card Bills',
      accountNumber: '8379 **** **** 005',
      amount: '$230.00',
      dueStatus: 'Today',
      description: 'Credit card payment',
      dueDate: new Date().toISOString(),
      recurring: false,
      category: 'Credit Card',
      paid: false
    },
    {
      _id: '2',
      title: 'Subscriptions',
      accountNumber: 'Spotify subscription payment of $19.99',
      amount: '$19.99',
      dueStatus: 'Due in 2 days',
      description: 'Spotify Premium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      recurring: true,
      category: 'Entertainment',
      paid: false
    }
  ];

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Reminders</Text>

      {displayBills.map((bill) => (
        <TouchableOpacity 
          key={bill._id} 
          style={styles.card}
          onPress={() => handleBillPress(bill)}
          activeOpacity={0.7}>
          <View style={styles.left}>
            <View style={styles.row}>
              <Text style={styles.billTitle}>{bill.title}</Text>
              <View style={[
                styles.badge,
                bill.dueStatus === 'Today' ? styles.badgeDanger : 
                bill.dueStatus?.includes('Due in') ? styles.badgeWarning : 
                styles.badgeDefault
              ]}>
                <Text style={styles.badgeText}>{bill.dueStatus}</Text>
              </View>
            </View>

            <Text style={styles.subtitle}>
              {bill.accountNumber || bill.description || ''}
            </Text>

            <Text style={styles.amount}>{bill.amount}</Text>
          </View>

          <View style={styles.arrow}>
            <Feather name="chevron-right" size={20} color="#111827" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    padding: 14,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeDanger: {
    backgroundColor: "#F87171",
  },
  badgeWarning: {
    backgroundColor: "#FBBF24",
  },
  badgeDefault: {
    backgroundColor: "#94A3B8",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 6,
  },
  amount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
});