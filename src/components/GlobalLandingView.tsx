import { useState } from "react";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Globe2,
  MessageCircle,
  Mic,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  BriefcaseBusiness,
  Menu,
  X,
} from "lucide-react";

interface GlobalLandingViewProps {
  onTabChange: (tab: string) => void;
  onOpenAccountModal?: () => void;
}

const features = [
  {
    icon: Mic,
    title: "AI English Speaking Coach",
    description:
      "Practice speaking, improve fluency, and build confidence with guided English practice.",
    tab: "ai-english-coach",
  },
  {
    icon: BriefcaseBusiness,
    title: "AI Interview Practice",
    description:
      "Prepare for job interviews with practice questions and structured answer feedback.",
    tab: "ai-interview",
  },
  {
    icon: Target,
    title: "AI Career Coach",
    description:
      "Prepare for professional goals, explore career skills, and practise workplace communication.",
    tab: "ai-career-coach",
  },
];

const faqs = [
  {
    question: "What is VStudyHub AI English Coach?",
    answer:
      "VStudyHub brings English practice, interview preparation, and career coaching together in one place.",
  },
  {
    question: "Who can use VStudyHub?",
    answer:
      "Students, job seekers, and professionals can use the available coaching tools to practise and improve their skills.",
  },
  {
    question: "How much does Pro cost?",
    answer:
      "The current Pro checkout is configured for $19 per month. Review the amount and billing details on the Razorpay payment page before paying.",
  },
  {
    question: "How do I cancel or manage my subscription?",
    answer:
      "Check your Razorpay receipt and subscription-management information after purchase. Contact support if you need help managing your subscription.",
  },
];

