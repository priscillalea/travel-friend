import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTripPhase } from '../context/PhaseContext';
import { colors, layout, radii, spacing, typography } from '../theme';
import { PhaseSwitch } from './PhaseSwitch';

export interface ScreenShellProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  children?: React.ReactNode;
}

export function ScreenShell({ title, subtitle, badgeText, children }: ScreenShellProps) {
  const { phase, setPhase } = useTripPhase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PhaseSwitch value={phase} onChange={setPhase} style={styles.phaseSwitch} />

        <View style={styles.headerBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Fase ativa: {phase.toUpperCase()}</Text>
            {badgeText ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeText}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.dashedDivider} />
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.screen,
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
  },
  phaseSwitch: {
    marginBottom: spacing.lg,
  },
  headerBlock: {
    marginBottom: spacing.lg,
    gap: spacing.xxs,
  },
  title: {
    ...typography.screenTitle,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: radii.card,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...typography.cardSubtitle,
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.action.primaryBg,
    borderRadius: radii.chip,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeText: {
    ...typography.labelStrong,
    color: colors.action.primaryText,
  },
  dashedDivider: {
    borderBottomWidth: layout.dashedBorderWidth,
    borderColor: colors.border.dashed,
    borderStyle: 'dashed',
    marginVertical: spacing.sm,
  },
});
