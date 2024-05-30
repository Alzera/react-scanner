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

export const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))