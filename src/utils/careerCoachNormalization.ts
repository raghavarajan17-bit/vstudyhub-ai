import { CareerAnalysis, ResumeImprovement, ActionPlanItem } from '../types/careerCoach.types';

/**
 * Clamps numeric value safely between min and max (default 0 to 100).
 */
export function clampScore(val: unknown, fallback: number = 70): number {
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num) || !isFinite(num)) return fallback;
  return Math.min(100, Math.max(0, Math.round(num)));
}

/**
 * Normalizes an unknown value to an array of non-empty strings.
 */
export function normalizeStringArray(raw: unknown, defaultItems: string[] = []): string[] {
  if (Array.isArray(raw)) {
    const cleaned = raw
      .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
      .filter((item) => item.length > 0);
    if (cleaned.length > 0) return cleaned;
  } else if (typeof raw === 'string' && raw.trim().length > 0) {
    // If returned as a newline or bullet separated string
    const lines = raw
      .split(/\n|•|\*/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (lines.length > 0) return lines;
  }
  return defaultItems;
}

/**
 * Normalizes resume improvements to canonical ResumeImprovement array.
 */
export function normalizeResumeImprovements(raw: unknown): ResumeImprovement[] {
  const defaultImprovements: ResumeImprovement[] = [
    {
      title: 'Quantify Achievements with Google XYZ Formula',
      description: 'Rewrite bullet points using "Accomplished [X] as measured by [Y], by doing [Z]" with measurable percentages and performance gains.',
      priority: 'high',
    },
    {
      title: 'Target Keyword Alignment for ATS Parsers',
      description: 'Incorporate explicit core competencies and target role keywords directly beneath your summary header.',
      priority: 'high',
    },
    {
      title: 'Standardize Section Formatting & Metrics',
      description: 'Standardize employment dates to Month YYYY and eliminate generic descriptions in favor of business-impact verbs.',
      priority: 'medium',
    },
  ];

  if (!Array.isArray(raw) || raw.length === 0) {
    return defaultImprovements;
  }

  const result: ResumeImprovement[] = [];
  for (const item of raw) {
    if (typeof item === 'string' && item.trim().length > 0) {
      result.push({
        title: item.slice(0, 50).trim(),
        description: item.trim(),
        priority: 'high',
      });
    } else if (item && typeof item === 'object') {
      const title = String(item.title || item.suggestion || item.point || 'Resume Enhancement').trim();
      const description = String(item.description || item.detail || item.action || title).trim();
      let priority: 'high' | 'medium' | 'low' = 'medium';
      const rawPriority = String(item.priority || '').toLowerCase();
      if (rawPriority === 'high' || rawPriority === 'critical') priority = 'high';
      else if (rawPriority === 'low') priority = 'low';
      else if (rawPriority === 'medium') priority = 'medium';

      if (title.length > 0 || description.length > 0) {
        result.push({ title: title || 'Improvement Point', description: description || title, priority });
      }
    }
  }

  return result.length > 0 ? result : defaultImprovements;
}

/**
 * Normalizes action plan to canonical ActionPlanItem array.
 */
export function normalizeActionPlan(raw: unknown, rawThirtyDay?: unknown): ActionPlanItem[] {
  const defaultPlan: ActionPlanItem[] = [
    { day: 1, action: 'Format resume header, standardize dates, and place Core Skills ATS block.' },
    { day: 7, action: 'Quantify top 3 job impact metrics using the Google XYZ formula.' },
    { day: 14, action: 'Complete a focused portfolio project demonstrating target role competencies.' },
    { day: 21, action: 'Prepare STAR-framework responses for predicted technical interview questions.' },
    { day: 30, action: 'Launch targeted applications and connect with recruiters in target domain.' },
  ];

  const source = Array.isArray(raw) && raw.length > 0 ? raw : (Array.isArray(rawThirtyDay) && rawThirtyDay.length > 0 ? rawThirtyDay : null);
  if (!source) return defaultPlan;

  const result: ActionPlanItem[] = [];
  let dayCounter = 1;

  for (const item of source) {
    if (typeof item === 'string' && item.trim().length > 0) {
      result.push({ day: dayCounter, action: item.trim() });
      dayCounter += 7;
    } else if (item && typeof item === 'object') {
      const day = typeof item.day === 'number' && !isNaN(item.day) ? item.day : dayCounter;
      const action = String(item.action || item.task || item.description || '').trim();
      if (action.length > 0) {
        result.push({ day, action });
        dayCounter = day + 7;
      }
    }
  }

  return result.length > 0 ? result : defaultPlan;
}

/**
 * Normalizes and validates the AI response into a canonical CareerAnalysis object.
 */
export function normalizeCareerAnalysis(raw: any, targetRole: string = 'Target Role'): CareerAnalysis {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid analysis data format received.');
  }

  const overallScore = clampScore(raw.overallScore, 72);
  const jobMatchScore = clampScore(raw.jobMatchScore, 70);
  const atsScore = clampScore(raw.atsScore, 68);

  const strengths = normalizeStringArray(raw.strengths, [
    'Demonstrated technical background with applicable industry domain skills.',
    'Clear academic foundation and relevant experience trajectory.',
    'Evidence of project problem solving and initiative.'
  ]);

  const weaknesses = normalizeStringArray(raw.weaknesses, [
    'Quantitative business and user impact metrics could be more explicitly highlighted.',
    'Certain high-demand domain toolchains and modern cloud workflows need greater visibility.',
    'Action verbs and technical impact statements can be sharpened for executive clarity.'
  ]);

  const matchedSkills = normalizeStringArray(raw.matchedSkills, [
    'Core Problem Solving',
    'Technical Fundamentals',
    'Cross-functional Collaboration'
  ]);

  const missingSkills = normalizeStringArray(raw.missingSkills, [
    'System Architecture Design',
    'Automated CI/CD Workflows',
    'Production Monitoring & Performance Profiling'
  ]);

  const recommendedSkills = normalizeStringArray(raw.recommendedSkills, [
    'Containerization & Cloud Infrastructure (Docker, Kubernetes/GCP)',
    'Distributed Systems & Caching (Redis, Kafka, PostgreSQL)',
    'Modern Testing & Observability (Vitest, Prometheus, Datadog)'
  ]);

  const resumeImprovements = normalizeResumeImprovements(raw.resumeImprovements);

  const recommendedActions = normalizeStringArray(raw.recommendedActions, [
    `Tailor top resume keywords specifically targeting ${targetRole} job descriptions.`,
    'Build and deploy a public proof-of-work project demonstrating end-to-end production architecture.',
    'Refactor project bullet points to lead with strong action verbs and verified outcomes.',
    'Prepare STAR-method stories covering challenging system bottlenecks and cross-team trade-offs.'
  ]);

  const interviewTopics = normalizeStringArray(raw.interviewTopics, [
    'Core architectural trade-offs: Scalability, consistency, and latency management.',
    'Deep dive into the most technically challenging project on your resume.',
    'System debugging and root-cause analysis during high-traffic outages.',
    'Behavioral collaboration: Handling technical disagreements with peers or stakeholders.'
  ]);

  const actionPlan = normalizeActionPlan(raw.actionPlan, raw.thirtyDayPlan);

  const thirtyDayPlan = actionPlan.map(item => `Day ${item.day}: ${item.action}`);

  const summary = typeof raw.summary === 'string' && raw.summary.trim().length > 10
    ? raw.summary.trim()
    : `Candidate profile demonstrates strong foundational capabilities for ${targetRole}. With focused optimization of resume metrics, keyword alignment for modern ATS systems, and targeted practice in system architecture, the candidate can significantly boost their interview conversion rate.`;

  const roleFitExplanation = typeof raw.roleFitExplanation === 'string' && raw.roleFitExplanation.trim().length > 10
    ? raw.roleFitExplanation.trim()
    : `The candidate possesses relevant foundational skills that align with the core requirements for ${targetRole}. Addressing highlighted skill gaps will elevate the profile into the top percentile of qualified applicants.`;

  return {
    overallScore,
    jobMatchScore,
    atsScore,
    summary,
    strengths,
    weaknesses,
    matchedSkills,
    missingSkills,
    recommendedSkills,
    resumeImprovements,
    interviewTopics,
    actionPlan,
    roleFitExplanation,
    recommendedActions,
    thirtyDayPlan,
  };
}
