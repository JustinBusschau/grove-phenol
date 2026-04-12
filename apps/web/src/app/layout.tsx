import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Phenol - Medication Management',
  description: 'Web-based MVP for medication management and infusion process checklists',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="container">
          <header className="header">
            <h1>Phenol</h1>
            <nav className="nav">
              <a href="/login">Login</a>
              <a href="/dashboard">Dashboard</a>
            </nav>
          </header>
          <main className="main">
            {children}
          </main>
          <footer className="footer">
            <p>&copy; 2024 Phenol. Clinical safety first.</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
