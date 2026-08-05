/* ap-psych.js — original AP Psychology reference + practice content for SkoolToolz.
   ALL CONTENT IS ORIGINAL, WRITTEN FOR SKOOLTOOLZ (nothing lifted from the exam or any
   copyrighted prep material) — same integrity bar as ap-packs.js. Loaded once via a
   <script> tag on first open of the AP Psychology tool (mirrors ap-packs.js / the
   calculus engine — a <script> tag rather than fetch() so it also works from a local
   file:// copy), then cached on window.APPsych for the session. */
(function () {

  /* ───────────────────────── Perspectives & theorists ─────────────────────────
     The 7 major perspectives taught in AP Psych Unit 1, each with the theorists/
     studies most commonly associated with it. */
  const PERSPECTIVES = [
    {
      id: 'biological', name: 'Biological', color: '#6A95FF',
      blurb: 'Explains behavior through the brain, nervous system, genetics, and hormones.',
      theorists: [
        { name: 'Roger Sperry', contribution: 'Split-brain research — showed the two hemispheres can process information independently when the corpus callosum is severed.' },
        { name: 'Paul Broca', contribution: "Identified Broca's area (frontal lobe) — damage impairs speech production while comprehension stays largely intact." },
        { name: 'Carl Wernicke', contribution: "Identified Wernicke's area (temporal lobe) — damage impairs language comprehension while speech stays fluent but nonsensical." },
        { name: 'Hubel & Wiesel', contribution: 'Mapped feature-detector neurons in the visual cortex that fire selectively for edges, angles, and movement.' },
      ],
    },
    {
      id: 'behavioral', name: 'Behavioral', color: '#4EAE53',
      blurb: 'Explains behavior as learned associations with the environment; rejects focus on unobservable mental states.',
      theorists: [
        { name: 'Ivan Pavlov', contribution: 'Classical conditioning — paired a neutral stimulus (bell) with an unconditioned stimulus (food) until it alone triggered salivation.' },
        { name: 'John B. Watson', contribution: "Founded behaviorism; the \"Little Albert\" study conditioned fear of a white rat in an infant." },
        { name: 'B.F. Skinner', contribution: 'Operant conditioning — behavior is shaped by reinforcement and punishment; studied schedules of reinforcement with the "Skinner box."' },
        { name: 'Edward Thorndike', contribution: 'Law of effect — responses followed by satisfying consequences are more likely to recur.' },
      ],
    },
    {
      id: 'psychodynamic', name: 'Psychodynamic', color: '#B58BFF',
      blurb: 'Explains behavior through unconscious drives and unresolved early-childhood conflict.',
      theorists: [
        { name: 'Sigmund Freud', contribution: 'Psychoanalysis — proposed the id/ego/superego structure and psychosexual stages driven by unconscious conflict.' },
        { name: 'Carl Jung', contribution: 'Proposed the collective unconscious and universal archetypes shared across cultures.' },
        { name: 'Erik Erikson', contribution: 'Eight psychosocial stages spanning the whole lifespan, each centered on a core conflict (e.g. trust vs. mistrust).' },
        { name: 'Karen Horney', contribution: "Critiqued Freud's view of women; proposed basic anxiety from feeling isolated/helpless in childhood drives personality." },
      ],
    },
    {
      id: 'humanistic', name: 'Humanistic', color: '#FFD23F',
      blurb: 'Emphasizes free will, self-actualization, and inherent human goodness.',
      theorists: [
        { name: 'Carl Rogers', contribution: 'Client-centered therapy — growth requires genuineness, empathy, and unconditional positive regard.' },
        { name: 'Abraham Maslow', contribution: "Hierarchy of needs — lower needs (physiological, safety) must be met before higher ones (esteem, self-actualization)." },
      ],
    },
    {
      id: 'cognitive', name: 'Cognitive', color: '#5BC9D6',
      blurb: 'Explains behavior through internal mental processes: memory, perception, reasoning, and problem-solving.',
      theorists: [
        { name: 'Jean Piaget', contribution: 'Stages of cognitive development (sensorimotor, preoperational, concrete operational, formal operational).' },
        { name: 'Wolfgang Köhler', contribution: 'Insight learning — chimpanzees solved problems through sudden understanding, not just trial and error.' },
        { name: 'Ulric Neisser', contribution: 'Often called the "father of cognitive psychology"; helped establish it as a formal field of study.' },
        { name: 'Elizabeth Loftus', contribution: 'Reconstructive memory and the misinformation effect — leading questions can distort eyewitness memory.' },
      ],
    },
    {
      id: 'sociocultural', name: 'Sociocultural', color: '#FF7AA8',
      blurb: 'Explains behavior through social context, culture, and group influence.',
      theorists: [
        { name: 'Lev Vygotsky', contribution: 'Zone of proximal development — learning is maximized with guided support from a more knowledgeable other.' },
        { name: 'Stanley Milgram', contribution: 'Obedience studies — a majority of participants delivered what they believed were dangerous shocks under an authority figure’s instruction.' },
        { name: 'Solomon Asch', contribution: 'Conformity studies — participants often gave an obviously wrong answer to match a unanimous group.' },
        { name: 'Leon Festinger', contribution: 'Cognitive dissonance theory — discomfort from holding conflicting beliefs motivates attitude or behavior change.' },
      ],
    },
    {
      id: 'evolutionary', name: 'Evolutionary', color: '#F08544',
      blurb: 'Explains behavior through natural selection and adaptive value across generations.',
      theorists: [
        { name: 'Charles Darwin', contribution: 'Natural selection — traits (including behavioral ones) that improve survival/reproduction become more common over time.' },
        { name: 'David Buss', contribution: 'Evolutionary research on human mate-selection preferences across cultures.' },
      ],
    },
  ];

  /* Additional named studies/figures that don't map to a single perspective —
     surfaced in the theorist quiz alongside the perspective-grouped ones. */
  const ADDITIONAL_THEORISTS = [
    { name: 'Harry Harlow', contribution: 'Attachment research with rhesus monkeys — infants preferred a soft "cloth mother" over a wire one that dispensed food, showing contact comfort matters more than feeding.' },
    { name: 'Mary Ainsworth', contribution: "The Strange Situation — classified infant attachment styles (secure, avoidant, resistant) by reactions to a caregiver leaving and returning." },
    { name: 'Lawrence Kohlberg', contribution: 'Stages of moral development (preconventional, conventional, postconventional), studied via moral dilemmas.' },
    { name: 'Philip Zimbardo', contribution: 'The Stanford Prison Experiment — showed how quickly situational roles (guard vs. prisoner) can shape behavior.' },
    { name: 'Albert Bandura', contribution: 'The Bobo doll study — children imitated aggression they observed in adult models; foundational to observational learning and self-efficacy.' },
    { name: 'Diana Baumrind', contribution: 'Identified parenting styles — authoritative, authoritarian, permissive, and uninvolved — and their links to child outcomes.' },
  ];

  /* ───────────────────────── Disorders & treatments ───────────────────────── */
  const TREATMENTS = [
    { id: 'psychodynamic', name: 'Psychodynamic therapy', blurb: 'Free association and dream analysis aimed at uncovering unconscious conflict.' },
    { id: 'humanistic', name: 'Humanistic / client-centered therapy', blurb: 'Non-directive, empathetic listening with unconditional positive regard (Rogers).' },
    { id: 'behavioral', name: 'Behavioral therapy', blurb: 'Systematic desensitization, exposure therapy, token economies, and aversive conditioning.' },
    { id: 'cognitive', name: 'Cognitive therapy', blurb: "Identifying and restructuring distorted thought patterns (Beck)." },
    { id: 'cbt', name: 'Cognitive-behavioral therapy (CBT)', blurb: 'Combines cognitive restructuring with behavioral exposure; first-line for many anxiety, depressive, and OCD presentations.' },
    { id: 'biomedical', name: 'Biomedical therapy', blurb: 'Medication or procedures — SSRIs, benzodiazepines, antipsychotics, mood stabilizers, or ECT for severe treatment-resistant cases.' },
  ];

  const DISORDERS = [
    { id: 'gad', category: 'Anxiety disorders', name: 'Generalized anxiety disorder', symptoms: 'Chronic, excessive worry about many areas of life, disproportionate to actual threat, with physical tension.', treatments: ['cbt', 'biomedical'] },
    { id: 'panic', category: 'Anxiety disorders', name: 'Panic disorder', symptoms: 'Recurrent, unexpected panic attacks — intense fear with physical symptoms (racing heart, shortness of breath) peaking within minutes.', treatments: ['cbt', 'biomedical'] },
    { id: 'phobia', category: 'Anxiety disorders', name: 'Specific phobia', symptoms: 'Marked, persistent fear of a specific object or situation that is actively avoided or endured with intense distress.', treatments: ['behavioral', 'cbt'] },
    { id: 'social-anxiety', category: 'Anxiety disorders', name: 'Social anxiety disorder', symptoms: 'Marked fear of social situations involving possible scrutiny or judgment by others.', treatments: ['cbt', 'biomedical'] },
    { id: 'ocd', category: 'Obsessive-compulsive & related', name: 'Obsessive-compulsive disorder (OCD)', symptoms: 'Intrusive, unwanted obsessions paired with repetitive compulsions performed to reduce the resulting anxiety.', treatments: ['behavioral', 'cbt', 'biomedical'] },
    { id: 'hoarding', category: 'Obsessive-compulsive & related', name: 'Hoarding disorder', symptoms: 'Persistent difficulty discarding possessions regardless of value, leading to clutter that disrupts living spaces.', treatments: ['cbt'] },
    { id: 'ptsd', category: 'Trauma- & stressor-related', name: 'Post-traumatic stress disorder (PTSD)', symptoms: 'Re-experiencing (flashbacks/nightmares), avoidance, negative mood changes, and hyperarousal following a traumatic event.', treatments: ['cbt', 'biomedical'] },
    { id: 'mdd', category: 'Depressive disorders', name: 'Major depressive disorder', symptoms: 'At least two weeks of depressed mood or loss of interest, plus symptoms like fatigue, sleep/appetite change, or feelings of worthlessness.', treatments: ['cbt', 'biomedical', 'psychodynamic'] },
    { id: 'dysthymia', category: 'Depressive disorders', name: 'Persistent depressive disorder (dysthymia)', symptoms: 'Chronic, lower-grade depressed mood lasting two years or more.', treatments: ['cbt', 'biomedical'] },
    { id: 'bipolar1', category: 'Bipolar disorders', name: 'Bipolar I disorder', symptoms: 'At least one full manic episode — elevated mood, high energy, impulsivity — often with depressive episodes as well.', treatments: ['biomedical', 'cbt'] },
    { id: 'bipolar2', category: 'Bipolar disorders', name: 'Bipolar II disorder', symptoms: 'A pattern of hypomanic episodes (less severe than full mania) alternating with major depressive episodes.', treatments: ['biomedical', 'cbt'] },
    { id: 'schizophrenia', category: 'Schizophrenia spectrum', name: 'Schizophrenia', symptoms: 'Positive symptoms (hallucinations, delusions, disorganized speech) and/or negative symptoms (flat affect, avolition, alogia).', treatments: ['biomedical', 'behavioral'] },
    { id: 'did', category: 'Dissociative disorders', name: 'Dissociative identity disorder (DID)', symptoms: 'Presence of two or more distinct identity states, often with gaps in memory beyond ordinary forgetting.', treatments: ['psychodynamic', 'cbt'] },
    { id: 'diss-amnesia', category: 'Dissociative disorders', name: 'Dissociative amnesia', symptoms: 'Inability to recall important personal information, usually following severe stress, not explained by ordinary forgetfulness.', treatments: ['psychodynamic', 'cbt'] },
    { id: 'anorexia', category: 'Feeding & eating disorders', name: 'Anorexia nervosa', symptoms: 'Restriction of food intake leading to significantly low body weight, intense fear of weight gain, and distorted body image.', treatments: ['cbt', 'biomedical'] },
    { id: 'bulimia', category: 'Feeding & eating disorders', name: 'Bulimia nervosa', symptoms: 'Recurrent episodes of binge eating followed by compensatory behaviors (e.g. purging), with self-evaluation tied to body shape.', treatments: ['cbt', 'biomedical'] },
    { id: 'binge-eating', category: 'Feeding & eating disorders', name: 'Binge-eating disorder', symptoms: 'Recurrent episodes of eating large amounts with a sense of loss of control, without regular compensatory behaviors.', treatments: ['cbt'] },
    { id: 'borderline', category: 'Personality disorders', name: 'Borderline personality disorder', symptoms: 'Pervasive instability in relationships, self-image, and emotions, with marked impulsivity.', treatments: ['cbt', 'psychodynamic'] },
    { id: 'antisocial', category: 'Personality disorders', name: 'Antisocial personality disorder', symptoms: 'Pervasive disregard for and violation of the rights of others, typically since age 15.', treatments: ['cbt'] },
    { id: 'adhd', category: 'Neurodevelopmental disorders', name: 'ADHD', symptoms: 'A persistent pattern of inattention and/or hyperactivity-impulsivity that interferes with functioning.', treatments: ['biomedical', 'behavioral'] },
    { id: 'asd', category: 'Neurodevelopmental disorders', name: 'Autism spectrum disorder', symptoms: 'Persistent deficits in social communication/interaction, plus restricted, repetitive patterns of behavior or interests.', treatments: ['behavioral'] },
  ];

  /* ───────────────────────── Ethics guidelines ───────────────────────── */
  const ETHICS = [
    { id: 'informed-consent', name: 'Informed consent', blurb: 'Participants are told the nature, purpose, and risks of the study before agreeing to take part.' },
    { id: 'voluntary', name: 'Voluntary participation / right to withdraw', blurb: 'Participation is never coerced, and participants may leave at any time without penalty.' },
    { id: 'protection-from-harm', name: 'Protection from harm', blurb: 'Physical and psychological risk to participants is minimized throughout the study.' },
    { id: 'confidentiality', name: 'Confidentiality', blurb: "Participants' data and identity are protected from unauthorized disclosure." },
    { id: 'debriefing', name: 'Debriefing', blurb: "Participants receive a full explanation of the study's true purpose after it concludes, especially if deception was used." },
    { id: 'deception', name: 'Limited deception', blurb: 'Deception is used only when no reasonable non-deceptive alternative exists, and is disclosed at debriefing.' },
    { id: 'irb', name: 'IRB approval', blurb: 'An Institutional Review Board reviews and approves the research design before data collection begins.' },
    { id: 'vulnerable', name: 'Protections for vulnerable populations', blurb: 'Extra safeguards apply for groups like children or incarcerated individuals, who may not be able to freely consent.' },
    { id: 'animal-welfare', name: 'Animal research standards (IACUC)', blurb: 'Animal studies must be justified, minimize discomfort, and consider non-animal alternatives.' },
  ];

  /* ═══════════════════════════════════════════════════════════════════════
     Research Methods practice — parameterized scenario generators.
     Each category is an array of generator functions; every call rerolls
     names/settings/numbers from small pools so repeat plays feel fresh,
     while the underlying correct answer stays pedagogically sound. ══════ */

  const RESEARCHERS = ['Dr. Alvarez', 'Dr. Chen', 'Dr. Okafor', 'Dr. Patel', 'Dr. Morrison', 'Dr. Whitfield', 'Dr. Nakamura', 'Dr. Osei'];
  const SETTINGS = ['a local high school', 'a university research lab', 'an elementary school classroom', 'an online survey panel', 'a hospital outpatient clinic', 'a community recreation center'];
  function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function mcFrom(correct, distractors, stem, explanation, category) {
    const choices = shuffle([correct, ...distractors]);
    return { category, stem, choices, correctIndex: choices.indexOf(correct), explanation };
  }

  const IVDV_TOPICS = [
    { topic: 'sleep duration and short-term memory recall', iv: 'the number of hours participants slept', dv: 'their score on a memory recall test' },
    { topic: 'caffeine intake and reaction time', iv: 'the amount of caffeine each participant consumed', dv: 'their reaction time on a computer task' },
    { topic: 'background music and reading comprehension', iv: 'whether background music was playing', dv: "participants' scores on a reading comprehension quiz" },
    { topic: 'exercise and self-reported mood', iv: 'the number of minutes participants exercised', dv: 'their self-reported mood rating' },
    { topic: 'study method and test performance', iv: 'which study method participants were assigned', dv: 'their score on a unit test' },
    { topic: 'screen brightness and eye strain', iv: 'the brightness level of the screen participants used', dv: 'their self-reported eye strain rating' },
    { topic: 'room temperature and task focus', iv: 'the temperature of the room participants worked in', dv: 'the number of errors they made on a focus task' },
  ];

  const genIVDV = [
    (rng) => {
      const t = pick(IVDV_TOPICS);
      const n = ri(24, 180);
      const stem = `${pick(RESEARCHERS)} recruits ${n} participants at ${pick(SETTINGS)} to study ${t.topic}. Participants are randomly assigned to a condition, and the researcher records the outcome afterward. What is the <b>independent variable</b> in this study?`;
      return mcFrom(t.iv, [t.dv, 'the number of participants in the study', 'the setting where the study took place'], stem, `The independent variable is the factor the researcher deliberately manipulates — here, ${t.iv}. The outcome that's measured (${t.dv}) is the dependent variable.`, 'ivdv');
    },
    (rng) => {
      const t = pick(IVDV_TOPICS);
      const n = ri(24, 180);
      const stem = `${pick(RESEARCHERS)} recruits ${n} participants at ${pick(SETTINGS)} to study ${t.topic}. Participants are randomly assigned to a condition, and the researcher records the outcome afterward. What is the <b>dependent variable</b> in this study?`;
      return mcFrom(t.dv, [t.iv, 'the participants’ age', 'the day of the week the study ran'], stem, `The dependent variable is what's measured as an outcome — here, ${t.dv}. It "depends on" the independent variable, which is ${t.iv}.`, 'ivdv');
    },
  ];

  const DESIGN_SCENARIOS = [
    { label: 'true experiment', desc: (r) => `${r} randomly assigns participants to either a treatment group or a control group, deliberately manipulates one variable, and compares outcomes between the groups.` },
    { label: 'correlational study', desc: (r) => `${r} measures two variables as they naturally occur in a large group of participants and calculates a correlation coefficient — no variable is manipulated and no group is assigned.` },
    { label: 'case study', desc: (r) => `${r} conducts an in-depth investigation of a single individual with a rare condition, drawing on interviews, records, and observation over many months.` },
    { label: 'naturalistic observation', desc: (r) => `${r} observes children on a playground from a distance, recording behavior exactly as it occurs without any intervention.` },
    { label: 'survey', desc: (r) => `${r} distributes a questionnaire to a large sample asking them to self-report their attitudes and habits.` },
    { label: 'longitudinal study', desc: (r) => `${r} follows the same group of participants over 15 years, measuring the same variables at multiple points in time.` },
    { label: 'cross-sectional study', desc: (r) => `${r} compares groups of participants at different ages, all measured at a single point in time, to draw conclusions about development.` },
  ];
  const genDesign = [
    (rng) => {
      const s = pick(DESIGN_SCENARIOS);
      const r = pick(RESEARCHERS);
      const distractors = shuffle(DESIGN_SCENARIOS.filter(x => x.label !== s.label)).slice(0, 3).map(x => x.label);
      const stem = `${s.desc(r)} Which research method is being used?`;
      return mcFrom(s.label, distractors, stem, `This is a ${s.label} — ${s.desc(r).replace(r, 'the researcher')}`, 'design');
    },
  ];

  const VALIDITY_SCENARIOS = [
    { label: 'confounding variable', text: (r, n) => `${r} compares test scores between two classrooms using different textbooks — but one classroom also has a more experienced teacher. It's unclear whether the textbook or the teacher's experience caused the score difference.` },
    { label: 'placebo effect', text: (r, n) => `In a drug trial, participants who received an inactive sugar pill still reported feeling less pain, simply because they believed they were receiving real medication.` },
    { label: 'experimenter bias', text: (r, n) => `${r}, who strongly expects the new therapy to work, unconsciously gives extra encouragement to participants in the treatment group during scoring, inflating their apparent improvement.` },
    { label: 'demand characteristics', text: (r, n) => `Participants figure out what the study is testing for and start behaving the way they think the researcher wants, rather than how they normally would.` },
    { label: 'social desirability bias', text: (r, n) => `On a self-report survey about drug use, participants underreport their actual use because they want to appear responsible to the researcher.` },
    { label: 'sampling bias', text: (r, n) => `${r} recruits all ${n} participants from a single expensive private school, then generalizes the findings to "how teenagers think" nationwide.` },
    { label: 'order effects (needs counterbalancing)', text: (r, n) => `In a within-subjects design, every participant completes Task A before Task B — and participants perform better on Task B simply from practice, regardless of which task is actually easier.` },
  ];
  const genValidity = [
    (rng) => {
      const s = pick(VALIDITY_SCENARIOS);
      const r = pick(RESEARCHERS);
      const n = ri(30, 300);
      const distractors = shuffle(VALIDITY_SCENARIOS.filter(x => x.label !== s.label)).slice(0, 3).map(x => x.label);
      const stem = `${s.text(r, n)} What threat to the study's validity does this illustrate?`;
      return mcFrom(s.label, distractors, stem, `This is ${s.label}. ${s.text(r, n)}`, 'validity');
    },
  ];

  const ETHICS_SCENARIOS = [
    { label: 'informed consent', text: (r) => `${r} enrolls participants in a study without telling them what the procedure will involve or what risks it carries, then begins data collection immediately.` },
    { label: 'debriefing', text: (r) => `${r} tells participants the study is testing "reaction time" when it's actually testing conformity under social pressure — and never explains the true purpose once the study ends.` },
    { label: 'protection from harm', text: (r) => `${r} designs a study that repeatedly exposes participants to a stressful stimulus far beyond what's necessary to test the hypothesis, with no support offered afterward.` },
    { label: 'confidentiality', text: (r) => `${r} publishes participants' real names alongside their individual survey answers about mental health history.` },
    { label: 'voluntary participation / right to withdraw', text: (r) => `${r} tells participants partway through the study that they are not allowed to stop or leave once they've begun.` },
    { label: 'protections for vulnerable populations', text: (r) => `${r} recruits a group of 8-year-olds for a study and obtains consent only from the children themselves, not their parents or guardians.` },
  ];
  const genEthics = [
    (rng) => {
      const s = pick(ETHICS_SCENARIOS);
      const r = pick(RESEARCHERS);
      const distractors = shuffle(ETHICS_SCENARIOS.filter(x => x.label !== s.label)).slice(0, 3).map(x => x.label);
      const stem = `${s.text(r)} Which ethical guideline is most directly being violated?`;
      return mcFrom(s.label, distractors, stem, `This violates ${s.label}. ${s.text(r)}`, 'ethics');
    },
  ];

  const GENERATORS = {
    ivdv: genIVDV,
    design: genDesign,
    validity: genValidity,
    ethics: genEthics,
  };

  function generateQuestion(categories) {
    const cats = (categories && categories.length ? categories : Object.keys(GENERATORS));
    const cat = pick(cats);
    const fn = pick(GENERATORS[cat]);
    return fn();
  }

  window.APPsych = {
    version: 1,
    perspectives: PERSPECTIVES,
    additionalTheorists: ADDITIONAL_THEORISTS,
    disorders: DISORDERS,
    treatments: TREATMENTS,
    ethics: ETHICS,
    generateQuestion,
    categories: [
      { id: 'ivdv', label: 'IV / DV identification' },
      { id: 'design', label: 'Research design' },
      { id: 'validity', label: 'Validity threats' },
      { id: 'ethics', label: 'Ethics guidelines' },
    ],
  };
})();
