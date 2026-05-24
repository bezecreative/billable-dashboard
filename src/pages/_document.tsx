import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0A0B0D" />
        <meta name="description" content="Team Billable Hours Dashboard — ClickUp powered" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
