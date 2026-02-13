'use client';

import { PiChartBar } from 'react-icons/pi';
import { Card } from '@/components/ui/shadcn/card';
import {
  type MatchResult,
  getScoreColor,
  getScoreBgColor,
  MATCH_BREAKDOWN_LABELS,
} from './types';

interface MatchScoreCardProps {
  matchResult: MatchResult;
}

export function MatchScoreCard({ matchResult }: MatchScoreCardProps) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <PiChartBar className="size-5 text-fuchsia-500" />
        <h2 className="text-lg font-semibold">Compatibilidade</h2>
      </div>

      <div
        className={`mb-4 rounded-lg p-4 text-center ${getScoreBgColor(matchResult.score)}`}
      >
        <p className={`text-4xl font-bold ${getScoreColor(matchResult.score)}`}>
          {matchResult.score}%
        </p>
        <p className="text-sm text-gray-600">Pontuação de match</p>
      </div>

      {!matchResult.isEligible && matchResult.eliminationReasons.length > 0 && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="mb-2 font-medium text-red-700">
            Requisitos não atendidos:
          </p>
          <ul className="space-y-1 text-sm text-red-600">
            {matchResult.eliminationReasons.map((reason, i) => (
              <li key={i}>- {reason}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2">
        {Object.entries(matchResult.breakdown).map(([key, component]) => {
          if (!component) return null;
          const percentage = Math.round(
            (component.score / component.maxScore) * 100
          );
          return (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {MATCH_BREAKDOWN_LABELS[key] || key}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${
                      percentage >= 80
                        ? 'bg-green-500'
                        : percentage >= 60
                          ? 'bg-yellow-500'
                          : percentage >= 40
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium">
                  {percentage}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
