import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  useWindowDimensions,
  Animated,
  Alert
} from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

export default function MenuScreen({ visible, onClose }) {
  const navigation = useNavigation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [menuWidth, setMenuWidth] = useState(SCREEN_WIDTH * 0.85);
  
  const slideAnim = useRef(new Animated.Value(-menuWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const newWidth = SCREEN_WIDTH * 0.85;
    setMenuWidth(newWidth);
    slideAnim.setValue(-newWidth);
  }, [SCREEN_WIDTH]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -menuWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, menuWidth]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            onClose(); // Close menu first
            // Navigate to Login screen and reset the navigation stack
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const handleNavigation = (screenName) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 300);
  };

  const menuItems = [
    {
      title: "Account Management",
      description: "Manage your account details",
      icon: "user",
      screen: "AccountManagement"
    },
    {
      title: "Transactions",
      description: "View all your transactions",
      icon: "list",
      screen: "Transactions"
    },
    {
      title: "Banking",
      description: "View balances & activity",
      icon: "credit-card",
      screen: "Banking"
    },
    {
      title: "Loans & Offers",
      description: "View available loans and offers",
      icon: "dollar-sign",
      screen: "Offers"
    },
    {
      title: "Notifications & Alerts",
      description: "Manage alerts and settings",
      icon: "bell",
      screen: "Notifications"
    },
    {
      title: "Support & Information",
      description: "Get help and useful information",
      icon: "help-circle",
      screen: "Support"
    },
    {
      title: "Authentication & Access",
      description: "Control login and security",
      icon: "lock",
      screen: "Auth"
    },
    {
      title: "Legal & Policies",
      description: "Access terms and policies",
      icon: "file-text",
      screen: "Legal"
    },
  ];

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          style={styles.overlayTouchable} 
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.menuContainer,
            { 
              width: menuWidth,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => {}} 
            style={styles.menuTouchable}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                  <View style={styles.profileImage}>
                    <Feather name="user" size={24} color="#4B5563" />
                  </View>
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={styles.greeting}>Maverick</Text>
                  <Text style={styles.userEmail}>LOS ANGELES</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <ScrollView 
              style={styles.menuList} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {menuItems.map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.menuItem}
                  onPress={() => handleNavigation(item.screen)}
                >
                  <View style={styles.menuItemIcon}>
                    <Feather name={item.icon} size={20} color="#4B5563" />
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemDescription}>{item.description}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              ))}

              {/* Logout Button */}
              <TouchableOpacity
                style={[styles.menuItem, styles.logoutItem]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={[styles.menuItemIcon, styles.logoutIcon]}>
                  <Feather name="log-out" size={20} color="#DC2626" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, styles.logoutTitle]}>
                    Logout
                  </Text>
                  <Text style={styles.menuItemDescription}>
                    Sign out of your account
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuTouchable: {
    flex: 1,
    width: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  closeButton: {
    padding: 4,
    marginTop: 4,
  },
  menuList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    flexShrink: 0,
  },
  menuItemContent: {
    flex: 1,
    marginRight: 8,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
  },
  logoutIcon: {
    backgroundColor: "#FEE2E2",
  },
  logoutTitle: {
    color: "#DC2626",
  },
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
});