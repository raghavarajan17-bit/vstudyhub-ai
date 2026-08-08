import { Subject, Chapter, Formula, Flashcard, Quiz, NoteContent } from '../types';

export const SUBJECTS: Subject[] = [
  {
    id: 'physics',
    name: 'Physics',
    icon: 'Atom',
    color: 'from-blue-600 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'Mechanics, Electrodynamics, Optics, Thermodynamics & Modern Physics with mathematical rigor.',
    applicableExams: ['ALL', 'JEE', 'NEET'],
    totalChapters: 28,
    totalNotes: 140,
    totalFormulas: 320,
    totalQuizzes: 45,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: 'FlaskConical',
    color: 'from-emerald-600 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    description: 'Physical Chemistry numericals, Organic reaction mechanisms & Inorganic periodic trends.',
    applicableExams: ['ALL', 'JEE', 'NEET'],
    totalChapters: 30,
    totalNotes: 160,
    totalFormulas: 280,
    totalQuizzes: 50,
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: 'Calculator',
    color: 'from-indigo-600 to-purple-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    description: 'Calculus, Algebra, Coordinate Geometry, Vectors & 3D, and Trigonometry for JEE aspirants.',
    applicableExams: ['JEE'],
    totalChapters: 26,
    totalNotes: 120,
    totalFormulas: 410,
    totalQuizzes: 40,
  },
  {
    id: 'biology',
    name: 'Biology',
    icon: 'Dna',
    color: 'from-amber-600 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    description: 'NCERT-focused Botany & Zoology, Genetics, Ecology, Cell Biology, & Human Physiology.',
    applicableExams: ['NEET'],
    totalChapters: 38,
    totalNotes: 190,
    totalFormulas: 85,
    totalQuizzes: 60,
  },
];

