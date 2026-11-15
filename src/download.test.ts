import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadTextFile } from './download'

describe('downloadTextFile', () => {
  const originalCreate = URL.createObjectURL
  const originalRevoke = URL.revokeObjectURL

  afterEach(() => {
    URL.createObjectURL = originalCreate
    URL.revokeObjectURL = originalRevoke
  })

  it('clica num link temporário com o nome do arquivo e libera a URL depois', () => {
    URL.createObjectURL = vi.fn(() => 'blob:trocado')
    URL.revokeObjectURL = vi.fn()
    const clicked: HTMLAnchorElement[] = []
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this)
    })

    downloadTextFile('dados.csv', 'a;b')

    expect(clicked).toHaveLength(1)
    expect(clicked[0].download).toBe('dados.csv')
    expect(clicked[0].href).toBe('blob:trocado')
    expect(document.querySelector('a')).toBeNull()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:trocado')
  })
})
