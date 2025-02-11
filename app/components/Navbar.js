'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { User, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session) {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  useEffect(() => {
    // Check if theme is stored in localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Error signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsDropdownOpen(false);
      router.refresh();
      if (pathname !== '/search') {
        router.push('/search');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link className="btn btn-ghost text-xl" href="/">Sneaker Vault</Link>
      </div>
      <div className="flex-none gap-2">
        <div className="flex items-center gap-4">
          <button
            className="btn btn-ghost btn-circle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Link href="/search" className="btn btn-ghost">
            Search
          </Link>
          {user && (
            <>
              <Link href="/vault" className="btn btn-ghost">
                Vault
              </Link>
              <Link href="/collections" className="btn btn-ghost">
                Collections
              </Link>
            </>
          )}
          <div className="dropdown dropdown-end">
            {loading ? (
              <button className="btn btn-ghost btn-circle">
                <span className="loading loading-spinner loading-sm"></span>
              </button>
            ) : user ? (
              <div className="relative">
                <button
                  className="btn btn-circle btn-ghost"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {user.user_metadata?.avatar_url ? (
                    <div className="relative w-8 h-8">
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="rounded-full w-full h-full"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <User />
                  )}
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-content menu p-2 shadow bg-base-200 rounded-box absolute right-0 mt-2 w-48">
                    <div className="px-4 py-2 text-sm">
                      {user.email}
                    </div>
                    <div className="divider my-0"></div>
                    <button
                      onClick={handleSignOut}
                      className="btn btn-ghost btn-sm justify-start w-full"
                      disabled={loading}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Sign In'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar; 