import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';

export default function Healthcare() {
  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Doctor on Call</Text>
          <Text style={styles.heroDescription}>
            Connect with experienced doctors instantly through secure video consultations
          </Text>
          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Call a Doctor</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.heroImageOuterContainer}>
          <Image 
            source={require('../../assets/images/doctor.png')} 
            style={styles.doctorImage}
            resizeMode="cover"
          />
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.servicesTitle}>Healthcare at Your Fingertips</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.serviceCardsContainer}
        contentContainerStyle={styles.serviceCardsContent}
      >
        <View style={styles.serviceCard}>
          <View style={[styles.cardHeader, styles.blueHeader]}>
            <View style={styles.cardIcon}>
              <Icon name="home" size={30} color="#2A7E9B" />
            </View>
            <TouchableOpacity style={styles.arrowButton}>
              <Feather name="arrow-up-right" size={16} color="#000000" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Care from Home</Text>
            <Text style={styles.cardDescription}>
              Get medical advice without visiting a clinic. Easy, private, and convenient consultations.
            </Text>
          </View>
        </View>

        <View style={styles.serviceCard}>
          <View style={[styles.cardHeader, styles.purpleHeader]}>
            <View style={styles.cardIcon}>
              <Feather name="video" size={30} color="#6A5ACD" />
            </View>
            <TouchableOpacity style={styles.arrowButton}>
              <Feather name="arrow-up-right" size={16} color="#000000" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>Online Medical Help</Text>
            <Text style={styles.cardDescription}>
              Get trusted medical advice from home without long waits or clinic visits.
            </Text>
          </View>
        </View>

        <View style={styles.serviceCard}>
          <View style={[styles.cardHeader, styles.greenHeader]}>
            <View style={styles.cardIcon}>
              <Feather name="clock" size={30} color="#4CAF50" />
            </View>
            <TouchableOpacity style={styles.arrowButton}>
              <Feather name="arrow-up-right" size={16} color="#000000" />
            </TouchableOpacity>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>24/7 Service</Text>
            <Text style={styles.cardDescription}>
              Access medical help anytime, day or night. Available 24 hours.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 60,
  },
  heroSection: {
    backgroundColor: "#4A90A4",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 24,
    padding: 24,
    minHeight: 160,
    position: "relative",
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  heroContent: {
    flex: 1,
    maxWidth: "65%",
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#003D59",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroDescription: {
    fontSize: 13,
    fontWeight: "500",
    color: "#FFFFFF",
    lineHeight: 20,
    marginBottom: 24,
    opacity: 0.9,
  },
  ctaButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B1B1B",
    letterSpacing: 0.3,
  },
  heroImageOuterContainer: {
    position: "absolute",
    right: -15,
    bottom: -15,
    width: 160,
    height: 300,
    zIndex: 1,
  },
  doctorImage: {
    width: "100%",
    height: "100%",
  },
  titleSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  servicesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B1B1B",
    letterSpacing: -0.3,
  },
  serviceCardsContainer: {
    paddingLeft: 16,
    paddingBottom: 30,
  },
  serviceCardsContent: {
    paddingRight: 16,
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    width: 170,
    marginRight: 16,
    overflow: "hidden",

  },
  cardHeader: {
    height: 80,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  blueHeader: {
    backgroundColor: "#E0F7FF",
  },
  purpleHeader: {
    backgroundColor: "#F0EEFF",
  },
  greenHeader: {
    backgroundColor: "#E8F5E9",
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowButton: {
    width: 28,
    height: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardDescription: {
    fontSize: 12,
    fontWeight: "400",
    color: "#666666",
    lineHeight: 16,
  },
});