import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  Crosshair,
  Cpu,
  Download,
  Gauge,
  Globe2,
  LockKeyhole,
  Play,
  Radio,
  RotateCcw,
  Share2,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  Thermometer,
  Volume2,
  VolumeX,
  Waves,
  Zap,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const VERDICT = 'The Quantum-Delphic Decision Spinner says: MAYBE.';
const DURATION_MS = 30_000;

type Phase = 'setup' | 'processing' | 'result';
type Dimension = 'Dimension C-137' | 'Earth Prime' | 'The Dark Timeline';
type Soundtrack = 'Low Orbit Hum' | 'Cinematic Tension' | 'No Audio, Just Consequences';

const dimensions: Array<{ name: Dimension; code: string; note: string; color: string }> = [
  { name: 'Dimension C-137', code: 'C-137', note: 'Comfortably familiar. Statistically suspicious.', color: '#d8ff4c' },
  { name: 'Earth Prime', code: 'E-001', note: 'The one with the most paperwork.', color: '#3dd6dc' },
  { name: 'The Dark Timeline', code: 'D-TL9', note: 'Best avoided. Best sample size.', color: '#ff8a52' },
];

const terminalLines = [
  'booting delphic kernel 7.4.1...',
  'requesting clearance from the Bureau of Small Decisions',
  'allocating twelve trillion hypothetical qubits',
  'calibrating emotional interference filters',
  'observing the observer observing the question',
  'cross-referencing the vibes with peer-reviewed vibes',
  'running Monte Carlo simulation of your gut feeling',
  'consulting a very confident intern',
  'measuring probability of regret in kelvin',
  'compressing 8,912 possible futures into one shrug',
  'initiating consensus among all parallel selves',
  'checking if this could have been an email',
  'synchronizing with the moon (it said maybe too)',
  'locking verdict matrix; dignity unavailable',
];

function playAudioTone(
  audioRef: { current: AudioContext | null },
  enabled: boolean,
  kind: 'click' | 'alert' | 'hum',
) {
  if (!enabled || typeof window === 'undefined') return;
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;
  if (!audioRef.current) audioRef.current = new AudioContextClass();
  const context = audioRef.current;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  const frequency = kind === 'alert' ? 156 : kind === 'hum' ? 58 : 420;
  oscillator.type = kind === 'hum' ? 'sine' : 'square';
  oscillator.frequency.setValueAtTime(frequency, now);
  if (kind === 'click') oscillator.frequency.exponentialRampToValueAtTime(180, now + 0.08);
  if (kind === 'alert') oscillator.frequency.exponentialRampToValueAtTime(78, now + 0.28);
  gain.gain.setValueAtTime(kind === 'hum' ? 0.025 : 0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === 'hum' ? 0.5 : 0.3));
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + (kind === 'hum' ? 0.5 : 0.3));
}

