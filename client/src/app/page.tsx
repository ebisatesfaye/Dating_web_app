'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Users, Heart, ShieldCheck, CreditCard, Search, MessageCircle,
  ChevronLeft, ChevronRight, MapPin, Zap, UserCheck, Clock,
  Send,
  HeartIcon,
  Flame
} from 'lucide-react';
import API from '../lib/api';

/* === Data === */

const STATS = [
  { icon: Users, value: '50K+', label: 'Active Members' },
  { icon: Heart, value: '12K+', label: 'Success Stories' },
  { icon: ShieldCheck, value: '100%', label: 'Safe & Secure' },
];

const INTENTS = [
  {
    icon: HeartIcon,
    label: 'True Relationship',
    desc: 'Find your life partner',
    id: 'RELATIONSHIP',
  },
  {
    icon: Users,
    label: 'Friendship',
    desc: 'Meet new friends',
    id: 'FRIENDSHIP',
  },
  {
    icon: Flame,
    label: 'Friends with Benefits',
    desc: 'No strings attached',
    id: 'FWB',
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    icon: UserCheck,
    title: 'Create Account',
    desc: 'Register with your basic info and preferred way to connect.',
  },
  {
    step: 2,
    icon: CreditCard,
    title: 'Payment (Men Only)',
    desc: 'Men pay 200 Birr to get full access. Women join for free.',
  },
  {
    step: 3,
    icon: Search,
    title: 'Find & Connect',
    desc: "Search people based on what you're looking for.",
  },
  {
    step: 4,
    icon: MessageCircle,
    title: 'Get Contacts',
    desc: 'After payment, view contacts and start connecting.',
  },
];

const MEN_FEATURES = [
  'Full access to all members',
  'View contacts (Phone, Telegram, IG)',
  'Advanced search & filters',
  'Send messages',
  '24/7 Customer support',
];

const WOMEN_FEATURES = [
  'Create profile for free',
  'Browse members',
  'Receive messages',
  'View limited info',
  'Upgrade anytime (optional)',
];

const WHY_US = [
  { icon: ShieldCheck, title: 'Safe & Secure', desc: 'Your privacy is our priority' },
  { icon: UserCheck, title: 'Real People', desc: 'Verified profiles for real connections' },
  { icon: Zap, title: 'Fast & Easy', desc: 'Quick registration and simple process' },
  { icon: Clock, title: '24/7 Support', desc: 'We are here to help you anytime' },
];

