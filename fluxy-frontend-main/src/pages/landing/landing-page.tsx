import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  Zap,
  BarChart3,
  DollarSign,
  Shield,
  Search,
  Target,
  PenTool,
  Calendar,
  MessageSquare,
  Palette,
  Film,
  CheckCircle2,
  Check,
  Star,
  Crown,
} from "lucide-react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import logoUrl from "@/assets/fluxyVector.png";
import pixelImg from "@/assets/Agent-HeroIcon/pixel.webp";
import mayaImg from "@/assets/Agent-HeroIcon/Maya.webp";
import echoImg from "@/assets/Agent-HeroIcon/Echo.webp";
import kaiImg from "@/assets/Agent-HeroIcon/Kai.webp";
import atlasImg from "@/assets/Agent-HeroIcon/Atlas.webp";
import codyImg from "@/assets/Agent-HeroIcon/Cody.webp";
import lunaImg from "@/assets/Agent-HeroIcon/Luna.webp";
import novaImg from "@/assets/Agent-HeroIcon/nova.webp";

type AccentColor = "violet" | "blue" | "amber" | "teal" | "emerald" | "orange";

const colorStyles: Record<
  AccentColor,
  {
    role: string;
    check: string;
    tagBg: string;
    tagText: string;
    avatarBg: string;
    button: string;
  }
> = {
  violet: {
    role: "text-violet-600",
    check: "text-violet-500",
    tagBg: "bg-violet-100",
    tagText: "text-violet-700",
    avatarBg: "bg-violet-600",
    button: "bg-violet-600 hover:bg-violet-500",
  },
  blue: {
    role: "text-blue-600",
    check: "text-blue-500",
    tagBg: "bg-blue-100",
    tagText: "text-blue-700",
    avatarBg: "bg-blue-600",
    button: "bg-linear-to-r from-blue-500 to-violet-600 hover:opacity-90",
  },
  amber: {
    role: "text-amber-600",
    check: "text-amber-500",
    tagBg: "bg-amber-100",
    tagText: "text-amber-700",
    avatarBg: "bg-amber-500",
    button: "bg-linear-to-r from-amber-400 to-orange-500 hover:opacity-90",
  },
  teal: {
    role: "text-teal-600",
    check: "text-teal-500",
    tagBg: "bg-teal-100",
    tagText: "text-teal-700",
    avatarBg: "bg-teal-500",
    button: "bg-teal-500 hover:bg-teal-400",
  },
  emerald: {
    role: "text-emerald-600",
    check: "text-emerald-500",
    tagBg: "bg-emerald-100",
    tagText: "text-emerald-700",
    avatarBg: "bg-emerald-500",
    button: "bg-emerald-500 hover:bg-emerald-400",
  },
  orange: {
    role: "text-orange-600",
    check: "text-orange-500",
    tagBg: "bg-orange-100",
    tagText: "text-orange-700",
    avatarBg: "bg-orange-500",
    button: "bg-linear-to-r from-orange-500 to-amber-400 hover:opacity-90",
  },
};

