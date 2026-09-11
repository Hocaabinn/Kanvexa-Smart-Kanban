"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function MarkdownRenderer({ content, style }: MarkdownRendererProps) {
  if (!content) return null;

  // Simple, robust Markdown to React elements parser
  const renderFormattedLine = (lineText: string, keyPrefix: string) => {
    // Helper to parse inline styles (bold, italic, underline, strikethrough, code, links)
    const elements: React.ReactNode[] = [];
    let remaining = lineText;
    let index = 0;

    // Pattern matching loop for inline tags
    while (remaining.length > 0) {
      // Bold: **text**
      const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
      if (boldMatch) {
        elements.push(
          <strong key={`${keyPrefix}-bold-${index}`} style={{ fontWeight: 800, color: "#0f172a" }}>
            {boldMatch[2]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        index++;
        continue;
      }

      // Underline: <u>text</u>
      const underlineMatch = remaining.match(/^<u>(.*?)<\/u>/i);
      if (underlineMatch) {
        elements.push(
          <u key={`${keyPrefix}-u-${index}`} style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
            {underlineMatch[1]}
          </u>
        );
        remaining = remaining.slice(underlineMatch[0].length);
        index++;
        continue;
      }

      // Strikethrough: ~~text~~
      const strikeMatch = remaining.match(/^~~(.*?)~~/);
      if (strikeMatch) {
        elements.push(
          <del key={`${keyPrefix}-strike-${index}`} style={{ color: "#94a3b8" }}>
            {strikeMatch[1]}
          </del>
        );
        remaining = remaining.slice(strikeMatch[0].length);
        index++;
        continue;
      }

      // Italic: *text* or _text_
      const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
      if (italicMatch) {
        elements.push(
          <em key={`${keyPrefix}-italic-${index}`} style={{ fontStyle: "italic", color: "#334155" }}>
            {italicMatch[2]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        index++;
        continue;
      }

      // Inline Code: `code`
      const codeMatch = remaining.match(/^`(.*?)`/);
      if (codeMatch) {
        elements.push(
          <code
            key={`${keyPrefix}-code-${index}`}
            style={{
              background: "#f1f5f9",
              color: "#6d28d9",
              padding: "2px 6px",
              borderRadius: 5,
              fontSize: "0.88em",
              fontFamily: "monospace",
              border: "1px solid #e2e8f0"
            }}
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        index++;
        continue;
      }

      // Link: [text](url)
      const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        elements.push(
          <a
            key={`${keyPrefix}-link-${index}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#6d28d9", fontWeight: 600, textDecoration: "underline" }}
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        index++;
        continue;
      }

      // Plain character
      elements.push(remaining[0]);
      remaining = remaining.slice(1);
    }

    return elements;
  };

  const lines = content.split("\n");
  const renderedBlocks: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Code Block Toggle (```)
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        renderedBlocks.push(
          <pre
            key={`code-block-${idx}`}
            style={{
              background: "#0f172a",
              color: "#f8fafc",
              padding: 16,
              borderRadius: 12,
              overflowX: "auto",
              fontSize: 13,
              fontFamily: "monospace",
              lineHeight: 1.6,
              margin: "12px 0"
            }}
          >
            <code>{codeBlockContent.join("\n")}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Table Row (| col1 | col2 |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed.split("|").slice(1, -1).map(c => c.trim());
      // Skip delimiter row (| --- | --- |)
      if (cells.every(c => /^:?-+:?$/.test(c))) {
        return;
      }
      if (!inTable) {
        inTable = true;
        tableRows = [cells];
      } else {
        tableRows.push(cells);
      }
      return;
    } else if (inTable) {
      // End table block
      renderedBlocks.push(
        <div key={`table-wrapper-${idx}`} style={{ overflowX: "auto", margin: "14px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, border: "1px solid #cbd5e1" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #cbd5e1" }}>
                {tableRows[0]?.map((headerCell, hIdx) => (
                  <th key={`th-${hIdx}`} style={{ padding: "10px 14px", fontWeight: 700, color: "#0f172a", textAlign: "left" }}>
                    {renderFormattedLine(headerCell, `th-${idx}-${hIdx}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((rowCells, rIdx) => (
                <tr key={`tr-${rIdx}`} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  {rowCells.map((cell, cIdx) => (
                    <td key={`td-${rIdx}-${cIdx}`} style={{ padding: "8px 14px", color: "#334155" }}>
                      {renderFormattedLine(cell, `td-${idx}-${rIdx}-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableRows = [];
    }

    // Empty line
    if (trimmed === "") {
      renderedBlocks.push(<div key={`empty-${idx}`} style={{ height: 10 }} />);
      return;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      renderedBlocks.push(
        <h1 key={`h1-${idx}`} style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "16px 0 8px 0", borderBottom: "1px solid #e2e8f0", paddingBottom: 6 }}>
          {renderFormattedLine(trimmed.slice(2), `h1-${idx}`)}
        </h1>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      renderedBlocks.push(
        <h2 key={`h2-${idx}`} style={{ fontSize: 19, fontWeight: 800, color: "#1e293b", margin: "14px 0 6px 0" }}>
          {renderFormattedLine(trimmed.slice(3), `h2-${idx}`)}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith("### ")) {
      renderedBlocks.push(
        <h3 key={`h3-${idx}`} style={{ fontSize: 16, fontWeight: 700, color: "#334155", margin: "12px 0 4px 0" }}>
          {renderFormattedLine(trimmed.slice(4), `h3-${idx}`)}
        </h3>
      );
      return;
    }

    // Blockquote (> text)
    if (trimmed.startsWith("> ")) {
      renderedBlocks.push(
        <blockquote
          key={`quote-${idx}`}
          style={{
            margin: "10px 0",
            padding: "10px 16px",
            background: "#f5f3ff",
            borderLeft: "4px solid #6d28d9",
            borderRadius: "0 8px 8px 0",
            color: "#5b21b6",
            fontSize: 14,
            fontWeight: 500,
            fontStyle: "italic"
          }}
        >
          {renderFormattedLine(trimmed.slice(2), `quote-${idx}`)}
        </blockquote>
      );
      return;
    }

    // Checklist (- [ ] or - [x])
    if (trimmed.startsWith("- [ ] ") || trimmed.startsWith("- [x] ")) {
      const isChecked = trimmed.startsWith("- [x] ");
      const itemText = trimmed.slice(6);
      renderedBlocks.push(
        <div key={`check-${idx}`} style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0", fontSize: 14, color: isChecked ? "#94a3b8" : "#334155" }}>
          <input type="checkbox" checked={isChecked} readOnly style={{ width: 16, height: 16, accentColor: "#6d28d9" }} />
          <span style={{ textDecoration: isChecked ? "line-through" : "none" }}>
            {renderFormattedLine(itemText, `check-${idx}`)}
          </span>
        </div>
      );
      return;
    }

    // Bullet List (- or *)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      renderedBlocks.push(
        <div key={`bullet-${idx}`} style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: "4px 0 4px 12px", fontSize: 14, color: "#334155" }}>
          <span style={{ color: "#6d28d9", fontWeight: 800 }}>•</span>
          <div>{renderFormattedLine(trimmed.slice(2), `bullet-${idx}`)}</div>
        </div>
      );
      return;
    }

    // Numbered List (1. , 2. )
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      renderedBlocks.push(
        <div key={`num-${idx}`} style={{ display: "flex", alignItems: "flex-start", gap: 8, margin: "4px 0 4px 12px", fontSize: 14, color: "#334155" }}>
          <span style={{ color: "#6d28d9", fontWeight: 700, minWidth: 16 }}>{numMatch[1]}.</span>
          <div>{renderFormattedLine(numMatch[2], `num-${idx}`)}</div>
        </div>
      );
      return;
    }

    // Regular paragraph
    renderedBlocks.push(
      <p key={`p-${idx}`} style={{ margin: "4px 0", fontSize: 14, lineHeight: 1.7, color: "#334155" }}>
        {renderFormattedLine(line, `p-${idx}`)}
      </p>
    );
  });

  return (
    <div style={{ ...style }} className="markdown-rendered-content">
      {renderedBlocks}
    </div>
  );
}
