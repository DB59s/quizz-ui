import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en/home',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/home',
        permanent: true,
        locale: false
      },
      {
        source: '/((?!(?:en|fr|ar|front-pages|favicon.ico|.*\\.svg)\\b)):path',
        destination: '/en/:path',
        permanent: true,
        locale: false
      }
    ]
  },
  headers: async () => {
    return [
      {
        source: '/icon.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },
  experimental: {
    turbo: {
      resolveAlias: {
        'openid-client': './node_modules/openid-client/lib/index.js'
      }
    }
  }
}

export default nextConfig
