/* =====================================================================
   reading-writing-data.js  —  SkoolToolz · SAT/ACT Reading & Writing Drill
   content module
   ---------------------------------------------------------------------
   Lazy-loaded on first open of the Reading & Writing Drill tool (mirrors
   the ap-packs.js / calculus-engine.js pattern), then cached. Loaded via
   a <script> tag so it also works from a local file:// copy.

   ALL CONTENT IS ORIGINAL, WRITTEN FOR SKOOLTOOLZ. Real SAT/ACT passages
   and questions are copyrighted; nothing here is copied. These passages
   and questions are authored to match the style, length, and difficulty
   of digital SAT Reading & Writing and ACT Reading, without reproducing
   any source. Standard English Conventions / ACT English items are
   generated procedurally by the tool itself (see mountReadingWritingDrill
   in SkoolToolz.html) and are not part of this file.

   Shape consumed by mountReadingWritingDrill():
     window.RWPacks = {
       version,
       sat: [ { id, domain, subtype, text, question, choices:[4],
                correct(index), explanation, vocab?:{word,def} } ],
       actReading: [ { id, title, text,
                questions: [ { domain, subtype, question, choices:[4],
                  correct(index), explanation, vocab?:{word,def} } ] } ]
     }
   domain is one of: 'info' | 'craft' | 'expression'
   (Standard English Conventions / 'conventions' is generated in-app.)
   ===================================================================== */
