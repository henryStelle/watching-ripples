import { useEffect } from "react";
import { analyticsContext } from "./analyticsContext";

const src = import.meta.env.PROD
  ? "https://scripts.simpleanalyticscdn.com/latest.js"
  : "https://scripts.simpleanalyticscdn.com/latest.dev.js";

const hostname = import.meta.env.DEV ? "henrystelle.github.io" : undefined;

const saLoad = () => analyticsContext.triggerPageView(analyticsContext.page);

export default function Analytics() {
  // add script to the head tag (if added to body, it doesn't work)
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.onload = saLoad;
    script.setAttribute("data-auto-collect", "false");
    if (hostname) {
      script.setAttribute("data-hostname", hostname);
    }
    script.src = src;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
