import "@/lib/i18n";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import Toast from "react-native-toast-message";

// const RootLayout = () => {
//   const [fontsLoaded, fontError] = useFonts({
//     "Inter-Regular": Inter_400Regular,
//     "Inter-Medium": Inter_500Medium,
//     "Inter-SemiBold": Inter_600SemiBold,
//     "Inter-Bold": Inter_700Bold,
//   });

//   const { theme, isDark } = useTheme();

//   useEffect(() => {
//     if (fontsLoaded || fontError) {
//       SplashScreen.hideAsync();
//     }
//   }, [fontsLoaded, fontError]);

//   if (!fontsLoaded && !fontError) {
//     return <Text>Error Loading fonts</Text>;
//   }

//   return (
//     <ThemeProvider>
//       <AuthProvider>
//         <GestureHandlerRootView style={{ flex: 1 }}>
//           <Stack screenOptions={{ headerShown: false }}>
//             <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//             <Stack.Screen name="destination" options={{ headerShown: false }} />
//             <Stack.Screen name="filter" options={{ presentation: "modal" }} />

//             <Stack.Screen name="+not-found" />
//           </Stack>
//           <StatusBar style={isDark ? "light" : "dark"} />
//           <Toast position="bottom" bottomOffset={20} swipeable />
//         </GestureHandlerRootView>
//       </AuthProvider>
//     </ThemeProvider>
//   );
// };

// Main layout component
function RootLayoutContent() {
  const { theme, isDark } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen
          name="destination/[id]"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="filters"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Toast position="bottom" bottomOffset={20} swipeable />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
