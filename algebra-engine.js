/* =========================================================================
   SkoolToolz — Algebra Engine  (Phase 4.1: Algebra / Equation Solver)
   -------------------------------------------------------------------------
   A small, deterministic, dependency-free equation-solving engine. No AI,
   no network. Exact rational arithmetic throughout (BigInt fractions, no
   floating-point drift), a hand-written tokenizer/recursive-descent parser
   (no eval), and step objects ({rule, latex, note}) that render through the
   app's shared KaTeX path — the same shape the Calculus Solver uses.

   Covers:
     - Linear equations (any degree that simplifies to 1): distribute,
       combine like terms, isolate the variable. Detects identities and
       contradictions.
     - Quadratics: the quadratic formula (real, irrational-radical, and
       complex roots), completing the square, and verified AC-method
       factoring (only shown when it re-expands to the original equation).
     - Polynomials up to degree 4: Rational Root Theorem + synthetic
       division, cascading down to the quadratic/linear solvers for the
       final factor, with a numeric bisection fallback for an irreducible
       remaining factor.
     - Systems of 2 or 3 linear equations: substitution and elimination,
       both fully worked, with dependent/inconsistent detection.
   ========================================================================= */
(function (root) {
  'use strict';

// ---------- BigInt exact fractions ----------
function gcdB(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; }
function F(n, d = 1n) {
  n = BigInt(n); d = BigInt(d);
  if (d === 0n) throw new Error('Division by zero.');
  if (d < 0n) { n = -n; d = -d; }
  const g = gcdB(n, d) || 1n;
  return { n: n / g, d: d / g };
}
const fZero = F(0n), fOne = F(1n);
const fIsZero = a => a.n === 0n;
const fEq = (a, b) => a.n === b.n && a.d === b.d;
const fAdd = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
const fSub = (a, b) => F(a.n * b.d - b.n * a.d, a.d * b.d);
const fMul = (a, b) => F(a.n * b.n, a.d * b.d);
const fDiv = (a, b) => { if (b.n === 0n) throw new Error('Division by zero.'); return F(a.n * b.d, a.d * b.n); };
const fNeg = a => ({ n: -a.n, d: a.d });
const fSign = a => a.n > 0n ? 1 : (a.n < 0n ? -1 : 0);
const fAbs = a => a.n < 0n ? fNeg(a) : a;
const fCmp = (a, b) => { const l = a.n * b.d, r = b.n * a.d; return l < r ? -1 : (l > r ? 1 : 0); };
function fFromInt(i) { return F(BigInt(i), 1n); }
function fFromStr(s) {
  s = String(s).trim();
  if (/^-?\d+$/.test(s)) return F(BigInt(s), 1n);
  if (/^-?\d+\/\d+$/.test(s)) { const [n, d] = s.split('/'); return F(BigInt(n), BigInt(d)); }
  if (/^-?\d*\.\d+$/.test(s)) {
    const neg = s.startsWith('-'); if (neg) s = s.slice(1);
    const [ip, fp] = s.split('.');
    const d = 10n ** BigInt(fp.length);
    const n = BigInt((ip || '0') + fp);
    return F(neg ? -n : n, d);
  }
  throw new Error(`Not a number: "${s}"`);
}
function fToNumber(a) { return Number(a.n) / Number(a.d); }
function fToDecimalStr(a, maxDigits = 8) {
  if (a.d === 1n) return a.n.toString();
  const num = fToNumber(a);
  if (!Number.isFinite(num)) return a.n.toString() + '/' + a.d.toString();
  let s = num.toFixed(maxDigits).replace(/0+$/, '').replace(/\.$/, '');
  return s;
}
function fToFracStr(a) { return a.d === 1n ? a.n.toString() : `${a.n}/${a.d}`; }
function fToLatex(a) {
  if (a.d === 1n) return a.n.toString();
  const neg = a.n < 0n;
  const n = neg ? -a.n : a.n;
  return (neg ? '-' : '') + `\\frac{${n}}{${a.d}}`;
}

// ---------- Polynomial (array of Fraction, index = power, low→high) ----------
function polyTrim(p) { p = p.slice(); while (p.length > 1 && fIsZero(p[p.length - 1])) p.pop(); return p; }
function polyIsZero(p) { return p.every(fIsZero); }
function polyDeg(p) { p = polyTrim(p); return polyIsZero(p) ? -Infinity : p.length - 1; }
function polyAdd(a, b) {
  const n = Math.max(a.length, b.length), r = [];
  for (let i = 0; i < n; i++) r.push(fAdd(a[i] || fZero, b[i] || fZero));
  return polyTrim(r);
}
function polySub(a, b) {
  const n = Math.max(a.length, b.length), r = [];
  for (let i = 0; i < n; i++) r.push(fSub(a[i] || fZero, b[i] || fZero));
  return polyTrim(r);
}
function polyNeg(a) { return a.map(fNeg); }
function polyScale(a, k) { return polyTrim(a.map(c => fMul(c, k))); }
function polyMul(a, b) {
  if (polyIsZero(a) || polyIsZero(b)) return [fZero];
  const r = new Array(a.length + b.length - 1).fill(null).map(() => fZero);
  for (let i = 0; i < a.length; i++) {
    if (fIsZero(a[i])) continue;
    for (let j = 0; j < b.length; j++) {
      if (fIsZero(b[j])) continue;
      r[i + j] = fAdd(r[i + j], fMul(a[i], b[j]));
    }
  }
  return polyTrim(r);
}
function polyEvalFr(p, x) {
  let acc = fZero;
  for (let i = p.length - 1; i >= 0; i--) acc = fAdd(fMul(acc, x), p[i]);
  return acc;
}
// render polynomial (low->high coeff array) as LaTeX in given var name, descending powers
function polyToLatex(p, varName = 'x') {
  p = polyTrim(p);
  if (polyIsZero(p)) return '0';
  const parts = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i];
    if (fIsZero(c)) continue;
    const neg = fSign(c) < 0;
    const mag = fAbs(c);
    let coefStr = '';
    if (i === 0) coefStr = fToLatex(mag);
    else if (!fEq(mag, fOne)) coefStr = fToLatex(mag);
    const varPart = i === 0 ? '' : (i === 1 ? varName : `${varName}^{${i}}`);
    parts.push({ neg, term: `${coefStr}${varPart}` });
  }
  let out = (parts[0].neg ? '-' : '') + parts[0].term;
  for (let k = 1; k < parts.length; k++) out += (parts[k].neg ? ' - ' : ' + ') + parts[k].term;
  return out;
}

// ---------- Tokenizer (shared by all tabs) ----------
function tokenize(src) {
  const toks = []; let i = 0; const s = String(src);
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '=') { toks.push({ t: 'eq' }); i++; continue; }
    if ('+-*/^()'.includes(c)) { toks.push({ t: c }); i++; continue; }
    if (c === '·' || c === '×' || c === '⋅') { toks.push({ t: '*' }); i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i, seenDot = false;
      while (j < s.length && (/[0-9]/.test(s[j]) || (s[j] === '.' && !seenDot))) { if (s[j] === '.') seenDot = true; j++; }
      toks.push({ t: 'num', v: s.slice(i, j) }); i = j; continue;
    }
    if (/[A-Za-z]/.test(c)) {
      let j = i; while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
      toks.push({ t: 'ident', v: s.slice(i, j) }); i = j; continue;
    }
    throw new Error(`Unexpected character "${c}" in the equation.`);
  }
  return toks;
}

