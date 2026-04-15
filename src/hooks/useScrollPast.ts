import { useState, useEffect } from 'react'

export function useScrollPast(threshold: number): boolean {
  const [past, setPast] = useState<boolean>(false)

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY >= threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return past
}
