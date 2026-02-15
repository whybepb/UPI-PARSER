import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import AnimatedBackground from '../components/auth/AnimatedBackground';
import GlassCard from '../components/auth/GlassCard';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { Spacing } from '../constants/theme';

const CARD_PADDING = Spacing.lg;

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const toggleForm = () => {
    // Fade out + slide current form, then swap, then fade in + slide new form
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isLogin ? -30 : 30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsLogin((prev) => !prev);
      slideAnim.setValue(isLogin ? 30 : -30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <AnimatedBackground>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardWrapper}>
            <GlassCard>
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                }}
              >
                {isLogin ? (
                  <LoginForm onToggle={toggleForm} />
                ) : (
                  <SignupForm onToggle={toggleForm} />
                )}
              </Animated.View>
            </GlassCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: CARD_PADDING,
    paddingVertical: Spacing.xxl,
  },
  cardWrapper: {
    width: '100%',
  },
});