export const MOCK_CHAPTERS: Chapter[] = [
  // Physics 11
  {
    id: 'phy-11-kinematics',
    subjectId: 'physics',
    classLevel: 'class_11',
    name: 'Kinematics & Motion in 1D/2D',
    code: 'PHY101',
    description: 'Position vectors, velocity, uniform acceleration, projectile motion, and relative velocity equations.',
    applicableExams: ['JEE', 'NEET'],
    weightagePercentage: 7,
    topics: [
      { id: 'top-101', title: 'Equations of Motion under Constant Acceleration', description: 's = ut + 0.5at^2, v^2 = u^2 + 2as', importance: 'High', estimatedTimeMins: 35, pyqFrequency: '2-3 per year', hasQuiz: true, hasFlashcards: true },
      { id: 'top-102', title: 'Projectile Motion on Horizontal & Inclined Planes', description: 'Time of flight, Range, Max height, Trajectory equation', importance: 'High', estimatedTimeMins: 45, pyqFrequency: '1-2 per year', hasQuiz: true, hasFlashcards: true },
      { id: 'top-103', title: 'Relative Motion in 1D & 2D (River-Swimmer)', description: 'Minimum distance of approach, velocity components', importance: 'Medium', estimatedTimeMins: 30, pyqFrequency: '1 per year', hasQuiz: true, hasFlashcards: true },
    ]
  },
  {
    id: 'phy-11-laws-of-motion',
    subjectId: 'physics',
    classLevel: 'class_11',
    name: 'Laws of Motion & Friction',
    code: 'PHY102',
    description: 'Newtonian mechanics, Free Body Diagrams (FBD), pulley systems, pseudo force, and static/kinetic friction.',
    applicableExams: ['JEE', 'NEET'],
    weightagePercentage: 8,
    topics: [
      { id: 'top-104', title: 'Free Body Diagrams & Constraint Equations', description: 'System of pulleys and connected bodies', importance: 'High', estimatedTimeMins: 40, pyqFrequency: '2 per year', hasQuiz: true, hasFlashcards: true },
      { id: 'top-105', title: 'Angle of Friction & Repose', description: 'Static vs Kinetic friction, block-on-block problems', importance: 'High', estimatedTimeMins: 50, pyqFrequency: '1-2 per year', hasQuiz: true, hasFlashcards: true },
    ]
  },
  // Physics 12
  {
    id: 'phy-12-electrostatics',
    subjectId: 'physics',
    classLevel: 'class_12',
    name: 'Electrostatics & Electric Dipole',
    code: 'PHY201',
    description: 'Coulomb law, Electric Field Intensity, Gauss Law, Electric Potential Energy, Dipole torque and potential.',
    applicableExams: ['JEE', 'NEET'],
    weightagePercentage: 9,
    topics: [
      { id: 'top-201', title: 'Gauss Law & Field Intensity Applications', description: 'Infinite line charge, spherical shell, non-conducting sphere', importance: 'High', estimatedTimeMins: 45, pyqFrequency: '2 per year', hasQuiz: true, hasFlashcards: true },
      { id: 'top-202', title: 'Electric Dipole Field & Potential', description: 'Axial and equatorial field calculations', importance: 'High', estimatedTimeMins: 35, pyqFrequency: '1-2 per year', hasQuiz: true, hasFlashcards: true },
    ]
  },
  {
    id: 'phy-12-optics',
    subjectId: 'physics',
    classLevel: 'class_12',
    name: 'Ray & Wave Optics',
    code: 'PHY202',
    description: 'Refraction at spherical surfaces, lens maker formula, prism dispersion, Youngs Double Slit Experiment (YDSE).',
    applicableExams: ['JEE', 'NEET'],
    weightagePercentage: 10,
    topics: [
      { id: 'top-203', title: 'Lens Maker Formula & Combination of Lenses', description: '1/f = (mu - 1)(1/R1 - 1/R2) and equivalent focal length', importance: 'High', estimatedTimeMins: 40, pyqFrequency: '2-3 per year', hasQuiz: true, hasFlashcards: true },
      { id: 'top-204', title: 'Youngs Double Slit Experiment (YDSE)', description: 'Fringe width beta = lambda D / d, optical path difference', importance: 'High', estimatedTimeMins: 50, pyqFrequency: '2 per year', hasQuiz: true, hasFlashcards: true },
    ]
  },

  // Chemistry 11
  {
    id: 'chem-11-bonding',
    subjectId: 'chemistry',
    classLevel: 'class_11',
    name: 'Chemical Bonding & Molecular Structure',
    code: 'CHM101',
    description: 'VSEPR Theory, Hybridization, Molecular Orbital Theory (MOT), Hydrogen bonding, Dipole Moment.',
    applicableExams: ['JEE', 'NEET'],
    weightagePercentage: 9,
    topics: [
      { id: 'top-301', title: 'VSEPR & Geometry of Molecules', description: 'Predicting lone pair-bond pair repulsive shapes', importance: 'High', estimatedTimeMins: 40, pyqFrequency: '2 per year', hasQuiz: true, hasFlashcards: true },
      { id: 'top-302', title: 'Molecular Orbital Theory (MOT) & Bond Order', description: 'Sigma and pi orbitals, paramagnetic vs diamagnetic nature', importance: 'High', estimatedTimeMins: 45, pyqFrequency: '2-3 per year', hasQuiz: true, hasFlashcards: true },
    ]
  },
  // Chemistry 12
  {
    id: 'chem-12-organic-mechanisms',
    subjectId: 'chemistry',
    classLevel: 'class_12',
    name: 'Organic Reaction Mechanisms (SN1, SN2, E1, E2)',
    code: 'CHM201',
    description: 'Nucleophilic substitution, elimination reactions, stereochemistry, carbocation rearrangements.',
    applicableExams: ['JEE', 'NEET'],
    weightagePercentage: 11,
    topics: [
      { id: 'top-303', title: 'SN1 vs SN2 Mechanism & Kinetics', description: 'Substrate effect, solvent polarity, inversion vs racemization', importance: 'High', estimatedTimeMins: 50, pyqFrequency: '3 per year', hasQuiz: true, hasFlashcards: true },
      { id: 'top-304', title: 'Aldol Condensation & Cannizzaro Reaction', description: 'Enolate ion formation, alpha hydrogen acidity, cross-aldol', importance: 'High', estimatedTimeMins: 55, pyqFrequency: '2-3 per year', hasQuiz: true, hasFlashcards: true },
    ]
  },

  // Mathematics (JEE Only)
  {
    id: 'math-12-calculus-integration',
    subjectId: 'mathematics',
    classLevel: 'class_12',
    name: 'Indefinite & Definite Integration',
    code: 'MTH201',
    description: 'Integration by parts, partial fractions, trigonometric substitutions, Newton-Leibniz formula.',
    applicableExams: ['JEE'],
    weightagePercentage: 12,
    topics: [
      { id: 'top-401', title: 'Definite Integral Properties & King Property', description: 'Integral from a to b f(x)dx = integral f(a+b-x)dx', importance: 'High', estimatedTimeMins: 60, pyqFrequency: '3-4 per year', hasQuiz: true, hasFlashcards: true },
      { id: 'top-402', title: 'Newton-Leibniz Rule for Differentiation', description: 'd/dx integral from g(x) to h(x) f(t)dt', importance: 'High', estimatedTimeMins: 40, pyqFrequency: '2 per year', hasQuiz: true, hasFlashcards: true },
    ]
  },
  {
    id: 'math-12-vectors-3d',
    subjectId: 'mathematics',
    classLevel: 'class_12',
    name: 'Vector Algebra & 3D Geometry',
    code: 'MTH202',
    description: 'Dot and Cross product, Scalar Triple Product (STP), Vector Triple Product, equations of lines and planes in 3D.',
    applicableExams: ['JEE'],
    weightagePercentage: 11,
    topics: [
      { id: 'top-403', title: 'Shortest Distance Between Skew Lines', description: 'd = |(a2 - a1) . (b1 x b2)| / |b1 x b2|', importance: 'High', estimatedTimeMins: 45, pyqFrequency: '2 per year', hasQuiz: true, hasFlashcards: true },
    ]
  },

  // Biology (NEET Only)
  {
    id: 'bio-11-human-physio',
    subjectId: 'biology',
    classLevel: 'class_11',
    name: 'Human Physiology & Neural Control',
    code: 'BIO101',
    description: 'Conduction of nerve impulse, reflex arc, endocrine hormones, mechanism of hormone action.',
    applicableExams: ['NEET'],
    weightagePercentage: 14,
    topics: [
      { id: 'top-501', title: 'Generation & Conduction of Nerve Impulse', description: 'Resting membrane potential, action potential, Na+/K+ pump', importance: 'High', estimatedTimeMins: 45, pyqFrequency: '3 per year', hasQuiz: true, hasFlashcards: true },
    ]
  },
  {
    id: 'bio-12-genetics',
    subjectId: 'biology',
    classLevel: 'class_12',
    name: 'Genetics & Molecular Basis of Inheritance',
    code: 'BIO201',
    description: 'Mendelian inheritance, DNA replication, transcription, lac operon, human genome project.',
    applicableExams: ['NEET'],
    weightagePercentage: 15,
    topics: [
      { id: 'top-502', title: 'DNA Replication Mechanism & Enzymes', description: 'DNA Polymerase, Helicase, Okazaki fragments, primers', importance: 'High', estimatedTimeMins: 50, pyqFrequency: '4 per year', hasQuiz: true, hasFlashcards: true },
      { id: 'top-503', title: 'Lac Operon Model', description: 'Inducible operon, promoter, operator, repressor protein, beta-galactosidase', importance: 'High', estimatedTimeMins: 40, pyqFrequency: '2-3 per year', hasQuiz: true, hasFlashcards: true },
    ]
  },
];

