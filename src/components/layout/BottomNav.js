// src/components/layout/BottomNav.js
import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const BottomNav = memo(({ state, navigation }) => {
  const [imageErrors, setImageErrors] = useState({});

  // Add a safety check
  if (!state) {
    return null;
  }

  const navItems = [
    { 
      id: 'Dashboard', 
      label: 'Dashboard', 
      icon: 'home',
      activeImage: require('../../assets/images/dashboard-active.png'),
      inactiveImage: require('../../assets/images/dashboard.png'),
    },
    { 
      id: 'Insights', 
      label: 'Insights', 
      icon: 'bar-chart-2',
      activeImage: require('../../assets/images/insights-active.png'),
      inactiveImage: require('../../assets/images/insights.png'),
    },
    { 
      id: 'Budget', 
      label: 'Budget', 
      icon: 'trending-down',
      activeImage: require('../../assets/images/budget-active.png'),
      inactiveImage: require('../../assets/images/budget.png'),
    },
    { 
      id: 'Goals', 
      label: 'Goals', 
      icon: 'target',
      activeImage: require('../../assets/images/goals-active.png'),
      inactiveImage: require('../../assets/images/goals.png'),
    },
    { 
      id: 'Offers', 
      label: 'Offers', 
      icon: 'gift',
      activeImage: require('../../assets/images/offers-active.png'),
      inactiveImage: require('../../assets/images/offers.png'),
    },
  ];

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const renderIcon = (item, isActive) => {
    const hasError = imageErrors[item.id];
    
    // If image has error, fallback to Feather icon
    if (hasError) {
      return (
        <Feather 
          name={item.icon} 
          size={22} 
          color={isActive ? '#5F2B80' : '#8E8E93'}
        />
      );
    }

    // Use image
    const imageSource = isActive ? item.activeImage : item.inactiveImage;
    
    return (
      <Image 
        source={imageSource}
        style={styles.icon}
        resizeMode="contain"
        onError={() => handleImageError(item.id)}
        fadeDuration={0}
      />
    );
  };

  return (
    <View style={styles.bottomNav}>
      {navItems.map((item, index) => {
        const isActive = state.index === index;
        
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.id)}
            activeOpacity={0.7}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <View style={styles.iconContainer}>
              {renderIcon(item, isActive)}
            </View>
            <Text style={[
              styles.navText,
              isActive && styles.activeNavText
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  iconContainer: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: 24,
  },
  icon: {
    width: 22,
    height: 22,
  },
  navText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 2,
  },
  activeNavText: {
    color: '#5F2B80',
    fontWeight: '600',
  },
});

export default BottomNav;