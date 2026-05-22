import React, { useRef, useState } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Image 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export default function InstantFunds() {
  const scrollViewRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const CARD_WIDTH = 286;
  const CARD_GAP = 16;

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
    setActiveIndex(index);
  };

  const scrollToIndex = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * (CARD_WIDTH + CARD_GAP),
        animated: true,
      });
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promoCards}
        onMomentumScrollEnd={handleScrollEnd}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
      >
        {/* First Card - Teal */}
        <LinearGradient
          colors={['rgba(189, 255, 235, 1)', 'rgba(225, 239, 255, 1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardz}
        >
          <View style={[styles.whiteCircle, styles.whiteCircleTeal]} />
          
          <View style={[styles.dollarImg, styles.dollarImg1]}>
            <Image 
              source={require('../../assets/images/money-3.png')}
              style={styles.dollarImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={[styles.dollarImg, styles.dollarImg2]}>
            <Image 
              source={require('../../assets/images/money-2.png')}
              style={styles.dollarImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={[styles.dollarImg, styles.dollarImg3]}>
            <Image 
              source={require('../../assets/images/money-1.png')}
              style={[styles.dollarImage, styles.rotatedImage]}
              resizeMode="contain"
            />
          </View>
          
          <View style={[styles.cardzContent, styles.cardzContentTeal]}>
            <Text style={styles.cardzTitle}>
              Instant funds.{'\n'}Simple process
            </Text>
            <TouchableOpacity style={styles.cardzButton}>
              <Text style={styles.cardzButtonText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.cardzAmountSection, styles.cardzAmountSectionTeal]}>
            <Text style={styles.amountLabel}>Get up to</Text>
            <LinearGradient
              colors={['rgb(99, 214, 182)', 'rgb(159, 187, 220)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.amountValueGradient}
            >
              <Text style={[styles.amountValue, styles.amountValueTeal]}>$1200</Text>
            </LinearGradient>
            <Text style={styles.amountSublabel}>credit on bank</Text>
          </View>
        </LinearGradient>
        
        {/* Second Card - Pink */}
        <LinearGradient
          colors={['rgba(255, 161, 249, 1)', 'rgba(255, 225, 249, 1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardz}
        >
          <View style={[styles.whiteCircle, styles.whiteCirclePink]} />
          
          <View style={[styles.dollarImg, styles.dollarImg4]}>
            <Image 
              source={require('../../assets/images/money-4.png')}
              style={[styles.dollarImage, styles.rotatedImage]}
              resizeMode="contain"
            />
          </View>
          
          <View style={[styles.cardzContent, styles.cardzContentPink]}>
            <Text style={styles.cardzTitle}>
              Instant access{'\n'}to your money
            </Text>
            <TouchableOpacity style={styles.cardzButton}>
              <Text style={styles.cardzButtonText}>Get Cash Now</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.cardzAmountSection, styles.cardzAmountSectionPink]}>
            <Text style={styles.amountLabel}>Get access</Text>
            <Text style={styles.amountLabel}>upto</Text>
            <LinearGradient
              colors={['rgb(158, 99, 214)', 'rgb(220, 159, 219)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.amountValueGradient}
            >
              <Text style={[styles.amountValue, styles.amountValuePink]}>$700</Text>
            </LinearGradient>
            <Text style={styles.amountSublabel}>from your</Text>
            <Text style={styles.amountSublabel}>phone</Text>
          </View>
        </LinearGradient>
      </ScrollView>

      <View style={styles.carouselIndicators}>
        <TouchableOpacity
          onPress={() => scrollToIndex(0)}
          style={[
            styles.dotIndicator,
            activeIndex === 0 && styles.dotIndicatorActive,
          ]}
        />
        <TouchableOpacity
          onPress={() => scrollToIndex(1)}
          style={[
            styles.dotIndicator,
            activeIndex === 1 && styles.dotIndicatorActive,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
  },
  promoCards: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  cardz: {
    width: 286,
    height: 118,
    borderRadius: 13,
    overflow: 'hidden',
    position: 'relative',
  },
  cardzTeal: {},
  cardzPink: {},
  whiteCircle: {
    position: 'absolute',
    width: 106,
    height: 106,
    backgroundColor: 'white',
    borderRadius: 53,
    right: 21,
    zIndex: 1,
  },
  whiteCircleTeal: {
    top: 5,
  },
  whiteCirclePink: {
    top: 2,
  },
  cardzContent: {
    position: 'absolute',
    left: 18,
    zIndex: 2,
  },
  cardzContentTeal: {
    top: 13,
  },
  cardzContentPink: {
    top: 10,
  },
  cardzTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
    lineHeight: 20,
    marginBottom: 6,
    width: 112,
  },
  cardzButton: {
    backgroundColor: '#f3f8ff',
    borderRadius: 13,
    paddingVertical: 8,
    paddingHorizontal: 28,
  },
  cardzButtonText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
  },
  cardzAmountSection: {
    position: 'absolute',
    zIndex: 2,
  },
  cardzAmountSectionTeal: {
    right: 38,
    top: 32,
  },
  cardzAmountSectionPink: {
    right: 47,
    top: 23,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#565656',
    lineHeight: 11,
    textAlign: 'center',
  },
  amountValueGradient: {
    borderRadius: 4,
    paddingHorizontal: 4,
    marginVertical: 3,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
    color: 'white',
  },
  amountValueTeal: {},
  amountValuePink: {},
  amountSublabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#565656',
    lineHeight: 11,
  },
  dollarImg: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 1,
  },
  dollarImage: {
    width: '100%',
    height: '100%',
  },
  rotatedImage: {
    transform: [{ rotate: '-40.22deg' }],
  },
  dollarImg1: {
    width: 41,
    height: 38,
    left: 141,
    top: 62,
  },
  dollarImg2: {
    width: 36,
    height: 39,
    right: 13,
    top: 69,
  },
  dollarImg3: {
    width: 42,
    height: 36,
    right: 6,
    top: 2,
  },
  dollarImg4: {
    width: 58.61,
    height: 71.371,
    right: 2,
    top: 15,
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  dotIndicatorActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#373737',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});