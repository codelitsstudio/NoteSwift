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
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
};

const FloatingEnrollButton: React.FC<Props> = ({
  title = 'Enroll Now',
  subtitle = 'Starts instantly',
  onPress,
  containerStyle,
  buttonStyle,
}) => {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View style={styles.innerContainer}>
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={onPress}
          style={[styles.button, buttonStyle]}
        >
          <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    backgroundColor: '#ffffff', // white background around button
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  innerContainer: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    backgroundColor: '#3B82F6', // blue like checkout
    paddingVertical: 16,
    borderRadius: 24, // rounded-3xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280', // gray like Checkout subtitle
    textAlign: 'center',
  },
});

export default FloatingEnrollButton;
