import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Award,
  BadgeCheck,
  Bell,
  Bike,
  Bot,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  CloudSun,
  Flame,
  Globe2,
  Heart,
  Home as HomeIcon,
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Navigation,
  PackageCheck,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  Target,
  Truck,
  Trophy,
  UserRound,
  Users,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type Role = "donor" | "ngo" | "volunteer" | "admin";
type Status = "Available" | "Claimed" | "Pickup Scheduled" | "Picked Up" | "Delivered" | "Cancelled";
type Tab = "overview" | "donations" | "impact" | "notifications";

type Donation = {
  id: string;
  food: string;
  donor: string;
  donorShort: string;
  meals: number;
  type: string;
  address: string;
  distance: number;
  deadlineMinutes: number;
  status: Status;
  claimedBy?: string;
  volunteer?: string;
  color: string;
  emoji: string;
  description: string;
  createdAt: string;
};

const initialDonations: Donation[] = [
  {
    id: "FR-2048",
    food: "Garden lunch bowls",
    donor: "Green Leaf Restaurant",
    donorShort: "Green Leaf",
    meals: 35,
    type: "Vegetarian",
    address: "14 Market Street",
    distance: 2.4,
    deadlineMinutes: 138,
    status: "Available",
    color: "#dff5e7",
    emoji: "🥗",
    description: "Fresh grain bowls, roasted vegetables and lentil salad, packed separately.",
    createdAt: "12 min ago",
  },
  {
    id: "FR-2047",
    food: "Assorted bakery box",
    donor: "City Bakery",
    donorShort: "City Bakery",
    meals: 20,
    type: "Bakery",
    address: "88 Station Road",
    distance: 1.8,
    deadlineMinutes: 45,
    status: "Available",
    color: "#fff0d7",
    emoji: "🥐",
    description: "Day-end breads, muffins and fruit pastries. Best enjoyed today.",
    createdAt: "18 min ago",
  },
  {
    id: "FR-2046",
    food: "Event dinner trays",
    donor: "Sunrise Events",
    donorShort: "Sunrise Events",
    meals: 80,
    type: "Vegetarian",
    address: "6 Riverside Avenue",
    distance: 4.1,
    deadlineMinutes: 205,
    status: "Claimed",
    claimedBy: "Hope Kitchen NGO",
    color: "#e8e2ff",
    emoji: "🍛",
    description: "Rice, dal, seasonal vegetables and salad from a cancelled conference dinner.",
    createdAt: "32 min ago",
  },
  {
    id: "FR-2045",
    food: "Fruit & yogurt cups",
    donor: "Harvest Hotel",
    donorShort: "Harvest Hotel",
    meals: 42,
    type: "Fresh",
    address: "21 Greenway Lane",
    distance: 3.2,
    deadlineMinutes: 72,
    status: "Pickup Scheduled",
    claimedBy: "Share & Care Trust",
    volunteer: "Aarav Mehta",
    color: "#dff4f7",
    emoji: "🍓",
    description: "Chilled fruit cups and yogurt portions, stored in the hotel cold room.",
    createdAt: "46 min ago",
  },
  {
    id: "FR-2044",
    food: "Community pasta trays",
    donor: "Casa Verde Cafe",
    donorShort: "Casa Verde",
    meals: 28,
    type: "Vegetarian",
    address: "3 University Walk",
    distance: 0.9,
    deadlineMinutes: 0,
    status: "Delivered",
    claimedBy: "Hope Kitchen NGO",
    volunteer: "Maya Singh",
    color: "#ffe5df",
    emoji: "🍝",
    description: "Pasta primavera and garlic bread rescued from the evening service.",
    createdAt: "Yesterday",
  },
];

const roleMeta: Record<Role, { label: string; person: string; org: string; initials: string; icon: typeof Store; accent: string }> = {
  donor: { label: "Food Donor", person: "Priya Nair", org: "Green Leaf Restaurant", initials: "PN", icon: Store, accent: "emerald" },
  ngo: { label: "NGO Partner", person: "Rohan Das", org: "Hope Kitchen NGO", initials: "RD", icon: Heart, accent: "violet" },
  volunteer: { label: "Volunteer", person: "Maya Singh", org: "Community Volunteer", initials: "MS", icon: Bike, accent: "orange" },
  admin: { label: "Platform Admin", person: "Ananya Shah", org: "Food Rescue Hub", initials: "AS", icon: ShieldCheck, accent: "slate" },
};

