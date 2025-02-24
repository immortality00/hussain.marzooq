import Navigation from './header/Navigation';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'] });

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${montserrat.className}`}>
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <Navigation />
      </header>

      <main className="flex-grow bg-gray-50">
        {children}
      </main>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p>Email: contact@hussainmarzooq.com</p>
              <p>Location: Dubai, UAE</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Social</h3>
              <div className="space-y-2">
                <a href="#" className="block hover:text-blue-400">LinkedIn</a>
                <a href="#" className="block hover:text-blue-400">Instagram</a>
                <a href="#" className="block hover:text-blue-400">GitHub</a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="/about" className="block hover:text-blue-400">About</a>
                <a href="/contact" className="block hover:text-blue-400">Contact</a>
                <a href="/photography" className="block hover:text-blue-400">Portfolio</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>&copy; {new Date().getFullYear()} Hussain Marzooq. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 