// ---------- Parser: builds AST. Grammar: addsub -> term -> unary -> power -> atom ----------
// AST node shapes: {t:'num',v:Fraction} {t:'var',name} {t:'neg',a} {t:'add'|'sub'|'mul'|'div',a,b} {t:'pow',a,b}
function parseExpr(toks) {
  let pos = 0;
  const peek = () => toks[pos];
  const next = () => toks[pos++];
  function atom() {
    const tk = peek();
    if (!tk) throw new Error('Unexpected end of expression.');
    if (tk.t === 'num') { next(); return { t: 'num', v: fFromStr(tk.v) }; }
    if (tk.t === '(') {
      next();
      const e = addsub();
      if (!peek() || peek().t !== ')') throw new Error('Missing a closing ")".');
      next();
      return e;
    }
    if (tk.t === 'ident') {
      next();
      const name = tk.v.toLowerCase();
      if (['sin', 'cos', 'tan', 'sqrt', 'log', 'ln', 'abs', 'pi', 'e'].includes(name)) {
        throw new Error(`This solver handles polynomial equations only — "${tk.v}" isn't supported.`);
      }
      if (name.length !== 1) throw new Error(`Use single-letter variables (found "${tk.v}").`);
      return { t: 'var', name };
    }
    throw new Error('Unexpected token in expression.');
  }
  function isPrimaryStart(tk) { return tk && (tk.t === 'num' || tk.t === 'ident' || tk.t === '('); }
  function power() {
    const base = atom();
    if (peek() && peek().t === '^') { next(); const exp = unary(); return { t: 'pow', a: base, b: exp }; }
    return base;
  }
  function unary() {
    if (peek() && peek().t === '-') { next(); return { t: 'neg', a: unary() }; }
    if (peek() && peek().t === '+') { next(); return unary(); }
    return power();
  }
  function term() {
    let node = unary();
    for (;;) {
      const tk = peek();
      if (tk && tk.t === '*') { next(); node = { t: 'mul', a: node, b: unary() }; }
      else if (tk && tk.t === '/') { next(); node = { t: 'div', a: node, b: unary() }; }
      else if (isPrimaryStart(tk)) { node = { t: 'mul', a: node, b: unary() }; }
      else break;
    }
    return node;
  }
  function addsub() {
    let node = term();
    for (;;) {
      const tk = peek();
      if (tk && tk.t === '+') { next(); node = { t: 'add', a: node, b: term() }; }
      else if (tk && tk.t === '-') { next(); node = { t: 'sub', a: node, b: term() }; }
      else break;
    }
    return node;
  }
  const result = addsub();
  if (pos < toks.length) throw new Error('Unexpected extra input — check operators and parentheses.');
  return result;
}

// ---------- Split an equation string on the top-level "=" ----------
function splitEquation(str) {
  const toks = tokenize(str);
  const eqIdx = [];
  let depth = 0;
  for (let i = 0; i < toks.length; i++) {
    if (toks[i].t === '(') depth++;
    else if (toks[i].t === ')') depth--;
    else if (toks[i].t === 'eq' && depth === 0) eqIdx.push(i);
  }
  if (eqIdx.length === 0) throw new Error('This tool solves equations — include an "=" sign.');
  if (eqIdx.length > 1) throw new Error('Only one "=" sign is supported per equation.');
  const i = eqIdx[0];
  return { left: toks.slice(0, i), right: toks.slice(i + 1) };
}

// ---------- Lower AST to single-variable polynomial (array of Fraction) ----------
// Returns {poly, varName|null}. Throws on nonlinear-in-exponent / abs / multi-variable use.
function astConstPoly(node, expectedVar) {
  // used to evaluate an exponent (must be constant nonneg integer)
  const p = lowerToPoly(node, { name: expectedVar }).poly;
  if (polyDeg(p) > 0) throw new Error('Exponents must be constant numbers.');
  const c = p[0] || fZero;
  if (c.d !== 1n || c.n < 0n) throw new Error('Exponents must be non-negative whole numbers.');
  return Number(c.n);
}
function lowerToPoly(node, varBox) {
  switch (node.t) {
    case 'num': return { poly: [node.v] };
    case 'var': {
      if (varBox.name && varBox.name !== node.name) throw new Error(`This tool solves single-variable equations — found both "${varBox.name}" and "${node.name}".`);
      varBox.name = node.name;
      return { poly: [fZero, fOne] };
    }
    case 'neg': return { poly: polyNeg(lowerToPoly(node.a, varBox).poly) };
    case 'add': return { poly: polyAdd(lowerToPoly(node.a, varBox).poly, lowerToPoly(node.b, varBox).poly) };
    case 'sub': return { poly: polySub(lowerToPoly(node.a, varBox).poly, lowerToPoly(node.b, varBox).poly) };
    case 'mul': return { poly: polyMul(lowerToPoly(node.a, varBox).poly, lowerToPoly(node.b, varBox).poly) };
    case 'div': {
      const num = lowerToPoly(node.a, varBox).poly;
      const den = lowerToPoly(node.b, varBox).poly;
      if (polyDeg(den) > 0) throw new Error('This tool doesn\'t support a variable in a denominator (rational equations) yet.');
      const dc = den[0];
      if (fIsZero(dc)) throw new Error('Division by zero.');
      return { poly: polyScale(num, fDiv(fOne, dc)) };
    }
    case 'pow': {
      const exp = astConstPoly(node.b, varBox.name);
      let base = lowerToPoly(node.a, varBox).poly;
      if (exp === 0) return { poly: [fOne] };
      let result = [fOne];
      for (let k = 0; k < exp; k++) result = polyMul(result, base);
      return { poly: result };
    }
    default: throw new Error('Unsupported expression.');
  }
}
// Parses a single-variable equation string "LHS = RHS" -> {poly, varName}
// poly represents (LHS - RHS), i.e. solve poly(x) = 0
function parseSingleVarEquation(str) {
  const { left, right } = splitEquation(str);
  const varBox = { name: null };
  const lp = lowerToPoly(parseExpr(left), varBox).poly;
  const rp = lowerToPoly(parseExpr(right), varBox).poly;
  const combined = polySub(lp, rp);
  return { poly: polyTrim(combined), varName: varBox.name || 'x' };
}

// ---------- Render an AST back to LaTeX (for showing "your equation" as typed) ----------
// Each renderer returns {str, prec}. prec: atom(num/var/div/pow/paren-group)=4, neg=3, mul=2, add/sub=1.
function exprToLatex(node) {
  function wrap(child, minPrec) { return child.prec < minPrec ? `\\left(${child.str}\\right)` : child.str; }
  function go(n) {
    switch (n.t) {
      case 'num': return { str: fToLatex(n.v), prec: 4 };
      case 'var': return { str: n.name, prec: 4 };
      case 'neg': {
        const a = go(n.a);
        return { str: '-' + wrap(a, 2), prec: 3 };
      }
      case 'div': {
        const a = go(n.a), b = go(n.b);
        return { str: `\\frac{${a.str}}{${b.str}}`, prec: 4 };
      }
      case 'pow': {
        const a = go(n.a), b = go(n.b);
        return { str: `${wrap(a, 4)}^{${b.str}}`, prec: 4 };
      }
      case 'mul': {
        const a = go(n.a), b = go(n.b);
        const ls = wrap(a, 3), rs = wrap(b, 3);
        const bothNum = (n.a.t === 'num' || (n.a.t === 'neg' && n.a.a.t === 'num')) && n.b.t === 'num';
        return { str: bothNum ? `${ls} \\cdot ${rs}` : `${ls}${rs}`, prec: 2 };
      }
      case 'add': {
        const a = go(n.a);
        if (n.b.t === 'neg') { const inner = go(n.b.a); return { str: `${wrap(a, 1)} - ${wrap(inner, 2)}`, prec: 1 }; }
        const b = go(n.b);
        return { str: `${wrap(a, 1)} + ${wrap(b, 2)}`, prec: 1 };
      }
      case 'sub': {
        const a = go(n.a);
        if (n.b.t === 'neg') { const inner = go(n.b.a); return { str: `${wrap(a, 1)} + ${wrap(inner, 2)}`, prec: 1 }; }
        const b = go(n.b);
        return { str: `${wrap(a, 1)} - ${wrap(b, 2)}`, prec: 1 };
      }
      default: throw new Error('Cannot render this expression.');
    }
  }
  return go(node).str;
}
function equationToLatex(leftToks, rightToks) {
  return `${exprToLatex(parseExpr(leftToks))} = ${exprToLatex(parseExpr(rightToks))}`;
}

