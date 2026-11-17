import { useEffect, useRef, useState } from 'react'

const MIN_WIDTH = 280

/**
 * Largura real do contêiner do gráfico, para desenhar o SVG no tamanho em que
 * ele aparece (o texto dos eixos não encolhe em telas pequenas).
 */
export function useChartWidth(defaultWidth = 640) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(defaultWidth)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(MIN_WIDTH, Math.round(entry.contentRect.width)))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}
