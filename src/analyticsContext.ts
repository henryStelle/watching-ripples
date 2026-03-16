// This is a .ts file as we are exporting an object, not a function

// used to track analytics events as they are outside of React
// and the browser url
export const analyticsContext = {
  page: "home",
  triggerPageView(page: string) {
    // the given names are rejected as they are not path-like, so convert them to something that SA will accept
    const sanitizedPage = page.toLowerCase().replace(/\s+/g, "-");
    const pathLike = `/${sanitizedPage}`;
    try {
      // store the page in case the sa_pageview function isn't ready yet
      this.page = pathLike;
      if ("sa_pageview" in window && typeof window.sa_pageview === "function") {
        window.sa_pageview(pathLike);
      }
    } catch (err) {
      console.error("Error triggering page view:", err);
    }
  },
};
