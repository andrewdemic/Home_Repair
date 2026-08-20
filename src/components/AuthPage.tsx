import { useState } from 'react';
import {
  Home, Mail, Lock, Loader2,
  Hammer, Wrench, PaintRoller, Ruler, Drill, HardHat,
  PaintBucket, Pipette, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C39.999 35.487 44 30.252 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

const CLOUDS = [
  { top: '5%', scale: 1, duration: '50s', delay: '0s', opacity: 'opacity-90' },
  { top: '13%', scale: 0.65, duration: '65s', delay: '-20s', opacity: 'opacity-75' },
  { top: '2%', scale: 0.8, duration: '58s', delay: '-35s', opacity: 'opacity-80' },
  { top: '20%', scale: 0.5, duration: '42s', delay: '-10s', opacity: 'opacity-60' },
];

const BIRDS = [
  { top: '16%', duration: '24s', delay: '0s', variant: 1 },
  { top: '10%', duration: '30s', delay: '-7s', variant: 2 },
  { top: '24%', duration: '26s', delay: '-15s', variant: 1 },
];

const RAIN_TOOLS: { Icon: LucideIcon; color: string; size: number }[] = [
  { Icon: Hammer, color: 'text-amber-600', size: 28 },
  { Icon: Wrench, color: 'text-sky-600', size: 26 },
  { Icon: PaintRoller, color: 'text-rose-500', size: 24 },
  { Icon: Ruler, color: 'text-emerald-600', size: 22 },
  { Icon: Drill, color: 'text-orange-600', size: 24 },
  { Icon: HardHat, color: 'text-yellow-600', size: 26 },
  { Icon: Pipette, color: 'text-purple-600', size: 22 },
  { Icon: PaintBucket, color: 'text-red-500', size: 24 },
  { Icon: Wrench, color: 'text-teal-600', size: 25 },
  { Icon: Hammer, color: 'text-stone-600', size: 22 },
  { Icon: Ruler, color: 'text-indigo-500', size: 20 },
  { Icon: Drill, color: 'text-rose-600', size: 23 },
];

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    if (mode === 'signin') {
      const { error } = await signIn(email.trim(), password);
      if (error) setError(error);
    } else {
      const { error } = await signUp(email.trim(), password);
      if (error) {
        setError(error);
      } else {
        setInfo('Account created! Check your email if confirmation is required, or sign in.');
        setMode('signin');
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-stone-300 bg-white/90 py-2.5 pl-10 pr-3 text-sm text-stone-900 shadow-sm backdrop-blur-sm transition focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900';

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* === Animated background === */}
      <div className="absolute inset-0 z-0">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200" />

        {/* Sun */}
        <div className="absolute right-[12%] top-[8%] h-20 w-20 rounded-full bg-yellow-300 shadow-[0_0_60px_20px_rgba(253,224,71,0.5)]" />

        {/* Clouds */}
        {CLOUDS.map((c, i) => (
          <div
            key={i}
            className={`absolute ${c.opacity}`}
            style={{
              top: c.top,
              left: 0,
              animation: `drift-slow ${c.duration} linear infinite`,
              animationDelay: c.delay,
            }}
          >
            <Cloud scale={c.scale} />
          </div>
        ))}

        {/* Birds */}
        {BIRDS.map((b, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: b.top,
              left: 0,
              animation: `${b.variant === 1 ? 'fly-bird' : 'fly-bird-2'} ${b.duration} linear infinite`,
              animationDelay: b.delay,
            }}
          >
            <Bird />
          </div>
        ))}

        {/* Raining tools */}
        {RAIN_TOOLS.map((t, i) => {
          const left = `${(i * 8.3 + 3) % 96}%`;
          const duration = `${3.5 + (i % 5) * 0.8}s`;
          const delay = `${(i * 0.7) % 5}s`;
          return (
            <div
              key={i}
              className={`absolute ${t.color}`}
              style={{
                left,
                top: 0,
                animation: `rain-tool ${duration} linear infinite`,
                animationDelay: delay,
              }}
            >
              <t.Icon size={t.size} strokeWidth={1.5} />
            </div>
          );
        })}

        {/* Victorian home SVG scene anchored to bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <VictorianHome />
        </div>

        {/* Light wash for readability on the form side */}
        <div className="absolute inset-0 bg-white/15" />
      </div>

      {/* === Foreground — centered === */}
      <div className="relative z-10 flex w-full items-start justify-center px-4 pt-[8vh]">
        <div className="w-full max-w-sm">
          {/* Logo + branding */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-md">
              <Home size={26} />
            </div>
            <h1 className="text-2xl font-bold text-stone-800 drop-shadow-sm">Home Repair Tracker</h1>
            <p className="mt-1 max-w-xs text-sm font-medium text-stone-600 drop-shadow-sm">
              Every old home has a story. Track the repairs behind it.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/40 bg-stone-50/70 shadow-2xl backdrop-blur-md">
            <div className="px-6 pt-6">
              <h2 className="text-xl font-bold text-stone-900">
                {mode === 'signin' ? 'Welcome back' : 'Get started'}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {mode === 'signin'
                  ? 'Sign in to manage your home repairs.'
                  : 'Create an account to start tracking.'}
              </p>
            </div>

            <div className="px-6 pb-6 pt-5">
              {/* Tabs */}
              <div className="mb-5 flex rounded-lg bg-stone-100 p-1">
                <button
                  onClick={() => { setMode('signin'); setError(null); setInfo(null); }}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                    mode === 'signin' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('signup'); setError(null); setInfo(null); }}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                    mode === 'signup' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-stone-600">Email</span>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                      autoComplete="email"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-stone-600">Password</span>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    />
                  </div>
                </label>

                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}
                {info && (
                  <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-300/70" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-stone-50/70 px-3 text-xs font-medium uppercase tracking-wide text-stone-400">
                    or
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-stone-300 bg-white/90 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-white active:scale-[0.98] disabled:opacity-50"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <p className="mt-4 text-center text-xs text-stone-400">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null); }}
                  className="font-medium text-stone-600 underline hover:text-stone-900"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Cartoon cloud ---- */
function Cloud({ scale = 1 }: { scale?: number }) {
  return (
    <svg
      width={160 * scale}
      height={70 * scale}
      viewBox="0 0 160 70"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="45" cy="45" rx="35" ry="25" />
      <ellipse cx="80" cy="35" rx="40" ry="30" />
      <ellipse cx="115" cy="45" rx="32" ry="22" />
      <rect x="30" y="45" width="100" height="20" rx="10" />
    </svg>
  );
}

/* ---- Cartoon bird ---- */
function Bird() {
  return (
    <svg width="28" height="14" viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 7 Q7 1 13 7 Q19 1 27 7"
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---- Victorian home SVG scene ---- */
function VictorianHome() {
  return (
    <svg
      viewBox="0 0 1200 500"
      className="w-full h-auto"
      preserveAspectRatio="xMidYMax meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground */}
      <rect x="0" y="420" width="1200" height="80" fill="#86b04a" />
      <rect x="0" y="420" width="1200" height="10" fill="#6f9c3a" />

      {/* Distant hills */}
      <ellipse cx="200" cy="430" rx="350" ry="60" fill="#7aa84e" opacity="0.6" />
      <ellipse cx="950" cy="430" rx="400" ry="70" fill="#7aa84e" opacity="0.6" />

      {/* Trees behind house */}
      <g>
        <rect x="80" y="340" width="14" height="90" fill="#6b4f2a" />
        <circle cx="87" cy="330" r="45" fill="#5fa83c" />
        <circle cx="65" cy="345" r="30" fill="#69b843" />
        <circle cx="110" cy="345" r="28" fill="#69b843" />
      </g>
      <g>
        <rect x="1080" y="350" width="12" height="80" fill="#6b4f2a" />
        <circle cx="1086" cy="340" r="38" fill="#5fa83c" />
        <circle cx="1065" cy="355" r="26" fill="#69b843" />
      </g>

      {/* === Main house === */}
      <g transform="translate(380, 180)">
        {/* Left wing body */}
        <rect x="-20" y="120" width="140" height="200" fill="#e8c39e" stroke="#b8896a" strokeWidth="3" />
        {/* Left wing roof */}
        <polygon points="-30,120 50,60 130,120" fill="#8b3a3a" stroke="#6b2a2a" strokeWidth="3" />

        {/* Main tower body */}
        <rect x="120" y="80" width="180" height="240" fill="#f0d0ad" stroke="#b8896a" strokeWidth="3" />
        {/* Main tower roof */}
        <polygon points="110,80 210,0 310,80" fill="#9c4040" stroke="#6b2a2a" strokeWidth="3" />
        {/* Roof shingle lines */}
        <line x1="110" y1="80" x2="310" y2="80" stroke="#6b2a2a" strokeWidth="3" />
        <line x1="150" y1="50" x2="270" y2="50" stroke="#6b2a2a" strokeWidth="2" opacity="0.5" />
        <line x1="170" y1="30" x2="250" y2="30" stroke="#6b2a2a" strokeWidth="2" opacity="0.5" />

        {/* Chimney */}
        <rect x="240" y="10" width="28" height="60" fill="#a0522d" stroke="#7a3e20" strokeWidth="2" />
        <rect x="236" y="6" width="36" height="10" fill="#8b4513" stroke="#7a3e20" strokeWidth="2" />
        {/* Smoke */}
        <circle cx="254" cy="0" r="8" fill="rgba(200,200,200,0.5)" style={{ animation: 'smoke 3s ease-out infinite' }} />
        <circle cx="254" cy="0" r="8" fill="rgba(200,200,200,0.5)" style={{ animation: 'smoke 3s ease-out infinite', animationDelay: '1.5s' }} />

        {/* Right wing body */}
        <rect x="300" y="140" width="120" height="180" fill="#e8c39e" stroke="#b8896a" strokeWidth="3" />
        {/* Right wing roof */}
        <polygon points="290,140 360,90 430,140" fill="#8b3a3a" stroke="#6b2a2a" strokeWidth="3" />

        {/* Windows — main tower (tall arched) */}
        <g>
          <rect x="145" y="110" width="40" height="80" rx="20" fill="#6bb6ff" stroke="#4a6a8a" strokeWidth="3" />
          <line x1="165" y1="110" x2="165" y2="190" stroke="#4a6a8a" strokeWidth="2" />
          <line x1="145" y1="150" x2="185" y2="150" stroke="#4a6a8a" strokeWidth="2" />
        </g>
        <g>
          <rect x="235" y="110" width="40" height="80" rx="20" fill="#6bb6ff" stroke="#4a6a8a" strokeWidth="3" />
          <line x1="255" y1="110" x2="255" y2="190" stroke="#4a6a8a" strokeWidth="2" />
          <line x1="235" y1="150" x2="275" y2="150" stroke="#4a6a8a" strokeWidth="2" />
        </g>

        {/* Round window in attic */}
        <circle cx="210" cy="45" r="18" fill="#6bb6ff" stroke="#4a6a8a" strokeWidth="3" />
        <line x1="192" y1="45" x2="228" y2="45" stroke="#4a6a8a" strokeWidth="2" />
        <line x1="210" y1="27" x2="210" y2="63" stroke="#4a6a8a" strokeWidth="2" />

        {/* Windows — left wing */}
        <g>
          <rect x="10" y="150" width="35" height="55" rx="6" fill="#6bb6ff" stroke="#4a6a8a" strokeWidth="3" />
          <line x1="27" y1="150" x2="27" y2="205" stroke="#4a6a8a" strokeWidth="2" />
          <line x1="10" y1="177" x2="45" y2="177" stroke="#4a6a8a" strokeWidth="2" />
        </g>
        <g>
          <rect x="65" y="150" width="35" height="55" rx="6" fill="#6bb6ff" stroke="#4a6a8a" strokeWidth="3" />
          <line x1="82" y1="150" x2="82" y2="205" stroke="#4a6a8a" strokeWidth="2" />
          <line x1="65" y1="177" x2="100" y2="177" stroke="#4a6a8a" strokeWidth="2" />
        </g>

        {/* Windows — right wing */}
        <g>
          <rect x="325" y="170" width="35" height="55" rx="6" fill="#6bb6ff" stroke="#4a6a8a" strokeWidth="3" />
          <line x1="342" y1="170" x2="342" y2="225" stroke="#4a6a8a" strokeWidth="2" />
          <line x1="325" y1="197" x2="360" y2="197" stroke="#4a6a8a" strokeWidth="2" />
        </g>

        {/* Front door */}
        <rect x="190" y="240" width="50" height="80" rx="4" fill="#6b4f2a" stroke="#4a3520" strokeWidth="3" />
        <rect x="196" y="246" width="38" height="35" rx="2" fill="#8b6a3a" />
        <circle cx="230" cy="285" r="3" fill="#fbbf24" />

        {/* Porch */}
        <rect x="160" y="310" width="110" height="12" fill="#c4a878" stroke="#9a7e50" strokeWidth="2" />
        <rect x="165" y="322" width="8" height="18" fill="#9a7e50" />
        <rect x="257" y="322" width="8" height="18" fill="#9a7e50" />

        {/* Gingerbread trim under main eave */}
        <g fill="#f0d0ad" stroke="#b8896a" strokeWidth="1.5">
          <path d="M120,80 L125,90 L130,80 L135,90 L140,80 L145,90 L150,80 L155,90 L160,80 L165,90 L170,80 L175,90 L180,80 L185,90 L190,80 L195,90 L200,80 L205,90 L210,80 L215,90 L220,80 L225,90 L230,80 L235,90 L240,80 L245,90 L250,80 L255,90 L260,80 L265,90 L270,80 L275,90 L280,80 L285,90 L290,80 L295,90 L300,80" />
        </g>

        {/* Foundation */}
        <rect x="-25" y="318" width="450" height="6" fill="#9a8b7a" />
      </g>

    </svg>
  );
}
