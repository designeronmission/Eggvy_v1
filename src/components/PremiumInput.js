import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { COLORS, FONTS, BORDER_RADIUS, SPACING, SHADOWS } from '../theme/theme';

const PremiumInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  maxLength,
  error,
  hint,
  disabled = false,
  onFocus,
  onBlur,
  returnKeyType = 'next',
  onSubmitEditing,
  containerStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e) => {
    setIsFocused(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1.02,
        useNativeDriver: true,
        tension: 150,
        friction: 5,
      }),
      Animated.spring(translateYAnim, {
        toValue: -2,
        useNativeDriver: true,
        tension: 150,
        friction: 5,
      }),
    ]).start();
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 5,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 5,
      }),
    ]).start();
    onBlur && onBlur(e);
  };

  return (
    <Animated.View style={[
      styles.container,
      containerStyle,
      {
        transform: [
          { scale: scaleAnim },
          { translateY: translateYAnim }
        ]
      }
    ]}>
      {label && (
        <Text style={[
          styles.label,
          isFocused && styles.labelFocused,
          error && styles.labelError
        ]}>
          {label}
        </Text>
      )}
      
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        error && styles.inputWrapperError,
        disabled && styles.inputWrapperDisabled
      ]}>
        {icon && (
          <Feather 
            name={icon} 
            size={20} 
            color={isFocused ? COLORS.primary : COLORS.textLight} 
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            secureTextEntry && styles.inputPassword,
            disabled && styles.inputDisabled
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          maxLength={maxLength}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          selectionColor={COLORS.primary}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        )}
      </View>

      {hint && !error && (
        <Text style={styles.hint}>{hint}</Text>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={14} color={COLORS.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
    letterSpacing: 0.3,
  },
  labelFocused: {
    color: COLORS.primary,
  },
  labelError: {
    color: COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    minHeight: 56,
    transition: 'all 0.3s',
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    ...SHADOWS.small,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  inputWrapperDisabled: {
    backgroundColor: '#f1f5f9',
    opacity: 0.7,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: SPACING.md,
    fontFamily: 'System',
  },
  inputPassword: {
    paddingRight: SPACING.xl,
  },
  inputDisabled: {
    color: COLORS.textLight,
  },
  eyeIcon: {
    padding: SPACING.sm,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  error: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
});

export default PremiumInput;