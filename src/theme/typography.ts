import { TextStyle } from 'react-native';

/**
 * Famílias tipográficas (Seção 3 do TROCADO_SPEC.md)
 * - Inter Display para títulos e valores monetários (700 a 800, tracking -0.02em a -0.03em).
 * - Inter para texto e rótulos (500 a 600).
 */
export const fontFamilies = {
  displayBold: 'InterDisplay_700Bold',
  displayExtraBold: 'InterDisplay_800ExtraBold',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const fontSizes = {
  tab: 11,
  labelSm: 12,
  label: 13,
  body: 15,
  card: 16,
  cardLg: 18,
  screenTitle: 28,
  valueMd: 32,
  valueLg: 40,
} as const;

export const typography = {
  screenTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes.screenTitle,
    lineHeight: Math.round(fontSizes.screenTitle * 1.1),
    fontWeight: '700',
    letterSpacing: -0.025 * fontSizes.screenTitle,
  } satisfies TextStyle,

  valueLarge: {
    fontFamily: fontFamilies.displayExtraBold,
    fontSize: fontSizes.valueLg,
    lineHeight: Math.round(fontSizes.valueLg * 1.1),
    fontWeight: '800',
    letterSpacing: -0.03 * fontSizes.valueLg,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,

  valueMedium: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes.valueMd,
    lineHeight: Math.round(fontSizes.valueMd * 1.15),
    fontWeight: '700',
    letterSpacing: -0.02 * fontSizes.valueMd,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,

  cardTitle: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.cardLg,
    lineHeight: 22,
    fontWeight: '600',
  } satisfies TextStyle,

  cardSubtitle: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.card,
    lineHeight: 20,
    fontWeight: '600',
  } satisfies TextStyle,

  moneyRow: {
    fontFamily: fontFamilies.displayBold,
    fontSize: fontSizes.cardLg,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.02 * fontSizes.cardLg,
    fontVariant: ['tabular-nums'],
  } satisfies TextStyle,

  body: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.body,
    lineHeight: 21,
    fontWeight: '500',
  } satisfies TextStyle,

  label: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.label,
    lineHeight: 17,
    fontWeight: '500',
  } satisfies TextStyle,

  labelStrong: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.label,
    lineHeight: 17,
    fontWeight: '600',
  } satisfies TextStyle,

  labelSmall: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.labelSm,
    lineHeight: 16,
    fontWeight: '500',
  } satisfies TextStyle,

  tab: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.tab,
    lineHeight: 14,
    fontWeight: '500',
  } satisfies TextStyle,

  tabActive: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: fontSizes.tab,
    lineHeight: 14,
    fontWeight: '700',
  } satisfies TextStyle,
} as const;
