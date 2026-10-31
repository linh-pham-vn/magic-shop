interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * An on/off switch. The whole row (label + switch) is one tap target, at least
 * 44px tall. Screen readers hear it as a switch with its current state, and the
 * On/Off word means the state never depends on colour alone.
 */
export function Toggle({ label, checked, onChange }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="press inline-flex min-h-11 items-center gap-3 rounded-full px-3 text-sm text-cream-300"
    >
      <span>{label}</span>
      {/* The track: gold when on, dark velvet when off. */}
      <span
        aria-hidden="true"
        className={`relative inline-block h-[26px] w-11 shrink-0 rounded-full border transition-colors duration-200 ${
          checked ? 'border-gold-400 bg-gradient-to-b from-gold-300 to-gold-500' : 'border-gold-600/70 bg-velvet-950/70'
        }`}
      >
        {/* The knob slides right when on. */}
        <span
          className={`absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full shadow transition-transform duration-200 ease-out ${
            checked ? 'translate-x-[18px] bg-velvet-950' : 'translate-x-0 bg-cream-500'
          }`}
        />
      </span>
      <span aria-hidden="true" className={`w-6 text-left text-xs ${checked ? 'text-gold-300' : 'text-cream-500'}`}>
        {checked ? 'On' : 'Off'}
      </span>
    </button>
  );
}
