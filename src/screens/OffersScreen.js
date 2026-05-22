import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  StatusBar 
} from 'react-native';
import TopBar from '../components/layout/TopBar';
import MenuScreen from '../components/layout/MenuScreen';

const OffersScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('offers');

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    switch(tabId) {
      case 'dashboard':
        navigation.navigate('Dashboard');
        break;
      case 'insights':
        navigation.navigate('Insights');
        break;
      case 'budget':
        navigation.navigate('Budget');
        break;
      case 'goals':
        navigation.navigate('Goals');
        break;
      case 'offers':
        // Already here
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <TopBar 
        title="Offers"
        onMenuPress={handleMenuPress}
        showBack={false}
      />
      
      <MenuScreen 
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Offers Screen</Text>
          <Text style={styles.placeholderSubtext}>Exclusive offers will appear here</Text>
        </View>
      </ScrollView>

      <BottomNav 
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default OffersScreen; 