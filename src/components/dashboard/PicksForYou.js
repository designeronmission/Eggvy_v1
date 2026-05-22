import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Animated,
  TouchableOpacity
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = 341;
const CARD_HEIGHT = 108;
const CARD_GAP = 10;

export default function PicksForYou() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const cards = [
    {
      id: 1,
      title: 'Need Cash Fast?',
      description: 'Get approved and receive up to $500 fast, right when it matters.',
      image: require('../../assets/images/cash-fast.png'),
      shapeColor: '#ffffff',
      accentColor: '#FFD700'
    },
    {
      id: 2,
      title: 'Borrow Up to $1,000',
      description: "We'll match you with the card that fits your needs.",
      image: require('../../assets/images/card-credit.png'),
      shapeColor: '#ffffff',
      accentColor: '#FF6B6B'
    },
    {
      id: 3,
      title: 'Card Matching Made Easy',
      description: 'Use your personal loan to pay off debt, upgrade your home',
      image: require('../../assets/images/card-match.png'),
      shapeColor: '#ffffff',
      accentColor: '#9F7AEA'
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

  // Create a shape similar to SVG using View with transform
  const renderBackgroundShape = (color, index) => {
    return (
      <View style={[styles.backgroundShape, { backgroundColor: color }]}>
        {/* Add some decorative elements to mimic the SVG shape */}
        <View style={[styles.shapeOverlay, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
        <View style={[styles.shapeCircle, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>The picks that fit you</Text>
      
      <View style={styles.cardsWrapper}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_GAP}
        >
          {cards.map((card, index) => (
            <View key={card.id} style={[styles.card, { backgroundColor: card.shapeColor }]}>
              {/* Background Shape - replaces SVG */}
              {renderBackgroundShape(card.accentColor, index)}
              
              {/* Title */}
              <Text style={[
                styles.cardTitle,
                index !== 0 && styles.cardTitleAlt
              ]}>
                {card.title}
              </Text>

              {/* Description */}
              <Text style={[
                styles.cardDescription,
                index !== 0 && styles.cardDescriptionAlt
              ]}>
                {card.description}
              </Text>

              {/* Image */}
              <View style={[
                styles.cardImage,
                index === 0 && styles.image1,
                index === 1 && styles.image2,
                index === 2 && styles.image3
              ]}>
                <Image 
                  source={card.image}
                  style={styles.cardImageContent}
                  resizeMode="contain"
                />
              </View>
            </View>
          ))}
        </Animated.ScrollView>
      </View>

      <View style={styles.indicatorContainer}>
        {cards.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToIndex(index)}
            style={[
              styles.dotIndicator,
              activeIndex === index && styles.dotIndicatorActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b1b1b',
    marginBottom: 16,
    fontFamily: 'System',
  },
  cardsWrapper: {
    width: '100%',
    height: CARD_HEIGHT,
    position: 'relative',
  },
  cardsContainer: {
    flexDirection: 'row',
    gap: CARD_GAP,
    paddingRight: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ededed',
    borderRadius: 4,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  // Background shape styles - replaces SVG
  backgroundShape: {
    position: 'absolute',
    width: 160,
    height: 90,
    right: -20,
    top: 60,
    borderRadius: 50,
    transform: [{ rotate: '1deg' }, { skewY: '-5deg' }],
    opacity: 0.3,
  },
  shapeOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 50,
    transform: [{ rotate: '-5deg' }],
  },
  shapeCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    right: 10,
    top: -10,
  },
  // Card Title
  cardTitle: {
    position: 'absolute',
    left: 11,
    top: 17,
    fontSize: 17,
    fontWeight: '600',
    color: '#1b1b1b',
    width: 160,
    zIndex: 2,
  },
  cardTitleAlt: {
    left: 10,
    top: 19,
    width: 221,
  },
  // Card Description
  cardDescription: {
    position: 'absolute',
    left: 11,
    top: 43,
    fontSize: 12,
    fontWeight: '500',
    color: '#676767',
    width: 172,
    lineHeight: 16,
    zIndex: 2,
  },
  cardDescriptionAlt: {
    left: 10,
    top: 49,
  },
  // Card Image Container
  cardImage: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 3,
  },
  cardImageContent: {
    width: '100%',
    height: '100%',
  },
  // Image 1: Fast Dollar
  image1: {
    width: 140,
    height: 90,
    left: 202,
    top: 0,
  },
  // Image 2: Credit card
  image2: {
    width: 140,
    height: 100,
    left: 199,
    top: 0,
  },
  // Image 3: Business Loan Document
  image3: {
    width: 150,
    height: 150,
    left: 212,
    bottom: -25,
  },
  // Dot Indicators
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotIndicatorActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#373737',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});