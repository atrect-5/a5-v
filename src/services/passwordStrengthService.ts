import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import { PasswordEvaluationResult, SecurityScore } from '../types';
import { colors } from '../theme/colors';

/**
 * Inicialización del evaluador zxcvbn-ts con diccionarios de palabras comunes y teclados
 */
const zxcvbnInstance = new ZxcvbnFactory({
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  translations: zxcvbnEnPackage.translations,
});

const SCORE_LABELS: Record<SecurityScore, string> = {
  0: 'Muy Débil',
  1: 'Débil',
  2: 'Regular',
  3: 'Fuerte',
  4: 'Excelente',
};

const SCORE_COLORS: Record<SecurityScore, string> = {
  0: colors.security.score0,
  1: colors.security.score1,
  2: colors.security.score2,
  3: colors.security.score3,
  4: colors.security.score4,
};

export class PasswordStrengthService {
  /**
   * Evalúa la seguridad de una contraseña usando zxcvbn-ts.
   */
  static evaluate(password: string, userInputs: string[] = []): PasswordEvaluationResult {
    if (!password || password.length === 0) {
      return {
        score: 0,
        label: 'Sin ingresar',
        color: colors.security.score0,
        suggestions: ['Ingresa una contraseña para evaluarla'],
        crackTimeDisplay: 'Instantáneo',
      };
    }

    const result = zxcvbnInstance.check(password, userInputs);
    const score = Math.max(0, Math.min(4, result.score)) as SecurityScore;

    // Traducir o formatear advertencias comunes al español
    let warning: string | undefined = undefined;
    if (result.feedback.warning) {
      warning = this.translateWarning(result.feedback.warning);
    }

    // Traducir sugerencias
    const suggestions = result.feedback.suggestions.length > 0
      ? result.feedback.suggestions.map((s) => this.translateSuggestion(s))
      : [
          score >= 3
            ? '¡Excelente contraseña! Cumple con altos estándares de seguridad.'
            : 'Agrega más caracteres variados o combina palabras poco comunes.',
        ];

    // Formato de tiempo estimado de crackeo
    const crackTime = result.crackTimes?.offlineSlowHashingXPerSecond?.display || 'Pocos segundos';

    return {
      score,
      label: SCORE_LABELS[score],
      color: SCORE_COLORS[score],
      warning,
      suggestions,
      crackTimeDisplay: this.translateCrackTime(crackTime),
    };
  }

  private static translateWarning(warning: string): string {
    const map: Record<string, string> = {
      'This is a top-10 common password': 'Esta es una de las 10 contraseñas más comunes del mundo.',
      'This is a top-100 common password': 'Esta es una de las 100 contraseñas más comunes.',
      'This is a very common password': 'Esta es una contraseña muy común.',
      'This is similar to a commonly used password': 'Es similar a una contraseña muy utilizada.',
      'A word by itself is easy to guess': 'Una sola palabra es muy fácil de adivinar.',
      'Names and surnames by themselves are easy to guess': 'Los nombres y apellidos son fáciles de adivinar.',
      'Common names and surnames are easy to guess': 'Nombres comunes son fáciles de adivinar.',
      'Straight rows of keys are easy to guess': 'Patrones lineales en el teclado son fáciles de adivinar.',
      'Short keyboard patterns are easy to guess': 'Patrones cortos del teclado son fáciles de predecir.',
      'Repeats like "aaa" are easy to guess': 'Repeticiones como "aaa" son fáciles de adivinar.',
      'Repeats like "abcabcabc" are only slightly harder to guess than "abc"': 'Repeticiones de secuencias son fáciles de predecir.',
      'Sequences like abc or 6543 are easy to guess': 'Secuencias simples como abc o 1234 son triviales.',
      'Recent years are easy to guess': 'Años recientes son fáciles de adivinar.',
      'Dates are often easy to guess': 'Las fechas son frecuentemente fáciles de adivinar.',
    };
    return map[warning] || warning;
  }

  private static translateSuggestion(suggestion: string): string {
    const map: Record<string, string> = {
      'Use a few words, avoid common phrases': 'Usa varias palabras no relacionadas, evita frases hechas.',
      'No need for symbols, even longer passwords are safer': 'Una longitud mayor es aún más segura que símbolos sueltos.',
      'Add another word or two. Uncommon words are better.': 'Agrega una o dos palabras más. Palabras poco comunes son mejores.',
      'Avoid repeated words and characters': 'Evita palabras y caracteres repetidos.',
      'Avoid sequences': 'Evita secuencias obvias del teclado o numéricas.',
      'Avoid recent years': 'Evita usar años recientes.',
      'Avoid years that are associated with you': 'Evita fechas asociadas a ti como cumpleaños.',
      'Capitalization doesn\'t help very much': 'Las mayúsculas aisladas no agregan tanta seguridad como mayor longitud.',
    };
    return map[suggestion] || suggestion;
  }

  private static translateCrackTime(time: string): string {
    return time
      .replace('less than a second', 'Menos de 1 segundo')
      .replace('seconds', 'segundos')
      .replace('second', 'segundo')
      .replace('minutes', 'minutos')
      .replace('minute', 'minuto')
      .replace('hours', 'horas')
      .replace('hour', 'hora')
      .replace('days', 'días')
      .replace('day', 'día')
      .replace('months', 'meses')
      .replace('month', 'mes')
      .replace('years', 'años')
      .replace('year', 'año')
      .replace('centuries', 'siglos')
      .replace('century', 'siglo');
  }
}
