import React, { useMemo } from 'react';
import katex from 'katex';
import { marked } from 'marked';

interface MathMarkdownRendererProps {
  content: string;
  className?: string;
}

// Clean and normalize LaTeX input
function cleanLatexString(tex: string): string {
  let cleaned = tex.trim();
  // Strip outer delimiters if present
  if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('\\(') && cleaned.endsWith('\\)')) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('$') && cleaned.endsWith('$') && cleaned.length > 2) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Handle double-escaped backslashes commonly returned by JSON responses (e.g. \\frac -> \frac)
  // but keep \\ when used for matrix row breaks
  cleaned = cleaned.replace(/\\\\([a-zA-Z]+)/g, '\\$1');

  return cleaned;
}

export function renderKatexToString(mathStr: string, displayMode: boolean): string {
  const raw = cleanLatexString(mathStr);
  try {
    return katex.renderToString(raw, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true
    });
  } catch (err: any) {
    const safeText = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<span class="katex-fallback font-mono text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200" title="Mathematical expression">${safeText}</span>`;
  }
}

/**
 * Configure marked parser with table, line break, and gfm support
 */
marked.setOptions({
  gfm: true,
  breaks: true
});

/**
 * MathMarkdownRenderer parses a string that contains mixed Markdown and LaTeX mathematics.
 * It protects display and inline math blocks during markdown conversion,
 * then safely injects high-fidelity KaTeX rendered HTML.
 */
export const MathMarkdownRenderer: React.FC<MathMarkdownRendererProps> = ({
  content,
  className = ''
}) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Step 1: Pre-process text to normalize math delimiters
    let text = content;

    // Step 2: Extract display math blocks:
    // Pattern 1: \[ ... \]
    // Pattern 2: $$ ... $$
    // Pattern 3: \begin{equation/align/gather/matrix} ... \end{...}
    const mathPlaceholders: { id: string; html: string }[] = [];
    let mathCounter = 0;

    // Replace display blocks first
    text = text.replace(/(\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\\begin\{(?:equation\*?|align\*?|aligned|gather\*?|matrix|pmatrix|bmatrix)\}[\s\S]*?\\end\{(?:equation\*?|align\*?|aligned|gather\*?|matrix|pmatrix|bmatrix)\})/g, (match) => {
      const placeholder = `%%KATEX_DISPLAY_${mathCounter++}%%`;
      const rendered = renderKatexToString(match, true);
      mathPlaceholders.push({
        id: placeholder,
        html: `<div class="katex-display-container my-4 text-center overflow-x-auto py-2.5 px-3 bg-[#FAF8FF] border border-[#E2DCF7] rounded-2xl shadow-2xs">${rendered}</div>`
      });
      return `\n\n${placeholder}\n\n`;
    });

    // Replace inline math blocks:
    // Pattern 1: \( ... \)
    // Pattern 2: $...$ where $ is not preceded by digit (preventing currency like $50 or $10.99)
    // and followed by non-space, ending with non-space $
    text = text.replace(/(\\\([\s\S]*?\\\)|\$(?!\s|\d+(?:\.\d{2})?(?:\s|$))([^$\n]+?)(?<!\s)\$)/g, (match) => {
      // If it looks like a currency amount, ignore
      if (/^\$\d+(\.\d{1,2})?$/.test(match)) {
        return match;
      }
      const placeholder = `%%KATEX_INLINE_${mathCounter++}%%`;
      const rendered = renderKatexToString(match, false);
      mathPlaceholders.push({
        id: placeholder,
        html: `<span class="katex-inline-wrapper inline-block mx-0.5">${rendered}</span>`
      });
      return placeholder;
    });

    // Step 3: Run marked parser on the markdown with math placeholders protected
    let html = '';
    try {
      html = marked.parse(text) as string;
    } catch {
      html = text;
    }

    // Step 4: Re-insert KaTeX rendered equations
    mathPlaceholders.forEach(({ id, html: mathHtml }) => {
      // Handle cases where marked wrapped the placeholder in <p>%%...%%</p>
      const pWrappedRegex = new RegExp(`<p>\\s*${id}\\s*<\\/p>`, 'g');
      if (pWrappedRegex.test(html)) {
        html = html.replace(pWrappedRegex, mathHtml);
      } else {
        html = html.split(id).join(mathHtml);
      }
    });

    return html;
  }, [content]);

  return (
    <div
      className={`study-prose leading-relaxed text-[#27223B] ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
