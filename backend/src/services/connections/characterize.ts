// Helpers de validación para la caracterización lógica de statements.
//
// Estas funciones no acceden a DB. Solo validan estructura.

import { LogicalProfile, ClaimType, ClaimScope, LogicalStance } from './types';

const VALID_CLAIM_TYPES: ClaimType[] = [
  'ontologica', 'epistemologica', 'etica', 'politica', 'estetica',
  'lenguaje', 'ciencia', 'logica', 'antropologica', 'teologica',
  'metodologica', 'meta',
];

const VALID_CLAIM_SCOPES: ClaimScope[] = ['total', 'regional', 'particular'];

const VALID_STANCES: LogicalStance[] = ['si', 'no', 'no_aplica'];

/**
 * Valida un perfil lógico completo. Devuelve lista de errores
 * (vacía si es válido).
 */
export function validateProfile(profile: Partial<LogicalProfile>): string[] {
  const errors: string[] = [];

  if (!profile.claim_type) {
    errors.push('claim_type es obligatorio');
  } else if (!VALID_CLAIM_TYPES.includes(profile.claim_type)) {
    errors.push(`claim_type inválido: ${profile.claim_type}`);
  }

  if (!profile.claim_scope) {
    errors.push('claim_scope es obligatorio');
  } else if (!VALID_CLAIM_SCOPES.includes(profile.claim_scope)) {
    errors.push(`claim_scope inválido: ${profile.claim_scope}`);
  }

  for (const key of [
    'respects_identity',
    'respects_noncontradiction',
    'respects_excluded_middle',
    'respects_sufficient_reason',
  ] as const) {
    const v = profile[key];
    if (!v) {
      errors.push(`${key} es obligatorio`);
    } else if (!VALID_STANCES.includes(v)) {
      errors.push(`${key} inválido: ${v}`);
    }
  }

  return errors;
}

/**
 * Verifica si un perfil está completo (todos los campos llenados).
 */
export function isComplete(profile: Partial<LogicalProfile>): boolean {
  return validateProfile(profile).length === 0;
}
