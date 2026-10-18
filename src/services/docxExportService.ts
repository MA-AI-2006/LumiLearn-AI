import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} from 'docx';
import { NoteDocument, FormulaExplanation } from '../types';

/**
 * Converts mathematical LaTeX to clean, readable Unicode math for Microsoft Word
 */
function latexToReadableUnicode(tex: string): string {
  if (!tex) return '';
  let str = tex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\left\|([^}]+)\\right\|/g, '|$1|')
    .replace(/\\left\(([^}]+)\\right\)/g, '($1)')
    .replace(/\\left\[([^}]+)\\right\]/g, '[$1]')
    .replace(/\\pi/g, 'π')
    .replace(/\\theta/g, 'θ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\rho/g, 'ρ')
    .replace(/\\infty/g, '∞')
    .replace(/\\approx/g, '≈')
    .replace(/\\neq/g, '≠')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\times/g, ' × ')
    .replace(/\\int_([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, '∫[$1 to $2]')
    .replace(/\\int/g, '∫')
    .replace(/\\lim_\{([^}]+)\}/g, 'lim($1)')
    .replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '∑[$1 to $2]')
    .replace(/\\partial/g, '∂')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\\\*/g, '*')
    .replace(/\\\[|\\\]|\$\$|\$|\\\(|\\\)/g, '')
    .trim();
  return str;
}

/**
 * Parses markdown inline formatting (bold, italic, math) into docx TextRun elements
 */
function parseMarkdownToRuns(text: string): TextRun[] {
  if (!text) return [];

  const runs: TextRun[] = [];
  // Tokenize by bold, italic, code, and inline math
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\$[^$]+\$|\\\([^)]+\\\))/g;
  const parts = text.split(tokenRegex);

  parts.forEach((part) => {
    if (!part) return;

    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(
        new TextRun({
          text: part.slice(2, -2),
          bold: true,
          color: '27223B'
        })
      );
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(
        new TextRun({
          text: part.slice(1, -1),
          italics: true,
          color: '514963'
        })
      );
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(
        new TextRun({
          text: part.slice(1, -1),
          font: 'Consolas',
          color: '6654D9'
        })
      );
    } else if (
      (part.startsWith('$') && part.endsWith('$')) ||
      (part.startsWith('\\(') && part.endsWith('\\)'))
    ) {
      const mathClean = latexToReadableUnicode(part);
      runs.push(
        new TextRun({
          text: ` ${mathClean} `,
          bold: true,
          color: '6654D9',
          font: 'Cambria Math'
        })
      );
    } else {
      runs.push(
        new TextRun({
          text: part,
          color: '362E4A'
        })
      );
    }
  });

  return runs;
}

/**
 * Creates a formula callout card in docx format
 */
function createFormulaDocxTable(formula: FormulaExplanation): Table {
  const tableRows: TableRow[] = [];

  // Row 1: Header
  tableRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `FORMULA: ${formula.name.toUpperCase()}`,
                  bold: true,
                  size: 20,
                  color: '6654D9'
                })
              ]
            })
          ],
          shading: { type: ShadingType.CLEAR, fill: 'FAF8FF' }
        })
      ]
    })
  );

  // Row 2: Standard Formula
  tableRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: latexToReadableUnicode(formula.latex),
                  bold: true,
                  size: 26,
                  font: 'Cambria Math',
                  color: '27223B'
                })
              ],
              spacing: { before: 120, after: 120 }
            })
          ],
          shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' }
        })
      ]
    })
  );

  // Row 3: Purpose & Plain explanation
  tableRows.push(
    new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Core Purpose: ', bold: true, color: '8B4513' }),
                new TextRun({ text: formula.purpose, color: '3A302A' })
              ]
            }),
            ...(formula.plainVersion
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: 'Intuitive Summary: ', bold: true, color: '1E5638' }),
                      new TextRun({ text: formula.plainVersion, color: '1E5638' })
                    ],
                    spacing: { before: 80 }
                  })
                ]
              : [])
          ],
          shading: { type: ShadingType.CLEAR, fill: 'FFFBF0' }
        })
      ]
    })
  );

  // Row 4: Symbols list
  if (formula.symbols && formula.symbols.length > 0) {
    const symbolParagraphs = formula.symbols.map(
      (s) =>
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${latexToReadableUnicode(s.symbol)}: `,
              bold: true,
              font: 'Cambria Math',
              color: '6654D9'
            }),
            new TextRun({ text: s.meaning, color: '362E4A' })
          ],
          spacing: { after: 40 }
        })
    );

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Variable Definitions:', bold: true, size: 18 })],
                spacing: { after: 80 }
              }),
              ...symbolParagraphs
            ],
            shading: { type: ShadingType.CLEAR, fill: 'FAF8F4' }
          })
        ]
      })
    );
  }

  // Row 5: Worked Example if present
  if (formula.workedExample) {
    const ex = formula.workedExample;
    const exampleParas: Paragraph[] = [
      new Paragraph({
        children: [
          new TextRun({
            text: 'Worked Numerical Example:',
            bold: true,
            color: '1E5638',
            size: 19
          })
        ],
        spacing: { before: 60, after: 60 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Problem: ', bold: true }),
          new TextRun({ text: ex.problem })
        ],
        spacing: { after: 40 }
      }),
      ...(ex.givenValues
        ? [
            new Paragraph({
              children: [
                new TextRun({ text: 'Given: ', bold: true, color: '6654D9' }),
                new TextRun({ text: ex.givenValues })
              ],
              spacing: { after: 60 }
            })
          ]
        : [])
    ];

    ex.steps.forEach((st, idx) => {
      exampleParas.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Step ${idx + 1} (${st.step}): `, bold: true, color: '6654D9' }),
            new TextRun({ text: `${latexToReadableUnicode(st.calculation)} = ` }),
            new TextRun({ text: latexToReadableUnicode(st.result), bold: true })
          ],
          spacing: { after: 40 }
        })
      );
    });

    exampleParas.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Final Answer: ', bold: true, color: '1E5638' }),
          new TextRun({
            text: latexToReadableUnicode(ex.finalAnswer),
            bold: true,
            color: '1E5638',
            size: 22
          })
        ],
        spacing: { before: 80, after: 40 }
      })
    );

    if (ex.interpretation) {
      exampleParas.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Interpretation: ', bold: true, color: '8B4513' }),
            new TextRun({ text: ex.interpretation, italics: true })
          ],
          spacing: { after: 60 }
        })
      );
    }

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: exampleParas,
            shading: { type: ShadingType.CLEAR, fill: 'F0FBF5' }
          })
        ]
      })
    );
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows
  });
}

