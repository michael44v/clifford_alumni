/**
 * Utility to dynamically load Korapay Checkout Inline JS SDK if not already loaded.
 */

const KORAPAY_SCRIPT_URLS = [
  "https://koraredirect.com/korapay/v1/inline.js",
  "https://korapay.com/korapay/v1/inline.js",
  "https://korabounty.com/korapay/v1/inline.js",
];

export function getKorapayInstance(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).Korapay && typeof (window as any).Korapay.initialize === "function") {
      return resolve((window as any).Korapay);
    }

    let attemptedIndex = 0;

    function tryLoadNextScript() {
      if (attemptedIndex >= KORAPAY_SCRIPT_URLS.length) {
        return reject(new Error("Unable to load Korapay Checkout SDK. Please check internet connection or script blocking."));
      }

      const scriptUrl = KORAPAY_SCRIPT_URLS[attemptedIndex++];

      // Check if script element already exists
      const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;

      script.onload = () => {
        if ((window as any).Korapay && typeof (window as any).Korapay.initialize === "function") {
          resolve((window as any).Korapay);
        } else {
          tryLoadNextScript();
        }
      };

      script.onerror = () => {
        tryLoadNextScript();
      };

      document.head.appendChild(script);
    }

    tryLoadNextScript();
  });
}
