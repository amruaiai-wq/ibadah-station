'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const pathname = usePathname();
  

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check (in production, use proper auth)
    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      sessionStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/wisdom', label: 'ข้อคิดประจำวัน', icon: '✨' },
    { href: '/admin/articles', label: 'บทความ', icon: '📝' },
  ];

  // Login form
  if (!isAuthenticated) {
    return (
      <html lang="th">
        <body className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">🔐</span>
              <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
              <p className="text-gray-500 mt-2">Ibadah Station Dashboard</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
              >
                เข้าสู่ระบบ
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/th" className="text-sm text-gray-500 hover:text-primary">
                ← กลับไปหน้าหลัก
              </Link>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="th">
      <body className="min-h-screen bg-gray-100">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white min-h-screen shadow-sm fixed left-0 top-0">
            <div className="p-6 border-b">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="text-2xl">🕌</span>
                <div>
                  <span className="font-bold text-lg">Ibadah</span>
                  <span className="text-gold font-bold ml-1">Admin</span>
                </div>
              </Link>
            </div>

            <nav className="p-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors
                    ${pathname === item.href 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:bg-gray-100'}
                  `}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span>🚪</span>
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
