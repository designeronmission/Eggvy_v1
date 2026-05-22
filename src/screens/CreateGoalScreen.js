// src/screens/CreateGoalScreen.js
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import Icon from 'react-native-vector-icons/Feather'; // Changed for CLI
import { useNavigation } from "@react-navigation/native";

export default function CreateGoalScreen() {
  const navigation = useNavigation();
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Goal categories with image sources instead of icons
  const goalCategories = [
    { 
      id: 1, 
      title: "Vehicle", 
      source: require("../assets/images/car-goal.png"), 
      color: "#4A90E2" 
    },
    { 
      id: 2, 
      title: "Emergency", 
      source: require("../assets/images/emergency-goal.png"), 
      color: "#FF6B6B" 
    },
    { 
      id: 3, 
      title: "House", 
      source: require("../assets/images/home-goal.png"), 
      color: "#7ED321" 
    },
    { 
      id: 4, 
      title: "Wedding", 
      source: require("../assets/images/wedding-goal.png"), 
      color: "#FF69B4" 
    },
    { 
      id: 5, 
      title: "Vacation", 
      source: require("../assets/images/vacation-goal.png"), 
      color: "#9B59B6" 
    },
    { 
      id: 6, 
      title: "Custom", 
      source: require("../assets/images/custom-goal.png"), 
      color: "#F39C12" 
    },
  ];

  const handleContinue = () => {
    if (!selectedGoal) return;
    
    const selectedCategory = goalCategories.find(cat => cat.id === selectedGoal);
    navigation.navigate("CreateGoalStep2", {
      category: selectedCategory,
      selectedGoal: selectedGoal
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Goal</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>What's Your Savings Target?</Text>
        </View>

        {/* Goal Categories Grid */}
        <View style={styles.categoriesGrid}>
          {goalCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedGoal === category.id && styles.categoryCardSelected,
              ]}
              onPress={() => setSelectedGoal(category.id)}
            >
              <View
                style={[
                  styles.categoryIconContainer,
                  { backgroundColor: `${category.color}20` },
                ]}
              >
                <Image
                  source={category.source}
                  style={styles.categoryImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              
              {selectedGoal === category.id && (
                <View style={styles.selectedCheck}>
                  <Icon name="check-circle" size={20} color="#4A90E2" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[
            styles.continueButton,
            !selectedGoal && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedGoal}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Icon name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F8FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 25,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    lineHeight: 32,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  categoryCard: {
    width: "31%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  categoryCardSelected: {
    borderColor: "#4A90E2",
    backgroundColor: "#F0F8FF",
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryImage: {
    width: 40,
    height: 40,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
  },
  selectedCheck: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  continueButton: {
    backgroundColor: "#5F2B80",
    borderRadius: 12,
    paddingVertical: 18,
    marginHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#5F2B80",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: "#CCCCCC",
    shadowColor: "#CCCCCC",
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});