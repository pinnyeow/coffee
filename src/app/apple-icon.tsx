import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #1c1917 0%, #44403c 100%)',
          color: '#fef3c7',
          fontSize: 120,
          fontWeight: 700,
          fontFamily: 'system-ui',
          letterSpacing: '-0.05em',
        }}
      >
        P
      </div>
    ),
    { ...size }
  )
}
