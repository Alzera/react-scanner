// @ts-ignore
import { shimGetUserMedia as chromeShim } from 'webrtc-adapter/dist/chrome/getusermedia'
// @ts-ignore
import { shimGetUserMedia as firefoxShim } from 'webrtc-adapter/dist/firefox/getusermedia'
// @ts-ignore
import { shimGetUserMedia as safariShim } from 'webrtc-adapter/dist/safari/safari_shim'
// @ts-ignore
import { detectBrowser } from 'webrtc-adapter/dist/utils'

export default function shimGetUserMedia() {
  const browserDetails = detectBrowser(window)
  switch (browserDetails.browser) {
    case 'chrome':
      chromeShim(window, browserDetails)
      break
    case 'firefox':
      firefoxShim(window, browserDetails)
      break
    case 'safari':
      safariShim(window, browserDetails)
      break
  }
}