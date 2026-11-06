import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ItineraryProvider } from '../src/context/ItineraryContext';
import { PhaseProvider } from '../src/context/PhaseContext';
import { ShoppingListProvider } from '../src/context/ShoppingListContext';
import { useTrocadoFonts } from '../src/theme/fonts';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useTrocadoFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PhaseProvider initialPhase="durante">
      <ShoppingListProvider>
        <ItineraryProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="scanner" options={{ presentation: 'modal' }} />
          </Stack>
        </ItineraryProvider>
      </ShoppingListProvider>
    </PhaseProvider>
  );
}
