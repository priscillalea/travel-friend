import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, layout, radii, typography } from '../theme';
import { TripPhase } from './PhaseSwitch';

export interface TabBarItem {
  key: string;
  label: string;
}

export const PHASE_TAB_LABELS: Record<TripPhase, readonly [string, string, string, string]> = {
  antes: ['Plano', 'Passeios', 'Reservas', 'Tickets'],
  durante: ['Listas', 'Comer', 'Viagem', 'Assistente'],
  depois: ['Resumo', 'Fotos', 'Gastos', 'Perfil'],
};

export const DEFAULT_TABS: readonly TabBarItem[] = [
  { key: 'index', label: 'Listas' },
  { key: 'comer', label: 'Comer' },
  { key: 'viagem', label: 'Viagem' },
  { key: 'assistente', label: 'Assistente' },
];

export interface TabBarProps {
  items?: readonly TabBarItem[];
  activeKey: string;
  onTabPress: (key: string) => void;
  style?: ViewStyle;
}

/**
 * TabBar oficial do Trocado (Seção 3 do TROCADO_SPEC.md):
 * - 84 de altura, fundo branco
 * - Ícone com raio 8 (22x22)
 * - Item ativo em `mar` (#0B3C5D) com rótulo em negrito (11px)
 */
export function TabBar({ items = DEFAULT_TABS, activeKey, onTabPress, style }: TabBarProps) {
  return (
    <View accessibilityRole="tablist" style={[styles.container, style]} testID="trocado-tab-bar">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={item.label}
            onPress={() => onTabPress(item.key)}
            style={styles.tabItem}
            testID={`tab-item-${item.key}`}
          >
            <View
              style={[styles.iconBox, isActive ? styles.iconBoxActive : styles.iconBoxInactive]}
            />
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: layout.tabBarHeight,
    backgroundColor: colors.tabBar.background,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 12,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconBox: {
    width: layout.tabIconSize,
    height: layout.tabIconSize,
    borderRadius: radii.tabIcon,
  },
  iconBoxActive: {
    backgroundColor: colors.tabBar.activeIcon,
  },
  iconBoxInactive: {
    backgroundColor: colors.tabBar.inactiveIcon,
  },
  label: {
    ...typography.tab,
  },
  labelActive: {
    ...typography.tabActive,
    color: colors.tabBar.activeText,
  },
  labelInactive: {
    ...typography.tab,
    color: colors.tabBar.inactiveText,
  },
});
