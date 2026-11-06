/**
 * Paleta oficial do Trocado (Seção 3 do TROCADO_SPEC.md)
 * Regra: amarelo (sol) é sempre a ação ou o número mais importante da tela.
 * Verde (poupanca) só para economia ou sucesso.
 */
export const palette = {
  mar: '#0B3C5D',
  sol: '#FFC93C',
  poupanca: '#17A36B',
  nevoa: '#EEF3F6',
  ceu: '#CFE3EE',
  tinta: '#0A1B2A',
  textoMudo: '#5E7384',
  'texto-mudo': '#5E7384',
  branco: '#FFFFFF',
  picote: '#CFDCE5',
} as const;

export interface SemanticColors {
  // Tokens nominais da especificação
  mar: string;
  sol: string;
  poupanca: string;
  nevoa: string;
  ceu: string;
  tinta: string;
  textoMudo: string;
  'texto-mudo': string;
  branco: string;

  // Tokens semânticos para suportar modo escuro futuramente
  background: {
    screen: string;
    card: string;
    secondary: string;
    headerDark: string;
    bottomSheet: string;
  };
  text: {
    primary: string;
    secondary: string;
    inverse: string;
    onAccent: string;
    savings: string;
  };
  brand: {
    primary: string;
    accent: string;
    savings: string;
  };
  action: {
    primaryBg: string;
    primaryText: string;
    confirmBg: string;
    confirmText: string;
    secondaryBg: string;
    secondaryText: string;
  };
  border: {
    dashed: string;
    subtle: string;
    savings: string;
    accent: string;
  };
  tabBar: {
    background: string;
    activeIcon: string;
    inactiveIcon: string;
    activeText: string;
    inactiveText: string;
  };
  phaseSwitch: {
    trackBg: string;
    activePillBg: string;
    activeText: string;
    inactiveText: string;
  };
}

export const lightColors: SemanticColors = {
  ...palette,
  background: {
    screen: palette.nevoa,
    card: palette.branco,
    secondary: palette.ceu,
    headerDark: palette.mar,
    bottomSheet: palette.branco,
  },
  text: {
    primary: palette.tinta,
    secondary: palette.textoMudo,
    inverse: palette.branco,
    onAccent: palette.tinta,
    savings: palette.poupanca,
  },
  brand: {
    primary: palette.mar,
    accent: palette.sol,
    savings: palette.poupanca,
  },
  action: {
    primaryBg: palette.sol,
    primaryText: palette.tinta,
    confirmBg: palette.poupanca,
    confirmText: palette.branco,
    secondaryBg: palette.nevoa,
    secondaryText: palette.tinta,
  },
  border: {
    dashed: palette.picote,
    subtle: '#E2ECF2',
    savings: palette.poupanca,
    accent: palette.sol,
  },
  tabBar: {
    background: palette.branco,
    activeIcon: palette.mar,
    inactiveIcon: palette.picote,
    activeText: palette.mar,
    inactiveText: palette.textoMudo,
  },
  phaseSwitch: {
    trackBg: palette.branco,
    activePillBg: palette.mar,
    activeText: palette.branco,
    inactiveText: palette.textoMudo,
  },
};

export const darkColors: SemanticColors = {
  ...palette,
  background: {
    screen: '#07131E',
    card: '#0F2233',
    secondary: '#16324A',
    headerDark: palette.mar,
    bottomSheet: '#0F2233',
  },
  text: {
    primary: '#F4F8FA',
    secondary: '#94A9B9',
    inverse: palette.branco,
    onAccent: palette.tinta,
    savings: '#25C485',
  },
  brand: {
    primary: palette.mar,
    accent: palette.sol,
    savings: palette.poupanca,
  },
  action: {
    primaryBg: palette.sol,
    primaryText: palette.tinta,
    confirmBg: palette.poupanca,
    confirmText: palette.branco,
    secondaryBg: '#16324A',
    secondaryText: '#F4F8FA',
  },
  border: {
    dashed: '#233D52',
    subtle: '#193044',
    savings: palette.poupanca,
    accent: palette.sol,
  },
  tabBar: {
    background: '#0F2233',
    activeIcon: palette.sol,
    inactiveIcon: '#2B465C',
    activeText: '#F4F8FA',
    inactiveText: '#94A9B9',
  },
  phaseSwitch: {
    trackBg: '#0F2233',
    activePillBg: palette.mar,
    activeText: palette.branco,
    inactiveText: '#94A9B9',
  },
};

export const colors = lightColors;
