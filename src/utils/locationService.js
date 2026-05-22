import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export const requestLocationPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      if (status === 'granted') {
        return true;
      } else if (status === 'denied') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access in your device settings to auto-fill your address.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
      return false;
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to auto-fill your address',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Location Permission Required',
          'You have permanently denied location permission. Please enable it in your device settings to auto-fill your address.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to auto-fill your address. You can enter your address manually.');
        return false;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Permission error:', error);
    return false;
  }
};

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error('Location error:', error);
        let errorMessage = 'Failed to get your location';
        
        switch (error.code) {
          case 1:
            errorMessage = 'Location permission denied';
            break;
          case 2:
            errorMessage = 'Location unavailable';
            break;
          case 3:
            errorMessage = 'Location request timed out';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      { 
        enableHighAccuracy: true, 
        timeout: 30000, 
        maximumAge: 10000,
        accuracy: {
          android: 'high',
          ios: 'best'
        }
      }
    );
  });
};

// Reverse geocoding to get address from coordinates using OpenStreetMap (free, no API key)
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'YourAppName/1.0' // Replace with your app name
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    
    // Parse address components
    const address = data.address || {};
    
    return {
      fullAddress: data.display_name || '',
      street: address.road || address.pedestrian || address.street || '',
      city: address.city || address.town || address.village || address.hamlet || '',
      state: address.state || address.state_district || '',
      zipcode: address.postcode || '',
      country: address.country || '',
      suburb: address.suburb || '',
      neighbourhood: address.neighbourhood || ''
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

// Alternative using Google Maps Geocoding (requires API key)
export const getAddressFromCoordinatesGoogle = async (latitude, longitude) => {
  try {
    const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Add your Google Maps API key here
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const addressComponents = data.results[0].address_components;
      
      let street = '';
      let city = '';
      let state = '';
      let zipcode = '';
      
      addressComponents.forEach(component => {
        if (component.types.includes('route')) {
          street = component.long_name;
        }
        if (component.types.includes('locality')) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
        if (component.types.includes('postal_code')) {
          zipcode = component.long_name;
        }
      });
      
      return {
        fullAddress: data.results[0].formatted_address,
        street,
        city,
        state,
        zipcode,
        country: '',
        suburb: '',
        neighbourhood: ''
      };
    }
    
    throw new Error('No address found');
  } catch (error) {
    console.error('Google Geocoding error:', error);
    throw error;
  }
};