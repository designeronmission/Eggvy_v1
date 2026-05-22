import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Create a colors constant file or define here
const COLORS = {
  primary: '#007AFF',
};

export default function SectionHeader({ title }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity>
        <Text style={styles.link}>See all</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  link: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});