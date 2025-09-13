// FloatingEnrollButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  StyleProp,
} from 'react-native';

type Props = {
  title?: string;
  subtitle?: string | null;
  onPress?: (e: GestureResponderEvent) => void;
  bottom?: number; // distance from bottom of the screen (default sits above nav)
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
};

const FloatingEnrollButton: React.FC<Props> = ({
  title = 'Enroll Now',
  subtitle = 'Starts 13 Sep',
  onPress,
  bottom = 72,
  containerStyle,
  buttonStyle,
}) => {
  return (
    <View style={[styles.container, { bottom }, containerStyle]}>
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={onPress}
        style={[styles.button, buttonStyle]}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
    elevation: 20,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 10,   // reduced vertical padding
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 16,         // reduced title size
    fontWeight: '700',
    lineHeight: 22,
    color: '#ffffff',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 8,         // reduced subtitle size
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.85,
  },
});

export default FloatingEnrollButton;
