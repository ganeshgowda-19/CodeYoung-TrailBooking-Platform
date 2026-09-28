import React, { useState } from 'react';
import { Sparkles, Brain, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, RefreshCw, BarChart2 } from 'lucide-react';

export type LearningLevelProfile = 'slow' | 'moderate' | 'quick';

export interface QuizResult {
  domain: string;
  learnerProfile: LearningLevelProfile;
  profileTitle: string;
  recommendedPace: string;
  teachingStrategy: string;
  answersSummary?: string[];
}

interface Question {
  id: number;
  question: string;
  options: {
    label: string;
    value: number; // 1 = slow/foundation, 2 = moderate, 3 = quick/advanced
    icon?: string;
  }[];
}

interface DomainConfig {
  id: string;
  label: string;
  icon: string;
  desc: string;
  color: string;
  questions: Question[];
}

const DOMAIN_QUIZZES: DomainConfig[] = [
  {
    id: 'Engineering & Tech',
    label: 'Engineering & Tech',
    icon: '💻',
    desc: 'CS, IT, Hardware, AI & Software Engineering',
    color: 'from-indigo-500 to-purple-600',
    questions: [
      {
        id: 1,
        question: 'What is your current coding & technology background?',
        options: [
          { label: 'Complete Beginner (No programming experience yet)', value: 1, icon: '🟢' },
          { label: 'Basic Syntax (Know variables, loops & basic conditional logic)', value: 2, icon: '🟡' },
          { label: 'Intermediate (Comfortable with Functions, OOP or DSA concepts)', value: 2, icon: '🔵' },
          { label: 'Advanced (Built full apps/models, seeking system design depth)', value: 3, icon: '⚡' },
        ],
      },
      {
        id: 2,
        question: 'Which core technology focus are you most eager to master?',
        options: [
          { label: 'Python Algorithms, Data Structures & Logic', value: 2, icon: '💻' },
          { label: 'Full-Stack Web & Mobile App Development', value: 2, icon: '🌐' },
          { label: 'Artificial Intelligence, Machine Learning & Data Science', value: 3, icon: '🤖' },
          { label: 'Low-Level Systems, C/C++ & Hardware Electronics', value: 3, icon: '⚡' },
        ],
      },
      {
        id: 3,
        question: 'How do you prefer to handle debugging & logic errors?',
        options: [
          { label: 'Line-by-line visual breakdown with gentle mentor guidance', value: 1, icon: '🐢' },
          { label: 'A quick guiding hint, then I try solving it on my own', value: 2, icon: '🚶' },
          { label: 'Give me raw documentation & edge cases for a rapid fix', value: 3, icon: '⚡' },
        ],
      },
      {
        id: 4,
        question: 'What is your primary goal for this 1:1 trial session?',
        options: [
          { label: 'Build a working live project from scratch in 45 minutes', value: 2, icon: '🚀' },
          { label: 'Prepare for technical coding interviews & problem solving', value: 3, icon: '🎯' },
          { label: 'Master difficult university / school CS coursework', value: 1, icon: '📚' },
        ],
      },
      {
        id: 5,
        question: 'What live coding pace works best for your comprehension style?',
        options: [
          { label: 'Patient & thorough (explain every keyword & concept line)', value: 1, icon: '🐢' },
          { label: 'Moderate pace (balance concept explanation with practice)', value: 2, icon: '🚶' },
          { label: 'Fast sprint (rapid building & high-level architecture focus)', value: 3, icon: '⚡' },
        ],
      },
    ],
  },
  {
    id: 'Medical & Healthcare',
    label: 'Medical & Doctors',
    icon: '🩺',
    desc: 'Anatomy, Biology, Pharma & Health Sciences',
    color: 'from-emerald-500 to-teal-600',
    questions: [
      {
        id: 1,
        question: 'What is your current medical or health science learning stage?',
        options: [
          { label: 'Pre-Med / High School Advanced Biology Student', value: 1, icon: '🩺' },
          { label: 'Medical, Nursing or Pharmacy University Student', value: 2, icon: '💉' },
          { label: 'Healthcare Professional / Clinical Researcher', value: 3, icon: '🔬' },
          { label: 'Enthusiast / Lifelong Biology & Health Learner', value: 1, icon: '📚' },
        ],
      },
      {
        id: 2,
        question: 'Which medical domain do you want 1:1 specialist focus on?',
        options: [
          { label: 'Human Physiology, Pathology & Clinical Anatomy', value: 2, icon: '🫀' },
          { label: 'Biochemistry, Pharmacology & Drug Mechanisms', value: 2, icon: '💊' },
          { label: 'Molecular Genetics, Microbiology & Cellular Biology', value: 3, icon: '🧬' },
          { label: 'Medical Statistics & Clinical Research Methodology', value: 3, icon: '📊' },
        ],
      },
      {
        id: 3,
        question: 'How do you best absorb complex medical pathways & diagrams?',
        options: [
          { label: '3D visual models & step-by-step interactive diagrams', value: 1, icon: '🐢' },
          { label: 'Structured concept summaries followed by patient case studies', value: 2, icon: '🚶' },
          { label: 'High-yield differential diagnosis & rapid recall questions', value: 3, icon: '⚡' },
        ],
      },
      {
        id: 4,
        question: 'What is your immediate goal for this 1:1 session?',
        options: [
          { label: 'Ace upcoming Board / USMLE / NEET medical exams', value: 3, icon: '🎯' },
          { label: 'Master clinical problem-solving & real patient case analysis', value: 2, icon: '🏥' },
          { label: 'Clear tricky anatomical or physiological concept bottlenecks', value: 1, icon: '📖' },
        ],
      },
      {
        id: 5,
        question: 'Which session speed fits your study style?',
        options: [
          { label: 'Patient & deep-dive (detailed molecular & clinical breakdown)', value: 1, icon: '🐢' },
          { label: 'Moderate pace (balanced topic coverage + interactive Q&A)', value: 2, icon: '🚶' },
          { label: 'High-yield fast pace (rapid concept mastery & high-yield summaries)', value: 3, icon: '⚡' },
        ],
      },
    ],
  },
  {
    id: 'School & Foundation',
    label: 'School (Grades 1-12)',
    icon: '🎓',
    desc: 'Foundation Math, Physics, Chemistry & STEM Logic',
    color: 'from-amber-500 to-orange-600',
    questions: [
      {
        id: 1,
        question: 'What grade level is the student currently studying in?',
        options: [
          { label: 'Primary School (Grades 1 - 5 Foundation)', value: 1, icon: '🎒' },
          { label: 'Middle School (Grades 6 - 8 Logic & Algebra)', value: 2, icon: '📐' },
          { label: 'High School (Grades 9 - 12 Physics, Chemistry, Calculus)', value: 2, icon: '🔬' },
          { label: 'AP / IB / Olympiad Competitive STEM Prep', value: 3, icon: '🏆' },
        ],
      },
      {
        id: 2,
        question: 'Which core STEM subject requires the most attention?',
        options: [
          { label: 'Foundation & Advanced Mathematics (Algebra, Calculus)', value: 2, icon: '🔢' },
          { label: 'Physics & Applied Mechanics', value: 2, icon: '⚡' },
          { label: 'Chemistry & Chemical Reactions', value: 2, icon: '🧪' },
          { label: 'Introductory Computer Logic & Robotics', value: 3, icon: '💻' },
        ],
      },
      {
        id: 3,
        question: 'How does the student react to tough math/science problems?',
        options: [
          { label: 'Needs patient encouragement & visual step-by-step guidance', value: 1, icon: '🐢' },
          { label: 'Tries once or twice, then appreciates a friendly hint', value: 2, icon: '🚶' },
          { label: 'Loves tricky puzzles and asks for harder challenge questions', value: 3, icon: '⚡' },
        ],
      },
      {
        id: 4,
        question: 'What is the main academic target for this 1:1 class?',
        options: [
          { label: 'Overcoming exam anxiety & boosting school grades', value: 1, icon: '📈' },
          { label: 'Preparing for math/science competitions & Olympiads', value: 3, icon: '🏆' },
          { label: 'Building rock-solid fundamental logic & problem-solving confidence', value: 2, icon: '🌟' },
        ],
      },
      {
        id: 5,
        question: 'What teaching pace keeps the student engaged?',
        options: [
          { label: 'Gentle & supportive (plenty of praise & visual drawings)', value: 1, icon: '🐢' },
          { label: 'Steady & structured (guided step-by-step practice problems)', value: 2, icon: '🚶' },
          { label: 'Fast-paced & challenging (quick mastery of advanced topics)', value: 3, icon: '⚡' },
        ],
      },
    ],
  },
  {
    id: 'Career Transition',
    label: 'Career Transition',
    icon: '💼',
    desc: 'AI Tools, Data Analytics & Tech Career Pivots',
    color: 'from-coral-500 to-rose-600',
    questions: [
      {
        id: 1,
        question: 'What is your current career transition background?',
        options: [
          { label: 'Non-tech professional transitioning into Tech / AI', value: 1, icon: '💼' },
          { label: 'Business Analyst / Manager moving into Data Analytics', value: 2, icon: '📊' },
          { label: 'Software Engineer transitioning into Machine Learning', value: 3, icon: '🔄' },
          { label: 'Entrepreneur / Founder building a tech MVP product', value: 2, icon: '🌟' },
        ],
      },
      {
        id: 2,
        question: 'Which high-demand skill do you want to master first?',
        options: [
          { label: 'Generative AI Tools, LLM Prompting & Automation', value: 2, icon: '🤖' },
          { label: 'Data Engineering, SQL & Business Analytics', value: 2, icon: '📊' },
          { label: 'Modern Web & App Product Development', value: 2, icon: '💻' },
          { label: 'Cybersecurity, Cloud Infrastructure & DevOps', value: 3, icon: '🛡️' },
        ],
      },
      {
        id: 3,
        question: 'How much weekly time can you commit to upskilling?',
        options: [
          { label: '2 - 5 hours / week (Paced learning alongside full-time job)', value: 1, icon: '🐢' },
          { label: '5 - 10 hours / week (Consistent part-time career pivot)', value: 2, icon: '🚶' },
          { label: '15+ hours / week (Intensive career pivot bootcamp pace)', value: 3, icon: '⚡' },
        ],
      },
      {
        id: 4,
        question: 'What is your target outcome for 1:1 mentorship?',
        options: [
          { label: 'Build a portfolio project to demonstrate skills to recruiters', value: 2, icon: '🚀' },
          { label: 'Successfully land a new tech role within 3 - 6 months', value: 3, icon: '💼' },
          { label: 'Automate repetitive workflows in my current job using AI', value: 1, icon: '💡' },
        ],
      },
      {
        id: 5,
        question: 'Which mentor instruction style fits your learning preference?',
        options: [
          { label: 'Hands-on guide who walks through every tool setup step', value: 1, icon: '🐢' },
          { label: 'Industry practitioner focusing on practical workflows', value: 2, icon: '🚶' },
          { label: 'Senior technical lead providing high-level code & architecture reviews', value: 3, icon: '⚡' },
        ],
      },
    ],
  },
];