export const MOCK_FORMULAS: Formula[] = [
  {
    id: 'form-1',
    title: 'Range & Time of Flight of Projectile',
    subjectId: 'physics',
    classLevel: 'class_11',
    chapterId: 'phy-11-kinematics',
    chapterName: 'Kinematics & Motion',
    category: 'Mechanics',
    latex: 'T = \\frac{2u \\sin\\theta}{g}, \\quad R = \\frac{u^2 \\sin 2\\theta}{g}, \\quad H_{max} = \\frac{u^2 \\sin^2\\theta}{2g}',
    description: 'Derivation based on splitting initial velocity into orthogonal horizontal (u cos theta) and vertical (u sin theta) components.',
    variables: [
      { symbol: 'u', meaning: 'Initial launch velocity', unit: 'm/s' },
      { symbol: '\\theta', meaning: 'Angle of projection above horizontal', unit: 'degrees/rad' },
      { symbol: 'g', meaning: 'Acceleration due to gravity', unit: '9.8 m/s²' },
    ],
    examTips: 'Maximum horizontal range occurs when theta = 45°. Complementary angles (theta and 90° - theta) yield the exact same horizontal range R.',
    applicableExams: ['JEE', 'NEET'],
  },
  {
    id: 'form-2',
    title: 'Lens Maker Formula & Power',
    subjectId: 'physics',
    classLevel: 'class_12',
    chapterId: 'phy-12-optics',
    chapterName: 'Ray & Wave Optics',
    category: 'Optics',
    latex: '\\frac{1}{f} = \\left(\\frac{\\mu_{lens}}{\\mu_{medium}} - 1\\right) \\left(\\frac{1}{R_1} - \\frac{1}{R_2}\\right), \\quad P = \\frac{1}{f (m)}',
    description: 'Relates the focal length of a thin lens to its refractive index and radii of curvature of both curved surfaces.',
    variables: [
      { symbol: 'f', meaning: 'Focal length of lens', unit: 'meters' },
      { symbol: '\\mu', meaning: 'Refractive index ratio', unit: 'dimensionless' },
      { symbol: 'R_1, R_2', meaning: 'Radii of curvature using Cartesian sign convention', unit: 'meters' },
    ],
    examTips: 'A biconcave lens in air always acts as a diverging lens with negative focal length. Watch sign conventions strictly for R1 and R2!',
    applicableExams: ['JEE', 'NEET'],
  },
  {
    id: 'form-3',
    title: 'Youngs Double Slit Fringe Width (YDSE)',
    subjectId: 'physics',
    classLevel: 'class_12',
    chapterId: 'phy-12-optics',
    chapterName: 'Ray & Wave Optics',
    category: 'Optics',
    latex: '\\beta = \\frac{\\lambda D}{d}, \\quad y_n = \\frac{n \\lambda D}{d} \\text{ (Bright Fringe)}',
    description: 'Measures the spatial distance between two adjacent bright or dark interference fringes on a screen.',
    variables: [
      { symbol: '\\lambda', meaning: 'Wavelength of light source', unit: 'nm or meters' },
      { symbol: 'D', meaning: 'Distance from slits plane to screen', unit: 'meters' },
      { symbol: 'd', meaning: 'Separation distance between the two coherent slits', unit: 'mm' },
    ],
    examTips: 'Immersing the entire YDSE apparatus in a liquid of refractive index mu reduces fringe width to beta / mu.',
    applicableExams: ['JEE', 'NEET'],
  },
  {
    id: 'form-4',
    title: 'Bond Order in Molecular Orbital Theory (MOT)',
    subjectId: 'chemistry',
    classLevel: 'class_11',
    chapterId: 'chem-11-bonding',
    chapterName: 'Chemical Bonding',
    category: 'Inorganic',
    latex: '\\text{Bond Order} = \\frac{N_b - N_a}{2}',
    description: 'Calculates bond strength, stability, and bond length. Higher bond order means shorter, stronger chemical bonds.',
    variables: [
      { symbol: 'N_b', meaning: 'Total electrons in bonding molecular orbitals', unit: 'count' },
      { symbol: 'N_a', meaning: 'Total electrons in anti-bonding molecular orbitals (*)', unit: 'count' },
    ],
    examTips: 'Species with Bond Order = 0 cannot exist (e.g. He2). Fractional bond orders indicate resonance structures.',
    applicableExams: ['JEE', 'NEET'],
  },
  {
    id: 'form-5',
    title: 'Arrhenius Equation for Rate Constant',
    subjectId: 'chemistry',
    classLevel: 'class_12',
    chapterId: 'chem-12-organic-mechanisms',
    chapterName: 'Chemical Kinetics',
    category: 'Physical Chem',
    latex: 'k = A e^{-\\frac{E_a}{RT}} \\implies \\log_{10} \\left(\\frac{k_2}{k_1}\\right) = \\frac{E_a}{2.303 R} \\left(\\frac{T_2 - T_1}{T_1 T_2}\\right)',
    description: 'Describes temperature dependence of reaction rates and activation energy barrier.',
    variables: [
      { symbol: 'k', meaning: 'Specific rate constant', unit: 's^-1 or M^-1 s^-1' },
      { symbol: 'E_a', meaning: 'Activation energy', unit: 'J/mol' },
      { symbol: 'R', meaning: 'Universal gas constant', unit: '8.314 J/mol K' },
    ],
    examTips: 'For every 10°C rise in temperature, reaction rate constant approximately doubles (Temperature Coefficient approx 2 to 3).',
    applicableExams: ['JEE', 'NEET'],
  },
  {
    id: 'form-6',
    title: 'Newton-Leibniz Differentiation Rule',
    subjectId: 'mathematics',
    classLevel: 'class_12',
    chapterId: 'math-12-calculus-integration',
    chapterName: 'Definite Integration',
    category: 'Calculus',
    latex: '\\frac{d}{dx} \\left[ \\int_{g(x)}^{h(x)} f(t) dt \\right] = f(h(x)) \\cdot h\'(x) - f(g(x)) \\cdot g\'(x)',
    description: 'Used to differentiate definite integrals whose limits are functions of x.',
    variables: [
      { symbol: 'h(x)', meaning: 'Upper variable limit of integration', unit: '-' },
      { symbol: 'g(x)', meaning: 'Lower variable limit of integration', unit: '-' },
    ],
    examTips: 'Crucial for solving 0/0 limits containing integrals using L’Hopital’s Rule in JEE Advanced.',
    applicableExams: ['JEE'],
  },
  {
    id: 'form-7',
    title: 'Shortest Distance Between Skew Lines in 3D',
    subjectId: 'mathematics',
    classLevel: 'class_12',
    chapterId: 'math-12-vectors-3d',
    chapterName: 'Vector Algebra & 3D Geometry',
    category: 'Vectors & 3D',
    latex: 'd = \\left| \\frac{(\\vec{a_2} - \\vec{a_1}) \\cdot (\\vec{b_1} \\times \\vec{b_2})}{|\\vec{b_1} \\times \\vec{b_2}|} \\right|',
    description: 'Evaluates the minimum perpendicular distance between two non-intersecting, non-parallel lines in 3D space.',
    variables: [
      { symbol: '\\vec{a_1}, \\vec{a_2}', meaning: 'Position vectors of points on lines 1 and 2', unit: '-' },
      { symbol: '\\vec{b_1}, \\vec{b_2}', meaning: 'Direction vectors of lines 1 and 2', unit: '-' },
    ],
    examTips: 'If the scalar triple product (a2 - a1) . (b1 x b2) = 0, the two lines are coplanar and intersect!',
    applicableExams: ['JEE'],
  },
];

