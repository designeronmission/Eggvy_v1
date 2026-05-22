import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, StatusBar, Dimensions, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const eggRise = useRef(new Animated.Value(height * 0.4)).current; 
  const holeScale = useRef(new Animated.Value(0)).current; 
  const logoGroupMoveX = useRef(new Animated.Value(0)).current; 
  const eggRotate = useRef(new Animated.Value(0)).current; 
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlideIn = useRef(new Animated.Value(20)).current; 

  useEffect(() => {
    Animated.sequence([
      // 1. Hole opens center
      Animated.spring(holeScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      
      // 2. Egg emerges from hole
      Animated.spring(eggRise, {
        toValue: 0,
        tension: 40, 
        friction: 6, 
        useNativeDriver: true,
      }),

      // 3. Impact Wiggle
      Animated.sequence([
        Animated.timing(eggRotate, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(eggRotate, { toValue: -1, duration: 100, useNativeDriver: true }),
        Animated.timing(eggRotate, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]),

      Animated.delay(400),

      // 4. THE SHIFT
      Animated.parallel([
        Animated.timing(logoGroupMoveX, {
          toValue: -80, 
          duration: 800,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textSlideIn, {
          toValue: 50, 
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // 5. Wait a moment
      Animated.delay(1000),
    ]).start();
  }, []);

  const rotation = eggRotate.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg']
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      <View style={styles.mainWrapper}>
        
        {/* CENTERED UNIT: Egg + Hole */}
        <Animated.View style={[styles.eggHoleGroup, { transform: [{ translateX: logoGroupMoveX }] }]}>
            
            {/* 1. Hole Asset first (rendered behind the egg) */}
            <Animated.Image 
                source={require('../../src/assets/images/hole.png')} 
                style={[
                    styles.holeImage, 
                    { transform: [{ scale: holeScale }] }
                ]} 
                resizeMode="contain"
            />

            {/* 2. The Egg (rendered on top of the hole) */}
            <View style={styles.clippingBox}>
                <Animated.Image
                    source={require('../../src/assets/images/egg.png')}
                    style={[
                        styles.eggIcon, 
                        { 
                            transform: [
                                { translateY: eggRise },
                                { rotate: rotation }
                            ] 
                        }
                    ]}
                    resizeMode="contain"
                />
            </View>
        </Animated.View>

        {/* THE TEXT */}
        <Animated.View 
          style={[
            styles.textWrapper,
            { 
              opacity: textOpacity,
              transform: [{ translateX: textSlideIn }]
            }
          ]}
        >
          <Image
            source={require('../../src/assets/images/eggvy-text.png')}
            style={styles.textImage}
            resizeMode="contain"
          />
        </Animated.View>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainWrapper: {
    width: width,
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eggHoleGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clippingBox: {
    width: 100,
    height: 120,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  eggIcon: {
    width: 60,
    height: 60,
  },
  holeImage: {
    width: 70,
    height: 30,
    marginTop: 60,
  },
  textWrapper: {
    position: 'absolute',
  },
  textImage: {
    width: 160,
    height: 90,
    marginTop: 10,
    right: 10,
  },
});

export default SplashScreen;