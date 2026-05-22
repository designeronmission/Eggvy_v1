// src/screens/SetPinScreen.js
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

const SetPinScreen = ({ navigation }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const [step, setStep] = useState(1);
  const [showPin, setShowPin] = useState(false);
  
  const pinInputRefs = useRef([]);
  const confirmInputRefs = useRef([]);

  useEffect(() => {
    setTimeout(() => {
      if (pinInputRefs.current[0]) {
        pinInputRefs.current[0].focus();
      }
    }, 100);
  }, []);

  const handlePinChange = (text, index, isConfirm = false) => {
    if (isConfirm) {
      const newConfirmPin = [...confirmPin];
      newConfirmPin[index] = text.slice(-1);
      setConfirmPin(newConfirmPin);

      if (text && index < 3) {
        confirmInputRefs.current[index + 1].focus();
      }

      if (text && index === 3) {
        const fullConfirmPin = [...newConfirmPin.slice(0, 3), text].join('');
        if (fullConfirmPin.length === 4) {
          Keyboard.dismiss();
          setTimeout(() => {
            navigation.replace('MainTabs');
          }, 300);
        }
      }
    } else {
      const newPin = [...pin];
      newPin[index] = text.slice(-1);
      setPin(newPin);

      if (text && index < 3) {
        pinInputRefs.current[index + 1].focus();
      }

      if (text && index === 3) {
        Keyboard.dismiss();
        setTimeout(() => {
          setStep(2);
          setTimeout(() => {
            if (confirmInputRefs.current[0]) {
              confirmInputRefs.current[0].focus();
            }
          }, 100);
        }, 300);
      }
    }
  };

  const handleKeyPress = (e, index, isConfirm = false) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (isConfirm) {
        if (!confirmPin[index] && index > 0) {
          confirmInputRefs.current[index - 1].focus();
        }
      } else {
        if (!pin[index] && index > 0) {
          pinInputRefs.current[index - 1].focus();
        }
      }
    }
  };

  const handleSubmitEditing = (index, isConfirm = false) => {
    if (isConfirm) {
      if (index === 3) {
        const fullConfirmPin = confirmPin.join('');
        if (fullConfirmPin.length === 4) {
          navigation.replace('MainTabs');
        }
      } else if (confirmPin[index] && index < 3) {
        confirmInputRefs.current[index + 1].focus();
      }
    } else {
      if (index === 3) {
        const fullPin = pin.join('');
        if (fullPin.length === 4) {
          setStep(2);
          setTimeout(() => {
            if (confirmInputRefs.current[0]) {
              confirmInputRefs.current[0].focus();
            }
          }, 100);
        }
      } else if (pin[index] && index < 3) {
        pinInputRefs.current[index + 1].focus();
      }
    }
  };

  const handleSetPin = () => {
    const fullPin = pin.join('');
    const fullConfirmPin = confirmPin.join('');
    if (fullPin.length === 4 && fullConfirmPin.length === 4) {
      navigation.replace('MainTabs');
    }
  };

  const renderPinDots = (pinArray, isConfirm) => {
    return (
      <View style={styles.pinContainer}>
        {pinArray.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => isConfirm 
              ? confirmInputRefs.current[index] = ref 
              : pinInputRefs.current[index] = ref
            }
            style={[
              styles.pinInput,
              digit !== '' && styles.pinInputFilled
            ]}
            keyboardType="number-pad"
            maxLength={1}
            secureTextEntry={!showPin}
            value={digit}
            onChangeText={(text) => handlePinChange(text, index, isConfirm)}
            onKeyPress={(e) => handleKeyPress(e, index, isConfirm)}
            onSubmitEditing={() => handleSubmitEditing(index, isConfirm)}
            returnKeyType={index === 3 ? "done" : "next"}
            blurOnSubmit={false}
            selectTextOnFocus
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        {/* Custom Back Button with Circle Background */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            Keyboard.dismiss();
            if (step === 2) {
              setStep(1);
              setTimeout(() => {
                if (pinInputRefs.current[3]) {
                  pinInputRefs.current[3].focus();
                }
              }, 100);
            } else {
              navigation.goBack();
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonCircle}>
            <Icon name="arrow-left" size={24} color="#4A2A63" />
          </View>
        </TouchableOpacity>

        {/* Top Logo Area */}
        <View style={styles.logoSection}>
          <Image 
            source={require('../assets/images/eggyv-logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* PIN Card */}
        <View style={styles.card}>
          <Text style={styles.title}>
            {step === 1 ? 'Create Your PIN' : 'Confirm Your PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'Set a 4-digit PIN for quick access' 
              : 'Enter the same PIN again to confirm'}
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.pinHeader}>
              <Text style={styles.label}>
                {step === 1 ? 'Enter PIN' : 'Confirm PIN'}
              </Text>
              <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                <Icon 
                  name={showPin ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#4A2A63" 
                />
              </TouchableOpacity>
            </View>
            
            {step === 1 
              ? renderPinDots(pin, false)
              : renderPinDots(confirmPin, true)
            }
          </View>

          {step === 2 && (
            <TouchableOpacity 
              style={styles.setPinButton} 
              activeOpacity={0.9}
              onPress={handleSetPin}
            >
              <Text style={styles.setPinText}>Set PIN & Continue</Text>
            </TouchableOpacity>
          )}
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
  inputContainer: {
    marginBottom: 25,
  },
  pinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    color: '#4A2A63',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  pinInput: {
    width: 55,
    height: 65,
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  pinInputFilled: {
    borderColor: '#4A2A63',
    backgroundColor: '#FFF',
  },
  setPinButton: {
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
  },
  setPinText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SetPinScreen;