// ---------- Integer-clearing: scale a Fraction polynomial to integer coefficients (BigInt), primitive ----------
function lcmB(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; if (a === 0n || b === 0n) return 0n; return (a / gcdB(a, b)) * b; }
function polyToIntCoeffs(poly) {
  poly = polyTrim(poly);
  let lcd = 1n;
  for (const c of poly) lcd = lcmB(lcd, c.d);
  let ints = poly.map(c => (c.n * (lcd / c.d)));
  let g = 0n;
  for (const v of ints) g = gcdB(g, v);
  if (g === 0n) g = 1n;
  // keep leading (highest-degree) coefficient positive for nicer standard form
  const lead = ints[ints.length - 1];
  if (lead < 0n) g = -g;
  ints = ints.map(v => v / g);
  return ints; // BigInt[], low->high
}

// ---------- Linear solver (degree <= 1) ----------
// poly: [b0, b1] (b1 may be absent/zero => degree <=0)
function linearSolve(poly) {
  poly = polyTrim(poly);
  const b0 = poly[0] || fZero;
  const b1 = poly[1] || fZero;
  if (fIsZero(b1)) {
    return fIsZero(b0) ? { kind: 'all' } : { kind: 'none' };
  }
  return { kind: 'unique', x: fDiv(fNeg(b0), b1) };
}
function coefTermLatex(coef, varName, power) {
  // power: 0 => constant only; 1 => "coef*varName" with 1/-1 elided
  if (power === 0) return fToLatex(coef);
  if (fEq(coef, fOne)) return varName;
  if (fEq(coef, fNeg(fOne))) return `-${varName}`;
  return `${fToLatex(coef)}${varName}`;
}
function linearSteps(eqStr) {
  const { left, right } = splitEquation(eqStr);
  const lAst = parseExpr(left), rAst = parseExpr(right);
  const varBox = { name: null };
  const lp = lowerToPoly(lAst, varBox).poly;
  const rp = lowerToPoly(rAst, varBox).poly;
  const varName = varBox.name || 'x';
  const combined = polyTrim(polySub(lp, rp));
  const deg = polyDeg(combined);
  const steps = [];
  steps.push({ rule: 'Original equation', latex: `${exprToLatex(lAst)} = ${exprToLatex(rAst)}` });
  if (deg > 1) {
    return {
      steps, deg, varName, unsupported: true,
      message: `This simplifies to degree ${deg} (highest power is ${varName}^{${deg}}) — that's not linear. Try the Quadratic tab for degree 2, or the Polynomial tab for degree 3–4.`,
    };
  }
  steps.push({ rule: 'Simplify each side', latex: `${polyToLatex(lp, varName)} = ${polyToLatex(rp, varName)}`, note: 'Distribute and combine like terms on each side.' });
  const b1 = combined[1] || fZero, b0 = combined[0] || fZero;
  steps.push({ rule: 'Move variable terms to one side', latex: `${coefTermLatex(b1, varName, 1)} ${fSign(b0) < 0 ? '-' : '+'} ${fToLatex(fAbs(b0))} = 0`, note: `Subtract so every ${varName}-term is on the left and every constant is on the right.` });
  const sol = linearSolve(combined);
  if (sol.kind === 'all') {
    steps.push({ rule: 'Both sides match', latex: '0 = 0', note: 'This is an identity — true for every value.' });
    return { steps, deg, varName, kind: 'all', resultLatex: `\\text{All real numbers}`, message: `Every real number is a solution — this equation is an identity.` };
  }
  if (sol.kind === 'none') {
    steps.push({ rule: 'Contradiction', latex: `${fToLatex(b0)} = 0`, note: `${fToLatex(b0)} is never zero.` });
    return { steps, deg, varName, kind: 'none', resultLatex: `\\text{No solution}`, message: `No solution — the variable cancels out and the remaining statement is false.` };
  }
  const xVal = sol.x;
  const ruleWord = b1.d === 1n ? `Divide both sides by ${fToLatex(b1)}` : `Multiply both sides by ${fToLatex(F(b1.d, b1.n))}`;
  steps.push({ rule: ruleWord, latex: `${varName} = ${fToLatex(xVal)}` });
  const resultLatex = `${varName} = ${fToLatex(xVal)}${xVal.d !== 1n ? '\\approx ' + fToDecimalStr(xVal) : ''}`;
  return { steps, deg, varName, kind: 'unique', x: xVal, resultLatex };
}

// ---------- Integer square-root simplification: n = outside^2 * inside, inside squarefree ----------
function bigIntSqrtFloor(n) {
  if (n < 0n) throw new Error('negative');
  if (n < 2n) return n;
  let x = n, y = (x + 1n) / 2n;
  while (y < x) { x = y; y = (x + n / x) / 2n; }
  return x;
}
// coef * sqrt(inside), formatted with coef==1 / denominator==1 elided (coef a Fraction, inside squarefree >= 1)
function radicalLatex(coef, inside) {
  if (fIsZero(coef) || inside === 0n) return '0';
  if (inside === 1n) return fToLatex(coef);
  const negCoef = coef.n < 0n;
  const coefAbs = negCoef ? { n: -coef.n, d: coef.d } : coef;
  const sign = negCoef ? '-' : '';
  const radical = coefAbs.n === 1n ? `\\sqrt{${inside}}` : `${coefAbs.n}\\sqrt{${inside}}`;
  return sign + (coefAbs.d === 1n ? radical : `\\frac{${radical}}{${coefAbs.d}}`);
}
// sqrt of a non-negative Fraction, simplified as coef*sqrt(inside) (inside squarefree, coef a Fraction)
function sqrtFractionLatex(fr) {
  if (fIsZero(fr)) return '0';
  const pq = fr.n * fr.d; // fr.d > 0 always; sqrt(n/d) = sqrt(n*d)/d
  const { outside, inside } = simplifySqrtBigInt(pq);
  return radicalLatex(F(outside, fr.d), inside);
}
function simplifySqrtBigInt(n) {
  if (n === 0n) return { outside: 0n, inside: 1n };
  let outside = 1n, inside = n;
  let p = 2n;
  const lim = bigIntSqrtFloor(n);
  while (p <= lim && p * p <= inside) {
    while (inside % (p * p) === 0n) { inside /= (p * p); outside *= p; }
    p += (p === 2n) ? 1n : 2n; // 2,3,5,7,...
  }
  return { outside, inside };
}

