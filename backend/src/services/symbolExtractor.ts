import { SymbolMatch } from '../types/search';

/**
 * Symbol extractor for different programming languages
 * Uses simplified regex patterns (in production, would use Tree-sitter)
 */
export class SymbolExtractor {
  /**
   * Extract symbols from code content
   */
  extractSymbols(content: string, language: string): SymbolMatch[] {
    switch (language.toLowerCase()) {
      case 'typescript':
      case 'javascript':
        return this.extractTypeScriptSymbols(content);
      case 'python':
        return this.extractPythonSymbols(content);
      case 'java':
        return this.extractJavaSymbols(content);
      case 'go':
        return this.extractGoSymbols(content);
      case 'rust':
        return this.extractRustSymbols(content);
      case 'cpp':
      case 'c':
        return this.extractCppSymbols(content);
      default:
        return [];
    }
  }

  private extractTypeScriptSymbols(content: string): SymbolMatch[] {
    const symbols: SymbolMatch[] = [];
    const lines = content.split('\n');

    // Function declarations: function name() or const name = () =>
    const functionPattern =
      /(^|\s)(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*=|let\s+(\w+)\s*=)\s*(\(|:)/gm;
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].matchAll(functionPattern);
      for (const match of matches) {
        const name = match[2] || match[3] || match[4];
        if (name) {
          symbols.push({
            name,
            type: 'function',
            lineStart: i + 1,
            lineEnd: i + 1,
          });
        }
      }
    }

    // Class declarations: class Name
    const classPattern = /(^|\s)(?:export\s+)?class\s+(\w+)/gm;
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].matchAll(classPattern);
      for (const match of matches) {
        symbols.push({
          name: match[2],
          type: 'class',
          lineStart: i + 1,
          lineEnd: i + 10, // Rough estimate
        });
      }
    }

    return symbols;
  }

  private extractPythonSymbols(content: string): SymbolMatch[] {
    const symbols: SymbolMatch[] = [];
    const lines = content.split('\n');

    // Function definitions: def name():
    const functionPattern = /^\s*(?:async\s+)?def\s+(\w+)\s*\(/gm;
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].matchAll(functionPattern);
      for (const match of matches) {
        symbols.push({
          name: match[1],
          type: 'function',
          lineStart: i + 1,
          lineEnd: i + 1,
        });
      }
    }

    // Class definitions: class Name:
    const classPattern = /^\s*class\s+(\w+)\s*[:(]/gm;
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].matchAll(classPattern);
      for (const match of matches) {
        symbols.push({
          name: match[1],
          type: 'class',
          lineStart: i + 1,
          lineEnd: i + 10,
        });
      }
    }

    return symbols;
  }

  private extractJavaSymbols(content: string): SymbolMatch[] {
    const symbols: SymbolMatch[] = [];
    const lines = content.split('\n');

    // Method and class declarations
    const methodPattern = /(?:public|private|protected)?\s+(?:static\s+)?[\w<>]+\s+(\w+)\s*\(/gm;
    const classPattern = /(public|private)?\s*class\s+(\w+)/gm;

    for (let i = 0; i < lines.length; i++) {
      let matches = lines[i].matchAll(methodPattern);
      for (const match of matches) {
        symbols.push({
          name: match[1],
          type: 'method',
          lineStart: i + 1,
          lineEnd: i + 1,
        });
      }

      matches = lines[i].matchAll(classPattern);
      for (const match of matches) {
        symbols.push({
          name: match[2],
          type: 'class',
          lineStart: i + 1,
          lineEnd: i + 10,
        });
      }
    }

    return symbols;
  }

  private extractGoSymbols(content: string): SymbolMatch[] {
    const symbols: SymbolMatch[] = [];
    const lines = content.split('\n');

    // Function declarations: func Name(
    const functionPattern = /^func\s+(?:\(\s*\w+\s+\*?\w+\)\s+)?(\w+)\s*\(/gm;
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].matchAll(functionPattern);
      for (const match of matches) {
        symbols.push({
          name: match[1],
          type: 'function',
          lineStart: i + 1,
          lineEnd: i + 1,
        });
      }
    }

    // Type declarations: type Name struct
    const typePattern = /^type\s+(\w+)\s+struct/gm;
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].matchAll(typePattern);
      for (const match of matches) {
        symbols.push({
          name: match[1],
          type: 'class',
          lineStart: i + 1,
          lineEnd: i + 10,
        });
      }
    }

    return symbols;
  }

  private extractRustSymbols(content: string): SymbolMatch[] {
    const symbols: SymbolMatch[] = [];
    const lines = content.split('\n');

    // Function declarations: fn name(
    const functionPattern = /^\s*(?:pub\s+)?(?:async\s+)?fn\s+(\w+)\s*</gm;
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].matchAll(functionPattern);
      for (const match of matches) {
        symbols.push({
          name: match[1],
          type: 'function',
          lineStart: i + 1,
          lineEnd: i + 1,
        });
      }
    }

    // Struct declarations: struct Name
    const structPattern = /^\s*(?:pub\s+)?struct\s+(\w+)/gm;
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].matchAll(structPattern);
      for (const match of matches) {
        symbols.push({
          name: match[1],
          type: 'class',
          lineStart: i + 1,
          lineEnd: i + 10,
        });
      }
    }

    return symbols;
  }

  private extractCppSymbols(content: string): SymbolMatch[] {
    const symbols: SymbolMatch[] = [];
    const lines = content.split('\n');

    // Function and method declarations
    const methodPattern = /[\w:]+\s+(\w+)\s*\([^)]*\)\s*[:{]?/gm;
    const classPattern = /(?:class|struct)\s+(\w+)/gm;

    for (let i = 0; i < lines.length; i++) {
      let matches = lines[i].matchAll(methodPattern);
      for (const match of matches) {
        symbols.push({
          name: match[1],
          type: 'method',
          lineStart: i + 1,
          lineEnd: i + 1,
        });
      }

      matches = lines[i].matchAll(classPattern);
      for (const match of matches) {
        symbols.push({
          name: match[1],
          type: 'class',
          lineStart: i + 1,
          lineEnd: i + 10,
        });
      }
    }

    return symbols;
  }
}
