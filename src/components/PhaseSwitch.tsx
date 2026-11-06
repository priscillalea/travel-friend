import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, typography } from '../theme';

export type TripPhase = 'antes' | 'durante' | 'depois';

export interface PhaseOption {
  id: TripPhase;
  label: string;
}

export const TRIP_PHASES: readonly PhaseOption[] = [
  { id: 'antes', label: 'Antes' },
  { id: 'durante', label: 'Durante' },
  { id: 'depois', label: 'Depois' },
] as const;

export interface PhaseSwitchProps {
  value: TripPhase;
  onChange: (phase: TripPhase) => void;
  style?: ViewStyle;
}

/**
 * Seletor de fase da viagem no topo: Antes (planejar), Durante (usar), Depois (lembrar).
 */
export function PhaseSwitch({ value, onChange, style }: PhaseSwitchProps) {
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Fase da viagem"
      style={[styles.container, style]}
    >
      {TRIP_PHASES.map((phase) => {
        const isActive = phase.id === value;
        return (
          <Pressable
            key={phase.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Fase ${phase.label}`}
            onPress={() => onChange(phase.id)}
            style={[styles.pill, isActive && styles.pillActive]}
            testID={`phase-pill-${phase.id}`}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {phase.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.phaseSwitch.trackBg,
    borderRadius: radii.pill,
    padding: 4,
    alignItems: 'center',
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: colors.phaseSwitch.activePillBg,
  },
  label: {
    ...typography.label,
  },
  labelActive: {
    ...typography.labelStrong,
    color: colors.phaseSwitch.activeText,
  },
  labelInactive: {
    ...typography.label,
    color: colors.phaseSwitch.inactiveText,
  },
});
