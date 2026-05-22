// src/components/layout/TopBar.js
import React, { useState, memo, useCallback, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, StatusBar } from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import NotificationModal from "../NotificationModal"; 

const TopBar = memo(({ 
  title = "Dashboard", 
  onMenuPress, 
  showBack = false, 
  onBackPress,
  backgroundColor = "#FFFFFF",
  textColor = "#111827"
}) => {
  const navigation = useNavigation();
  const [notificationVisible, setNotificationVisible] = useState(false);

  // Set status bar when component focuses
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content');
      StatusBar.setBackgroundColor(backgroundColor);
      return () => {
        // Reset when leaving screen
        StatusBar.setBarStyle('dark-content');
        StatusBar.setBackgroundColor(backgroundColor);
      };
    }, [backgroundColor])
  );


  const handleBackButton = useCallback(() => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation, onBackPress]);

  const handleNotificationPress = useCallback(() => {
    setNotificationVisible(true);
  }, []);

  const closeNotificationModal = useCallback(() => {
    setNotificationVisible(false);
    // Force status bar style when modal closes
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor(backgroundColor);
  }, [backgroundColor]);

  return (
    <>
      <View style={[styles.container, { backgroundColor, borderBottomColor: '#F1F5F9' }]}>
        <View style={styles.leftContainer}>
          {showBack ? (
            <TouchableOpacity onPress={handleBackButton} style={styles.iconButton}>
              <Feather name="arrow-left" size={24} color={textColor} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
              <Feather name="menu" size={24} color={textColor} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        </View>

        <View style={styles.rightContainer}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={handleNotificationPress}
          >
            <FontAwesome name="bell" size={22} color={textColor} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Modal */}
      <NotificationModal 
        visible={notificationVisible}
        onClose={closeNotificationModal}
      />
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 4,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});

export default TopBar;