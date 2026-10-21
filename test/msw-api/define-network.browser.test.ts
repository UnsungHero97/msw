import { onTestFinished, test, vi } from 'vitest'
import { http, HttpResponse } from 'msw/http'
import { createDefaultNetworkOptions } from 'msw/browser'
import { defineNetwork, NetworkReadyState } from 'msw/experimental'

test('intercepts requests when the "useServiceWorker" option is false', async () => {
  const registerSpy = vi.spyOn(navigator.serviceWorker, 'register')
  vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {})
  vi.spyOn(console, 'log').mockImplementation(() => {})
  onTestFinished(() => {
    vi.restoreAllMocks()
  })

  const network = defineNetwork(
    createDefaultNetworkOptions('/mockServiceWorker.js', {
      useServiceWorker: false,
    }),
  )

  onTestFinished(async () => {
    if (network.readyState === NetworkReadyState.ENABLED) {
      await network.disable()
    }
  })

  network.configure({
    handlers: [
      http.get('/mswjs/msw/issues/2820', () => {
        return HttpResponse.text('msw issue 2820')
      }),
    ],
  })

  await network.enable()
  const response = await fetch('/mswjs/msw/issues/2820')

  expect.soft(registerSpy).not.toHaveBeenCalled()
  await expect(response.text()).resolves.toBe('msw issue 2820')
})
