import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Image, 
  ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, 
  ActivityIndicator, Dimensions, Alert 
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dob: '', address: '', state: '', city: '', pincode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();

  const formatPhone = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const len = cleaned.length;
    if (len < 4) return cleaned;
    if (len < 7) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const getLocationFromIP = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://ip-api.com/json/');
      const data = await response.json();
      
      if (data.status === 'success') {
        setFormData({
          ...formData,
          city: data.city || '',
          state: data.region || '',
          pincode: data.zip || '',
        });
        Alert.alert('Success', `Location detected: ${data.city}, ${data.region}`);
      } else {
        Alert.alert('Error', 'Could not detect location. Please enter manually.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location. Check your internet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    // Basic Validation
    if (!formData.firstName || !formData.phone || !formData.email) {
      Alert.alert('Error', 'Please fill in required fields (Name, Email, Phone)');
      return;
    }

    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    
    const result = await signup({
      ...formData,
      phone: cleanedPhone
    });
    
    setIsLoading(false);
    
    if (!result.success) {
      Alert.alert('Error', result.error || 'Sign up failed. Please try again.');
    }
    // On success, AuthContext will update isAuthenticated and navigation will automatically switch to MainTabs
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex1}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header with back button and logo */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backCircle} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={20} color="#4A2A63" /> 
            </TouchableOpacity>
            <View style={styles.logoWrapper}>
              <Image source={require('../../src/assets/images/eggyv-logo.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.card}>
            <Text style={styles.navTitles}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start your journey</Text>
            
            {/* First & Last Name */}
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="John" 
                  placeholderTextColor="#999"
                  value={formData.firstName} 
                  onChangeText={(t)=>setFormData({...formData, firstName:t})} 
                  editable={!isLoading}
                />
              </View>
              <View style={styles.rowDivider} />
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="Doe" 
                  placeholderTextColor="#999"
                  value={formData.lastName} 
                  onChangeText={(t)=>setFormData({...formData, lastName:t})} 
                  editable={!isLoading}
                />
              </View>
            </View>

            <Text style={styles.label}>Email Address</Text>
            <TextInput 
              style={styles.input} 
              placeholder="john@example.com" 
              placeholderTextColor="#999"
              keyboardType="email-address" 
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(t)=>setFormData({...formData, email:t})}
              editable={!isLoading}
            />

            <View style={styles.vSpacer} />

            <Text style={styles.label}>Cell Phone Number</Text>
            <View style={styles.phoneWrapper}>
              <View style={styles.flagArea}>
                <Text style={styles.flag}>🇺🇸</Text>
                <Text style={styles.code}>+1</Text>
                <View style={styles.verticalDivider} />
              </View>
              <TextInput 
                style={styles.phoneInput} 
                placeholder="(212) 555-5555" 
                placeholderTextColor="#999"
                keyboardType="phone-pad" 
                value={formData.phone} 
                onChangeText={(t) => setFormData({...formData, phone: formatPhone(t)})} 
                maxLength={14} 
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.locationBtn, isLoading && { opacity: 0.7 }]} 
              onPress={getLocationFromIP}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#4A2A63" size="small" />
              ) : (
                <View style={styles.innerBtnRow}>
                  <Icon name="map-pin" size={14} color="#4A2A63" style={styles.iconMargin} />
                  <Text style={styles.locationBtnText}>Auto-detect City & State</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.label}>Street Address</Text>
            <TextInput 
              style={[styles.input, {marginBottom: 15}]} 
              placeholder="123 Main St" 
              placeholderTextColor="#999"
              value={formData.address}
              onChangeText={(t)=>setFormData({...formData, address:t})}
              editable={!isLoading}
            />

            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>City</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.city} 
                  placeholder="City" 
                  placeholderTextColor="#999"
                  onChangeText={(t)=>setFormData({...formData, city:t})}
                  editable={!isLoading}
                />
              </View>
              <View style={styles.rowDivider} />
              <View style={styles.inputGroup}>
                <Text style={styles.label}>State</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.state} 
                  placeholder="State" 
                  placeholderTextColor="#999"
                  onChangeText={(t)=>setFormData({...formData, state:t})}
                  editable={!isLoading}
                />
              </View>
            </View>

            <Text style={styles.label}>Pincode</Text>
            <TextInput 
              style={styles.input} 
              placeholder="12345" 
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={formData.pincode}
              onChangeText={(t)=>setFormData({...formData, pincode:t})}
              editable={!isLoading}
            />

            <TouchableOpacity 
              style={[styles.signUpBtn, isLoading && styles.disabledButton]} 
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.signUpBtnText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
              <Text style={styles.loginLink}>Login Here</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFBFF' },
  flex1: { flex: 1 },
  scrollContent: { padding: 20, alignItems: 'center' },
  
  // Header styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.92,
    marginVertical: 15,
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  logo: { 
    width: 140, 
    height: 60 
  },
  headerSpacer: { 
    width: 38, // Same width as backCircle for balanced alignment
  },
  
  card: {
    width: width * 0.92,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  navTitles: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#333', 
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 15 },
  rowDivider: { width: 15 },
  inputGroup: { flex: 1 },
  label: { fontSize: 12, fontWeight: '700', color: '#4A2A63', marginBottom: 6 },
  input: { 
    height: 48, 
    backgroundColor: '#F5F6FA', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    color: '#333', // This ensures text is dark
    borderWidth: 1, 
    borderColor: '#EEE' 
  },
  vSpacer: { height: 15 },
  phoneWrapper: { 
    flexDirection: 'row', 
    height: 48, 
    backgroundColor: '#F5F6FA', 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#EEE', 
    marginBottom: 15,
    alignItems: 'center', // Ensure vertical alignment
  },
  flagArea: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingLeft: 10,
    height: '100%', // Take full height
  },
  flag: { fontSize: 16, marginRight: 4 },
  code: { fontSize: 14, fontWeight: '600', color: '#333' },
  verticalDivider: { 
    width: 1, 
    height: 20, 
    backgroundColor: '#DDD', 
    marginHorizontal: 10 
  },
  phoneInput: { 
    flex: 1, 
    fontSize: 14,
    color: '#333', // Explicitly set text color to dark
    paddingVertical: 0, // Remove default padding
    height: '100%', // Take full height
  },
  locationBtn: { 
    padding: 12, 
    borderRadius: 10, 
    backgroundColor: '#F0EAF5', 
    color: '#000',
    borderStyle: 'dashed', 
    borderWidth: 1, 
    borderColor: '#4A2A63', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 15 
  },
  innerBtnRow: { flexDirection: 'row', alignItems: 'center' },
  iconMargin: { marginRight: 8 },
  locationBtnText: { color: '#4A2A63', fontWeight: 'bold', fontSize: 13 },
  signUpBtn: { backgroundColor: '#4A2A63', height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  signUpBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { opacity: 0.6 },
  footer: { flexDirection: 'row', marginTop: 25, marginBottom: 30 },
  footerText: { color: '#777', fontSize: 14 },
  loginLink: { color: '#4A2A63', fontWeight: '800', fontSize: 14, textDecorationLine: 'underline' }
});

export default SignUpScreen;