export const MOCK_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    subjectId: 'physics',
    classLevel: 'class_11',
    chapterId: 'phy-11-kinematics',
    chapterName: 'Kinematics',
    question: 'What is the angle of projection for maximum range on a flat horizontal plane?',
    answer: 'θ = 45°. At 45°, sin(2θ) = sin(90°) = 1, maximizing R = (u² sin 2θ) / g.',
    latexFormula: 'R_{max} = \\frac{u^2}{g} \\quad \\text{at } \\theta = 45^\\circ',
    difficulty: 'Easy',
    tags: ['Kinematics', 'Projectile', 'JEE Main', 'NEET'],
    applicableExams: ['JEE', 'NEET'],
  },
  {
    id: 'fc-2',
    subjectId: 'physics',
    classLevel: 'class_12',
    chapterId: 'phy-12-optics',
    chapterName: 'Ray Optics',
    question: 'What happens to the fringe width in YDSE when the apparatus is immersed in water (μ = 4/3)?',
    answer: 'The fringe width decreases to β\' = β / μ. In water, wavelength λ\' = λ / μ, so fringes get compressed closer together.',
    latexFormula: '\\beta\' = \\frac{\\beta}{\\mu} = \\frac{3}{4} \\beta',
    difficulty: 'Medium',
    tags: ['Optics', 'Wave Optics', 'YDSE'],
    applicableExams: ['JEE', 'NEET'],
  },
  {
    id: 'fc-3',
    subjectId: 'chemistry',
    classLevel: 'class_11',
    chapterId: 'chem-11-bonding',
    chapterName: 'Chemical Bonding',
    question: 'Why is O₂ paramagnetic according to Molecular Orbital Theory (MOT)?',
    answer: 'O₂ contains 16 total electrons. Filling MOs leaves 2 unpaired electrons in degenerate anti-bonding π*2p_x and π*2p_y orbitals.',
    difficulty: 'Medium',
    tags: ['MOT', 'Paramagnetism', 'NCERT High-Yield'],
    applicableExams: ['JEE', 'NEET'],
  },
  {
    id: 'fc-4',
    subjectId: 'chemistry',
    classLevel: 'class_12',
    chapterId: 'chem-12-organic-mechanisms',
    chapterName: 'Organic Reactions',
    question: 'Which substrate reacts fastest in SN1 nucleophilic substitution?',
    answer: '3° Alkyl Halides (Tertiary) > 2° > 1°. SN1 speed depends on carbocation stability (3° carbocation stabilized by hyperconjugation and +I effect). Polar protic solvents favor SN1.',
    difficulty: 'Easy',
    tags: ['SN1', 'Carbocation', 'Organic Chemistry'],
    applicableExams: ['JEE', 'NEET'],
  },
  {
    id: 'fc-5',
    subjectId: 'biology',
    classLevel: 'class_12',
    chapterId: 'bio-12-genetics',
    chapterName: 'Genetics & Inheritance',
    question: 'What are the 3 structural genes of the Lac Operon and their enzymes?',
    answer: '1) z gene → β-galactosidase (breaks lactose into glucose + galactose)\n2) y gene → Permease (increases membrane permeability to lactose)\n3) a gene → Transacetylase',
    mnemonicsOrTip: 'Mnemonic: "Z-Y-A" → "Gal-Per-Trans"',
    difficulty: 'Medium',
    tags: ['Lac Operon', 'NEET High Weightage'],
    applicableExams: ['NEET'],
  },
  {
    id: 'fc-6',
    subjectId: 'mathematics',
    classLevel: 'class_12',
    chapterId: 'math-12-calculus-integration',
    chapterName: 'Definite Integration',
    question: 'State King’s Property of Definite Integration.',
    answer: '∫[a to b] f(x) dx = ∫[a to b] f(a + b - x) dx. For [0 to a], ∫[0 to a] f(x) dx = ∫[0 to a] f(a - x) dx.',
    latexFormula: '\\int_a^b f(x) dx = \\int_a^b f(a + b - x) dx',
    difficulty: 'Easy',
    tags: ['Calculus', 'JEE Main', 'Integration'],
    applicableExams: ['JEE'],
  },
];

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz-phy-11-kin',
    title: 'Kinematics Mastery Quiz (JEE/NEET Level)',
    subjectId: 'physics',
    chapterId: 'phy-11-kinematics',
    chapterName: 'Kinematics & Motion in 1D/2D',
    applicableExams: ['JEE', 'NEET'],
    timeLimitMins: 10,
    questions: [
      {
        id: 'q-101',
        questionText: 'A particle is projected with a speed u at an angle θ with horizontal. Its speed when it reaches maximum height is:',
        latex: 'v_{top} = ?',
        options: ['Zero', 'u sin θ', 'u cos θ', 'u'],
        correctAnswerIndex: 2,
        explanation: 'At maximum height, the vertical component of velocity becomes zero (v_y = 0). The horizontal velocity remains constant throughout projectile motion in absence of air resistance, i.e., v_x = u cos θ.',
        examTag: 'NEET PYQ',
        difficulty: 'Easy',
        subjectId: 'physics',
        chapterId: 'phy-11-kinematics',
      },
      {
        id: 'q-102',
        questionText: 'Two projectiles are thrown with the same initial velocity u at complementary angles θ and (90° - θ). The ratio of their horizontal ranges R1 : R2 is:',
        options: ['1 : 1', '1 : 2', 'tan² θ : 1', 'sin θ : cos θ'],
        correctAnswerIndex: 0,
        explanation: 'Range R = (u² sin 2θ)/g. For 90° - θ, R2 = u² sin[2(90° - θ)]/g = u² sin(180° - 2θ)/g = u² sin 2θ/g = R1. Thus R1 : R2 = 1 : 1.',
        examTag: 'JEE Main',
        difficulty: 'Easy',
        subjectId: 'physics',
        chapterId: 'phy-11-kinematics',
      },
      {
        id: 'q-103',
        questionText: 'A car accelerates from rest at constant rate α for some time, after which it decelerates at constant rate β to come to rest. If total time elapsed is t, the maximum speed attained by the car is:',
        latex: 'v_{max} = \\frac{\\alpha \\beta t}{\\alpha + \\beta}',
        options: [
          '(\\alpha + \\beta) t / (\\alpha \\beta)',
          '(\\alpha \\beta t) / (\\alpha + \\beta)',
          '(\\alpha^2 \\beta t) / (\\alpha + \\beta)',
          '(\\alpha t) / (\\alpha + \\beta)'
        ],
        correctAnswerIndex: 1,
        explanation: 'v_max = α t1 = β t2, and t1 + t2 = t. Substituting t1 = v_max/α and t2 = v_max/β into t1 + t2 = t gives v_max (1/α + 1/β) = t => v_max = (α β t) / (α + β).',
        examTag: 'JEE Main',
        difficulty: 'Medium',
        subjectId: 'physics',
        chapterId: 'phy-11-kinematics',
      },
    ]
  },
  {
    id: 'quiz-chem-11-bond',
    title: 'Chemical Bonding & MOT Challenge',
    subjectId: 'chemistry',
    chapterId: 'chem-11-bonding',
    chapterName: 'Chemical Bonding & Molecular Structure',
    applicableExams: ['JEE', 'NEET'],
    timeLimitMins: 10,
    questions: [
      {
        id: 'q-201',
        questionText: 'Which of the following diatomic species has the highest bond order and paramagnetic behavior?',
        options: ['O₂', 'O₂⁺', 'O₂⁻', 'O₂²⁻'],
        correctAnswerIndex: 1,
        explanation: 'O₂ has BO = 2.0 (16 e-). O₂⁺ has 15 e- (BO = 2.5, paramagnetic with 1 unpaired e-). O₂⁻ has 17 e- (BO = 1.5). O₂²⁻ has 18 e- (BO = 1.0, diamagnetic). Thus O₂⁺ has highest bond order (2.5) and is paramagnetic.',
        examTag: 'NEET PYQ',
        difficulty: 'Medium',
        subjectId: 'chemistry',
        chapterId: 'chem-11-bonding',
      },
      {
        id: 'q-202',
        questionText: 'According to VSEPR theory, the shape and geometry of XeF₄ molecule are:',
        options: ['Square planar geometry, octahedral shape', 'Octahedral geometry, square planar shape', 'Tetrahedral geometry, square planar shape', 'Square pyramidal geometry, octahedral shape'],
        correctAnswerIndex: 1,
        explanation: 'Xe has 8 valence electrons. In XeF₄, 4 electrons form single bonds with F, leaving 2 lone pairs. Steric number = 4 + 2 = 6 (Octahedral electron pair geometry). The 2 lone pairs occupy axial positions to minimize repulsions, giving a Square Planar molecular shape.',
        examTag: 'JEE Main',
        difficulty: 'Medium',
        subjectId: 'chemistry',
        chapterId: 'chem-11-bonding',
      },
    ]
  }
];

