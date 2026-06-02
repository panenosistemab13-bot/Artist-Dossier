import { CheckCircle2, XCircle } from 'lucide-react';

interface BadgeProps {
  value: string;
  type: 'format' | 'status' | 'distributor';
}

export function Badge({ value, type }: BadgeProps) {
  let bg = 'bg-stone-100';
  let text = 'text-stone-600';
  let border = 'border-stone-200';
  let rounded = 'rounded-lg';
  let extraClasses = 'font-bold uppercase py-1 px-2.5 text-[10px] tracking-widest border';

  if (type === 'format') {
    rounded = 'rounded-full shadow-sm backdrop-blur-md';
    if (value === 'SINGLE') { bg = 'bg-pink-100/90'; text = 'text-pink-700'; border = 'border-pink-200'; }
    if (value === 'MIXTAPE') { bg = 'bg-amber-100/90'; text = 'text-amber-700'; border = 'border-amber-200'; }
    if (value === 'EP') { bg = 'bg-emerald-100/90'; text = 'text-emerald-700'; border = 'border-emerald-200'; }
    if (value === 'ALBUM') { bg = 'bg-indigo-100/90'; text = 'text-indigo-700'; border = 'border-indigo-200'; }
  } else if (type === 'status') {
    rounded = 'rounded-full';
    extraClasses += ' flex items-center justify-center gap-1 min-w-[75px]';
    if (value === 'SIM') {
      bg = 'bg-green-50'; text = 'text-green-700'; border = 'border-green-200';
      return (
        <span className={`${rounded} ${bg} ${text} ${border} ${extraClasses}`}>
          <CheckCircle2 className="w-3 h-3" /> {value}
        </span>
      );
    }
    if (value === 'NÃO') {
      bg = 'bg-red-50'; text = 'text-red-700'; border = 'border-red-200';
      return (
        <span className={`${rounded} ${bg} ${text} ${border} ${extraClasses}`}>
          <XCircle className="w-3 h-3" /> {value}
        </span>
      );
    }
  } else if (type === 'distributor') {
    rounded = 'rounded-md';
    if (value === 'AO VIVO') { bg = 'bg-emerald-500'; text = 'text-white'; border = 'border-emerald-600'; }
    if (value === 'ENTREGUE') { bg = 'bg-blue-500'; text = 'text-white'; border = 'border-blue-600'; }
    if (value === 'INCOMPLETA') { bg = 'bg-stone-200'; text = 'text-stone-700'; border = 'border-stone-300'; }
    if (value === 'EM ANALIZE') { bg = 'bg-amber-400'; text = 'text-amber-900'; border = 'border-amber-500'; }
  }

  return (
    <span className={`${rounded} ${bg} ${text} ${border} ${extraClasses}`}>
      {value}
    </span>
  );
}
