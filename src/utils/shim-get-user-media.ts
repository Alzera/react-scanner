// @ts-ignore
import { detectBrowser } from "webrtc-adapter/dist/utils";

const shimGetUserMedia = (() => {
  let called = false;
  return async () => {
    if (called) {
      return;
    }

    const browserDetails = detectBrowser(window);

    switch (browserDetails.browser) {
      case "chrome":
        (
          // @ts-ignore
          await import("webrtc-adapter/dist/chrome/getusermedia")
        ).shimGetUserMedia(window, browserDetails);
        break;
      case "firefox":
        (
          // @ts-ignore
          await import("webrtc-adapter/dist/firefox/getusermedia")
        ).shimGetUserMedia(window, browserDetails);
        break;
      case "safari":
        (
          // @ts-ignore
          await import("webrtc-adapter/dist/safari/safari_shim")
        ).shimGetUserMedia(window);
        break;
      default:
        break;
    }
    called = true;
  };
})();

export default shimGetUserMedia;