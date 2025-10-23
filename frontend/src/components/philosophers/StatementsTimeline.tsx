'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Quote, ArrowRight, Network } from 'lucide-react';

interface Statement {
  id: number;
  text: string;
  isDirectQuote: boolean;
  difficultyLevel: number;
  popularityScore: number;
  orderInTimeline: number;
  category: {
    name: string;
    colorHex: string;
  };
  tags: Array<{
    tag: {
      name: string;
      type: string;
    };
  }>;
  connectionsFrom: Array<{
    connectionType: string;
    strength: number;
    statementTo: {
      id: number;
      text: string;
      philosopher: {
        name: string;
      };
    };
  }>;
  connectionsTo: Array<{
    connectionType: string;
    strength: number;
    statementFrom: {
      id: number;
      text: string;
      philosopher: {
        name: string;
      };
    };
  }>;
}

interface Props {
  statements: Statement[];
}

const connectionTypeLabels: Record<string, { label: string; color: string }> = {
  agreement: { label: 'Acuerdo', color: 'text-green-600' },
  disagreement: { label: 'Desacuerdo', color: 'text-red-600' },
  expansion: { label: 'Expansión', color: 'text-blue-600' },
  refutation: { label: 'Refutación', color: 'text-orange-600' },
  inspiration: { label: 'Inspiración', color: 'text-purple-600' }
};

export function StatementsTimeline({ statements }: Props) {
  const sortedStatements = [...statements].sort(
    (a, b) => a.orderInTimeline - b.orderInTimeline
  );

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold font-serif">Ideas y Pensamientos</h2>
        <p className="text-muted-foreground">
          Declaraciones filosóficas ordenadas temáticamente
        </p>
      </div>

      <div className="space-y-6">
        {sortedStatements.map((statement, index) => (
          <Card 
            key={statement.id} 
            className="hover:shadow-lg transition-all duration-300"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      style={{
                        backgroundColor: statement.category.colorHex + '20',
                        color: statement.category.colorHex,
                        borderColor: statement.category.colorHex
                      }}
                      className="border"
                    >
                      {statement.category.name}
                    </Badge>
                    {statement.isDirectQuote && (
                      <Badge variant="outline" className="text-xs">
                        <Quote className="h-3 w-3 mr-1" />
                        Cita directa
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl leading-relaxed">
                    {statement.isDirectQuote && <Quote className="inline h-5 w-5 mr-2 text-muted-foreground" />}
                    "{statement.text}"
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Tags */}
              {statement.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {statement.tags.map((tagRelation, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tagRelation.tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Connections */}
              {(statement.connectionsFrom.length > 0 || statement.connectionsTo.length > 0) && (
                <div className="pt-4 border-t space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Conexiones Filosóficas
                  </h4>

                  {/* Outgoing connections */}
                  {statement.connectionsFrom.map((conn, i) => {
                    const connType = connectionTypeLabels[conn.connectionType] || {
                      label: conn.connectionType,
                      color: 'text-gray-600'
                    };

                    return (
                      <div 
                        key={`from-${i}`} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <ArrowRight className={`h-4 w-4 mt-1 ${connType.color}`} />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {connType.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              hacia {conn.statementTo.philosopher.name}
                            </span>
                          </div>
                          <p className="text-muted-foreground italic">
                            "{conn.statementTo.text.substring(0, 100)}
                            {conn.statementTo.text.length > 100 ? '...' : ''}"
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Incoming connections */}
                  {statement.connectionsTo.map((conn, i) => {
                    const connType = connectionTypeLabels[conn.connectionType] || {
                      label: conn.connectionType,
                      color: 'text-gray-600'
                    };

                    return (
                      <div 
                        key={`to-${i}`} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <ArrowRight className={`h-4 w-4 mt-1 transform rotate-180 ${connType.color}`} />
                        <div className="flex-1 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {connType.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              desde {conn.statementFrom.philosopher.name}
                            </span>
                          </div>
                          <p className="text-muted-foreground italic">
                            "{conn.statementFrom.text.substring(0, 100)}
                            {conn.statementFrom.text.length > 100 ? '...' : ''}"
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <div>Dificultad: {statement.difficultyLevel}/5</div>
                <div>Popularidad: {statement.popularityScore}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
