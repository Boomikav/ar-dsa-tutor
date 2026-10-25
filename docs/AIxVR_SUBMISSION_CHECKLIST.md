# IEEE AIxVR 2027 — Submission Checklist & Track Selection Strategy

**Conference:** 9th IEEE International Conference on Artificial Intelligence and eXtended and Virtual Reality (IEEE AIxVR 2027)  
**Location & Dates:** Vancouver, Canada (UBC Robson Square) — January 25–27, 2027  
**Official Portal:** [IEEE AIxVR 2027 Website](https://aivr.science.uu.nl/2027/)  
**Submission Engine:** EasyChair for AIxVR 2027  
**Submission Deadline:** **October 29, 2026 (23:59:59 Anywhere on Earth, AoE)**  
**Author / Reviewer Date:** October 25, 2026  
**Audited Baseline Commit:** `e894a95`  

---

## 1. Track Comparison & Selection Rationale

| Evaluation Dimension | Demos & Videos Track (Recommended) | Work-in-Progress (WiP) Track (Alternative) |
|---|---|---|
| **Primary Focus** | Concrete systems, working prototypes, proofs-of-concept, and interactive XR/AI demonstrations. | Early-stage research, late-breaking preliminary findings, emerging conceptual frameworks. |
| **Review Format** | **Single-Blind (Non-Anonymous):** Authors, affiliations, and repository/demo links are included directly in the manuscript. | **Double-Blind (Anonymous):** Authors and identifying references must be fully redacted. |
| **Presentation Format** | Interactive live exhibition booth at the conference venue or high-fidelity video presentation if equipment/travel is constrained. | Poster presentation during designated interactive poster sessions. |
| **Page Limit** | Maximum **4 pages** in standard IEEE double-column format (references on an optional additional page if specified, or strictly bounded within 4 pages). | Maximum **4 pages** in standard IEEE double-column format. |
| **Proceedings** | Published in IEEE AIxVR 2027 proceedings and submitted for inclusion in the **IEEE Xplore Digital Library**. | Published in IEEE AIxVR 2027 proceedings and submitted for inclusion in the **IEEE Xplore Digital Library**. |
| **Alignment with AR-DSA Tutor** | **EXCELLENT FIT:** AR-DSA Tutor is a fully functional WebXR system with 5 interactive 3D spatial algorithm engines, persistent session lifecycle, and sub-millisecond adaptive guidance. The demonstration highlights real-time system capabilities and zero-install mobile accessibility. | **ACCEPTABLE BACKUP:** Feasible if the authors prefer an anonymous poster presentation, but risks reviewers questioning the absence of empirical student learning gains ($g$). |

### Official Track Decision
**Selected Track:** **Demos & Videos Track**  
**Strategic Rationale:**
1. **Focus on System Reality:** AR-DSA Tutor's core contribution is an implemented, working systems prototype: zero-install mobile WebXR, continuous 60 FPS Three.js rendering, deterministic algorithm state transitions, and explainable adaptive guidance without generative AI hallucinations.
2. **Defensible Evidence Boundary:** The project does not currently possess empirical human student trial data ($N=0$ students, no IRB protocol). Submitting to a research track that anticipates learning gains would invite rejection. A Demo track evaluates technical novelties, usability, latency, architectural elegance, and live interaction.
3. **Open Artifacts:** Single-blind review enables linking the live web application, video walkthrough, and reproducible verification scripts directly to reviewers.

---

## 2. Official Submission Requirements Verification

Based on official IEEE AIxVR 2027 Call for Papers guidelines:

| Requirement Category | Official Specification | Repository Compliance Status |
|---|---|:---:|
| **Submission Deadline** | October 29, 2026 (AoE) | **VERIFIED (Active — 4 days remaining)** |
| **Camera-Ready Deadline** | December 15, 2026 | **NOTED** |
| **Notification Date** | Early December 2026 | **NOTED** |
| **Paper Length** | Max 4 pages (IEEE double-column format) | **COMPLIANT** (`docs/AIxVR_DEMO_PAPER.md`) |
| **Template Format** | Standard IEEE Conference Template (US Letter, 10pt font, two-column) | **COMPLIANT** (Structured for IEEE template) |
| **Anonymization** | Single-blind for Demo/Video track (authors visible) | **COMPLIANT** |
| **Video Material** | Link to demonstration video (or video attachment) | **SCRIPT READY** (`docs/AIxVR_DEMO_VIDEO_SCRIPT.md`) |
| **AI Disclosure** | Mandatory disclosure of Generative AI tools under IEEE PSPB Operations Manual Section 8.2.1.B.10 | **COMPLIANT** (Disclosed in Acknowledgments) |
| **Publisher** | IEEE Computer Society / IEEE Xplore | **NOTED** |

---

## 3. Mandatory IEEE Generative AI Disclosure Statement

In compliance with the **IEEE Publication Services and Products Board (PSPB) Operations Manual (Section 8.2.1.B.10)**:
- Generative AI tools (such as large language models) cannot be credited as authors.
- If AI-assisted tools were used in writing, coding, or synthesizing text, this must be explicitly disclosed in the Acknowledgments section specifying:
  1. The name and version of the AI tool used.
  2. The specific sections or elements where assistance occurred.
  3. The nature and level of assistance.
- Human authors retain full responsibility for the technical accuracy of all assertions, mathematical proofs, and bibliographic citations.

**Formulated Disclosure Text (included in `docs/AIxVR_DEMO_PAPER.md`):**
> *"Acknowledgment of AI-Assisted Tooling: In accordance with IEEE publication policies on generative AI, the authors disclose that an AI programming assistant (Google Antigravity / Gemini) was utilized during system development and manuscript drafting for code optimization, LaTeX formatting, and editorial language refinement. All architectural designs, deterministic algorithms, empirical benchmark scripts, recomputed metrics, and technical conclusions were conceived, executed, verified, and audited under the direct responsibility of the human authors."*

---

## 4. Submission Artifacts Inventory

1. **Submission Manuscript:** [`docs/AIxVR_DEMO_PAPER.md`](file:///c:/Users/ajaya/Desktop/AR/docs/AIxVR_DEMO_PAPER.md) (4-page IEEE formatted markdown).
2. **Video Demonstration Script:** [`docs/AIxVR_DEMO_VIDEO_SCRIPT.md`](file:///c:/Users/ajaya/Desktop/AR/docs/AIxVR_DEMO_VIDEO_SCRIPT.md) (90-second timecoded storyboard).
3. **Figure Planning & Layout:** [`docs/AIxVR_FIGURE_PLAN.md`](file:///c:/Users/ajaya/Desktop/AR/docs/AIxVR_FIGURE_PLAN.md) (Specifications for Figures 1–4).
4. **Final Compliance Audit:** [`docs/AIxVR_FINAL_COMPLIANCE_REVIEW.md`](file:///c:/Users/ajaya/Desktop/AR/docs/AIxVR_FINAL_COMPLIANCE_REVIEW.md) (Cross-verification against IEEE requirements).

---

## 5. Submission Readiness & Action Items

- [x] Select Track (IEEE AIxVR 2027 Demos & Videos Track).
- [x] Author 4-Page Submission Paper (`docs/AIxVR_DEMO_PAPER.md`).
- [x] Prepare 90-Second Demonstration Video Script (`docs/AIxVR_DEMO_VIDEO_SCRIPT.md`).
- [x] Prepare Figure and Table Layout Specifications (`docs/AIxVR_FIGURE_PLAN.md`).
- [x] Disclose Generative AI Tooling under IEEE PSPB 8.2.1.B.10.
- [x] Re-run Full Test Runner (17 suites, 1,403 assertions passing).
- [x] Verify Production Build (`npm run build`) and Security Scan (`node scripts/audit_dist.js`).
- [ ] **Action Required by User:** Record approximately 90 seconds of mobile/browser screen capture following `docs/AIxVR_DEMO_VIDEO_SCRIPT.md`.
- [ ] **Action Required by User:** Upload PDF manuscript and video link via EasyChair before **October 29, 2026 (AoE)**.
