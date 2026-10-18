import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

// Clean and sanitize LaTeX string
function cleanLatex(tex: string): string {
  let cleaned = tex.trim();
  // Remove wrapping delimiters if present
  if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('\\(') && cleaned.endsWith('\\)')) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('$') && cleaned.endsWith('$') && cleaned.length > 2) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

// Render a single formula safely with KaTeX
export const KatexFormula: React.FC<{
  formula: string;
  displayMode?: boolean;
  className?: string;
}> = ({ formula, displayMode = false, className = '' }) => {
  const html = useMemo(() => {
    const raw = cleanLatex(formula);
    try {
      return katex.renderToString(raw, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: true
      });
    } catch {
      // Fallback if KaTeX fails: clean readable text representation
      return `<span class="katex-fallback font-mono text-sm px-1 py-0.5 rounded bg-violet-50 text-violet-800">${escapeHtml(
        raw
      )}</span>`;
    }
  }, [formula, displayMode]);

  return (
    <span
      className={`katex-wrapper inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * MathRenderer parses text content containing:
 * - Display math: \[ ... \] or $$ ... $$
 * - Inline math: \( ... \) or $ ... $
 * - Standard paragraphs, bold, lists, and headings
 * and renders all mathematics strictly as beautiful KaTeX equations — NEVER raw LaTeX.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderedElements = useMemo(() => {
    if (!content) return null;

    // Pattern to match display and inline math blocks
    // 1. \[ ... \]
    // 2. $$ ... $$
    // 3. \( ... \)
    // 4. $ ... $
    const regex = /(\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\\([\s\S]*?\\\)|\$[^$\n]+\$)/g;
    const parts = content.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      const isDisplayBracket = part.startsWith('\\[') && part.endsWith('\\]');
      const isDisplayDoubleDollar = part.startsWith('$$') && part.endsWith('$$');
      const isInlineParen = part.startsWith('\\(') && part.endsWith('\\)');
      const isInlineSingleDollar = part.startsWith('$') && part.endsWith('$') && part.length > 2;

      if (isDisplayBracket || isDisplayDoubleDollar) {
        return (
          <div key={index} className="my-3 text-center overflow-x-auto py-2">
            <KatexFormula formula={part} displayMode={true} />
          </div>
        );
      }

      if (isInlineParen || isInlineSingleDollar) {
        return <KatexFormula key={index} formula={part} displayMode={false} />;
      }

      // Plain text formatting (support markdown bold, code, bullets)
      return (
        <span key={index} className="leading-relaxed">
          {formatSimpleMarkdown(part)}
        </span>
      );
    });
  }, [content]);

  return <div className={`math-rendered-text space-y-1 ${className}`}>{renderedElements}</div>;
};

// Helper for inline bold, italic, code
function formatSimpleMarkdown(text: string): React.ReactNode {
  // Split by bold (**bold**)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((chunk, i) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[#27223B]">
          {chunk.slice(2, -2)}
        </strong>
      );
    }
    if (chunk.startsWith('*') && chunk.endsWith('*')) {
      return <em key={i}>{chunk.slice(1, -1)}</em>;
    }
    if (chunk.startsWith('`') && chunk.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded text-xs font-mono bg-violet-50 text-violet-700 border border-violet-100"
        >
          {chunk.slice(1, -1)}
        </code>
      );
    }
    return chunk;
  });
}
