/**
 * Utility to dynamically load Korapay Checkout Inline JS SDK.
 */

const KORAPAY_SCRIPT_URLS = [
  "https://korablobstorage.blob.core.windows.net/modal-bucket/korapay-collections.min.js",
  "https://checkout.korapay.com/v1/inline.js",
];

export function getKorapayInstance(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).Korapay && typeof (window as any).Korapay.initialize === "function") {
      return resolve((window as any).Korapay);
    }

    let attemptedIndex = 0;

    function tryLoadNextScript() {
      if (attemptedIndex >= KORAPAY_SCRIPT_URLS.length) {
        return reject(new Error("Unable to load Korapay Payment Gateway SDK. Please check your internet connection."));
      }

      const scriptUrl = KORAPAY_SCRIPT_URLS[attemptedIndex++];

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
