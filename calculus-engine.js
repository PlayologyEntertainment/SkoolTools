/* =========================================================================
   SkoolToolz — Calculus Engine  (Phase 1.1: Derivatives)
   -------------------------------------------------------------------------
   A small, deterministic, dependency-free symbolic engine. No AI, no network.
   It parses an expression, differentiates it rule-by-rule (emitting the named
   rule applied at each step), simplifies the result, and serializes to LaTeX
   or plain text. Lazy-loaded on first open of the Calculus Solver.

   Public API (attached to the host global, e.g. window.CalcEngine):
     CalcEngine.derivative(input, variable) ->
        { ok, error?, input, variable,
          resultLatex, resultText,             // simplified f'(x)
          inputLatex,                          // pretty-printed input
          steps: [ { rule, note, latex } ] }   // rule-by-rule working
     CalcEngine.evaluate(input, variable, value) -> Number | null
     CalcEngine.parse(input)        -> AST            (throws ParseError)
     CalcEngine.toLatex(ast, varName)
     CalcEngine.toText(ast, varName)

   AST node shapes:
     {t:'num', v}                 number literal
     {t:'var', name}              variable (e.g. 'x')
     {t:'const', name}            symbolic constant: 'pi' | 'e'
     {t:'neg', arg}               unary minus
     {t:'add', args:[...]}        n-ary sum
     {t:'mul', args:[...]}        n-ary product
     {t:'div', num, den}          quotient (kept distinct for the quotient rule)
     {t:'pow', base, exp}         power
     {t:'func', name, arg}        named function application
   ========================================================================= */