const FEATURED = [
  { name: 'Selam', age: 24, intent: 'True Relationship', city: 'Addis Ababa', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=380&fit=crop&crop=face' },
  { name: 'Daniel', age: 27, intent: 'Friendship', city: 'Addis Ababa', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=380&fit=crop&crop=face' },
  { name: 'Maya', age: 22, intent: 'Looking for Fun', city: 'Addis Ababa', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=380&fit=crop&crop=face&sat=-100&con=1' },
  { name: 'Abel', age: 29, intent: 'True Relationship', city: 'Addis Ababa', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=380&fit=crop&crop=face' },
  { name: 'Lili', age: 25, intent: 'Friendship', city: 'Addis Ababa', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=380&fit=crop&crop=face' },
  { name: 'Nahom', age: 26, intent: 'Looking for Fun', city: 'Addis Ababa', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=380&fit=crop&crop=face' },
];

const FOOTER_LINKS = {
  'Quick Links': ['Home', 'Search', 'How It Works', 'Success Stories', 'Blog'],
  'Support': ['FAQ', 'Contact Us', 'Terms of Service', 'Privacy Policy', 'Community Guidelines'],
};

/* === Component === */

export default function Home() {
  const [fee, setFee] = useState<number>(200);
  const [email, setEmail] = useState('');
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    API.get('/settings').then((res) => {
      if (res.data?.membershipFee) setFee(res.data.membershipFee);
    }).catch(() => { });
  }, []);

  const scrollCarousel = (dir: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = 320;
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col w-full overflow-x-hidden">

      {/* HERO */}
      <section className="relative w-full min-h-[580px] flex items-center overflow-hidden">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1400&h=700&fit=crop"
          alt="Couple"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-8 py-20">
          <div className="max-w-xl">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight">
              Find People.<br />
              Build Connections.<br />
              <span className="text-primary">Your Way.</span>
            </h1>
            <p className="mt-5 text-gray-300 text-base leading-relaxed max-w-sm">
              Find men and women for true relationship, friendship, friends with benefits or just fun. Real people, real connections, real you.
            </p>

            {/* Stats */}
            <div className="mt-8 flex gap-6 flex-wrap">
              {STATS.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <s.icon className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <span className="text-white font-bold text-base">{s.value}</span>
                    <span className="text-gray-400 text-xs ml-1">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex gap-4 flex-wrap">
              <Link
                href="/register"
                className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary font-bold text-white text-sm shadow-lg shadow-primary/40 hover:bg-primary/90 transition-all"
              >
                <Users className="h-4 w-4" />
                Join Now
              </Link>
              <Link
                href="#how-it-works"
                className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/40 bg-white/10 backdrop-blur font-bold text-white text-sm hover:bg-white/20 transition-all"
              >
                <span className="h-4 w-4 flex items-center justify-center rounded-full bg-white/30">▶</span>
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* I'M HERE FOR */}
      <section className="w-full bg-[#12121a] border-y border-white/10 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-center text-white font-semibold text-base mb-7 tracking-wide">
            I&apos;m here for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {INTENTS.map((intent) => (
              <div
                key={intent.id}
                className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <div className="h-12 w-12 text-primary flex items-center justify-center rounded-full  bg-[#12121a] border border-primary/20 text-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {<intent.icon />}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{intent.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{intent.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="w-full bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <div className="mt-2 mx-auto w-10 h-1 bg-primary rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {HOW_IT_WORKS.map((item, i) => (
              <React.Fragment key={item.step}>
                <div className="flex flex-col items-center text-center">
                  {/* Step circle */}
                  <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-pink-50 border-2 border-pink-100 mb-4">
                    <item.icon className="h-7 w-7 text-primary" />
                    <span className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow">
                      {item.step}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-2">{item.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
                {/* Arrow between steps */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center absolute" style={{ left: `${(i + 1) * 25 - 2}%`, top: '32px', transform: 'translateX(-50%)' }}>
                    <span className="text-gray-300 text-xl">›</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="w-full bg-[#0f0f1a] p-6 mt-6 rounded-2xl max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Join Whaatachi</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Men Card */}
            <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-[#1a1a2e] p-7 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-blue-500 border border-blue-500/30">
                  <span className="text-white text-6xl font-bold">♂</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Men</p>
                  <p className="text-white text-3xl font-extrabold">{fee} <span className="text-lg font-semibold text-gray-400">Birr</span></p>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {MEN_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-primary text-base">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center py-3.5 rounded-xl bg-blue-500 font-bold text-white text-sm hover:bg-blue-400 transition-all shadow"
              >
                Pay {fee} Birr & Continue
              </Link>
            </div>

            {/* Women Card */}
            <div className="lg:col-span-1 rounded-2xl border border-primary/30 bg-[#1a1a2e] p-7 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-primary border border-primary/30">
                  <span className="text-white text-6xl font-bold">♀</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Women</p>
                  <p className="text-white text-3xl font-extrabold text-primary">Free</p>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {WOMEN_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-primary text-base">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center py-3.5 rounded-xl bg-primary font-bold text-white text-sm hover:bg-primary/90 transition-all shadow shadow-primary/30"
              >
                Join For Free
              </Link>
            </div>

            {/* Why Us */}
            <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-[#1a1a2e] p-7 flex flex-col gap-5">
              {WHY_US.map((w) => (
                <div key={w.title} className="flex items-start gap-3">
                  <div className="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 shrink-0">
                    <w.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{w.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* JOIN WHAATACHI PRICING */}
      {/* <section className="w-full bg-[#0f0f1a] py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Join Whaatachi</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            Men Card
            <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-[#1a1a2e] p-7 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/30">
                  <span className="text-blue-400 text-2xl font-bold">♂</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Men</p>
                  <p className="text-white text-3xl font-extrabold">{fee} <span className="text-lg font-semibold text-gray-400">Birr</span></p>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {MEN_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-primary text-base">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center py-3.5 rounded-xl bg-blue-500 font-bold text-white text-sm hover:bg-blue-400 transition-all shadow"
              >
                Pay {fee} Birr & Continue
              </Link>
            </div>

            Women Card
            <div className="lg:col-span-1 rounded-2xl border border-primary/30 bg-[#1a1a2e] p-7 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                  <span className="text-primary text-2xl font-bold">♀</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Women</p>
                  <p className="text-white text-3xl font-extrabold text-primary">Free</p>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {WOMEN_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-primary text-base">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center py-3.5 rounded-xl bg-primary font-bold text-white text-sm hover:bg-primary/90 transition-all shadow shadow-primary/30"
              >
                Join For Free
              </Link>
            </div>

            Why Us
            <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-[#1a1a2e] p-7 flex flex-col gap-5">
              {WHY_US.map((w) => (
                <div key={w.title} className="flex items-start gap-3">
                  <div className="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20 shrink-0">
                    <w.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{w.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> */}

      {/* FEATURED MEMBERS */}
      <section id="success-stories" className="w-full bg-[#12121a] py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Featured Members</h2>
            <Link
              href="/browse"
              className="px-5 py-2 rounded-full bg-primary text-sm font-bold text-white hover:bg-primary/90 transition-all shadow shadow-primary/30"
            >
              View All
            </Link>
          </div>

          <div className="relative">
            {/* Scroll buttons */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-[#1a1a2e] border border-white/15 text-white hover:border-primary hover:text-primary transition-all shadow-xl"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Carousel */}
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {FEATURED.map((member, i) => (
                <div
                  key={i}
                  className="shrink-0 w-[180px] sm:w-[200px] rounded-2xl overflow-hidden border border-white/10 bg-[#1a1a2e] group cursor-pointer hover:border-primary/50 transition-all"
                >
                  <div className="relative h-[220px] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Online badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                      <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-white text-[10px] font-semibold">Online</span>
                    </div>
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  <div className="p-3">
                    <p className="text-white font-bold text-sm">{member.name}, {member.age}</p>
                    <p className="text-gray-400 text-xs mt-0.5">Looking for {member.intent}</p>
                    <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {member.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => scrollCarousel('right')}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-[#1a1a2e] border border-white/15 text-white hover:border-primary hover:text-primary transition-all shadow-xl"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[#0a0a12] border-t border-white/10 pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-primary fill-primary" />
                <span className="text-white font-extrabold text-lg">Whaatachi</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed mb-5">
                Whaatachi helps you find people who match your vibe. True connection starts with a simple step.
              </p>
              {/* Social Icons */}
              <div className="flex gap-3">
                <a
                  href="#"
                  aria-label="Telegram"
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:opacity-80 transition-opacity"
                >
                  <Send className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white hover:opacity-80 transition-opacity"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-600 text-white hover:opacity-80 transition-opacity"
                >
                  <Users className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-sky-500 text-white hover:opacity-80 transition-opacity"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Quick Links & Support */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-white font-bold text-sm mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-500 text-xs hover:text-primary transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Payment Methods */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Payment Methods</h4>
              <div className="flex gap-2 mb-3">
                <div className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-white/10 text-xs font-bold text-blue-400">
                  Tele Birr
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-white/10 text-xs font-bold text-green-400">
                  CBE Birr
                </div>
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                Secure payments powered by trusted services.
              </p>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Newsletter</h4>
              <p className="text-gray-500 text-xs mb-4 leading-relaxed">
                Get updates and offers straight to your inbox.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 px-3 py-2 text-xs rounded-lg bg-[#1a1a2e] border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors"
                />
                <button className="px-3 py-2 rounded-lg bg-primary text-xs font-bold text-white hover:bg-primary/90 transition-all shrink-0">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-gray-600 text-xs">© 2024 Whaatachi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
