/**
 * RAG Evaluation Runner Script
 * 
 * Executes full empirical benchmark over 32 evaluation queries,
 * prints precision, recall, MRR, nDCG, faithfulness, citation metrics,
 * and saves output to data/rag/rag_benchmark_results.json.
 */

import fs from 'fs';
import path from 'path';
import { RAGEvaluationEngine, EvaluationQuery } from '../src/services/evaluation/RAGEvaluationEngine';

async function main() {
  console.log('===============================================================');
  console.log(' AR-DSA TUTOR: RAG SYSTEM EMPIRICAL BENCHMARK & EVALUATION');
  console.log('===============================================================\n');

  const datasetPath = path.join(process.cwd(), 'data', 'rag', 'evaluation_dataset.json');
  if (!fs.existsSync(datasetPath)) {
    console.error(`Evaluation dataset not found at: ${datasetPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(datasetPath, 'utf8');
  const dataset: EvaluationQuery[] = JSON.parse(raw);
  console.log(`Loaded ${dataset.length} evaluation queries across 6 categories.\n`);

  const engine = new RAGEvaluationEngine();
  const startTime = Date.now();
  const report = await engine.evaluateDataset(dataset, 3);
  const totalDuration = Date.now() - startTime;

  console.log('--- OVERALL METRIC SUMMARY (K=3) ---');
  console.log(`Total Queries Evaluated: ${report.totalQueries}`);
  console.log(`Precision@3:            ${(report.overall.precisionAtK * 100).toFixed(1)}%`);
  console.log(`Recall@3:               ${(report.overall.recallAtK * 100).toFixed(1)}%`);
  console.log(`Mean Reciprocal Rank:   ${report.overall.mrr.toFixed(3)}`);
  console.log(`nDCG@3:                 ${report.overall.ndcgAtK.toFixed(3)}`);
  console.log(`Faithfulness Score:     ${(report.overall.faithfulness * 100).toFixed(1)}%`);
  console.log(`Citation Coverage:      ${(report.overall.citationCoverage * 100).toFixed(1)}%`);
  console.log(`Hallucination Rate:     ${(report.overall.hallucinationRate * 100).toFixed(1)}%`);
  console.log(`Honest Refusal Rate:    ${(report.overall.honestRefusalRate * 100).toFixed(1)}%`);
  console.log(`Mean Latency:           ${report.overall.meanTotalLatencyMs} ms`);
  console.log(`Median Latency:         ${report.overall.medianTotalLatencyMs} ms`);
  console.log(`p95 Latency:            ${report.overall.p95TotalLatencyMs} ms`);
  console.log(`Benchmark Duration:     ${totalDuration} ms\n`);

  console.log('--- BREAKDOWN BY CATEGORY ---');
  for (const [cat, metrics] of Object.entries(report.byCategory)) {
    console.log(`[${cat.padEnd(12)}] N=${metrics.count.toString().padEnd(2)} | Rec@3: ${(metrics.recallAtK * 100).toFixed(1)}% | MRR: ${metrics.mrr.toFixed(3)} | Faith: ${(metrics.faithfulness * 100).toFixed(1)}% | Lat: ${metrics.meanTotalLatencyMs}ms`);
  }
  console.log('\n--- BREAKDOWN BY ALGORITHM ---');
  for (const [algo, metrics] of Object.entries(report.byAlgorithm)) {
    console.log(`[${algo.padEnd(26)}] N=${metrics.count.toString().padEnd(2)} | Rec@3: ${(metrics.recallAtK * 100).toFixed(1)}% | MRR: ${metrics.mrr.toFixed(3)} | Faith: ${(metrics.faithfulness * 100).toFixed(1)}%`);
  }

  // Save report
  const outputPath = path.join(process.cwd(), 'data', 'rag', 'rag_benchmark_results.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nSuccessfully exported full benchmark report to:\n  ${outputPath}`);
  console.log('===============================================================\n');
}

main().catch(err => {
  console.error('Fatal evaluation error:', err);
  process.exit(1);
});
