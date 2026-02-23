"use client"

import { useState, useEffect, useRef } from "react"

export function useTypewriter(text: string, speed = 35) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)
  const prevText = useRef("")

  useEffect(() => {
    if (!text) {
      setDisplayed("")
      setDone(true)
      return
    }

    // Reset when text changes
    if (text !== prevText.current) {
      prevText.current = text
      setDisplayed("")
      setDone(false)
    }

    let i = 0
    setDisplayed("")
    setDone(false)

    const interval = setInterval(() => {
      i++
      if (i <= text.length) {
        setDisplayed(text.slice(0, i))
      } else {
        setDone(true)
        clearInterval(interval)
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return { displayed, done }
}
