import Link from 'next/link'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-base-100">
      <nav className="navbar bg-base-200">
        <div className="flex-1">
          <Link href="/" className="btn btn-ghost text-xl">Sneaker Vault</Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li><Link href="/search">Search</Link></li>
            <li><Link href="/vault">My Vault</Link></li>
            <li><Link href="/collection">Collections</Link></li>
          </ul>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