export const MOCK_NOTES: NoteContent[] = [
  {
    id: 'note-kinematics-01',
    chapterId: 'phy-11-kinematics',
    topicId: 'top-101',
    title: 'Complete Motion in 1D & 2D: Formulas, Graphs & Tricks',
    subjectId: 'physics',
    classLevel: 'class_11',
    applicableExams: ['JEE', 'NEET'],
    overview: 'Kinematics is the foundation of Classical Mechanics. It examines motion without inquiring into the underlying forces causing it.',
    sections: [
      {
        heading: '1. Fundamental Definitions & Vector Representation',
        body: 'Displacement is the shortest straight-line distance vector between initial and final points. Average velocity is total displacement divided by total time, whereas average speed is total path length divided by total time.',
        latexFormula: '\\vec{v}_{avg} = \\frac{\\Delta \\vec{r}}{\\Delta t}, \\quad \\vec{v}_{inst} = \\frac{d\\vec{r}}{dt} = \\lim_{\\Delta t \\to 0} \\frac{\\Delta \\vec{r}}{\\Delta t}',
        keyPoints: [
          'Magnitude of average velocity is <= average speed.',
          'Area under v-t graph represents displacement, while area under speed-time graph represents total distance.',
          'Slope of x-t graph gives velocity; slope of v-t graph gives acceleration.'
        ],
        commonMistakes: [
          'Confusing distance with displacement when motion reverses direction.',
          'Applying equations of motion (v = u + at) when acceleration is NOT constant.'
        ]
      },
      {
        heading: '2. Motion Under Constant Acceleration',
        body: 'When acceleration vector is uniform in both magnitude and direction, scalar kinematics equations apply along individual Cartesian axes.',
        latexFormula: 'v = u + at, \\quad s = ut + \\frac{1}{2}at^2, \\quad v^2 = u^2 + 2as, \\quad s_n = u + \\frac{a}{2}(2n - 1)',
        exampleProblem: {
          problem: 'A body moving with uniform acceleration covers 20m in the 2nd second and 30m in the 4th second. Find its initial velocity u and acceleration a.',
          solution: 'Using s_n = u + a/2(2n-1):\nFor n=2: u + 1.5a = 20\nFor n=4: u + 3.5a = 30\nSubtracting: 2a = 10 => a = 5 m/s².\nSubstitute a=5 into first eq: u + 1.5(5) = 20 => u = 12.5 m/s.',
          trick: 'Subtracting consecutive nth second equations directly gives a * (difference in seconds).'
        }
      },
      {
        heading: '3. Horizontal Projectile Motion Analysis',
        body: 'Motion of a projectile can be resolved into two independent 1D motions: Horizontal (zero acceleration) and Vertical (constant downwards acceleration g).',
        latexFormula: 'T = \\frac{2u \\sin\\theta}{g}, \\quad R = \\frac{u^2 \\sin 2\\theta}{g}, \\quad y = x \\tan\\theta - \\frac{g x^2}{2 u^2 \\cos^2\\theta}',
        keyPoints: [
          'Horizontal component u_x = u cos theta remains invariant.',
          'Vertical velocity at highest point is zero.',
          'Speed at any instant t is v = sqrt(v_x^2 + v_y^2).'
        ]
      }
    ],
    summaryTakeaways: [
      'Constant acceleration equations MUST NOT be used when a depends on time t or position x.',
      'For variable acceleration, always integrate: v = dx/dt, a = dv/dt = v (dv/dx).',
      'Trajectory of a projectile in uniform gravitational field is parabolic.'
    ],
    lastUpdated: '2026-07-20',
  },
  {
    id: 'note-bonding-01',
    chapterId: 'chem-11-bonding',
    topicId: 'top-301',
    title: 'Chemical Bonding: VSEPR, MOT & Hybridization Decoded',
    subjectId: 'chemistry',
    classLevel: 'class_11',
    applicableExams: ['JEE', 'NEET'],
    overview: 'Chemical bonding explains how atoms combine to form stable compounds through electron transfer, sharing, or delocalization.',
    sections: [
      {
        heading: '1. Hybridization & Steric Number Rule',
        body: 'Hybridization involves mixing of atomic orbitals of slightly different energies to produce equivalent hybrid orbitals.',
        latexFormula: '\\text{Steric Number (SN)} = \\frac{1}{2} \\left[ V + M - C + A \\right]',
        keyPoints: [
          'SN = 2 → sp (Linear, 180°)',
          'SN = 3 → sp² (Trigonal Planar, 120°)',
          'SN = 4 → sp³ (Tetrahedral, 109.5°)',
          'SN = 5 → sp³d (Trigonal Bipyramidal, 90° & 120°)',
          'SN = 6 → sp³d² (Octahedral, 90°)'
        ]
      },
      {
        heading: '2. Molecular Orbital Theory (MOT) & Magnetic Behavior',
        body: 'Atomic orbitals combine constructively and destructively to form bonding (lower energy) and antibonding (higher energy) molecular orbitals.',
        latexFormula: '\\text{Bond Order} = \\frac{N_b - N_a}{2}',
        exampleProblem: {
          problem: 'Compare stability and magnetic nature of N₂ and N₂⁺.',
          solution: 'N₂ has 14 electrons: (σ1s)² (σ*1s)² (σ2s)² (σ*2s)² (π2p_x)²=(π2p_y)² (σ2p_z)². Nb = 10, Na = 4 => BO = (10 - 4)/2 = 3. All electrons paired -> Diamagnetic.\nN₂⁺ has 13 electrons => BO = (9 - 4)/2 = 2.5. One unpaired electron in σ2p_z => Paramagnetic.\nSince N₂ has higher BO (3 > 2.5), N₂ is more stable than N₂⁺.',
          trick: 'For molecules with <= 14 electrons, π2p orbitals fill BEFORE σ2p_z orbital.'
        }
      }
    ],
    summaryTakeaways: [
      'Lone pair repulsions follow order: LP-LP > LP-BP > BP-BP.',
      'Higher Bond Order corresponds to higher Bond Energy and shorter Bond Length.'
    ],
    lastUpdated: '2026-07-22',
  }
];

export const QUICK_DAILY_MOTIVATION = [
  "“Success in JEE & NEET is not about how smart you are, but how consistently you revise.”",
  "“Focus on concepts today. Problem-solving speed is a natural side effect of clear fundamentals.”",
  "“Every mistake in a practice quiz is one less mistake in your final exam paper!”"
];
