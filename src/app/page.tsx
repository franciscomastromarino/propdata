import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddressSearch from "@/components/AddressSearch";

const features = [
  {
    title: "Cuanto vale tu cuadra",
    description:
      "Ingresa cualquier direccion y descubri el precio promedio por m2, ranking vs otras zonas y tendencia de precios.",
    href: "/cuanto-vale",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    ),
  },
  {
    title: "Mapa de precios",
    description:
      "Mapa de calor interactivo con precios por m2 en todo CABA y GBA. Filtra por tipo, ambientes y rango de precio.",
    href: "/mapa",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
      </svg>
    ),
  },
  {
    title: "Calculadora de oportunidad",
    description:
      "Pega la URL de un aviso o carga los datos manualmente. Te decimos si es oportunidad, precio justo o esta caro.",
    href: "/oportunidad",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008H15.75v-.008Zm0 2.25h.008v.008H15.75V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Inteligencia inmobiliaria
                <br />
                <span className="text-accent">para Argentina</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto">
                Datos de +1.5M de propiedades de Zonaprop, Argenprop,
                MercadoLibre y Properati. Normalizados con AI. Actualizados
                semanalmente.
              </p>
              <div className="mt-10 flex justify-center">
                <AddressSearch />
              </div>
              <p className="mt-4 text-sm text-muted">
                Ejemplo: Av. Santa Fe 1234, Palermo, CABA
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group rounded-2xl border border-border bg-card p-8 hover:border-accent/50 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="border-t border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "1.5M+", label: "Propiedades" },
                { value: "4", label: "Portales" },
                { value: "CABA + GBA", label: "Cobertura" },
                { value: "Semanal", label: "Actualizacion" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-bold text-accent">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
