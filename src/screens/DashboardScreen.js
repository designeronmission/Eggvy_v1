// src/screens/DashboardScreen.js
import React, { useState, useCallback, useRef, lazy, Suspense } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  View,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Import Layout Components
import MenuScreen from '../components/layout/MenuScreen';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';

// Import only essential components directly
import AccountCards from '../components/dashboard/AccountCards';
import BillsSection from '../components/dashboard/BillsSection';
// Remove this line - BillDetails is a screen, not a dashboard component
// import BillDetails from './components/BillDetails';
import InstantFunds from '../components/dashboard/InstantFunds';
import BenefitsGrid from '../components/dashboard/BenefitsGrid';

// Lazy load non-critical components
const PicksForYou = lazy(() => import('../components/dashboard/PicksForYou'));
const FuelDiscount = lazy(() => import('../components/dashboard/FuelDiscount'));
const RecommendedSection = lazy(() => import('../components/dashboard/RecommendedSection'));
const TravelInsurance = lazy(() => import('../components/dashboard/TravelInsurance'));
const Comprehensive = lazy(() => import('../components/dashboard/Comprehensive'));
const Healthcare = lazy(() => import('../components/dashboard/Healthcare'));

// Loading component for lazy-loaded sections
const SectionLoader = () => (
  <View style={styles.loaderContainer}>
    <ActivityIndicator size="small" color="#5F2B80" />
  </View>
);

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Use ref to track if this is the first render
  const isFirstRender = useRef(true);

  // Optimize focus effect - only run when needed
  useFocusEffect(
    useCallback(() => {
      setActiveTab('dashboard');
      // Reset first render flag on focus
      isFirstRender.current = false;
      
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const handleMenuPress = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500); // Reduced from 2000ms for faster feedback
  }, []);

  const handleTabPress = useCallback((tabId) => {
    // Don't navigate if already on the same tab
    if (tabId === 'dashboard') {
      // Could scroll to top here
      return;
    }
    
    // Navigate based on tab selection
    const navigationMap = {
      insights: 'Insights',
      budget: 'Budget',
      goals: 'Goals',
      offers: 'Offers',
    };
    
    const screenName = navigationMap[tabId];
    if (screenName) {
      navigation.navigate(screenName);
    }
  }, [navigation]);

  // Memoize the menu close handler
  const handleMenuClose = useCallback(() => {
    setMenuVisible(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Top Navigation Bar */}
      <TopBar 
        title="Dashboard"
        onMenuPress={handleMenuPress}
        showSettings={true}
        showBack={false}
        backgroundColor="#FFFFFF" // Explicitly set white background
        textColor="#111827" // Explicitly set dark text
      />
      
      {/* Slide-out Menu */}
      <MenuScreen 
        visible={menuVisible}
        onClose={handleMenuClose}
      />
      
      {/* Main Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5F2B80']}
            tintColor="#5F2B80"
            progressViewOffset={10}
          />
        }
        removeClippedSubviews={true} // Improve performance by removing off-screen views
        maxToRenderPerBatch={5} // Optimize rendering
        windowSize={5} // Reduce render window
      >
        {/* Critical Components - Load immediately */}
        <View style={styles.sectionWrapper}>
          <AccountCards />
        </View>

        <View style={styles.sectionWrapper}>
          <BillsSection />
        </View>
        

        <View style={styles.sectionWrapper}>
          <InstantFunds />
        </View>
        
        <View style={styles.sectionWrapper}>
          <BenefitsGrid />
        </View>
        
        {/* Non-critical Components - Load lazily */}
        <Suspense fallback={<SectionLoader />}>
          <View style={styles.sectionWrapper}>
            <PicksForYou />
          </View>
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <View style={styles.sectionWrapper}>
            <FuelDiscount />
          </View>
        </Suspense>
               
        <Suspense fallback={<SectionLoader />}>
          <View style={styles.sectionWrapper}>
            <RecommendedSection />
          </View>
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <View style={styles.sectionWrapper}>
            <TravelInsurance />
          </View>
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <View style={styles.sectionWrapper}>
            <Comprehensive />
          </View>
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <View style={styles.sectionWrapper}>
            <Healthcare />
          </View>
        </Suspense>
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
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
  },
  scrollContent: {
    paddingBottom: 80,
  },
  sectionWrapper: {
    marginBottom: 8,
  },
  bottomPadding: {
    height: 30,
  },
  loaderContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
  },
});

export default DashboardScreen;