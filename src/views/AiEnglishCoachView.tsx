import React, { useState } from "react";

const modes = [
  "English Speaking",
  "Interview English",
  "Professional English",
  "Grammar & Vocabulary"
];

export default function AiEnglishCoachView() {
  const [mode, setMode] = useState("English Speaking");
  const [input, setInput] = useState("");

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center">
          <div className="mb-4 inline-block rounded-full border px-4 py-2 text-sm font-medium">
            AI English Coach
          </div>

          <h1 className="text-4xl font-bold sm:text-5xl">
            Improve Your English With an AI Coach
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Practice speaking, interview English, professional communication,
            grammar, and vocabulary with an AI coach for global learners.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border p-6 shadow-sm">
          <label className="mb-3 block text-sm font-semibold">
            Choose your coaching mode
          </label>

          <div className="grid gap-2 sm:grid-cols-2">
            {modes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={
                  "rounded-xl border px-4 py-3 text-left text-sm font-medium " +
                  (mode === item
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-700")
                }
              >
                {item}
              </button>
            ))}
          </div>

          <label className="mb-2 mt-6 block text-sm font-semibold">
            What would you like to practice?
          </label>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            maxLength={500}
            placeholder="Example: Help me practice a software engineer interview."
            className="w-full resize-none rounded-xl border border-slate-300 p-4 text-sm outline-none"
          />

          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white"
          >
            Practice with AI Coach
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Current mode: {mode}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-5">
            <h2 className="font-semibold">Speaking Practice</h2>
            <p className="mt-2 text-sm text-slate-600">
              Build confidence and communicate naturally.
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="font-semibold">Interview English</h2>
            <p className="mt-2 text-sm text-slate-600">
              Practice answers for global job interviews.
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="font-semibold">Professional English</h2>
            <p className="mt-2 text-sm text-slate-600">
              Improve workplace communication.
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="font-semibold">Grammar & Vocabulary</h2>
            <p className="mt-2 text-sm text-slate-600">
              Strengthen accuracy and word choice.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
