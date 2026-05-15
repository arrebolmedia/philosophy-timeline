// Algoritmo principal: dado un statement de referencia, barre TODOS
// los demás caracterizados y devuelve los candidatos donde una conexión
// es lógicamente posible.
//
// El barrido es exhaustivo y determinístico. No "propone" subjetivamente:
// reporta lo que el matching formal dice. La decisión final de si la
// conexión es real (y de qué subtipo) es lectura humana posterior.

import { PrismaClient } from '@prisma/client';
import { compareLogicalProfiles } from './matchingRules';
import { Candidate, CharacterizedStatement, MatchResult } from './types';

const prisma = new PrismaClient();

/**
 * Convierte un row de Prisma a CharacterizedStatement, validando
 * que esté completo. Devuelve null si falta alguna columna lógica.
 */
function toCharacterized(row: any): CharacterizedStatement | null {
  if (
    !row.claimType ||
    !row.claimScope ||
    !row.respectsIdentity ||
    !row.respectsNoncontradiction ||
    !row.respectsExcludedMiddle ||
    !row.respectsSufficientReason
  ) {
    return null;
  }
  return {
    id: row.id,
    text: row.text,
    philosopher_id: row.philosopherId,
    category_id: row.categoryId ?? null,
    claim_type: row.claimType,
    claim_scope: row.claimScope,
    respects_identity: row.respectsIdentity,
    respects_noncontradiction: row.respectsNoncontradiction,
    respects_excluded_middle: row.respectsExcludedMiddle,
    respects_sufficient_reason: row.respectsSufficientReason,
    logical_notes: row.logicalNotes ?? null,
  };
}

/**
 * Encuentra todos los candidatos con relación lógica posible
 * para un statement de referencia.
 *
 * @param statementId  ID del statement de referencia
 * @param opts.includeKinds  Filtrar por tipo de match (default: solo oppose y resonate)
 * @param opts.excludeSamePhilosopher  Si true (default), excluye statements del mismo filósofo
 *                                     (la DB tiene trigger trg_no_same_philosopher de todos modos)
 */
export async function findCandidatesFor(
  statementId: number,
  opts: {
    includeKinds?: Array<MatchResult['kind']>;
    excludeSamePhilosopher?: boolean;
  } = {}
): Promise<{
  target: CharacterizedStatement;
  candidates: Candidate[];
  stats: {
    total_caracterizados: number;
    diferente_tipo: number;
    diferente_scope: number;
    sin_relacion_logica: number;
    oppose_posible: number;
    resonate_posible: number;
  };
}> {
  const includeKinds = opts.includeKinds ?? ['oppose_posible', 'resonate_posible'];
  const excludeSamePhilosopher = opts.excludeSamePhilosopher ?? true;

  const targetRow = await prisma.statement.findUnique({ where: { id: statementId } });
  if (!targetRow) {
    throw new Error(`Statement ${statementId} no encontrado`);
  }
  const target = toCharacterized(targetRow);
  if (!target) {
    throw new Error(`Statement ${statementId} no está caracterizado lógicamente`);
  }

  const otherRows = await prisma.statement.findMany({
    where: {
      id: { not: statementId },
      ...(excludeSamePhilosopher ? { philosopherId: { not: target.philosopher_id } } : {}),
      claimType: { not: null },
      claimScope: { not: null },
      respectsIdentity: { not: null },
      respectsNoncontradiction: { not: null },
      respectsExcludedMiddle: { not: null },
      respectsSufficientReason: { not: null },
    },
  });

  const stats = {
    total_caracterizados: otherRows.length,
    diferente_tipo: 0,
    diferente_scope: 0,
    sin_relacion_logica: 0,
    oppose_posible: 0,
    resonate_posible: 0,
  };

  const candidates: Candidate[] = [];

  for (const row of otherRows) {
    const other = toCharacterized(row);
    if (!other) continue;

    const match = compareLogicalProfiles(target, other);

    // Actualizar stats
    if (match.kind === 'diferente_tipo') stats.diferente_tipo++;
    else if (match.kind === 'diferente_scope') stats.diferente_scope++;
    else if (match.kind === 'sin_relacion_logica') stats.sin_relacion_logica++;
    else if (match.kind === 'oppose_posible') stats.oppose_posible++;
    else if (match.kind === 'resonate_posible') stats.resonate_posible++;

    // Filtrar por includeKinds
    if (includeKinds.includes(match.kind)) {
      candidates.push({ statement: other, match });
    }
  }

  return { target, candidates, stats };
}

/**
 * Versión liviana para invocación CLI / scripts: imprime resumen.
 */
export async function summarizeCandidates(statementId: number): Promise<void> {
  const { target, candidates, stats } = await findCandidatesFor(statementId);
  console.log(`\nStatement #${statementId}: ${target.text}`);
  console.log(`  Perfil: ${target.claim_type}/${target.claim_scope}`);
  console.log(`  Posturas: I=${target.respects_identity} NC=${target.respects_noncontradiction} TE=${target.respects_excluded_middle} RS=${target.respects_sufficient_reason}`);
  console.log(`\nBarrido contra ${stats.total_caracterizados} statements caracterizados:`);
  console.log(`  diferente_tipo:        ${stats.diferente_tipo}`);
  console.log(`  diferente_scope:       ${stats.diferente_scope}`);
  console.log(`  sin_relacion_logica:   ${stats.sin_relacion_logica}`);
  console.log(`  oppose posible:        ${stats.oppose_posible}`);
  console.log(`  resonate posible:      ${stats.resonate_posible}`);
  console.log(`\nCandidatos:`);
  for (const c of candidates) {
    const text = c.statement.text.length > 80 ? c.statement.text.slice(0, 77) + '...' : c.statement.text;
    console.log(`  #${c.statement.id} [${c.match.kind}] ${text}`);
  }
}
