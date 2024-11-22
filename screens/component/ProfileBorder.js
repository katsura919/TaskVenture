import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

const ProfileBorder = ({ children, size = 100, colors = ['#4caf50', '#ff5722', '#2196f3', '#ffeb3b'] }) => {
  const borderAnimation = useRef(new Animated.Value(0)).current;

  // Set up the animation loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        ...colors.map((_, index) =>
          Animated.timing(borderAnimation, {
            toValue: index + 1,
            duration: 2000,
            useNativeDriver: false,
          })
        ),
      ])
    ).start();
  }, [colors]);

  // Interpolate the borderColor animation value
  const borderColor = borderAnimation.interpolate({
    inputRange: colors.map((_, index) => index),
    outputRange: colors,
  });

  return (
    <Animated.View
      style={[
        styles.border,
        {
          borderColor,
          width: size + 10, // Adjust border size relative to image size
          height: size + 10,
          borderRadius: (size + 10) / 2,
        },
      ]}
    >
      <View style={{ width: size, height: size, borderRadius: size / 2 }}>{children}</View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  border: {
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileBorder;