(function (root) {
  'use strict';

  /* ---------------------------------------------------------------- errors */
  function ParseError(msg) { this.name = 'ParseError'; this.message = msg; }
  ParseError.prototype = Object.create(Error.prototype);

  /* ----------------------------------------------------- AST constructors  */
  const Num   = v => ({ t: 'num', v });
  const Var   = name => ({ t: 'var', name });
  const Const = name => ({ t: 'const', name });
  const Neg   = arg => ({ t: 'neg', arg });
  const Add   = args => ({ t: 'add', args });
  const Mul   = args => ({ t: 'mul', args });
  const Div   = (num, den) => ({ t: 'div', num, den });
  const Pow   = (base, exp) => ({ t: 'pow', base, exp });
  const Func  = (name, arg) => ({ t: 'func', name, arg });

  const ZERO = Num(0), ONE = Num(1), TWO = Num(2);

  /* Functions the parser/engine understands, with their LaTeX command. */
  const FUNCS = {
    sin:'\\sin', cos:'\\cos', tan:'\\tan',
    sec:'\\sec', csc:'\\csc', cot:'\\cot',
    asin:'\\arcsin', acos:'\\arccos', atan:'\\arctan',
    arcsin:'\\arcsin', arccos:'\\arccos', arctan:'\\arctan',
    sinh:'\\sinh', cosh:'\\cosh', tanh:'\\tanh',
    ln:'\\ln', log:'\\log', exp:'\\exp', sqrt:'\\sqrt', abs:'\\operatorname{abs}'
  };
  // Normalize a few aliases to a canonical internal name.
  const FUNC_ALIAS = { arcsin:'asin', arccos:'acos', arctan:'atan' };

  /* ========================================================================
     TOKENIZER + PARSER
     ===================================================================== */
  function preprocess(s) {
    return String(s)
      .replace(/[×·∙]/g, '*')
      .replace(/÷/g, '/')
      .replace(/[−–—]/g, '-')
      .replace(/√/g, ' sqrt ')
      .replace(/π/g, ' pi ')
      .replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4')
      .replace(/⁵/g, '^5').replace(/⁶/g, '^6')
      .replace(/\*\*/g, '^');                 // accept ** as power
  }

  function tokenize(src) {
    const s = preprocess(src);
    const out = [];
    let i = 0;
    const isDigit = c => c >= '0' && c <= '9';
    const isAlpha = c => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
    while (i < s.length) {
      const c = s[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
      if (isDigit(c) || (c === '.' && isDigit(s[i + 1]))) {
        let j = i + 1;
        while (j < s.length && (isDigit(s[j]) || s[j] === '.')) j++;
        out.push({ type: 'num', value: parseFloat(s.slice(i, j)) });
        i = j; continue;
      }
      if (isAlpha(c)) {
        let j = i + 1;
        while (j < s.length && (isAlpha(s[j]) || isDigit(s[j]) || s[j] === '_')) j++;
        out.push({ type: 'ident', value: s.slice(i, j) });
        i = j; continue;
      }
      if ('+-*/^(),'.includes(c)) { out.push({ type: 'op', value: c }); i++; continue; }
      throw new ParseError("Unexpected character: '" + c + "'");
    }
    return out;
  }

  function parse(src) {
    const toks = tokenize(src);
    if (!toks.length) throw new ParseError('Empty expression.');
    let pos = 0;
    const peek = () => toks[pos];
    const next = () => toks[pos++];
    const eof  = () => pos >= toks.length;

    const startsFactor = t =>
      !!t && (t.type === 'num' || t.type === 'ident' || (t.type === 'op' && t.value === '('));

    function parseExpr() {                      // additive
      let node = parseTerm();
      while (!eof() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
        const op = next().value;
        const rhs = parseTerm();
        node = op === '+' ? Add([node, rhs]) : Add([node, Neg(rhs)]);
      }
      return node;
    }
    function parseTerm() {                       // multiplicative (+ implicit)
      let node = parseFactor();
      while (!eof()) {
        const t = peek();
        if (t.type === 'op' && (t.value === '*' || t.value === '/')) {
          const op = next().value;
          const rhs = parseFactor();
          node = op === '*' ? Mul([node, rhs]) : Div(node, rhs);
        } else if (startsFactor(t)) {            // implicit multiplication: 2x, x(x+1)
          node = Mul([node, parseFactor()]);
        } else break;
      }
      return node;
    }
    function parseFactor() {                     // unary sign + power (right-assoc)
      if (peek() && peek().type === 'op' && peek().value === '-') { next(); return Neg(parseFactor()); }
      if (peek() && peek().type === 'op' && peek().value === '+') { next(); return parseFactor(); }
      let base = parseBase();
      if (peek() && peek().type === 'op' && peek().value === '^') {
        next();
        base = Pow(base, parseFactor());
      }
      return base;
    }
    function parseBase() {
      const t = peek();
      if (!t) throw new ParseError('Unexpected end of expression.');
      if (t.type === 'num') { next(); return Num(t.value); }
      if (t.type === 'op' && t.value === '(') {
        next();
        const e = parseExpr();
        expect(')');
        return e;
      }
      if (t.type === 'ident') {
        next();
        const raw = t.value.toLowerCase();
        const name = FUNC_ALIAS[raw] || raw;
        if (FUNCS[raw] || FUNCS[name]) {
          // function: prefer parenthesized argument; otherwise take next factor
          if (peek() && peek().type === 'op' && peek().value === '(') {
            next();
            const arg = parseExpr();
            expect(')');
            return Func(name, arg);
          }
          return Func(name, parseFactor());
        }
        if (name === 'pi') return Const('pi');
        if (name === 'e')  return Const('e');
        return Var(name);                        // any other identifier => variable
      }
      throw new ParseError("Unexpected token '" + t.value + "'.");
    }
    function expect(v) {
      const t = next();
      if (!t || t.value !== v) throw new ParseError("Expected '" + v + "'.");
    }

    const ast = parseExpr();
    if (!eof()) throw new ParseError("Unexpected '" + peek().value + "'.");
    return ast;
  }

  /* ========================================================================
     HELPERS: dependence, equality, numeric folding
     ===================================================================== */
  function dependsOn(node, x) {
    switch (node.t) {
      case 'num': case 'const': return false;
      case 'var': return node.name === x;
      case 'neg': return dependsOn(node.arg, x);
      case 'add': case 'mul': return node.args.some(a => dependsOn(a, x));
      case 'div': return dependsOn(node.num, x) || dependsOn(node.den, x);
      case 'pow': return dependsOn(node.base, x) || dependsOn(node.exp, x);
      case 'func': return dependsOn(node.arg, x);
    }
    return false;
  }
  const isNum = n => n.t === 'num';
  const numEq = (n, v) => n.t === 'num' && n.v === v;

  /* Canonical key — used to recognise like terms / like factors. */
  function canon(n) {
    switch (n.t) {
      case 'num':  return '#' + n.v;
      case 'var':  return 'v' + n.name;
      case 'const':return 'c' + n.name;
      case 'neg':  return 'n(' + canon(n.arg) + ')';
      case 'add':  return 'A(' + n.args.map(canon).sort().join(',') + ')';
      case 'mul':  return 'M(' + n.args.map(canon).sort().join(',') + ')';
      case 'div':  return 'D(' + canon(n.num) + '/' + canon(n.den) + ')';
      case 'pow':  return 'P(' + canon(n.base) + '^' + canon(n.exp) + ')';
      case 'func': return 'f' + n.name + '(' + canon(n.arg) + ')';
    }
    return '?';
  }
  const same = (a, b) => canon(a) === canon(b);

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }

  /* ========================================================================
     SIMPLIFIER
     Recurse children, then apply node-specific reductions; iterate to a
     fixpoint so cascading simplifications settle.
     ===================================================================== */
  function simplify(node) {
    let cur = node, prev = null, guard = 0;
    while (!prev || canon(cur) !== canon(prev)) {
      prev = cur;
      cur = simpStep(cur);
      if (++guard > 60) break;
    }
    return cur;
  }

  function simpStep(n) {
    switch (n.t) {
      case 'num': case 'var': case 'const': return n;
      case 'neg': return simpNeg(simpStep(n.arg));
      case 'func': return simpFunc(n.name, simpStep(n.arg));
      case 'pow': return simpPow(simpStep(n.base), simpStep(n.exp));
      case 'div': return simpDiv(simpStep(n.num), simpStep(n.den));
      case 'add': return simpAdd(n.args.map(simpStep));
      case 'mul': return simpMul(n.args.map(simpStep));
    }
    return n;
  }

  function simpNeg(a) {
    if (a.t === 'num') return Num(-a.v);
    if (a.t === 'neg') return a.arg;
    return Neg(a);
  }

  /* Value of a purely numeric node (no variables/constants), else null. */
  function numericValue(n) {
    switch (n.t) {
      case 'num': return n.v;
      case 'neg': { const a = numericValue(n.arg); return a == null ? null : -a; }
      case 'add': { let s = 0; for (const a of n.args) { const v = numericValue(a); if (v == null) return null; s += v; } return s; }
      case 'mul': { let p = 1; for (const a of n.args) { const v = numericValue(a); if (v == null) return null; p *= v; } return p; }
      case 'div': { const a = numericValue(n.num), b = numericValue(n.den); return (a == null || b == null || b === 0) ? null : a / b; }
      case 'pow': { const a = numericValue(n.base), b = numericValue(n.exp); return (a == null || b == null) ? null : Math.pow(a, b); }
      default: return null;     // var, const (pi/e), func stay symbolic
    }
  }

  /* Build an exact-ish numeric AST node from a JS number (prefers fractions). */
  function ratNode(c) {
    let { p, q } = rationalize(c);
    if (q < 0) { p = -p; q = -q; }
    const g = (Number.isInteger(p) && Number.isInteger(q)) ? (gcd(p, q) || 1) : 1;
    p /= g; q /= g;
    return q === 1 ? Num(p) : Div(Num(p), Num(q));
  }

  /* Split a term into [coefficient, restNode|null] for combining like terms. */
  function asCoeffTerm(t) {
    if (t.t === 'num') return [t.v, null];
    if (t.t === 'neg') { const [c, r] = asCoeffTerm(t.arg); return [-c, r]; }
    if (t.t === 'mul') {
      let c = 1; const rest = [];
      for (const f of t.args) { if (f.t === 'num') c *= f.v; else rest.push(f); }
      if (!rest.length) return [c, null];
      return [c, rest.length === 1 ? rest[0] : Mul(rest)];
    }
    return [1, t];
  }

  function simpAdd(rawArgs) {
    // flatten nested sums
    const args = [];
    const flat = a => { if (a.t === 'add') a.args.forEach(flat); else args.push(a); };
    rawArgs.forEach(flat);

    let constSum = 0;
    const groups = new Map();           // key -> { coeff, rest }
    for (const a of args) {
      const nv = numericValue(a);       // fold any pure-numeric term (incl. fractions)
      if (nv != null) { constSum += nv; continue; }
      const [c, rest] = asCoeffTerm(a);
      if (rest === null) { constSum += c; continue; }
      const k = canon(rest);
      const g = groups.get(k);
      if (g) g.coeff += c; else groups.set(k, { coeff: c, rest });
    }
    const terms = [];
    for (const { coeff, rest } of groups.values()) {
      if (coeff === 0) continue;
      if (coeff === 1) terms.push(rest);
      else if (coeff === -1) terms.push(Neg(rest));
      else if (coeff < 0) terms.push(Neg(Mul([Num(-coeff), rest])));  // match simpMul's sign convention
      else terms.push(Mul([Num(coeff), rest]));
    }
    if (Math.abs(constSum) > 1e-12 || terms.length === 0) terms.push(ratNode(constSum));
    if (terms.length === 1) return terms[0];
    return Add(terms);
  }

  /* ----- factor "bag": decompose a product/quotient into coeff × Π base^exp,
     supporting numeric and symbolic exponents and signed (denominator) powers.
     This is what lets 3·(3x)⁻¹ reduce to 1/x and x·(1/x) reduce to 1. ----- */
  function addFactor(bag, base, exp) {    // multiply bag by base^exp (exp: number)
    if (base.t === 'num') {
      if (Number.isInteger(exp)) { bag.coeff *= Math.pow(base.v, exp); return; }
      // non-integer power of a number (e.g. 2^(1/2)) — keep symbolic, fall through
    } else if (base.t === 'neg') {
      if (Number.isInteger(exp)) { bag.coeff *= (exp % 2 === 0 ? 1 : -1); addFactor(bag, base.arg, exp); return; }
    } else if (base.t === 'mul') {
      base.args.forEach(a => addFactor(bag, a, exp)); return;
    } else if (base.t === 'div') {
      addFactor(bag, base.num, exp); addFactor(bag, base.den, -exp); return;
    } else if (base.t === 'pow') {
      const ev = numericValue(base.exp);
      if (ev != null) { addFactor(bag, base.base, exp * ev); return; }
      const k = 'sym:' + canon(base.base);      // symbolic exponent — keep separate
      const e = bag.map.get(k) || { base: base.base, exp: 0, sym: [] };
      e.sym.push(exp === 1 ? base.exp : Mul([Num(exp), base.exp]));
      bag.map.set(k, e); return;
    }
    const k = canon(base);
    const e = bag.map.get(k) || { base, exp: 0, sym: [] };
    e.exp += exp;
    bag.map.set(k, e);
  }

  function rationalize(c) {              // best-effort number -> {p, q}
    if (Number.isInteger(c)) return { p: c, q: 1 };
    for (let q = 2; q <= 1000; q++) {
      const p = c * q;
      if (Math.abs(p - Math.round(p)) < 1e-9) return { p: Math.round(p), q };
    }
    return { p: c, q: 1 };
  }

  function makeProduct(coeff, factors) {
    if (coeff === 0) return ZERO;
    if (coeff < 0) return Neg(makeProduct(-coeff, factors));   // pull sign out front
    if (!factors.length) return Num(coeff);
    if (coeff === 1) return factors.length === 1 ? factors[0] : Mul(factors);
    return Mul([Num(coeff), ...factors]);
  }

  function buildFromBag(bag) {
    if (bag.coeff === 0) return ZERO;
    const numF = [], denF = [];
    for (const { base, exp, sym } of bag.map.values()) {
      if (sym.length) {                 // symbolic exponent → keep in numerator
        const te = simplify(Add([Num(exp), ...sym]));
        if (numEq(te, 0)) continue;
        numF.push(numEq(te, 1) ? base : Pow(base, te));
        continue;
      }
      if (exp === 0) continue;
      if (exp > 0) numF.push(exp === 1 ? base : Pow(base, ratNode(exp)));
      else         denF.push(exp === -1 ? base : Pow(base, ratNode(-exp)));
    }
    const byCanon = (a, b) => (canon(a) < canon(b) ? -1 : 1);
    numF.sort(byCanon); denF.sort(byCanon);

    let { p, q } = rationalize(bag.coeff);
    if (q < 0) { p = -p; q = -q; }
    const g = (Number.isInteger(p) && Number.isInteger(q)) ? (gcd(p, q) || 1) : 1;
    p /= g; q /= g;

    const numNode = makeProduct(p, numF);
    if (q === 1 && !denF.length) return numNode;
    const denNode = makeProduct(q, denF);
    return Div(numNode, denNode);
  }

  function simpMul(rawArgs) {
    const bag = { coeff: 1, map: new Map() };
    rawArgs.forEach(a => addFactor(bag, a, 1));
    return buildFromBag(bag);
  }

  function simpPow(base, exp) {
    if (numEq(exp, 0)) return ONE;
    if (numEq(exp, 1)) return base;
    if (numEq(base, 1)) return ONE;
    if (numEq(base, 0)) return ZERO;
    if (base.t === 'num' && exp.t === 'num' && Number.isInteger(exp.v)) {
      const v = Math.pow(base.v, exp.v);
      if (Number.isFinite(v) && Math.abs(v) < 1e15) return Num(v);
    }
    if (base.t === 'pow') return simpPow(base.base, simplify(Mul([base.exp, exp])));
    return Pow(base, exp);
  }

  function simpDiv(num, den) {
    if (numEq(num, 0)) return ZERO;
    if (numEq(den, 0)) return Div(num, den);          // leave undefined form visible
    const bag = { coeff: 1, map: new Map() };
    addFactor(bag, num, 1);
    addFactor(bag, den, -1);
    return buildFromBag(bag);                          // cancels common factors & reduces
  }

  function simpFunc(name, arg) {
    if (arg.t === 'num') {
      const v = applyFunc(name, arg.v);
      // fold only when it lands on a clean value (keeps output exact, not noisy)
      if (Number.isFinite(v) && (Number.isInteger(v) || name === 'sqrt')) {
        if (name === 'sqrt' && Number.isInteger(v)) return Num(v);
        if (name !== 'sqrt') return Num(v);
      }
    }
    if (name === 'ln') {
      if (arg.t === 'const' && arg.name === 'e') return ONE;
      if (numEq(arg, 1)) return ZERO;
    }
    if (name === 'exp' && numEq(arg, 0)) return ONE;
    return Func(name, arg);
  }

  /* ========================================================================
     DIFFERENTIATION  (returns derivative AST; pushes rule-by-rule steps)
     Each step: { rule, note, latex } where latex shows  d/dx[before] = after,
     leaving sub-derivatives as d/dx[...] placeholders that later steps resolve.
     ===================================================================== */
  function ddTex(node, x) { return '\\frac{d}{d' + x + '}\\!\\left[' + toLatex(node, x) + '\\right]'; }

  function pushStep(steps, x, node, rule, afterLatex, note) {
    steps.push({ rule, note: note || '', latex: ddTex(node, x) + ' = ' + afterLatex });
  }

  // derivative outer table for chain rule (returns AST for d/du[f(u)])
  function outerDeriv(name, u) {
    switch (name) {
      case 'sin':  return Func('cos', u);
      case 'cos':  return Neg(Func('sin', u));
      case 'tan':  return Pow(Func('sec', u), TWO);
      case 'sec':  return Mul([Func('sec', u), Func('tan', u)]);
      case 'csc':  return Neg(Mul([Func('csc', u), Func('cot', u)]));
      case 'cot':  return Neg(Pow(Func('csc', u), TWO));
      case 'asin': return Div(ONE, Func('sqrt', Add([ONE, Neg(Pow(u, TWO))])));
      case 'acos': return Neg(Div(ONE, Func('sqrt', Add([ONE, Neg(Pow(u, TWO))]))));
      case 'atan': return Div(ONE, Add([ONE, Pow(u, TWO)]));
      case 'sinh': return Func('cosh', u);
      case 'cosh': return Func('sinh', u);
      case 'tanh': return Div(ONE, Pow(Func('cosh', u), TWO));
      case 'ln':   return Div(ONE, u);
      case 'log':  return Div(ONE, Mul([u, Func('ln', Num(10))]));
      case 'exp':  return Func('exp', u);
      case 'sqrt': return Div(ONE, Mul([TWO, Func('sqrt', u)]));
      case 'abs':  return Div(u, Func('abs', u));   // d/dx|u| = u/|u| (sign), u≠0
      default:     return null;
    }
  }

  function diff(node, x, steps) {
    switch (node.t) {
      case 'num':
      case 'const':
        pushStep(steps, x, node, 'Constant rule', '0',
          'The derivative of a constant is 0.');
        return ZERO;

      case 'var':
        if (node.name === x) {
          pushStep(steps, x, node, 'Variable', '1',
            'The derivative of ' + x + ' with respect to ' + x + ' is 1.');
          return ONE;
        }
        pushStep(steps, x, node, 'Constant rule', '0',
          node.name + ' is constant with respect to ' + x + '.');
        return ZERO;

      case 'neg': {
        pushStep(steps, x, node, 'Constant multiple', '-' + ddTex(node.arg, x),
          'Pull the −1 out front.');
        return Neg(diff(node.arg, x, steps));
      }

      case 'add': {
        const after = node.args
          .map(a => (a.t === 'neg' ? '-' + ddTex(a.arg, x) : ddTex(a, x)))
          .join(' + ').replace(/\+ -/g, '-');
        pushStep(steps, x, node, 'Sum rule', after,
          'Differentiate each term separately.');
        return Add(node.args.map(a => diff(a, x, steps)));
      }

      case 'div': {
        const { num: u, den: v } = node;
        const ut = wrap(u, x, 2), vt = wrap(v, x, 2);
        const after = '\\frac{' + ddTex(u, x) + '\\,' + vt +
                      ' - ' + ut + '\\,' + ddTex(v, x) +
                      '}{\\left(' + toLatex(v, x) + '\\right)^{2}}';
        pushStep(steps, x, node, 'Quotient rule', after,
          "(u/v)' = (u'v − uv') / v².");
        const du = diff(u, x, steps);
        const dv = diff(v, x, steps);
        return Div(
          Add([Mul([du, v]), Neg(Mul([u, dv]))]),
          Pow(v, TWO)
        );
      }

      case 'mul': {
        // constant-multiple shortcut: numeric coefficient × single non-constant
        const consts = node.args.filter(a => !dependsOn(a, x));
        const vars   = node.args.filter(a =>  dependsOn(a, x));
        if (consts.length && vars.length) {
          const cNode = consts.length === 1 ? consts[0] : Mul(consts);
          const gNode = vars.length === 1 ? vars[0] : Mul(vars);
          pushStep(steps, x, node, 'Constant multiple',
            toLatex(cNode, x) + '\\cdot ' + ddTex(gNode, x),
            'Constant factors come along for the ride.');
          return Mul([cNode, diff(gNode, x, steps)]);
        }
        // genuine product rule (fold to two factors: first × rest)
        const f = node.args[0];
        const g = node.args.length === 2 ? node.args[1] : Mul(node.args.slice(1));
        const ft = wrap(f, x, 2), gt = wrap(g, x, 2);
        const after = ddTex(f, x) + '\\cdot ' + gt +
                      ' + ' + ft + '\\cdot ' + ddTex(g, x);
        pushStep(steps, x, node, 'Product rule', after, "(fg)' = f'g + fg'.");
        const df = diff(f, x, steps);
        const dg = diff(g, x, steps);
        return Add([Mul([df, g]), Mul([f, dg])]);
      }

      case 'pow': {
        const base = node.base, exp = node.exp;
        const baseHasX = dependsOn(base, x);
        const expHasX  = dependsOn(exp, x);

        if (!baseHasX && !expHasX) {
          pushStep(steps, x, node, 'Constant rule', '0',
            'No ' + x + ' present — derivative is 0.');
          return ZERO;
        }

        if (baseHasX && !expHasX) {                    // power rule (+ chain)
          const nNode = simplify(exp);
          const nMinus1 = isNum(nNode) ? Num(nNode.v - 1) : simplify(Add([nNode, Num(-1)]));
          const powTex = (coefTex, baseTex) =>
            numEq(nMinus1, 0) ? coefTex
              : numEq(nMinus1, 1) ? coefTex + baseTex
                : coefTex + baseTex + '^{' + toLatex(nMinus1, x) + '}';
          if (base.t === 'var' && base.name === x) {
            pushStep(steps, x, node, 'Power rule',
              powTex(toLatex(nNode, x), x),
              "Bring the exponent down, subtract one: (xⁿ)' = n·xⁿ⁻¹.");
            return Mul([nNode, Pow(base, nMinus1)]);
          }
          // chain: base is a function of x
          const after = powTex(toLatex(nNode, x), '\\left(' + toLatex(base, x) + '\\right)') +
                        '\\cdot ' + ddTex(base, x);
          pushStep(steps, x, node, 'Power rule + chain rule', after,
            "(uⁿ)' = n·uⁿ⁻¹·u'.");
          const dbase = diff(base, x, steps);
          return Mul([nNode, Pow(base, nMinus1), dbase]);
        }

        if (!baseHasX && expHasX) {                    // exponential rule
          if (base.t === 'const' && base.name === 'e') {
            pushStep(steps, x, node, 'Exponential rule',
              'e^{' + toLatex(exp, x) + '}\\cdot ' + ddTex(exp, x),
              "(eᵘ)' = eᵘ·u'.");
            const dexp = diff(exp, x, steps);
            return Mul([Pow(base, exp), dexp]);
          }
          pushStep(steps, x, node, 'Exponential rule',
            toLatex(base, x) + '^{' + toLatex(exp, x) + '}\\ln\\!\\left(' +
            toLatex(base, x) + '\\right)\\cdot ' + ddTex(exp, x),
            "(aᵘ)' = aᵘ·ln(a)·u'.");
          const dexp = diff(exp, x, steps);
          return Mul([Pow(base, exp), Func('ln', base), dexp]);
        }

        // both depend on x -> logarithmic differentiation
        pushStep(steps, x, node, 'Logarithmic differentiation',
          toLatex(node, x) + '\\left(' + ddTex(exp, x) + '\\ln\\!\\left(' +
          toLatex(base, x) + '\\right) + ' + toLatex(exp, x) + '\\cdot\\frac{' +
          ddTex(base, x) + '}{' + toLatex(base, x) + '}\\right)',
          "(f^g)' = f^g · (g'·ln f + g·f'/f).");
        const dbase = diff(base, x, steps);
        const dexp  = diff(exp, x, steps);
        return Mul([
          Pow(base, exp),
          Add([
            Mul([dexp, Func('ln', base)]),
            Mul([exp, Div(dbase, base)])
          ])
        ]);
      }

      case 'func': {
        const u = node.arg;
        const outer = outerDeriv(node.name, u);
        if (!outer) throw new ParseError("Can't differentiate function '" + node.name + "'.");
        const argIsVar = u.t === 'var' && u.name === x;
        if (argIsVar) {
          pushStep(steps, x, node, 'Derivative of ' + prettyFuncName(node.name),
            toLatex(outer, x),
            'Standard derivative.');
          return outer;
        }
        pushStep(steps, x, node, 'Chain rule',
          toLatex(outer, x) + '\\cdot ' + ddTex(u, x),
          "Differentiate the outer function, then multiply by the inner derivative u'.");
        const du = diff(u, x, steps);
        return Mul([outer, du]);
      }
    }
    throw new ParseError('Unsupported expression.');
  }

  function prettyFuncName(n) {
    return ({ asin:'arcsin', acos:'arccos', atan:'arctan' }[n]) || n;
  }

  /* ========================================================================
     SERIALIZERS
     ===================================================================== */
  // precedence: add=1, mul=2, neg=2, pow=3, atom=4
  function prec(n) {
    switch (n.t) {
      case 'add': return 1;
      case 'mul': return 2;
      case 'neg': return 2;
      case 'div': return 4;   // rendered as a fraction; no surrounding parens needed
      case 'pow': return 3;
      default:    return 4;
    }
  }

  function fmt(v) {
    if (Number.isInteger(v)) return String(v);
    return String(Number(v.toPrecision(10)));
  }

  function constTex(name) { return name === 'pi' ? '\\pi' : 'e'; }

  function wrap(n, x, minPrec) {
    const s = toLatex(n, x);
    return prec(n) < minPrec ? '\\left(' + s + '\\right)' : s;
  }

  function toLatex(n, x) {
    x = x || 'x';
    switch (n.t) {
      case 'num':   return fmt(n.v);
      case 'var':   return n.name;
      case 'const': return constTex(n.name);
      case 'neg':   return '-' + wrap(n.arg, x, 2);
      case 'div':   return '\\dfrac{' + toLatex(n.num, x) + '}{' + toLatex(n.den, x) + '}';
      case 'add': {
        let s = toLatex(n.args[0], x);
        for (let i = 1; i < n.args.length; i++) {
          const a = n.args[i];
          if (a.t === 'neg') s += ' - ' + wrap(a.arg, x, 2);
          else if (a.t === 'num' && a.v < 0) s += ' - ' + fmt(-a.v);
          else s += ' + ' + wrap(a, x, 1);
        }
        return s;
      }
      case 'mul': {
        const parts = n.args.map(a => wrap(a, x, 2));
        let s = '';
        for (let i = 0; i < parts.length; i++) {
          if (i === 0) { s = parts[i]; continue; }
          // insert \cdot only when juxtaposition would be ambiguous (digit meets digit)
          const needDot = /[0-9]$/.test(s) && /^[0-9]/.test(parts[i]);
          s += (needDot ? '\\cdot ' : ' ') + parts[i];
        }
        return s;
      }
      case 'pow': {
        const b = (n.base.t === 'func') ? toLatex(n.base, x) : wrap(n.base, x, 4);
        // render a rational exponent inline (a/b) — \dfrac is oversized in a superscript
        const e = n.exp;
        const et = (e.t === 'div' && e.num.t === 'num' && e.den.t === 'num')
          ? fmt(e.num.v) + '/' + fmt(e.den.v)
          : toLatex(e, x);
        return b + '^{' + et + '}';
      }
      case 'func': {
        if (n.name === 'sqrt') return '\\sqrt{' + toLatex(n.arg, x) + '}';
        if (n.name === 'exp')  return 'e^{' + toLatex(n.arg, x) + '}';
        if (n.name === 'abs')  return '\\left|' + toLatex(n.arg, x) + '\\right|';
        const cmd = FUNCS[n.name] || ('\\operatorname{' + n.name + '}');
        return cmd + '\\!\\left(' + toLatex(n.arg, x) + '\\right)';
      }
    }
    return '';
  }

  function toText(n, x) {
    x = x || 'x';
    const wrapT = (m, mp) => { const s = toText(m, x); return prec(m) < mp ? '(' + s + ')' : s; };
    switch (n.t) {
      case 'num':   return fmt(n.v);
      case 'var':   return n.name;
      case 'const': return n.name === 'pi' ? 'pi' : 'e';
      case 'neg':   return '-' + wrapT(n.arg, 2);
      case 'div':   return wrapT(n.num, 2) + '/' + wrapT(n.den, 3);
      case 'add': {
        let s = toText(n.args[0], x);
        for (let i = 1; i < n.args.length; i++) {
          const a = n.args[i];
          if (a.t === 'neg') s += ' - ' + wrapT(a.arg, 2);
          else if (a.t === 'num' && a.v < 0) s += ' - ' + fmt(-a.v);
          else s += ' + ' + wrapT(a, 1);
        }
        return s;
      }
      case 'mul':   return n.args.map(a => wrapT(a, 2)).join('*');
      case 'pow': {
        const et = (n.exp.t === 'div' || n.exp.t === 'add' || n.exp.t === 'neg')
          ? '(' + toText(n.exp, x) + ')' : wrapT(n.exp, 4);
        return wrapT(n.base, 4) + '^' + et;
      }
      case 'func':  return prettyFuncName(n.name) + '(' + toText(n.arg, x) + ')';
    }
    return '';
  }

  /* ========================================================================
     NUMERIC EVALUATION
     ===================================================================== */
  function applyFunc(name, v) {
    switch (name) {
      case 'sin': return Math.sin(v);
      case 'cos': return Math.cos(v);
      case 'tan': return Math.tan(v);
      case 'sec': return 1 / Math.cos(v);
      case 'csc': return 1 / Math.sin(v);
      case 'cot': return 1 / Math.tan(v);
      case 'asin': return Math.asin(v);
      case 'acos': return Math.acos(v);
      case 'atan': return Math.atan(v);
      case 'sinh': return Math.sinh(v);
      case 'cosh': return Math.cosh(v);
      case 'tanh': return Math.tanh(v);
      case 'ln':  return Math.log(v);
      case 'log': return Math.log10(v);
      case 'exp': return Math.exp(v);
      case 'sqrt': return Math.sqrt(v);
      case 'abs': return Math.abs(v);
    }
    return NaN;
  }

  function evalNode(n, x, val) {
    switch (n.t) {
      case 'num':   return n.v;
      case 'const': return n.name === 'pi' ? Math.PI : Math.E;
      case 'var':   return n.name === x ? val : NaN;
      case 'neg':   return -evalNode(n.arg, x, val);
      case 'add':   return n.args.reduce((s, a) => s + evalNode(a, x, val), 0);
      case 'mul':   return n.args.reduce((p, a) => p * evalNode(a, x, val), 1);
      case 'div':   return evalNode(n.num, x, val) / evalNode(n.den, x, val);
      case 'pow':   return Math.pow(evalNode(n.base, x, val), evalNode(n.exp, x, val));
      case 'func':  return applyFunc(n.name, evalNode(n.arg, x, val));
    }
    return NaN;
  }

  /* ========================================================================
     SHARED HELPERS for integration & limits
     ===================================================================== */
  const D = (node, x) => simplify(diff(node, x, []));      // stepless derivative

  function substitute(node, target, repl) {
    if (canon(node) === canon(target)) return repl;
    switch (node.t) {
      case 'neg':  return Neg(substitute(node.arg, target, repl));
      case 'add':  return Add(node.args.map(a => substitute(a, target, repl)));
      case 'mul':  return Mul(node.args.map(a => substitute(a, target, repl)));
      case 'div':  return Div(substitute(node.num, target, repl), substitute(node.den, target, repl));
      case 'pow':  return Pow(substitute(node.base, target, repl), substitute(node.exp, target, repl));
      case 'func': return Func(node.name, substitute(node.arg, target, repl));
      default:     return node;
    }
  }

  /* If node is linear in x (a·x + b with a,b constant), return {a, b} nodes. */
  function asLinear(node, x) {
    const a = D(node, x);
    if (dependsOn(a, x)) return null;
    const b = simplify(Add([node, Neg(Mul([a, Var(x)]))]));
    if (dependsOn(b, x)) return null;
    return { a, b };
  }

  /* ========================================================================
     INTEGRATION
     integrate(node, x, depth) -> { node, steps } | null  (antiderivative, no +C)
     Steps are committed only on success, so failed strategies leave no trace.
     ===================================================================== */
  const intTex = (node, x) => '\\int ' + toLatex(node, x) + '\\,d' + x;

  function tableAntideriv(name, u) {            // ∫ f(u) d(u) for base functions
    switch (name) {
      case 'sin':  return Neg(Func('cos', u));
      case 'cos':  return Func('sin', u);
      case 'exp':  return Func('exp', u);
      case 'sinh': return Func('cosh', u);
      case 'cosh': return Func('sinh', u);
      case 'tan':  return Neg(Func('ln', Func('cos', u)));
      case 'cot':  return Func('ln', Func('sin', u));
      case 'sec':  return Func('ln', Add([Func('sec', u), Func('tan', u)]));
      case 'csc':  return Neg(Func('ln', Add([Func('csc', u), Func('cot', u)])));
      default:     return null;
    }
  }

  const isAlgebraic = (f, x) => dependsOn(f, x) &&
    (f.t === 'var' || (f.t === 'pow' && f.base.t === 'var' && f.base.name === x && f.exp.t === 'num'));
  const isExpTerm = (f, x) =>
    (f.t === 'func' && f.name === 'exp' && dependsOn(f.arg, x)) ||
    (f.t === 'pow' && !dependsOn(f.base, x) && dependsOn(f.exp, x));

  /* recognise a couple of standard non-elementary-looking forms */
  function trySpecial(node, x) {
    const n = simplify(node);
    if (n.t !== 'div') return null;
    const c = numericValue(n.num);
    if (c == null) return null;
    const den = n.den;
    // c / (x² + k), k > 0  ->  (c/√k)·arctan(x/√k)
    if (den.t === 'add') {
      let hasX2 = false, k = 0, ok = true;
      for (const t of den.args) {
        if (canon(t) === canon(Pow(Var(x), Num(2)))) hasX2 = true;
        else { const v = numericValue(t); if (v == null) ok = false; else k += v; }
      }
      if (hasX2 && ok && k > 0) {
        const sk = Math.sqrt(k);
        const inner = (Math.abs(sk - 1) < 1e-12) ? Var(x) : Div(Var(x), ratNode(sk));
        return { node: Mul([ratNode(c / sk), Func('atan', inner)]),
                 rule: 'Standard form', note: '∫ c/(x²+k) dx = (c/√k)·arctan(x/√k).' };
      }
    }
    // c / √(1 − x²)  ->  c·arcsin(x)
    if (den.t === 'func' && den.name === 'sqrt') {
      const s = simplify(Add([den.arg, Pow(Var(x), Num(2))]));
      if (numEq(s, 1)) return { node: Mul([Num(c), Func('asin', Var(x))]),
        rule: 'Standard form', note: '∫ c/√(1−x²) dx = c·arcsin(x).' };
    }
    return null;
  }

  function integrate(node, x, depth) {
    if (depth > 8) return null;
    node = simplify(node);
    const steps = [];
    const ok = (res) => ({ node: simplify(res), steps });

    // constant
    if (!dependsOn(node, x)) {
      steps.push({ rule: 'Constant rule', note: 'Integral of a constant.', latex: intTex(node, x) + ' = ' + toLatex(node, x) + x });
      return ok(Mul([node, Var(x)]));
    }

    // unary minus
    if (node.t === 'neg') {
      const c = integrate(node.arg, x, depth);
      if (!c) return null;
      steps.push(...c.steps);
      return ok(Neg(c.node));
    }

    // sum rule
    if (node.t === 'add') {
      const parts = [];
      for (const a of node.args) { const c = integrate(a, x, depth); if (!c) return null; parts.push(c); }
      steps.push({ rule: 'Sum rule', note: 'Integrate term by term.',
        latex: intTex(node, x) + ' = ' + node.args.map(a => intTex(a, x)).join(' + ').replace(/\+ \\int -/g, '- \\int ') });
      parts.forEach(p => steps.push(...p.steps));
      return ok(Add(parts.map(p => p.node)));
    }

    // pull constant factors out of a product
    if (node.t === 'mul') {
      const consts = node.args.filter(a => !dependsOn(a, x));
      const vars   = node.args.filter(a =>  dependsOn(a, x));
      if (consts.length && vars.length) {
        const cNode = consts.length === 1 ? consts[0] : Mul(consts);
        const gNode = vars.length === 1 ? vars[0] : Mul(vars);
        const c = integrate(gNode, x, depth);
        if (!c) return null;
        steps.push({ rule: 'Constant multiple', note: 'Pull constant factors outside the integral.',
          latex: intTex(node, x) + ' = ' + toLatex(cNode, x) + '\\!' + intTex(gNode, x) });
        steps.push(...c.steps);
        return ok(Mul([cNode, c.node]));
      }
    }

    // ∫ x dx
    if (node.t === 'var' && node.name === x) {
      const res = Div(Pow(Var(x), Num(2)), Num(2));
      steps.push({ rule: 'Power rule', note: '∫ xⁿ dx = xⁿ⁺¹/(n+1).', latex: intTex(node, x) + ' = ' + toLatex(res, x) });
      return ok(res);
    }

    // powers
    if (node.t === 'pow') {
      const base = node.base, exp = node.exp;
      const en = numericValue(exp);
      // x^n
      if (base.t === 'var' && base.name === x && en != null) {
        if (Math.abs(en + 1) < 1e-12) {
          const res = Func('ln', Func('abs', Var(x)));
          steps.push({ rule: 'Reciprocal rule', note: '∫ x⁻¹ dx = ln|x|.', latex: intTex(node, x) + ' = ' + toLatex(res, x) });
          return ok(res);
        }
        const res = Div(Pow(Var(x), ratNode(en + 1)), ratNode(en + 1));
        steps.push({ rule: 'Power rule', note: '∫ xⁿ dx = xⁿ⁺¹/(n+1).', latex: intTex(node, x) + ' = ' + toLatex(res, x) });
        return ok(res);
      }
      // e^(linear)  and  a^(linear)
      if (!dependsOn(base, x)) {
        const lin = asLinear(exp, x);
        if (lin) {
          let res;
          if (base.t === 'const' && base.name === 'e') res = Div(node, lin.a);
          else res = Div(node, Mul([lin.a, Func('ln', base)]));
          steps.push({ rule: 'Exponential rule', note: 'Linear substitution u = ' + toText(exp, x) + '.',
            latex: intTex(node, x) + ' = ' + toLatex(simplify(res), x) });
          return ok(res);
        }
      }
      // (linear)^n
      if (en != null && Math.abs(en + 1) > 1e-12) {
        const lin = asLinear(base, x);
        if (lin) {
          const res = Div(Pow(base, ratNode(en + 1)), Mul([ratNode(en + 1), lin.a]));
          steps.push({ rule: 'Power rule + linear substitution', note: 'u = ' + toText(base, x) + ', du = ' + toText(lin.a, x) + ' dx.',
            latex: intTex(node, x) + ' = ' + toLatex(simplify(res), x) });
          return ok(res);
        }
      }
      // (linear)^(-1)
      if (en != null && Math.abs(en + 1) < 1e-12) {
        const lin = asLinear(base, x);
        if (lin) {
          const res = Div(Func('ln', Func('abs', base)), lin.a);
          steps.push({ rule: 'Reciprocal + linear substitution', note: 'u = ' + toText(base, x) + '.',
            latex: intTex(node, x) + ' = ' + toLatex(simplify(res), x) });
          return ok(res);
        }
      }
    }

    // functions
    if (node.t === 'func') {
      const arg = node.arg;
      if (node.name === 'sqrt') {                 // ∫ √u  →  ∫ u^(1/2)
        const c = integrate(Pow(arg, ratNode(0.5)), x, depth);
        if (c) { steps.push(...c.steps); return ok(c.node); }
      }
      if (arg.t === 'var' && arg.name === x) {
        const F = tableAntideriv(node.name, arg);
        if (F) {
          steps.push({ rule: 'Standard integral', note: 'From the table of antiderivatives.', latex: intTex(node, x) + ' = ' + toLatex(F, x) });
          return ok(F);
        }
      }
      const lin = asLinear(arg, x);
      if (lin) {
        const F = tableAntideriv(node.name, arg);
        if (F) {
          const res = Div(F, lin.a);
          steps.push({ rule: 'Linear substitution', note: 'u = ' + toText(arg, x) + ', du = ' + toText(lin.a, x) + ' dx.',
            latex: intTex(node, x) + ' = ' + toLatex(simplify(res), x) });
          return ok(res);
        }
      }
    }

    // division
    if (node.t === 'div') {
      const p = node.num, q = node.den;
      // constant denominator -> constant multiple
      if (!dependsOn(q, x)) {
        const c = integrate(p, x, depth);
        if (c) {
          steps.push({ rule: 'Constant multiple', note: 'Constant in the denominator.',
            latex: intTex(node, x) + ' = \\dfrac{1}{' + toLatex(q, x) + '}' + intTex(p, x) });
          steps.push(...c.steps);
          return ok(Div(c.node, q));
        }
      }
      // standard arctan / arcsin forms
      const sp = trySpecial(node, x);
      if (sp) { steps.push({ rule: sp.rule, note: sp.note, latex: intTex(node, x) + ' = ' + toLatex(sp.node, x) }); return ok(sp.node); }
      // c / (linear) and c / (linear)^n  (handled directly so simplify can't fold x⁻¹ back into a quotient loop)
      if (!dependsOn(p, x)) {
        const lin = asLinear(q, x);
        if (lin) {
          const res = Div(Mul([p, Func('ln', Func('abs', q))]), lin.a);
          steps.push({ rule: 'Reciprocal rule', note: 'u = ' + toText(q, x) + ', du = ' + toText(lin.a, x) + ' dx; ∫ du/u = ln|u|.',
            latex: intTex(node, x) + ' = ' + toLatex(simplify(res), x) });
          return ok(res);
        }
        if (q.t === 'pow') {
          const en = numericValue(q.exp), ql = asLinear(q.base, x);
          if (en != null && ql && Math.abs(en - 1) > 1e-12) {
            const res = Div(Mul([p, Pow(q.base, ratNode(1 - en))]), Mul([ratNode(1 - en), ql.a]));
            steps.push({ rule: 'Power rule + linear substitution', note: 'Rewrite 1/uⁿ as u⁻ⁿ.',
              latex: intTex(node, x) + ' = ' + toLatex(simplify(res), x) });
            return ok(res);
          }
        }
      }
      // otherwise fall through to the shared u-sub / by-parts below
    }

    // general u-substitution
    const us = tryUSub(node, x, depth);
    if (us) { steps.push(...us.steps); return ok(us.node); }

    // integration by parts
    const bp = tryByParts(node, x, depth);
    if (bp) { steps.push(...bp.steps); return ok(bp.node); }

    return null;
  }

  function collectSubCandidates(node, x, acc) {
    switch (node.t) {
      case 'func':
        if (dependsOn(node, x)) acc.push(node);            // whole, e.g. u = sin(x) for ∫sin·cos
        if (dependsOn(node.arg, x)) acc.push(node.arg);    // inner, e.g. u = x² in sin(x²)
        collectSubCandidates(node.arg, x, acc); break;
      case 'pow':
        if (dependsOn(node.base, x) && !(node.base.t === 'var' && node.base.name === x)) acc.push(node.base);
        if (dependsOn(node.exp, x)) acc.push(node.exp);    // e^(g(x)) -> u = g(x)
        collectSubCandidates(node.base, x, acc); collectSubCandidates(node.exp, x, acc); break;
      case 'div':
        if (dependsOn(node.den, x)) acc.push(node.den);
        collectSubCandidates(node.num, x, acc); collectSubCandidates(node.den, x, acc); break;
      case 'add': case 'mul': node.args.forEach(a => collectSubCandidates(a, x, acc)); break;
      case 'neg': collectSubCandidates(node.arg, x, acc); break;
    }
  }

  function tryUSub(node, x, depth) {
    if (depth > 6) return null;
    const cands = [];
    collectSubCandidates(node, x, cands);
    const seen = new Set();
    const U = (x === 'u') ? 'w' : 'u';
    for (const u of cands) {
      const key = canon(u);
      if (seen.has(key)) continue; seen.add(key);
      if (u.t === 'var') continue;                          // trivial
      const du = D(u, x);
      if (numEq(du, 0)) continue;
      const rest = simplify(Div(node, du));
      const restU = substitute(rest, u, Var(U));
      if (dependsOn(restU, x)) continue;                    // not purely a function of u
      const inner = integrate(restU, U, depth + 1);
      if (!inner) continue;
      const F = simplify(substitute(inner.node, Var(U), u));
      const steps = [{
        rule: 'u-substitution',
        note: 'Let u = ' + toText(u, x) + ', so du = ' + toText(du, x) + ' dx.',
        latex: intTex(node, x) + ' = \\int ' + toLatex(restU, U) + '\\,d' + U
      }];
      steps.push(...inner.steps.map(s => ({ ...s })));
      steps.push({ rule: 'Substitute back', note: 'Replace u with ' + toText(u, x) + '.',
        latex: '= ' + toLatex(F, x) });
      return { node: F, steps };
    }
    return null;
  }

  function tryByParts(node, x, depth) {
    if (depth > 5) return null;
    const factors = (node.t === 'mul') ? node.args.slice() : [node];
    if (!factors.some(f => dependsOn(f, x))) return null;
    const score = (f) => {
      if (f.t === 'func' && (f.name === 'ln' || f.name === 'log')) return 5;   // Log
      if (f.t === 'func' && /^(asin|acos|atan)$/.test(f.name)) return 4;        // Inverse trig
      if (isAlgebraic(f, x)) return 3;                                          // Algebraic
      if (f.t === 'func' && /^(sin|cos|tan|sec|csc|cot)$/.test(f.name)) return 2; // Trig
      if (isExpTerm(f, x)) return 1;                                            // Exp
      return 0;
    };
    let ui = -1, best = -1;
    factors.forEach((f, i) => { const s = score(f); if (s > best) { best = s; ui = i; } });
    if (ui < 0 || best === 0) return null;
    const u = factors[ui];
    const dvFactors = factors.filter((_, i) => i !== ui);
    const dv = dvFactors.length ? (dvFactors.length === 1 ? dvFactors[0] : Mul(dvFactors)) : Num(1);
    const vRes = integrate(dv, x, depth + 1);
    if (!vRes) return null;
    const v = vRes.node;
    const du = D(u, x);
    const remaining = integrate(simplify(Mul([v, du])), x, depth + 1);
    if (!remaining) return null;                            // e.g. cyclic ∫eˣsin x — bail gracefully
    const result = Add([Mul([u, v]), Neg(remaining.node)]);
    const steps = [{
      rule: 'Integration by parts',
      note: 'u = ' + toText(u, x) + ', dv = ' + toText(dv, x) + ' dx  ⇒  du = ' + toText(du, x) + ' dx, v = ' + toText(v, x) + '.',
      latex: intTex(node, x) + ' = ' + toLatex(simplify(Mul([u, v])), x) + ' - ' + intTex(simplify(Mul([v, du])), x)
    }];
    steps.push(...vRes.steps, ...remaining.steps);
    return { node: simplify(result), steps };
  }

  /* Simpson's rule — deterministic numeric fallback for definite integrals. */
  function simpson(f, x, a, b, n) {
    if (n % 2) n++;
    const h = (b - a) / n;
    let s = evalNode(f, x, a) + evalNode(f, x, b);
    for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * evalNode(f, x, a + i * h);
    return (h / 3) * s;
  }

  /* ========================================================================
     LIMITS
     ===================================================================== */
  function parsePoint(str) {
    const s = String(str).trim().toLowerCase().replace(/\s+/g, '');
    if (/^[+]?(inf|infinity|∞|oo)$/.test(s)) return { kind: 'inf', sign: 1 };
    if (/^-(inf|infinity|∞|oo)$/.test(s))    return { kind: 'inf', sign: -1 };
    const node = parse(str);
    const v = evalNode(node, ' ', 0);
    if (!Number.isFinite(v)) throw new ParseError('Enter a number, or ∞ / -∞, for the approach point.');
    return { kind: 'finite', val: v, node: simplify(node) };
  }

  const limTex = (f, x, point) => {
    const p = point.kind === 'inf' ? (point.sign < 0 ? '-\\infty' : '\\infty') : toLatex(point.node, x);
    return '\\lim_{' + x + ' \\to ' + p + '} ' + toLatex(f, x);
  };

  const snapNum = (v) => {
    if (Math.abs(v) < 1e-6) return 0;
    const r = Math.round(v);
    if (Math.abs(v - r) <= 1e-4 * (1 + Math.abs(v))) return r;
    return v;
  };

  function classify(vals) {
    const v = vals.filter(Number.isFinite);
    if (v.length < 2) {
      const inf = vals.find(z => z === Infinity || z === -Infinity);
      if (inf !== undefined) return { kind: 'inf', sign: inf > 0 ? 1 : -1 };
      return { kind: 'dne' };
    }
    const last = v[v.length - 1], prev = v[v.length - 2];
    if (Math.abs(last - prev) <= 1e-3 * (1 + Math.abs(last))) return { kind: 'value', value: snapNum(last) };
    if (Math.abs(last) > 1e4 && Math.abs(last) >= Math.abs(prev)) return { kind: 'inf', sign: Math.sign(last) };
    return { kind: 'dne' };
  }

  function estimateLimit(f, x, point, dir) {
    const at = v => evalNode(f, x, v);
    if (point.kind === 'inf') {
      const out = [];
      for (let k = 1; k <= 8; k++) out.push(at(point.sign * Math.pow(10, k)));
      return classify(out);
    }
    const a = point.val, right = [], left = [];
    for (let k = 1; k <= 7; k++) { const h = Math.pow(10, -k); right.push(at(a + h)); left.push(at(a - h)); }
    if (dir === 'right') return classify(right);
    if (dir === 'left')  return classify(left);
    const R = classify(right), L = classify(left);
    if (R.kind === 'value' && L.kind === 'value')
      return (Math.abs(R.value - L.value) <= 1e-6 * (1 + Math.abs(R.value)))
        ? { kind: 'value', value: (R.value + L.value) / 2 } : { kind: 'dne', reason: 'left ≠ right' };
    if (R.kind === 'inf' && L.kind === 'inf')
      return R.sign === L.sign ? { kind: 'inf', sign: R.sign } : { kind: 'dne', reason: 'sign differs' };
    return { kind: 'dne' };
  }

  function limitSymbolic(f, x, point, dir, depth, steps) {
    f = simplify(f);
    if (point.kind === 'finite') {
      const a = point.val;
      if (f.t === 'div') {
        const nu = evalNode(f.num, x, a), de = evalNode(f.den, x, a);
        const indet = (Math.abs(nu) < 1e-9 && Math.abs(de) < 1e-9) ? '0/0'
          : (!Number.isFinite(nu) && !Number.isFinite(de)) ? '∞/∞' : null;
        if (indet && depth < 6) {
          const nf = Div(D(f.num, x), D(f.den, x));
          steps.push({ rule: "L'Hôpital's Rule", note: 'Indeterminate form ' + indet + ': differentiate top and bottom.',
            latex: limTex(f, x, point) + ' = ' + limTex(simplify(nf), x, point) });
          return limitSymbolic(nf, x, point, dir, depth + 1, steps);
        }
      }
      const fa = evalNode(f, x, a);
      if (Number.isFinite(fa)) {
        const exact = simplify(substitute(f, Var(x), point.node));
        steps.push({ rule: 'Direct substitution', note: 'Continuous here — plug the value in.',
          latex: limTex(f, x, point) + ' = ' + toLatex(exact, x) });
        return { value: fa };
      }
      return null;
    }
    // infinity
    if (f.t === 'div' && depth < 6) {
      const big = point.sign * 1e6;
      const nu = evalNode(f.num, x, big), de = evalNode(f.den, x, big);
      if (!Number.isFinite(nu) && !Number.isFinite(de)) {
        const nf = Div(D(f.num, x), D(f.den, x));
        steps.push({ rule: "L'Hôpital's Rule", note: 'Indeterminate form ∞/∞ at infinity: differentiate top and bottom.',
          latex: limTex(f, x, point) + ' = ' + limTex(simplify(nf), x, point) });
        return limitSymbolic(nf, x, point, dir, depth + 1, steps);
      }
    }
    return null;
  }

  /* ========================================================================
     PUBLIC API
     ===================================================================== */
  function derivative(input, variable) {
    const x = (variable || 'x').trim() || 'x';
    let ast;
    try {
      ast = parse(input);
    } catch (e) {
      return { ok: false, error: e.message || 'Could not read that expression.', input, variable: x };
    }
    try {
      const steps = [];
      const rawDeriv = diff(ast, x, steps);
      const result = simplify(rawDeriv);
      return {
        ok: true,
        input,
        variable: x,
        inputLatex: toLatex(simplify(ast), x),
        resultLatex: toLatex(result, x),
        resultText: toText(result, x),
        steps
      };
    } catch (e) {
      return { ok: false, error: e.message || 'Could not differentiate that.', input, variable: x };
    }
  }

  function evaluate(input, variable, value) {
    try {
      const ast = parse(input);
      const v = evalNode(ast, (variable || 'x'), value);
      return Number.isFinite(v) ? v : null;
    } catch { return null; }
  }

  const fmtVal = (v) => Number.isFinite(v) ? fmt(Number(v.toPrecision(8))) : String(v);

  function integral(input, variable) {
    const x = (variable || 'x').trim() || 'x';
    let ast;
    try { ast = parse(input); }
    catch (e) { return { ok: false, error: e.message || 'Could not read that expression.', input, variable: x }; }
    try {
      const r = integrate(ast, x, 0);
      if (!r) return { ok: false, input, variable: x,
        error: 'No elementary antiderivative found with the current methods. Try rewriting it, or this one may need a technique beyond the tool.' };
      return {
        ok: true, input, variable: x,
        inputLatex: toLatex(simplify(ast), x),
        resultLatex: toLatex(r.node, x) + ' + C',
        resultText: toText(r.node, x) + ' + C',
        steps: r.steps
      };
    } catch (e) { return { ok: false, error: e.message || 'Could not integrate that.', input, variable: x }; }
  }

  function definiteIntegral(input, variable, aStr, bStr) {
    const x = (variable || 'x').trim() || 'x';
    let ast, a, b;
    try { ast = parse(input); a = parsePoint(aStr); b = parsePoint(bStr); }
    catch (e) { return { ok: false, error: e.message || 'Could not read the input.', input, variable: x }; }
    if (a.kind !== 'finite' || b.kind !== 'finite')
      return { ok: false, input, variable: x, error: 'Enter finite limits of integration (improper integrals aren’t supported yet).' };
    try {
      const r = integrate(ast, x, 0);
      if (r) {
        const F = r.node;
        const value = evalNode(F, x, b.val) - evalNode(F, x, a.val);
        const steps = r.steps.slice();
        steps.push({ rule: 'Fundamental Theorem of Calculus', note: 'Evaluate the antiderivative: F(b) − F(a).',
          latex: '\\left[' + toLatex(F, x) + '\\right]_{' + toLatex(a.node, x) + '}^{' + toLatex(b.node, x) + '} = ' + fmtVal(value) });
        return { ok: true, input, variable: x, antiderivLatex: toLatex(F, x) + ' + C',
          resultLatex: fmtVal(value), resultText: fmtVal(value), valueNumber: value, steps };
      }
      const value = simpson(ast, x, a.val, b.val, 1000);
      return { ok: true, numeric: true, input, variable: x,
        resultLatex: '\\approx ' + fmtVal(value), resultText: '≈ ' + fmtVal(value), valueNumber: value,
        steps: [{ rule: 'Numeric integration', note: 'No elementary antiderivative found; approximated with Simpson’s rule.',
          latex: '\\int_{' + toLatex(a.node, x) + '}^{' + toLatex(b.node, x) + '} ' + toLatex(simplify(ast), x) + '\\,d' + x + ' \\approx ' + fmtVal(value) }] };
    } catch (e) { return { ok: false, error: e.message || 'Could not evaluate that integral.', input, variable: x }; }
  }

  function limit(input, variable, pointStr, dir) {
    const x = (variable || 'x').trim() || 'x';
    dir = dir || 'both';
    let ast, point;
    try { ast = parse(input); point = parsePoint(pointStr); }
    catch (e) { return { ok: false, error: e.message || 'Could not read the input.', input, variable: x }; }
    try {
      const est = estimateLimit(ast, x, point, dir);
      const steps = [];
      const sym = limitSymbolic(ast, x, point, dir, 0, steps);

      // Prefer the rigorous symbolic value when it resolves (exact, and immune to
      // floating-point cancellation that can fool the numeric estimate).
      const answer = (sym && Number.isFinite(sym.value)) ? { kind: 'value', value: sym.value } : est;

      let resLatex, resText;
      if (answer.kind === 'value') { const n = ratNode(answer.value); resLatex = toLatex(n, x); resText = toText(n, x); }
      else if (answer.kind === 'inf') { resLatex = answer.sign < 0 ? '-\\infty' : '\\infty'; resText = answer.sign < 0 ? '-∞' : '∞'; }
      else { resLatex = '\\text{DNE}'; resText = 'does not exist'; }

      if (!steps.length) {
        const side = dir === 'both' ? 'both sides' : 'the ' + dir;
        steps.push({ rule: 'Numerical estimate', note: 'Evaluating the function as ' + x + ' approaches the point from ' + side + '.',
          latex: limTex(ast, x, point) + (answer.kind === 'dne' ? '\\;\\text{ does not exist}' : ' = ' + resLatex) });
      } else if (answer.kind !== 'dne') {
        steps.push({ rule: 'Result', note: '', latex: limTex(ast, x, point) + ' = ' + resLatex });
      }
      return { ok: true, input, variable: x, point: pointStr, direction: dir,
        inputLatex: toLatex(simplify(ast), x), resultLatex: resLatex, resultText: resText,
        exists: answer.kind !== 'dne', steps };
    } catch (e) { return { ok: false, error: e.message || 'Could not evaluate that limit.', input, variable: x }; }
  }

  const API = {
    derivative,
    integral,
    definiteIntegral,
    limit,
    evaluate,
    parse,
    simplify,
    toLatex: (ast, v) => toLatex(ast, v),
    toText: (ast, v) => toText(ast, v),
    ParseError
  };

  root.CalcEngine = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