// ---------- Quadratic solver (degree exactly 2) ----------
// poly: [c, b, a] (a = poly[2] != 0)
function babs(x) { return x < 0n ? -x : x; }
function bsign(x) { return x < 0n ? -1 : (x > 0n ? 1 : 0); }
// "±N" / "±Nvar" term, e.g. signedTerm(-3n) -> "- 3", signedTerm(1n,'x') -> "+ x", signedTerm(-1n,'x') -> "- x"
function signedTerm(coef, varSuffix = '') {
  const s = coef < 0n ? '-' : '+';
  const mag = babs(coef);
  const magStr = (varSuffix && mag === 1n) ? '' : mag.toString();
  return `${s} ${magStr}${varSuffix}`;
}
// Solve a*x^2+b*x+c=0 for integer BigInt a,b,c (a != 0). Returns {steps, resultLatex, roots, discriminant}.
function quadraticFormulaSolve(a, b, c, varName = 'x') {
  const D = b * b - 4n * a * c;
  const twoA = 2n * a;
  const fsteps = [];
  fsteps.push({ rule: 'Quadratic formula', latex: `${varName} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}` });
  fsteps.push({ rule: 'Substitute', latex: `${varName} = \\frac{-(${b}) \\pm \\sqrt{${D}}}{2(${a})}`, note: `\\Delta = b^2-4ac = ${D}` });
  let resultLatex, roots;
  const absD = babs(D);
  const { outside, inside } = simplifySqrtBigInt(absD);
  const g = gcdB(gcdB(babs(b), outside), babs(twoA)) || 1n;
  const nb = -b / g, out2 = outside / g, den2raw = twoA / g;
  const denAbs = babs(den2raw), denSign = BigInt(bsign(den2raw) || 1);
  const nbS = nb * denSign, out2S = out2 * denSign;

  if (D >= 0n) {
    if (inside !== 1n) fsteps.push({ rule: 'Simplify the radical', latex: `\\sqrt{${D}} = ${outside === 1n ? '' : outside}\\sqrt{${inside}}` });
    if (D === 0n) {
      const root = F(nbS, denAbs);
      fsteps.push({ rule: 'Solve', latex: `${varName} = \\frac{${nbS}}{${denAbs}} = ${fToLatex(root)}` });
      resultLatex = `${varName} = ${fToLatex(root)}`;
      roots = [{ latex: fToLatex(root), value: root }];
    } else if (inside === 1n) {
      const v1 = F(nbS + out2S, denAbs), v2 = F(nbS - out2S, denAbs);
      fsteps.push({ rule: 'Solve', latex: `${varName} = \\frac{${nbS} \\pm ${out2S}}{${denAbs}}` });
      resultLatex = `${varName} = ${fToLatex(v1)} \\quad\\text{or}\\quad ${varName} = ${fToLatex(v2)}`;
      roots = [{ latex: fToLatex(v1), value: v1 }, { latex: fToLatex(v2), value: v2 }];
    } else {
      const irrTerm = (out2S === 1n ? '' : out2S) + `\\sqrt{${inside}}`;
      const numer = (sign) => nbS === 0n ? (sign > 0 ? irrTerm : `-${irrTerm}`) : `${nbS} ${sign > 0 ? '+' : '-'} ${irrTerm}`;
      const wrapFrac = (numer) => denAbs === 1n ? numer : `\\frac{${numer}}{${denAbs}}`;
      const r1 = wrapFrac(numer(1)), r2 = wrapFrac(numer(-1));
      fsteps.push({ rule: 'Simplify', latex: `${varName} = ${wrapFrac(`${nbS} \\pm ${irrTerm}`)}` });
      resultLatex = `${varName} = ${r1} \\quad\\text{or}\\quad ${varName} = ${r2}`;
      roots = [{ latex: r1 }, { latex: r2 }];
    }
  } else {
    fsteps.push({ rule: 'No real roots — express with i', latex: `\\sqrt{${D}} = \\sqrt{-1}\\cdot\\sqrt{${absD}} = i\\sqrt{${absD}}`, note: 'The square root of a negative number introduces the imaginary unit i.' });
    const re = F(nbS, denAbs);
    const imCoefFrac = F(out2S, denAbs);
    const imMagLatex = radicalLatex(fAbs(imCoefFrac), inside); // magnitude of the imaginary coefficient, always shown positive (sign carried by ±/∓)
    const iTerm = imMagLatex === '1' ? 'i' : `${imMagLatex}i`;
    const reLatex = fIsZero(re) ? '' : `${fToLatex(re)} `;
    resultLatex = fIsZero(re) ? `${varName} = \\pm ${iTerm}` : `${varName} = ${fToLatex(re)} \\pm ${iTerm}`;
    roots = [
      { latex: `${reLatex}${fIsZero(re) ? '' : '+ '}${iTerm}`.trim() },
      { latex: `${reLatex}${fIsZero(re) ? '-' : '- '}${iTerm}`.trim() },
    ];
  }
  fsteps.push({ rule: 'Solution', latex: resultLatex });
  return { steps: fsteps, resultLatex, roots, discriminant: D };
}
function quadraticSteps(eqStr) {
  const { left, right } = splitEquation(eqStr);
  const lAst = parseExpr(left), rAst = parseExpr(right);
  const varBox = { name: null };
  const lp = lowerToPoly(lAst, varBox).poly;
  const rp = lowerToPoly(rAst, varBox).poly;
  const varName = varBox.name || 'x';
  const combined = polyTrim(polySub(lp, rp));
  const deg = polyDeg(combined);
  const originalLatex = `${exprToLatex(lAst)} = ${exprToLatex(rAst)}`;

  if (deg < 2) {
    // Fall back to whichever method actually applies.
    if (deg <= 0) {
      const isAll = deg < 0 || fIsZero(combined[0] || fZero);
      return { degFallback: deg, varName, note: isAll ? 'This has no x term at all — it isn\'t an equation to solve for x.' : 'This is a contradiction, not a quadratic.', originalLatex };
    }
    return { degFallback: 1, varName, note: `Heads up: this simplifies to a linear equation (degree 1), not a quadratic.`, originalLatex };
  }
  if (deg > 2) {
    return { degFallback: deg, varName, note: `This simplifies to degree ${deg} — that's higher than a quadratic. Try the Polynomial tab.`, originalLatex };
  }

  const intCoeffs = polyToIntCoeffs(combined); // [c,b,a] BigInt, primitive, a>0
  const [c, b, a] = intCoeffs;
  const A = F(a), B = F(b), C = F(c);
  const steps = [];
  steps.push({ rule: 'Original equation', latex: originalLatex });
  steps.push({ rule: 'Standard form', latex: `${polyToLatex(combined, varName)} = 0`, note: `a = ${fToFracStr(A)}, b = ${fToFracStr(B)}, c = ${fToFracStr(C)}` });

  // ---- Discriminant ----
  const D = b * b - 4n * a * c;
  steps.push({ rule: 'Discriminant', latex: `\\Delta = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${D}`, note: D > 0n ? 'Positive — two real roots.' : (D === 0n ? 'Zero — one repeated real root.' : 'Negative — two complex roots.') });

  const methods = { formula: null, completingSquare: null, factoring: null };
  methods.formula = quadraticFormulaSolve(a, b, c, varName);

  // ---- Completing the square ----
  {
    const csteps = [];
    const bOverA = fDiv(B, A), cOverA = fDiv(C, A);
    const bTermLatex = fIsZero(bOverA) ? '' : ` ${fSign(bOverA) < 0 ? '-' : '+'} ${fEq(fAbs(bOverA), fOne) ? '' : fToLatex(fAbs(bOverA))}${varName}`;
    csteps.push({ rule: 'Divide every term by a', latex: `${varName}^2${bTermLatex} = ${fToLatex(fNeg(cOverA))}`, note: `Divide both sides by a = ${a} and move the constant to the right.` });
    const half = fDiv(bOverA, fFromInt(2));
    const halfSq = fMul(half, half);
    const rhs = fAdd(fNeg(cOverA), halfSq);
    csteps.push({ rule: `Add (half the ${varName}-coefficient)² to both sides`, latex: `${varName}^2${bTermLatex} + ${fToLatex(halfSq)} = ${fToLatex(rhs)}`, note: `\\left(${fToLatex(half)}\\right)^2 = ${fToLatex(halfSq)}` });
    const halfTermLatex = `${varName} ${fSign(half) < 0 ? '-' : '+'} ${fToLatex(fAbs(half))}`;
    csteps.push({ rule: 'Write the left side as a perfect square', latex: `\\left(${halfTermLatex}\\right)^2 = ${fToLatex(rhs)}` });
    let resultLatex;
    if (fSign(rhs) < 0) {
      const sqrtLatex = sqrtFractionLatex(fAbs(rhs));
      csteps.push({ rule: 'Square root both sides', latex: `${halfTermLatex} = \\pm i \\cdot ${sqrtLatex}`, note: 'The right side is negative, so the roots are complex.' });
      resultLatex = `${varName} = ${fToLatex(fNeg(half))} \\pm ${sqrtLatex}i`;
    } else {
      const sqrtLatex = sqrtFractionLatex(rhs);
      csteps.push({ rule: 'Square root both sides', latex: `${halfTermLatex} = \\pm ${sqrtLatex}` });
      resultLatex = `${varName} = ${fToLatex(fNeg(half))} \\pm ${sqrtLatex}`;
    }
    csteps.push({ rule: `Solve for ${varName}`, latex: resultLatex });
    methods.completingSquare = { steps: csteps, resultLatex };
  }

  // ---- Factoring (AC method: split the middle term), only shown if the result verifies ----
  if (c === 0n) {
    // ax^2 + bx = 0 -> x(ax + b) = 0, always exact (a common-factor case, not the general AC method).
    const fsteps = [];
    fsteps.push({ rule: 'Factor out the greatest common factor', latex: `${varName}\\left(${a === 1n ? '' : a}${varName} ${signedTerm(b)}\\right) = 0` });
    const r2 = fDiv(F(-b), F(a));
    fsteps.push({ rule: 'Set each factor to zero', latex: `${varName} = 0 \\quad\\text{or}\\quad ${a}${varName} ${signedTerm(b)} = 0` });
    const resultLatex = `${varName} = 0 \\quad\\text{or}\\quad ${varName} = ${fToLatex(r2)}`;
    fsteps.push({ rule: 'Solution', latex: resultLatex });
    methods.factoring = { steps: fsteps, resultLatex, factoredLatex: `${varName}\\left(${a === 1n ? '' : a}${varName} ${signedTerm(b)}\\right) = 0` };
  } else {
    const P = a * c;
    const searchBound = babs(P);
    if (searchBound > 0n && searchBound <= 1000000n) {
      let found = null;
      for (let m = 1n; m <= searchBound && !found; m++) {
        if (P % m !== 0n) continue;
        const n = P / m; // m*n === P by construction
        if (m + n === b) found = [m, n];
        else if (-m - n === b) found = [-m, -n];
      }
      if (found) {
        const [m, n] = found;
        // ax^2 + mx + nx + c = 0, group (ax^2+mx) + (nx+c) = g1*x*(a1 x+m1) + g2*(a1 x+m1)
        const g1 = gcdB(a, m) || 1n; // a>0 always (leading coeff normalized positive)
        const a1 = a / g1, m1 = m / g1;
        if (a1 !== 0n && n % a1 === 0n) {
          const g2 = n / a1;
          // Verify by re-expanding: (g1*x + g2) * (a1*x + m1) should equal a x^2 + b x + c exactly.
          const eA = g1 * a1, eB = g1 * m1 + g2 * a1, eC = g2 * m1;
          if (eA === a && eB === b && eC === c) {
            const fsteps = [];
            fsteps.push({ rule: 'Split the middle term', latex: `${a}${varName}^2 ${signedTerm(m, varName)} ${signedTerm(n, varName)} ${signedTerm(c)} = 0`, note: `Find two numbers that multiply to ac = ${P} and add to b = ${b}: ${m} and ${n}.` });
            fsteps.push({ rule: 'Group terms', latex: `\\left(${a}${varName}^2 ${signedTerm(m, varName)}\\right) + \\left(${signedTerm(n, varName)} ${signedTerm(c)}\\right) = 0` });
            const binomial = `${a1}${varName} ${signedTerm(m1)}`;
            const grp1 = `${g1 === 1n ? '' : g1}${varName}\\left(${binomial}\\right)`;
            const grp2 = `${g2}\\left(${binomial}\\right)`;
            fsteps.push({ rule: 'Factor each group', latex: `${grp1} + ${grp2} = 0` });
            const factLatex = `\\left(${binomial}\\right)\\left(${g1}${varName} ${signedTerm(g2)}\\right) = 0`;
            fsteps.push({ rule: 'Factor out the common binomial', latex: factLatex });
            const r1 = fDiv(F(-m1), F(a1)), r2 = fDiv(F(-g2), F(g1));
            fsteps.push({ rule: 'Set each factor to zero', latex: `${a1}${varName} ${signedTerm(m1)} = 0 \\quad\\text{or}\\quad ${g1}${varName} ${signedTerm(g2)} = 0` });
            const resultLatex = `${varName} = ${fToLatex(r1)} \\quad\\text{or}\\quad ${varName} = ${fToLatex(r2)}`;
            fsteps.push({ rule: 'Solution', latex: resultLatex });
            methods.factoring = { steps: fsteps, resultLatex, factoredLatex: factLatex };
          }
        }
      }
    }
  }

  return { steps, deg, varName, a, b, c, discriminant: D, methods, originalLatex };
}

