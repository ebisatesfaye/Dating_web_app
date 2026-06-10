'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Heart, LogOut, LayoutDashboard, Settings, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home',            href: '/' },
  { label: 'Search',          href: '/browse' },
  { label: 'How It Works',    href: '#how-it-works' },
  { label: 'Success Stories', href: '#success-stories' },
  { label: 'FAQ',             href: '#faq' },
  { label: 'Blog',            href: '#blog' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group shrink-0">
            <Heart className="h-7 w-7 text-primary fill-primary group-hover:scale-110 transition-transform" />
            <span className="text-xl font-extrabold tracking-wide text-white">
              Whaatachi
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-primary transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-4/5" />
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="flex items-center space-x-1 text-sm font-medium text-accent-blue hover:text-cyan-300 transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link href="/dashboard" className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-primary transition-colors">
                  <Settings className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  {user.profile?.fullName.split(' ')[0]}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-sm font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-full border border-white/25 text-sm font-semibold text-white hover:border-primary hover:text-primary transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-full bg-primary text-sm font-bold text-white hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-300 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 px-3 pt-3">
              {user ? (
                <button onClick={logout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-full border border-white/25 text-sm font-semibold text-white">Login</Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)} className="px-4 py-2 rounded-full bg-primary text-sm font-bold text-white">Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