interface Props {
  initialResult?: QuizResult | null;
  onComplete: (result: QuizResult) => void;
  onBack: () => void;
}

export const DiagnosticQuizStep: React.FC<Props> = ({ initialResult, onComplete, onBack }) => {
  const [selectedDomainId, setSelectedDomainId] = useState<string>(
    initialResult?.domain || 'Engineering & Tech'
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, { label: string; value: number }>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  const activeDomainConfig =
    DOMAIN_QUIZZES.find((d) => d.id === selectedDomainId) || DOMAIN_QUIZZES[0];

  const handleDomainChange = (domainId: string) => {
    setSelectedDomainId(domainId);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsQuizCompleted(false);
  };

  const handleSelectOption = (questionId: number, option: { label: string; value: number }) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeDomainConfig.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsQuizCompleted(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateResult = (): QuizResult => {
    const values = Object.values(answers).map((a) => a.value);
    const totalScore = values.reduce((sum, v) => sum + v, 0);
    const avgScore = values.length > 0 ? totalScore / values.length : 2;

    let learnerProfile: LearningLevelProfile = 'moderate';
    let profileTitle = 'Balanced Moderate Learner';
    let recommendedPace = 'Structured Conceptual & Hands-on Speed';
    let teachingStrategy =
      'Ideal balance of structured core concept explanations, guided problem-solving, and practical exercises.';

    if (avgScore <= 1.6) {
      learnerProfile = 'slow';
      profileTitle = 'Step-by-Step Foundation Learner (Patient Pace)';
      recommendedPace = 'Patient & Deep Visual Pace';
      teachingStrategy =
        'Step-by-step visual breakdowns, slow-paced foundational exercises, supportive live Q&A, and high encouragement.';
    } else if (avgScore >= 2.4) {
      learnerProfile = 'quick';
      profileTitle = 'Fast-Track Advanced Learner (Accelerated Pace)';
      recommendedPace = 'Accelerated High-Speed Sprint';
      teachingStrategy =
        'Rapid conceptual summaries, intensive live coding/problem challenges, advanced application tasks, and edge-case exploration.';
    }

    const answersSummary = activeDomainConfig.questions.map((q) => {
      const ans = answers[q.id];
      return ans ? `${q.question}: ${ans.label}` : `${q.question}: Unanswered`;
    });

    return {
      domain: activeDomainConfig.label,
      learnerProfile,
      profileTitle,
      recommendedPace,
      teachingStrategy,
      answersSummary,
    };
  };

  const handleFinish = () => {
    const result = calculateResult();
    onComplete(result);
  };

  const currentQuestion = activeDomainConfig.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const totalQuestions = activeDomainConfig.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 border-2 border-slate-300 rounded-3xl p-6 sm:p-8 bg-white shadow-xl">
      {/* Step Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border-2 border-slate-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-coral-50 text-coral-600 border border-coral-200">
              <Brain className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">Step 2: Interactive 5-Question Quiz</h2>
          </div>
          <p className="text-xs text-slate-600">
            Select your field of study to load tailored 5 diagnostic questions for your 1:1 mentor sync.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wide hidden sm:inline-block">
          AI Adaptive Assessment
        </span>
      </div>

      {/* Section 1: Domain Selection Tabs */}
      <div className="space-y-2">
        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
          1. Select Your Section / Field of Study:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DOMAIN_QUIZZES.map((domain) => {
            const isSelected = selectedDomainId === domain.id;
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => handleDomainChange(domain.id)}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-r from-coral-50 via-amber-50 to-indigo-50 border-coral-500 text-coral-950 font-black shadow-md ring-2 ring-coral-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 font-bold'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-base">{domain.icon}</span>
                  <span className="truncate">{domain.label}</span>
                </div>
                {isSelected && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-coral-500 to-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: 5-Question Quiz Interactive Stepper */}
      {!isQuizCompleted ? (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 space-y-5">
          {/* Quiz Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
            <div className="flex items-center gap-2 font-black text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{activeDomainConfig.label} Quiz</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="text-emerald-400 font-bold">{answeredCount}/{totalQuestions} Answered</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-coral-500 via-amber-500 to-emerald-400 h-1.5 transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Current Question Box */}
          <div className="space-y-4">
            <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
              Q{currentQuestion.id}: {currentQuestion.question}
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = currentAnswer?.label === opt.label;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, opt)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between group active:scale-98 ${
                      isSelected
                        ? 'bg-gradient-to-r from-coral-500 to-amber-500 text-white border-coral-400 shadow-lg shadow-coral-500/20 font-extrabold'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {opt.icon && <span className="text-base">{opt.icon}</span>}
                      <span>{opt.label}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-white text-coral-600 border-white font-black'
                          : 'border-slate-600 group-hover:border-slate-400'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-coral-600 fill-coral-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Nav Controls */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 ${
                currentQuestionIndex === 0
                  ? 'opacity-40 cursor-not-allowed text-slate-500'
                  : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous Question
            </button>

            <button
              type="button"
              onClick={handleNextQuestion}
              disabled={!currentAnswer}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                !currentAnswer
                  ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white shadow-md active:scale-95'
              }`}
            >
              {currentQuestionIndex === totalQuestions - 1 ? (
                <>
                  View Diagnostic Results <BarChart2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next Question <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Quiz Completed Results Card */
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-indigo-800/60 space-y-5 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-indigo-900/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-black text-white">Assessment Complete!</h3>
                <p className="text-[11px] text-slate-400 font-medium">5 Questions Analyzed by TrialFlow AI</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsQuizCompleted(false);
                setCurrentQuestionIndex(0);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[10px] font-extrabold flex items-center gap-1 border border-slate-700"
            >
              <RefreshCw className="w-3 h-3" /> Retake Quiz
            </button>
          </div>

          {/* Diagnostic Result summary */}
          {(() => {
            const res = calculateResult();
            return (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-coral-400 font-bold uppercase tracking-wider">
                      Diagnosed Profile Title
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        res.learnerProfile === 'slow'
                          ? 'bg-amber-400 text-slate-950'
                          : res.learnerProfile === 'quick'
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-indigo-400 text-slate-950'
                      }`}
                    >
                      {res.learnerProfile === 'slow'
                        ? '🐢 Step-by-Step Learner'
                        : res.learnerProfile === 'quick'
                        ? '⚡ Fast-Track Learner'
                        : '🚶 Moderate Learner'}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-white">{res.profileTitle}</h4>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    <strong>Recommended Strategy:</strong> {res.teachingStrategy}
                  </p>
                </div>

                {/* Selected Answers Summary Pill Grid */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Your Quiz Summary:</p>
                  <div className="space-y-1.5">
                    {res.answersSummary?.map((summary, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] text-slate-300 font-semibold bg-slate-800/50 p-2 rounded-xl border border-slate-800 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-coral-400 shrink-0" />
                        <span className="truncate">{summary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Main Footer Step Nav Controls */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Step 1
        </button>

        <button
          type="button"
          onClick={handleFinish}
          disabled={!isQuizCompleted && answeredCount < totalQuestions}
          className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 active:scale-95 ${
            !isQuizCompleted && answeredCount < totalQuestions
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white shadow-coral-500/20 font-black'
          }`}
        >
          Save Assessment & Continue to Timezone <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
