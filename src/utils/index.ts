export const eventOn = (
  eventTarget: EventTarget,
  successEvent: string,
  errorEvent = 'error'
): Promise<Event> => {
  let $resolve: (value: Event) => void
  let $reject: (reason?: Event) => void

  return new Promise<Event>((resolve, reject) => {
    $resolve = resolve
    $reject = reject

    eventTarget.addEventListener(successEvent, $resolve)
    eventTarget.addEventListener(errorEvent, $reject)
  }).finally(() => {
    eventTarget.removeEventListener(successEvent, $resolve)
    eventTarget.removeEventListener(errorEvent, $reject)
  })
}

export const timeout = (milliseconds: number) => {
  return new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, milliseconds))
}

export const videoReady = (preview: HTMLVideoElement, delay: number) => {
  return new Promise((resolve) => {
    const check = () => {
      if (preview.readyState === preview.HAVE_ENOUGH_DATA) {
        resolve(0)
      } else setTimeout(check, delay)
    }
    setTimeout(check, delay)
  })
}