/**
 * Main export function to generate and trigger download of Microsoft Word (.docx) file
 */
export async function exportNoteToDocx(note: NoteDocument): Promise<void> {
  const docChildren: (Paragraph | Table)[] = [];

  // Title
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: note.title,
          bold: true,
          size: 38,
          color: '27223B'
        })
      ],
      spacing: { after: 180 }
    })
  );

  // Metadata Table
  docChildren.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Academic Level: ', bold: true }),
                    new TextRun({ text: note.academicLevel })
                  ]
                })
              ]
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Detail Setting: ', bold: true }),
                    new TextRun({ text: note.detailLevel })
                  ]
                })
              ]
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Language: ', bold: true }),
                    new TextRun({ text: note.language })
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  );

  docChildren.push(new Paragraph({ spacing: { after: 200 } }));

  // Overview
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'EXECUTIVE OVERVIEW',
          bold: true,
          size: 20,
          color: '6654D9'
        })
      ],
      spacing: { after: 80 }
    })
  );

  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: note.overview,
          italics: true,
          color: '433B56',
          size: 22
        })
      ],
      spacing: { after: 280 }
    })
  );

  // Sections
  note.sections.forEach((sec, idx) => {
    // Section Heading
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun({
            text: sec.title,
            bold: true,
            size: 28,
            color: '6654D9'
          })
        ],
        spacing: { before: 360, after: 140 }
      })
    );

    // Section Content Paragraphs
    const paragraphs = sec.content.split(/\n\n+/);
    paragraphs.forEach((pText) => {
      const trimmed = pText.trim();
      if (!trimmed) return;

      // Handle bullet lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        const bulletLines = trimmed.split('\n');
        bulletLines.forEach((bLine) => {
          const itemText = bLine.replace(/^[-*•]\s+/, '');
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              children: parseMarkdownToRuns(itemText),
              spacing: { after: 60 }
            })
          );
        });
      } else {
        docChildren.push(
          new Paragraph({
            children: parseMarkdownToRuns(trimmed),
            spacing: { after: 120 },
            lineSpacing: 276
          })
        );
      }
    });

    // Formulas
    if (sec.formulas && sec.formulas.length > 0) {
      sec.formulas.forEach((f) => {
        docChildren.push(new Paragraph({ spacing: { before: 120 } }));
        docChildren.push(createFormulaDocxTable(f));
        docChildren.push(new Paragraph({ spacing: { after: 140 } }));
      });
    }

    // Key Definitions
    if (sec.keyDefinitions && sec.keyDefinitions.length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Key Definitions:',
              bold: true,
              color: '1E5638',
              size: 20
            })
          ],
          spacing: { before: 140, after: 80 }
        })
      );

      sec.keyDefinitions.forEach((d) => {
        docChildren.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: `${d.term}: `, bold: true, color: '27223B' }),
              new TextRun({ text: d.definition, color: '433B56' })
            ],
            spacing: { after: 60 }
          })
        );
      });
    }
  });

  // Executive Synthesis & Key Takeaways
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: 'Executive Synthesis & High-Yield Key Takeaways',
          bold: true,
          size: 28,
          color: '1E5638'
        })
      ],
      spacing: { before: 400, after: 140 }
    })
  );

  docChildren.push(
    new Paragraph({
      children: parseMarkdownToRuns(note.summary),
      spacing: { after: 140 }
    })
  );

  if (note.keyTakeaways && note.keyTakeaways.length > 0) {
    note.keyTakeaways.forEach((k) => {
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          children: parseMarkdownToRuns(k),
          spacing: { after: 80 }
        })
      );
    });
  }

  // Revision Checklist
  if (note.revisionChecklist && note.revisionChecklist.length > 0) {
    docChildren.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: 'Active Revision & Exam Readiness Checklist',
            bold: true,
            size: 24,
            color: '8B4513'
          })
        ],
        spacing: { before: 240, after: 100 }
      })
    );

    note.revisionChecklist.forEach((item) => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: '☐  ', bold: true }),
            ...parseMarkdownToRuns(item)
          ],
          spacing: { after: 60 }
        })
      );
    });
  }

  // Construct Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docChildren
      }
    ]
  });

  // Generate buffer and trigger browser download
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const fileName = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_studynotes.docx`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