const employees: {
  name: string;
  role: string;
  desc: string;
  img: string;
  icon: typeof Search;
  color: AccentColor;
  responsibilities: string[];
  fitFor: string[];
}[] = [
  {
    name: "Luna",
    role: "Lead Generation Specialist",
    desc: "Luna bertugas menemukan calon pelanggan yang relevan untuk bisnis Anda.",
    img: lunaImg,
    icon: Search,
    color: "violet",
    responsibilities: [
      "Mencari leads potensial",
      "Mengumpulkan data bisnis",
      "Prospect research",
      "Lead qualification",
      "CRM data enrichment",
    ],
    fitFor: ["B2B Sales", "Agency", "SaaS", "Property", "Consultant"],
  },
  {
    name: "Nova",
    role: "Copywriting Specialist",
    desc: "Nova menciptakan copy yang menarik perhatian dan menghasilkan aksi.",
    img: novaImg,
    icon: PenTool,
    color: "violet",
    responsibilities: [
      "Caption social media",
      "Sales copy",
      "Landing page copy",
      "Email marketing",
      "Product description",
    ],
    fitFor: ["Branding", "Advertising", "Sales Campaign"],
  },
  {
    name: "Pixel",
    role: "Desainer Kreatif",
    desc: "Pixel mengubah ide menjadi visual dan membuat konten yang menarik dan profesional.",
    img: pixelImg,
    icon: Palette,
    color: "blue",
    responsibilities: [
      "Membuat Konten Visual",
      "Desain Sosial Media",
      "Materi Iklan (Ad Creatives)",
      "Desain Banner",
      "Pembuatan Aset Kampanye",
    ],
    fitFor: ["Instagram", "Facebook", "TikTok Content"],
  },
  {
    name: "Maya",
    role: "Manajer & Publisher Media Sosial",
    desc: "Maya merencanakan konten, mengelola strategi, dan mempublikasikan aktivitas social media Anda.",
    img: mayaImg,
    icon: Calendar,
    color: "blue",
    responsibilities: [
      "Merencanakan Konten",
      "Menyusun Kalender Konten",
      "Penjadwalan Posting",
      "Publikasi Lintas Platform",
      "Strategi Hashtag",
    ],
    fitFor: ["Brands", "SMEs", "Personal Branding"],
  },
  {
    name: "Echo",
    role: "Analis Media Sosial",
    desc: "Echo menganalisis performa konten dan memberikan wawasan untuk pertumbuhan media sosial Anda.",
    img: echoImg,
    icon: BarChart3,
    color: "amber",
    responsibilities: [
      "Menganalisis Konten",
      "Laporan Performa Media Sosial",
      "Analisis Kampanye",
      "Pemantauan Kompetitor",
      "Rekomendasi Pertumbuhan",
    ],
    fitFor: ["Instagram", "Facebook", "LinkedIn", "TikTok", "X"],
  },
  {
    name: "Kai",
    role: "Chatbot Sales & Layanan WhatsApp",
    desc: "Kai melakukan follow-up dan membantu mengubah leads menjadi pelanggan.",
    img: kaiImg,
    icon: MessageSquare,
    color: "teal",
    responsibilities: [
      "Lead nurturing",
      "WhatsApp follow-up",
      "Email outreach",
      "Appointment booking",
      "Lead qualification",
    ],
    fitFor: ["Sales Teams", "Agencies", "Service Businesses"],
  },
  {
    name: "Atlas",
    role: "Marketing Analyst",
    desc: "Atlas menganalisis data dan memberikan rekomendasi untuk pertumbuhan bisnis.",
    img: atlasImg,
    icon: Target,
    color: "emerald",
    responsibilities: [
      "Marketing reports",
      "Campaign analysis",
      "Competitor monitoring",
      "KPI tracking",
      "Growth recommendations",
    ],
    fitFor: ["Business Owners", "Marketing Teams"],
  },
  {
    name: "Motion",
    role: "Content Production Specialist",
    desc: "Motion menghasilkan ide dan aset untuk kebutuhan konten harian.",
    img: codyImg,
    icon: Film,
    color: "orange",
    responsibilities: [
      "Content ideas",
      "Video scripting",
      "Reel concepts",
      "Storytelling",
      "Trend adaptation",
    ],
    fitFor: ["Content Creators", "Brands", "Agencies"],
  },
];

const byName = (name: string) => employees.find((e) => e.name === name)!;

// Hero lineup order matches the reference site
const heroLineup = [
  byName("Atlas"),
  byName("Motion"),
  byName("Echo"),
  byName("Kai"),
  byName("Luna"),
  byName("Maya"),
  byName("Nova"),
  byName("Pixel"),
];

const checklist = [
  "Tidak perlu merekrut banyak staf.",
  "Tidak perlu training berbulan-bulan.",
  "Cukup pilih AI Employee yang Anda butuhkan dan bangun tim digital marketing yang bekerja 24/7.",
];

