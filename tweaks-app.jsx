// tweaks-app.jsx — Live tweaks for the VORA design system

const VORA_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primary": "#2276DB",
  "primaryHover": "#1D68C2",
  "accent": "#34B1E3",
  "scale": 1.0,
  "radius": "balanced",
  "showHero": true,
  "showFooter": true
}/*EDITMODE-END*/;

const RADIUS_PRESETS = {
  sharp:    { sm: 2, md: 4, lg: 6 },
  balanced: { sm: 6, md: 8, lg: 12 },
  soft:     { sm: 10, md: 14, lg: 20 },
};

function VoraTweaksApp() {
  const [t, setTweak] = useTweaks(VORA_TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--vora-primary', t.primary);
    root.style.setProperty('--vora-primary-hover', t.primaryHover);
    root.style.setProperty('--vora-sky', t.accent);
    root.style.setProperty('--type-scale', String(t.scale));
    const r = RADIUS_PRESETS[t.radius] || RADIUS_PRESETS.balanced;
    root.style.setProperty('--vora-r-sm', r.sm + 'px');
    root.style.setProperty('--vora-r-md', r.md + 'px');
    root.style.setProperty('--vora-r-lg', r.lg + 'px');
  }, [t.primary, t.primaryHover, t.accent, t.scale, t.radius]);

  React.useEffect(() => {
    document.querySelectorAll('[data-toggle="hero"]').forEach(el => el.hidden = !t.showHero);
    document.querySelectorAll('[data-toggle="footer"]').forEach(el => el.hidden = !t.showFooter);
  }, [t.showHero, t.showFooter]);

  return (
    <TweaksPanel title="VORA Tweaks">
      <TweakSection label="Brand color" />
      <TweakColor
        label="Primary"
        value={t.primary}
        options={['#2276DB', '#1857A8', '#0E7C66', '#D9384B', '#5E2EE6']}
        onChange={(v) => {
          const dark = darken(v, 0.10);
          setTweak({ primary: v, primaryHover: dark });
        }}
      />
      <TweakColor
        label="Accent (sky)"
        value={t.accent}
        options={['#34B1E3', '#2BD4C1', '#F5A524', '#FF7A45']}
        onChange={(v) => setTweak('accent', v)}
      />

      <TweakSection label="Form" />
      <TweakRadio
        label="Radius"
        value={t.radius}
        options={['sharp', 'balanced', 'soft']}
        onChange={(v) => setTweak('radius', v)}
      />
      <TweakSlider
        label="Type scale"
        value={t.scale}
        min={0.85}
        max={1.2}
        step={0.05}
        onChange={(v) => setTweak('scale', v)}
      />

      <TweakSection label="Sections" />
      <TweakToggle label="Hero preview" value={t.showHero}  onChange={(v) => setTweak('showHero', v)} />
      <TweakToggle label="Footer" value={t.showFooter} onChange={(v) => setTweak('showFooter', v)} />
    </TweaksPanel>
  );
}

// Simple hex darken
function darken(hex, amt) {
  const h = hex.replace('#','');
  const num = parseInt(h, 16);
  let r = (num >> 16) & 0xff, g = (num >> 8) & 0xff, b = num & 0xff;
  r = Math.max(0, Math.round(r * (1 - amt)));
  g = Math.max(0, Math.round(g * (1 - amt)));
  b = Math.max(0, Math.round(b * (1 - amt)));
  return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
}

// Mark sections to toggle
document.querySelectorAll('.section').forEach(s => {
  const t = s.querySelector('.section__title');
  if (!t) return;
  const txt = t.textContent;
  if (txt.includes('홈 화면')) s.setAttribute('data-toggle', 'hero');
  if (txt.includes('풋터')) s.setAttribute('data-toggle', 'footer');
});

const mount = document.createElement('div');
document.body.appendChild(mount);
ReactDOM.createRoot(mount).render(<VoraTweaksApp />);
