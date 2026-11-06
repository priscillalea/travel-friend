import { colors, darkColors, lightColors, palette, SemanticColors } from './colors';
import { radii } from './radii';
import { layout, spacing } from './spacing';
import { fontFamilies, fontSizes, typography } from './typography';

export const theme = {
  colors,
  palette,
  lightColors,
  darkColors,
  typography,
  fontFamilies,
  fontSizes,
  spacing,
  layout,
  radii,
} as const;

export type Theme = typeof theme;

export {
  colors,
  darkColors,
  fontFamilies,
  fontSizes,
  layout,
  lightColors,
  palette,
  radii,
  SemanticColors,
  spacing,
  typography,
};