// ---------- Polynomial solver (degree 1-4): rational root theorem + synthetic division ----------
function divisorsOfBigInt(n) {
  n = babs(n);
  if (n === 0n) return [];
  const divs = [];
  for (let i = 1n; i * i <= n; i++) {
    if (n % i === 0n) { divs.push(i); if (i !== n / i) divs.push(n / i); }
  }
  return divs.sort((x, y) => (x < y ? -1 : (x > y ? 1 : 0)));
}
function rationalRootCandidates(intCoeffsLowHigh) {
  const p = intCoeffsLowHigh[0]; // constant term (assumed nonzero by caller)
  const q = intCoeffsLowHigh[intCoeffsLowHigh.length - 1]; // leading term
  const pd = divisorsOfBigInt(p), qd = divisorsOfBigInt(q);
  const seen = new Set(); const out = [];
  for (const pp of pd) for (const qq of qd) {
    for (const sign of [1n, -1n]) {
      const fr = F(sign * pp, qq);
      const key = fr.n + '/' + fr.d;
      if (!seen.has(key)) { seen.add(key); out.push(fr); }
    }
  }
  return out;
}
// Fraction-based synthetic division of descending-order coeffs by (x - r). Returns {quotientDesc, remainder}.
function syntheticDivideDesc(descCoeffs, r) {
  const bottom = new Array(descCoeffs.length);
  bottom[0] = descCoeffs[0];
  for (let i = 1; i < descCoeffs.length; i++) bottom[i] = fAdd(descCoeffs[i], fMul(bottom[i - 1], r));
  return { quotientDesc: bottom.slice(0, -1), remainder: bottom[bottom.length - 1], bottom };
}
function syntheticDivisionLatex(descCoeffs, r, bottom) {
  const row1 = descCoeffs.map(fToLatex).join(' & ');
  const row2 = bottom.slice(0, -1).map((v, i) => i === 0 ? '' : fToLatex(fMul(v, r))).join(' & ');
  const row3 = bottom.map(fToLatex).join(' & ');
  return `\\begin{array}{c|${'c'.repeat(descCoeffs.length)}}\n${fToLatex(r)} & ${row1} \\\\\n & ${row2} \\\\\n\\hline\n & ${row3}\n\\end{array}`;
}
// Numeric fallback for a factor with no more rational roots: bisection over sign changes (Cauchy bound).
function numericRealRoots(intCoeffsLowHigh) {
  const nums = intCoeffsLowHigh.map(v => Number(v));
  const deg = nums.length - 1;
  const lead = nums[deg];
  let bound = 1;
  for (let i = 0; i < deg; i++) bound = Math.max(bound, 1 + Math.abs(nums[i] / lead));
  const evalP = (x) => { let acc = 0; for (let i = deg; i >= 0; i--) acc = acc * x + nums[i]; return acc; };
  const roots = [];
  const N = 4000;
  let prevX = -bound, prevY = evalP(prevX);
  for (let i = 1; i <= N; i++) {
    const x = -bound + (2 * bound * i) / N;
    const y = evalP(x);
    if (y === 0) { roots.push(x); }
    else if ((prevY < 0) !== (y < 0)) {
      let lo = prevX, hi = x, flo = prevY;
      for (let k = 0; k < 100; k++) {
        const mid = (lo + hi) / 2, fm = evalP(mid);
        if (fm === 0) { lo = hi = mid; break; }
        if ((fm < 0) !== (flo < 0)) hi = mid; else { lo = mid; flo = fm; }
      }
      roots.push((lo + hi) / 2);
    }
    prevX = x; prevY = y;
  }
  return roots;
}
function polynomialSteps(eqStr) {
  const { left, right } = splitEquation(eqStr);
  const lAst = parseExpr(left), rAst = parseExpr(right);
  const varBox = { name: null };
  const lp = lowerToPoly(lAst, varBox).poly;
  const rp = lowerToPoly(rAst, varBox).poly;
  const varName = varBox.name || 'x';
  const combined = polyTrim(polySub(lp, rp));
  const deg = polyDeg(combined);
  const originalLatex = `${exprToLatex(lAst)} = ${exprToLatex(rAst)}`;
  const steps = [];
  steps.push({ rule: 'Original equation', latex: originalLatex });

  if (deg < 0 || (deg === 0 && fIsZero(combined[0]))) {
    return { steps, deg, varName, kind: 'all', message: 'Every real number is a solution — this equation is an identity.' };
  }
  if (deg === 0) {
    return { steps, deg, varName, kind: 'none', message: 'No solution — the variable cancels out and the remaining statement is false.' };
  }
  if (deg > 4) {
    return { steps, deg, varName, unsupported: true, message: `This simplifies to degree ${deg} — this tool handles degree 4 and lower.` };
  }

  steps.push({ rule: 'Standard form', latex: `${polyToLatex(combined, varName)} = 0`, note: `Degree ${deg}.` });
  let workingLowHigh = polyToIntCoeffs(combined);
  const roots = []; // {latex, exact:bool, multiplicity}

  // Peel off x=0 roots first (constant term zero).
  let zeroMult = 0;
  while (workingLowHigh.length > 1 && workingLowHigh[0] === 0n) { workingLowHigh = workingLowHigh.slice(1); zeroMult++; }
  if (zeroMult > 0) {
    steps.push({ rule: `Factor out ${varName}${zeroMult > 1 ? '^{' + zeroMult + '}' : ''}`, latex: `${varName}^{${zeroMult}}\\left(${polyToLatex(workingLowHigh, varName)}\\right) = 0`, note: `${varName} = 0 is a root of multiplicity ${zeroMult}.` });
    roots.push({ latex: '0', multiplicity: zeroMult, exact: true });
  }

  if (deg === 1) {
    const sol = linearSolve(workingLowHigh.length > 1 ? [F(workingLowHigh[0]), F(workingLowHigh[1])] : [F(workingLowHigh[0])]);
    if (sol.kind === 'unique') roots.push({ latex: fToLatex(sol.x), multiplicity: 1, exact: true });
    steps.push({ rule: 'Solve the linear factor', latex: `${polyToLatex(workingLowHigh, varName)} = 0` });
  } else if (workingLowHigh.length - 1 === 2) {
    const [c2, b2, a2] = workingLowHigh;
    const qr = quadraticFormulaSolve(a2, b2, c2, varName);
    steps.push({ rule: 'Solve the quadratic factor', latex: `${polyToLatex(workingLowHigh, varName)} = 0` });
    steps.push(...qr.steps);
    for (const r of qr.roots) roots.push({ latex: r.latex, multiplicity: 1, exact: true });
  } else if (workingLowHigh.length - 1 >= 3) {
    // RRT + synthetic division cascade.
    let guardIters = 0;
    while (workingLowHigh.length - 1 > 2 && guardIters < 20) {
      guardIters++;
      if (babs(workingLowHigh[0]) > 100000n || babs(workingLowHigh[workingLowHigh.length - 1]) > 100000n) {
        steps.push({ rule: 'Coefficients too large', latex: '', note: 'Coefficients grew too large for an exact rational-root search.' });
        break;
      }
      const candidates = rationalRootCandidates(workingLowHigh);
      let hit = null;
      for (const cand of candidates) {
        const descFr = workingLowHigh.slice().reverse().map(v => F(v));
        const { quotientDesc, remainder, bottom } = syntheticDivideDesc(descFr, cand);
        if (fIsZero(remainder)) { hit = { cand, quotientDesc, bottom, descFr }; break; }
      }
      if (!hit) break;
      const { cand, quotientDesc, bottom, descFr } = hit;
      steps.push({ rule: `Test ${varName} = ${fToLatex(cand)} by synthetic division`, latex: syntheticDivisionLatex(descFr, cand, bottom), note: 'Remainder 0 confirms a root.' });
      roots.push({ latex: fToLatex(cand), multiplicity: 1, exact: true });
      const quotLowHigh = quotientDesc.slice().reverse(); // Fraction[], low->high
      workingLowHigh = polyToIntCoeffs(quotLowHigh);
      steps.push({ rule: 'Reduced polynomial', latex: `${polyToLatex(workingLowHigh, varName)} = 0` });
    }
    const remDeg = workingLowHigh.length - 1;
    if (remDeg === 2) {
      const [c2, b2, a2] = workingLowHigh;
      const qr = quadraticFormulaSolve(a2, b2, c2, varName);
      steps.push({ rule: 'Solve the remaining quadratic factor', latex: `${polyToLatex(workingLowHigh, varName)} = 0` });
      steps.push(...qr.steps);
      for (const r of qr.roots) roots.push({ latex: r.latex, multiplicity: 1, exact: true });
    } else if (remDeg === 1) {
      const sol = linearSolve([F(workingLowHigh[0]), F(workingLowHigh[1])]);
      if (sol.kind === 'unique') roots.push({ latex: fToLatex(sol.x), multiplicity: 1, exact: true });
    } else if (remDeg >= 3) {
      const nr = numericRealRoots(workingLowHigh);
      if (nr.length) {
        steps.push({ rule: 'No more rational roots — numeric approximation', latex: `${polyToLatex(workingLowHigh, varName)} = 0`, note: `Remaining real root(s), approximated: ${nr.map(x => x.toFixed(6)).join(', ')}` });
        for (const x of nr) roots.push({ latex: x.toFixed(6), multiplicity: 1, exact: false });
      } else {
        steps.push({ rule: 'No more rational (or real) roots found', latex: `${polyToLatex(workingLowHigh, varName)} = 0`, note: 'This factor has no real roots.' });
      }
    }
  }

  const resultLatex = roots.length
    ? roots.map(r => `${varName} = ${r.latex}${r.multiplicity > 1 ? `\\ (\\times${r.multiplicity})` : ''}`).join(', \\quad ')
    : `\\text{No real roots found}`;
  steps.push({ rule: 'Solution', latex: resultLatex });
  return { steps, deg, varName, roots, resultLatex };
}

