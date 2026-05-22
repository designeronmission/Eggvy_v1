import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, FONTS, BORDER_RADIUS, SPACING, SHADOWS } from '../theme/theme';

const PremiumButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'large',
  icon = null,
  iconPosition = 'left',
  style = {},
  textStyle = {},
  gradientColors = null,
  fullWidth = true,
}) => {
  
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.lg,
          fontSize: 14,
        };
      case 'medium':
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.xl,
          fontSize: 16,
        };
      case 'large':
        return {
          paddingVertical: SPACING.lg,
          paddingHorizontal: SPACING.xxl,
          fontSize: 18,
        };
      default:
        return {
          paddingVertical: SPACING.lg,
          paddingHorizontal: SPACING.xxl,
          fontSize: 18,
        };
    }
  };

  const buttonSize = getButtonSize();

  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: gradientColors || COLORS.gradient.primary,
          textColor: '#ffffff',
          borderWidth: 0,
          shadow: SHADOWS.large,
        };
      case 'secondary':
        return {
          background: gradientColors || COLORS.gradient.secondary,
          textColor: '#ffffff',
          borderWidth: 0,
          shadow: SHADOWS.medium,
        };
      case 'outline':
        return {
          background: ['transparent', 'transparent'],
          textColor: COLORS.primary,
          borderWidth: 2,
          borderColor: COLORS.primary,
          shadow: null,
        };
      case 'glass':
        return {
          background: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.2)'],
          textColor: '#ffffff',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
          shadow: null,
        };
      default:
        return {
          background: COLORS.gradient.primary,
          textColor: '#ffffff',
          borderWidth: 0,
          shadow: SHADOWS.large,
        };
    }
  };

  const buttonVariant = getButtonStyles();

  const ButtonContent = () => (
    <View style={[
      styles.buttonContent,
      iconPosition === 'right' && styles.buttonContentReverse
    ]}>
      {icon && iconPosition === 'left' && icon}
      <Text style={[
        styles.buttonText,
        { color: buttonVariant.textColor, fontSize: buttonSize.fontSize },
        textStyle
      ]}>
        {title}
      </Text>
      {icon && iconPosition === 'right' && icon}
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={buttonVariant.textColor} 
          style={styles.loader}
        />
      )}
    </View>
  );

  if (variant === 'outline' || variant === 'glass') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          {
            paddingVertical: buttonSize.paddingVertical,
            paddingHorizontal: buttonSize.paddingHorizontal,
            borderWidth: buttonVariant.borderWidth,
            borderColor: buttonVariant.borderColor,
            backgroundColor: variant === 'glass' ? 'rgba(255,255,255,0.1)' : 'transparent',
            width: fullWidth ? '100%' : 'auto',
          },
          disabled && styles.buttonDisabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <ButtonContent />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[styles.container, fullWidth && { width: '100%' }, style]}
    >
      <LinearGradient
        colors={buttonVariant.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradientButton,
          buttonVariant.shadow,
          {
            paddingVertical: buttonSize.paddingVertical,
            paddingHorizontal: buttonSize.paddingHorizontal,
          },
          disabled && styles.gradientDisabled,
        ]}
      >
        <ButtonContent />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.xl,
  },
  gradientDisabled: {
    opacity: 0.5,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContentReverse: {
    flexDirection: 'row-reverse',
  },
  buttonText: {
    fontFamily: 'System',
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  loader: {
    marginLeft: SPACING.sm,
  },
});

export default PremiumButton;