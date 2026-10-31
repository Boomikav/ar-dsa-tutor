/**
 * Citation Validator for Grounded RAG Output
 * 
 * Verifies that all facts and statements produced by the AI Tutor
 * strictly reference verified documents from the retrieved knowledge chunks.
 * Detects hallucinated citation tags and computes grounding metrics.
 */

import { ScoredRAGChunk } from './VectorStore';

export interface CitationValidationResult {
  isGrounded: boolean;
  citedDocumentIds: string[];
  validCitations: string[];
  hallucinatedCitations: string[];
  citationCoverage: number; // Ratio of valid citations to total citations (0.0 to 1.0)
  unsupportedClaimsRate: number; // Ratio of hallucinated citations to total citations (0.0 to 1.0)
  insufficientContextHandled: boolean;
  validationNotes: string[];
}

export class CitationValidator {
  private static readonly CITATION_REGEX = /\[(DOC-[A-Z0-9_-]+)\]/g;
  private static readonly BARE_DOC_REGEX = /\b(DOC-[A-Z0-9_-]+)\b/g;
  private static readonly INSUFFICIENT_MARKERS = [
    'based on the verified knowledge base, this information is not available',
    'not available in the verified knowledge base',
    'insufficient context',
    'does not contain information',
    'no relevant knowledge chunks'
  ];

  /**
   * Extracts all unique citation IDs from the text (e.g. "[DOC-AVL-01]" -> "DOC-AVL-01").
   */
  public static extractCitations(text: string): string[] {
    const citedSet = new Set<string>();
    
    // Check bracketed citations first [DOC-XXX]
    let match: RegExpExecArray | null;
    const bracketRegex = new RegExp(this.CITATION_REGEX.source, 'g');
    while ((match = bracketRegex.exec(text)) !== null) {
      if (match[1]) citedSet.add(match[1]);
    }

    // Also catch bare DOC-XXX mentions if not already bracketed
    const bareRegex = new RegExp(this.BARE_DOC_REGEX.source, 'g');
    while ((match = bareRegex.exec(text)) !== null) {
      if (match[1]) citedSet.add(match[1]);
    }

    return Array.from(citedSet);
  }

  /**
   * Validates a generated response against the retrieved chunks.
   */
  public static validate(
    responseText: string,
    retrievedChunks: ScoredRAGChunk[],
    hasSufficientContext: boolean
  ): CitationValidationResult {
    const citedDocumentIds = this.extractCitations(responseText);
    const textLower = responseText.toLowerCase();
    const insufficientContextHandled = this.INSUFFICIENT_MARKERS.some(marker => 
      textLower.includes(marker)
    );

    // Build set of valid document IDs from retrieved chunks
    const validDocIds = new Set<string>();
    for (const item of retrievedChunks) {
      validDocIds.add(item.chunk.documentId);
    }

    const validCitations: string[] = [];
    const hallucinatedCitations: string[] = [];
    const validationNotes: string[] = [];

    for (const citation of citedDocumentIds) {
      if (validDocIds.has(citation)) {
        validCitations.push(citation);
      } else {
        hallucinatedCitations.push(citation);
      }
    }

    let isGrounded = false;
    let citationCoverage = 0;
    let unsupportedClaimsRate = 0;

    if (!hasSufficientContext) {
      // Query was out of domain or lacked sufficient retrieved confidence
      if (insufficientContextHandled && hallucinatedCitations.length === 0) {
        isGrounded = true;
        citationCoverage = 1.0;
        unsupportedClaimsRate = 0.0;
        validationNotes.push('Honestly signaled insufficient context with zero hallucinated citations.');
      } else if (!insufficientContextHandled) {
        isGrounded = false;
        citationCoverage = 0.0;
        unsupportedClaimsRate = 1.0;
        validationNotes.push('Failed to signal insufficient context for out-of-scope/unindexed query.');
      } else {
        isGrounded = false;
        citationCoverage = 0.0;
        unsupportedClaimsRate = 1.0;
        validationNotes.push(`Extracted invalid citations despite insufficient context: ${hallucinatedCitations.join(', ')}`);
      }
    } else {
      // Normal retrieval case
      const totalCitations = citedDocumentIds.length;
      if (totalCitations === 0) {
        // Did not include citations despite having retrieved context
        isGrounded = false;
        citationCoverage = 0.0;
        unsupportedClaimsRate = 0.0;
        validationNotes.push('Response omitted citations despite verified knowledge availability.');
      } else {
        citationCoverage = Number((validCitations.length / totalCitations).toFixed(4));
        unsupportedClaimsRate = Number((hallucinatedCitations.length / totalCitations).toFixed(4));
        
        if (hallucinatedCitations.length === 0 && validCitations.length > 0) {
          isGrounded = true;
          validationNotes.push(`Grounded with ${validCitations.length} valid citation(s): ${validCitations.join(', ')}.`);
        } else {
          isGrounded = false;
          validationNotes.push(`Contains ${hallucinatedCitations.length} hallucinated citation(s): ${hallucinatedCitations.join(', ')}.`);
        }
      }
    }

    return {
      isGrounded,
      citedDocumentIds,
      validCitations,
      hallucinatedCitations,
      citationCoverage,
      unsupportedClaimsRate,
      insufficientContextHandled,
      validationNotes
    };
  }
}
