// Reglas formales para comparar dos perfiles lógicos.
//
// IMPORTANTE: estas reglas son puras (sin acceso a DB ni IO).
// La comparación es determinística: mismas entradas → misma salida.
//
// Las reglas filtran el universo de candidatos al subconjunto
// donde una conexión filosófica ES POSIBLE. La decisión final de
// si hay conexión real (y de qué subtipo) requiere lectura humana
// del contenido material y del contexto histórico.

import {
  LogicalProfile,
  MatchResult,
  PrincipleKey,
  LogicalStance,
  ALL_PRINCIPLES,
} from './types';

/**
 * Determina si dos posturas frente a un mismo principio están opuestas.
 *
 * - 'si' vs 'no': opuestas (uno respeta el principio, el otro lo viola)
 * - 'si' vs 'si' o 'no' vs 'no': alineadas
 * - cualquiera con 'no_aplica': no se considera ni opuesta ni alineada
 *   (porque uno de los dos statements no toca el principio)
 */
function isOpposed(a: LogicalStance, b: LogicalStance): boolean {
  return (a === 'si' && b === 'no') || (a === 'no' && b === 'si');
}

function isAligned(a: LogicalStance, b: LogicalStance): boolean {
  return (a === 'si' && b === 'si') || (a === 'no' && b === 'no');
}

/**
 * Compara dos perfiles lógicos y determina qué tipo de relación
 * es POSIBLE entre los statements correspondientes.
 *
 * Cascada de filtros:
 *
 * 1. Mismo claim_type. Si no, no hay conexión filosófica directa
 *    (un statement ontológico y uno ético no se contradicen ni
 *    resuenan en el mismo plano).
 *
 * 2. Mismo claim_scope. Si no, los statements operan en niveles
 *    distintos (lo total no se enfrenta directamente con lo particular).
 *
 * 3. Postura frente a los 4 principios:
 *    - Si HAY al menos un principio donde están opuestos → oppose posible.
 *      Reportamos también qué principios sí están alineados (importa
 *      para caracterizar la oposición: parcial vs total).
 *    - Si NO hay opuestos pero SÍ hay alineados → resonate posible.
 *    - Si todo es no_aplica/no_aplica → sin_relacion_logica
 *      (no hay materia para relación formal).
 *
 * NOTA: Esta función NO decide subtipos (refutacion, desarrollo, etc.).
 * Esa decisión depende del contenido material y del contexto histórico,
 * lo cual es lectura humana.
 */
export function compareLogicalProfiles(
  a: LogicalProfile,
  b: LogicalProfile
): MatchResult {
  // 1. claim_type debe coincidir
  if (a.claim_type !== b.claim_type) {
    return { kind: 'diferente_tipo', a: a.claim_type, b: b.claim_type };
  }

  // 2. claim_scope debe coincidir
  if (a.claim_scope !== b.claim_scope) {
    return { kind: 'diferente_scope', a: a.claim_scope, b: b.claim_scope };
  }

  // 3. Comparar las 4 posturas lógicas
  const principios_opuestos: PrincipleKey[] = [];
  const principios_alineados: PrincipleKey[] = [];

  for (const p of ALL_PRINCIPLES) {
    if (isOpposed(a[p], b[p])) {
      principios_opuestos.push(p);
    } else if (isAligned(a[p], b[p])) {
      principios_alineados.push(p);
    }
  }

  // Si hay al menos un principio opuesto, la conexión es OPPOSE
  // (la oposición lógica formal manda sobre cualquier alineación parcial)
  if (principios_opuestos.length > 0) {
    return {
      kind: 'oppose_posible',
      principios_opuestos,
      principios_alineados,
    };
  }

  // Si no hay opuestos pero hay al menos un alineado, es RESONATE
  if (principios_alineados.length > 0) {
    return {
      kind: 'resonate_posible',
      principios_alineados,
    };
  }

  // Todo no_aplica vs no_aplica: no hay materia formal de relación
  return { kind: 'sin_relacion_logica' };
}

/**
 * Helper para presentar el match en UI / logs / tests.
 */
export function describeMatch(m: MatchResult): string {
  switch (m.kind) {
    case 'diferente_tipo':
      return `claim_type difiere: ${m.a} vs ${m.b}`;
    case 'diferente_scope':
      return `claim_scope difiere: ${m.a} vs ${m.b}`;
    case 'sin_relacion_logica':
      return 'sin materia lógica común (todos los principios son no_aplica)';
    case 'oppose_posible':
      return `oppose posible — opuestos en: ${m.principios_opuestos.join(', ')}${
        m.principios_alineados.length > 0
          ? `; alineados en: ${m.principios_alineados.join(', ')}`
          : ''
      }`;
    case 'resonate_posible':
      return `resonate posible — alineados en: ${m.principios_alineados.join(', ')}`;
  }
}
