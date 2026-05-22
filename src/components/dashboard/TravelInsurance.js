import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = 342;
const CARD_HEIGHT = 354;

export default function TravelInsurance() {
  const handleBuyNow = () => {
    console.log('Buy Now pressed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Instant Travel Insurance</Text>
        
        <Text style={styles.cardDescription}>
          Buy travel insurance in minutes and stay covered wherever your journey takes you
        </Text>
        
        <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
        
        <View style={styles.waveBackground}>
          <Image 
            source={require('../../assets/images/wave-background.png')}
            style={styles.waveImage}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.illustration}>
          <Image 
            source={require('../../assets/images/travel-illustration.png')}
            style={styles.illustrationImage}
            resizeMode="cover"
          />
        </View>
        
        <Text style={styles.tcText}>T&C Applied</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    position: 'absolute',
    left: '41%',
    transform: [{ translateX: -171 }],
    top: 28,
    fontSize: 21,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 19,
    width: '100%',
    paddingHorizontal: 25,
  },
  cardDescription: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -144.5 }],
    top: 61,
    width: 289,
    fontSize: 15,
    fontWeight: '500',
    color: '#a4a4a4',
    lineHeight: 19,
    textAlign: 'left',
  },
  buyButton: {
    position: 'absolute',
    left: 25,
    top: 118,
    width: 131,
    height: 38,
    backgroundColor: '#e56772',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  waveBackground: {
    position: 'absolute',
    left: 1.5,
    top: 120.7,
    width: 339.5,
    height: 233.797,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  waveImage: {
    width: '100%',
    height: '100%',
  },
  illustration: {
    position: 'absolute',
    left: 111,
    top: 118,
    width: 224,
    height: 234,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  illustrationImage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '109.82%',
    height: '105.13%',
  },
  tcText: {
    position: 'absolute',
    left: 25,
    top: 324.81,
    width: 47,
    fontSize: 8,
    fontWeight: '500',
    color: 'white',
  },
});