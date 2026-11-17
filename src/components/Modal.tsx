import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'

interface Props {
  label: string
  onClose: () => void
  children: ReactNode
}

/**
 * Janela sobreposta à página. Fecha com Esc, com o botão de fechar ou com um
 * clique fora dela, e devolve o foco para onde ele estava ao abrir.
 */
export function Modal({ label, onClose, children }: Props) {
  const onCloseRef = useRef(onClose)
  // Guardado na primeira renderização: o conteúdo pode mover o foco antes dos efeitos rodarem.
  const [previouslyFocused] = useState(() => document.activeElement as HTMLElement | null)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [previouslyFocused])

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropMouseDown}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={label}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