const navItems: { id: Tab; label: string; icon: typeof HomeIcon }[] = [
  { id: "overview", label: "Overview", icon: HomeIcon },
  { id: "donations", label: "Donations", icon: Box },
  { id: "impact", label: "Impact & rewards", icon: Trophy },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const botAnswers: Record<string, string> = {
  "How can I donate food?": "Choose the Donor role, tap “New donation”, add the meal count and pickup window, then publish. Nearby NGO partners see it instantly.",
  "How does Food Rescue Hub help SDG 2?": "We turn safe surplus into meals for people who need them. Every rescue moves us closer to Zero Hunger while cutting avoidable food waste.",
  "What happens after I list food?": "An NGO claims the listing, a verified volunteer accepts the pickup, then QR verification and delivery close the loop with impact points for everyone involved.",
  "What are the food safety basics?": "Keep food covered, label allergens, share preparation time, and respect the pickup deadline. Hot food should stay hot and chilled food should stay cold.",
};

function formatDeadline(minutes: number) {
  if (minutes <= 0) return "Completed";
  if (minutes < 60) return `${minutes} min left`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins ? `${mins}m` : ""} left`;
}

function isUrgent(donation: Donation) {
  return donation.status === "Available" && donation.deadlineMinutes > 0 && donation.deadlineMinutes <= 60;
}

function getInitials(label: string) {
  return label.split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase();
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "orange" | "violet" | "red" | "blue" }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600",
    green: "bg-emerald-100 text-emerald-700",
    orange: "bg-orange-100 text-orange-700",
    violet: "bg-violet-100 text-violet-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-sky-100 text-sky-700",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#0f6b45] text-white shadow-[0_8px_20px_rgba(15,107,69,0.2)]">
        <Leaf className="h-5 w-5" strokeWidth={2.7} />
        <span className="absolute -bottom-2 -right-1 h-5 w-5 rounded-full border-2 border-white/70 bg-[#ef8a4b]" />
      </div>
      {!compact && <div><div className="font-display text-[17px] font-extrabold leading-none tracking-tight text-[#12372a]">Food Rescue</div><div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e17e44]">Hub</div></div>}
    </div>
  );
}

function Landing({ onEnter }: { onEnter: (role: Role) => void }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfaf6] text-[#173b2c]">
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#557066] md:flex">
          <a href="#how-it-works" className="transition hover:text-[#0f6b45]">How it works</a>
          <a href="#impact" className="transition hover:text-[#0f6b45]">Our impact</a>
          <a href="#partners" className="transition hover:text-[#0f6b45]">For partners</a>
        </nav>
        <button onClick={() => onEnter("donor")} className="btn-lift rounded-full bg-[#0f6b45] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(15,107,69,0.18)] transition hover:bg-[#0a5637]">Open demo <ArrowRight className="ml-1 inline h-4 w-4" /></button>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.03fr_.97fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-16">
          <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#dff5e7] opacity-80 blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#bfe4c9] bg-white/75 px-3.5 py-2 text-xs font-bold text-[#21724e] shadow-sm"><span className="pulse-dot h-2 w-2 rounded-full bg-[#ef8a4b]" /> Live rescue network · Campus demo ready</div>
            <h1 className="font-display text-[clamp(3.6rem,8vw,6.8rem)] font-black leading-[.9] tracking-[-0.065em] text-[#12372a]">Save food.<br /><span className="text-[#e17e44]">Feed people.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#597168]">Food Rescue Hub connects surplus food with the people who need it — one verified pickup, one shared meal, one stronger community at a time.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button onClick={() => onEnter("donor")} className="btn-lift rounded-full bg-[#0f6b45] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(15,107,69,0.22)] transition hover:bg-[#0a5637]">Start a demo <ArrowRight className="ml-2 inline h-4 w-4" /></button>
              <a href="#how-it-works" className="rounded-full border border-[#d8e2db] bg-white px-6 py-3.5 text-sm font-extrabold text-[#315a4b] transition hover:border-[#a9c9b4]">See how it works</a>
            </div>
            <div className="mt-10 flex items-center gap-4 text-sm text-[#698079]"><div className="flex -space-x-2">{["PN", "RD", "MS", "AK"].map((initials, index) => <div key={initials} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#fbfaf6] text-[10px] font-extrabold text-white ${["bg-[#0f6b45]", "bg-[#e17e44]", "bg-[#7d69c4]", "bg-[#4f9b9b]"][index]}`}>{initials}</div>)}</div><span><strong className="text-[#173b2c]">240+ local heroes</strong> already making a difference</span></div>
          </div>

          <div className="relative min-h-[500px] lg:min-h-[560px]">
            <div className="absolute right-0 top-3 h-[84%] w-[86%] rounded-[48%_52%_45%_55%/48%_43%_57%_52%] bg-[#e6f4e6]" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#fff0d7] blur-2xl" />
            <div className="hero-orbit absolute right-2 top-0 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-white/85 text-[#e17e44] shadow-[0_18px_45px_rgba(31,91,61,0.13)]"><Sparkles className="h-7 w-7" /></div>
            <div className="hero-card absolute left-[10%] top-[9%] w-[68%] rotate-[-3deg] rounded-[28px] bg-white p-5 shadow-[0_28px_70px_rgba(28,75,51,0.16)]">
              <div className="flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#8fa29a]">Live rescue in progress</div><div className="mt-1 font-display text-lg font-extrabold text-[#173b2c]">Garden lunch bowls</div></div><Pill tone="green"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Available</Pill></div>
              <div className="mt-5 flex items-center gap-4 rounded-2xl bg-[#f3f8f2] p-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d9f0d7] text-4xl">🥗</div><div className="flex-1"><div className="text-sm font-extrabold text-[#245440]">35 meals rescued</div><div className="mt-1 text-xs text-[#789085]">Green Leaf Restaurant · 2.4 km away</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#d9e6dc]"><div className="h-full w-[72%] rounded-full bg-[#0f6b45]" /></div></div></div>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#698079]"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> Pickup within 2h 18m</span><span className="flex items-center gap-1 text-[#0f6b45]"><Navigation className="h-3.5 w-3.5" /> 3 rescuers nearby</span></div>
            </div>
            <div className="absolute bottom-[9%] right-[2%] w-[52%] rounded-[24px] border border-white bg-[#173b2c] p-5 text-white shadow-[0_28px_70px_rgba(28,75,51,0.22)]">
              <div className="flex items-center justify-between text-xs text-[#a9cbb6]"><span className="flex items-center gap-2"><span className="pulse-dot h-2 w-2 rounded-full bg-[#ef8a4b]" /> Impact this month</span><MoreHorizontal className="h-4 w-4" /></div>
              <div className="mt-5 flex items-end justify-between"><div><div className="font-display text-4xl font-black">4,826</div><div className="mt-1 text-xs text-[#a9cbb6]">meals kept in the community</div></div><div className="rounded-xl bg-white/10 p-2.5"><Activity className="h-5 w-5 text-[#f2a46c]" /></div></div>
              <div className="mt-5 flex items-end gap-1.5"><div className="h-8 w-3 rounded-t bg-[#6fbc8e]/50" /><div className="h-12 w-3 rounded-t bg-[#6fbc8e]/70" /><div className="h-9 w-3 rounded-t bg-[#6fbc8e]/50" /><div className="h-16 w-3 rounded-t bg-[#9de0b6]" /><div className="h-14 w-3 rounded-t bg-[#6fbc8e]/80" /><div className="h-20 w-3 rounded-t bg-[#f2a46c]" /><div className="h-24 w-3 rounded-t bg-[#9de0b6]" /><span className="ml-2 pb-0.5 text-[10px] text-[#a9cbb6]">+28% vs last month</span></div>
            </div>
            <div className="absolute bottom-[3%] left-[7%] flex items-center gap-3 rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-[0_18px_40px_rgba(28,75,51,0.14)]"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ffecdb] text-[#e17e44]"><Heart className="h-4 w-4 fill-current" /></div><div><div className="text-xs font-extrabold text-[#315a4b]">Community hero</div><div className="text-[10px] text-[#7f958b]">+120 rescue points earned</div></div></div>
          </div>
        </section>

        <section className="border-y border-[#e6eee7] bg-white/75" id="impact"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-7 px-5 py-9 sm:grid-cols-4 lg:px-8"><Stat value="12.8k" label="Meals rescued" icon={<Utensils className="h-4 w-4" />} /><Stat value="1,284" label="Donations completed" icon={<CheckCircle2 className="h-4 w-4" />} /><Stat value="86" label="NGOs connected" icon={<Users className="h-4 w-4" />} /><Stat value="3.4t" label="Food waste prevented" icon={<Leaf className="h-4 w-4" />} /></div></section>

        <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8" id="how-it-works"><div className="max-w-2xl"><p className="eyebrow">The rescue loop</p><h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[#173b2c] md:text-5xl">A simple idea, <span className="text-[#e17e44]">beautifully connected.</span></h2><p className="mt-5 max-w-xl text-base leading-7 text-[#6d8379]">Our platform gives every surplus meal a clear next step — from a donor’s kitchen to a nearby community table.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3"><Step number="01" icon={<Store />} title="Donor lists surplus" body="Share what you have, how many meals it serves, and when a partner can collect it." color="green" /><Step number="02" icon={<Heart />} title="NGO claims it" body="Smart matching surfaces the best-fit donation to verified local organizations." color="orange" /><Step number="03" icon={<Bike />} title="Volunteer delivers" body="A trusted volunteer collects, scans the QR, and closes the loop with a delivery." color="violet" /></div></section>

        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8" id="partners"><div className="overflow-hidden rounded-[32px] bg-[#173b2c] px-6 py-8 text-white md:px-10 md:py-11"><div className="grid gap-9 lg:grid-cols-[.85fr_1.15fr] lg:items-center"><div><p className="eyebrow text-[#8fd1a7]">For every kind of hero</p><h2 className="mt-3 font-display text-4xl font-black tracking-tight">Your surplus has a <span className="text-[#f2a46c]">next chapter.</span></h2><p className="mt-4 max-w-md text-sm leading-7 text-[#b0cdbb]">Whether you donate, coordinate, or deliver, Food Rescue Hub turns a good intention into a visible, measurable outcome.</p><button onClick={() => onEnter("ngo")} className="mt-7 rounded-full bg-[#f2a46c] px-5 py-3 text-sm font-extrabold text-[#173b2c] transition hover:bg-[#ffc08d]">Explore the live workspace <ArrowRight className="ml-1 inline h-4 w-4" /></button></div><div className="grid gap-3 sm:grid-cols-3"><MiniImpact icon={<Target />} title="Zero Hunger" body="SDG 2 in action" /><MiniImpact icon={<CloudSun />} title="Lower footprint" body="Less waste, less methane" /><MiniImpact icon={<BadgeCheck />} title="Verified trust" body="Every handoff tracked" /></div></div></div></section>

        <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8"><div className="flex items-end justify-between"><div><p className="eyebrow">Freshly rescued</p><h2 className="mt-3 font-display text-3xl font-black text-[#173b2c]">Featured donations</h2></div><button onClick={() => onEnter("ngo")} className="hidden text-sm font-extrabold text-[#0f6b45] sm:block">Browse all <ArrowRight className="ml-1 inline h-4 w-4" /></button></div><div className="mt-8 grid gap-4 md:grid-cols-3">{initialDonations.slice(0, 3).map((donation) => <FeaturedCard key={donation.id} donation={donation} />)}</div></section>

        <section className="border-t border-[#e6eee7] bg-[#f4f8f1] px-5 py-20"><div className="mx-auto max-w-5xl text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d9f0d7] text-[#0f6b45]"><Globe2 className="h-7 w-7" /></div><h2 className="mt-6 font-display text-3xl font-black tracking-tight text-[#173b2c] md:text-4xl">Built for SDG 2. Powered by community.</h2><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#6d8379]">Every successful rescue contributes toward reducing food insecurity and food waste. That is how small handoffs become a movement.</p><div className="mt-9 grid gap-4 text-left sm:grid-cols-3"><Quote text="It turns the end of service into a beginning for someone else." author="Priya Nair · Green Leaf Restaurant" /><Quote text="The matching is clear, fast and respectful of our team’s time." author="Rohan Das · Hope Kitchen NGO" /><Quote text="I can see the impact of every pickup I make." author="Maya Singh · Volunteer" /></div></div></section>
      </main>
     <footer className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
  <div className="rounded-3xl border border-[#dfeae1] bg-[#f7fbf7] p-8 text-center">
    <h2 className="font-display text-2xl font-black text-[#173b2c]">
      About the Creator
    </h2>

    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6d8379]">
      Food Rescue Hub is a student-created project focused on reducing food waste
      and supporting SDG 2 — Zero Hunger.
    </p>

    <p className="mt-5 text-sm font-bold text-[#0f6b45]">
      Created by Giko ⚡
    </p>

    <p className="mt-4 text-xs text-[#769087]">
      © 2026 Food Rescue Hub · Designed for a hunger-free future
    </p>
  </div>
</footer>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return <div className="flex items-center justify-center gap-3 sm:justify-start"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f5e9] text-[#0f6b45]">{icon}</div><div><div className="font-display text-2xl font-black tracking-tight text-[#173b2c]">{value}</div><div className="text-[11px] font-semibold text-[#83968d]">{label}</div></div></div>;
}

function Step({ number, icon, title, body, color }: { number: string; icon: React.ReactNode; title: string; body: string; color: "green" | "orange" | "violet" }) {
  const colorMap = { green: "bg-[#e2f3e4] text-[#0f6b45]", orange: "bg-[#fff0dc] text-[#db753b]", violet: "bg-[#ebe6ff] text-[#7161b4]" };
  return <div className="group rounded-[26px] border border-[#e3ece5] bg-white p-6 shadow-[0_16px_45px_rgba(28,75,51,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(28,75,51,0.1)]"><div className="flex items-start justify-between"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorMap[color]}`}>{icon}</div><span className="font-display text-3xl font-black text-[#dbe6dd]">{number}</span></div><h3 className="mt-7 font-display text-xl font-extrabold text-[#234d3b]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#769087]">{body}</p></div>;
}

function MiniImpact({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#f2a46c]">{icon}</div><div className="mt-5 text-sm font-extrabold">{title}</div><div className="mt-1 text-xs text-[#a4c7b1]">{body}</div></div>;
}

function FeaturedCard({ donation }: { donation: Donation }) {
  return <div className="overflow-hidden rounded-[24px] border border-[#e3ece5] bg-white shadow-[0_12px_35px_rgba(28,75,51,0.05)]"><div className="flex h-36 items-center justify-center" style={{ background: `linear-gradient(135deg, ${donation.color}, #fff)` }}><span className="text-6xl drop-shadow-sm">{donation.emoji}</span></div><div className="p-5"><div className="flex items-center justify-between"><Pill tone={isUrgent(donation) ? "red" : "green"}>{isUrgent(donation) ? "Urgent" : "Available"}</Pill><span className="text-xs font-semibold text-[#899b91]">{donation.distance} km</span></div><h3 className="mt-3 font-display text-lg font-extrabold text-[#234d3b]">{donation.food}</h3><p className="mt-1 text-xs text-[#83968d]">{donation.donor} · {donation.meals} meals</p><div className="mt-4 flex items-center justify-between border-t border-[#edf2ed] pt-3 text-xs font-semibold text-[#678176]"><span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {formatDeadline(donation.deadlineMinutes)}</span><span className="text-[#0f6b45]">View details <ChevronRight className="inline h-3.5 w-3.5" /></span></div></div></div>;
}

function Quote({ text, author }: { text: string; author: string }) {
  return <div className="rounded-2xl border border-[#e0ebe2] bg-white p-5"><div className="flex gap-1 text-[#f2a46c]">{[1, 2, 3, 4, 5].map((item) => <span key={item}>★</span>)}</div><p className="mt-4 text-sm leading-6 text-[#4d685c]">“{text}”</p><div className="mt-4 text-xs font-bold text-[#83968d]">{author}</div></div>;
}

function DemoWorkspace({ role, setRole, onExit }: { role: Role; setRole: (role: Role) => void; onExit: () => void }) {
  const [donations, setDonations] = useState<Donation[]>(initialDonations);
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const [botMessages, setBotMessages] = useState<{ from: "bot" | "user"; text: string }[]>([{ from: "bot", text: "Hi, I’m RescueBot. Ask me anything about food rescue, safe handoffs, or SDG 2." }]);
  const [botInput, setBotInput] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNewDonation, setShowNewDonation] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All types");
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [newDonation, setNewDonation] = useState({ food: "", meals: "", type: "Vegetarian", address: "", deadline: "2", description: "" });

  const meta = roleMeta[role];
  const completedMeals = donations.filter((item) => item.status === "Delivered").reduce((sum, item) => sum + item.meals, 0);
  const activeMeals = donations.filter((item) => !["Delivered", "Cancelled"].includes(item.status)).reduce((sum, item) => sum + item.meals, 0);
  const completedCount = donations.filter((item) => item.status === "Delivered").length;
  const availableDonations = donations.filter((item) => item.status === "Available");
  const claimedDonations = donations.filter((item) => ["Claimed", "Pickup Scheduled", "Picked Up"].includes(item.status));
  const volunteerTasks = donations.filter((item) => ["Claimed", "Pickup Scheduled", "Picked Up"].includes(item.status));
  const filteredAvailable = useMemo(() => availableDonations.filter((item) => (item.food.toLowerCase().includes(search.toLowerCase()) || item.donor.toLowerCase().includes(search.toLowerCase())) && (filterType === "All types" || item.type === filterType)).sort((a, b) => Number(isUrgent(b)) - Number(isUrgent(a))), [availableDonations, search, filterType]);

  const updateDonation = (id: string, changes: Partial<Donation>, message?: string) => {
    setDonations((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
    if (message) toast.success(message);
  };

  const resetDemo = () => {
    setDonations(initialDonations);
    setTab("overview");
    setSelectedDonation(null);
    setSearch("");
    setFilterType("All types");
    toast.success("Demo reset — ready for a fresh presentation flow");
  };

  const publishDonation = () => {
    if (!newDonation.food || !newDonation.meals || !newDonation.address) {
      toast.error("Add a food name, meal count and pickup address first");
      return;
    }
    const created: Donation = {
      id: `FR-${2050 + donations.length}`,
      food: newDonation.food,
      donor: "Green Leaf Restaurant",
      donorShort: "Green Leaf",
      meals: Number(newDonation.meals),
      type: newDonation.type,
      address: newDonation.address,
      distance: 1.2,
      deadlineMinutes: Number(newDonation.deadline) * 60,
      status: "Available",
      color: "#e3f4e4",
      emoji: newDonation.type === "Bakery" ? "🥐" : newDonation.type === "Fresh" ? "🍓" : "🥗",
      description: newDonation.description || "Fresh surplus food ready for a community pickup.",
      createdAt: "Just now",
    };
    setDonations((current) => [created, ...current]);
    setNewDonation({ food: "", meals: "", type: "Vegetarian", address: "", deadline: "2", description: "" });
    setShowNewDonation(false);
    toast.success(`${created.food} is now live for NGO partners`);
  };

  const claimDonation = (donation: Donation) => {
    updateDonation(donation.id, { status: "Claimed", claimedBy: "Hope Kitchen NGO" }, `${donation.food} claimed by Hope Kitchen NGO`);
    setSelectedDonation(null);
  };

  const acceptPickup = (donation: Donation) => updateDonation(donation.id, { status: "Pickup Scheduled", volunteer: "Maya Singh" }, `Pickup accepted for ${donation.food}`);
  const verifyPickup = (donation: Donation) => updateDonation(donation.id, { status: "Picked Up", volunteer: "Maya Singh" }, "QR verified — pickup confirmed");
  const deliverDonation = (donation: Donation) => updateDonation(donation.id, { status: "Delivered" }, `${donation.meals} meals added to your impact`);

  const askBot = (question: string) => {
    const answer = botAnswers[question] || "I can help with donating food, claiming a listing, food safety, volunteers, food waste, and SDG 2. Try one of the suggested questions below.";
    setBotMessages((current) => [...current, { from: "user", text: question }, { from: "bot", text: answer }]);
    setBotInput("");
  };

  const sendBotInput = () => { if (botInput.trim()) askBot(botInput.trim()); };

  return <div className="min-h-screen bg-[#f5f8f3] text-[#173b2c]">
    <header className="sticky top-0 z-30 border-b border-[#e3ece5] bg-[#fbfcf9]/90 backdrop-blur-xl"><div className="flex h-[72px] items-center justify-between px-4 lg:px-7"><div className="flex items-center gap-3"><button onClick={() => setMobileNav(!mobileNav)} className="rounded-xl p-2 text-[#547066] hover:bg-[#edf4ed] lg:hidden"><Menu className="h-5 w-5" /></button><Logo /><div className="hidden border-l border-[#dfe9e1] pl-4 text-xs font-bold text-[#8b9d93] sm:block">Presentation mode</div></div><div className="flex items-center gap-2.5"><div className="relative"><button onClick={() => setShowNotifications(!showNotifications)} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e0eae2] bg-white text-[#537466] transition hover:border-[#b6d2bc]"><Bell className="h-4.5 w-4.5" />{true && <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#ef8a4b]" />}</button>{showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}</div><div className="hidden items-center gap-2.5 border-l border-[#e0e9e1] pl-3 sm:flex"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcefe0] text-xs font-extrabold text-[#0f6b45]">{meta.initials}</div><div className="hidden leading-tight xl:block"><div className="text-xs font-extrabold text-[#315a4b]">{meta.person}</div><div className="text-[10px] font-semibold text-[#8a9d93]">{meta.label}</div></div><select value={role} onChange={(event) => setRole(event.target.value as Role)} className="ml-1 max-w-[24px] cursor-pointer appearance-none border-0 bg-transparent text-transparent outline-none"><option value="donor">Donor</option><option value="ngo">NGO</option><option value="volunteer">Volunteer</option><option value="admin">Admin</option></select><ChevronDown className="-ml-7 h-4 w-4 text-[#789188] pointer-events-none" /></div><button onClick={onExit} className="hidden rounded-full border border-[#dce7df] bg-white px-3 py-2 text-xs font-bold text-[#59766a] transition hover:border-[#adcdb6] md:block">Exit demo</button></div></div></header>
    <div className="flex">
      <aside className={`${mobileNav ? "translate-x-0" : "-translate-x-full"} fixed inset-y-[72px] left-0 z-20 w-[250px] border-r border-[#e2ebe3] bg-[#fbfcf9] p-4 transition-transform lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] lg:w-[250px] lg:translate-x-0`}>
        <div className="mb-5 rounded-2xl bg-[#edf6ed] p-3.5"><div className="flex items-center gap-2 text-xs font-bold text-[#0f6b45]"><span className="pulse-dot h-2 w-2 rounded-full bg-[#0f6b45]" /> Demo data synced</div><div className="mt-2 text-[11px] leading-5 text-[#6e887a]">Walk through the full rescue flow without a backend.</div></div>
        <div className="space-y-1">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => { setTab(item.id); setMobileNav(false); }} className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-bold transition ${tab === item.id ? "bg-[#0f6b45] text-white shadow-[0_8px_18px_rgba(15,107,69,0.18)]" : "text-[#6d8379] hover:bg-[#eef5ef] hover:text-[#315a4b]"}`}><Icon className="h-[18px] w-[18px]" />{item.label}{item.id === "notifications" && <span className="ml-auto rounded-full bg-[#f2a46c] px-1.5 py-0.5 text-[10px] text-white">3</span>}</button>; })}</div>
        <div className="my-5 border-t border-[#e5eee6]" />
        <div className="px-3 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#a0b0a7]">Presentation tools</div>
        <button onClick={() => setShowNewDonation(true)} className="mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-[#b9d5bd] px-3.5 py-3 text-sm font-bold text-[#0f6b45] transition hover:border-[#0f6b45] hover:bg-[#f0f8f0]"><Plus className="h-4 w-4" /> New donation</button>
        <button onClick={resetDemo} className="mt-1.5 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold text-[#85988e] transition hover:bg-[#eef5ef] hover:text-[#315a4b]"><RefreshCw className="h-4 w-4" /> Reset demo data</button>
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-[#e1ebe2] bg-white p-3.5"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#fff0dc] text-[#e17e44]"><CircleHelp className="h-4 w-4" /></div><div><div className="text-xs font-extrabold text-[#315a4b]">Need a prompt?</div><button onClick={() => setShowBot(true)} className="text-[11px] font-bold text-[#0f6b45]">Ask RescueBot →</button></div></div></div>
      </aside>
      {mobileNav && <div onClick={() => setMobileNav(false)} className="fixed inset-0 z-10 bg-[#173b2c]/20 lg:hidden" />}
      <main className="min-w-0 flex-1"><div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-9 lg:py-8"><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#849a8e]"><span className="pulse-dot h-2 w-2 rounded-full bg-[#ef8a4b]" /> Friday, 14 June 2026 · 09:42</div><h1 className="mt-2 font-display text-3xl font-black tracking-tight text-[#173b2c] md:text-4xl">Good morning, {meta.person.split(" ")[0]} <span className="text-[#e17e44]">✦</span></h1><p className="mt-1 text-sm text-[#72877d]">Here’s what’s moving through the rescue network today.</p></div><div className="flex items-center gap-2"><button onClick={() => setShowNewDonation(true)} className="btn-lift flex items-center gap-2 rounded-xl bg-[#0f6b45] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(15,107,69,0.16)] transition hover:bg-[#0a5637]"><Plus className="h-4 w-4" /> New donation</button><button onClick={() => setShowBot(true)} className="flex items-center gap-2 rounded-xl border border-[#dbe7de] bg-white px-3.5 py-2.5 text-sm font-bold text-[#5b7669] transition hover:border-[#b9d4be]"><Bot className="h-4 w-4 text-[#e17e44]" /><span className="hidden sm:inline">RescueBot</span></button></div></div>
        {tab === "overview" && <Overview role={role} donations={donations} activeMeals={activeMeals} completedMeals={completedMeals} completedCount={completedCount} availableDonations={availableDonations} claimedDonations={claimedDonations} volunteerTasks={volunteerTasks} setTab={setTab} setSelectedDonation={setSelectedDonation} selectedMarker={selectedMarker} setSelectedMarker={setSelectedMarker} claimDonation={claimDonation} acceptPickup={acceptPickup} verifyPickup={verifyPickup} deliverDonation={deliverDonation} />}
        {tab === "donations" && <DonationDirectory role={role} donations={donations} filteredAvailable={filteredAvailable} search={search} setSearch={setSearch} filterType={filterType} setFilterType={setFilterType} setSelectedDonation={setSelectedDonation} claimDonation={claimDonation} acceptPickup={acceptPickup} verifyPickup={verifyPickup} deliverDonation={deliverDonation} />}
        {tab === "impact" && <ImpactPage role={role} donations={donations} completedMeals={completedMeals} completedCount={completedCount} />}
        {tab === "notifications" && <NotificationsPage />}
      </div></main>
    </div>
    {selectedDonation && <DonationModal donation={selectedDonation} onClose={() => setSelectedDonation(null)} role={role} onClaim={claimDonation} onAccept={acceptPickup} onVerify={verifyPickup} onDeliver={deliverDonation} />}
    {showNewDonation && <NewDonationModal data={newDonation} setData={setNewDonation} onClose={() => setShowNewDonation(false)} onPublish={publishDonation} />}
    {showBot && <Chatbot messages={botMessages} input={botInput} setInput={setBotInput} onSend={sendBotInput} onAsk={askBot} onClose={() => setShowBot(false)} />}
  </div>;

  const notificationsBadge = true;
}

function Overview({ role, donations, activeMeals, completedMeals, completedCount, availableDonations, claimedDonations, volunteerTasks, setTab, setSelectedDonation, selectedMarker, setSelectedMarker, claimDonation, acceptPickup, verifyPickup, deliverDonation }: { role: Role; donations: Donation[]; activeMeals: number; completedMeals: number; completedCount: number; availableDonations: Donation[]; claimedDonations: Donation[]; volunteerTasks: Donation[]; setTab: (tab: Tab) => void; setSelectedDonation: (donation: Donation) => void; selectedMarker: string | null; setSelectedMarker: (id: string | null) => void; claimDonation: (donation: Donation) => void; acceptPickup: (donation: Donation) => void; verifyPickup: (donation: Donation) => void; deliverDonation: (donation: Donation) => void }) {
  const roleIntro = {
    donor: { eyebrow: "Donor cockpit", title: "Turn surplus into a signal of care.", body: "Your latest listings, pickup windows and the people your kitchen is helping." },
    ngo: { eyebrow: "Partner network", title: "The right meal, at the right moment.", body: "Recommended donations are prioritized by distance, urgency and the people you serve." },
    volunteer: { eyebrow: "Your route today", title: "Small trips. Big difference.", body: "Every verified handoff is one more meal delivered and one less plate wasted." },
    admin: { eyebrow: "Network pulse", title: "A clearer view of collective impact.", body: "Monitor the network, support partners and keep every rescue trustworthy." },
  }[role];
  return <div className="space-y-6"><section className="relative overflow-hidden rounded-[28px] bg-[#173b2c] p-6 text-white shadow-[0_20px_45px_rgba(28,75,51,0.1)] md:p-8"><div className="absolute -right-12 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" /><div className="absolute bottom-[-90px] right-[22%] h-52 w-52 rounded-full border-[28px] border-[#f2a46c]/10" /><div className="relative grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#9ed4ad]">{roleIntro.eyebrow}</p><h2 className="mt-3 max-w-xl font-display text-3xl font-black leading-tight tracking-tight md:text-4xl">{roleIntro.title}</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#b1cdb9]">{roleIntro.body}</p><div className="mt-6 flex flex-wrap gap-2"><button onClick={() => setTab("donations")} className="rounded-xl bg-[#f2a46c] px-4 py-2.5 text-xs font-extrabold text-[#173b2c] transition hover:bg-[#ffc08d]">Explore live donations <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-[#c1dbc8]"><span className="pulse-dot h-2 w-2 rounded-full bg-[#78d49a]" /> Network is live</div></div></div><div className="rounded-2xl border border-white/10 bg-white/[.07] p-5"><div className="flex items-center justify-between"><span className="text-xs font-bold text-[#b2d1bb]">Network pulse</span><Activity className="h-4 w-4 text-[#f2a46c]" /></div><div className="mt-4 flex items-end gap-2"><span className="font-display text-4xl font-black">{activeMeals.toLocaleString()}</span><span className="pb-1 text-xs text-[#a7c5b0]">active meal equivalents</span></div><div className="mt-4 flex items-end gap-1.5">{[38, 52, 44, 66, 58, 74, 86, 63, 92, 79, 96, 88].map((height, index) => <div key={index} className={`flex-1 rounded-t ${index === 11 ? "bg-[#f2a46c]" : "bg-[#78c991]/55"}`} style={{ height: `${height / 2}px` }} />)}</div><div className="mt-3 flex justify-between text-[10px] text-[#9fbca8]"><span>Mon</span><span>Today</span><span className="font-bold text-[#8ee1aa]">+18.4%</span></div></div></div></section>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard icon={<Utensils />} value={completedMeals.toLocaleString()} label="Meals rescued" trend="+12.6%" tone="green" /><MetricCard icon={<PackageCheck />} value={completedCount.toString()} label="Completed rescues" trend="+8 this week" tone="orange" /><MetricCard icon={<Users />} value="86" label="NGO partners" trend="12 nearby" tone="violet" /><MetricCard icon={<Award />} value={role === "volunteer" ? "420" : "1,840"} label="Rescue points" trend="Level 4 · Rising" tone="blue" /></div>
    <div className="grid gap-6 xl:grid-cols-[1.12fr_.88fr]"><div className="rounded-[26px] border border-[#e1ebe2] bg-white p-5 shadow-[0_12px_35px_rgba(28,75,51,0.04)] md:p-6"><div className="flex items-center justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#92a49a]">Recommended for you</p><h3 className="mt-1 font-display text-xl font-extrabold text-[#234d3b]">Rescues that need a hand</h3></div><button onClick={() => setTab("donations")} className="text-xs font-extrabold text-[#0f6b45]">View all <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button></div><div className="mt-5 space-y-3">{availableDonations.slice(0, 3).map((donation) => <RescueRow key={donation.id} donation={donation} onClick={() => setSelectedDonation(donation)} onClaim={() => claimDonation(donation)} role={role} />)}</div></div><MapCard donations={donations} selectedMarker={selectedMarker} setSelectedMarker={setSelectedMarker} /></div>
    <div className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]"><WorkflowCard role={role} claimedDonations={claimedDonations} volunteerTasks={volunteerTasks} setSelectedDonation={setSelectedDonation} acceptPickup={acceptPickup} verifyPickup={verifyPickup} deliverDonation={deliverDonation} /><Leaderboard /></div>
  </div>;
}

function MetricCard({ icon, value, label, trend, tone }: { icon: React.ReactNode; value: string; label: string; trend: string; tone: "green" | "orange" | "violet" | "blue" }) {
  const colors = { green: "bg-[#e1f3e4] text-[#0f6b45]", orange: "bg-[#fff0dd] text-[#df7b41]", violet: "bg-[#ebe6ff] text-[#7666b6]", blue: "bg-[#e2f2f5] text-[#3e8a91]" };
  return <div className="rounded-2xl border border-[#e1ebe2] bg-white p-4 shadow-[0_12px_30px_rgba(28,75,51,0.03)]"><div className="flex items-center justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors[tone]}`}>{icon}</div><span className="text-[10px] font-extrabold text-[#61a778]">{trend}</span></div><div className="mt-4 font-display text-2xl font-black tracking-tight text-[#234d3b]">{value}</div><div className="mt-0.5 text-xs font-semibold text-[#84978d]">{label}</div></div>;
}

