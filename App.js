// App.js
import React, { useState, useEffect, memo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BudgetProvider } from './src/context/BudgetContext';

// Import Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import OTPScreen from './src/screens/OTPScreen';
import SetPinScreen from './src/screens/SetPinScreen';

// Import Main Tab Screens
import DashboardScreen from './src/screens/DashboardScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import AddOffersScreen from './src/screens/AddOffersScreen';

// Import Other Screens
import AddCategoryScreen from './src/screens/AddCategoryScreen';
import CategoryDetailScreen from './src/screens/CategoryDetailScreen';
import AssignMoneyScreen from './src/screens/AssignMoneyScreen';
import AutoAssignScreen from './src/screens/AutoAssignScreen';
import MoveMoneyScreen from './src/screens/MoveMoneyScreen';
import QuickBudgetScreen from './src/screens/QuickBudgetScreen';
import CreateBudgetScreen from './src/screens/CreateBudgetScreen';
import CreateGoalStep1Screen from './src/screens/CreateGoalStep1Screen';
import CreateGoalStep2Screen from './src/screens/CreateGoalStep2Screen';
import OfferDetailScreen from './src/screens/OfferDetailScreen';
import NotificationScreen from './src/screens/NotificationScreen';
import GetAdvanceScreen from './src/screens/GetAdvanceScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import CategoryDetail from './src/screens/CategoryDetail';
import BillDetails from './src/screens/BillDetails';

// Import Custom Tab Bar
import BottomNav from './src/components/layout/BottomNav';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Tab Navigator
const MainTabNavigator = memo(() => {
  return (
    <Tab.Navigator
      tabBar={props => <BottomNav {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: false,
        unmountOnBlur: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Offers" component={AddOffersScreen} />
    </Tab.Navigator>
  );
});

// App Navigator
const AppNavigator = memo(() => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen on app start
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 4500);

    return () => clearTimeout(splashTimer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
    initialRouteName='MainTabs'
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Auth Stack */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="SetPin" component={SetPinScreen} />
      
      {/* Main App Stack */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="AddCategoryScreen" component={AddCategoryScreen} />
      <Stack.Screen name="CategoryDetailScreen" component={CategoryDetailScreen} />
      <Stack.Screen name="AssignMoneyScreen" component={AssignMoneyScreen} />
      <Stack.Screen name="AutoAssignScreen" component={AutoAssignScreen} />
      <Stack.Screen name="MoveMoneyScreen" component={MoveMoneyScreen} />
      <Stack.Screen name="QuickBudgetScreen" component={QuickBudgetScreen} />
      <Stack.Screen name="CreateBudgetScreen" component={CreateBudgetScreen} />
      <Stack.Screen name="CreateGoalStep1" component={CreateGoalStep1Screen} />
      <Stack.Screen name="CreateGoalStep2" component={CreateGoalStep2Screen} />
      <Stack.Screen name="OfferDetail" component={OfferDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="GetAdvance" component={GetAdvanceScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetail} />
      <Stack.Screen name="BillDetails" component={BillDetails} />
    </Stack.Navigator>
  );
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BudgetProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </BudgetProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}