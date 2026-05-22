// src/screens/OTPScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const OTPScreen = ({ navigation }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // Handle typing in the boxes
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    // Only take the last character typed
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Navigate to PIN screen when all digits are filled
    if (text && index === 5) {
      const fullOtp = [...newOtp.slice(0, 5), text].join('');
      if (fullOtp.length === 6) {
        Keyboard.dismiss();
        setTimeout(() => {
          navigation.navigate('SetPin');
        }, 300);
      }
    }
  };

  // Handle backspace to go to previous box
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOTP = () => {
    const fullOtp = otp.join('');
    if (fullOtp.length === 6) {
      Keyboard.dismiss();
      navigation.navigate('SetPin');
    }
  };

  const handleResendCode = () => {
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0].focus();
  };

  // Handle keyboard submit button (tick/done)
  const handleSubmitEditing = (index) => {
    if (index === 5) {
      handleVerifyOTP();
    } else {
      // Move to next input if current is filled
      if (otp[index] && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonCircle}>
            <Icon name="arrow-left" size={24} color="#4A2A63" />
          </View>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoSection}>
          <Image 
            source={require('../assets/images/eggyv-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* OTP Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Verify Your Number</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to{'\n'}
            <Text style={styles.phoneHighlight}>
              (212) 555-5555
            </Text>
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter OTP Code</Text>
            
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => inputRefs.current[index] = ref}
                  style={[
                    styles.otpInput,
                    digit !== '' && styles.otpInputFilled
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onSubmitEditing={() => handleSubmitEditing(index)}
                  returnKeyType={index === 5 ? "done" : "next"}
                  blurOnSubmit={false}
                  selectTextOnFocus
                />
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.verifyButton} 
            activeOpacity={0.9}
            onPress={handleVerifyOTP}
          >
            <Text style={styles.verifyText}>Verify & Continue</Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendActive}>Resend Code</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Wrong number? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFBFF',
  },
  flexContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 20,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A2A63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  logoSection: {
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 80,
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    shadowColor: '#4A2A63',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  phoneHighlight: {
    color: '#4A2A63',
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 13,
    color: '#4A2A63',
    fontWeight: '700',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  otpInput: {
    width: 42,
    height: 55,
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  otpInputFilled: {
    borderColor: '#4A2A63',
    backgroundColor: '#FFF',
  },
  verifyButton: {
    height: 50,
    backgroundColor: '#4A2A63',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A2A63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 15,
  },
  verifyText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  resendActive: {
    color: '#4A2A63',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  footerText: {
    color: '#777',
    fontSize: 14,
  },
  editLink: {
    color: '#4A2A63',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default OTPScreen;