// ---------- Systems of linear equations (2 or 3 variables) ----------
// Lower an AST to a linear combination over the declared variable list: {const:Fraction, coeffs:Fraction[]}
function lowerLinearCombo(node, vars) {
  const zeros = () => vars.map(() => fZero);
  const combine = (a, b, op) => ({ const: op(a.const, b.const), coeffs: a.coeffs.map((c, i) => op(c, b.coeffs[i])) });
  switch (node.t) {
    case 'num': return { const: node.v, coeffs: zeros() };
    case 'var': {
      const idx = vars.indexOf(node.name);
      if (idx < 0) throw new Error(`Unknown variable "${node.name}" — this system uses ${vars.join(', ')}.`);
      const coeffs = zeros(); coeffs[idx] = fOne;
      return { const: fZero, coeffs };
    }
    case 'neg': { const a = lowerLinearCombo(node.a, vars); return { const: fNeg(a.const), coeffs: a.coeffs.map(fNeg) }; }
    case 'add': return combine(lowerLinearCombo(node.a, vars), lowerLinearCombo(node.b, vars), fAdd);
    case 'sub': return combine(lowerLinearCombo(node.a, vars), lowerLinearCombo(node.b, vars), fSub);
    case 'mul': {
      const a = lowerLinearCombo(node.a, vars), b = lowerLinearCombo(node.b, vars);
      const aConst = a.coeffs.every(fIsZero), bConst = b.coeffs.every(fIsZero);
      if (aConst) return { const: fMul(a.const, b.const), coeffs: b.coeffs.map(c => fMul(c, a.const)) };
      if (bConst) return { const: fMul(a.const, b.const), coeffs: a.coeffs.map(c => fMul(c, b.const)) };
      throw new Error('This system only supports linear equations — found a product of two variables.');
    }
    case 'div': {
      const a = lowerLinearCombo(node.a, vars), b = lowerLinearCombo(node.b, vars);
      if (!b.coeffs.every(fIsZero)) throw new Error('This system doesn\'t support a variable in a denominator.');
      return { const: fDiv(a.const, b.const), coeffs: a.coeffs.map(c => fDiv(c, b.const)) };
    }
    case 'pow': {
      const expNode = node.b;
      if (expNode.t !== 'num' || expNode.v.d !== 1n || (expNode.v.n !== 0n && expNode.v.n !== 1n)) throw new Error('This system only supports linear (power-1) terms.');
      if (expNode.v.n === 0n) return { const: fOne, coeffs: zeros() };
      return lowerLinearCombo(node.a, vars);
    }
    default: throw new Error('Unsupported expression in this system.');
  }
}
// Parses "LHS = RHS" into {coeffs:Fraction[], rhs:Fraction} meaning sum(coeffs[i]*vars[i]) = rhs
function parseLinearSystemEquation(str, vars) {
  const { left, right } = splitEquation(str);
  const L = lowerLinearCombo(parseExpr(left), vars);
  const R = lowerLinearCombo(parseExpr(right), vars);
  const diff = { const: fSub(L.const, R.const), coeffs: L.coeffs.map((c, i) => fSub(c, R.coeffs[i])) };
  return { coeffs: diff.coeffs, rhs: fNeg(diff.const) };
}
function joinSignedTerms(strs) {
  if (!strs.length) return '0';
  let out = strs[0];
  for (let i = 1; i < strs.length; i++) out += strs[i].startsWith('-') ? ` - ${strs[i].slice(1)}` : ` + ${strs[i]}`;
  return out;
}
function linearEqLatex(coeffs, vars, rhs) {
  const terms = [];
  vars.forEach((v, i) => { if (!fIsZero(coeffs[i])) terms.push(coefTermLatex(coeffs[i], v, 1)); });
  return `${joinSignedTerms(terms)} = ${fToLatex(rhs)}`;
}
// Eliminate vars[varIdx] from eqB using eqA (requires eqA.coeffs[varIdx] != 0): returns eqB - (eqB[varIdx]/eqA[varIdx])*eqA
function eliminateVar(eqA, eqB, varIdx) {
  const factor = fDiv(eqB.coeffs[varIdx], eqA.coeffs[varIdx]);
  const coeffs = eqB.coeffs.map((c, i) => fSub(c, fMul(factor, eqA.coeffs[i])));
  const rhs = fSub(eqB.rhs, fMul(factor, eqA.rhs));
  return { coeffs, rhs, factor };
}
function findPivot(eqs, varIdx, exclude = new Set()) {
  for (let i = 0; i < eqs.length; i++) if (!exclude.has(i) && !fIsZero(eqs[i].coeffs[varIdx])) return i;
  return -1;
}
function isZeroEq(eq) { return eq.coeffs.every(fIsZero); }
function degenerateMessage(eq) {
  if (!isZeroEq(eq)) return null;
  return fIsZero(eq.rhs)
    ? { kind: 'infinite', message: 'This system has infinitely many solutions — the equations are dependent.' }
    : { kind: 'none', message: 'This system has no solution — the equations are inconsistent.' };
}
// Solve a single 1-variable equation coef*v = rhs
function solveSingleVarEq(coef, rhs, varName) {
  if (fIsZero(coef)) return fIsZero(rhs) ? { kind: 'infinite' } : { kind: 'none' };
  return { kind: 'unique', value: fDiv(rhs, coef) };
}

