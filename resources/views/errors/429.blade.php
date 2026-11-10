<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Too Many Requests — Bloom &amp; Glow</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f1f5f9;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #1a1a2e;
        }
        .card {
            background: white;
            border-radius: 24px;
            padding: 3rem;
            max-width: 480px;
            width: 90%;
            text-align: center;
            box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        p { color: #666; line-height: 1.6; margin-bottom: 1.5rem; }
        .retry { font-size: 0.85rem; color: #999; }
        a {
            display: inline-block;
            margin-top: 1.5rem;
            padding: 0.75rem 2rem;
            background: #1e293b;
            color: white;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: opacity 0.2s;
        }
        a:hover { opacity: 0.85; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Slow down a little!</h1>
        <p>You're sending too many requests too quickly. Please wait a moment before trying again.</p>
        @if(!empty($retryAfter))
            <p class="retry">Please wait {{ $retryAfter }} second(s) before retrying.</p>
        @endif
        <a href="/">Back to Home</a>
    </div>
</body>
</html>
