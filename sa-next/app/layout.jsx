export const metadata = {
  title: 'BIZZ.IA Sales Academy',
  description: 'Plataforma de treinamento com IA para clínicas de estética',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: '#000' }}>{children}</body>
    </html>
  )
}
