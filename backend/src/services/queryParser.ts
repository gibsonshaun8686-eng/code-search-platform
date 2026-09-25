import { ParsedQuery, SearchQualifier } from '../types/search';

const QUALIFIER_REGEX = /(repo|org|user|language|path|symbol|content|is):("[^"]*"|[^\s]+)/g;
const NOT_OPERATOR = /\bNOT\b/g;
const AND_OPERATOR = /\bAND\b/g;
const OR_OPERATOR = /\bOR\b/g;
const REGEX_PATTERN = /\/(.+?)\/(?![\s\w])/g;
const QUOTED_STRING = /"([^"]*)"/g;

export class QueryParser {
  static parse(rawQuery: string): ParsedQuery {
    const query = rawQuery.trim();
    const qualifiers: SearchQualifier[] = [];
    const operators: ('AND' | 'OR' | 'NOT')[] = [];
    let workingQuery = query;

    // Extract qualifiers
    const qualifierMatches = query.matchAll(QUALIFIER_REGEX);
    for (const match of qualifierMatches) {
      const [fullMatch, type, value] = match;
      const cleanValue = value.replace(/^"|"$/g, '');
      qualifiers.push({
        type: type as SearchQualifier['type'],
        value: cleanValue,
      });
      workingQuery = workingQuery.replace(fullMatch, '');
    }

    // Extract operators and normalize them
    const hasNot = NOT_OPERATOR.test(query);
    const hasAnd = AND_OPERATOR.test(query);
    const hasOr = OR_OPERATOR.test(query);

    if (hasNot) operators.push('NOT');
    if (hasAnd) operators.push('AND');
    if (hasOr) operators.push('OR');

    // Remove operators from working query
    workingQuery = workingQuery
      .replace(NOT_OPERATOR, '')
      .replace(AND_OPERATOR, '')
      .replace(OR_OPERATOR, '')
      .trim();

    // Extract remaining terms (quoted strings, regex, or plain text)
    const terms: string[] = [];
    let termQuery = workingQuery;

    // Extract quoted strings
    for (const match of termQuery.matchAll(QUOTED_STRING)) {
      terms.push(match[0]);
      termQuery = termQuery.replace(match[0], '');
    }

    // Extract regex patterns
    for (const match of termQuery.matchAll(REGEX_PATTERN)) {
      terms.push(match[0]);
      termQuery = termQuery.replace(match[0], '');
    }

    // Extract remaining plain terms
    const plainTerms = termQuery.split(/\s+/).filter(t => t.length > 0);
    terms.push(...plainTerms);

    return {
      terms: terms.filter(t => t.length > 0),
      qualifiers,
      operators,
      rawQuery: query,
    };
  }

  static isRegexPattern(term: string): boolean {
    return /^\/.*\/$/g.test(term);
  }

  static isQuotedString(term: string): boolean {
    return /^".*"$/.test(term);
  }

  static extractRegexPattern(term: string): RegExp | null {
    const match = term.match(/^\/(.+)\/[gimuy]*$/);
    if (!match) return null;
    try {
      return new RegExp(match[1], 'gi');
    } catch {
      return null;
    }
  }
}