function solveSystem2Substitution(eq1, eq2, vars) {
  const steps = [];
  steps.push({ rule: 'System', latex: `\\begin{cases} ${linearEqLatex(eq1.coeffs, vars, eq1.rhs)} \\\\ ${linearEqLatex(eq2.coeffs, vars, eq2.rhs)} \\end{cases}` });
  const eqs = [eq1, eq2];
  const pIdx = findPivot(eqs, 0);
  if (pIdx < 0) return { steps, kind: 'error', message: `Neither equation has a ${vars[0]}-term to solve for.` };
  const pivot = eqs[pIdx], other = eqs[1 - pIdx];
  const otherCoeffLatex = fIsZero(pivot.coeffs[1]) ? '' : ` ${fSign(pivot.coeffs[1]) < 0 ? '+' : '-'} ${fEq(fAbs(pivot.coeffs[1]), fOne) ? '' : fToLatex(fAbs(pivot.coeffs[1]))}${vars[1]}`;
  steps.push({ rule: `Solve equation ${pIdx + 1} for ${vars[0]}`, latex: `${vars[0]} = \\frac{${fToLatex(pivot.rhs)}${otherCoeffLatex}}{${fToLatex(pivot.coeffs[0])}}`, note: `The ${vars[0]}-coefficient is nonzero here, so isolate it.` });
  const reduced = eliminateVar(pivot, other, 0); // single-var equation in vars[1]
  steps.push({ rule: `Substitute into equation ${2 - pIdx}`, latex: linearEqLatex([reduced.coeffs[1]], [vars[1]], reduced.rhs) });
  const sol1 = solveSingleVarEq(reduced.coeffs[1], reduced.rhs, vars[1]);
  if (sol1.kind !== 'unique') {
    return { steps, kind: sol1.kind, message: sol1.kind === 'infinite' ? 'This system has infinitely many solutions — the equations are dependent.' : 'This system has no solution — the equations are inconsistent.' };
  }
  const yVal = sol1.value;
  steps.push({ rule: `Solve for ${vars[1]}`, latex: `${vars[1]} = ${fToLatex(yVal)}` });
  const xVal = fDiv(fSub(pivot.rhs, fMul(pivot.coeffs[1], yVal)), pivot.coeffs[0]);
  steps.push({ rule: `Back-substitute for ${vars[0]}`, latex: `${vars[0]} = \\frac{${fToLatex(pivot.rhs)} - (${fToLatex(pivot.coeffs[1])})(${fToLatex(yVal)})}{${fToLatex(pivot.coeffs[0])}} = ${fToLatex(xVal)}` });
  const resultLatex = `${vars[0]} = ${fToLatex(xVal)}, \\quad ${vars[1]} = ${fToLatex(yVal)}`;
  steps.push({ rule: 'Solution', latex: resultLatex });
  return { steps, kind: 'unique', values: { [vars[0]]: xVal, [vars[1]]: yVal }, resultLatex };
}

function solveSystem2Elimination(eq1, eq2, vars) {
  const steps = [];
  steps.push({ rule: 'System', latex: `\\begin{cases} ${linearEqLatex(eq1.coeffs, vars, eq1.rhs)} \\\\ ${linearEqLatex(eq2.coeffs, vars, eq2.rhs)} \\end{cases}` });
  const eqs = [eq1, eq2];
  const pIdx = findPivot(eqs, 0);
  if (pIdx < 0) return { steps, kind: 'error', message: `Neither equation has a ${vars[0]}-term to eliminate.` };
  const pivot = eqs[pIdx], otherIdx = 1 - pIdx, other = eqs[otherIdx];
  const reduced = eliminateVar(pivot, other, 0);
  steps.push({ rule: `Eliminate ${vars[0]}`, latex: `\\text{Equation ${otherIdx + 1}} - \\left(${fToLatex(reduced.factor)}\\right)\\cdot\\text{Equation ${pIdx + 1}}: \\quad ${linearEqLatex([reduced.coeffs[1]], [vars[1]], reduced.rhs)}`, note: `Multiplying equation ${pIdx + 1} by ${fToLatex(reduced.factor)} matches its ${vars[0]}-coefficient to equation ${otherIdx + 1}, so subtracting cancels ${vars[0]}.` });
  const sol1 = solveSingleVarEq(reduced.coeffs[1], reduced.rhs, vars[1]);
  if (sol1.kind !== 'unique') {
    return { steps, kind: sol1.kind, message: sol1.kind === 'infinite' ? 'This system has infinitely many solutions — the equations are dependent.' : 'This system has no solution — the equations are inconsistent.' };
  }
  const yVal = sol1.value;
  steps.push({ rule: `Solve for ${vars[1]}`, latex: `${vars[1]} = ${fToLatex(yVal)}` });
  const xVal = fDiv(fSub(pivot.rhs, fMul(pivot.coeffs[1], yVal)), pivot.coeffs[0]);
  steps.push({ rule: `Back-substitute into equation ${pIdx + 1}`, latex: `${linearEqLatex(pivot.coeffs, vars, pivot.rhs)} \\;\\Rightarrow\\; ${vars[0]} = ${fToLatex(xVal)}` });
  const resultLatex = `${vars[0]} = ${fToLatex(xVal)}, \\quad ${vars[1]} = ${fToLatex(yVal)}`;
  steps.push({ rule: 'Solution', latex: resultLatex });
  return { steps, kind: 'unique', values: { [vars[0]]: xVal, [vars[1]]: yVal }, resultLatex };
}

