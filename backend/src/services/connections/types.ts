// Caracterización lógica de un statement
//
// Estos tipos modelan el perfil filosófico-formal de cada statement.
// El sistema de matching los usa para descubrir conexiones posibles.

export type ClaimType =
  | 'ontologica'
  | 'epistemologica'
  | 'etica'
  | 'politica'
  | 'estetica'
  | 'lenguaje'
  | 'ciencia'
  | 'logica'
  | 'antropologica'
  | 'teologica'
  | 'metodologica'
  | 'meta';

export type ClaimScope = 'total' | 'regional' | 'particular';

export type LogicalStance = 'si' | 'no' | 'no_aplica';

export interface LogicalProfile {
  claim_type: ClaimType;
  claim_scope: ClaimScope;
  respects_identity: LogicalStance;
  respects_noncontradiction: LogicalStance;
  respects_excluded_middle: LogicalStance;
  respects_sufficient_reason: LogicalStance;
}

// El statement caracterizado tal como vive en DB (con id y texto)
export interface CharacterizedStatement extends LogicalProfile {
  id: number;
  text: string;
  philosopher_id: number;
  category_id: number | null;
  logical_notes: string | null;
}

// Resultado de comparar dos perfiles lógicos
export type MatchResult =
  | { kind: 'sin_relacion_logica' }
  | { kind: 'diferente_tipo'; a: ClaimType; b: ClaimType }
  | { kind: 'diferente_scope'; a: ClaimScope; b: ClaimScope }
  | {
      kind: 'oppose_posible';
      principios_opuestos: PrincipleKey[];
      principios_alineados: PrincipleKey[];
    }
  | {
      kind: 'resonate_posible';
      principios_alineados: PrincipleKey[];
    };

export type PrincipleKey =
  | 'respects_identity'
  | 'respects_noncontradiction'
  | 'respects_excluded_middle'
  | 'respects_sufficient_reason';

export const ALL_PRINCIPLES: PrincipleKey[] = [
  'respects_identity',
  'respects_noncontradiction',
  'respects_excluded_middle',
  'respects_sufficient_reason',
];

// Candidato devuelto por el barrido para un statement de referencia
export interface Candidate {
  statement: CharacterizedStatement;
  match: MatchResult;
}