const teams: {
  name: string;
  icon: typeof Star;
  iconColor: string;
  subtitle: string;
  desc: string;
  members: string[];
  featured?: boolean;
  button: string;
}[] = [
  {
    name: "Starter Team",
    icon: Star,
    iconColor: "text-violet-600",
    subtitle: "Cocok untuk Usaha Kecil",
    desc: "Desain visual kreatif, kelola strategi medsos, dan publikasi konten otomatis.",
    members: ["Pixel", "Maya", "Echo"],
    button: "bg-zinc-900 text-white hover:bg-zinc-800",
  },
  {
    name: "Growth Team",
    icon: Zap,
    iconColor: "text-blue-600",
    subtitle: "Cocok untuk Brand yang Bertumbuh",
    desc: "A complete AI marketing department.",
    members: ["Luna", "Nova", "Pixel", "Maya", "Echo"],
    featured: true,
    button:
      "bg-linear-to-r from-blue-500 to-violet-600 text-white hover:opacity-90",
  },
  {
    name: "Scale Team",
    icon: Crown,
    iconColor: "text-amber-500",
    subtitle: "Cocok untuk Agency & Enterprise",
    desc: "Your full-stack AI workforce.",
    members: [
      "Luna",
      "Nova",
      "Pixel",
      "Maya",
      "Echo",
      "Kai",
      "Atlas",
      "Motion",
    ],
    button: "bg-zinc-900 text-white hover:bg-zinc-800",
  },
];

