import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-lg">PropData</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link
              href="/cuanto-vale"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Cuanto vale tu cuadra
            </Link>
            <Link
              href="/mapa"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Mapa de precios
            </Link>
            <Link
              href="/oportunidad"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Calculadora
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
