import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TurnosWeb | Sistema de Turnos en la Nube para Clínicas y Comercios',
  description:
    'Optimiza la atención al público con un sistema inteligente de turnos: Tótem de autoservicio táctil, Cartelería digital para TV y Panel de operador con cronómetro. Prueba 7 días gratis.',
  keywords: [
    'sistema de turnos',
    'turnero digital',
    'carteleria tv turnos',
    'totem turnos argentina',
    'software gestion de filas',
    'turnos clinicas consultorios',
  ],
  authors: [{ name: 'Desarrollos Web', url: 'https://desarrollosweb.net.ar' }],
  metadataBase: new URL('https://turnos.desarrollosweb.net.ar'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TurnosWeb — Sistema de Turnos Inteligente en la Nube',
    description:
      'Elimina las filas desordenadas. Tótem táctil, llamados en TV y control de atención para tu negocio o consultorio.',
    url: 'https://turnos.desarrollosweb.net.ar',
    siteName: 'TurnosWeb SaaS',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TurnosWeb — Sistema de Turnos en la Nube',
    description: 'Transforma la experiencia de tus clientes con turnos digitales y cartelería TV en vivo.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'TurnosWeb SaaS',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web, Android, iOS, Windows',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'ARS',
                description: 'Prueba gratuita de 7 días sin tarjeta de crédito',
              },
              description:
                'Sistema integral de gestión de colas, tótem de emisión y cartelería en TV.',
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
