/**
 * @see https://github.com/mswjs/msw/issues/2820
 */

import { http, HttpResponse } from 'msw/http'
import { network } from 'virtual:msw'

afterAll(async () => {
  await network.disable()
})

test('msw issue 2820', async () => {
  const groupCollapsed = vi.spyOn(console, 'groupCollapsed')
  network.configure({
    handlers: [
      http.get('/mswjs/msw/issues/2820', () => {
        return HttpResponse.text('msw issue 2820')
      }),
    ],
  })
  await network.enable()
  expect(groupCollapsed).toHaveBeenCalledWith(
    expect.stringContaining('Mocking enabled (fallback mode).'),
    expect.any(String),
  )
  const response = await fetch('/mswjs/msw/issues/2820')
  await expect(response.text()).resolves.toBe('msw issue 2820')
})