function Metric({ label, value, accent = 'lime', icon }: { label: string; value: string; accent?: 'lime' | 'orange' | 'cyan'; icon: ReactNode }) {
  const color = accent === 'orange' ? '#ff8a52' : accent === 'cyan' ? '#3dd6dc' : '#d8ff4c';
  return (
    <div className="flex items-center gap-2.5" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <span style={{ color }} className="opacity-80">{icon}</span>
      <div>
        <p className="font-mono-custom text-[9px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="font-mono-custom text-[11px] tracking-wide" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

function Header({
  audioEnabled,
  setAudioEnabled,
  phase,
  onReset,
}: {
  audioEnabled: boolean;
  setAudioEnabled: (value: boolean) => void;
  phase: Phase;
  onReset: () => void;
}) {
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <header className="relative z-10 border-b border-white/[0.08] bg-[#0d0f19]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-4 lg:px-10">
        <button type="button" onClick={onReset} className="group flex items-center gap-3 text-left" data-testid="button-reset-header">
          <div className="relative grid h-9 w-9 place-items-center border border-[#d8ff4c]/45 bg-[#d8ff4c]/10 text-[#d8ff4c] transition group-hover:bg-[#d8ff4c]/20">
            <Crosshair size={18} strokeWidth={1.5} />
            <span className="absolute -right-1 -top-1 h-1.5 w-1.5 bg-[#ff8a52]" />
          </div>
          <div>
            <p className="font-display text-sm font-bold tracking-[0.08em] text-[#edf0d7]">QD / DS</p>
            <p className="font-mono-custom text-[9px] uppercase tracking-[0.18em] text-slate-500">Decision Sciences Division</p>
          </div>
        </button>
        <div className="flex items-center gap-5 font-mono-custom text-[10px] uppercase tracking-[0.13em] text-slate-500">
          <span className="hidden items-center gap-2 sm:flex"><span className="telemetry-dot" /> Grid online</span>
          <span className="hidden border-l border-white/10 pl-5 sm:inline">{clock.toLocaleTimeString([], { hour12: false })} UTC</span>
          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="flex items-center gap-2 border border-white/10 px-2.5 py-1.5 text-slate-400 transition hover:border-[#d8ff4c]/45 hover:text-[#d8ff4c]"
            data-testid="button-audio-toggle"
            aria-label={audioEnabled ? 'Disable generated audio' : 'Enable generated audio'}
          >
            {audioEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span className="hidden sm:inline">{audioEnabled ? 'Audio on' : 'Audio off'}</span>
          </button>
          {phase !== 'setup' && (
            <button type="button" onClick={onReset} className="flex items-center gap-2 text-slate-500 transition hover:text-[#ff8a52]" data-testid="button-reset">
              <ArrowLeft size={13} /> Abort
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function TelemetryStrip() {
  const [serverTemp, setServerTemp] = useState(63.7);
  const [globalTemp, setGlobalTemp] = useState(14.2);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setServerTemp((value) => Number((value + (Math.random() - 0.46) * 0.25).toFixed(1)));
      setGlobalTemp((value) => Number((value + (Math.random() - 0.5) * 0.03).toFixed(2)));
    }, 1300);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="border-b border-white/[0.07] bg-[#111422]/75">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-3 lg:px-10">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          <Metric label="Server core temp" value={`${serverTemp.toFixed(1)} °C`} icon={<Thermometer size={14} />} />
          <Metric label="Global user temp" value={`${globalTemp.toFixed(2)} °C`} accent="orange" icon={<Globe2 size={14} />} />
          <Metric label="Quantum load" value="87.4%" accent="cyan" icon={<Gauge size={14} />} />
        </div>
        <div className="flex items-center gap-2 font-mono-custom text-[9px] uppercase tracking-[0.16em] text-slate-600">
          <Radio size={12} className="text-[#3dd6dc]" /> live telemetry / no one is watching
        </div>
      </div>
    </div>
  );
}

function Setup({ onStart, audioEnabled }: { onStart: (question: string, dimension: Dimension, precision: boolean, soundtrack: Soundtrack, accelerated: boolean) => void; audioEnabled: boolean }) {
  const [question, setQuestion] = useState('');
  const [dimension, setDimension] = useState<Dimension>('Dimension C-137');
  const [precision, setPrecision] = useState(true);
  const [coverOpen, setCoverOpen] = useState(false);
  const [soundtrack, setSoundtrack] = useState<Soundtrack>('Low Orbit Hum');
  const [accelerated, setAccelerated] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const isReady = question.trim().length > 4 && coverOpen;

  const click = (kind: 'click' | 'alert' | 'hum' = 'click') => playAudioTone(audioRef, audioEnabled, kind);
  const selectDimension = (value: Dimension) => {
    setDimension(value);
    click();
  };
  return (
    <main className="relative z-10 mx-auto max-w-[1500px] px-5 pb-20 pt-12 lg:px-10 lg:pt-20">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-20">
        <section className="max-w-4xl">
          <div className="fade-up flex items-center gap-3 font-mono-custom text-[10px] uppercase tracking-[0.25em] text-[#3dd6dc]">
            <span className="telemetry-dot" style={{ background: '#3dd6dc', boxShadow: '0 0 12px rgba(61,214,220,.8)' }} />
            Classified instrument / v. 7.4.1
          </div>
          <h1 className="fade-up stagger-1 mt-7 max-w-4xl font-display text-[clamp(3.25rem,8vw,8.5rem)] font-extrabold leading-[0.87] tracking-[-0.075em] text-[#edf0d7] text-glow">
            Make the small<br /><span className="text-[#d8ff4c]">question</span> enormous.
          </h1>
          <p className="fade-up stagger-2 mt-8 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            A multi-million-dollar decision engine for the moments that absolutely did not need one. Submit a binary question. Receive a result that has survived several hostile dimensions.
          </p>
          <div className="fade-up stagger-3 mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono-custom text-[9px] uppercase tracking-[0.15em] text-slate-600">
            <span className="flex items-center gap-2"><Check size={12} className="text-[#d8ff4c]" /> No account required</span>
            <span className="flex items-center gap-2"><Check size={12} className="text-[#d8ff4c]" /> Nothing stored</span>
            <span className="flex items-center gap-2"><Check size={12} className="text-[#d8ff4c]" /> Almost peer reviewed</span>
          </div>
        </section>
        <aside className="panel relative self-start p-5 sm:p-6 lg:mt-7">
          <div className="absolute right-4 top-4 font-mono-custom text-[9px] tracking-[0.18em] text-slate-600">FORM 01 / 03</div>
          <div className="mb-7 flex items-center gap-3 border-b border-white/10 pb-5">
            <SlidersHorizontal size={16} className="text-[#d8ff4c]" />
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-[0.1em]">Question intake</p>
              <p className="font-mono-custom text-[9px] uppercase tracking-[0.13em] text-slate-500">State your uncertainty</p>
            </div>
          </div>
          <label htmlFor="question" className="font-mono-custom text-[10px] uppercase tracking-[0.18em] text-[#d8ff4c]">Binary query</label>
          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onFocus={() => click('hum')}
            placeholder="Should I order the second dessert?"
            rows={3}
            className="mt-3 w-full resize-none border border-white/15 bg-[#0c0e17] px-4 py-3 font-mono-custom text-sm leading-6 text-[#edf0d7] outline-none transition placeholder:text-slate-700 focus:border-[#d8ff4c]/70 focus:ring-1 focus:ring-[#d8ff4c]/20"
            data-testid="input-question"
          />
          <div className="mt-2 flex justify-between font-mono-custom text-[9px] uppercase tracking-[0.1em] text-slate-600">
            <span>{question.length}/240 characters</span><span>Truth optional</span>
          </div>
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-mono-custom text-[10px] uppercase tracking-[0.18em] text-slate-400">Reality layer</label>
              <span className="font-mono-custom text-[9px] text-[#3dd6dc]">3 available</span>
            </div>
            <div className="space-y-2">
              {dimensions.map((item) => (
                <button
                  type="button"
                  key={item.name}
                  onClick={() => selectDimension(item.name)}
                  className={`group flex w-full items-center justify-between border px-3 py-3 text-left transition ${dimension === item.name ? 'border-[#d8ff4c]/70 bg-[#d8ff4c]/[0.08]' : 'border-white/10 bg-[#0c0e17] hover:border-white/30'}`}
                  data-testid={`button-dimension-${item.code}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full" style={{ background: item.color, boxShadow: `0 0 10px ${item.color}` }} />
                    <span>
                      <span className="block font-mono-custom text-[11px] text-[#edf0d7]">{item.name}</span>
                      <span className="mt-1 block text-[10px] text-slate-600">{item.note}</span>
                    </span>
                  </span>
                  {dimension === item.name && <Check size={14} className="text-[#d8ff4c]" />}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <div>
              <p className="font-mono-custom text-[10px] uppercase tracking-[0.16em] text-slate-400">Quantum precision</p>
              <p className="mt-1 text-[10px] text-slate-600">Adds 11.7% more theatre.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={precision}
              onClick={() => { setPrecision(!precision); click(); }}
              className={`relative h-6 w-11 border transition ${precision ? 'border-[#d8ff4c] bg-[#d8ff4c]/20' : 'border-white/20 bg-white/5'}`}
              data-testid="button-precision-toggle"
            >
              <span className={`absolute top-1 h-3.5 w-3.5 transition-all ${precision ? 'left-6 bg-[#d8ff4c]' : 'left-1 bg-slate-500'}`} />
            </button>
          </div>
          <div className="mt-5">
            <label htmlFor="soundtrack" className="mb-2 block font-mono-custom text-[10px] uppercase tracking-[0.16em] text-slate-400">Soundtrack profile</label>
            <div className="relative">
              <select
                id="soundtrack"
                value={soundtrack}
                onChange={(event) => { setSoundtrack(event.target.value as Soundtrack); click(); }}
                className="w-full appearance-none border border-white/10 bg-[#0c0e17] px-3 py-2.5 font-mono-custom text-[11px] text-slate-300 outline-none transition focus:border-[#d8ff4c]/60"
                data-testid="select-soundtrack"
              >
                <option>Low Orbit Hum</option>
                <option>Cinematic Tension</option>
                <option>No Audio, Just Consequences</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-3 text-slate-500" />
            </div>
          </div>
          <div className="mt-5 border border-[#ff8a52]/25 bg-[#ff8a52]/[0.06] p-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={accelerated}
                onChange={(event) => setAccelerated(event.target.checked)}
                className="mt-0.5 accent-[#ff8a52]"
                data-testid="checkbox-accelerated"
              />
              <span>
                <span className="block font-mono-custom text-[10px] uppercase tracking-[0.11em] text-[#ff8a52]">I decline the ceremony</span>
                <span className="mt-1 block text-[10px] leading-4 text-slate-600">Explicitly skip the default 30-second calculation. For impatient principals only.</span>
              </span>
            </label>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => { setCoverOpen(!coverOpen); click('alert'); }}
              className={`cover-shine relative flex w-full items-center justify-between overflow-hidden border px-4 py-3 transition ${coverOpen ? 'border-[#d8ff4c]/70 bg-[#d8ff4c]/[0.09] text-[#d8ff4c]' : 'border-[#ff8a52]/50 bg-[#ff8a52]/[0.08] text-[#ffb395] hover:bg-[#ff8a52]/[0.14]'}`}
              data-testid="button-safety-cover"
            >
              <span className="relative z-10 flex items-center gap-3 font-mono-custom text-[10px] uppercase tracking-[0.12em]">
                <LockKeyhole size={15} /> {coverOpen ? 'Safety interlock disengaged' : 'Open safety cover'}
              </span>
              <span className={`relative z-10 h-3 w-3 border ${coverOpen ? 'border-[#d8ff4c] bg-[#d8ff4c]' : 'border-[#ff8a52]'}`} />
            </button>
            <button
              type="button"
              disabled={!isReady}
              onClick={() => onStart(question.trim(), dimension, precision, soundtrack, accelerated)}
              className="mt-3 flex w-full items-center justify-center gap-3 bg-[#d8ff4c] px-4 py-3.5 font-display text-xs font-bold uppercase tracking-[0.16em] text-[#0d0f19] transition hover:bg-[#ebff93] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
              data-testid="button-start-calculation"
            >
              <Play size={15} fill="currentColor" /> Initiate calculation
            </button>
            {!isReady && <p className="mt-2 text-center font-mono-custom text-[9px] uppercase tracking-[0.1em] text-slate-600">{question.trim().length <= 4 ? 'Awaiting a sufficiently consequential question' : 'Open the safety cover to proceed'}</p>}
          </div>
        </aside>
      </div>
      <div className="mt-24 grid border-y border-white/[0.08] sm:grid-cols-3">
        <div className="border-b border-white/[0.08] p-5 sm:border-b-0 sm:border-r"><p className="font-display text-3xl text-[#d8ff4c]">01</p><p className="mt-2 font-mono-custom text-[10px] uppercase tracking-[0.15em] text-slate-500">Ask with conviction</p></div>
        <div className="border-b border-white/[0.08] p-5 sm:border-b-0 sm:border-r"><p className="font-display text-3xl text-[#3dd6dc]">30s</p><p className="mt-2 font-mono-custom text-[10px] uppercase tracking-[0.15em] text-slate-500">Ceremonial processing time</p></div>
        <div className="p-5"><p className="font-display text-3xl text-[#ff8a52]">??</p><p className="mt-2 font-mono-custom text-[10px] uppercase tracking-[0.15em] text-slate-500">Confidence at conclusion</p></div>
      </div>
    </main>
  );
}

function Globe({ progress }: { progress: number }) {
  return (
    <div className="relative mx-auto h-[245px] w-[245px] sm:h-[330px] sm:w-[330px]">
      <div className="absolute inset-[13%] rounded-full border border-[#3dd6dc]/35 bg-[radial-gradient(circle_at_35%_30%,rgba(61,214,220,.26),rgba(19,42,58,.25)_42%,rgba(9,13,22,.94)_75%)] shadow-[0_0_80px_rgba(61,214,220,.12)] breathing">
        <div className="absolute inset-[13%] rounded-full border border-dashed border-[#3dd6dc]/25" />
        <div className="absolute left-[22%] top-[32%] h-2 w-2 rounded-full bg-[#d8ff4c] shadow-[0_0_18px_#d8ff4c]" />
        <div className="absolute left-[58%] top-[25%] h-1.5 w-1.5 rounded-full bg-[#ff8a52] shadow-[0_0_15px_#ff8a52]" />
        <div className="absolute left-[67%] top-[65%] h-1.5 w-1.5 rounded-full bg-[#3dd6dc] shadow-[0_0_15px_#3dd6dc]" />
        <div className="absolute inset-0 rounded-full opacity-40" style={{ background: `conic-gradient(from ${progress * 3.6}deg, transparent, rgba(61,214,220,.3), transparent 32%)` }} />
      </div>
      <div className="orbit absolute inset-[4%] rounded-full border border-dashed border-[#d8ff4c]/45"><span className="absolute -right-1 top-1/2 h-2 w-2 rounded-full bg-[#d8ff4c] shadow-[0_0_14px_#d8ff4c]" /></div>
      <div className="orbit-reverse absolute inset-[20%] rounded-full border border-[#ff8a52]/35"><span className="absolute -left-1 top-1/2 h-1.5 w-1.5 rounded-full bg-[#ff8a52]" /></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono-custom text-[10px] uppercase tracking-[0.3em] text-[#d8ff4c]/80">{Math.round(progress)}%</span>
      </div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap border border-white/10 bg-[#0d0f19] px-3 py-1 font-mono-custom text-[9px] uppercase tracking-[0.16em] text-slate-500">earth / observed</div>
    </div>
  );
}

function Processing({
  question,
  dimension,
  precision,
  soundtrack,
  accelerated,
  audioEnabled,
  onComplete,
}: {
  question: string;
  dimension: Dimension;
  precision: boolean;
  soundtrack: Soundtrack;
  accelerated: boolean;
  audioEnabled: boolean;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [easterEgg, setEasterEgg] = useState<string | null>(null);
  const [whiteout, setWhiteout] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const startedRef = useRef(Date.now());
  const usedEggRef = useRef(false);
  const totalDuration = accelerated ? 4_500 : DURATION_MS;
  const hasPizza = /\bpizza\b/i.test(question);
  const hasLife = /\blife\b/i.test(question);
  const hasSleep = /\bsleep\b/i.test(question);
  const activeEgg = hasPizza ? 'PIZZA PROTOCOL' : hasLife ? 'LIFE DETECTED' : hasSleep ? 'SLEEP MODE INTRUSION' : null;
  const terminalCount = Math.min(terminalLines.length, Math.max(1, Math.floor(progress / 7) + 1));
  const status = useMemo(() => {
    if (progress < 12) return 'Establishing causal baseline';
    if (progress < 28) return 'Separating signal from preference';
    if (progress < 49) return 'Mapping adjacent probabilities';
    if (progress < 71) return 'Negotiating with parallel outcomes';
    if (progress < 89) return 'Compressing the unknowable';
    return 'Preparing a responsible non-answer';
  }, [progress]);

  useEffect(() => {
    startedRef.current = Date.now();
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - startedRef.current;
      const next = Math.min(100, elapsed / totalDuration * 100);
      setProgress(next);
      if (next >= 100) {
        window.clearInterval(tick);
        playAudioTone(audioRef, audioEnabled, 'alert');
        setWhiteout(true);
        window.setTimeout(() => onCompleteRef.current(), 900);
      } else if (Math.floor(next) % 11 === 0) {
        playAudioTone(audioRef, audioEnabled, 'click');
      }
    }, 120);
    return () => window.clearInterval(tick);
  }, [audioEnabled, totalDuration]);

  useEffect(() => {
    if (!activeEgg || usedEggRef.current || progress < 30 || progress > 62) return;
    usedEggRef.current = true;
    setEasterEgg(activeEgg);
    playAudioTone(audioRef, audioEnabled, 'alert');
    const timer = window.setTimeout(() => setEasterEgg(null), 1000);
    return () => window.clearTimeout(timer);
  }, [activeEgg, audioEnabled, progress]);

  return (
    <main className="relative z-10 min-h-[calc(100dvh-82px)] overflow-hidden">
      <div className="mx-auto flex max-w-[1500px] flex-col px-5 pb-16 pt-8 lg:px-10 lg:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-5">
          <div>
            <p className="font-mono-custom text-[9px] uppercase tracking-[0.2em] text-[#ff8a52]">Live calculation / classified</p>
            <h2 className="mt-3 max-w-2xl font-display text-2xl font-bold leading-tight tracking-[-0.04em] text-[#edf0d7] sm:text-4xl">{question}</h2>
          </div>
          <div className="text-right">
            <p className="font-mono-custom text-[10px] uppercase tracking-[0.16em] text-slate-600">Selected layer</p>
            <p className="mt-1 font-mono-custom text-sm text-[#3dd6dc]">{dimension}</p>
          </div>
        </div>
        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)] lg:gap-14">
          <section>
            <div className="panel relative min-h-[440px] overflow-hidden p-5 sm:p-8">
              <div className="absolute inset-0 hairline-grid opacity-60" />
              <div className="relative flex items-center justify-between font-mono-custom text-[9px] uppercase tracking-[0.17em] text-slate-600">
                <span className="flex items-center gap-2"><Activity size={12} className="text-[#d8ff4c]" /> Orbital observation field</span>
                <span>{precision ? 'precision: maximal' : 'precision: tasteful'}</span>
              </div>
              <div className="relative mt-3">
                <Globe progress={progress} />
              </div>
              <div className="relative mt-8">
                <div className="mb-2 flex items-center justify-between font-mono-custom text-[9px] uppercase tracking-[0.14em]">
                  <span className="text-slate-500">{status}</span><span className="text-[#d8ff4c]">{Math.round(progress).toString().padStart(3, '0')} / 100</span>
                </div>
                <div className="progress-sheen h-2 bg-[#252a3a]"><div className="h-full bg-[#d8ff4c] transition-[width] duration-300" style={{ width: `${progress}%` }} /></div>
              </div>
              <div className="relative mt-5 flex flex-wrap items-center gap-4 font-mono-custom text-[9px] uppercase tracking-[0.12em] text-slate-600">
                <span className="flex items-center gap-2"><span className="telemetry-dot" /> Entanglement stable</span>
                <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#3dd6dc]" /> {soundtrack}</span>
              </div>
            </div>
          </section>
          <section className="grid gap-4 sm:grid-cols-2 lg:block">
            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="flex items-center gap-2 font-mono-custom text-[10px] uppercase tracking-[0.17em] text-slate-400"><Terminal size={13} className="text-[#3dd6dc]" /> Process feed</p>
                <span className="blink font-mono-custom text-[9px] text-[#d8ff4c]">streaming</span>
              </div>
              <div className="h-[218px] overflow-hidden border border-white/[0.07] bg-[#0a0c12] p-3 font-mono-custom text-[10px] leading-5 text-slate-500">
                {terminalLines.slice(0, terminalCount).map((line, index) => (
                  <p key={line} className={index === terminalCount - 1 ? 'text-[#d8ff4c]' : ''}><span className="mr-2 text-slate-700">{String(index + 1).padStart(2, '0')}</span>{line}{index === terminalCount - 1 && <span className="terminal-cursor ml-1 text-[#d8ff4c]">▋</span>}</p>
                ))}
              </div>
            </div>
            <div className="panel mt-4 p-5 lg:mt-5">
              <div className="flex items-center gap-2 font-mono-custom text-[10px] uppercase tracking-[0.17em] text-slate-400"><Cpu size={13} className="text-[#ff8a52]" /> Variables under duress</div>
              <div className="mt-4 space-y-3">
                {[['Causality', `${Math.round(58 + progress * .31)}%`], ['Vibes', `${Math.round(92 - progress * .11)}%`], ['Regret index', `${(1.7 + progress * .012).toFixed(1)} / 10`]].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between font-mono-custom text-[10px]"><span className="text-slate-600">{label}</span><span className="text-[#3dd6dc]">{value}</span></div>
                ))}
              </div>
            </div>
          </section>
        </div>
        <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5 font-mono-custom text-[9px] uppercase tracking-[0.15em] text-slate-600">
          <span className="flex items-center gap-2"><ShieldAlert size={12} className="text-[#ff8a52]" /> Do not refresh the universe</span>
          <span>Est. remaining: {Math.max(0, Math.ceil((totalDuration - (Date.now() - startedRef.current)) / 1000))} sec</span>
        </div>
      </div>
      {easterEgg && <div className="fixed inset-0 z-40 grid place-items-center bg-[#0d0f19]/75 backdrop-blur-sm"><div className="border-2 border-[#ff8a52] bg-[#171521] px-8 py-7 text-center shadow-[0_0_80px_rgba(255,138,82,.22)]"><Zap size={24} className="mx-auto text-[#ff8a52]" /><p className="mt-4 font-display text-2xl font-bold text-[#ffb395]">{easterEgg}</p><p className="mt-2 font-mono-custom text-[10px] uppercase tracking-[0.16em] text-slate-500">One-second anomaly acknowledged</p></div></div>}
      {whiteout && <div className="whiteout fixed inset-0 z-50 bg-[#f5f6e8]" />}
    </main>
  );
}

function buildReport(question: string, dimension: Dimension, precision: boolean, soundtrack: Soundtrack) {
  const page = (title: string, body: string) => `<section style="page-break-after:always;min-height:92vh;padding:72px 64px;box-sizing:border-box"><div style="font:11px monospace;letter-spacing:.18em;color:#687229">QD / DS — CLASSIFIED</div><h1 style="font:700 42px sans-serif;line-height:1.05;color:#11182a">${title}</h1><div style="font:17px Georgia,serif;line-height:1.7;color:#293041;max-width:650px">${body}</div><div style="margin-top:80px;font:11px monospace;color:#687229">DOCUMENT 7.4.1 / DO NOT OVERTHINK</div></section>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>Quantum-Delphic Classified Report</title></head><body style="margin:0;background:#f1f2e7">${[
    page('A Decision Has Been Requested', `<p><strong>Question submitted:</strong> ${question}</p><p>This document records the ceremonial analysis of a binary question deemed too important for ordinary human judgment.</p>`),
    page('Executive Summary', '<p>A suitably overfunded system was convened. It made several charts, consulted alternate realities, and refused to be rushed.</p><p>Finding: the situation remains magnificently inconclusive.</p>'),
    page('Instrument Conditions', `<p>Reality layer: <strong>${dimension}</strong><br>Quantum precision: <strong>${precision ? 'maximal' : 'tasteful'}</strong><br>Soundtrack: <strong>${soundtrack}</strong></p>`),
    page('Methodology', '<p>We began by assigning a number to intuition, then a second number to the first number. The numbers disagreed. This is considered healthy scientific tension.</p>'),
    page('Orbital Observation', '<p>The globe was observed orbiting. It continued to do so, providing strong evidence that at least one thing is working.</p>'),
    page('Probability Weather', '<p>Conditions ranged from cautiously optimistic to absolutely not. A cloud shaped like a question mark was recorded at 14:02 UTC.</p>'),
    page('Risk & Compliance', '<p>No lives were endangered during this calculation. One afternoon was endangered. The Bureau recommends a snack before further deliberation.</p>'),
    page('Peer Review', '<p>Three reviewers were asked whether the method was sound. Two said “interesting.” One requested authorship credit. Consensus was not reached.</p>'),
    page('Final Determination', `<p style="font:700 62px sans-serif;color:#687229">MAYBE.</p><p>${VERDICT}</p>`),
    page('Post-Decision Guidance', '<p>Proceed with whatever you were probably going to do. If challenged, cite this report confidently.</p><p style="margin-top:60px;font-weight:bold">Ask your mom</p>'),
  ].join('')}</body></html>`;
}

function Result({ question, dimension, precision, soundtrack, onReplay }: { question: string; dimension: Dimension; precision: boolean; soundtrack: Soundtrack; onReplay: () => void }) {
  const [notice, setNotice] = useState('');
  const exportReport = () => {
    const blob = new Blob([buildReport(question, dimension, precision, soundtrack)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'quantum-delphic-classified-report.html';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice('Report downloaded. Please store it somewhere dramatic.');
  };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Quantum-Delphic verdict', text: VERDICT });
      else {
        await navigator.clipboard.writeText(VERDICT);
        setNotice('Exact verdict copied to clipboard.');
      }
    } catch {
      setNotice('The share was wisely reconsidered.');
    }
  };
  return (
    <main className="relative z-10 mx-auto flex min-h-[calc(100dvh-82px)] max-w-[1500px] flex-col px-5 pb-20 pt-10 lg:px-10 lg:pt-16">
      <div className="grid flex-1 items-center gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
        <section className="fade-up">
          <p className="flex items-center gap-2 font-mono-custom text-[10px] uppercase tracking-[0.22em] text-[#d8ff4c]"><Sparkles size={14} /> Calculation complete / result locked</p>
          <p className="mt-10 font-mono-custom text-[10px] uppercase tracking-[0.17em] text-slate-600">Your question was</p>
          <blockquote className="mt-3 border-l-2 border-[#3dd6dc] pl-5 font-display text-2xl font-semibold leading-tight text-[#edf0d7] sm:text-3xl">“{question}”</blockquote>
          <div className="mt-9 grid grid-cols-2 gap-3">
            <div className="border border-white/10 bg-[#111422] p-4"><p className="font-mono-custom text-[9px] uppercase tracking-[0.14em] text-slate-600">Layer</p><p className="mt-2 font-mono-custom text-xs text-[#3dd6dc]">{dimension}</p></div>
            <div className="border border-white/10 bg-[#111422] p-4"><p className="font-mono-custom text-[9px] uppercase tracking-[0.14em] text-slate-600">Confidence</p><p className="mt-2 font-mono-custom text-xs text-[#ff8a52]">Unclear / 10</p></div>
          </div>
        </section>
        <section className="relative fade-up stagger-2">
          <div className="absolute -inset-6 bg-[#d8ff4c]/[0.045] blur-3xl" />
          <div className="panel-warm relative overflow-hidden p-7 sm:p-12 lg:p-16">
            <div className="absolute right-6 top-6 font-mono-custom text-[9px] uppercase tracking-[0.18em] text-slate-600">Final output / 10</div>
            <p className="font-mono-custom text-[10px] uppercase tracking-[0.2em] text-[#ff8a52]">The machine has decided</p>
            <h1 className="mt-7 font-display text-[clamp(5rem,15vw,12rem)] font-extrabold leading-[0.75] tracking-[-0.1em] text-[#d8ff4c] text-glow">MAYBE<span className="text-[#ff8a52]">.</span></h1>
            <p className="mt-9 max-w-xl font-mono-custom text-sm leading-7 text-slate-400">{VERDICT} It is not nothing. It is also not, in any meaningful sense, something.</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button type="button" onClick={onReplay} className="flex items-center gap-2 border border-[#d8ff4c]/50 px-4 py-3 font-mono-custom text-[10px] uppercase tracking-[0.13em] text-[#d8ff4c] transition hover:bg-[#d8ff4c]/10" data-testid="button-replay"><RotateCcw size={14} /> Replay calculation</button>
              <button type="button" onClick={exportReport} className="flex items-center gap-2 border border-white/15 px-4 py-3 font-mono-custom text-[10px] uppercase tracking-[0.13em] text-slate-300 transition hover:border-white/40 hover:text-[#edf0d7]" data-testid="button-export"><Download size={14} /> Export report</button>
              <button type="button" onClick={share} className="flex items-center gap-2 border border-white/15 px-4 py-3 font-mono-custom text-[10px] uppercase tracking-[0.13em] text-slate-300 transition hover:border-[#3dd6dc]/60 hover:text-[#3dd6dc]" data-testid="button-share"><Share2 size={14} /> Share verdict</button>
            </div>
            {notice && <p className="mt-4 flex items-center gap-2 font-mono-custom text-[10px] text-[#3dd6dc]" data-testid="status-action-notice"><Check size={13} /> {notice}</p>}
          </div>
          <div className="relative mt-4 flex items-center justify-between font-mono-custom text-[9px] uppercase tracking-[0.14em] text-slate-600"><span className="flex items-center gap-2"><Clipboard size={12} /> Filed under: probably</span><span>Report integrity: vibes</span></div>
        </section>
      </div>
      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 font-mono-custom text-[9px] uppercase tracking-[0.15em] text-slate-600">
        <span>Thank you for making this everyone’s problem.</span>
        <span className="flex items-center gap-2"><Waves size={12} className="text-[#3dd6dc]" /> Signal stable</span>
      </div>
    </main>
  );
}

function Home() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [question, setQuestion] = useState('');
  const [dimension, setDimension] = useState<Dimension>('Dimension C-137');
  const [precision, setPrecision] = useState(true);
  const [soundtrack, setSoundtrack] = useState<Soundtrack>('Low Orbit Hum');
  const [accelerated, setAccelerated] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const onStart = (nextQuestion: string, nextDimension: Dimension, nextPrecision: boolean, nextSoundtrack: Soundtrack, nextAccelerated: boolean) => {
    setQuestion(nextQuestion); setDimension(nextDimension); setPrecision(nextPrecision); setSoundtrack(nextSoundtrack); setAccelerated(nextAccelerated); setPhase('processing');
  };
  const onReset = () => setPhase('setup');
  const onComplete = () => setPhase('result');
  return (
    <div className="scanlines control-room min-h-[100dvh] overflow-x-hidden text-[#edf0d7]">
      <Header audioEnabled={audioEnabled} setAudioEnabled={setAudioEnabled} phase={phase} onReset={onReset} />
      {phase === 'setup' && <TelemetryStrip />}
      {phase === 'setup' && <Setup onStart={onStart} audioEnabled={audioEnabled} />}
      {phase === 'processing' && <Processing question={question} dimension={dimension} precision={precision} soundtrack={soundtrack} accelerated={accelerated} audioEnabled={audioEnabled} onComplete={onComplete} />}
      {phase === 'result' && <Result question={question} dimension={dimension} precision={precision} soundtrack={soundtrack} onReplay={() => setPhase('processing')} />}
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;