const features = [
  {
    icon: Clock,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Bekerja 24/7",
    desc: "AI Employees bekerja tanpa henti, siap kapan saja menangani tugas marketing Anda.",
  },
  {
    icon: Zap,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    title: "Scale Instantly",
    desc: "Tambahkan karyawan baru dalam hitungan menit tanpa proses rekrutmen yang panjang.",
  },
  {
    icon: DollarSign,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Hemat Biaya",
    desc: "Bangun tim lengkap tanpa biaya rekrutmen tradisional, asuransi, atau operasional kantor.",
  },
  {
    icon: BarChart3,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    title: "Produktivitas Meningkat",
    desc: "Tangani lebih banyak kampanye dengan sumber daya lebih sedikit dan lebih efisien.",
  },
  {
    icon: Shield,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    title: "Eksekusi Konsisten",
    desc: "Setiap tugas dijalankan mengikuti workflow yang terbukti dan bebas dari human error.",
  },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-white font-sans">
      {/* ═══════════════════════════════════
          NAVBAR
          ═══════════════════════════════════ */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          <div className="flex items-center gap-2.5">
            <img
              src={logoUrl}
              alt="Fluxy"
              className="h-7 w-7 object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-white">
              Fluxy.id
            </span>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#ai-employees"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              AI Employees
            </a>
            <a
              href="#bangun-tim"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Bangun Tim
            </a>
            <a
              href="#keunggulan"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              Keunggulan
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-violet-500 active:scale-95"
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════
          HERO
          ═══════════════════════════════════ */}
      <section
        className="relative overflow-hidden px-6 pb-40 pt-16 sm:px-10 lg:px-16"
        style={{
          background:
            "radial-gradient(ellipse at 75% 15%, rgba(124,58,237,0.20) 0%, transparent 50%), linear-gradient(180deg, #0a0a14 0%, #101020 55%, #16162a 100%)",
        }}
      >
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            {/* Left */}
            <div>
              <h1 className="text-4xl font-bold tracking-[-0.03em] leading-[1.1] sm:text-5xl lg:text-6xl">
                <span className="text-white">Temui Karyawan AI</span>
                <br />
                <span className="bg-linear-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
                  Baru untuk Bisnis Anda
                </span>
              </h1>
              <p className="mt-5 text-lg font-semibold text-white">
                Bangun Tim Digital Anda dalam Hitungan Menit
              </p>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-400">
                Fluxy.id menghadirkan AI Employees yang dirancang khusus untuk
                membantu bisnis berkembang lebih cepat melalui Social Media,
                Content Marketing, Lead Generation, dan Sales Automation.
              </p>

              <ul className="mt-6 space-y-2.5">
                {checklist.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                    <span className="text-sm text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-sm font-medium text-blue-400">
                Your AI-Powered Workforce Starts Here.
              </p>

              <div className="mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-violet-600 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition-all hover:scale-105 active:scale-95"
                >
                  <span>🚀</span> Bangun Tim AI Saya
                </Link>
              </div>
            </div>

            {/* Right — full lineup */}
            <div className="hidden justify-center lg:flex">
              <div className="flex items-end justify-center gap-1">
                {heroLineup.map((emp) => (
                  <div key={emp.name} className="flex flex-col items-center">
                    <img
                      src={emp.img}
                      alt={emp.name}
                      className="h-64 w-auto object-contain xl:h-80"
                    />
                    <span className="-mt-12 rounded-full bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur xl:-mt-16">
                      {emp.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile lineup */}
          <div className="mt-10 flex justify-center gap-1 overflow-x-auto lg:hidden">
            {heroLineup.map((emp) => (
              <div
                key={emp.name}
                className="flex shrink-0 flex-col items-center"
              >
                <img
                  src={emp.img}
                  alt={emp.name}
                  className="h-32 w-auto object-contain"
                />
                <span className="-mt-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white">
                  {emp.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fade to white at the bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-white" />
      </section>

      {/* ═══════════════════════════════════
          AI EMPLOYEES SHOWCASE
          ═══════════════════════════════════ */}
      <section id="ai-employees" className="relative px-6 pb-20 pt-4 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-zinc-900 sm:text-5xl">
              Karyawan{" "}
              <span className="bg-linear-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent">
                AI Kami
              </span>
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-linear-to-r from-blue-500 to-violet-600" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {employees.map((emp) => {
              const Icon = emp.icon;
              const c = colorStyles[emp.color];
              return (
                <div
                  key={emp.name}
                  className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mx-auto">
                    <AgentAvatar img={emp.img} name={emp.name} bgClassName={c.avatarBg} />
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-zinc-900">
                    {emp.name}
                  </h3>
                  <div className={`mt-0.5 flex items-center justify-center gap-1.5 ${c.role}`}>
                    <Icon className="h-3.5 w-3.5" />
                    <p className="text-sm font-semibold">{emp.role}</p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                    {emp.desc}
                  </p>

                  <div className="mt-5 text-left">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      Tanggung Jawab
                    </span>
                    <ul className="mt-2 space-y-1.5">
                      {emp.responsibilities.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-sm text-zinc-600"
                        >
                          <Check className={`h-3.5 w-3.5 shrink-0 ${c.check}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 flex-1 text-left">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      Cocok Untuk
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {emp.fitFor.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${c.tagBg} ${c.tagText}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    to="/register"
                    className={`mt-6 inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 ${c.button}`}
                  >
                    Hire {emp.name}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          BANGUN TIM ANDA + WHY FLUXY
          ═══════════════════════════════════ */}
      <section
        id="bangun-tim"
        className="px-6 py-24 sm:px-10 lg:px-16"
        style={{ background: "#F4F4F5" }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Bangun Tim Anda */}
          <div className="text-center">
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-zinc-900 sm:text-5xl">
              Bangun{" "}
              <span className="bg-linear-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">
                Tim Anda
              </span>
            </h2>
            <p className="mt-4 mx-auto max-w-lg text-base text-zinc-500">
              Pilih paket tim yang sesuai dengan skala bisnis Anda. Mulai dari
              yang kecil hingga skala enterprise.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {teams.map((team) => {
              const Icon = team.icon;
              return (
                <div
                  key={team.name}
                  className={`flex flex-col rounded-2xl border p-8 ${
                    team.featured
                      ? "border-violet-300 bg-linear-to-b from-blue-50 to-violet-50 shadow-xl lg:-translate-y-2"
                      : "border-zinc-200 bg-white shadow-sm"
                  }`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Icon className={`h-5 w-5 ${team.iconColor}`} />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-zinc-900">
                    {team.name}
                  </h3>
                  <p className="text-sm text-zinc-500">{team.subtitle}</p>
                  <p className="mt-4 text-sm text-zinc-600">{team.desc}</p>

                  <div className="mt-6">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                      Anggota Tim
                    </span>
                    <div className="mt-3 flex flex-wrap gap-4">
                      {team.members.map((name) => {
                        const emp = byName(name);
                        return (
                          <div
                            key={name}
                            className="flex flex-col items-center gap-1.5"
                          >
                            <AgentAvatar
                              img={emp.img}
                              name={emp.name}
                              bgClassName={colorStyles[emp.color].avatarBg}
                              size="h-12 w-12"
                            />
                            <span className="text-xs text-zinc-600">
                              {emp.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 flex-1 border-t border-zinc-200/70" />

                  <Link
                    to="/register"
                    className={`mt-6 inline-flex items-center justify-center rounded-full py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 ${team.button}`}
                  >
                    Pilih {team.name}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Why Fluxy */}
          <div id="keunggulan" className="mt-28 text-center">
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-zinc-900 sm:text-5xl">
              Mengapa Bisnis Memilih{" "}
              <span className="bg-linear-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">
                Fluxy.id
              </span>
            </h2>
            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-linear-to-r from-violet-600 to-blue-500" />

            <div className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${feat.iconBg}`}
                    >
                      <Icon className={`h-5 w-5 ${feat.iconColor}`} />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-zinc-900">
                      {feat.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                      {feat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════ */}
      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div
          className="relative mx-auto max-w-7xl overflow-hidden rounded-4xl px-8 py-14 sm:px-14"
          style={{
            background:
              "radial-gradient(ellipse at 15% 40%, rgba(255,255,255,0.15) 0%, transparent 45%), linear-gradient(120deg, #6d28d9, #7c3aed 45%, #4c1d95)",
          }}
        >
          <div className="relative flex flex-col items-center gap-10 lg:flex-row">
            <div className="relative hidden shrink-0 lg:block">
              <div className="absolute inset-0 -m-6 rounded-full border border-white/20" />
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10 shadow-[0_0_60px_rgba(255,255,255,0.25)]">
                <img
                  src={logoUrl}
                  alt="Fluxy"
                  className="h-14 w-14 object-contain"
                />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-[-0.02em] leading-[1.15] text-white sm:text-4xl">
                Mulai Bangun Workforce AI Anda Hari Ini
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-violet-100">
                Hire satu AI Employee atau bangun seluruh departemen
                AI-powered Anda. Fluxy.id Your Digital Team. Powered by AI.
              </p>
              <Link
                to="/register"
                className="group mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-violet-700 transition-all hover:scale-105 active:scale-95"
              >
                Hire AI Employee Anda
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          FOOTER
          ═══════════════════════════════════ */}
      <footer className="bg-[#0a0a12] px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5">
                <img
                  src={logoUrl}
                  alt="Fluxy"
                  className="h-6 w-6 object-contain"
                />
                <span className="text-sm font-bold text-white">
                  Fluxy.id
                </span>
              </div>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/40">
                Platform penyedia AI Employees untuk membantu bisnis Anda
                berkembang lebih cepat melalui otomatisasi marketing dan sales.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                Product
              </h4>
              <ul className="space-y-2">
                {["AI Employees", "Pricing", "Features"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-xs text-white/50 transition-colors hover:text-white"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                Resources
              </h4>
              <ul className="space-y-2">
                {["Blog", "Documentation", "FAQ"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-xs text-white/50 transition-colors hover:text-white"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                Company
              </h4>
              <ul className="space-y-2">
                {["About", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-xs text-white/50 transition-colors hover:text-white"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
              <h4 className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                Social Media
              </h4>
              <div className="flex items-center gap-3">
                {["Instagram", "LinkedIn", "X"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="text-xs text-white/50 transition-colors hover:text-white"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} Fluxy.id. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
