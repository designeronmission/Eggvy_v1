import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from "react-native";

export default function DoctorOnCall() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.left}>
          <Text style={styles.label}>Doctor on Call</Text>

          <Text style={styles.title}>
            24x7 medical{'\n'}consultation
          </Text>

          <Text style={styles.subtitle}>
            Talk to certified doctors anytime, anywhere
          </Text>

          <TouchableOpacity>
            <Text style={styles.cta}>Consult Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.right}>
          <Image
            source={require('../../assets/images/doctor.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  card: {
    backgroundColor: "#F0FDF4",
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  left: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#14532D",
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 12,
    color: "#166534",
    marginTop: 8,
    lineHeight: 16,
  },
  cta: {
    fontSize: 13,
    fontWeight: "700",
    color: "#16A34A",
    marginTop: 14,
  },
  right: {
    width: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 120,
    height: 120,
  },
});