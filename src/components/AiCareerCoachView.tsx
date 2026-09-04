import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Briefcase,
  FileText,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  Award,
  Zap,
  BookOpen,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  TrendingUp,
  Lock,
  ExternalLink,
  Clock,
  Printer
} from 'lucide-react';
import { CareerAnalysis, CareerAnalysisRequest } from '../types/careerCoach.types';

const STORAGE_KEY_INPUTS = 'vstudyhub_career_coach_inputs';
const STORAGE_KEY_ANALYSIS = 'vstudyhub_career_coach_last_analysis';

const SAMPLE_RESUMES: Record<string, { role: string; resume: string; jobDesc?: string }> = {
  softwareEngineer: {
    role: 'Full Stack Software Engineer',
    resume: `ALEX RIVERA
Email: alex.rivera@example.com | GitHub: github.com/alexrivera | LinkedIn: linkedin.com/in/alexrivera

SUMMARY
Proactive Full Stack Engineer with 3 years of experience developing responsive web applications, microservices, and distributed cloud systems using TypeScript, React, Node.js, and PostgreSQL.

SKILLS
• Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
• Frameworks/Libraries: React, Next.js, Node.js, Express, Tailwind CSS, Redux Toolkit
• Databases & Cloud: PostgreSQL, MongoDB, Redis, Docker, AWS (S3, ECS, Lambda), Git, GitHub Actions
• Practices: REST APIs, Unit & Integration Testing (Jest, Vitest), Agile/Scrum, CI/CD pipelines

EXPERIENCE
Software Engineer | Apex Cloud Solutions (2023 - Present)
• Architected and shipped 4 customer-facing dashboard features using React, TypeScript, and Tailwind, serving 45,000+ monthly active users.
• Reduced client bundle size by 32% and improved Core Web Vitals LCP by 1.2s through code splitting and asset compression.
• Built scalable REST microservices with Node.js and Express; implemented Redis caching layer that reduced database query latency by 45%.
• Authored comprehensive unit and integration tests achieving 84% code coverage across critical checkout pathways.

Associate Developer | Innovatech Systems (2022 - 2023)
• Developed responsive user interface components for internal analytics tools using React and Material UI.
• Refactored legacy monolithic endpoints into modular Node.js services, cutting deployment downtime by 50%.
• Collaborated in bi-weekly Agile sprints, reviewing pull requests and participating in system architecture discussions.

EDUCATION
B.S. in Computer Science | State University (2018 - 2022)
• Relevant Coursework: Data Structures & Algorithms, Database Systems, Computer Networks, Software Engineering.`,
    jobDesc: `Senior Full Stack Developer Requirements:
- 3+ years experience with modern JavaScript/TypeScript and React ecosystem.
- Deep expertise in backend service design with Node.js, Express, or Go.
- Experience with relational and NoSQL databases (PostgreSQL, Redis), query optimization, and connection pooling.
- Practical experience with Docker containerization, Kubernetes, and AWS or GCP cloud deployments.
- Strong knowledge of CI/CD pipelines, automated testing, and performance monitoring (Datadog/Prometheus).
- Excellent communication skills and ability to mentor junior engineers.`
  },
  dataAnalyst: {
    role: 'Data Analyst / BI Specialist',
    resume: `PRIYA SHARMA
Email: priya.sharma@example.com | Portfolio: priyadata.dev | LinkedIn: linkedin.com/in/priyasharma

PROFESSIONAL SUMMARY
Results-driven Data Analyst with 2+ years of experience transforming complex datasets into actionable business intelligence, predictive metrics, and automated dashboards using SQL, Python, Tableau, and Power BI.

TECHNICAL SKILLS
• Programming & Querying: SQL (PostgreSQL, MySQL, BigQuery), Python (Pandas, NumPy, Matplotlib, Scikit-learn)
• BI & Visualization: Tableau, Power BI, Google Looker Studio, Excel (Advanced, Power Query, VBA)
• Tools & Methodologies: Git, Statistical Modeling, A/B Testing Analysis, ETL Data Pipelines

PROFESSIONAL EXPERIENCE
Data Analyst | RetailMetric Solutions (2023 - Present)
• Designed and automated 12 executive KPI dashboards in Tableau, reducing manual reporting overhead by 18 hours per week.
• Formulated complex SQL data extraction scripts querying multi-million row transactional databases in Google BigQuery.
• Partnered with marketing leadership to conduct customer segmentation analysis that boosted promotional email ROI by 16%.

Junior Business Analyst | FinEdge Analytics (2022 - 2023)
• Conducted daily financial reconciliations and cleaned raw customer survey datasets using Python and Pandas.
• Presented monthly performance reviews to department stakeholders, highlighting retention bottlenecks.

EDUCATION
B.Sc. in Statistics & Economics | University of Delhi (2019 - 2022)`,
    jobDesc: `Data Analyst Requirements:
- Proven experience with SQL and data visualization tools (Tableau, PowerBI).
- Working proficiency in Python for data wrangling (Pandas, NumPy).
- Understanding of statistical testing and business metric design.
- Strong communication skills to translate data insights into executive business recommendations.`
  }
};

