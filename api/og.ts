import { ImageResponse } from '@vercel/og';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { searchParams } = new URL(req.url as string);
  const state = searchParams.get('state');
  const wpm = searchParams.get('wpm');
  const accuracy = searchParams.get('accuracy');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #818cf8, #c084fc)',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          }}
        >
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '20px',
            }}
          >
            Typing Speed Test
          </h1>
          {state === 'typing' ? (
            <div
              style={{
                fontSize: '24px',
                color: '#4b5563',
                textAlign: 'center',
                maxWidth: '600px',
              }}
            >
              <p>Type the following text:</p>
              <p style={{ marginTop: '12px', fontStyle: 'italic' }}>
                "The quick brown fox jumps over the lazy dog."
              </p>
            </div>
          ) : state === 'challenge' && wpm && accuracy ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <p style={{ fontSize: '24px', color: '#4b5563' }}>
                You've been challenged!
              </p>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div
                  style={{
                    background: '#eef2ff',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ color: '#4f46e5', fontSize: '24px' }}>WPM</p>
                  <p style={{ color: '#312e81', fontSize: '36px', fontWeight: 'bold' }}>{wpm}</p>
                </div>
                <div
                  style={{
                    background: '#ecfdf5',
                    padding: '16px 32px',
                    borderRadius: '12px',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ color: '#059669', fontSize: '24px' }}>Accuracy</p>
                  <p style={{ color: '#064e3b', fontSize: '36px', fontWeight: 'bold' }}>{accuracy}%</p>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: '24px',
                color: '#4b5563',
                textAlign: 'center',
                maxWidth: '600px',
              }}
            >
              <p>Test your typing speed and challenge your friends!</p>
              <p style={{ marginTop: '12px', fontSize: '18px' }}>
                Click "Start Typing Test" to begin
              </p>
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}