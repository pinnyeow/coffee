import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pour',
    short_name: 'Pour',
    description: 'A coffee journal that gets better with friends.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf7',
    theme_color: '#1c1917',
    orientation: 'portrait',
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