export default function GlobalLandingView({
  onTabChange,
  onOpenAccountModal,
}: GlobalLandingViewProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);

  const handleStartPro = () => {
    setShowPaymentChoice(true);
  };

  const openFeature = (tab: string) => {
    setMobileMenuOpen(false);
    onTabChange(tab);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Navigation */}
      <header className="border-b border-white/10 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text-left"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
              <Brain size={23} />
            </span>
            <span className="text-xl font-black tracking-tight">
              VStudyHub<span className="text-indigo-400"> AI</span>
            </span>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-sm text-slate-300 hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-slate-300 hover:text-white">
              How it works
            </a>
            <a href="#pricing" className="text-sm text-slate-300 hover:text-white">
              Pricing
            </a>
            <button
              type="button"
              onClick={onOpenAccountModal}
              className="text-sm text-slate-300 hover:text-white"
            >
              Account
            </button>
            <button
              type="button"
              onClick={() => setShowPaymentChoice(true)}
              className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-bold hover:bg-indigo-400 disabled:opacity-60"
            >
              Get Pro
            </button>
          </nav>

          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-white/15 p-2 md:hidden"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="flex flex-col gap-4 border-t border-white/10 px-6 py-5 md:hidden">
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
              How it works
            </a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </a>
            <button type="button" onClick={() => openFeature("ai-english-coach")}>
              Try English Coach
            </button>
            <button type="button" onClick={() => setShowPaymentChoice(true)}>
              Get Pro - $19/month
            </button>
          </nav>
        )}
      </header>

      {showPaymentChoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="payment-choice-title">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h2 id="payment-choice-title" className="text-xl font-bold">Choose your payment</h2>
              <button type="button" onClick={() => setShowPaymentChoice(false)} className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10" aria-label="Close payment options">×</button>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">Choose your region and review the final amount and billing terms on Razorpay before paying.</p>
            <a href="https://pages.razorpay.com/pl_TnNCMjqe6B2Yr2/view" target="_blank" rel="noopener noreferrer" className="mt-5 block rounded-xl bg-indigo-500 px-4 py-4 text-center font-bold text-white hover:bg-indigo-400">India — ₹1,455/month · Razorpay</a>
            <a href="https://pages.razorpay.com/pl_TnN9eI4DNdyhoB/view" target="_blank" rel="noopener noreferrer" className="mt-3 block rounded-xl border border-indigo-400/50 px-4 py-4 text-center font-bold text-white hover:bg-white/5">International — $19/month · Razorpay</a>
            <p className="mt-4 text-xs leading-5 text-slate-500">Pro access may not activate automatically after payment until payment verification is connected.</p>
          </div>
        </div>
      )}
      <main>
        {/* Hero */}
        <section className="relative">
          <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-200">
                <Sparkles size={16} />
                Your personal AI learning companion
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
                Speak with confidence.
                <span className="block text-indigo-400">
                  Interview with purpose.
                </span>
                Grow with AI.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Practise English, prepare for interviews, and strengthen your
                career skills with AI coaching designed to help you take the
                next step.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openFeature("ai-english-coach")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-4 font-bold hover:bg-indigo-400"
                >
                  Try AI English Coach <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => openFeature("ai-interview")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-4 font-bold hover:bg-white/5"
                >
                  Practise an Interview
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="text-emerald-400" />
                  Start with available free tools
                </span>
                <span className="flex items-center gap-2">
                  <Globe2 size={17} className="text-emerald-400" />
                  Built for learners worldwide
                </span>
              </div>
            </div>

            <div className="mx-auto w-full max-w-lg">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-slate-900 to-slate-900 p-5 shadow-2xl shadow-indigo-950/50 sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Your next step</p>
                    <h2 className="mt-1 text-xl font-bold">
                      Build real-world confidence
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-indigo-500/20 p-3 text-indigo-300">
                    <TrendingUp size={26} />
                  </div>
                </div>

                <div className="space-y-4">
                  {features.map((feature) => {
                    const Icon = feature.icon;

                    return (
                      <button
                        key={feature.title}
                        type="button"
                        onClick={() => openFeature(feature.tab)}
                        className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:border-indigo-400/60 hover:bg-slate-900"
                      >
                        <span className="rounded-xl bg-indigo-500/15 p-3 text-indigo-300">
                          <Icon size={23} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold">{feature.title}</span>
                          <span className="mt-1 block text-sm leading-5 text-slate-400">
                            Open coaching tool
                          </span>
                        </span>
                        <ArrowRight size={18} className="shrink-0 text-slate-400" />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
                  <ShieldCheck className="mt-0.5 shrink-0 text-emerald-400" size={20} />
                  <p className="text-sm leading-6 text-slate-300">
                    Choose a coaching tool, practise at your own pace, and
                    keep working toward your goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y border-white/10 bg-slate-900/60">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">
                One learning hub
              </p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                Practical coaching for your next opportunity
              </h2>
              <p className="mt-4 leading-7 text-slate-400">
                Choose the skill you want to work on and open the corresponding
                VStudyHub tool.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="rounded-2xl border border-white/10 bg-slate-950 p-7"
                  >
                    <div className="mb-5 inline-flex rounded-xl bg-indigo-500/15 p-3 text-indigo-300">
                      <Icon size={26} />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="mt-3 min-h-20 leading-7 text-slate-400">
                      {feature.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => openFeature(feature.tab)}
                      className="mt-5 inline-flex items-center gap-2 font-bold text-indigo-300 hover:text-indigo-200"
                    >
                      Open tool <ArrowRight size={17} />
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">
              Simple to get started
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Turn practice into progress
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Choose your goal",
                description:
                  "Start with English speaking, interview preparation, or career coaching.",
              },
              {
                number: "02",
                title: "Practise consistently",
                description:
                  "Use the available tools to work through questions and improve your skills.",
              },
              {
                number: "03",
                title: "Keep improving",
                description:
                  "Review your practice and continue working toward your learning or career goals.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-white/10 p-7"
              >
                <span className="text-sm font-black tracking-widest text-indigo-400">
                  STEP {step.number}
                </span>
                <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-y border-white/10 bg-slate-900/60">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300">
                Simple pricing
              </p>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                Take the next step with Pro
              </h2>
              <p className="mt-4 leading-7 text-slate-400">
                Review your subscription details on the secure checkout page
                before completing your purchase.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-md rounded-3xl border border-indigo-400/50 bg-slate-950 p-8 shadow-2xl shadow-indigo-950/30">
              <div className="flex items-center gap-2 text-indigo-300">
                <Sparkles size={20} />
                <span className="font-bold">VStudyHub Pro</span>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-5xl font-black">$19</span>
                <span className="text-slate-400">/ month</span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Subscription checkout for your existing configured Pro plan.
              </p>

              <ul className="mt-7 space-y-4">
                {[
                  "Access the available VStudyHub coaching tools",
                  "Practise English and interview skills",
                  "Use one hub for learning and career preparation",
                  "Secure payment through Razorpay",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setShowPaymentChoice(true)}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-4 font-bold hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CreditCard size={19} />
                Start Pro - $19/month
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                The final price, currency, and billing terms are shown by
                Razorpay before you pay.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-4xl px-5 py-20 sm:px-8">
          <div className="mb-10 text-center">
            <div className="mb-3 flex justify-center">
              <MessageCircle size={30} className="text-indigo-300" />
            </div>
            <h2 className="text-3xl font-black">Frequently asked questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="rounded-xl border border-white/10 bg-slate-900/70"
              >
                <button
                  type="button"
                  aria-expanded={openFaqIndex === index}
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 transition-transform ${
                      openFaqIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFaqIndex === index && (
                  <p className="px-5 pb-5 leading-7 text-slate-400">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final call to action */}
        <section className="px-5 pb-20 sm:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl border border-indigo-400/20 bg-gradient-to-r from-indigo-600/20 to-blue-500/10 px-6 py-12 text-center sm:px-12">
            <h2 className="text-3xl font-black sm:text-4xl">
              Your next opportunity starts with practice.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
              Start with a coaching tool and take the next step toward your
              English, interview, or career goals.
            </p>
            <button
              type="button"
              onClick={() => openFeature("ai-english-coach")}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-4 font-bold hover:bg-indigo-400"
            >
              Start practising <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} VStudyHub AI. Learn, practise, and grow.</p>
        <p className="mt-2">
          AI tools support practice and learning; results depend on your use and progress.
        </p>
      </footer>
    </div>
  );
}
