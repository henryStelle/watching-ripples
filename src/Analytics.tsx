import { analyticsContext } from "./analyticsContext";

const src = import.meta.env.PROD
  ? "https://scripts.simpleanalyticscdn.com/latest.js"
  : "https://scripts.simpleanalyticscdn.com/latest.dev.js";

const hostname = import.meta.env.DEV ? "henrystelle.github.io" : undefined;

const saLoad = () => analyticsContext.triggerPageView(analyticsContext.page);

export default function Analytics() {
  return (
    <script
      async
      onLoad={saLoad}
      // disable auto-collection of pageviews as the page isn't tracked in the url
      data-auto-collect="false"
      // try and support getting events while on localhost (not working for me)
      data-hostname={hostname}
      src={src}
    ></script>
  );
}
