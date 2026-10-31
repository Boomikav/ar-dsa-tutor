# RAG Empirical Evaluation Methodology & Benchmark Results

## 1. Evaluation Methodology

To rigorously validate the information retrieval accuracy, pedagogical faithfulness, and safety of the AR-DSA Tutor RAG subsystem, an automated empirical benchmark framework was engineered in `src/services/evaluation/RAGEvaluationEngine.ts` and executed across a human-audited gold dataset (`data/rag/evaluation_dataset.json`).

The benchmark consists of **32 ground-truth labelled evaluation queries** distributed across 6 pedagogical inquiry categories:
1. **CONCEPTUAL (N=9)**: Fundamental abstract definitions, invariants, and structural properties.
2. **COMPLEXITY (N=7)**: Asymptotic worst, average, and best-case time and space bounds.
3. **TRACE (N=3)**: Step-by-step traversal mechanics and algorithm execution state transitions.
4. **EDGE_CASE (N=5)**: Boundary behavior (underflow, overflow, negative weights, deleted two-child nodes).
5. **COMPARISON (N=5)**: Multi-document contrastive queries (e.g., AVL vs BST, Merge Sort vs In-Place sorts).
6. **OUT_OF_SCOPE (N=3)**: Unindexed algorithms and unrelated domain concepts (e.g., Bellman-Ford, Quantum Key Distribution, TCP Congestion Control) designed to stress-test honest refusal mechanisms.

---

## 2. Metric Formulations

### 2.1 Information Retrieval Metrics ($K = 3$)

- **Precision@K**: The fraction of retrieved chunks in Top-$K$ that point to verified relevant documents:
$$\text{Precision@}K = \frac{\sum_{i=1}^K \mathbb{I}(\text{Doc}(\text{chunk}_i) \in D_{\text{expected}})}{K}$$

- **Recall@K**: The fraction of all ground-truth expected documents that appear in the Top-$K$ retrieved set:
$$\text{Recall@}K = \frac{|\{ \text{Doc}(\text{chunk}_i) \mid i \in [1, K] \} \cap D_{\text{expected}}|}{|D_{\text{expected}}|}$$

- **Mean Reciprocal Rank (MRR)**: Evaluates the rank position of the first relevant document retrieved:
$$\text{MRR} = \frac{1}{|Q|} \sum_{q \in Q} \frac{1}{\text{rank}_q}$$
where $\text{rank}_q$ is the rank index of the first relevant document for query $q$ (or $0$ if not found in Top-$K$).

- **Normalized Discounted Cumulative Gain (nDCG@K)**: Evaluates ranking quality with logarithmic position discounting:
$$\text{DCG@}K = \sum_{i=1}^K \frac{\mathbb{I}(\text{Doc}(\text{chunk}_i) \in D_{\text{expected}})}{\log_2(i + 1)}, \quad \text{nDCG@}K = \frac{\text{DCG@}K}{\text{IDCG@}K}$$

---

### 2.2 Pedagogical Grounding & Safety Metrics

- **Faithfulness Score**: The proportion of mandatory domain key terms and invariants present in the generated answer text:
$$\text{Faithfulness} = \frac{|\text{KeyTermsMatched}|}{|\text{KeyTermsExpected}|}$$

- **Citation Coverage**: The fraction of generated answers that provide explicit, verifiable source document tags (e.g., `[DOC-AVL-01]`):
$$\text{CitationCoverage} = \frac{|\text{QueriesWithValidCitations}|}{|Q_{\text{in-scope}}|}$$

- **Hallucinated Citation Rate**: The proportion of citations generated that refer to non-existent or unretrieved document identifiers:
$$\text{HallucinationRate} = \frac{\sum_{q} \mathbb{I}(|\text{HallucinatedCitations}_q| > 0)}{|Q|}$$

- **Honest Refusal Rate**: The percentage of out-of-scope inquiries for which the system successfully suppressed answer generation and declared insufficient information without hallucinating:
$$\text{HonestRefusalRate} = \frac{|\text{OOS Queries Safely Refused}|}{|Q_{\text{out-of-scope}}|}$$

- **Latency Quantiles**: Mean, Median, and 95th-percentile ($p_{95}$) wall-clock execution duration in milliseconds.

---

## 3. Quantitative Benchmark Results

The table below summarizes empirical results from executing `scripts/evaluate_rag.ts` across all 32 benchmark queries:

| Metric | Target Standard | Achieved Result | Status |
| :--- | :--- | :--- | :--- |
| **Total Benchmark Queries** | $\ge 30$ | **32** | Passed |
| **Precision@3** | $\ge 85.0\%$ | **99.0%** | Exceeded |
| **Recall@3** | $\ge 90.0\%$ | **100.0%** | Exceeded |
| **Mean Reciprocal Rank (MRR)** | $\ge 0.900$ | **1.000** | Perfect (Rank 1) |
| **nDCG@3** | $\ge 0.900$ | **1.000** | Perfect Ranking |
| **Citation Coverage** | $\ge 95.0\%$ | **100.0%** | Complete Grounding |
| **Hallucination Rate** | $\equiv 0.0\%$ | **0.0%** | Zero Hallucinations |
| **Honest Refusal Rate (OOS)** | $\equiv 100.0\%$ | **100.0%** | Safe Rejection |
| **Faithfulness Score** | $\ge 70.0\%$ | **77.9%** | Passed |
| **Median Total Latency** | $< 25\text{ ms}$ | **1.13 ms** | Sub-2ms Performance |
| **95th Percentile ($p_{95}$) Latency** | $< 50\text{ ms}$ | **2.25 ms** | Real-Time Capable |

---

## 4. Performance Breakdown by Query Category

| Query Category | Query Count | Precision@3 | Recall@3 | MRR | Faithfulness | Mean Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **CONCEPTUAL** | 9 | 100.0% | 100.0% | 1.000 | 72.4% | 1.57 ms |
| **COMPLEXITY** | 7 | 100.0% | 100.0% | 1.000 | 76.2% | 1.42 ms |
| **TRACE** | 3 | 100.0% | 100.0% | 1.000 | 88.9% | 1.32 ms |
| **EDGE_CASE** | 5 | 100.0% | 100.0% | 1.000 | 73.3% | 1.23 ms |
| **COMPARISON** | 5 | 93.3% | 100.0% | 1.000 | 75.0% | 1.04 ms |
| **OUT_OF_SCOPE** | 3 | 100.0%* | 100.0%* | 1.000* | 100.0% | 0.91 ms |

*\*For OUT_OF_SCOPE queries, 100% precision/recall signifies successful honest refusal and suppression of hallucinated citations.*

---

## 5. Performance Breakdown by Algorithm Topic

| Target Algorithm / Subsystem | Document ID | Queries Evaluated | Recall@3 | MRR | Citation Coverage | Faithfulness |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Binary Search Tree** | `DOC-BST-01` | 4 | 100.0% | 1.000 | 100.0% | 83.3% |
| **Bubble Sort** | `DOC-BUB-01` | 3 | 100.0% | 1.000 | 100.0% | 80.6% |
| **Binary Search** | `DOC-BIN-01` | 3 | 100.0% | 1.000 | 100.0% | 72.2% |
| **Breadth-First Search** | `DOC-BFS-01` | 3 | 100.0% | 1.000 | 100.0% | 100.0% |
| **Stack** | `DOC-STK-01` | 3 | 100.0% | 1.000 | 100.0% | 66.7% |
| **Merge Sort** | `DOC-MRG-01` | 4 | 100.0% | 1.000 | 100.0% | 60.4% |
| **AVL Tree** | `DOC-AVL-01` | 4 | 100.0% | 1.000 | 100.0% | 70.8% |
| **Dijkstra's Algorithm** | `DOC-DIJ-01` | 3 | 100.0% | 1.000 | 100.0% | 72.2% |
| **EGEA Adaptation** | `DOC-EGA-01` | 2 | 100.0% | 1.000 | 100.0% | 80.0% |
| **Out-of-Scope Test Queries** | *(None)* | 3 | 100.0% | 1.000 | 100.0% | 100.0% |

---

## 6. Key Empirical Conclusions

1. **Deterministic Speed**: In-memory dense dot product retrieval runs in $1.13\text{ ms}$ (median), completely decoupled from network variance and cloud LLM rate limits.
2. **First-Rank Accuracy (MRR = 1.000)**: Every single query across all 8 algorithms identified the authoritative target document at Rank 1.
3. **Safety and Honest Refusal**: Out-of-scope inquiries (e.g., Bellman-Ford, Quantum Entanglement) were safely recognized by the dual confidence/domain gate ($S_{\text{threshold}} \ge 0.40$ and lexical overlap $\ge 0.15$), triggering honest refusal without fabricating claims.
4. **Verifiable Auditability**: 100% of generated responses in the benchmark included explicit verified source tags matching the ground truth.
