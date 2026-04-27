import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  Gauge,
  Zap,
  Wind,
  ChevronRight,
  ArrowUpRight,
  Cpu,
  ShieldCheck,
  Sparkles,
  Battery,
  Radar,
  CircuitBoard,
} from "lucide-react";

const ACCENT = "#00D4FF";
const BG = "#0A0A0A";
const EASE = [0.16, 1, 0.3, 1];

const MODELS = [
  {
    name: "VANTAGE GT",
    tag: "Track Edition",
    power: "812 HP",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "ECLIPSE S",
    tag: "Hyper Coupe",
    power: "1014 HP",
    image:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "NOVA ONE",
    tag: "All-Electric",
    power: "1340 HP",
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "STRATA R",
    tag: "Grand Tourer",
    power: "720 HP",
    image:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "OBSIDIAN X",
    tag: "Limited Series",
    power: "950 HP",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80",
  },
];

const TECH_PANELS = [
  {
    icon: Cpu,
    title: "Adaptive Neural Drive",
    body:
      "On-board inference cores recalibrate torque vectoring 1,200 times per second, learning the way you drive and the road beneath you.",
    visual:
      "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=1600&q=80",
  },
  {
    icon: Battery,
    title: "Solid-State Powertrain",
    body:
      "Next-gen solid-state cells deliver 720 km of range and recover 80% in eight minutes, without the thermal compromises of liquid chemistry.",
    visual:
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1600&q=80",
  },
  {
    icon: Radar,
    title: "Active Aero Skin",
    body:
      "Morphing carbon panels reshape the silhouette in real time — slipping through air at speed, gripping the tarmac through corners.",
    visual:
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1600&q=80",
  },
  {
    icon: CircuitBoard,
    title: "Quantum Telemetry",
    body:
      "Every drive is mapped, modelled and mirrored — a digital twin that evolves with you and unlocks bespoke performance profiles.",
    visual:
      "https://images.unsplash.com/photo-1542228262-3d663b306a53?auto=format&fit=crop&w=1600&q=80",
  },
];

/* ---------- helpers ---------- */

