// This is a .ts file as we are exporting an object, not a function

// used to track analytics events as they are outside of React
// and the browser url
export const analyticsContext = {
  page: "home",
  triggerPageView(page: string) {
    // store the page in case the sa_pageview function isn't ready yet
    console.log("Triggering page view for", page);
    this.page = page;
    if ("sa_pageview" in window && typeof window.sa_pageview === "function") {
      window.sa_pageview(page);
    } else {
      console.warn("sa_pageview function not available yet");
    }
  },
};
