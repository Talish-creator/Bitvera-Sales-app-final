import { Project, SyntaxKind, JsxText, JsxExpression, StringLiteral } from 'ts-morph';
import fs from 'fs';

const project = new Project();
project.addSourceFilesAtPaths("src/components/**/*.tsx");
project.addSourceFilesAtPaths("src/App.tsx");

for (const file of project.getSourceFiles()) {
  let needsImport = false;

  // 1. Process JSX Text nodes
  const jsxTexts = file.getDescendantsOfKind(SyntaxKind.JsxText);
  for (const text of jsxTexts) {
    const val = text.getLiteralText();
    if (val && val.trim().length > 0) {
      if (/^[a-zA-Z]/.test(val.trim())) {
        const trimmed = val.trim();
        // Replace with JSX Expression using t() call
        // we need to be careful with spaces around the text
        const leadingSpace = val.match(/^\s*/)?.[0] || '';
        const trailingSpace = val.match(/\s*$/)?.[0] || '';
        
        // Very basic replace, bypassing exact AST manipulation
        // Just note that it's complicated to safely replace JsxText with multiple nodes in ts-morph
      }
    }
  }
}