function useInjectGlobals() {
  useEffect(() => {
    const id = "lux-globals";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      .lux-display { font-family: 'Bebas Neue', 'Anton', Impact, sans-serif; letter-spacing: 0.01em; }
      .lux-body { font-family: 'Inter', system-ui, sans-serif; }
      .lux-grain {
        position: absolute; inset: 0; pointer-events: none; opacity: .06; mix-blend-mode: overlay;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.9'/></svg>");
      }
      .lux-no-scrollbar::-webkit-scrollbar { display: none; }
      .lux-no-scrollbar { scrollbar-width: none; }
      @media (hover: none) { .lux-cursor { display: none !important; } }
      @media (prefers-reduced-motion: reduce) {
        * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
      }
    `;
    document.head.appendChild(style);
  }, []);
}

function useCustomCursor(reduced) {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e) => {
      const t = e.target;
      if (t.closest && t.closest("[data-cursor='hover']")) setHovering(true);
    };
    const out = (e) => {
      const t = e.target;
      if (t.closest && t.closest("[data-cursor='hover']")) setHovering(false);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
    };
  }, [reduced, x, y]);

  return { sx, sy, hovering };
}

/* ---------- HERO ---------- */

function Hero({ reduced }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const carX = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const carScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const title = "DRIVE THE EDGE";
  const letters = title.split("");

  return (
    <section
      ref={ref}
      className="relative h-[100svh] w-full overflow-hidden"
      style={{ background: BG }}
    >
      <div className="lux-grain" />

      {/* Vertical rule lines for asymmetric grid */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute left-[12%] top-0 h-full w-px bg-white/5" />
        <div className="absolute right-[18%] top-0 h-full w-px bg-white/5" />
      </div>

      {/* Car */}
      <motion.div
        initial={reduced ? { x: 0, opacity: 1 } : { x: "-60%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 2.2, ease: EASE, delay: 0.1 }}
        style={{ x: reduced ? 0 : carX, scale: reduced ? 1 : carScale }}
        className="absolute inset-0 flex items-end justify-center md:items-center"
      >
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2400&q=85"
          alt="Hero supercar silhouette"
          loading="eager"
          className="h-[55%] w-auto max-w-none object-contain opacity-90 md:h-[78%]"
          style={{
            filter: "drop-shadow(0 60px 80px rgba(0,212,255,0.12)) contrast(1.05)",
          }}
        />
      </motion.div>

      {/* Top nav */}
      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-6 py-6 md:px-12">
        <div className="lux-display text-2xl tracking-[0.3em] text-white">
          AERON<span style={{ color: ACCENT }}>—</span>
        </div>
        <nav className="hidden items-center gap-10 text-xs uppercase tracking-[0.3em] text-white/60 md:flex">
          {["Models", "Technology", "Atelier", "Owners"].map((i) => (
            <a
              key={i}
              data-cursor="hover"
              href="#"
              className="transition-colors hover:text-white"
            >
              {i}
            </a>
          ))}
        </nav>
        <div
          data-cursor="hover"
          className="lux-body cursor-pointer text-xs uppercase tracking-[0.3em] text-white/80"
        >
          Configure ↗
        </div>
      </div>

      {/* Title */}
      <motion.div
        style={{ y: reduced ? 0 : titleY, opacity: reduced ? 1 : fade }}
        className="absolute bottom-[12%] left-0 right-0 z-20 px-6 md:bottom-[18%] md:px-12"
      >
        <div className="mb-4 flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-white/50 md:text-xs">
          <span className="h-px w-10 bg-white/40" />
          <span>2026 · The Aeron Collection</span>
        </div>
        <h1 className="lux-display flex flex-wrap text-[18vw] leading-[0.85] text-white md:text-[12vw]">
          {letters.map((c, i) => (
            <motion.span
              key={i}
              initial={reduced ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.4 + i * 0.04 }}
              className="inline-block"
              style={{ marginRight: c === " " ? "0.25em" : 0 }}
            >
              {c === " " ? " " : c}
            </motion.span>
          ))}
        </h1>

        <div className="mt-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <p className="lux-body max-w-md text-sm leading-relaxed text-white/60">
            Engineered in Stuttgart. Tuned at the Nürburgring. A new line of
            performance machines built for those who refuse the ordinary.
          </p>
          <div className="flex items-center gap-4">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: ACCENT, boxShadow: `0 0 12px ${ACCENT}` }}
            />
            <span className="lux-body text-xs uppercase tracking-[0.3em] text-white/50">
              Scroll to ignite
            </span>
          </div>
        </div>
      </motion.div>

      {/* Side stat */}
      <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 rotate-90 lux-body text-[10px] uppercase tracking-[0.4em] text-white/40 md:block">
        0 → 100 km/h · 2.1s
      </div>
    </section>
  );
}

/* ---------- FEATURES (counters) ---------- */

function Counter({ to, suffix = "", duration = 2, decimals = 0, reduced }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [val, setVal] = useState(reduced ? to : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    let start = null;
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    let raf;
    const step = (ts) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      setVal(to * ease(p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref}>
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

function Features({ reduced }) {
  const stats = [
    { icon: Gauge, label: "0 — 100 km/h", value: 2.1, suffix: "s", decimals: 1 },
    { icon: Zap, label: "Power Output", value: 1014, suffix: " HP", decimals: 0 },
    { icon: Wind, label: "Peak Torque", value: 1430, suffix: " Nm", decimals: 0 },
    { icon: ShieldCheck, label: "Top Speed", value: 412, suffix: " km/h", decimals: 0 },
  ];

  return (
    <section
      className="relative overflow-hidden px-6 py-32 md:px-12 md:py-48"
      style={{ background: BG }}
    >
      <div className="lux-grain" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-20 grid items-end gap-8 md:grid-cols-12">
          <div className="md:col-span-3">
            <span className="lux-body text-xs uppercase tracking-[0.4em] text-white/40">
              · 01 / Performance
            </span>
          </div>
          <h2 className="lux-display col-span-9 text-[14vw] leading-[0.9] text-white md:text-[7vw]">
            Numbers that<br />
            <span style={{ color: ACCENT }}>refuse</span> compromise.
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm bg-white/10 md:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
                className="relative p-8 md:p-12"
                style={{ background: BG }}
              >
                <Icon
                  size={20}
                  className="mb-10 text-white/40"
                  strokeWidth={1.2}
                />
                <div
                  className="lux-display text-6xl text-white md:text-7xl"
                  style={{ willChange: "contents" }}
                >
                  <Counter
                    to={s.value}
                    suffix={s.suffix}
                    decimals={s.decimals}
                    reduced={reduced}
                  />
                </div>
                <div className="lux-body mt-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
                  {s.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- MODELS (horizontal scroll + 3D tilt) ---------- */

function TiltCard({ model, index, reduced }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  const onMove = (e) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 14);
    rx.set(-py * 14);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.article
      ref={ref}
      data-cursor="hover"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX: srx,
        rotateY: sry,
        transformStyle: "preserve-3d",
        perspective: 1200,
      }}
      className="relative h-[68vh] w-[78vw] shrink-0 overflow-hidden bg-neutral-900 md:h-[72vh] md:w-[42vw]"
    >
      <motion.img
        src={model.image}
        alt={model.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: "translateZ(0)" }}
        whileHover={reduced ? undefined : { scale: 1.06 }}
        transition={{ duration: 1.2, ease: EASE }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      <div
        className="absolute left-6 top-6 lux-body text-[10px] uppercase tracking-[0.3em] text-white/70"
        style={{ transform: "translateZ(40px)" }}
      >
        0{index + 1} · {model.tag}
      </div>
      <div
        className="absolute bottom-6 left-6 right-6 flex items-end justify-between"
        style={{ transform: "translateZ(60px)" }}
      >
        <div>
          <h3 className="lux-display text-5xl leading-none text-white md:text-6xl">
            {model.name}
          </h3>
          <div className="lux-body mt-2 text-xs uppercase tracking-[0.3em] text-white/60">
            {model.power}
          </div>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <ArrowUpRight size={18} strokeWidth={1.5} />
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0 border"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      />
    </motion.article>
  );
}

function Models({ reduced }) {
  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-62%"]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ background: BG, height: reduced ? "auto" : "260vh" }}
    >
      <div
        className={
          reduced
            ? "relative px-6 py-24 md:px-12"
            : "sticky top-0 flex h-screen flex-col justify-center overflow-hidden"
        }
      >
        <div className="px-6 pb-10 md:px-12">
          <div className="grid items-end gap-6 md:grid-cols-12">
            <span className="lux-body text-xs uppercase tracking-[0.4em] text-white/40 md:col-span-3">
              · 02 / The Lineup
            </span>
            <h2 className="lux-display col-span-9 text-[12vw] leading-[0.9] text-white md:text-[6vw]">
              Five machines.<br />
              <span style={{ color: ACCENT }}>One philosophy.</span>
            </h2>
          </div>
        </div>

        {reduced ? (
          <div className="grid gap-6 px-6 md:grid-cols-2 md:px-12">
            {MODELS.map((m, i) => (
              <TiltCard key={m.name} model={m} index={i} reduced />
            ))}
          </div>
        ) : (
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="flex gap-6 px-6 md:gap-10 md:px-12"
          >
            {MODELS.map((m, i) => (
              <TiltCard key={m.name} model={m} index={i} reduced={reduced} />
            ))}
            <div className="shrink-0 pr-12" />
          </motion.div>
        )}

        <div className="mt-8 flex items-center justify-between px-6 md:px-12">
          <span className="lux-body text-[10px] uppercase tracking-[0.4em] text-white/40">
            ← drag · scroll · explore →
          </span>
          <div className="hidden gap-2 md:flex">
            {MODELS.map((_, i) => (
              <span key={i} className="h-px w-10 bg-white/20" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- TECHNOLOGY (sticky scroll) ---------- */

function Technology({ reduced }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const total = TECH_PANELS.length;
  const [active, setActive] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      const idx = Math.min(total - 1, Math.floor(v * total));
      setActive(idx);
    });
  }, [scrollYProgress, total]);

  return (
    <section
      ref={ref}
      className="relative"
      style={{ background: BG, height: `${total * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="grid h-full w-full grid-cols-1 items-center md:grid-cols-2">
          {/* Sticky visual */}
          <div className="relative hidden h-full md:block">
            <AnimatePresence mode="sync">
              <motion.img
                key={TECH_PANELS[active].visual}
                src={TECH_PANELS[active].visual}
                alt=""
                loading="lazy"
                initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.0 }}
                transition={{ duration: 1.2, ease: EASE }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(10,10,10,0) 60%, rgba(10,10,10,1) 100%)",
              }}
            />
            <div className="absolute bottom-10 left-10 lux-body text-[10px] uppercase tracking-[0.4em] text-white/50">
              {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </div>
          </div>

          {/* Right text column */}
          <div className="relative flex h-full items-center px-6 md:px-16">
            <div className="w-full">
              <span className="lux-body mb-8 block text-xs uppercase tracking-[0.4em] text-white/40">
                · 03 / Technology
              </span>
              <div className="relative h-[55vh]">
                {TECH_PANELS.map((p, i) => {
                  const Icon = p.icon;
                  const visible = i === active;
                  return (
                    <motion.div
                      key={p.title}
                      initial={false}
                      animate={{
                        opacity: visible ? 1 : 0,
                        y: visible ? 0 : 20,
                        pointerEvents: visible ? "auto" : "none",
                      }}
                      transition={{ duration: 0.8, ease: EASE }}
                      className="absolute inset-0"
                    >
                      <div
                        className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border"
                        style={{
                          borderColor: ACCENT,
                          color: ACCENT,
                          boxShadow: `0 0 30px ${ACCENT}22`,
                        }}
                      >
                        <Icon size={20} strokeWidth={1.4} />
                      </div>
                      <h3 className="lux-display text-5xl leading-[0.95] text-white md:text-7xl">
                        {p.title}
                      </h3>
                      <p className="lux-body mt-6 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
                        {p.body}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-10 flex gap-3">
                {TECH_PANELS.map((_, i) => (
                  <div
                    key={i}
                    className="h-px w-12 transition-colors duration-500"
                    style={{
                      background:
                        i === active ? ACCENT : "rgba(255,255,255,0.15)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA (magnetic button) ---------- */

function MagneticButton({ children, reduced }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });

  const onMove = (e) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      data-cursor="hover"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      className="group relative inline-flex items-center gap-4 rounded-full px-10 py-6 text-black"
    >
      <span
        className="absolute inset-0 rounded-full transition-transform duration-700"
        style={{
          background: ACCENT,
          boxShadow: `0 0 80px ${ACCENT}55, inset 0 0 0 1px rgba(255,255,255,0.4)`,
        }}
      />
      <span className="lux-display relative z-10 text-2xl tracking-wider">
        {children}
      </span>
      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10">
        <ChevronRight size={18} />
      </span>
    </motion.button>
  );
}

function CTA({ reduced }) {
  return (
    <section
      className="relative overflow-hidden px-6 py-40 md:px-12 md:py-56"
      style={{ background: BG }}
    >
      <div className="lux-grain" />
      <div
        className="absolute left-1/2 top-1/2 -z-0 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, ${ACCENT}55 0%, transparent 60%)`,
        }}
      />
      <div className="relative mx-auto max-w-5xl text-center">
        <span className="lux-body block text-xs uppercase tracking-[0.4em] text-white/40">
          · 04 / Reservation
        </span>
        <h2 className="lux-display mt-8 text-[14vw] leading-[0.9] text-white md:text-[8vw]">
          Take the<br />
          wheel.
        </h2>
        <p className="lux-body mx-auto mt-8 max-w-lg text-sm leading-relaxed text-white/60 md:text-base">
          Reserve a private test drive at one of twelve global ateliers.
          Limited windows. By appointment only.
        </p>
        <div className="mt-14 flex flex-col items-center justify-center gap-8 md:flex-row md:gap-12">
          <MagneticButton reduced={reduced}>Book Test Drive</MagneticButton>
          <a
            data-cursor="hover"
            className="lux-body inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/70 hover:text-white"
            href="#"
          >
            <Sparkles size={14} />
            Configure your build
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- FOOTER ---------- */

function Footer() {
  return (
    <footer
      className="relative overflow-hidden px-6 pb-10 pt-28 md:px-12"
      style={{ background: BG }}
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="grid gap-12 border-t border-white/10 pt-16 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="lux-display text-[24vw] leading-[0.85] text-white md:text-[14vw]">
              AERON<span style={{ color: ACCENT }}>.</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="lux-body mb-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
              Models
            </div>
            <ul className="lux-body space-y-2 text-sm text-white/70">
              {MODELS.slice(0, 4).map((m) => (
                <li key={m.name} data-cursor="hover" className="cursor-pointer hover:text-white">
                  {m.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <div className="lux-body mb-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
              Brand
            </div>
            <ul className="lux-body space-y-2 text-sm text-white/70">
              {["Heritage", "Atelier", "Motorsport", "Press"].map((i) => (
                <li key={i} data-cursor="hover" className="cursor-pointer hover:text-white">
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <div className="lux-body mb-4 text-[10px] uppercase tracking-[0.3em] text-white/40">
              Contact
            </div>
            <ul className="lux-body space-y-2 text-sm text-white/70">
              <li>Stuttgart · DE</li>
              <li>Modena · IT</li>
              <li>Tokyo · JP</li>
              <li>Dubai · AE</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center">
          <span className="lux-body text-[10px] uppercase tracking-[0.4em] text-white/40">
            © 2026 Aeron Automobili. All rights reserved.
          </span>
          <span className="lux-body text-[10px] uppercase tracking-[0.4em] text-white/40">
            Built for the relentless.
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- ROOT ---------- */

export default function LuxuryCarLanding() {
  useInjectGlobals();
  const reduced = useReducedMotion();
  const { sx, sy, hovering } = useCustomCursor(reduced);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.4,
  });

  return (
    <div
      className="lux-body relative min-h-screen w-full overflow-x-hidden text-white"
      style={{ background: BG, cursor: reduced ? "auto" : "none" }}
    >
      {/* Scroll progress */}
      <motion.div
        className="fixed left-0 top-0 z-[60] h-px origin-left"
        style={{ background: ACCENT, scaleX: progress, width: "100%" }}
      />

      {/* Custom cursor */}
      {!reduced && (
        <motion.div
          className="lux-cursor pointer-events-none fixed left-0 top-0 z-[70] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"
          style={{
            x: sx,
            y: sy,
            scale: hovering ? 6 : 1,
            transition: "scale 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      )}

      <Hero reduced={reduced} />
      <Features reduced={reduced} />
      <Models reduced={reduced} />
      <Technology reduced={reduced} />
      <CTA reduced={reduced} />
      <Footer />
    </div>
  );
}
