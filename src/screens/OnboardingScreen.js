// src/screens/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Take control of your spending',
    description: 'Track income and expenses easily and stay within your budget',
    image: require('../assets/images/splash-1.png'), // Correct path from screens to assets
  },
  {
    id: '2',
    title: 'Know where your money goes',
    description: 'Get smart insights to make better financial decisions.',
    image: require('../assets/images/splash-2.png'), // Correct path from screens to assets
  },
  {
    id: '3',
    title: 'Protect Your Identity & Credit',
    description: 'Stay secure with real-time credit monitoring, fraud alerts, and proactive safeguards',
    image: require('../assets/images/splash-3.png'), // Correct path from screens to assets
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      // Navigate to main app - replace Onboarding with MainTabs
      navigateToMainApp();
    }
  };

  const handleSkip = () => {
    navigateToMainApp();
  };

  const navigateToMainApp = () => {
    try {
      // Replace Onboarding with MainTabs (works in root stack)
      navigation.replace('MainTabs');
      console.log('Navigated to MainTabs successfully');
    } catch (error) {
      console.log('Navigation to MainTabs failed:', error);
      
      // Fallback: try reset
      try {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } catch (secondError) {
        console.log('Reset failed:', secondError);
      }
    }
  };

  const renderDot = (index) => {
    const isActive = index === currentIndex;
    return (
      <View
        key={index}
        style={[
          styles.dot,
          isActive ? styles.activeDot : styles.inactiveDot,
        ]}
      />
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header with Skip */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Bottom Section with Dots and Next Button */}
      <View style={styles.bottomContainer}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => renderDot(index))}
        </View>

        {/* Next/Get Started Button */}
        <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={['#3F2B96', '#3F2B96']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Icon 
              name={currentIndex === onboardingData.length - 1 ? 'check' : 'arrow-right'} 
              size={20} 
              color="#FFFFFF" 
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 0.3,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#3F2B96',
  },
  inactiveDot: {
    backgroundColor: '#E0E0E0',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#3F2B96',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OnboardingScreen;