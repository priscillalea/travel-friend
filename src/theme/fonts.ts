import {
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { fontFamilies } from './typography';

/**
 * Carrega as fontes Inter e Inter Display usadas no Design System.
 */
export function useTrocadoFonts(): [boolean, Error | null] {
  return useFonts({
    [fontFamilies.bodyMedium]: Inter_500Medium,
    [fontFamilies.bodySemiBold]: Inter_600SemiBold,
    [fontFamilies.bodyBold]: Inter_700Bold,
    [fontFamilies.displayBold]: Inter_700Bold,
    [fontFamilies.displayExtraBold]: Inter_800ExtraBold,
  });
}
