/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OptunaTrial } from '../types';

export interface OptunaStudyResult {
  studyName: string;
  nTrials: number;
  bestTrial: OptunaTrial;
  trials: OptunaTrial[];
  paramImportances: { parameter: string; importance: number }[];
  optimizationHistory: { trialNumber: number; value: number; bestSoFar: number }[];
}

export function runOptunaOptimization(
  nTrials: number = 25,
  direction: 'maximize' | 'minimize' = 'maximize',
  baseMetric: number = 0.812
): OptunaStudyResult {
  const trials: OptunaTrial[] = [];
  let bestVal = direction === 'maximize' ? -Infinity : Infinity;
  let bestTrialIndex = 0;
  const history: { trialNumber: number; value: number; bestSoFar: number }[] = [];

  for (let t = 1; t <= nTrials; t++) {
    // Parameter space sampling
    const n_estimators = Math.round(50 + Math.random() * 250);
    const max_depth = Math.round(3 + Math.random() * 9);
    const learning_rate = Number((0.01 + Math.random() * 0.25).toFixed(4));
    const min_samples_split = Math.round(2 + Math.random() * 10);
    const l2_reg = Number((0.001 + Math.random() * 0.1).toFixed(4));

    // Simulated objective function landscape with peak around max_depth: 6, lr: 0.08, n_estimators: 180
    const penalty =
      Math.abs(max_depth - 6) * 0.015 +
      Math.abs(learning_rate - 0.08) * 0.4 +
      Math.abs(n_estimators - 180) * 0.0003 +
      (Math.random() - 0.5) * 0.03;

    const value = Number(
      direction === 'maximize'
        ? Math.min(0.945, Math.max(0.65, baseMetric + 0.06 - penalty)).toFixed(4)
        : Math.max(12.5, 24.0 - penalty * 100).toFixed(2)
    );

    // Prune ~15% of underperforming trials
    const isPruned = t > 5 && (direction === 'maximize' ? value < 0.72 : value > 35);
    const state = isPruned ? 'PRUNED' : 'COMPLETE';

    const trial: OptunaTrial = {
      trialNumber: t,
      parameters: {
        n_estimators,
        max_depth,
        learning_rate,
        min_samples_split,
        l2_reg
      },
      metricValue: value,
      durationMs: Math.round(80 + Math.random() * 140),
      state
    };

    trials.push(trial);

    if (state === 'COMPLETE') {
      const isNewBest = direction === 'maximize' ? value > bestVal : value < bestVal;
      if (isNewBest) {
        bestVal = value;
        bestTrialIndex = t - 1;
      }
    }

    history.push({
      trialNumber: t,
      value,
      bestSoFar: bestVal === -Infinity || bestVal === Infinity ? value : bestVal
    });
  }

  const bestTrial = trials[bestTrialIndex];

  return {
    studyName: `optuna_tpe_tuning_study_${Date.now()}`,
    nTrials,
    bestTrial,
    trials,
    paramImportances: [
      { parameter: 'max_depth', importance: 0.38 },
      { parameter: 'learning_rate', importance: 0.29 },
      { parameter: 'n_estimators', importance: 0.18 },
      { parameter: 'l2_reg', importance: 0.10 },
      { parameter: 'min_samples_split', importance: 0.05 }
    ],
    optimizationHistory: history
  };
}
