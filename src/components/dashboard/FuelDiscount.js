import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather'; // Add this import

const { width: screenWidth } = Dimensions.get('window');

export default function FuelDiscount() {
  const handleClaimNow = () => {
    console.log('Claim Now pressed');
  };

  const handleDealPress = (dealId) => {
    console.log('Deal pressed:', dealId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainCard}>
        <View style={styles.fuelPumpIcon}>
          <Image 
            source={require('../../assets/images/fuel-pump.png')}
            style={styles.fuelPumpImage}
            resizeMode="cover"
          />
        </View>
        
        <Text style={styles.mainTitle}>Save More on Fuel</Text>
        
        <View style={styles.exclusiveSection}>
          <Text style={styles.exclusiveTitle}>Exclusive fuel discounts</Text>
          <Text style={styles.exclusiveDescription}>
            Unlock exclusive fuel discounts available for a limited time. Pay less at the pump and go further on every drive.
          </Text>
          
          <TouchableOpacity style={styles.claimButtonWrapper} onPress={handleClaimNow}>
            <View style={styles.claimButton}>
              <Text style={styles.claimButtonText}>Claim Now</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.pickedDealsTitle}>Picked fuel deals for you</Text>
        
        <TouchableOpacity 
          style={[styles.dealCard, styles.dealCard1]}
          onPress={() => handleDealPress(1)}
          activeOpacity={0.9}
        >
          <View style={styles.cardBackground} />
          
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderBg1} />
            <View style={styles.cardImageWrapper1}>
              <Image 
                source={require('../../assets/images/Industry-fuel-station.png')}
                style={styles.cardImage1}
                resizeMode="cover"
              />
            </View>
            
            <View style={[styles.arrowIcon, styles.arrowIcon1]}>
              <Feather name="arrow-up-right" size={16} color="#000000" />
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>$X Off Per Litre</Text>
            <Text style={[styles.cardDescription, styles.cardDescription1]}>
              Enjoy a flat discount on every litre of fuel. No points, no waiting—just instant savings at the pump
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.dealCard, styles.dealCard2]}
          onPress={() => handleDealPress(2)}
          activeOpacity={0.9}
        >
          <View style={styles.cardBackground} />
          
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderBg2} />
            <View style={styles.cardImageWrapper2}>
              <Image 
                source={require('../../assets/images/cashback-3d-icon.png')}
                style={styles.cardImage2}
                resizeMode="cover"
              />
            </View>
            
            <View style={[styles.arrowIcon, styles.arrowIcon2]}>
              <Feather name="arrow-up-right" size={16} color="#000000" />
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Fuel & Get Cashback</Text>
            <Text style={[styles.cardDescription, styles.cardDescription2]}>
              Fill up your tank and get instant cashback on every fuel purchase. More savings every time you drive
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 343,
    height: 414,
    alignSelf: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  mainCard: {
    position: 'absolute',
    backgroundColor: '#262626',
    height: 414,
    left: 0,
    borderRadius: 15,
    top: 0,
    width: 343,
  },
  fuelPumpIcon: {
    position: 'absolute',
    left: 13,
    width: 47,
    height: 47,
    top: 25,
    overflow: 'hidden',
  },
  fuelPumpImage: {
    width: '100%',
    height: '100%',
  },
  mainTitle: {
    position: 'absolute',
    fontWeight: '600',
    left: 70,
    fontSize: 22,
    color: 'white',
    top: 36,
  },
  exclusiveSection: {
    position: 'absolute',
    left: 16,
    top: 97,
  },
  exclusiveTitle: {
    position: 'absolute',
    fontWeight: '600',
    width: 250,
    left: 0,
    fontSize: 16,
    color: 'white',
    top: 0,
  },
  exclusiveDescription: {
    position: 'absolute',
    fontWeight: '400',
    lineHeight: 15,
    left: 0,
    color: '#cacaca',
    fontSize: 10,
    top: 30,
    width: 189,
  },
  claimButtonWrapper: {
    position: 'absolute',
    left: 210,
    top: 16,
  },
  claimButton: {
    backgroundColor: '#e56772',
    height: 30,
    borderRadius: 3,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButtonText: {
    fontWeight: '600',
    fontSize: 11,
    color: 'white',
  },
  pickedDealsTitle: {
    position: 'absolute',
    fontWeight: '600',
    left: 17,
    fontSize: 14,
    color: 'white',
    top: 197,
  },
  dealCard: {
    position: 'absolute',
    top: 238,
    width: 147,
    height: 157,
  },
  dealCard1: {
    left: 16,
  },
  dealCard2: {
    left: 179,
  },
  cardBackground: {
    position: 'absolute',
    backgroundColor: '#f3f8ff',
    height: 157,
    left: 0,
    borderRadius: 11,
    top: 0,
    width: 147,
  },
  cardHeader: {
    position: 'absolute',
    left: 3,
    top: 3,
    width: 141,
    height: 68,
  },
  cardHeaderBg1: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 242, 212, 0.67)',
    height: 68,
    left: 0,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    top: 0,
    width: 141,
  },
  cardHeaderBg2: {
    position: 'absolute',
    backgroundColor: '#dadaff',
    height: 68,
    left: 0,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    top: 0,
    width: 141,
  },
  cardImageWrapper1: {
    position: 'absolute',
    left: 7,
    borderRadius: 7,
    width: 61,
    height: 61,
    top: 4,
    overflow: 'hidden',
  },
  cardImage1: {
    position: 'absolute',
    left: '-8.47%',
    width: '115.25%',
    height: '115.25%',
    top: '-6.78%',
  },
  cardImageWrapper2: {
    position: 'absolute',
    height: 60,
    left: 6,
    top: 3,
    width: 63,
    overflow: 'hidden',
  },
  cardImage2: {
    position: 'absolute',
    height: '145.98%',
    left: '-22.83%',
    top: '-22.99%',
    width: '138.04%',
  },
  arrowIcon: {
    position: 'absolute',
    width: 29,
    height: 29,
    top: 4,
    backgroundColor: 'white',
    borderRadius: 14.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon1: {
    left: 107,
  },
  arrowIcon2: {
    left: 109,
  },
  cardContent: {
    position: 'absolute',
    left: 8,
    top: 83,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 11,
    color: 'black',
  },
  cardDescription: {
    fontWeight: '600',
    lineHeight: 12,
    color: '#868686',
    fontSize: 8,
    marginTop: 6,
  },
  cardDescription1: {
    width: 135,
  },
  cardDescription2: {
    width: 134,
  },
});