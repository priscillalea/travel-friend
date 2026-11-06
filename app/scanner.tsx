import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BottomSheet } from '../src/components/BottomSheet';
import { useShoppingList } from '../src/context/ShoppingListContext';
import { parseUserPriceToMinor } from '../src/domain/lists';
import { convertMoney, createMoney, formatMoney } from '../src/domain/money';
import {
  DevicePriceTagOcrEngine,
  EXAMPLE_PRICE_TAG_SAMPLES,
  ParsedPriceTag,
} from '../src/domain/ocr';
import { colors, layout, radii, spacing, typography } from '../src/theme';

export default function ScannerScreen() {
  const router = useRouter();
  const { listView, addItem } = useShoppingList();
  const ocrEngine = useMemo(() => new DevicePriceTagOcrEngine(), []);

  const [sampleIndex, setSampleIndex] = useState(0);
  const [parsedTag, setParsedTag] = useState<ParsedPriceTag | null>(null);
  const [confirmedPriceInput, setConfirmedPriceInput] = useState('');
  const [isConfirmedByUser, setIsConfirmedByUser] = useState(false);

  const currentSample = EXAMPLE_PRICE_TAG_SAMPLES[sampleIndex] ?? EXAMPLE_PRICE_TAG_SAMPLES[0];

  useEffect(() => {
    let active = true;
    const defaultCurrency = listView?.list.sourceCurrency ?? 'GBP';
    ocrEngine
      .recognizePriceTag(currentSample, defaultCurrency)
      .then((result) => {
        if (!active) return;
        setParsedTag(result);
        setIsConfirmedByUser(false);
        if (result) {
          const major = (result.detectedMoney.amountMinor / 100).toFixed(2).replace('.', ',');
          setConfirmedPriceInput(major);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [currentSample, listView?.list.sourceCurrency, ocrEngine]);

  if (!listView || !parsedTag) {
    return null;
  }

  const effectiveMoney = (() => {
    if (parsedTag.needsConfirmation && isConfirmedByUser) {
      try {
        const minor = parseUserPriceToMinor(confirmedPriceInput);
        return createMoney(minor, parsedTag.detectedMoney.currency);
      } catch {
        return parsedTag.detectedMoney;
      }
    }
    return parsedTag.detectedMoney;
  })();

  const convertedMoney =
    effectiveMoney.currency === listView.list.targetCurrency
      ? effectiveMoney
      : convertMoney(effectiveMoney, listView.activeRate);

  const handleCycleSample = () => {
    setSampleIndex((prev) => (prev + 1) % EXAMPLE_PRICE_TAG_SAMPLES.length);
  };

  const handleConfirmLowConfidence = () => {
    setIsConfirmedByUser(true);
  };

  const handleAddScannedItem = async () => {
    if (parsedTag.needsConfirmation && !isConfirmedByUser) {
      setIsConfirmedByUser(true);
      return;
    }
    await addItem({
      name: parsedTag.itemName,
      unitPriceMinor: effectiveMoney.amountMinor,
      quantity: 1,
      currency: effectiveMoney.currency,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.cameraBackground}>
      <StatusBar style="light" />

      <View style={styles.topControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para a lista"
          onPress={() => router.back()}
          style={styles.topPillButton}
        >
          <Text style={styles.topPillText}>← Voltar</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Trocar etiqueta de exemplo"
          onPress={handleCycleSample}
          style={styles.topPillButton}
          testID="cycle-tag-sample-button"
        >
          <Text style={styles.topPillText}>
            Etiqueta {sampleIndex + 1}/{EXAMPLE_PRICE_TAG_SAMPLES.length} ↻
          </Text>
        </Pressable>
      </View>

      <View style={styles.viewfinderArea}>
        <View style={styles.viewfinderBand}>
          <View style={styles.frameContainer}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />

            <View style={styles.priceTagCard}>
              <Text style={styles.tagItemLabel}>{parsedTag.itemName}</Text>
              <Text style={styles.tagPriceValue}>{formatMoney(effectiveMoney, 'en-GB')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detectedPill} testID="detected-price-pill">
          <Text style={styles.detectedPillText}>
            {formatMoney(effectiveMoney, 'pt-BR')} detectado
          </Text>
        </View>
      </View>

      <BottomSheet>
        <View style={styles.sheetHeaderRow}>
          <View style={styles.sheetLeft}>
            <Text style={styles.sheetItemName}>{parsedTag.itemName}</Text>
            <Text style={styles.sheetStoreName}>{currentSample.storeName}</Text>
          </View>

          <View style={styles.sheetRight}>
            <Text style={styles.sheetConvertedPrice}>{formatMoney(convertedMoney, 'pt-BR')}</Text>
            <Text style={styles.sheetOriginalPrice}>{formatMoney(effectiveMoney, 'pt-BR')}</Text>
          </View>
        </View>

        {parsedTag.needsConfirmation && !isConfirmedByUser ? (
          <View style={styles.confirmationBox} testID="low-confidence-confirmation-box">
            <Text style={styles.confirmationTitle}>
              Leitura sem símbolo claro ({Math.round(parsedTag.confidence * 100)}%). Confirme o
              valor:
            </Text>
            <View style={styles.confirmationRow}>
              <TextInput
                value={confirmedPriceInput}
                onChangeText={setConfirmedPriceInput}
                keyboardType="decimal-pad"
                style={styles.confirmationInput}
                testID="confirm-price-input"
              />
              <Pressable
                accessibilityRole="button"
                onPress={handleConfirmLowConfidence}
                style={styles.confirmValueButton}
                testID="confirm-ocr-value-button"
              >
                <Text style={styles.confirmValueButtonText}>Confirmar valor</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adicionar à lista"
          onPress={handleAddScannedItem}
          style={styles.primaryButton}
          testID="scanner-add-to-list-button"
        >
          <Text style={styles.primaryButtonText}>
            {parsedTag.needsConfirmation && !isConfirmedByUser
              ? 'Confirmar e escolher'
              : 'Adicionar à lista'}
          </Text>
        </Pressable>

        <View style={styles.listFooterPill} testID="scanner-list-footer">
          <Text style={styles.listFooterText}>
            Lista atual: {listView.totalItemsCount} itens ·{' '}
            {formatMoney(listView.totalConverted, 'pt-BR')}
          </Text>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cameraBackground: {
    flex: 1,
    backgroundColor: '#132636',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
  },
  topPillButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  topPillText: {
    ...typography.labelStrong,
    color: colors.text.inverse,
  },
  viewfinderArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  viewfinderBand: {
    width: '100%',
    backgroundColor: '#1B3347',
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameContainer: {
    width: 260,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.brand.accent,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  priceTagCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: 210,
    transform: [{ rotate: '-2deg' }],
  },
  tagItemLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  tagPriceValue: {
    ...typography.valueLarge,
    fontSize: 44,
    lineHeight: 48,
    color: colors.text.primary,
  },
  detectedPill: {
    backgroundColor: colors.action.primaryBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  detectedPillText: {
    ...typography.cardSubtitle,
    color: colors.action.primaryText,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetLeft: {
    flex: 1,
    gap: 4,
    paddingRight: spacing.sm,
  },
  sheetItemName: {
    ...typography.cardTitle,
    fontSize: 22,
    lineHeight: 26,
    color: colors.text.primary,
  },
  sheetStoreName: {
    ...typography.body,
    color: colors.text.secondary,
  },
  sheetRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  sheetConvertedPrice: {
    ...typography.valueMedium,
    color: colors.text.primary,
  },
  sheetOriginalPrice: {
    ...typography.body,
    color: colors.text.secondary,
  },
  confirmationBox: {
    backgroundColor: colors.background.screen,
    borderRadius: radii.cardSm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  confirmationTitle: {
    ...typography.labelStrong,
    color: colors.text.primary,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  confirmationInput: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: radii.tabIcon,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    ...typography.cardSubtitle,
    color: colors.text.primary,
  },
  confirmValueButton: {
    backgroundColor: colors.action.confirmBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  confirmValueButtonText: {
    ...typography.labelStrong,
    color: colors.action.confirmText,
  },
  primaryButton: {
    backgroundColor: colors.action.primaryBg,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    ...typography.cardSubtitle,
    fontWeight: '700',
    color: colors.action.primaryText,
  },
  listFooterPill: {
    backgroundColor: colors.background.screen,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listFooterText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
