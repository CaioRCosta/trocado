import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

function setup() {
  const onClose = vi.fn()
  render(
    <Modal label="Nova transação" onClose={onClose}>
      <p>Conteúdo da janela</p>
    </Modal>,
  )
  return { onClose, user: userEvent.setup() }
}

describe('Modal', () => {
  it('mostra o conteúdo numa janela identificada pelo rótulo', () => {
    setup()

    expect(screen.getByRole('dialog', { name: 'Nova transação' })).toHaveTextContent('Conteúdo da janela')
  })

  it('fecha com a tecla Esc', async () => {
    const { onClose, user } = setup()

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalled()
  })

  it('fecha pelo botão de fechar', async () => {
    const { onClose, user } = setup()

    await user.click(screen.getByRole('button', { name: 'Fechar' }))

    expect(onClose).toHaveBeenCalled()
  })

  it('fecha ao clicar fora da janela, mas não ao clicar dentro', async () => {
    const { onClose, user } = setup()

    await user.click(screen.getByText('Conteúdo da janela'))
    expect(onClose).not.toHaveBeenCalled()

    await user.click(screen.getByRole('dialog').parentElement as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('devolve o foco ao botão que abriu a janela', async () => {
    function Opener() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Abrir</button>
          {open && (
            <Modal label="Janela" onClose={() => setOpen(false)}>
              <input aria-label="Campo" autoFocus />
            </Modal>
          )}
        </>
      )
    }
    const user = userEvent.setup()
    render(<Opener />)

    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus()
  })
})
