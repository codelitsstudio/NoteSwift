
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { cssInterop } from 'nativewind';
import 'react-native-reanimated';
import "../global.css"
import { useColorScheme } from '@/hooks/useColorScheme';
import 'react-native-reanimated';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

cssInterop(AntDesign, {
    className: {
        target: "style",
    },
});
cssInterop(MaterialIcons, {
    className: {
        target: "style",
    },
});

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });

    if (!loaded) {
        // Async font loading only occurs in development.
        return null;
    }

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <BottomSheetModalProvider>
                <Stack screenOptions={{  contentStyle: { backgroundColor: '#121212' }, }}>
                    <Stack.Screen name="onboarding/welcome" options={{headerShown: true, headerTitle: ""}} />
                    <Stack.Screen name="onboarding/login" options={{headerShown: true, headerTitle: ""}}/>
                    <Stack.Screen name="onboarding/register" />
                </Stack>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );
}
