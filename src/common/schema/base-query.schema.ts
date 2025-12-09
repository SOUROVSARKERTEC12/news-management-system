import { z } from 'zod';

export const metaSchema = z.object({
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
});

export const noCodeDescription = z
  .string()
  .min(1, 'Description required')
  .max(2000, 'Too long')
  .refine(
    (s) => {
      const patterns = [
        // ---------- 1. Code block syntax ----------
        /```[\s\S]*?```/, // fenced code block
        /`[^`]*`/, // inline code

        // ---------- 2. HTML / XML / JSX ----------
        /<[^>]+>/, // <tag>anything</tag>
        /<\/?[A-Za-z]+\s*[^>]*>/, // tags with attributes

        // ---------- 3. Comments ----------
        /\/\/.*$/m, // JS, Java, C++ line comment
        /\/\*[\s\S]*?\*\//, // multi-line comment
        /^#.*$/m, // Python, Bash comment
        /-- .*$/m, // SQL comment

        // ---------- 4. Code-like symbols ----------
        /[{}();=<>]/, // typical code syntax

        // ---------- 5. Language keywords ----------
        /\b(function|return|var|let|const|class|import|export|console|await|async)\b/i, // JS
        /\b(def|print|self|None|True|False|import|global)\b/i, // Python
        /\b(public|private|protected|static|void|int|new|class|extends|implements)\b/i, // Java / C#
        /\b#include\b|\bprintf\b|\bscanf\b|\bmain\s*\(/i, // C / C++
        /\bpackage\b|\bfunc\b|\bgo\b|\bdefer\b|\binterface\b/i, // Go
        /\bfn\b|\blet\b|\bmut\b|\bimpl\b|\btrait\b/i, // Rust
        /\becho\b|\b<?php\b|\bendif\b|\bforeach\b|\bstrlen\b/i, // PHP
        /\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bWHERE\b|\bJOIN\b/i, // SQL
        /\b#!/, // bash shebang
      ];

      return !patterns.some((rx) => rx.test(s));
    },
    {
      message:
        'Description must not contain any programming code or code-like syntax.',
    },
  );
