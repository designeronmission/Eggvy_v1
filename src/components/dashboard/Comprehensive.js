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

export default function Comprehensive() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Note: You'll need to add actual images to src/assets/images/
  // For now, using placeholder colors. Replace with your actual images.
  const cards = [
    {
      id: 1,
      title: 'Protect Your Gadgets',
      description: 'Cover your phones and gadgets against damage, theft, and breakdowns.',
      image: require('../../assets/images/protect.png'),
      shapeColor: '#EFF5FF'
    },
    {
      id: 2,
      title: 'Instant Gadget Insurance',
      description: "Insure your electronics in minutes and stay protected from unexpected repair",
      image: require('../../assets/images/Security.png'),
      shapeColor: '#D1FFF9'
    },
    {
      id: 3,
      title: 'Smart Cover for Devices',
      description: 'Get affordable insurance for your gadgets and avoid high repair',
      image: require('../../assets/images/cover.png'),
      shapeColor: '#E6F0FF'
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
      <Text style={styles.sectionTitle}>Comprehensive Device Cover</Text>
      
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
              <Text style={[
                styles.cardTitle,
                index !== 0 && styles.cardTitleAlt
              ]}>
                {card.title}
              </Text>

              <Text style={[
                styles.cardDescription,
                index !== 0 && styles.cardDescriptionAlt
              ]}>
                {card.description}
              </Text>

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
    marginBottom: 30,
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
  cardTitle: {
    position: 'absolute',
    left: 11,
    top: 17,
    fontSize: 17,
    fontWeight: '600',
    color: '#1b1b1b',
    width: 165,
  },
  cardTitleAlt: {
    left: 10,
    top: 19,
    width: 221,
  },
  cardDescription: {
    position: 'absolute',
    left: 11,
    top: 43,
    fontSize: 12,
    fontWeight: '500',
    color: '#676767',
    width: 172,
    lineHeight: 16,
  },
  cardDescriptionAlt: {
    left: 10,
    top: 49,
  },
  cardImage: {
    position: 'absolute',
    overflow: 'hidden',
  },
  cardImageContent: {
    width: '100%',
    height: '100%',
  },
  image1: {
    width: 140,
    height: 90,
    left: 202,
    top: 0,
  },
  image2: {
    width: 140,
    height: 100,
    left: 199,
    top: 0,
  },
  image3: {
    width: 130,
    height: 130,
    left: 212,
    top: 3,
  },
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