import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ExternalLink, Loader2, MapPin, ShieldCheck, Sparkles, Star, Wrench, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PremiumPanelProps {
  onClose: () => void;
}

interface SubscriptionRow {
  subscription_status: string | null;
}

const TRADE_OPTIONS = [
  { name: 'Plumbers', description: 'Leaks, drains, water heaters, and bathroom fixes.', query: 'plumber' },
  { name: 'Electricians', description: 'Wiring, outlets, lighting, and panel work.', query: 'electrician' },
  { name: 'HVAC pros', description: 'Heating, cooling, ventilation, and air quality.', query: 'HVAC contractor' },
  { name: 'Roofers', description: 'Roof repairs, gutters, flashing, and inspections.', query: 'roofer' },
  { name: 'General contractors', description: 'Trusted help for bigger home projects.', query: 'general contractor' },
  { name: 'Handymen', description: 'Smaller fixes and finishing touches around the home.', query: 'handyman' },
];

const ACTIVE_STATUSES = new Set(['active', 'trialing']);
const PREMIUM_PRICE_ID = import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID as string | undefined;

export default function PremiumPanel({ onClose }: PremiumPanelProps) {
  const [isPremium, setIsPremium] = useState(false);
  const [checking, setChecking] = useState(true);
  const [location, setLocation] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('stripe_user_subscriptions')
      .select('subscription_status')
      .maybeSingle()
      .then(({ data, error }) => {
        if (mounted) {
          setIsPremium(!error && ACTIVE_STATUSES.has((data as SubscriptionRow | null)?.subscription_status ?? ''));
          setChecking(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('premium') === 'success') {
      setShowSuccess(true);
      setIsPremium(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('premium');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const recommendations = useMemo(() => {
    const area = location.trim();
    if (!area) return [];
    return TRADE_OPTIONS.map((trade) => ({
      ...trade,
      url: `https://www.google.com/maps/search/${encodeURIComponent(`${trade.query} near ${area}`)}`,
    }));
  }, [location]);

  const startCheckout = async () => {
    setCheckoutError(null);
    if (!PREMIUM_PRICE_ID) {
      setCheckoutError('Premium checkout is not fully configured.');
      return;
    }
    setCheckingOut(true);
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: {
        price_id: PREMIUM_PRICE_ID,
        mode: 'subscription',
        success_url: `${window.location.origin}/checkout-success.html`,
        cancel_url: window.location.href,
      },
    });
    if (error || !data?.url) {
      const message = data?.error ?? error?.context?.error ?? error?.message ?? 'We could not start checkout. Please try again.';
      setCheckoutError(message);
      setCheckingOut(false);
      return;
    }

    const popup = window.open(data.url, 'stripe-checkout', 'width=500,height=750,resizable,scrollbars');
    if (!popup) {
      window.location.assign(data.url);
      return;
    }

    const poll = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(poll);
        setCheckingOut(false);
      }
    }, 500);

    window.addEventListener('message', function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data === 'stripe-checkout-complete' || (typeof event.data === 'string' && event.data.includes('premium=success'))) {
        window.removeEventListener('message', onMessage);
        window.clearInterval(poll);
        popup.close();
        setCheckingOut(false);
        setShowSuccess(true);
        setIsPremium(true);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-stone-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-stone-50 shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-stone-200 px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700"><Sparkles size={22} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Home Repair Pro</p>
              <h2 className="mt-1 text-xl font-bold text-stone-900">Find the right help, faster</h2>
              <p className="mt-1 text-sm text-stone-500">Premium recommendations for the trades your home needs.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-200 hover:text-stone-700" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {checking ? (
            <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-stone-400" /></div>
          ) : isPremium || showSuccess ? (
            <div>
              <div className="mb-5 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800"><ShieldCheck size={17} /> Premium access is active</div>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700"><MapPin size={15} /> Where do you need help?</span>
                <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="ZIP code, city, or neighborhood" className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 shadow-sm outline-none transition focus:border-stone-900 focus:ring-1 focus:ring-stone-900" />
              </label>
              {recommendations.length === 0 ? (
                <div className="mt-5 rounded-xl border border-dashed border-stone-300 bg-white/60 p-8 text-center"><MapPin className="mx-auto text-stone-400" size={26} /><p className="mt-2 text-sm text-stone-500">Enter your area to see nearby home service searches.</p></div>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {recommendations.map((trade) => <a key={trade.name} href={trade.url} target="_blank" rel="noreferrer" className="group rounded-xl border border-stone-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div className="rounded-lg bg-stone-100 p-2 text-stone-700"><Wrench size={17} /></div><ExternalLink size={16} className="text-stone-400 transition group-hover:text-amber-700" /></div><h3 className="mt-3 font-semibold text-stone-900">{trade.name}</h3><p className="mt-1 text-xs leading-5 text-stone-500">{trade.description}</p><div className="mt-3 flex items-center gap-1 text-xs font-semibold text-amber-700"><Star size={13} fill="currentColor" /> Browse nearby listings</div></a>)}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-[1fr_0.85fr] md:items-center">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Your shortcut to local pros</h3>
                <ul className="mt-4 space-y-3 text-sm text-stone-600">
                  {['Search six essential home trades in your area', 'Jump straight to nearby business listings', 'Keep your repair plan and recommendations together'].map((item) => (
                    <li key={item} className="flex items-start gap-2"><Check size={17} className="mt-0.5 shrink-0 text-emerald-600" />{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-semibold text-stone-700">Home Repair Pro</p>
                <p className="mt-1 text-3xl font-bold text-stone-900">Premium</p>
                <p className="mt-1 text-xs text-stone-500">Secure recurring billing through Stripe.</p>
                <button onClick={startCheckout} disabled={checkingOut} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50">
                  {checkingOut && <Loader2 size={16} className="animate-spin" />}
                  Unlock recommendations <ArrowRight size={16} />
                </button>
                {checkingOut && <p className="mt-3 text-center text-xs text-stone-500">Complete payment in the popup window. You can use code <span className="font-bold">BOLT</span> for 100% off.</p>}
                {checkoutError && <p className="mt-3 text-xs font-medium text-red-700">{checkoutError}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
