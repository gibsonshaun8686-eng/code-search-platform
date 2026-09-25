# GitHub Code Search Syntax Reference

This platform supports GitHub-style code search syntax and builds on it with semantic and symbol-aware intelligence.

## Query basics

- `repo:owner/repo` — search in a single repository
- `org:my-org` — search across an organization
- `language:typescript` — filter by language
- `path:/src/` — search within a path namespace
- `symbol:MyClass` — match symbol definitions
- `content:TODO` — match content only, not path names
- `"exact phrase"` — exact match including spaces
- `/regex/` — regular expression search

## Boolean logic

```text
repo:myorg/app language:ts "useEffect" AND NOT path:/tests/
(language:python OR language:go) AND symbol:/^Auth/
```

## Useful patterns

```text
repo:github/docs path:/search-github/ "code search"
org:facebook language:javascript symbol:useState
NOT is:generated path:/dist/
```

## Platform extensions

Beyond GitHub syntax, this product adds:

- semantic matching by meaning
- symbol ranking and references
- saved search templates
- workspace-specific filters
- multi-repository correlation

## Query guidance

Use structured searches for better results:
- narrow by repo and path first
- apply language filters
- prefer symbol search for definitions
- use regex only when needed
- exclude generated and vendored directories when possible