const POPULAR_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Engineer',
  'Data Scientist',
  'Data Analyst',
  'DevOps Engineer',
  'Product Manager',
  'Machine Learning Engineer'
];

export const AiCareerCoachView: React.FC = () => {
  // Input State
  const [resumeText, setResumeText] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [showJobDescField, setShowJobDescField] = useState<boolean>(false);

  // Analysis State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<CareerAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetryable, setIsRetryable] = useState<boolean>(true);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [copiedResume, setCopiedResume] = useState<boolean>(false);

  // Abort controller reference for cancellation & duplicate request prevention
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  // Load preserved state from localStorage on initial render
  useEffect(() => {
    try {
      const savedInputs = localStorage.getItem(STORAGE_KEY_INPUTS);
      if (savedInputs) {
        const parsed = JSON.parse(savedInputs);
        if (parsed.resumeText) setResumeText(parsed.resumeText);
        if (parsed.targetRole) setTargetRole(parsed.targetRole);
        if (parsed.jobDescription) {
          setJobDescription(parsed.jobDescription);
          setShowJobDescField(true);
        }
      }

      const savedAnalysis = localStorage.getItem(STORAGE_KEY_ANALYSIS);
      if (savedAnalysis) {
        const parsedAnalysis = JSON.parse(savedAnalysis);
        if (parsedAnalysis && parsedAnalysis.overallScore !== undefined) {
          setAnalysisResult(parsedAnalysis);
        }
      }
    } catch (e) {
      console.warn('Could not restore career coach state from localStorage', e);
    }
  }, []);

  // Persist user inputs in real-time
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_INPUTS,
        JSON.stringify({
          resumeText,
          targetRole,
          jobDescription,
        })
      );
    } catch {
      // Ignore quota storage limits
    }
  }, [resumeText, targetRole, jobDescription]);

  // Loading step progression
  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setLoadingStep(0);
      const steps = [1, 2, 3];
      let i = 0;
      timer = setInterval(() => {
        if (i < steps.length) {
          setLoadingStep(steps[i]);
          i++;
        }
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  // Handle sample selection
  const handleLoadSample = (sampleKey: 'softwareEngineer' | 'dataAnalyst') => {
    const sample = SAMPLE_RESUMES[sampleKey];
    if (sample) {
      setTargetRole(sample.role);
      setResumeText(sample.resume);
      if (sample.jobDesc) {
        setJobDescription(sample.jobDesc);
        setShowJobDescField(true);
      }
      setErrorMessage(null);
    }
  };

  // Perform Career Analysis (ONE consolidated API call)
  const handleAnalyzeCareer = async () => {
    // 1. Client validation
    const trimmedRole = targetRole.trim();
    const trimmedResume = resumeText.trim();
    const trimmedJobDesc = jobDescription.trim();

    if (!trimmedRole) {
      setErrorMessage('Please specify your target job role (e.g. Software Engineer).');
      setIsRetryable(false);
      return;
    }

    if (!trimmedResume) {
      setErrorMessage('Please paste or type your resume before running the analysis.');
      setIsRetryable(false);
      return;
    }

    if (trimmedResume.length < 20) {
      setErrorMessage('Please provide a more detailed resume (at least 20 characters) so our AI can accurately benchmark your skills.');
      setIsRetryable(false);
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: CareerAnalysisRequest = {
        targetRole: trimmedRole,
        resumeText: trimmedResume,
        jobDescription: trimmedJobDesc || undefined,
      };

      const response = await fetch('/api/ai/career-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Safe application-level error message from backend
        const msg =
          data?.error?.message ||
          'AI analysis is temporarily unavailable. Your information is safe. Please try again shortly.';
        setErrorMessage(msg);
        setIsRetryable(data?.error?.retryable !== false);
        return;
      }

      if (data.data) {
        setAnalysisResult(data.data);
        setErrorMessage(null);
        try {
          localStorage.setItem(STORAGE_KEY_ANALYSIS, JSON.stringify(data.data));
        } catch {
          // ignore
        }

        // Smooth scroll to results
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        setErrorMessage("We couldn't complete the analysis this time. Your information has been preserved.");
        setIsRetryable(true);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return; // User cancelled or superseded
      }
      setErrorMessage('AI analysis is temporarily unavailable. Your information is safe. Please try again shortly.');
      setIsRetryable(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;

    const reportText = `AI CAREER COACH ANALYSIS REPORT
Target Role: ${targetRole}
Date: ${new Date().toLocaleDateString()}

========================================
SCORES & BENCHMARKS
========================================
Overall Career Readiness: ${analysisResult.overallScore}/100
ATS Compatibility Score: ${analysisResult.atsScore}/100
Job Description Match: ${analysisResult.jobMatchScore}/100

========================================
EXECUTIVE SUMMARY
========================================
${analysisResult.summary}

========================================
EXECUTIVE SUMMARY
========================================
${analysisResult.summary}

========================================
ROLE FIT EXPLANATION
========================================
${analysisResult.roleFitExplanation}

========================================
KEY STRENGTHS
========================================
${analysisResult.strengths.map((s) => `• ${s}`).join('\n')}

========================================
IDENTIFIED SKILL GAPS & WEAKNESSES
========================================
${analysisResult.weaknesses.map((w) => `• ${w}`).join('\n')}

========================================
MATCHED SKILLS
========================================
${analysisResult.matchedSkills.join(', ')}

========================================
HIGH-PRIORITY MISSING SKILLS
========================================
${analysisResult.missingSkills.join(', ')}

========================================
RECOMMENDED SKILLS TO LEARN
========================================
${analysisResult.recommendedSkills.map((r) => `• ${r}`).join('\n')}

========================================
ACTIONABLE RESUME IMPROVEMENTS
========================================
${analysisResult.resumeImprovements.map((imp) => typeof imp === 'object' ? `• [${(imp.priority || 'medium').toUpperCase()}] ${imp.title}: ${imp.description}` : `• ${imp}`).join('\n')}

========================================
TOP INTERVIEW TOPICS TO MASTER
========================================
${analysisResult.interviewTopics.map((top) => `• ${top}`).join('\n')}

========================================
ACTION PLAN
========================================
${(analysisResult.actionPlan || []).map((step) => `• Day ${step.day}: ${step.action}`).join('\n')}
`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400 border-emerald-500';
    if (score >= 65) return 'text-blue-600 dark:text-blue-400 border-blue-500';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 border-amber-500';
    return 'text-rose-600 dark:text-rose-400 border-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (score >= 65) return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (score >= 50) return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero / Header Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Next-Gen Career Intelligence & ATS Diagnostic</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          AI Career Coach
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          Understand your strengths, find skill gaps, and become more job-ready.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 1-Click Consolidated Scan
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <Target className="w-3.5 h-3.5 text-indigo-500" /> ATS Match Audit
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> 30-Day Growth Roadmap
          </span>
        </div>
      </section>

      {/* Input Workbench Card */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Career & Resume Inputs</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Provide your details below. Your inputs are saved automatically in your browser session.
            </p>
          </div>

          {/* Sample Loaders */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden md:inline">Quick Samples:</span>
            <button
              type="button"
              onClick={() => handleLoadSample('softwareEngineer')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Software Eng.
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('dataAnalyst')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Data Analyst
            </button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="space-y-6">
          {/* Target Job Role */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="target-role-input" className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Target Job Role</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">e.g., Software Engineer, Product Manager</span>
            </div>

            <input
              id="target-role-input"
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer / Full Stack Developer"
              maxLength={150}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400"
            />

            {/* Quick role suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 mr-1 py-0.5">Popular:</span>
              {POPULAR_ROLES.slice(0, 6).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setTargetRole(role)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                    targetRole.toLowerCase() === role.toLowerCase()
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Resume Text Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="resume-text-input" className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Resume / Experience Profile</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400">
                  {resumeText.length.toLocaleString()} / 30,000 chars
                </span>
                {resumeText && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(resumeText);
                      setCopiedResume(true);
                      setTimeout(() => setCopiedResume(false), 2000);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedResume ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedResume ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="resume-text-input"
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here (Summary, Work Experience, Skills, Education, Projects)...
Tip: You can simply copy all text from your PDF or Word document and paste it directly."
              maxLength={30000}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white text-sm outline-none transition-all placeholder:text-slate-400 font-mono text-xs sm:text-sm leading-relaxed"
            />
          </div>

          {/* Optional Job Description Toggle & Input */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={() => setShowJobDescField(!showJobDescField)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer select-none"
            >
              <span>{showJobDescField ? '− Hide' : '+ Add'} Optional Target Job Description (Improves ATS Match Precision)</span>
              {showJobDescField ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showJobDescField && (
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center justify-between">
                  <label htmlFor="job-description-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                    <span>Target Job Description / Posting (Optional)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {jobDescription.length.toLocaleString()} / 20,000 chars
                  </span>
                </div>
                <textarea
                  id="job-description-input"
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the requirements or job posting here to benchmark exact keyword overlap and missing qualifications..."
                  maxLength={20000}
                  disabled={isLoading}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-mono leading-relaxed placeholder:text-slate-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Error Notification Banner with Preservation Guarantee */}
        {errorMessage && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  {errorMessage}
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Your resume and input fields are safely preserved above.</span>
                </p>
              </div>
            </div>

            {isRetryable && (
              <button
                type="button"
                onClick={handleAnalyzeCareer}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Try Again</span>
              </button>
            )}
          </div>
        )}

        {/* Submission Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Private & confidential. Resume analyzed in 1 single structured request.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {resumeText && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear resume text and inputs?')) {
                    setResumeText('');
                    setJobDescription('');
                    setTargetRole('');
                    setAnalysisResult(null);
                    setErrorMessage(null);
                    localStorage.removeItem(STORAGE_KEY_INPUTS);
                    localStorage.removeItem(STORAGE_KEY_ANALYSIS);
                  }
                }}
                disabled={isLoading}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}

            <button
              id="analyze-career-btn"
              type="button"
              onClick={handleAnalyzeCareer}
              disabled={isLoading || !targetRole.trim() || !resumeText.trim()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze My Career</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progressive Loading State UI */}
        {isLoading && (
          <div className="p-6 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                <span className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-200">
                  {loadingStep === 0 && 'Parsing resume structure and skills...'}
                  {loadingStep === 1 && 'Benchmarking profile against industry standards...'}
                  {loadingStep === 2 && 'Auditing ATS keywords and match score...'}
                  {loadingStep >= 3 && 'Synthesizing recommendations & 30-day action plan...'}
                </span>
              </div>
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400">Single API Request</span>
            </div>

            <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(95, (loadingStep + 1) * 25)}%` }}
              />
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-300">
              One comprehensive AI evaluation in progress. Please wait a few seconds...
            </p>
          </div>
        )}
      </section>

      {/* Results Dashboard Section */}
      {analysisResult && (
        <section ref={resultsRef} className="space-y-8 pt-4">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Diagnostic Results
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Career Analysis for {targetRole}
              </h2>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleCopyReport}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? 'Report Copied!' : 'Copy Full Report'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Core Score Cards (Items 1, 2, 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Overall Career Score */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Metric 01
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Overall Career Score
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black tracking-tight ${getScoreColor(analysisResult.overallScore)}`}>
                  {analysisResult.overallScore}
                </span>
                <span className="text-slate-400 font-semibold text-lg">/ 100</span>
              </div>

              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-1000 ${
                      analysisResult.overallScore >= 75 ? 'bg-emerald-500' : analysisResult.overallScore >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${analysisResult.overallScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {analysisResult.overallScore >= 80
                    ? 'Top Tier: Strong competitive positioning in the candidate pool.'
                    : analysisResult.overallScore >= 65
                    ? 'Solid Foundation: High potential with key targeted resume refinements.'
                    : 'Growth Mode: Address highlighted skill gaps to boost interview calls.'}
                </p>
              </div>
            </div>

            {/* 2. ATS Score */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Metric 02
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    ATS Compatibility
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black tracking-tight ${getScoreColor(analysisResult.atsScore)}`}>
                  {analysisResult.atsScore}
                </span>
                <span className="text-slate-400 font-semibold text-lg">/ 100</span>
              </div>

              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-1000 ${
                      analysisResult.atsScore >= 75 ? 'bg-emerald-500' : analysisResult.atsScore >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${analysisResult.atsScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {analysisResult.atsScore >= 75
                    ? 'High Parseability: Keywords and layout pass standard applicant filters.'
                    : 'Moderate Risk: Missing critical domain keywords or standard headers.'}
                </p>
              </div>
            </div>

            {/* 3. Job Match Score */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Metric 03
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Job Match Alignment
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black tracking-tight ${getScoreColor(analysisResult.jobMatchScore)}`}>
                  {analysisResult.jobMatchScore}
                </span>
                <span className="text-slate-400 font-semibold text-lg">/ 100</span>
              </div>

              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-1000 ${
                      analysisResult.jobMatchScore >= 75 ? 'bg-emerald-500' : analysisResult.jobMatchScore >= 60 ? 'bg-purple-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${analysisResult.jobMatchScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Evaluated against hiring criteria for {targetRole}.
                </p>
              </div>
            </div>
          </div>

          {/* Executive Summary Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-slate-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border border-blue-100 dark:border-blue-900/60 space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Executive Assessment Summary</span>
            </h3>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {analysisResult.summary}
            </p>
          </div>

          {/* Role Fit Explanation Card */}
          {analysisResult.roleFitExplanation && (
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Role Fit & Alignment Explanation</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {analysisResult.roleFitExplanation}
              </p>
            </div>
          )}

          {/* Skills Breakdown Grid (Matched Skills vs Missing Skills) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Matched Skills Evident in Profile
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.matchedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  High-Priority Missing Skills
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses (Items 4 & 5) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 4. Strengths */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span>Core Profile Strengths</span>
              </h3>
              <ul className="space-y-3">
                {analysisResult.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Weaknesses & Skill Gaps */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Identified Skill Gaps & Weaknesses</span>
              </h3>
              <ul className="space-y-3">
                {analysisResult.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 6. Recommended Skills */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <span>Recommended Skills & Technologies to Learn</span>
              </h3>
              <span className="text-xs text-slate-400">High ROI for {targetRole}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysisResult.recommendedSkills.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start gap-2.5 font-medium"
                >
                  <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7. Resume Improvements */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span>Actionable Resume Improvements (Google XYZ Format)</span>
              </h3>
              <span className="text-xs text-slate-400">ATS & Recruiter Optimized</span>
            </div>
            <div className="space-y-3">
              {analysisResult.resumeImprovements.map((imp, idx) => {
                const title = typeof imp === 'object' ? imp.title : imp;
                const desc = typeof imp === 'object' ? imp.description : '';
                const priority = typeof imp === 'object' ? imp.priority : 'medium';
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-700 dark:text-slate-200 flex flex-col gap-1.5 leading-relaxed"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-mono font-bold text-[11px]">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">{title}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        priority === 'high'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : priority === 'medium'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {priority} priority
                      </span>
                    </div>
                    {desc && desc !== title && (
                      <p className="text-slate-600 dark:text-slate-400 pl-7">{desc}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 8. Recommended Actions */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Recommended Immediate Actions</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {(analysisResult.recommendedActions || []).map((act, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start gap-2.5 font-medium leading-relaxed"
                >
                  <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 9. Interview Topics */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <span>Anticipated Technical & Behavioral Interview Topics</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {analysisResult.interviewTopics.map((top, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start gap-2.5 font-medium leading-relaxed"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0 mt-1.5" />
                  <span>{top}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 10. Action Plan */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Career Improvement Action Plan</span>
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                Action Roadmap
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(analysisResult.actionPlan && analysisResult.actionPlan.length > 0
                ? analysisResult.actionPlan
                : (analysisResult.thirtyDayPlan || []).map((step, idx) => ({ day: (idx + 1) * 7, action: step }))
              ).map((step, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Day {step.day}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Milestone {idx + 1}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {step.action}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Future Monetization & Pro Tier Preview Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white border border-indigo-800/50 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Pro Tier Upgrades (Coming Soon)</span>
                </div>
                <span className="text-xs text-indigo-200/80 font-medium">
                  Free analyses remain unlimited for all learners
                </span>
              </div>

              <div className="max-w-2xl space-y-2">
                <h3 className="text-xl sm:text-2xl font-black">
                  Accelerate Your Hiring Pipeline with Career Pro
                </h3>
                <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                  We are expanding AI Career Coach with personalized career toolchains to help you secure interviews faster.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {[
                  { title: 'AI Cover Letter Generator', desc: 'Custom tailored to every job description' },
                  { title: 'LinkedIn Profile Optimizer', desc: 'Boost recruiter inbound search visibility' },
                  { title: 'Personalized Interview Prep', desc: 'Mock technical & behavioral question banks' },
                  { title: 'Career Roadmap & Salary Intel', desc: 'Real-time compensation benchmarks' },
                  { title: 'Application Pipeline Tracker', desc: 'Kanban board for submitted applications' },
                  { title: 'Unlimited Fast-Track Scans', desc: 'Priority model execution & exports' }
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-1 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{feature.title}</h4>
                      <Lock className="w-3 h-3 text-indigo-300/70" />
                    </div>
                    <p className="text-[11px] text-indigo-200/70">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AiCareerCoachView;
