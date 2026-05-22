// src/components/NotificationModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Helper function to get gradient colors based on category
const getCategoryGradient = (category) => {
  const gradients = {
    'live': ['#ffd9d9', '#ffd9d9'],
    'today': ['#dae2ff', '#dae2ff'],
    'this week': ['#d1fff2', '#d1fff2'],
    'earlier': ['#f0f0f0', '#e0e0e0'],
  };
  return gradients[category] || gradients['earlier'];
};

// Helper function for category data
const getCategoryData = (category) => {
  const data = {
    'live': {
      title: 'LIVE',
      icon: 'radio',
    },
    'today': {
      title: 'TODAY',
      icon: 'sun',
    },
    'this week': {
      title: 'THIS WEEK',
      icon: 'calendar',
    },
    'earlier': {
      title: 'EARLIER',
      icon: 'clock',
    },
  };
  return data[category] || data['earlier'];
};

// Get icon background color based on notification type
const getIconBackground = (iconName) => {
  const backgrounds = {
    'dollar-sign': '#E6F7E6',
    'credit-card': '#FFE8E8',
    'alert-circle': '#FFE8E8',
    'trending-up': '#E6F0FF',
    'music': '#E8F0E8',
    'pie-chart': '#E6F0FF',
    'target': '#E6F7E6',
  };
  return backgrounds[iconName] || '#F5F5F5';
};

// Get icon color based on notification type
const getIconColor = (iconName) => {
  const colors = {
    'dollar-sign': '#059669',
    'credit-card': '#DC2626',
    'alert-circle': '#DC2626',
    'trending-up': '#2563EB',
    'music': '#1DB954',
    'pie-chart': '#2563EB',
    'target': '#059669',
  };
  return colors[iconName] || '#6B7280';
};

// Notification Card Component
const NotificationCard = ({ notification, onPress }) => {
  const [pressed, setPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !notification.read && styles.unreadCard,
        pressed && styles.pressedCard,
      ]}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      activeOpacity={0.7}
    >
      {/* Unread Dot Indicator */}
      {!notification.read && (
        <LinearGradient
          colors={['#DC2626', '#991B1B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.unreadDot}
        />
      )}
      
      {/* Icon Container with Light Background */}
      <View style={[
        styles.iconContainer,
        { backgroundColor: getIconBackground(notification.icon) }
      ]}>
        <Icon 
          name={notification.icon} 
          size={18} 
          color={getIconColor(notification.icon)} 
        />
      </View>

      {/* Content */}
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[
            styles.notificationTitle,
            !notification.read && styles.unreadTitle
          ]} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
        
        {/* Priority Indicator */}
        {notification.priority === 'high' && (
          <View style={styles.priorityBadge}>
            <Icon name="alert-triangle" size={10} color="#DC2626" />
            <Text style={styles.priorityText}>Important</Text>
          </View>
        )}
      </View>

      {/* Chevron */}
      <View style={styles.chevronContainer}>
        <Icon name="chevron-right" size={16} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );
};

