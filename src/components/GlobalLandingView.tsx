import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Languages,
  BrainCircuit,
  FileText,
  Target,
  ShieldCheck,
  TrendingUp,
  Zap,
  Star,
  ChevronRight,
  Globe2,
  Clock,
  Layers,
  Award,
  CreditCard,
  MessageSquare,
  Users,
  Check,
  Building2,
  Send,
  Lock
} from 'lucide-react';


interface GlobalLandingViewProps {
  onTabChange: (tab: string) => void;
  onOpenAccountModal?: () => void;
}

export const GlobalLandingView: React.FC<GlobalLandingViewProps> = ({
  onTabChange,
  onOpenAccountModal
}) => {
  // Interactive Hero Preview State
  const [activePreviewTab, setActivePreviewTab] = useState<'interview' | 'english' | 'resume'>('interview');

  // Interactive Mini-Demo State
  const [demoInput, setDemoInput] = useState('');
  const [demoType, setDemoType] = useState<'interview' | 'english'>('interview');
  const [demoResult, setDemoResult] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Pricing & Checkout Modal State
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);


  const handleRunMiniDemo = () => {
    if (!demoInput.trim()) return;
    setDemoLoading(true);
    setDemoResult(null);

    setTimeout(() => {
      setDemoLoading(false);
      if (demoType === 'interview') {
        setDemoResult(
          `★ STAR Score: 8.8/10\n• Situation & Task: Clear context established.\n• Action: Strong leadership demonstrated; quantify team size.\n• Result Recommendation: Add measurable metrics (e.g., "Reduced latency by 34% across 45k daily active users").\n• Delivery Tip: Use concise opening impact statements.`
        );
      } else {
        setDemoResult(
          `★ Executive English Polish:\n"Hi team, I would like to share a brief update on our project milestones. Last week, our engineers resolved the critical latency bottlenecks, improving system response times by 32%."\n• Replaced conversational slang with polished corporate diction.\n• Strengthened sentence cadence for executive leadership clarity.`
        );
      }
    }, 600);
  };

  const setSampleDemoText = (type: 'interview' | 'english') => {
    setDemoType(type);
    if (type === 'interview') {
      setDemoInput(
        "In my previous project, we faced a major release deadline with legacy bugs. I organized a 3-day bug scrub, prioritized critical P0 issues, and we shipped on time with zero downtime."
      );
    } else {
      setDemoInput(
        "Hi everyone, today I want to tell you about our new project progress. We did many works last week and we see good result with the system."
      );
    }
    setDemoResult(null);
  };

  const faqs = [
    {
      q: "How does VStudyHub Global prepare candidates for international job markets?",
      a: "Our coaching engines analyze thousands of successful hire criteria at Tier 1 technology companies, global consultancies, and remote-first enterprises in the US, Europe, and Asia-Pacific. We coach you on culturally fluent business English, ATS-compliant resumes with quantifiable impact, and structured STAR behavioral communication."
    },
    {
      q: "Is the AI mock interview tailored to specific job roles and companies?",
      a: "Yes. You can select target roles (Software Engineering, Product Management, Data Science, Executive Leadership, Sales) and target corporate profiles (Google, Meta, Amazon, Stripe, McKinsey, Seed-stage Startups). The simulator generates authentic questions and evaluates your depth, technical accuracy, and leadership principles."
    },
    {
      q: "What makes the Executive English Coach different from standard grammar checkers?",
      a: "Unlike passive spell-checkers, VStudyHub Global trains real-time conversational cadence, business meeting assertiveness, professional email rewriting, and accent clarity. It transforms textbook or passive language into crisp, persuasive executive communication."
    },
    {
      q: "How does the $19/month Premium Global Access subscription work?",
      a: "Premium Global Access provides unlimited full-length AI mock interviews with comprehensive STAR scorecards, deep speech/grammar analysis, automated ATS resume optimizations, curated international interview banks, and priority zero-wait processing. Billing is $19/month or $19/month (save 31%), Payments are handled through Razorpay. Review the payment page for billing terms."
    },
    {
      q: "Is my resume and interview data kept private?",
      a: "Absolutely. All user submissions, resumes, and interview responses are encrypted in transit and at rest. Your materials are never sold to recruiters or used for third-party public training without authorization."
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">

      {/* Ambient Gradient Background Glows */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-indigo-500/15 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-48 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] pointer-events-none" />

        {/* Hero Section */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20">

          {/* Subtle Announcement Kicker */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white tracking-wide">CareerAI 3.0</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">Autonomous Coaching for Global Professionals</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400 ml-0.5" />
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Accelerate Your Global Career with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Autonomous AI Coaching
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Master executive English fluency, simulate high-stakes FAANG & Fortune 500 job interviews with real-time STAR feedback, and craft an ATS-dominating resume.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onTabChange('ai-career-coach')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Launch AI Career Coach</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onTabChange('ai-interview')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BrainCircuit className="w-4 h-4 text-emerald-400" />
                <span>Simulate Mock Interview</span>
              </button>

              <button
                onClick={() => onTabChange('ai-english-coach')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-800/60 hover:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Languages className="w-4 h-4 text-blue-400" />
                <span>Practice English Fluency</span>
              </button>
            </div>

            {/* Social Proof Stats Bar */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-900">
              <div className="p-3 text-center">
                <p className="text-2xl sm:text-3xl font-black text-white">94.2%</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Offer Success Rate</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-2xl sm:text-3xl font-black text-indigo-400">48,000+</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Mock Sessions Evaluated</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">120+</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Countries Represented</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-2xl sm:text-3xl font-black text-white">4.9 / 5</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Global Rating</p>
              </div>
            </div>

          </div>

          {/* Interactive Hero Terminal / Live Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-indigo-950/40 overflow-hidden backdrop-blur-xl">

              {/* Terminal Window Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/70 gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    career-ai-engine.vstudyhub.internal
                  </span>
                </div>

                {/* Interactive Segmented Switcher */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setActivePreviewTab('interview')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      activePreviewTab === 'interview'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    STAR Interview Coach
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('english')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      activePreviewTab === 'english'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Executive English
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('resume')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      activePreviewTab === 'resume'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ATS Bullet Polish
                  </button>
                </div>
              </div>

              {/* Terminal Body */}
              <div className="p-6 sm:p-8">
                {activePreviewTab === 'interview' && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shrink-0">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                          Mock Interview Evaluation · Senior Staff Role
                        </span>
                        <p className="text-sm text-slate-300 font-mono">
                          "Tell me about a time you resolved a major production bottleneck under strict client SLAs."
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">STAR Structure</span>
                          <span className="text-emerald-400 font-bold font-mono">9.2 / 10</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Clear separation between Task and Action. Identified business implications and stakeholder alignment.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Quantifiable Result</span>
                          <span className="text-blue-400 font-bold font-mono">8.8 / 10</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Highlighted $180k saved in AWS cloud compute and zero SLA penalties across 4 consecutive quarters.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Executive Presence</span>
                          <span className="text-indigo-400 font-bold font-mono">9.5 / 10</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Decisive, proactive vocabulary with zero defensive rationalizations. Demonstrates leadership accountability.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Simulate 200+ role-specific behavioral & system questions
                      </span>
                      <button
                        onClick={() => onTabChange('ai-interview')}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        Start full interview session <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'english' && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
                        <Languages className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          Executive Communication Rewriter · Real-Time Polish
                        </span>
                        <p className="text-sm text-slate-300 font-mono">
                          Transforming casual conversational updates into crisp boardroom-ready leadership statements.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-950/40 space-y-2">
                        <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                          Before (Casual / Non-Native Phrasing)
                        </span>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">
                          "I want to say that we had some delay because the backend was very slow and had bugs, but now we fixed it and hopefully we deploy tomorrow."
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-950/40 space-y-2">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                          After (Executive Leadership Precision)
                        </span>
                        <p className="text-xs text-emerald-200 font-mono leading-relaxed">
                          "We experienced a minor deployment delay due to backend latency anomalies. Our engineers isolated the root cause, applied the patch, and are on track for production release tomorrow morning."
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Practices speaking, meetings, negotiations, and executive writing
                      </span>
                      <button
                        onClick={() => onTabChange('ai-english-coach')}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        Open English Coach <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {activePreviewTab === 'resume' && (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          ATS Bullet Rewriter · Google X-Y-Z Methodology
                        </span>
                        <p className="text-sm text-slate-300 font-mono">
                          "Accomplished [X], as measured by [Y], by doing [Z]"
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Unquantified Bullet (Filtered by ATS)
                        </span>
                        <p className="text-xs text-slate-400 font-mono leading-relaxed">
                          "Responsible for maintaining client microservices and fixing database performance issues."
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/60 space-y-2">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                          Optimized Bullet (Top 1% Candidate Score)
                        </span>
                        <p className="text-xs text-slate-200 font-mono leading-relaxed">
                          "Engineered Redis caching layer across 8 core microservices, slashing P99 database query latency by 45% and sustaining 99.98% uptime for 60,000 daily active users."
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Instant keyword gap analysis for Tech, Product, Finance, and Consulting
                      </span>
                      <button
                        onClick={() => onTabChange('ai-career-coach')}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        Optimize my resume <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Target Companies Strip */}
      <div className="border-y border-slate-900 bg-slate-950/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Coaching Candidates for Leading Global Enterprises & Tech Giants
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-400 font-bold text-sm tracking-tight opacity-75">
            <span>Google</span>
            <span>Amazon</span>
            <span>Meta</span>
            <span>Microsoft</span>
            <span>Stripe</span>
            <span>McKinsey</span>
            <span>Apple</span>
            <span>Goldman Sachs</span>
            <span>Uber</span>
            <span>Airbnb</span>
          </div>
        </div>
      </div>

      {/* Visual Feature Grid: 4 Core Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16">

        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">
            Complete Career Arsenal
          </h2>
          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Built for High-Stakes International Hiring
          </h3>
          <p className="text-base text-slate-400">
            Four specialized AI coaching modules working synchronously to position you ahead of competing applicants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Pillar 1 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-5 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                AI Mock Interview Simulator
              </h4>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Realistic behavioral and technical interview simulations. Evaluates your responses using the STAR method (Situation, Task, Action, Result) with precise line-by-line feedback on structure and delivery.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Behavioral, technical, and executive scenario banks</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-time delivery scorecards with confidence metrics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tailored questions for FAANG, Big 4, and high-growth startups</span>
              </li>
            </ul>
            <button
              onClick={() => onTabChange('ai-interview')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5 cursor-pointer pt-2"
            >
              Simulate interview now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-5 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                Executive English Fluency Coach
              </h4>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Engineered specifically for international professionals and multilingual tech workers. Eliminates hesitations, stiff idioms, and replaces passive vocabulary with assertive corporate eloquence.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Business meeting cadence and presentation rehearsal</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real-time email and executive brief re-writing</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Targeted corrections for common cross-cultural phrasing errors</span>
              </li>
            </ul>
            <button
              onClick={() => onTabChange('ai-english-coach')}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1.5 cursor-pointer pt-2"
            >
              Start fluency practice <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-5 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                ATS Resume Architect & Keyword Match
              </h4>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Parse your resume against real target job descriptions. Detect missing technical competencies, eliminate passive phrasing, and format bullets using the proven Google X-Y-Z formula.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant ATS compatibility score and keyword density check</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>One-click line-by-line bullet rewrites with quantified impact</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Personalized 30-60-90 day skill acquisition roadmap</span>
              </li>
            </ul>
            <button
              onClick={() => onTabChange('ai-career-coach')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 cursor-pointer pt-2"
            >
              Audit your resume <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 4 */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-5 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                Offer & Salary Negotiation Coach
              </h4>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Step-by-step counter-offer scripts for base salary, equity grants, sign-on bonuses, and relocation packages. Leverage competitive market data to maximize your total compensation.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live negotiation email templates and objection handling</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Equity valuation calculators (RSU vs. Stock Options)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Strategies for remote compensation tiers & global currencies</span>
              </li>
            </ul>
            <button
              onClick={() => onTabChange('ai-career-coach')}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1.5 cursor-pointer pt-2"
            >
              Prepare compensation pitch <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Interactive Try-It Mini-Coach Sandbox */}
      <div className="border-y border-slate-900 bg-slate-900/30 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">
              Live Interactive Sandbox
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              Test the AI Coach Right Now
            </h3>
            <p className="text-sm text-slate-400">
              Choose an example or enter your own draft to experience real-time AI feedback.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">

            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSampleDemoText('interview')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    demoType === 'interview'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Interview Response
                </button>
                <button
                  onClick={() => setSampleDemoText('english')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    demoType === 'english'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Business English Draft
                </button>
              </div>

              <span className="text-xs text-slate-500">
                Click a preset or type below
              </span>
            </div>

            <div className="space-y-3">
              <textarea
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Enter an interview response, accomplishment bullet, or professional message..."
                rows={4}
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono resize-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleRunMiniDemo}
                  disabled={demoLoading || !demoInput.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {demoLoading ? (
                    <span className="animate-pulse">Analyzing with AI...</span>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Analyze Draft</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {demoResult && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-900/60 animate-in fade-in space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Instant Coaching Breakdown</span>
                </div>
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {demoResult}
                </pre>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Live SaaS Pricing Table */}
      <div id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16">

        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>International Access Pricing</span>
          </div>
          <h2 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest hidden">
            Predictable & Transparent Pricing
          </h2>
          <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Simple, Transparent Global Pricing
          </h3>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your career ambitions. Free starter diagnostics or full-scale international interview & English coaching.
          </p>

        </div>

        {/* 2-Tier Pricing Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">

          {/* Tier 1: Free Tier */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-8">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Free Tier
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                  Starter
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white">$0</span>
                <span className="text-xs text-slate-500 font-medium">/ forever</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Essential diagnostic checks for candidates exploring global roles and international standards.
              </p>

              <div className="pt-4 border-t border-slate-800/80 space-y-3.5 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>3 AI responses</strong> or <strong>1 brief mock interview</strong> per month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Basic ATS resume score check & keyword scan</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard email grammar & clarity review</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Access to Global Communication flashcards</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500">
                  <span className="w-4 text-center font-bold text-slate-600">-</span>
                  <span>No deep speech / audio pronunciation coach</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-500">
                  <span className="w-4 text-center font-bold text-slate-600">-</span>
                  <span>Standard queue latency during peak hours</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => onTabChange('ai-interview')}
                className="w-full py-3.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <p className="text-[11px] text-center text-slate-500">
                No credit card required · Instant access
              </p>
            </div>
          </div>

          {/* Tier 2: Premium Global Access (Featured) */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-indigo-950/70 via-slate-900 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-950/60 flex flex-col justify-between space-y-8 relative group">

            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Most Popular · Full International Suite
              </span>
            </div>

            <div className="space-y-5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  Premium Global Access
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Recommended
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white">
                  '$19'
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  '/ month'
                </span>
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Complete career transformation platform for job seekers, expats, and professionals targeting international offers.
              </p>

              <div className="pt-4 border-t border-indigo-900/60 space-y-3.5 text-xs text-slate-200">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Unlimited AI Mock Interviews with STAR scorecards</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Deep speech, cadence & audio pronunciation coaching</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">Automated Google X-Y-Z resume bullet rewrites</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time tone & executive presence coaching (emails/resumes)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Curated company question banks (Google, Amazon, Meta, McKinsey)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Zero-queue priority GPU/server inference with lightning speed</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowPaymentChoice(true)}
                className="w-full py-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:scale-[1.01]"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  Unlock Premium Global Access ('$19/mo')
                </span>
              </button>

              {/* Supported card brands badge */}
              <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-black italic text-blue-400">VISA</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-amber-400">MC</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-cyan-400">AMEX</span>
                <span className="text-slate-500">·</span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" /> Secure checkout
                </span>
              </div>
              <p className="text-[11px] text-center text-slate-500">
                Securely processed via international gateways. Cancel anytime.
              </p>
            </div>
          </div>

        </div>

        {/* Global Security Trust Strip */}
        <div className="max-w-4xl mx-auto p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-wrap items-center justify-around gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit TLS Bank Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-indigo-400" />
            <span>Accepted in 140+ Countries & Currencies</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>14-Day Money-Back Guarantee</span>
          </div>
        </div>

      </div>

      {/* Global Success Testimonials */}
      <div className="border-t border-slate-900 bg-slate-900/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">
              Verified Transformations
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              Trusted by Ambitious International Talent
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The Executive English Coach changed how I present in US engineering rounds. I stopped using awkward filler phrases and started driving conversations with confidence. Landed a Senior L5 offer at Amazon."
              </p>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-xs font-bold text-white">Daniel M.</p>
                <p className="text-[11px] text-slate-500">Senior Software Engineer · Relocated to Seattle, WA</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The Google X-Y-Z bullet rewriter alone is worth ten times the monthly price. My ATS callback rate jumped from 4% to over 35% in less than 3 weeks across European tech startups."
              </p>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-xs font-bold text-white">Elena R.</p>
                <p className="text-[11px] text-slate-500">Lead Product Manager · Berlin, Germany</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "Practicing STAR behavioral questions with immediate scorecards gave me the exact phrasing needed for consulting case interviews. The AI objection handler is ridiculously accurate."
              </p>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-xs font-bold text-white">Arjun K.</p>
                <p className="text-[11px] text-slate-500">Management Consultant · London, UK</p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8">

        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">
            Answers & Clarity
          </span>
          <h3 className="text-2xl sm:text-4xl font-black text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-bold text-white">{faq.q}</span>
                  <span className="text-slate-400 text-lg font-mono">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Bottom Final CTA Strip */}
      <div className="border-t border-slate-900 bg-gradient-to-b from-indigo-950/30 to-slate-950 py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to secure your target international role?
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Join thousands of software engineers, product managers, and business leaders accelerating their careers with VStudyHub Global.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onTabChange('ai-career-coach')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Get Started with AI Coach</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('pricing');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all cursor-pointer"
            >
              View Pricing ($19/mo)
            </button>
          </div>
        </div>
      </div>

      {/* Real Razorpay payment choices */}
      {showPaymentChoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="payment-choice-title">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 id="payment-choice-title" className="text-xl font-bold">Choose your payment</h2>
              <button type="button" onClick={() => setShowPaymentChoice(false)} className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10" aria-label="Close payment options">×</button>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">Choose your region and review the payment terms on Razorpay.</p>
            <a href="https://pages.razorpay.com/pl_TnN9eI4DNdyhoB/view" target="_blank" rel="noopener noreferrer" className="mt-5 block rounded-xl bg-indigo-500 px-4 py-4 text-center font-bold text-white hover:bg-indigo-400">India — ₹1,455/month · Razorpay</a>
            <a href="https://pages.razorpay.com/pl_TnNCMjqe6B2Yr2/view" target="_blank" rel="noopener noreferrer" className="mt-3 block rounded-xl border border-indigo-400/50 px-4 py-4 text-center font-bold text-white hover:bg-white/5">International — $19/month · Razorpay</a>
            <p className="mt-4 text-xs leading-5 text-slate-500">Payment verification may be required before Pro features are activated.</p>
          </div>
        </div>
      )}
    </div>
  );
};
