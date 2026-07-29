import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

// The site itself is 100% static and lives in /public so it can be dropped
// straight onto GitHub Pages. This route only forwards the Lovable preview
// to that static entry point.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Happy Birthday, Modak — A Story Written in Memories" },
      {
        name: "description",
        content:
          "A cinematic birthday journey for Modak: our story, a memory gallery, a letter, a heart game, a gift and ten little doors.",
      },
      { property: "og:title", content: "Happy Birthday, Modak" },
      {
        property: "og:description",
        content: "A cinematic birthday journey made with love and all my heart.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/index.html");
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#070512" }}>
      <noscript>
        <a href="/index.html" style={{ color: "#f6cd94" }}>
          Open the birthday site
        </a>
      </noscript>
    </div>
  );
}
