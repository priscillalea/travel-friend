/**
 * Forma e espaçamento (Seção 3 do TROCADO_SPEC.md)
 * - Margem lateral das telas: 20.
 * - Painel inferior (bottom sheet): alça de 40x5.
 * - Tab bar: 84 de altura.
 */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  screenHorizontal: 20,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const layout = {
  screenPaddingHorizontal: 20,
  tabBarHeight: 84,
  tabIconSize: 22,
  bottomSheetHandleWidth: 40,
  bottomSheetHandleHeight: 5,
  dashedBorderWidth: 1,
} as const;
