/* =========================================================================
   SkoolToolz — Genetics Engine  (Phase 4.3: Genetics / Punnett Square Solver)
   -------------------------------------------------------------------------
   A small, deterministic, dependency-free genetics engine. No AI, no
   network. Covers:
     - Monohybrid and dihybrid crosses (autosomal), built on one generic
       n-locus Punnett-square engine so both share the same tested code
       path.
     - Sex-linked (X-linked) crosses, which need separate gamete logic
       because males are hemizygous.
     - Basic pedigree analysis: checks a small family tree against the
       four classic Mendelian inheritance patterns (autosomal dominant/
       recessive, X-linked dominant/recessive) using standard textbook
       parent/child contradiction rules, and resolves each individual's
       genotype where the pedigree pins it down directly from an
       immediate parent or child. Genotypes the pedigree doesn't fully
       determine are reported as a labeled set of possibilities rather
       than a fabricated probability — full population-genetics
       (Hardy-Weinberg) inference is out of scope for "basic" analysis.
     - A self-contained chi-square goodness-of-fit calculator (expected
       vs. observed ratios) with a built-in critical-value table.
   Every function returns its result alongside a plain-text `steps` list
   so the UI can show work, not just an answer.
   ========================================================================= */
(function (root) {
  'use strict';

  // ---------- shared helpers ----------
  function upperFirst(a, b) {
    const au = a === a.toUpperCase(), bu = b === b.toUpperCase();
    if (au && !bu) return -1;
    if (!au && bu) return 1;
    return a < b ? -1 : (a > b ? 1 : 0);
  }
  function gcdInt(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; }
  function simplifyRatio(counts) {
    const nonzero = counts.filter(c => c > 0);
    if (!nonzero.length) return counts.slice();
    let g = nonzero[0];
    for (const c of nonzero) g = gcdInt(g, c);
    return counts.map(c => c / g);
  }
  function tally(arr) { const counts = {}; for (const x of arr) counts[x] = (counts[x] || 0) + 1; return counts; }
  function ratioFromCounts(counts) {
    const keys = Object.keys(counts);
    const nums = keys.map(k => counts[k]);
    const simplified = simplifyRatio(nums);
    return keys.map((k, i) => ({ key: k, count: simplified[i], rawCount: nums[i] }));
  }
  function defaultTraitLabels(letter) {
    const L = letter.toUpperCase(), l = letter.toLowerCase();
    return { dominant: `${L}_ (dominant)`, recessive: `${l}${l} (recessive)` };
  }
  function defaultXTraitLabels(letter) {
    const L = letter.toUpperCase(), l = letter.toLowerCase();
    return { dominant: `${L} (dominant)`, recessive: `${l} (recessive)` };
  }

  // ---------- autosomal genotype parsing (n loci) ----------
  function parseLoci(str) {
    str = String(str || '').trim();
    if (!/^[A-Za-z]+$/.test(str)) throw new Error('Genotype must be letters only, e.g. "Aa" or "AaBb".');
    if (str.length % 2 !== 0) throw new Error('Genotype must have an even number of letters (two per gene), e.g. "Aa" or "AaBb".');
    const loci = [];
    const seen = new Set();
    for (let i = 0; i < str.length; i += 2) {
      const pair = str.slice(i, i + 2);
      const letter = pair[0].toLowerCase();
      if (pair[1].toLowerCase() !== letter) throw new Error(`"${pair}" isn't a valid gene pair — both letters must be the same gene, e.g. "Aa", "AA", or "aa".`);
      if (seen.has(letter)) throw new Error(`Gene "${letter.toUpperCase()}" appears more than once — list each gene once, e.g. "AaBb".`);
      seen.add(letter);
      const alleles = [pair[0], pair[1]].sort(upperFirst);
      loci.push({ letter, alleles });
    }
    return loci;
  }
  function locusGametes(locus) {
    const [x, y] = locus.alleles;
    return x === y ? [x] : [x, y];
  }
  function gametesFromLoci(loci) {
    let combos = [''];
    for (const locus of loci) {
      const opts = locusGametes(locus);
      const next = [];
      for (const c of combos) for (const o of opts) next.push(c + o);
      combos = next;
    }
    return combos;
  }
  function combineGametes(ga, gb) {
    let out = '';
    for (let i = 0; i < ga.length; i++) out += [ga[i], gb[i]].sort(upperFirst).join('');
    return out;
  }
  function phenotypeLabel(genotype, traits) {
    const parts = [];
    for (let i = 0; i < traits.length; i++) {
      const pair = genotype.slice(i * 2, i * 2 + 2);
      const isDominant = pair[0] === pair[0].toUpperCase();
      parts.push(isDominant ? traits[i].dominant : traits[i].recessive);
    }
    return parts.join(', ');
  }

  function performCross(lociA, lociB, traits, genoAStr, genoBStr) {
    const gametesA = gametesFromLoci(lociA);
    const gametesB = gametesFromLoci(lociB);
    const grid = gametesA.map(ga => gametesB.map(gb => combineGametes(ga, gb)));
    const flat = grid.flat();
    const genotypeRatio = ratioFromCounts(tally(flat));
    const phenotypeRatio = ratioFromCounts(tally(flat.map(g => phenotypeLabel(g, traits))));
    const steps = [
      `Parent 1 (${genoAStr}) makes gametes: ${gametesA.join(', ')}.`,
      `Parent 2 (${genoBStr}) makes gametes: ${gametesB.join(', ')}.`,
      `Fill the ${gametesA.length}×${gametesB.length} Punnett square by combining each gamete pair.`,
      `Genotype ratio — ${genotypeRatio.map(r => `${r.count} ${r.key}`).join(' : ')}.`,
      `Phenotype ratio — ${phenotypeRatio.map(r => `${r.count} ${r.key}`).join(' : ')}.`,
    ];
    return { gametesA, gametesB, grid, genotypeRatio, phenotypeRatio, steps };
  }

  function monohybridCross(genoAStr, genoBStr, traitLabels) {
    const lociA = parseLoci(genoAStr), lociB = parseLoci(genoBStr);
    if (lociA.length !== 1 || lociB.length !== 1) throw new Error('Monohybrid crosses need exactly one gene per genotype, e.g. "Aa" × "Aa".');
    if (lociA[0].letter !== lociB[0].letter) throw new Error(`Both parents must use the same gene letter (got "${lociA[0].letter.toUpperCase()}" and "${lociB[0].letter.toUpperCase()}").`);
    const traits = [(traitLabels && traitLabels[0]) || defaultTraitLabels(lociA[0].letter)];
    return performCross(lociA, lociB, traits, genoAStr, genoBStr);
  }

  function dihybridCross(genoAStr, genoBStr, traitLabels) {
    const lociA = parseLoci(genoAStr), lociB = parseLoci(genoBStr);
    if (lociA.length !== 2 || lociB.length !== 2) throw new Error('Dihybrid crosses need exactly two genes per genotype, e.g. "AaBb" × "AaBb".');
    const lettersA = lociA.map(l => l.letter).join(','), lettersB = lociB.map(l => l.letter).join(',');
    if (lettersA !== lettersB) throw new Error('Both parents must use the same two gene letters, in the same order, e.g. "AaBb" and "aabb".');
    const traits = lociA.map((l, i) => (traitLabels && traitLabels[i]) || defaultTraitLabels(l.letter));
    return performCross(lociA, lociB, traits, genoAStr, genoBStr);
  }

  // ---------- sex-linked (X-linked) crosses ----------
  function parseXLinkedGenotype(str) {
    str = String(str || '').trim();
    const m = str.match(/^X([A-Za-z])(?:X([A-Za-z])|Y)$/);
    if (!m) throw new Error('Use X-linked notation like "XAXa" for a female or "XAY" for a male, with the trait letter after each X.');
    if (m[2] && m[1].toLowerCase() !== m[2].toLowerCase()) throw new Error('Both X alleles must be the same gene letter, e.g. "XAXa", not "XAXb".');
    return m[2]
      ? { sex: 'F', alleles: [m[1], m[2]].sort(upperFirst) }
      : { sex: 'M', alleles: [m[1]] };
  }
  function formatXGenotype(a, b) { const [x, y] = [a, b].sort(upperFirst); return `X${x}X${y}`; }
  function allelesFromXGenotype(genotype) { return genotype.replace(/[XY]/g, ''); }
  function isDominantXPhenotype(genotype) { return /[A-Z]/.test(allelesFromXGenotype(genotype)); }

  function sexLinkedCross(genoAStr, genoBStr, traitLabel) {
    const pA = parseXLinkedGenotype(genoAStr), pB = parseXLinkedGenotype(genoBStr);
    let female, male, femaleStr, maleStr;
    if (pA.sex === 'F' && pB.sex === 'M') { female = pA; male = pB; femaleStr = genoAStr; maleStr = genoBStr; }
    else if (pA.sex === 'M' && pB.sex === 'F') { female = pB; male = pA; femaleStr = genoBStr; maleStr = genoAStr; }
    else throw new Error('Enter one female genotype (e.g. "XAXa") and one male genotype (e.g. "XAY") — a sex-linked cross needs one of each.');
    const trait = traitLabel || defaultXTraitLabels(female.alleles[0].toLowerCase() === female.alleles[0] ? female.alleles[0] : female.alleles[1]);
    const femaleGametes = female.alleles[0] === female.alleles[1] ? [female.alleles[0]] : female.alleles.slice();
    const maleGametes = [{ type: 'X', allele: male.alleles[0] }, { type: 'Y' }];
    const grid = femaleGametes.map(fg => maleGametes.map(mg =>
      mg.type === 'Y' ? { sex: 'M', genotype: `X${fg}Y` } : { sex: 'F', genotype: formatXGenotype(fg, mg.allele) }
    ));
    const flat = grid.flat();
    const genotypeRatio = ratioFromCounts(tally(flat.map(c => `${c.sex}:${c.genotype}`)))
      .map(r => { const [sex, genotype] = r.key.split(':'); return { ...r, sex, genotype }; });
    const phenotypeRatio = ratioFromCounts(tally(flat.map(c =>
      `${c.sex === 'F' ? 'Female' : 'Male'}, ${isDominantXPhenotype(c.genotype) ? trait.dominant : trait.recessive}`
    )));
    const steps = [
      `Female parent (${femaleStr}) makes egg gametes: ${femaleGametes.map(a => `X${a}`).join(', ')}.`,
      `Male parent (${maleStr}) makes sperm gametes: X${male.alleles[0]}, Y.`,
      `Combine each egg with each sperm — an X-carrying sperm gives a daughter, a Y-carrying sperm gives a son.`,
      `Genotype ratio — ${genotypeRatio.map(r => `${r.count} ${r.sex === 'F' ? 'female' : 'male'} ${r.genotype}`).join(' : ')}.`,
      `Phenotype ratio — ${phenotypeRatio.map(r => `${r.count} ${r.key}`).join(' : ')}.`,
    ];
    return { femaleGametes, maleAllele: male.alleles[0], grid, genotypeRatio, phenotypeRatio, steps };
  }

  // ---------- pedigree analysis ----------
  function checkAutosomalDominant(indiv, byId) {
    const reasons = []; let consistent = true;
    for (const c of indiv) {
      const f = c.fatherId ? byId[c.fatherId] : null, m = c.motherId ? byId[c.motherId] : null;
      if (f && m && !f.affected && !m.affected && c.affected) {
        consistent = false;
        reasons.push(`${c.id} is affected but both parents (${f.id}, ${m.id}) are unaffected — impossible for a dominant trait without a new mutation.`);
      }
    }
    return { consistent, reasons };
  }
  function checkAutosomalRecessive(indiv, byId) {
    const reasons = []; let consistent = true;
    for (const c of indiv) {
      const f = c.fatherId ? byId[c.fatherId] : null, m = c.motherId ? byId[c.motherId] : null;
      if (f && m && f.affected && m.affected && !c.affected) {
        consistent = false;
        reasons.push(`${c.id} is unaffected but both parents (${f.id}, ${m.id}) are affected — two affected (aa) parents can only have affected children under a recessive model.`);
      }
    }
    return { consistent, reasons };
  }
  function checkXLinkedDominant(indiv, byId) {
    const reasons = []; let consistent = true;
    for (const c of indiv) {
      const f = c.fatherId ? byId[c.fatherId] : null, m = c.motherId ? byId[c.motherId] : null;
      if (f && m && !f.affected && !m.affected && c.affected) {
        consistent = false; reasons.push(`${c.id} is affected but both parents are unaffected — impossible for a dominant trait.`); continue;
      }
      if (f && f.affected && c.sex === 'F' && !c.affected) {
        consistent = false; reasons.push(`${c.id} is an unaffected daughter of affected father ${f.id} — every daughter of an X-linked dominant father inherits his affected X and must be affected too.`);
      }
      if (m && c.sex === 'M' && c.affected && !m.affected) {
        consistent = false; reasons.push(`${c.id} is an affected son but mother ${m.id} is unaffected — a son's only X comes from his mother, so she'd have to be affected too for an X-linked dominant trait.`);
      }
    }
    return { consistent, reasons };
  }
  function checkXLinkedRecessive(indiv, byId) {
    const reasons = []; let consistent = true;
    for (const c of indiv) {
      const f = c.fatherId ? byId[c.fatherId] : null;
      if (f && c.sex === 'F' && c.affected && !f.affected) {
        consistent = false; reasons.push(`${c.id} is an affected daughter but father ${f.id} is unaffected — an affected daughter needs an affected X from her father for an X-linked recessive trait.`);
      }
    }
    return { consistent, reasons };
  }

  function resolveAutosomal(pattern, indiv, byId) {
    const result = {};
    for (const c of indiv) {
      const f = c.fatherId ? byId[c.fatherId] : null, m = c.motherId ? byId[c.motherId] : null;
      let genotype, determined;
      if (pattern === 'AR') {
        if (c.affected) { genotype = 'aa'; determined = true; }
        else {
          const hasAffectedParent = (f && f.affected) || (m && m.affected);
          const hasAffectedChild = indiv.some(k => (k.fatherId === c.id || k.motherId === c.id) && k.affected);
          if (hasAffectedParent || hasAffectedChild) { genotype = 'Aa'; determined = true; }
          else { genotype = 'AA or Aa'; determined = false; }
        }
      } else {
        if (!c.affected) { genotype = 'aa'; determined = true; }
        else {
          const hasUnaffectedParent = (f && !f.affected) || (m && !m.affected);
          if (hasUnaffectedParent) { genotype = 'Aa'; determined = true; }
          else { genotype = 'AA or Aa'; determined = false; }
        }
      }
      result[c.id] = { genotype, determined };
    }
    return result;
  }
  function resolveXLinked(pattern, indiv, byId) {
    const result = {};
    const isXR = pattern === 'XR';
    for (const c of indiv) {
      if (c.sex === 'M') {
        const allele = isXR ? (c.affected ? 'a' : 'A') : (c.affected ? 'A' : 'a');
        result[c.id] = { genotype: `X${allele}Y`, determined: true };
        continue;
      }
      const f = c.fatherId ? byId[c.fatherId] : null, m = c.motherId ? byId[c.motherId] : null;
      if (isXR) {
        if (c.affected) { result[c.id] = { genotype: formatXGenotype('a', 'a'), determined: true }; continue; }
        if (f && f.affected) { result[c.id] = { genotype: formatXGenotype('A', 'a'), determined: true }; continue; }
        if (f && !f.affected && m && m.affected) { result[c.id] = { genotype: formatXGenotype('A', 'a'), determined: true }; continue; }
        result[c.id] = { genotype: `${formatXGenotype('A', 'A')} or ${formatXGenotype('A', 'a')}`, determined: false };
      } else {
        if (!c.affected) { result[c.id] = { genotype: formatXGenotype('a', 'a'), determined: true }; continue; }
        if (f && !f.affected) { result[c.id] = { genotype: formatXGenotype('A', 'a'), determined: true }; continue; }
        if (m && !m.affected) { result[c.id] = { genotype: formatXGenotype('A', 'a'), determined: true }; continue; }
        result[c.id] = { genotype: `${formatXGenotype('A', 'A')} or ${formatXGenotype('A', 'a')}`, determined: false };
      }
    }
    return result;
  }

  function analyzePedigree(individuals) {
    if (!Array.isArray(individuals) || !individuals.length) throw new Error('Add at least one individual to the pedigree.');
    const byId = {};
    for (const ind of individuals) byId[ind.id] = ind;
    const checks = {
      AD: checkAutosomalDominant(individuals, byId),
      AR: checkAutosomalRecessive(individuals, byId),
      XD: checkXLinkedDominant(individuals, byId),
      XR: checkXLinkedRecessive(individuals, byId),
    };
    const genotypes = {};
    if (checks.AD.consistent) genotypes.AD = resolveAutosomal('AD', individuals, byId);
    if (checks.AR.consistent) genotypes.AR = resolveAutosomal('AR', individuals, byId);
    if (checks.XD.consistent) genotypes.XD = resolveXLinked('XD', individuals, byId);
    if (checks.XR.consistent) genotypes.XR = resolveXLinked('XR', individuals, byId);
    const consistentPatterns = Object.keys(checks).filter(k => checks[k].consistent);
    return { checks, genotypes, consistentPatterns };
  }

  // ---------- chi-square goodness-of-fit ----------
  const CHI_SQUARE_CRITICAL = {
    1: { 0.05: 3.841, 0.01: 6.635 },
    2: { 0.05: 5.991, 0.01: 9.210 },
    3: { 0.05: 7.815, 0.01: 11.345 },
    4: { 0.05: 9.488, 0.01: 13.277 },
    5: { 0.05: 11.070, 0.01: 15.086 },
  };
  function chiSquareTest(categories, alpha) {
    alpha = alpha === 0.01 ? 0.01 : 0.05;
    if (!Array.isArray(categories) || categories.length < 2) throw new Error('Chi-square needs at least two categories to compare.');
    const totalObserved = categories.reduce((s, c) => s + Number(c.observed || 0), 0);
    const totalRatio = categories.reduce((s, c) => s + Number(c.expectedRatio || 0), 0);
    if (totalRatio <= 0) throw new Error('Expected ratio values must add up to more than zero.');
    const rows = categories.map(c => {
      const expected = totalObserved * (Number(c.expectedRatio || 0) / totalRatio);
      const observed = Number(c.observed || 0);
      const contribution = expected > 0 ? Math.pow(observed - expected, 2) / expected : 0;
      return { label: c.label, observed, expected, contribution };
    });
    const chiSquare = rows.reduce((s, r) => s + r.contribution, 0);
    const df = categories.length - 1;
    const criticalTable = CHI_SQUARE_CRITICAL[df];
    const criticalValue = criticalTable ? criticalTable[alpha] : null;
    const verdict = criticalValue == null ? null : (chiSquare > criticalValue ? 'reject' : 'fail-to-reject');
    const steps = [`Total observed = ${totalObserved}.`];
    rows.forEach(r => steps.push(`${r.label}: expected = ${r.expected.toFixed(2)}; (O − E)² / E = (${r.observed} − ${r.expected.toFixed(2)})² / ${r.expected.toFixed(2)} = ${r.contribution.toFixed(3)}`));
    steps.push(`χ² = Σ (O − E)² / E = ${chiSquare.toFixed(3)}.`);
    steps.push(`Degrees of freedom = categories − 1 = ${df}.`);
    if (criticalValue != null) {
      steps.push(`Critical value at α = ${alpha} (df = ${df}) is ${criticalValue}.`);
      steps.push(chiSquare > criticalValue
        ? `χ² (${chiSquare.toFixed(3)}) > critical value (${criticalValue}) → reject the null hypothesis; the observed data differs significantly from the expected ratio.`
        : `χ² (${chiSquare.toFixed(3)}) ≤ critical value (${criticalValue}) → fail to reject the null hypothesis; the observed data is consistent with the expected ratio.`);
    } else {
      steps.push(`No critical-value table entry for df = ${df} (supported range: 1–5).`);
    }
    return { rows, chiSquare, df, alpha, criticalValue, verdict, steps };
  }

  const API = {
    parseLoci, gametesFromLoci, monohybridCross, dihybridCross, defaultTraitLabels,
    parseXLinkedGenotype, sexLinkedCross, formatXGenotype, defaultXTraitLabels,
    analyzePedigree,
    chiSquareTest, CHI_SQUARE_CRITICAL,
  };

  root.GeneticsEngine = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