function solveSystem3Substitution(eq1, eq2, eq3, vars) {
  const steps = [];
  steps.push({ rule: 'System', latex: `\\begin{cases} ${linearEqLatex(eq1.coeffs, vars, eq1.rhs)} \\\\ ${linearEqLatex(eq2.coeffs, vars, eq2.rhs)} \\\\ ${linearEqLatex(eq3.coeffs, vars, eq3.rhs)} \\end{cases}` });
  const eqs = [eq1, eq2, eq3];
  const pIdx = findPivot(eqs, 0);
  if (pIdx < 0) return { steps, kind: 'error', message: `No equation has an ${vars[0]}-term to solve for.` };
  const pivot = eqs[pIdx];
  const others = eqs.filter((_, i) => i !== pIdx);
  const term = (i) => fIsZero(pivot.coeffs[i]) ? '' : ` ${fSign(pivot.coeffs[i]) < 0 ? '+' : '-'} ${fEq(fAbs(pivot.coeffs[i]), fOne) ? '' : fToLatex(fAbs(pivot.coeffs[i]))}${vars[i]}`;
  steps.push({ rule: `Solve equation ${pIdx + 1} for ${vars[0]}`, latex: `${vars[0]} = \\frac{${fToLatex(pivot.rhs)}${term(1)}${term(2)}}{${fToLatex(pivot.coeffs[0])}}` });
  const reducedEqs = others.map(o => eliminateVar(pivot, o, 0));
  reducedEqs.forEach((r, i) => steps.push({ rule: `Substitute into the other equation`, latex: linearEqLatex([r.coeffs[1], r.coeffs[2]], [vars[1], vars[2]], r.rhs) }));
  // Recurse: solve the resulting 2-variable subsystem via substitution.
  const sub2 = solveSystem2Substitution(
    { coeffs: [reducedEqs[0].coeffs[1], reducedEqs[0].coeffs[2]], rhs: reducedEqs[0].rhs },
    { coeffs: [reducedEqs[1].coeffs[1], reducedEqs[1].coeffs[2]], rhs: reducedEqs[1].rhs },
    [vars[1], vars[2]]
  );
  steps.push(...sub2.steps.slice(1)); // skip its own "System" restatement line
  if (sub2.kind !== 'unique') return { steps, kind: sub2.kind, message: sub2.message };
  const yVal = sub2.values[vars[1]], zVal = sub2.values[vars[2]];
  const xVal = fDiv(fSub(fSub(pivot.rhs, fMul(pivot.coeffs[1], yVal)), fMul(pivot.coeffs[2], zVal)), pivot.coeffs[0]);
  steps.push({ rule: `Back-substitute for ${vars[0]}`, latex: `${vars[0]} = ${fToLatex(xVal)}` });
  const resultLatex = `${vars[0]} = ${fToLatex(xVal)}, \\quad ${vars[1]} = ${fToLatex(yVal)}, \\quad ${vars[2]} = ${fToLatex(zVal)}`;
  steps.push({ rule: 'Solution', latex: resultLatex });
  return { steps, kind: 'unique', values: { [vars[0]]: xVal, [vars[1]]: yVal, [vars[2]]: zVal }, resultLatex };
}

function solveSystem3Elimination(eq1, eq2, eq3, vars) {
  const steps = [];
  steps.push({ rule: 'System', latex: `\\begin{cases} ${linearEqLatex(eq1.coeffs, vars, eq1.rhs)} \\\\ ${linearEqLatex(eq2.coeffs, vars, eq2.rhs)} \\\\ ${linearEqLatex(eq3.coeffs, vars, eq3.rhs)} \\end{cases}` });
  const eqs = [eq1, eq2, eq3];
  const pIdx = findPivot(eqs, 0);
  if (pIdx < 0) return { steps, kind: 'error', message: `No equation has an ${vars[0]}-term to eliminate.` };
  const pivot = eqs[pIdx];
  const others = eqs.filter((_, i) => i !== pIdx);
  const reducedEqs = others.map(o => eliminateVar(pivot, o, 0));
  reducedEqs.forEach(r => steps.push({ rule: `Eliminate ${vars[0]} using equation ${pIdx + 1}`, latex: linearEqLatex([r.coeffs[1], r.coeffs[2]], [vars[1], vars[2]], r.rhs) }));
  const sub2Eq1 = { coeffs: [reducedEqs[0].coeffs[1], reducedEqs[0].coeffs[2]], rhs: reducedEqs[0].rhs };
  const sub2Eq2 = { coeffs: [reducedEqs[1].coeffs[1], reducedEqs[1].coeffs[2]], rhs: reducedEqs[1].rhs };
  const p2 = findPivot([sub2Eq1, sub2Eq2], 0);
  if (p2 < 0) {
    const deg = degenerateMessage(sub2Eq1) || degenerateMessage(sub2Eq2);
    if (deg) return { steps, kind: deg.kind, message: deg.message };
    return { steps, kind: 'error', message: `Couldn't isolate ${vars[1]} — check the equations.` };
  }
  const [pivot2, other2] = p2 === 0 ? [sub2Eq1, sub2Eq2] : [sub2Eq2, sub2Eq1];
  const r2 = eliminateVar(pivot2, other2, 0);
  steps.push({ rule: `Eliminate ${vars[1]}`, latex: linearEqLatex([r2.coeffs[1]], [vars[2]], r2.rhs) });
  const solZ = solveSingleVarEq(r2.coeffs[1], r2.rhs, vars[2]);
  if (solZ.kind !== 'unique') {
    return { steps, kind: solZ.kind, message: solZ.kind === 'infinite' ? 'This system has infinitely many solutions — the equations are dependent.' : 'This system has no solution — the equations are inconsistent.' };
  }
  const zVal = solZ.value;
  steps.push({ rule: `Solve for ${vars[2]}`, latex: `${vars[2]} = ${fToLatex(zVal)}` });
  const yVal = fDiv(fSub(pivot2.rhs, fMul(pivot2.coeffs[1], zVal)), pivot2.coeffs[0]);
  steps.push({ rule: `Back-substitute for ${vars[1]}`, latex: `${vars[1]} = ${fToLatex(yVal)}` });
  const xVal = fDiv(fSub(fSub(pivot.rhs, fMul(pivot.coeffs[1], yVal)), fMul(pivot.coeffs[2], zVal)), pivot.coeffs[0]);
  steps.push({ rule: `Back-substitute for ${vars[0]}`, latex: `${vars[0]} = ${fToLatex(xVal)}` });
  const resultLatex = `${vars[0]} = ${fToLatex(xVal)}, \\quad ${vars[1]} = ${fToLatex(yVal)}, \\quad ${vars[2]} = ${fToLatex(zVal)}`;
  steps.push({ rule: 'Solution', latex: resultLatex });
  return { steps, kind: 'unique', values: { [vars[0]]: xVal, [vars[1]]: yVal, [vars[2]]: zVal }, resultLatex };
}

function solveSystem2(eqStr1, eqStr2, vars = ['x', 'y']) {
  const eq1 = parseLinearSystemEquation(eqStr1, vars);
  const eq2 = parseLinearSystemEquation(eqStr2, vars);
  return { substitution: solveSystem2Substitution(eq1, eq2, vars), elimination: solveSystem2Elimination(eq1, eq2, vars) };
}
function solveSystem3(eqStr1, eqStr2, eqStr3, vars = ['x', 'y', 'z']) {
  const eq1 = parseLinearSystemEquation(eqStr1, vars);
  const eq2 = parseLinearSystemEquation(eqStr2, vars);
  const eq3 = parseLinearSystemEquation(eqStr3, vars);
  return { substitution: solveSystem3Substitution(eq1, eq2, eq3, vars), elimination: solveSystem3Elimination(eq1, eq2, eq3, vars) };
}

  const API = {
    gcdB, lcmB, F, fZero, fOne, fIsZero, fEq, fAdd, fSub, fMul, fDiv, fNeg, fSign, fAbs, fCmp,
    fFromInt, fFromStr, fToNumber, fToDecimalStr, fToFracStr, fToLatex,
    polyTrim, polyIsZero, polyDeg, polyAdd, polySub, polyNeg, polyScale, polyMul, polyEvalFr, polyToLatex, polyToIntCoeffs,
    tokenize, parseExpr, splitEquation, lowerToPoly, parseSingleVarEquation,
    exprToLatex, equationToLatex, linearSolve, linearSteps, coefTermLatex,
    bigIntSqrtFloor, simplifySqrtBigInt, sqrtFractionLatex, quadraticSteps, quadraticFormulaSolve,
    divisorsOfBigInt, rationalRootCandidates, syntheticDivideDesc, numericRealRoots, polynomialSteps,
    parseLinearSystemEquation, linearEqLatex, solveSystem2, solveSystem3,
  };

  root.AlgebraEngine = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