// Main NotificationModal Component
export default function NotificationModal({ visible, onClose }) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Instant Transfer Received',
      message: '$500.00 received from Alex Johnson',
      time: 'Just now',
      icon: 'dollar-sign',
      read: false,
      category: 'live',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Card Transaction Alert',
      message: '$45.20 charged at Starbucks • New York',
      time: '5 minutes ago',
      icon: 'credit-card',
      read: false,
      category: 'live',
      priority: 'high',
    },
    {
      id: 3,
      title: 'Low Balance Alert',
      message: 'Your checking account balance is $91.00',
      time: '1 hour ago',
      icon: 'alert-circle',
      read: false,
      category: 'today',
      priority: 'medium',
    },
    {
      id: 4,
      title: 'Spending Analysis Updated',
      message: 'Monthly spending report is ready for review',
      time: '3 hours ago',
      icon: 'trending-up',
      read: false,
      category: 'today',
      priority: 'medium',
    },
    {
      id: 5,
      title: 'Credit Card Bills',
      message: 'Due in 2 days - $230.00',
      time: 'Today',
      icon: 'credit-card',
      read: false,
      category: 'live',
      priority: 'high',
    },
    {
      id: 6,
      title: 'Spotify Subscription',
      message: 'Payment of $19.99 due soon',
      time: 'Today',
      icon: 'music',
      read: false,
      category: 'live',
      priority: 'medium',
    },
    {
      id: 7,
      title: 'Investment Matured',
      message: 'Your fixed deposit of $1,000 has matured',
      time: 'Yesterday',
      icon: 'pie-chart',
      read: true,
      category: 'this week',
      priority: 'low',
    },
    {
      id: 8,
      title: 'Savings Goal Progress',
      message: 'You reached 75% of your $500 savings goal',
      time: '2 days ago',
      icon: 'target',
      read: true,
      category: 'this week',
      priority: 'low',
    },
  ]);

  const slideAnim = useRef(new Animated.Value(-SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      StatusBar.setBackgroundColor('rgba(0, 0, 0, 0.5)');
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      StatusBar.setBackgroundColor('transparent');
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNotificationPress = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setTimeout(() => onClose(), 300);
  };

  const getNotificationsByCategory = (category) => {
    return notifications.filter(n => n.category === category);
  };

  const renderCategorySection = (category) => {
    const categoryData = getCategoryData(category);
    const categoryNotifications = getNotificationsByCategory(category);
    const gradientColors = getCategoryGradient(category);
    
    if (categoryNotifications.length === 0) return null;

    return (
      <View style={styles.categorySection} key={category}>
        <View style={styles.categoryHeader}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.categoryIconContainer}
          >
            <Icon name={categoryData.icon} size={12} color={category === 'earlier' ? '#6B7280' : '#000000'} />
          </LinearGradient>
          <Text style={styles.categoryTitle}>
            {categoryData.title}
          </Text>
          <View style={styles.categoryCount}>
            <Text style={styles.categoryCountText}>
              {categoryNotifications.length}
            </Text>
          </View>
        </View>

        {categoryNotifications.map(notification => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onPress={() => handleNotificationPress(notification.id)}
          />
        ))}
      </View>
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasLiveNotifications = getNotificationsByCategory('live').length > 0;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            { 
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={['#FFFFFF', '#F9FAFB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>Notifications</Text>
                {hasLiveNotifications && (
                  <LinearGradient
                    colors={['#DC2626', '#991B1B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.liveBadge}
                  >
                    <View style={styles.livePulse} />
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                  </LinearGradient>
                )}
              </View>
              <Text style={styles.headerSubtitle}>
                {unreadCount > 0 
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                  : 'All caught up!'
                }
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Notification List */}
          <ScrollView 
            style={styles.notificationsScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.notificationsContent}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <LinearGradient
                  colors={['#F3F4F6', '#E5E7EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.emptyIconContainer}
                >
                  <Icon name="bell-off" size={48} color="#9CA3AF" />
                </LinearGradient>
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptyMessage}>
                  No notifications at the moment
                </Text>
              </View>
            ) : (
              <>
                {/* Live Notifications */}
                {renderCategorySection('live')}
                
                {/* Today Notifications */}
                {renderCategorySection('today')}
                
                {/* This Week Notifications */}
                {renderCategorySection('this week')}
                
                {/* Earlier Notifications */}
                {renderCategorySection('earlier')}
              </>
            )}
          </ScrollView>

          {/* Bottom Actions */}
          {notifications.length > 0 && (
            <LinearGradient
              colors={['#FFFFFF', '#F9FAFB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bottomActions}
            >
              <TouchableOpacity 
                style={[styles.actionButton, styles.markAllButton]}
                onPress={markAllAsRead}
              >
                <LinearGradient
                  colors={['#d1dfff', '#d1dfff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionGradient}
                >
                  <Icon name="check-circle" size={18} color="#231a9b" />
                  <Text style={[styles.actionText, styles.markAllText]}>
                    Mark all as read
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.clearButton]}
                onPress={clearAllNotifications}
              >
                <LinearGradient
                  colors={['#5F2B80', '#5F2B80']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.actionGradient}
                >
                  <Icon name="trash-2" size={18} color="#FFFFFF" />
                  <Text style={[styles.actionText, styles.clearText]}>
                    Clear all
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flex: 1,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginRight: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationsScroll: {
    flex: 1,
  },
  notificationsContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#374151',
    marginRight: 8,
  },
  categoryCount: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',

  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
  },
  pressedCard: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#F9FAFB',
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    marginRight: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
    gap: 4,
  },
  priorityText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
  },
  chevronContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 240,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  markAllText: {
    color: '#231a9b',
  },
  clearText: {
    color: '#ffffff',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
});