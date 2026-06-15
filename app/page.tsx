import Home from "./Component/Home";

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Focusly",
    "description": "A smart study timer and Pomodoro app designed for students to boost productivity and track study sessions with beautiful distraction-free dashboard",
    "url": "https://focusly.app",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "author": {
      "@type": "Person",
      "name": "Shubh",
    },
    "creator": {
      "@type": "Person",
      "name": "Shubh",
    },
    "featureList": [
      "Study Timer",
      "Pomodoro Technique",
      "Study Streak Tracking",
      "Focus Dashboard",
      "Subject Monitoring",
      "Distraction-Free Interface",
      "Ambient Sounds",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Home />
    </>
  );
}