(function () {
  window.RWPacks = {
    version: 1,

    /* ============================ SAT (digital) ============================
       Each item is a single self-contained short passage + one question,
       matching the digital SAT's one-question-per-passage format. */
    sat: [

      /* ---- Information & Ideas ---- */
      {
        id: 'sat-info-1', domain: 'info', subtype: 'Central Ideas & Details',
        text: "When the city of Rotterdam rebuilt its harbor district after decades of decline, planners resisted the urge to erase every trace of the area's industrial past. Instead, they restored several disused cranes and warehouses, converting them into public plazas, climbing walls, and open-air markets. The result is a waterfront that feels distinctly of its place: visitors encounter both the district's working history and its new life as a gathering space, rather than a generic strip of glass towers that could belong to any city.",
        question: "Which choice best states the main idea of the text?",
        choices: [
          "Rotterdam's harbor district failed to attract visitors until its industrial structures were removed.",
          "By repurposing rather than removing old industrial structures, Rotterdam's harbor redevelopment preserved a sense of the area's distinct identity.",
          "Climbing walls and open-air markets are more popular with tourists than glass office towers are.",
          "Most European cities have chosen to demolish old industrial waterfronts rather than restore them."
        ],
        correct: 1,
        explanation: "The text emphasizes that planners kept and repurposed old cranes and warehouses so the harbor would feel “distinctly of its place” rather than generic — that's choice B. Choice A contradicts the text (the structures were kept, not removed). C is a supporting detail, not the main idea. D makes a broader claim about other cities that the text never makes."
      },
      {
        id: 'sat-info-2', domain: 'info', subtype: 'Command of Evidence (Textual)',
        text: "A team of ecologists studying an urban river restoration argued that reintroducing native wetland plants along the banks would improve water quality within two years. To test this claim, they measured nitrogen levels at the site both before planting and twenty-four months afterward.",
        question: "Which finding, if true, would most directly support the ecologists' claim?",
        choices: [
          "Nitrogen levels at the site were about 40% lower twenty-four months after planting than they had been beforehand.",
          "Local residents reported that the riverbank looked more attractive after the wetland plants were introduced.",
          "The wetland plants reintroduced to the site were native to the region rather than imported from elsewhere.",
          "Nitrogen levels at a nearby, unrelated river also fluctuated over the same two-year period."
        ],
        correct: 0,
        explanation: "The claim is specifically that water quality would improve after planting; a measured drop in nitrogen (A) is the only option that provides direct, quantitative evidence for that exact claim. B is about aesthetics, not water quality. C restates a premise rather than testing the outcome. D concerns a different, unrelated river."
      },
      {
        id: 'sat-info-3', domain: 'info', subtype: 'Inferences',
        text: "The archivist noticed that none of the letters in the collection were dated later than March, even though the correspondence clearly referenced events from the following autumn. This gap suggested to her that ______",
        question: "Which choice most logically completes the text?",
        choices: [
          "the letters from spring and summer had simply been misfiled among unrelated papers.",
          "a second batch of letters, covering the missing months, might exist somewhere else in the family's papers.",
          "the family had stopped writing letters to one another after the spring.",
          "the events described in the autumn correspondence had never actually taken place."
        ],
        correct: 1,
        explanation: "The passage says the letters reference autumn events despite none being dated past March — the most logical inference is that later letters exist but simply weren't in this particular collection (B). A doesn't explain why events are referenced that couldn't yet have happened. C and D both overreach past what the evidence supports."
      },

      /* ---- Craft & Structure ---- */
      {
        id: 'sat-craft-1', domain: 'craft', subtype: 'Words in Context',
        text: "Despite the coach's insistence that the new training schedule was rigorous, several veteran players found it surprisingly lax, complaining that the workouts left them barely winded.",
        question: "As used in the text, what does the word “lax” most nearly mean?",
        choices: ["strict", "lenient", "confusing", "exhausting"],
        correct: 1,
        vocab: { word: 'lax', def: 'Not strict or demanding; lenient or relaxed.' },
        explanation: "The players found the workouts left them 'barely winded' despite the coach calling the schedule rigorous — meaning the schedule was actually easy or undemanding, i.e. lax means lenient (B). Strict (A) is the opposite of the intended meaning."
      },
      {
        id: 'sat-craft-2', domain: 'craft', subtype: 'Text Structure & Purpose',
        text: "Marie Curie's early research into radioactivity was conducted in a converted shed with no proper ventilation. Despite the primitive conditions, she and her collaborators painstakingly isolated two new elements, polonium and radium, through repeated chemical separations. <u>It was only years later, once her methods were validated by other scientists, that the broader scientific community began to grasp the significance of her discoveries.</u>",
        question: "Which choice best describes the function of the underlined sentence in the text as a whole?",
        choices: [
          "It provides a contrast, showing that Curie's discoveries were dismissed until her death.",
          "It shifts the paragraph from describing Curie's working conditions and process to noting the delayed recognition of her results.",
          "It contradicts the claim made earlier in the paragraph that Curie's methods were primitive.",
          "It summarizes the specific chemical steps Curie used to isolate polonium and radium."
        ],
        correct: 1,
        explanation: "The paragraph moves from describing Curie's difficult conditions and methods to a new point about how recognition of her work came later — a shift in focus (B). A overstates a claim about timing ('until her death') that isn't in the text. C misreads 'primitive conditions' as being contradicted rather than simply acknowledged earlier. D describes the wrong part of the paragraph."
      },
      {
        id: 'sat-craft-3', domain: 'craft', subtype: 'Cross-Text Connections',
        text: "Text 1: Economist Rina Torres argues that remote work has permanently reduced downtown business-district foot traffic, and that cities should redesign these areas around housing and green space rather than office towers.<br><br>Text 2: Urban planner Devon Okafor counters that foot traffic in business districts has already rebounded to near pre-pandemic levels in most large cities, and that new development should continue to prioritize commercial office space downtown.",
        question: "Based on the texts, how would Okafor most likely respond to Torres's claim that remote work has permanently reduced downtown foot traffic?",
        choices: [
          "By agreeing that foot traffic has declined, but arguing that housing is a poor replacement for office towers.",
          "By pointing to data showing foot traffic has already returned to near pre-pandemic levels, challenging the idea that the decline is permanent.",
          "By claiming that remote work never had any measurable effect on downtown business districts.",
          "By suggesting that Torres's data about foot traffic was fabricated."
        ],
        correct: 1,
        explanation: "Okafor's stated position is that foot traffic 'has already rebounded to near pre-pandemic levels' — this directly challenges Torres's claim of a permanent reduction (B). A misrepresents Okafor as agreeing with the decline. C and D both go beyond anything stated in Text 2."
      },

      /* ---- Expression of Ideas ---- */
      {
        id: 'sat-expr-1', domain: 'expression', subtype: 'Rhetorical Synthesis',
        text: "A student is researching honeybees and has taken the following notes:<br>• Honeybee colonies communicate the location of food sources using a “waggle dance.”<br>• The angle of the dance relative to vertical indicates the direction to the food relative to the sun.<br>• The duration of the dance segment indicates how far away the food source is.<br>• Scientist Karl von Frisch first decoded this behavior in the 1940s.",
        question: "The student wants to explain how the waggle dance conveys both direction and distance. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        choices: [
          "Karl von Frisch, who studied honeybees in the 1940s, is credited with decoding the waggle dance.",
          "In the waggle dance, the angle of the dance relative to vertical signals direction toward the food, while the duration of the dance segment signals distance.",
          "Honeybee colonies rely on a waggle dance to communicate about food sources.",
          "The waggle dance was first studied scientifically several decades before it was fully understood."
        ],
        correct: 1,
        explanation: "The goal specifically requires explaining both direction and distance. Only B addresses both elements, pairing the angle (direction) with the duration (distance) from the notes. The others omit one or both elements or add irrelevant historical detail."
      },
      {
        id: 'sat-expr-2', domain: 'expression', subtype: 'Transitions',
        text: "The museum's new wing was designed to be nearly invisible from the street, tucked behind the original nineteenth-century facade. ______, once visitors step inside, they find a soaring atrium of glass and steel that bears no resemblance to the historic exterior.",
        question: "Which choice completes the text with the most logical transition?",
        choices: ["Similarly,", "For example,", "In other words,", "However,"],
        correct: 3,
        explanation: "The sentence sets up a contrast between the wing's unassuming exterior and its dramatic interior — “However” (D) signals that contrast. The other choices would signal similarity or restatement, which doesn't fit."
      },
      {
        id: 'sat-expr-3', domain: 'expression', subtype: 'Rhetorical Synthesis',
        text: "A student has taken the following notes about two types of tea processing:<br>• Green tea leaves are heated shortly after picking to prevent oxidation.<br>• Black tea leaves are fully oxidized before drying, which darkens them and changes their flavor.<br>• Oxidation is a chemical reaction triggered by exposing the leaf's enzymes to air.",
        question: "The student wants to contrast how green tea and black tea are processed. Which choice most effectively uses relevant information from the notes to accomplish this goal?",
        choices: [
          "Oxidation is a chemical reaction that occurs when a tea leaf's enzymes are exposed to air.",
          "Green tea leaves are heated soon after picking to prevent oxidation, while black tea leaves are fully oxidized before drying.",
          "Black tea is darker in color and different in flavor from green tea.",
          "Tea leaves must be picked before they can be processed into green or black tea."
        ],
        correct: 1,
        explanation: "The goal is a direct contrast between the two processing methods. B pairs the green-tea method (preventing oxidation) against the black-tea method (full oxidation) directly. A only defines oxidation in general. C states an effect, not the process. D is unrelated to the requested contrast."
      }
    ],

    /* ============================ ACT Reading ============================
       Each passage carries several grouped questions, matching the ACT's
       one-passage-many-questions format. Domains reuse the same info/craft
       taxonomy as SAT for unified progress tracking, though ACT itself
       doesn't officially name these sub-domains. */
    actReading: [
      {
        id: 'act-r-lights', title: 'Lights in the Deep',
        text: "More than half of all deep-sea creatures can produce their own light, a trait called bioluminescence. Far below the ocean's surface, where sunlight never reaches, this glow serves purposes that have little to do with illumination for its own sake. Some species use flashes of light to lure prey close enough to catch, dangling a glowing lure the way an anglerfish does. Others use bioluminescence defensively, releasing a sudden burst of light to startle a predator or briefly blind it, buying a moment to escape into the darkness. Still others use light for communication, flashing in patterns specific to their own species to attract mates in a place where visual courtship displays would otherwise be impossible. Researchers now suspect that bioluminescence evolved independently many separate times across very different groups of deep-sea organisms, a testament to how useful a self-made light source can be in a world without sun.",
        questions: [
          { domain: 'info', subtype: 'Detail', question: "According to the passage, anglerfish use bioluminescence primarily to:",
            choices: ["communicate with other anglerfish.", "attract prey.", "startle predators.", "navigate in darkness."], correct: 1,
            explanation: "The passage states anglerfish “dangl[e] a glowing lure” to draw prey close enough to catch — a predatory use (B), not communication, defense, or navigation." },
          { domain: 'craft', subtype: 'Words in Context', question: "As used in the passage, the word “testament” most nearly means:",
            choices: ["legal document", "evidence", "argument", "prediction"], correct: 1,
            vocab: { word: 'testament', def: 'Something that serves as evidence or proof of a fact or quality.' },
            explanation: "The passage calls the repeated independent evolution of bioluminescence “a testament to how useful” it is — meaning it serves as evidence of that usefulness (B)." },
          { domain: 'info', subtype: 'Inference', question: "It can reasonably be inferred from the passage that bioluminescent communication would be least useful in an environment that:",
            choices: ["has no natural light.", "contains many predators.", "is well-lit by sunlight.", "is deep underwater."], correct: 2,
            explanation: "The passage notes bioluminescent courtship works because “visual courtship displays would otherwise be impossible” in the dark — implying that where light already exists (C), a self-made glow would be less necessary to stand out." }
        ]
      },
      {
        id: 'act-r-press', title: 'The Press and the Page',
        text: "Before the mid-fifteenth century, most books in Europe were copied out by hand, a slow and expensive process that kept literacy largely confined to clergy, nobility, and a small class of professional scribes. The introduction of the movable-type printing press changed this arithmetic almost overnight. A single press could produce hundreds of copies of a text in the time it once took a scribe to finish one. As printed books grew cheaper and more widely available, more people had a practical reason to learn to read, and literacy rates across much of Europe began a slow but steady climb over the following two centuries. The press did not cause literacy to spread on its own, however; the growth also depended on the expansion of schools and on the fact that printers increasingly produced books in everyday spoken languages rather than only in Latin.",
        questions: [
          { domain: 'info', subtype: 'Central Idea', question: "Which choice best states the main idea of the passage?",
            choices: ["The printing press was invented in the mid-fifteenth century.", "The printing press alone was solely responsible for widespread literacy in Europe.", "By making books cheaper and more available, the printing press contributed to a gradual rise in literacy, alongside other factors.", "Scribes produced higher-quality books than printing presses did."], correct: 2,
            explanation: "The passage credits the press with making books cheaper and more available and contributing to literacy growth, but explicitly notes it “did not cause literacy to spread on its own” — so C best matches, while B overstates the press's role." },
          { domain: 'craft', subtype: 'Text Structure', question: "The final sentence of the passage primarily serves to:",
            choices: ["contradict the claim that literacy increased after the printing press was introduced.", "qualify the earlier claim by noting additional factors that contributed to rising literacy.", "introduce a new topic unrelated to literacy.", "provide a specific statistic about literacy rates."], correct: 1,
            explanation: "The final sentence adds nuance (“did not cause literacy to spread on its own”) rather than contradicting or replacing the earlier point — a qualification (B)." },
          { domain: 'info', subtype: 'Detail', question: "According to the passage, in addition to cheaper books, which factor contributed to rising literacy?",
            choices: ["an increase in the number of scribes", "the expansion of schools and the use of everyday languages in print", "a decline in the number of printing presses", "the exclusive use of Latin in printed books"], correct: 1,
            explanation: "The passage explicitly names “the expansion of schools” and printing “in everyday spoken languages rather than only in Latin” as additional contributing factors (B)." }
        ]
      },
      {
        id: 'act-r-chess', title: 'The Rook',
        text: "My grandfather always let me win our first game of chess and never again after that. “You'll thank me later,” he said, sliding his rook across the board to end my four-game winning streak on my tenth birthday. I sulked for the length of one lemonade. Only years afterward, hunched over a tournament board with the clock ticking down, did I understand what he meant: the sting of that loss had taught me to look two moves ahead instead of one, a habit that had nothing to do with lemonade and everything to do with him.",
        questions: [
          { domain: 'craft', subtype: 'Purpose', question: "The primary purpose of the passage is to:",
            choices: ["explain the official rules of chess.", "describe how an early loss shaped the narrator's later skill and appreciation for a lesson.", "argue that children should never be allowed to win games.", "criticize the grandfather's parenting decisions."], correct: 1,
            explanation: "The passage traces a single loss to a lasting lesson the narrator comes to value — B captures that narrative purpose. It isn't a rulebook (A), a general argument (C), or a criticism (D)." },
          { domain: 'craft', subtype: 'Words in Context', question: "As used in the passage, the word “sulked” most nearly means:",
            choices: ["celebrated", "practiced", "sat in a bad mood", "apologized"], correct: 2,
            vocab: { word: 'sulked', def: 'Showed displeasure or resentment by being silent, sullen, and withdrawn.' },
            explanation: "The narrator lost a winning streak and reacted for “the length of one lemonade” — a brief bad mood, matching “sulked” (C)." },
          { domain: 'info', subtype: 'Inference', question: "It can reasonably be inferred that the narrator's grandfather ended the winning streak in order to:",
            choices: ["prove he was the better chess player.", "discourage the narrator from playing chess again.", "teach the narrator to think further ahead in the game.", "punish the narrator for an unrelated reason."], correct: 2,
            explanation: "The narrator explicitly connects the loss to learning to “look two moves ahead” — implying the grandfather's intent was instructive (C), consistent with “You'll thank me later.”" }
        ]
      },
      {
        id: 'act-r-garden', title: 'The Lot on Ridge Street',
        text: "When a vacant lot on Ridge Street was converted into a community garden five years ago, few residents expected it to change much beyond the block's appearance. Since then, however, several nearby streets have reported lower rates of petty vandalism, and neighbors who once knew only the people on their own block now organize a shared harvest potluck each fall. Researchers studying similar gardens in other cities caution that a garden alone rarely transforms a neighborhood; rather, gardens tend to succeed as gathering spaces only where a small group of committed residents is willing to maintain them over time.",
        questions: [
          { domain: 'info', subtype: 'Detail', question: "According to the passage, what change did neighbors near the Ridge Street garden report, besides a change in the lot's appearance?",
            choices: ["increased petty vandalism", "lower rates of petty vandalism and new community gatherings", "a decrease in neighborhood population", "the closure of the garden after one year"], correct: 1,
            explanation: "The passage states “lower rates of petty vandalism” and describes a new “shared harvest potluck” — matching B." },
          { domain: 'info', subtype: 'Central Idea', question: "The researchers' caution mentioned in the passage primarily serves to:",
            choices: ["suggest that the Ridge Street garden's benefits were caused by the garden alone.", "argue that community gardens never produce social benefits.", "qualify the garden's apparent success by noting it also depends on sustained resident involvement.", "recommend that the Ridge Street garden be shut down."], correct: 2,
            explanation: "The final sentence notes success “only where a small group of committed residents is willing to maintain” the garden — a qualifying condition (C), not an outright denial (B) or full credit to the garden alone (A)." },
          { domain: 'craft', subtype: 'Words in Context', question: "As used in the passage, the word “committed” most nearly means:",
            choices: ["imprisoned", "dedicated", "undecided", "wealthy"], correct: 1,
            vocab: { word: 'committed', def: 'Dedicated to a cause, activity, or task; showing loyalty and steady effort.' },
            explanation: "“A small group of committed residents” willing to maintain the garden over time means dedicated residents (B)." }
        ]
      },
      {
        id: 'act-r-monarch', title: 'The Super Generation',
        text: "No single monarch butterfly completes the full migration between Canada and central Mexico; the journey instead spans three or four successive generations. A monarch born in the northern United States in late summer, however, is different from its short-lived summer relatives: it enters a state called reproductive diapause, delaying reproduction so that its body can store enough fat to fuel a flight of up to three thousand miles. This “super generation” can live eight months or more, long enough to fly south, overwinter in Mexican fir forests, and begin the journey back north before finally reproducing and dying, leaving the return trip to its offspring.",
        questions: [
          { domain: 'info', subtype: 'Detail', question: "According to the passage, what allows the “super generation” of monarchs to survive a migration lasting several months?",
            choices: ["a genetic mutation unique to that generation", "delayed reproduction that allows fat storage for the long flight", "traveling in much larger groups than other generations", "a shorter, less demanding migration route"], correct: 1,
            explanation: "The passage attributes the super generation's endurance to reproductive diapause, which lets it “store enough fat to fuel” the long flight (B)." },
          { domain: 'craft', subtype: 'Words in Context', question: "As used in the passage, the word “diapause” most nearly refers to a period of:",
            choices: ["accelerated growth", "suspended reproductive development", "migration", "hibernation underground"], correct: 1,
            vocab: { word: 'diapause', def: "A period during which an organism's development or reproduction is temporarily and naturally suspended." },
            explanation: "The passage defines it in context as “delaying reproduction” — suspended reproductive development (B)." },
          { domain: 'info', subtype: 'Inference', question: "It can reasonably be inferred from the passage that a monarch born in early summer, rather than late summer, would most likely:",
            choices: ["also live eight months and complete the full migration alone.", "have a shorter lifespan and not be part of the generation that migrates to Mexico.", "be genetically incapable of ever migrating.", "overwinter in Canada instead of Mexico."], correct: 1,
            explanation: "The passage contrasts the late-summer “super generation” with its “short-lived summer relatives,” implying earlier-summer monarchs live shorter lives and aren't the migrating generation (B)." }
        ]
      },
      {
        id: 'act-r-vinyl', title: 'The Return of the Record',
        text: "Vinyl record sales have grown for seventeen consecutive years, even as streaming remains the dominant way most people listen to music. This is not, researchers who study the format's resurgence argue, mere nostalgia for a technology many buyers are too young to remember firsthand. Instead, surveys of vinyl buyers point to two overlapping motivations: a desire for a tangible object connected to an artist, complete with liner notes and cover art, and a preference for the deliberate, single-album listening experience that vinyl encourages over the shuffled, algorithm-driven playlists common to streaming.",
        questions: [
          { domain: 'info', subtype: 'Central Idea', question: "Which choice best states the main idea of the passage?",
            choices: ["Vinyl records have completely replaced streaming as the most common way to listen to music.", "Vinyl's continued popularity is driven mainly by nostalgia among older listeners.", "Vinyl's growth reflects buyers' desire for tangible artifacts and deliberate listening, not just nostalgia.", "Streaming services have begun manufacturing their own vinyl records."], correct: 2,
            explanation: "The passage directly states researchers argue it “is not… mere nostalgia” and instead points to two other motivations — tangibility and deliberate listening — matching C." },
          { domain: 'craft', subtype: 'Text Structure', question: "The second sentence of the passage (“This is not… firsthand.”) primarily functions to:",
            choices: ["introduce a statistic about vinyl sales.", "rule out a common explanation before presenting the passage's actual explanation.", "contradict the first sentence's claim about sales growth.", "describe how vinyl records are physically manufactured."], correct: 1,
            explanation: "The sentence dismisses “mere nostalgia” as the explanation, setting up the two motivations described afterward — ruling out one explanation before giving the real one (B)." },
          { domain: 'info', subtype: 'Detail', question: "According to the passage, which two motivations do surveys attribute to vinyl buyers?",
            choices: ["lower price and better sound quality", "nostalgia and collectability", "a tangible connection to the artist and a preference for deliberate, single-album listening", "portability and convenience"], correct: 2,
            explanation: "The passage names “a desire for a tangible object connected to an artist” and “a preference for the deliberate, single-album listening experience” (C)." }
        ]
      }
    ]
  };
})();
