export function renderEmailTemplate(otp: string): string {
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Verify your email</title>
        <style>
          body { font-family: Inter, system-ui, -apple-system, sans-serif; color: #111827; padding: 24px; }
          .code { font-size: 18px; font-weight: 700; background: #f3f4f6; padding: 8px; border-radius: 6px; display: inline-block; }
        </style>
      </head>
      <body>
        <h1>Verify your email</h1>
        <p>Your verification code:</p>
        <div class="code">${otp}</div>
        <p>If you didn't request this, you can ignore this email.</p>
      </body>
    </html>
  `.trim();
}
