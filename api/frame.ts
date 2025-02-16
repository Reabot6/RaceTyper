import { ImageResponse } from '@vercel/og';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Serve Frame metadata
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${process.env.VERCEL_URL}/api/og" />
          <meta property="fc:frame:button:1" content="Start Typing Test" />
          <meta property="fc:frame:button:2" content="Challenge a Friend" />
          <meta property="fc:frame:post_url" content="${process.env.VERCEL_URL}/api/frame" />
        </head>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }

  if (req.method === 'POST') {
    const body = await req.json();
    const { buttonIndex, untrustedData } = body;
    const { wpm, accuracy } = untrustedData?.state || {};

    if (buttonIndex === 1) {
      // Start typing test
      return new Response(JSON.stringify({
        image: `${process.env.VERCEL_URL}/api/og?state=typing`,
        buttons: [{ label: 'Submit Test', action: 'post' }],
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (buttonIndex === 2) {
      // Challenge a friend
      return new Response(JSON.stringify({
        image: `${process.env.VERCEL_URL}/api/og?state=challenge&wpm=${wpm}&accuracy=${accuracy}`,
        buttons: [
          { label: 'Accept Challenge', action: 'post' },
          { label: 'Try Test', action: 'post' }
        ],
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Default response
    return new Response(JSON.stringify({
      image: `${process.env.VERCEL_URL}/api/og`,
      buttons: [{ label: 'Try Again', action: 'post' }],
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}