function RescueRow({ donation, onClick, onClaim, role }: { donation: Donation; onClick: () => void; onClaim: () => void; role: Role }) {
  return <div className="group flex items-center gap-3 rounded-2xl border border-[#edf2ed] p-3 transition hover:border-[#c8dfcc] hover:bg-[#fbfdfb]"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: donation.color }}>{donation.emoji}</div><button onClick={onClick} className="min-w-0 flex-1 text-left"><div className="flex items-center gap-2"><div className="truncate text-sm font-extrabold text-[#315a4b]">{donation.food}</div>{isUrgent(donation) && <Pill tone="red"><Flame className="h-3 w-3" /> Urgent</Pill>}</div><div className="mt-1 truncate text-[11px] text-[#879990]">{donation.donor} · {donation.meals} meals · {donation.distance} km away</div><div className="mt-2 text-[10px] font-bold text-[#0f6b45]">Recommended because it expires in {formatDeadline(donation.deadlineMinutes).replace(" left", "")}.</div></button><div className="hidden text-right sm:block"><div className="flex items-center gap-1 text-[10px] font-bold text-[#83978c]"><Clock3 className="h-3 w-3" /> {formatDeadline(donation.deadlineMinutes)}</div>{role === "ngo" && <button onClick={onClaim} className="mt-2 rounded-lg bg-[#e9f6eb] px-2.5 py-1.5 text-[10px] font-extrabold text-[#0f6b45] transition hover:bg-[#d6efd9]">Claim</button>}</div><ChevronRight className="h-4 w-4 shrink-0 text-[#b1c2b7] transition group-hover:translate-x-0.5 group-hover:text-[#0f6b45]" /></div>;
}

