import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather'; // Add this import

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = 176;
const CARD_HEIGHT = 206;
const CARD_GAP = 8;

export default function RecommendedSection() {
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const cards = [
    {
      id: 1,
      title: 'Quick Loans',
      description: 'Fast, reliable personal loans to cover urgent expenses such as bills, repairs, or travel',
      icon: require('../../assets/images/Quick-loan.png'),
      circleColor: '#EBF3FF',
      progressColor: '#3da3e7',
      progressWidth: 70,
      chance: '85% Chance',
      amount: 'Upto $5,000'
    },
    {
      id: 2,
      title: 'Cash Advance',
      description: 'Short-term access to cash—often through credit cards or advance apps',
      icon: require('../../assets/images/cash-advance.png'),
      circleColor: '#F3FFDB',
      progressColor: '#bedc83',
      progressWidth: 90,
      chance: '93% Chance',
      amount: 'Upto $1,000'
    },
    {
      id: 3,
      title: 'Legal Club',
      description: 'Coverage that helps offset legal costs, available as a standalone policy or insurance benefits',
      icon: require('../../assets/images/Insurance.png'),
      circleColor: '#F0E5FF',
      progressColor: '#9c7ec1',
      progressWidth: 85,
      chance: '89% Chance',
      amount: 'Upto $850'
    },
    {
      id: 4,
      title: 'Roadside Assistance',
      description: 'Flat tire, dead battery, or towing needed? One tap connects.',
      icon: require('../../assets/images/roadside-assistance.png'),
      circleColor: '#FFF7EA',
      progressColor: '#eba038',
      progressWidth: 84,
      chance: '90% Chance',
      amount: 'Upto $3,000'
    },
  ];

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

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
      <Text style={styles.title}>Recommended</Text>
      
      <View style={styles.cardsWrapper}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
        >
          {cards.map((card, index) => (
            <TouchableOpacity 
              key={card.id} 
              style={styles.card}
              activeOpacity={0.9}
            >
              <View style={[styles.circleBg, { backgroundColor: card.circleColor }]} />
              
              <Image 
                source={card.icon}
                style={[
                  styles.cardIcon,
                  index === 0 && styles.cardIcon1,
                  index === 1 && styles.cardIcon2,
                  index === 2 && styles.cardIcon3,
                  index === 3 && styles.cardIcon4,
                ]}
                resizeMode="contain"
              />
              
              {/* Arrow Icon - Updated to Feather */}
              <View style={styles.arrowIcon}>
                <Feather name="arrow-up-right" size={16} color="#616161"/>
              </View>
              
              <Text style={styles.cardTitle}>{card.title}</Text>
              
              <Text style={styles.cardDescription}>{card.description}</Text>
              
              <View style={styles.progressSection}>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${card.progressWidth}%`,
                        backgroundColor: card.progressColor
                      }
                    ]} 
                  />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.label}>{card.chance}</Text>
                  <Text style={styles.label}>{card.amount}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
      </View>

      <View style={styles.indicatorContainer}>
        {cards.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToIndex(index)}
            style={styles.dotTouchable}
            activeOpacity={0.7}
          >
            <View style={[
              styles.dotIndicator,
              activeIndex === index && styles.dotIndicatorActive
            ]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1b1b1b',
    marginBottom: 16,
  },
  cardsWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: CARD_GAP,
    paddingRight: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 13,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  circleBg: {
    position: 'absolute',
    width: 87,
    height: 87,
    borderRadius: 43.5,
    left: -20,
    top: -19,
  },
  cardIcon: {
    position: 'absolute',
  },
  cardIcon1: {
    width: 64,
    height: 64,
    left: 8,
    top: 4,
  },
  cardIcon2: {
    width: 69,
    height: 69,
    left: 8,
    top: 5,
  },
  cardIcon3: {
    width: 71,
    height: 71,
    left: 9,
    top: 1,
  },
  cardIcon4: {
    width: 87,
    height: 54,
    left: 9,
    top: 8,
  },
  arrowIcon: {
    position: 'absolute',
    right: 15,
    top: 13,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    shadowColor: '#000',
  },
  cardTitle: {
    position: 'absolute',
    left: 9,
    top: 81,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f0f0f',
    lineHeight: 16,
  },
  cardDescription: {
    position: 'absolute',
    left: 9,
    right: 13,
    top: 106,
    fontSize: 10,
    fontWeight: '500',
    color: '#474747',
    lineHeight: 13,
  },
  progressSection: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 163,
  },
  progressBarBg: {
    backgroundColor: '#e1e1e1',
    height: 8,
    borderRadius: 60,
    position: 'relative',
  },
  progressBarFill: {
    position: 'absolute',
    left: 1,
    top: 1,
    height: 6,
    borderRadius: 60,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  label: {
    fontSize: 8,
    fontWeight: '600',
    color: '#5b5b5b',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  dotTouchable: {
    padding: 4,
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