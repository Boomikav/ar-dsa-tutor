# Learning Metrics & Statistical Analysis Methodology

**Project:** A Generative AI-Driven Augmented Reality Framework for Personalized Data Structures and Algorithms Learning  
**Short Name:** AR-DSA Tutor  
**Version:** 1.0.0 (Phase 12 Hardening)  

---

## 1. Learning Outcome Metrics

### 1.1 Absolute Learning Gain
Measures raw point change from pre-assessment to post-assessment:
$$\text{Gain}_{\text{abs}} = \text{PostScore} - \text{PreScore}$$

### 1.2 Hake's Normalized Learning Gain ($g$)
Measures the fraction of possible improvement achieved (for $\text{PostScore} \ge \text{PreScore}$):
$$g = \frac{\text{PostScore} - \text{PreScore}}{100 - \text{PreScore}}$$
* **Boundary Condition:** If $\text{PreScore} \ge 100$, $g = 0$ (avoiding division by zero).
* **Negative Change Handling:** If $\text{PostScore} < \text{PreScore}$, educational literature reports single-student proportional score change relative to baseline, explicitly termed **Relative Score Change (Loss)**:
$$\text{Change}_{\text{rel}} = \frac{\text{PostScore} - \text{PreScore}}{\text{PreScore}}$$

### 1.3 Delayed Retention Ratio
Measures knowledge retention over a 7-day delayed post-test window:
$$\text{Retention} = \frac{\text{DelayedPostScore}}{\text{PostScore}}$$
*(Gracefully defined: if $\text{PostScore} \le 0$, returns 1 if $\text{DelayedPostScore} = 0$, else 0).*

### 1.4 Independent Success Rate
Measures the proportion of practice decisions completed correctly without hints or AI explanations:
$$\text{Rate}_{\text{indep}} = \frac{\text{Count}(\text{correct} \land \neg\text{usedHint} \land \neg\text{requestedExplanation})}{\text{Total Attempts}} \times 100$$

---

## 2. Statistical Testing Framework

All inferential procedures are deterministic and execute via pure mathematical algorithms in `ResearchStatisticsEngine.ts`:

### 2.1 Between-Group Comparisons
* **Student's Two-Sample Independent $t$-Test:** Equal variances assumed across independent conditions.
* **Welch's $t$-Test:** Satterthwaite degrees of freedom approximation, robust to heteroscedasticity.
* **Mann-Whitney $U$ Test:** Non-parametric rank-sum test with average ranks for tied values and continuity-corrected normal approximation.

### 2.2 Within-Participant Paired Comparisons
* **Paired Student's $t$-Test:** Evaluates pre-test vs post-test within the same subject.
* **Wilcoxon Signed-Rank Test:** Non-parametric paired comparison across matched differences.

### 2.3 Multiple Comparison Corrections
When testing multiple secondary hypotheses, family-wise error rate and false discovery rate are controlled:
* **Holm-Bonferroni Step-Down:** Strongly controls family-wise error rate without conservative Bonferroni over-penalization.
* **Benjamini-Hochberg (FDR):** Controls false discovery rate at $q = 0.05$.

---

## 3. Effect Size Calculations

* **Cohen's $d$:**
  $$d = \frac{\bar{x}_1 - \bar{x}_2}{s_{\text{pooled}}}, \quad s_{\text{pooled}} = \sqrt{\frac{(n_1 - 1)s_1^2 + (n_2 - 1)s_2^2}{n_1 + n_2 - 2}}$$
* **Hedges' $g$ (Small-Sample Bias Correction):**
  $$g = d \cdot \left(1 - \frac{3}{4(n_1 + n_2 - 2) - 1}\right)$$
* **Rank-Biserial Correlation ($r$):**
  $$r = 1 - \frac{2U}{n_1 n_2}$$
* **Confidence Intervals:** 95% analytical confidence intervals computed for point estimates.

---

## 4. Usability Measurement (System Usability Scale)

The official 10-item System Usability Scale (SUS) is implemented:
$$\text{Score} = \left[ \sum_{i \in \text{odd}} (R_i - 1) + \sum_{j \in \text{even}} (5 - R_j) \right] \times 2.5$$
* Produces standardized score on a 0–100 scale.
* In clean baseline, empirical SUS score is strictly displayed as unavailable until human responses are gathered.