function MapCard({ donations, selectedMarker, setSelectedMarker }: { donations: Donation[]; selectedMarker: string | null; setSelectedMarker: (id: string | null) => void }) {
  const markers = donations.slice(0, 5);
  return <div className="rounded-[26px] border border-[#e1ebe2] bg-white p-5 shadow-[0_12px_35px_rgba(28,75,51,0.04)] md:p-6"><div className="flex items-start justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#92a49a]">Live map</p><h3 className="mt-1 font-display text-xl font-extrabold text-[#234d3b]">Rescue network nearby</h3></div><Pill tone="green"><Navigation className="h-3 w-3" /> 14 active</Pill></div><div className="map-grid relative mt-5 h-[250px] overflow-hidden rounded-2xl border border-[#dceadb] bg-[#eaf4e6]"><div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" /><div className="map-river" />{markers.map((donation, index) => <button key={donation.id} onClick={() => setSelectedMarker(selectedMarker === donation.id ? null : donation.id)} className={`map-pin absolute ${selectedMarker === donation.id ? "z-20 scale-125" : "z-10"}`} style={{ left: `${16 + (index * 17) % 70}%`, top: `${22 + (index * 23) % 58}%` }}><span className={`flex h-8 w-8 items-center justify-center rounded-full border-4 border-white shadow-lg ${donation.status === "Delivered" ? "bg-[#7b68ba]" : isUrgent(donation) ? "bg-[#e17e44]" : "bg-[#0f6b45]"}`}><MapPin className="h-3.5 w-3.5 fill-current text-white" /></span>{selectedMarker === donation.id && <span className="absolute left-1/2 top-10 w-36 -translate-x-1/2 rounded-xl bg-[#173b2c] px-2.5 py-2 text-left text-[10px] font-bold text-white shadow-xl"><span className="block truncate">{donation.food}</span><span className="mt-0.5 block font-normal text-[#aed3b8]">{donation.meals} meals · {donation.distance} km</span></span>}</button>)}<div className="absolute bottom-3 left-3 rounded-lg border border-white/70 bg-white/85 px-2.5 py-1.5 text-[10px] font-bold text-[#668075] shadow-sm"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#0f6b45]" />Donors <span className="ml-2 mr-2 inline-block h-2 w-2 rounded-full bg-[#e17e44]" />Urgent</div></div><div className="mt-3 flex items-center justify-between text-xs text-[#7d9288]"><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#0f6b45]" /> Downtown & Riverside zone</span><button className="font-extrabold text-[#0f6b45]">Open full map <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button></div></div>;
}

function WorkflowCard({ role, claimedDonations, volunteerTasks, setSelectedDonation, acceptPickup, verifyPickup, deliverDonation }: { role: Role; claimedDonations: Donation[]; volunteerTasks: Donation[]; setSelectedDonation: (donation: Donation) => void; acceptPickup: (donation: Donation) => void; verifyPickup: (donation: Donation) => void; deliverDonation: (donation: Donation) => void }) {
  const donation = role === "volunteer" ? volunteerTasks[0] : claimedDonations[0];
  const steps = ["Available", "Claimed", "Pickup Scheduled", "Picked Up", "Delivered"];
  const currentIndex = donation ? steps.indexOf(donation.status) : 0;
  return <div className="rounded-[26px] border border-[#e1ebe2] bg-white p-5 shadow-[0_12px_35px_rgba(28,75,51,0.04)] md:p-6"><div className="flex items-start justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#92a49a]">Presentation flow</p><h3 className="mt-1 font-display text-xl font-extrabold text-[#234d3b]">Donor → NGO → delivery</h3></div><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff0dc] text-[#e17e44]"><Zap className="h-4 w-4" /></div></div>{donation ? <><div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f6faf5] p-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl text-2xl" style={{ background: donation.color }}>{donation.emoji}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-extrabold text-[#315a4b]">{donation.food}</div><div className="mt-0.5 text-xs text-[#85988e]">{donation.meals} meals · {donation.donor}</div></div><Pill tone={donation.status === "Delivered" ? "violet" : "green"}>{donation.status}</Pill></div><div className="mt-6 flex items-start">{steps.map((step, index) => <div key={step} className="flex min-w-0 flex-1 flex-col items-center"><div className="flex w-full items-center"><div className={`h-2 w-full ${index === 0 ? "rounded-l-full" : ""} ${index <= currentIndex ? "bg-[#0f6b45]" : "bg-[#e4eee5]"}`} /><div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${index <= currentIndex ? "border-[#0f6b45] bg-[#0f6b45] text-white" : "border-[#d5e2d8] bg-white text-[#a7b9ad]"}`}>{index <= currentIndex ? <Check className="h-3 w-3" /> : <span className="text-[9px] font-bold">{index + 1}</span>}</div><div className={`h-2 w-full ${index === steps.length - 1 ? "rounded-r-full" : ""} ${index < currentIndex ? "bg-[#0f6b45]" : "bg-[#e4eee5]"}`} /></div><span className={`mt-2 text-center text-[9px] font-bold leading-3 ${index <= currentIndex ? "text-[#0f6b45]" : "text-[#a1b1a7]"}`}>{step.replace(" ", "\n")}</span></div>)}</div><div className="mt-6 flex flex-wrap gap-2"><button onClick={() => setSelectedDonation(donation)} className="rounded-xl border border-[#dbe8dd] px-3 py-2 text-[11px] font-extrabold text-[#5f7b6d] transition hover:border-[#aacbb1]">Open details</button>{role === "volunteer" && donation.status === "Claimed" && <button onClick={() => acceptPickup(donation)} className="rounded-xl bg-[#0f6b45] px-3 py-2 text-[11px] font-extrabold text-white">Accept pickup</button>}{role === "volunteer" && donation.status === "Pickup Scheduled" && <button onClick={() => verifyPickup(donation)} className="rounded-xl bg-[#e17e44] px-3 py-2 text-[11px] font-extrabold text-white"><QrCode className="mr-1 inline h-3.5 w-3.5" /> Verify QR</button>}{role === "volunteer" && donation.status === "Picked Up" && <button onClick={() => deliverDonation(donation)} className="rounded-xl bg-[#0f6b45] px-3 py-2 text-[11px] font-extrabold text-white">Mark delivered</button>}</div></> : <div className="mt-5 rounded-2xl bg-[#f6faf5] p-5 text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f3e5] text-[#0f6b45]"><CheckCircle2 className="h-5 w-5" /></div><div className="mt-3 text-sm font-extrabold text-[#315a4b]">No active handoff right now</div><p className="mt-1 text-xs text-[#879a90]">Claim a donation to make the demo flow come alive.</p></div>}</div>;
}

function Leaderboard() {
  const entries = [{ name: "Green Leaf Restaurant", score: "1,840", icon: "🥇", color: "bg-[#fff0d7]" }, { name: "Maya Singh", score: "420", icon: "🥈", color: "bg-[#e6f3f5]" }, { name: "Hope Kitchen NGO", score: "390", icon: "🥉", color: "bg-[#ece7ff]" }];
  return <div className="rounded-[26px] border border-[#e1ebe2] bg-white p-5 shadow-[0_12px_35px_rgba(28,75,51,0.04)] md:p-6"><div className="flex items-start justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#92a49a]">Community energy</p><h3 className="mt-1 font-display text-xl font-extrabold text-[#234d3b]">Rescue leaderboard</h3></div><Trophy className="h-5 w-5 text-[#e17e44]" /></div><div className="mt-5 space-y-3">{entries.map((entry, index) => <div key={entry.name} className="flex items-center gap-3 rounded-xl bg-[#fafcf9] p-2.5"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${entry.color} text-lg`}>{entry.icon}</div><div className="min-w-0 flex-1"><div className="truncate text-xs font-extrabold text-[#315a4b]">{entry.name}</div><div className="mt-0.5 text-[10px] text-[#8a9c92]">{index === 0 ? "Waste Warrior" : index === 1 ? "Community Hero" : "100 Meals Saved"}</div></div><div className="text-right"><div className="text-sm font-black text-[#315a4b]">{entry.score}</div><div className="text-[10px] text-[#94a69c]">points</div></div></div>)}</div><div className="mt-4 rounded-xl bg-[#eff7ef] px-3 py-2.5 text-[11px] font-bold text-[#4b7860]"><Award className="mr-1 inline h-3.5 w-3.5" /> Keep going — your next badge is 60 points away.</div></div>;
}

function DonationDirectory({ role, donations, filteredAvailable, search, setSearch, filterType, setFilterType, setSelectedDonation, claimDonation, acceptPickup, verifyPickup, deliverDonation }: { role: Role; donations: Donation[]; filteredAvailable: Donation[]; search: string; setSearch: (value: string) => void; filterType: string; setFilterType: (value: string) => void; setSelectedDonation: (donation: Donation) => void; claimDonation: (donation: Donation) => void; acceptPickup: (donation: Donation) => void; verifyPickup: (donation: Donation) => void; deliverDonation: (donation: Donation) => void }) {
  const visible = role === "ngo" ? filteredAvailable : role === "volunteer" ? donations.filter((d) => ["Claimed", "Pickup Scheduled", "Picked Up"].includes(d.status)) : donations;
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#92a49a]">{role === "ngo" ? "Available near you" : "Donation directory"}</p><h2 className="mt-1 font-display text-3xl font-black tracking-tight text-[#234d3b]">{role === "volunteer" ? "Your pickup tasks" : role === "ngo" ? "Find the next rescue" : "Every handoff, in one place"}</h2></div><div className="flex items-center gap-2"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#91a49a]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search donations" className="h-10 w-48 rounded-xl border border-[#dfe9e1] bg-white pl-9 pr-3 text-xs font-semibold text-[#315a4b] outline-none placeholder:text-[#a5b4aa] focus:border-[#8db99a] sm:w-56" /></div><select value={filterType} onChange={(event) => setFilterType(event.target.value)} className="h-10 rounded-xl border border-[#dfe9e1] bg-white px-3 text-xs font-bold text-[#5e796c] outline-none"><option>All types</option><option>Vegetarian</option><option>Bakery</option><option>Fresh</option></select></div></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map((donation) => <DirectoryCard key={donation.id} donation={donation} role={role} onClick={() => setSelectedDonation(donation)} onClaim={() => claimDonation(donation)} onAccept={() => acceptPickup(donation)} onVerify={() => verifyPickup(donation)} onDeliver={() => deliverDonation(donation)} />)}</div>{visible.length === 0 && <div className="rounded-[26px] border border-dashed border-[#cfe0d2] bg-white p-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f5e9] text-[#0f6b45]"><Search className="h-5 w-5" /></div><h3 className="mt-4 font-display text-lg font-extrabold text-[#315a4b]">No matching rescues</h3><p className="mt-1 text-sm text-[#8a9d93]">Try a different search or reset the filters.</p></div>}</div>;
}

function DirectoryCard({ donation, role, onClick, onClaim, onAccept, onVerify, onDeliver }: { donation: Donation; role: Role; onClick: () => void; onClaim: () => void; onAccept: () => void; onVerify: () => void; onDeliver: () => void }) {
  return <div className="group rounded-[24px] border border-[#e1ebe2] bg-white p-4 shadow-[0_12px_30px_rgba(28,75,51,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(28,75,51,0.08)]"><button onClick={onClick} className="block w-full text-left"><div className="relative flex h-36 items-center justify-center overflow-hidden rounded-2xl" style={{ background: `linear-gradient(135deg, ${donation.color}, #fff)` }}><span className="text-6xl transition duration-200 group-hover:scale-110">{donation.emoji}</span>{isUrgent(donation) && <span className="absolute left-3 top-3"><Pill tone="red"><Flame className="h-3 w-3" /> URGENT</Pill></span>}<span className="absolute bottom-3 right-3 rounded-lg bg-white/75 px-2 py-1 text-[10px] font-extrabold text-[#59766a]">{donation.id}</span></div><div className="mt-4 flex items-start justify-between gap-2"><div><h3 className="font-display text-lg font-extrabold text-[#315a4b]">{donation.food}</h3><p className="mt-1 text-xs font-semibold text-[#879990]">{donation.donor}</p></div><Pill tone={donation.status === "Delivered" ? "violet" : donation.status === "Available" ? "green" : "orange"}>{donation.status}</Pill></div></button><div className="mt-4 grid grid-cols-2 gap-2 border-y border-[#edf2ed] py-3 text-[11px] font-semibold text-[#748a7e]"><span className="flex items-center gap-1.5"><Utensils className="h-3.5 w-3.5 text-[#0f6b45]" /> {donation.meals} meals</span><span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#0f6b45]" /> {donation.distance} km away</span><span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-[#e17e44]" /> {formatDeadline(donation.deadlineMinutes)}</span><span className="flex items-center gap-1.5"><Leaf className="h-3.5 w-3.5 text-[#0f6b45]" /> {donation.type}</span></div><div className="mt-3 flex gap-2">{role === "ngo" && donation.status === "Available" && <button onClick={onClaim} className="flex-1 rounded-xl bg-[#0f6b45] py-2.5 text-xs font-extrabold text-white transition hover:bg-[#0a5637]">Claim donation</button>}{role === "volunteer" && donation.status === "Claimed" && <button onClick={onAccept} className="flex-1 rounded-xl bg-[#0f6b45] py-2.5 text-xs font-extrabold text-white">Accept pickup</button>}{role === "volunteer" && donation.status === "Pickup Scheduled" && <button onClick={onVerify} className="flex-1 rounded-xl bg-[#e17e44] py-2.5 text-xs font-extrabold text-white"><QrCode className="mr-1 inline h-3.5 w-3.5" /> Verify QR</button>}{role === "volunteer" && donation.status === "Picked Up" && <button onClick={onDeliver} className="flex-1 rounded-xl bg-[#0f6b45] py-2.5 text-xs font-extrabold text-white">Mark delivered</button>}<button onClick={onClick} className="rounded-xl border border-[#dce8de] px-3 py-2 text-xs font-extrabold text-[#668176]">Details</button></div></div>;
}

function ImpactPage({ role, donations, completedMeals, completedCount }: { role: Role; donations: Donation[]; completedMeals: number; completedCount: number }) {
  const monthly = [28, 43, 36, 54, 47, 68, 58, 76, 62, 84, 71, 92];
  return <div className="space-y-6"><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#92a49a]">Proof of progress</p><h2 className="mt-1 font-display text-3xl font-black tracking-tight text-[#234d3b]">Impact & rewards</h2><p className="mt-2 text-sm text-[#7b9086]">Every successful rescue contributes toward reducing food insecurity and food waste.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><MetricCard icon={<Utensils />} value={completedMeals.toLocaleString()} label="Meals rescued" trend="+12.6%" tone="green" /><MetricCard icon={<CheckCircle2 />} value={completedCount.toString()} label="Donations completed" trend="This month" tone="orange" /><MetricCard icon={<Heart />} value={(completedMeals * 0.86 || 28).toFixed(0)} label="People served" trend="Estimated" tone="violet" /><MetricCard icon={<Leaf />} value={`${((completedMeals || 28) * 0.18).toFixed(1)} kg`} label="CO₂e avoided" trend="Estimated" tone="blue" /></div><div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-[26px] border border-[#e1ebe2] bg-white p-6 shadow-[0_12px_35px_rgba(28,75,51,0.04)]"><div className="flex items-center justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#92a49a]">Rescue momentum</p><h3 className="mt-1 font-display text-xl font-extrabold text-[#234d3b]">Meals kept in the community</h3></div><Pill tone="green">+18.4% vs May</Pill></div><div className="mt-8 flex h-64 items-end gap-2 border-b border-l border-[#e6eee7] px-2 pb-0 pt-5">{monthly.map((height, index) => <div key={index} className="group relative flex flex-1 items-end justify-center"><div className={`w-full max-w-10 rounded-t-lg transition ${index === monthly.length - 1 ? "bg-[#e17e44]" : "bg-[#b9dfc1] group-hover:bg-[#82c494]"}`} style={{ height: `${height * 2.1}px` }} /><span className="absolute -top-5 text-[9px] font-bold text-[#6f8879] opacity-0 transition group-hover:opacity-100">{height * 12}</span></div>)}</div><div className="mt-3 flex justify-between pl-2 text-[10px] font-bold text-[#9cacA2]">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map((month, index) => <span key={index}>{month}</span>)}</div></div><div className="rounded-[26px] bg-[#173b2c] p-6 text-white shadow-[0_12px_35px_rgba(28,75,51,0.1)]"><div className="flex items-center justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#9ed4ad]">Your journey</p><h3 className="mt-1 font-display text-xl font-extrabold">Level 4 · Nourisher</h3></div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2a46c] text-[#173b2c]"><Trophy className="h-5 w-5" /></div></div><div className="mt-6 flex items-end justify-between"><span className="font-display text-4xl font-black">{role === "volunteer" ? "420" : "1,840"}</span><span className="pb-1 text-xs text-[#a9cbb6]">rescue points</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[74%] rounded-full bg-[#f2a46c]" /></div><div className="mt-2 flex justify-between text-[10px] text-[#a9cbb6]"><span>Level 4</span><span>60 pts to level 5</span></div><div className="mt-7 space-y-2.5">{[["🥇", "First Rescue", true], ["🍱", "100 Meals Saved", true], ["♻️", "Waste Warrior", true], ["❤️", "Community Hero", false]].map(([emoji, label, unlocked]) => <div key={label as string} className={`flex items-center gap-3 rounded-xl p-2.5 ${unlocked ? "bg-white/10" : "bg-white/5 opacity-55"}`}><span className="text-xl">{emoji as string}</span><span className="flex-1 text-xs font-bold">{label as string}</span>{unlocked ? <CheckCircle2 className="h-4 w-4 text-[#8bdca2]" /> : <span className="text-[10px] text-[#a9cbb6]">Locked</span>}</div>)}</div></div></div><div className="rounded-[26px] border border-[#e1ebe2] bg-white p-6 shadow-[0_12px_35px_rgba(28,75,51,0.04)]"><div className="flex items-center justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#92a49a]">Recent proof</p><h3 className="mt-1 font-display text-xl font-extrabold text-[#234d3b]">Completed rescues</h3></div><button className="text-xs font-extrabold text-[#0f6b45]">Download impact report <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button></div><div className="mt-4 divide-y divide-[#edf2ed]">{donations.filter((item) => item.status === "Delivered").map((donation) => <div key={donation.id} className="flex items-center gap-3 py-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ background: donation.color }}>{donation.emoji}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-extrabold text-[#315a4b]">{donation.food}</div><div className="mt-0.5 text-xs text-[#879990]">{donation.donor} · Delivered via verified QR</div></div><div className="text-right"><div className="text-sm font-black text-[#0f6b45]">+{donation.meals}</div><div className="text-[10px] text-[#91a39a]">meals</div></div></div>)}</div></div></div>;
}

function NotificationsPage() {
  const items = [{ icon: <PackageCheck />, title: "Donation successfully delivered", body: "Casa Verde Cafe · 28 meals reached Hope Kitchen NGO", time: "8 min ago", tone: "green" }, { icon: <Bike />, title: "Volunteer has picked up the food", body: "Aarav is en route with 42 fruit & yogurt cups", time: "32 min ago", tone: "orange" }, { icon: <Sparkles />, title: "New food donation available nearby", body: "City Bakery · urgent · 1.8 km away", time: "41 min ago", tone: "violet" }, { icon: <Award />, title: "New badge unlocked", body: "You earned Waste Warrior for preventing 50 kg of food waste", time: "Yesterday", tone: "blue" }];
  return <div className="space-y-6"><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#92a49a]">Stay in the loop</p><h2 className="mt-1 font-display text-3xl font-black tracking-tight text-[#234d3b]">Notifications</h2><p className="mt-2 text-sm text-[#7b9086]">The important moments, ready for your presentation.</p></div><div className="grid gap-3">{items.map((item) => <div key={item.title} className="flex items-center gap-4 rounded-2xl border border-[#e1ebe2] bg-white p-4 shadow-[0_10px_28px_rgba(28,75,51,0.03)]"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.tone === "green" ? "bg-[#e4f3e5] text-[#0f6b45]" : item.tone === "orange" ? "bg-[#fff0dc] text-[#e17e44]" : item.tone === "violet" ? "bg-[#ebe6ff] text-[#7563b8]" : "bg-[#e4f3f5] text-[#3e8990]"}`}>{item.icon}</div><div className="min-w-0 flex-1"><div className="text-sm font-extrabold text-[#315a4b]">{item.title}</div><div className="mt-1 text-xs text-[#82958b]">{item.body}</div></div><div className="text-right text-[10px] font-semibold text-[#a0afa7]">{item.time}<div className="mt-1 ml-auto h-2 w-2 rounded-full bg-[#ef8a4b]" /></div></div>)}</div><div className="rounded-2xl border border-dashed border-[#bed8c3] bg-[#eef8ee] p-5 text-center"><Bell className="mx-auto h-5 w-5 text-[#0f6b45]" /><div className="mt-2 text-sm font-extrabold text-[#315a4b]">You’re all caught up</div><p className="mt-1 text-xs text-[#799084]">Push notifications are enabled for important handoff updates.</p></div></div>;
}

function DonationModal({ donation, onClose, role, onClaim, onAccept, onVerify, onDeliver }: { donation: Donation; onClose: () => void; role: Role; onClaim: (donation: Donation) => void; onAccept: (donation: Donation) => void; onVerify: (donation: Donation) => void; onDeliver: (donation: Donation) => void }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#173b2c]/35 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] bg-[#fbfcf9] p-5 shadow-2xl sm:rounded-[28px] sm:p-7"><div className="flex items-start justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#92a49a]">Donation details · {donation.id}</p><h2 className="mt-1 font-display text-2xl font-black text-[#234d3b]">{donation.food}</h2></div><button onClick={onClose} className="rounded-xl p-2 text-[#82968b] hover:bg-[#edf4ed]"><X className="h-5 w-5" /></button></div><div className="mt-5 flex items-center gap-4 rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${donation.color}, #fff)` }}><div className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl">{donation.emoji}</div><div><div className="text-sm font-extrabold text-[#315a4b]">{donation.meals} meal portions · {donation.type}</div><div className="mt-1 text-xs text-[#70867a]">Donated by {donation.donor}</div><div className="mt-2"><Pill tone={donation.status === "Available" ? (isUrgent(donation) ? "red" : "green") : donation.status === "Delivered" ? "violet" : "orange"}>{isUrgent(donation) ? "URGENT · " : ""}{donation.status}</Pill></div></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Detail icon={<MapPin />} label="Pickup address" value={`${donation.address} · ${donation.distance} km`} /><Detail icon={<Clock3 />} label="Pickup window" value={formatDeadline(donation.deadlineMinutes)} /><Detail icon={<Store />} label="Food donor" value={donation.donor} /><Detail icon={<ShieldCheck />} label="Trust status" value="Verified partner" /></div><p className="mt-5 rounded-2xl bg-[#f0f6ef] p-4 text-sm leading-6 text-[#627b6e]">{donation.description}</p>{donation.status !== "Available" && <div className="mt-5 rounded-2xl border border-[#e4ece5] bg-white p-4"><div className="flex items-center justify-between"><div><div className="text-xs font-extrabold uppercase tracking-[.13em] text-[#92a49a]">Handoff tracker</div><div className="mt-1 text-sm font-extrabold text-[#315a4b]">{donation.status === "Delivered" ? "Rescue complete" : "In motion"}</div></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6ecd9] text-[#d98747]"><QrCode className="h-5 w-5" /></div></div><div className="mt-4 grid grid-cols-5 gap-1">{["Listed", "Claimed", "Scheduled", "Picked up", "Delivered"].map((step, index) => <div key={step}><div className={`h-1.5 rounded-full ${index <= ["Available", "Claimed", "Pickup Scheduled", "Picked Up", "Delivered"].indexOf(donation.status) ? "bg-[#0f6b45]" : "bg-[#e5eee6]"}`} /><div className="mt-1 text-[9px] font-bold text-[#8ca096]">{step}</div></div>)}</div></div>}{donation.status === "Pickup Scheduled" && <div className="mt-4 flex items-center gap-4 rounded-2xl border border-[#f0d8bd] bg-[#fff8ef] p-4"><div className="qr-pattern flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-4 border-white shadow-sm"><QrCode className="h-9 w-9 text-[#173b2c]" /></div><div><div className="text-xs font-extrabold uppercase tracking-[.13em] text-[#d27c41]">QR pickup verification</div><p className="mt-1 text-xs leading-5 text-[#8b725e]">Volunteer scans this code on arrival to confirm the safe handoff.</p></div></div>}<div className="mt-6 flex flex-wrap justify-end gap-2">{role === "ngo" && donation.status === "Available" && <button onClick={() => onClaim(donation)} className="rounded-xl bg-[#0f6b45] px-4 py-2.5 text-xs font-extrabold text-white">Claim this donation</button>}{role === "volunteer" && donation.status === "Claimed" && <button onClick={() => onAccept(donation)} className="rounded-xl bg-[#0f6b45] px-4 py-2.5 text-xs font-extrabold text-white">Accept pickup</button>}{role === "volunteer" && donation.status === "Pickup Scheduled" && <button onClick={() => onVerify(donation)} className="rounded-xl bg-[#e17e44] px-4 py-2.5 text-xs font-extrabold text-white"><QrCode className="mr-1 inline h-3.5 w-3.5" /> Scan QR to verify</button>}{role === "volunteer" && donation.status === "Picked Up" && <button onClick={() => onDeliver(donation)} className="rounded-xl bg-[#0f6b45] px-4 py-2.5 text-xs font-extrabold text-white"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> Mark delivered</button>}<button onClick={onClose} className="rounded-xl border border-[#dbe7dd] px-4 py-2.5 text-xs font-extrabold text-[#657e71]">Close</button></div></div></div>;
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-[#e6eee7] bg-white p-3"><div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#9aa9a1]">{icon}{label}</div><div className="mt-2 text-xs font-bold text-[#4c695b]">{value}</div></div>; }

function NewDonationModal({ data, setData, onClose, onPublish }: { data: { food: string; meals: string; type: string; address: string; deadline: string; description: string }; setData: (data: { food: string; meals: string; type: string; address: string; deadline: string; description: string }) => void; onClose: () => void; onPublish: () => void }) {
  const field = (key: keyof typeof data, value: string) => setData({ ...data, [key]: value });
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#173b2c]/35 p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="w-full max-w-2xl rounded-t-[28px] bg-[#fbfcf9] p-5 shadow-2xl sm:rounded-[28px] sm:p-7"><div className="flex items-start justify-between"><div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#92a49a]">Donor cockpit</p><h2 className="mt-1 font-display text-2xl font-black text-[#234d3b]">List surplus food</h2><p className="mt-1 text-xs text-[#82978c]">Your listing will appear instantly in the NGO network.</p></div><button onClick={onClose} className="rounded-xl p-2 text-[#82968b] hover:bg-[#edf4ed]"><X className="h-5 w-5" /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Food name" placeholder="e.g. Garden lunch bowls" value={data.food} onChange={(value) => field("food", value)} /><Field label="Number of meals" placeholder="35" type="number" value={data.meals} onChange={(value) => field("meals", value)} /><label className="block"><span className="field-label">Food type</span><select value={data.type} onChange={(event) => field("type", event.target.value)} className="field-input"><option>Vegetarian</option><option>Bakery</option><option>Fresh</option><option>Mixed</option></select></label><label className="block"><span className="field-label">Pickup deadline</span><select value={data.deadline} onChange={(event) => field("deadline", event.target.value)} className="field-input"><option value="1">Within 1 hour</option><option value="2">Within 2 hours</option><option value="4">Within 4 hours</option><option value="8">Today</option></select></label><div className="sm:col-span-2"><Field label="Pickup address" placeholder="Street, neighborhood or landmark" value={data.address} onChange={(value) => field("address", value)} /></div><div className="sm:col-span-2"><label className="block"><span className="field-label">Description & food safety notes</span><textarea rows={3} value={data.description} onChange={(event) => field("description", event.target.value)} placeholder="Add packing notes, allergens or storage information" className="field-input resize-none" /></label></div></div><div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-[#eef7ee] p-4"><div className="flex items-center gap-2 text-xs font-bold text-[#4e7860]"><ShieldCheck className="h-4 w-4 text-[#0f6b45]" /> Your listing is shared with verified NGO partners only.</div><button onClick={onPublish} className="shrink-0 rounded-xl bg-[#0f6b45] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#0a5637]">Publish donation <Send className="ml-1 inline h-3.5 w-3.5" /></button></div></div></div>;
}

function Field({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="block"><span className="field-label">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="field-input" /></label>; }

function NotificationPanel({ onClose }: { onClose: () => void }) { return <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-[#dfe9e1] bg-[#fbfcf9] p-3 shadow-[0_20px_45px_rgba(28,75,51,0.16)]"><div className="flex items-center justify-between px-2 py-1"><div className="text-sm font-extrabold text-[#315a4b]">Notifications</div><button onClick={onClose} className="text-[10px] font-bold text-[#0f6b45]">Mark all read</button></div><div className="mt-2 space-y-1">{[{ title: "New food donation nearby", body: "City Bakery · 1.8 km", icon: <Sparkles /> }, { title: "Pickup verified", body: "Aarav picked up 42 meals", icon: <QrCode /> }, { title: "Badge unlocked", body: "Waste Warrior", icon: <Award /> }].map((item) => <div key={item.title} className="flex gap-2.5 rounded-xl p-2.5 hover:bg-[#eef5ef]"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eaf5e9] text-[#0f6b45]">{item.icon}</div><div><div className="text-xs font-extrabold text-[#4c6b5b]">{item.title}</div><div className="mt-0.5 text-[10px] text-[#8b9e94]">{item.body}</div></div></div>)}</div></div>; }

function Chatbot({ messages, input, setInput, onSend, onAsk, onClose }: { messages: { from: "bot" | "user"; text: string }[]; input: string; setInput: (value: string) => void; onSend: () => void; onAsk: (question: string) => void; onClose: () => void }) { return <div className="fixed bottom-4 right-4 z-50 flex w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[24px] border border-[#d8e6da] bg-[#fbfcf9] shadow-[0_24px_65px_rgba(20,70,44,0.2)]"><div className="flex items-center justify-between bg-[#173b2c] px-4 py-3.5 text-white"><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2a46c] text-[#173b2c]"><Bot className="h-5 w-5" /></div><div><div className="text-sm font-extrabold">RescueBot</div><div className="text-[10px] text-[#a9cbb6]">Always on · demo intelligence</div></div></div><button onClick={onClose} className="rounded-lg p-1 text-[#b3d0bc] hover:bg-white/10"><X className="h-4 w-4" /></button></div><div className="max-h-72 space-y-3 overflow-y-auto p-4">{messages.map((message, index) => <div key={index} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[84%] rounded-2xl px-3 py-2.5 text-xs leading-5 ${message.from === "user" ? "rounded-br-md bg-[#0f6b45] text-white" : "rounded-bl-md bg-[#edf6ed] text-[#4e6d5c]"}`}>{message.text}</div></div>)}{messages.length === 1 && <div className="space-y-1.5 pt-1"><div className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#9aaa9f]">Suggested questions</div>{Object.keys(botAnswers).slice(0, 3).map((question) => <button key={question} onClick={() => onAsk(question)} className="block w-full rounded-xl border border-[#dfe9e1] px-3 py-2 text-left text-[11px] font-bold text-[#5b786a] transition hover:border-[#a8caae] hover:bg-white">{question}</button>)}</div>}</div><div className="flex gap-2 border-t border-[#e6eee7] bg-white p-3"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") onSend(); }} placeholder="Ask about food rescue..." className="min-w-0 flex-1 rounded-xl border border-[#dce8de] bg-[#fbfcf9] px-3 py-2.5 text-xs font-semibold text-[#315a4b] outline-none focus:border-[#8db99a]" /><button onClick={onSend} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f6b45] text-white transition hover:bg-[#0a5637]"><Send className="h-4 w-4" /></button></div></div>; }

export default function Home() {
  const [role, setRole] = useState<Role>("donor");
  const [workspace, setWorkspace] = useState(false);
  const enterWorkspace = (nextRole: Role) => { setRole(nextRole); setWorkspace(true); };
  return workspace ? <DemoWorkspace role={role} setRole={setRole} onExit={() => setWorkspace(false)} /> : <Landing onEnter={enterWorkspace} />;
}

// Keep the built-in role switcher demonstrable on keyboard + narrow screens.
void UserRound;
void MessageCircle;

/*** End of Home.tsx ***/

/*** Begin next file ***/
