import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { PHASE_TAB_LABELS, TabBar } from '../../src/components/TabBar';
import { useTripPhase } from '../../src/context/PhaseContext';

const ROUTE_KEYS = ['index', 'comer', 'viagem', 'assistente'] as const;

export default function TabsLayout() {
  const { phase } = useTripPhase();
  const router = useRouter();
  const labels = PHASE_TAB_LABELS[phase];

  const items = ROUTE_KEYS.map((key, idx) => ({
    key,
    label: labels[idx],
  }));

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state }) => {
        const activeRouteName = state.routes[state.index]?.name ?? 'index';
        return (
          <TabBar
            items={items}
            activeKey={activeRouteName}
            onTabPress={(key) => {
              const targetPath = key === 'index' ? '/' : `/(tabs)/${key}`;
              router.replace(targetPath as '/');
            }}
          />
        );
      }}
    >
      <Tabs.Screen name="index" options={{ title: labels[0] }} />
      <Tabs.Screen name="comer" options={{ title: labels[1] }} />
      <Tabs.Screen name="viagem" options={{ title: labels[2] }} />
      <Tabs.Screen name="assistente" options={{ title: labels[3] }} />
    </Tabs>
  );
}
