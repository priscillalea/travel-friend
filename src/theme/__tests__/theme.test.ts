import {
  colors,
  darkColors,
  fontFamilies,
  fontSizes,
  layout,
  lightColors,
  palette,
  radii,
  spacing,
  typography,
} from '../index';

describe('Trocado Design System (Seção 3)', () => {
  it('define todos os tokens de cor da paleta com os valores hex exatos', () => {
    expect(palette.mar).toBe('#0B3C5D');
    expect(palette.sol).toBe('#FFC93C');
    expect(palette.poupanca).toBe('#17A36B');
    expect(palette.nevoa).toBe('#EEF3F6');
    expect(palette.ceu).toBe('#CFE3EE');
    expect(palette.tinta).toBe('#0A1B2A');
    expect(palette.textoMudo).toBe('#5E7384');
    expect(palette['texto-mudo']).toBe('#5E7384');
    expect(palette.branco).toBe('#FFFFFF');
    expect(palette.picote).toBe('#CFDCE5');
  });

  it('expõe tokens semânticos compatíveis entre modo claro e escuro', () => {
    expect(colors.background.screen).toBe('#EEF3F6');
    expect(colors.action.primaryBg).toBe('#FFC93C');
    expect(colors.brand.savings).toBe('#17A36B');
    expect(Object.keys(darkColors)).toEqual(Object.keys(lightColors));
  });

  it('define a escala tipográfica com Inter e Inter Display e números tabulares em valores monetários', () => {
    expect(fontFamilies.displayBold).toContain('InterDisplay');
    expect(fontFamilies.bodyMedium).toContain('Inter');
    expect(fontSizes.screenTitle).toBe(28);
    expect(fontSizes.valueMd).toBe(32);
    expect(fontSizes.valueLg).toBe(40);
    expect(fontSizes.card).toBe(16);
    expect(fontSizes.cardLg).toBe(18);
    expect(fontSizes.body).toBe(15);
    expect(fontSizes.labelSm).toBe(12);
    expect(fontSizes.label).toBe(13);
    expect(fontSizes.tab).toBe(11);
    expect(typography.valueLarge.fontVariant).toContain('tabular-nums');
    expect(typography.valueMedium.fontVariant).toContain('tabular-nums');
    expect(typography.moneyRow.fontVariant).toContain('tabular-nums');
  });

  it('define margens, alturas e raios exatamente conforme a especificação', () => {
    expect(spacing.screenHorizontal).toBe(20);
    expect(layout.screenPaddingHorizontal).toBe(20);
    expect(layout.tabBarHeight).toBe(84);
    expect(layout.bottomSheetHandleWidth).toBe(40);
    expect(layout.bottomSheetHandleHeight).toBe(5);
    expect(radii.cardSm).toBe(18);
    expect(radii.card).toBe(20);
    expect(radii.cardLg).toBe(24);
    expect(radii.bottomSheet).toBe(28);
    expect(radii.pill).toBe(99);
    expect(radii.tabIcon).toBe(8);
  });
});
