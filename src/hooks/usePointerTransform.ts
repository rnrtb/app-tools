import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import type { TransformState } from '../types/stamp'
import { createCenterTransform, createFitTransform } from '../lib/image/fit'

interface UsePointerTransformOptions {
  canvasWidth: number
  canvasHeight: number
  imageWidth: number
  imageHeight: number
  safeMargin: number
  initial: TransformState
  minScale?: number
  maxScale?: number
}

function distance(a: PointerEvent, b: PointerEvent) {
  const dx = a.clientX - b.clientX
  const dy = a.clientY - b.clientY
  return Math.hypot(dx, dy)
}

function midpoint(a: PointerEvent, b: PointerEvent) {
  return {
    x: (a.clientX + b.clientX) / 2,
    y: (a.clientY + b.clientY) / 2,
  }
}

export function usePointerTransform(options: UsePointerTransformOptions) {
  const {
    canvasWidth,
    canvasHeight,
    imageWidth,
    imageHeight,
    safeMargin,
    initial,
    minScale = 0.05,
    maxScale = 8,
  } = options

  const [transform, setTransform] = useState<TransformState>(initial)
  const transformRef = useRef(transform)

  const pointers = useRef(new Map<number, PointerEvent>())
  const dragOrigin = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null)
  const pinchOrigin = useRef<{
    distance: number
    scale: number
    offsetX: number
    offsetY: number
    midX: number
    midY: number
    rectLeft: number
    rectTop: number
    displayScaleX: number
    displayScaleY: number
  } | null>(null)

  useEffect(() => {
    transformRef.current = transform
  }, [transform])

  const clampScale = useCallback(
    (scale: number) => Math.min(maxScale, Math.max(minScale, scale)),
    [maxScale, minScale],
  )

  const applyScaleAtPoint = useCallback(
    (
      current: TransformState,
      nextScale: number,
      pointX: number,
      pointY: number,
    ): TransformState => {
      const scale = clampScale(nextScale)
      const ratio = scale / current.scale
      return {
        scale,
        offsetX: pointX - (pointX - current.offsetX) * ratio,
        offsetY: pointY - (pointY - current.offsetY) * ratio,
      }
    },
    [clampScale],
  )

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, event.nativeEvent)

    if (pointers.current.size === 1) {
      dragOrigin.current = {
        x: event.clientX,
        y: event.clientY,
        offsetX: transformRef.current.offsetX,
        offsetY: transformRef.current.offsetY,
      }
      pinchOrigin.current = null
    } else if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values())
      if (!a || !b) return
      const rect = target.getBoundingClientRect()
      const mid = midpoint(a, b)
      pinchOrigin.current = {
        distance: distance(a, b) || 1,
        scale: transformRef.current.scale,
        offsetX: transformRef.current.offsetX,
        offsetY: transformRef.current.offsetY,
        midX: mid.x,
        midY: mid.y,
        rectLeft: rect.left,
        rectTop: rect.top,
        displayScaleX: canvasWidth / rect.width,
        displayScaleY: canvasHeight / rect.height,
      }
      dragOrigin.current = null
    }
  }, [canvasWidth, canvasHeight])

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!pointers.current.has(event.pointerId)) return
      pointers.current.set(event.pointerId, event.nativeEvent)

      if (pointers.current.size === 2 && pinchOrigin.current) {
        event.preventDefault()
        const [a, b] = Array.from(pointers.current.values())
        if (!a || !b) return
        const origin = pinchOrigin.current
        const nextDist = distance(a, b) || 1
        const mid = midpoint(a, b)
        const scaleFactor = nextDist / origin.distance
        const pointX = (mid.x - origin.rectLeft) * origin.displayScaleX
        const pointY = (mid.y - origin.rectTop) * origin.displayScaleY
        const base: TransformState = {
          scale: origin.scale,
          offsetX: origin.offsetX + (mid.x - origin.midX) * origin.displayScaleX,
          offsetY: origin.offsetY + (mid.y - origin.midY) * origin.displayScaleY,
        }
        const next = applyScaleAtPoint(base, origin.scale * scaleFactor, pointX, pointY)
        setTransform(next)
        return
      }

      if (pointers.current.size === 1 && dragOrigin.current) {
        const target = event.currentTarget
        const rect = target.getBoundingClientRect()
        const displayScaleX = canvasWidth / rect.width
        const displayScaleY = canvasHeight / rect.height
        const dx = (event.clientX - dragOrigin.current.x) * displayScaleX
        const dy = (event.clientY - dragOrigin.current.y) * displayScaleY
        setTransform({
          ...transformRef.current,
          offsetX: dragOrigin.current.offsetX + dx,
          offsetY: dragOrigin.current.offsetY + dy,
        })
      }
    },
    [applyScaleAtPoint, canvasWidth, canvasHeight],
  )

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    pointers.current.delete(event.pointerId)
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // ignore
    }

    if (pointers.current.size < 2) {
      pinchOrigin.current = null
    }
    if (pointers.current.size === 1) {
      const remaining = Array.from(pointers.current.values())[0]
      if (remaining) {
        dragOrigin.current = {
          x: remaining.clientX,
          y: remaining.clientY,
          offsetX: transformRef.current.offsetX,
          offsetY: transformRef.current.offsetY,
        }
      }
    }
    if (pointers.current.size === 0) {
      dragOrigin.current = null
    }
  }, [])

  const onWheel = useCallback(
    (event: ReactWheelEvent<HTMLElement>) => {
      event.preventDefault()
      const rect = event.currentTarget.getBoundingClientRect()
      const displayScaleX = canvasWidth / rect.width
      const displayScaleY = canvasHeight / rect.height
      const pointX = (event.clientX - rect.left) * displayScaleX
      const pointY = (event.clientY - rect.top) * displayScaleY
      const factor = event.deltaY > 0 ? 0.9 : 1.1
      setTransform((current) => applyScaleAtPoint(current, current.scale * factor, pointX, pointY))
    },
    [applyScaleAtPoint, canvasWidth, canvasHeight],
  )

  const fit = useCallback(() => {
    setTransform(
      createFitTransform(imageWidth, imageHeight, { width: canvasWidth, height: canvasHeight }, safeMargin),
    )
  }, [imageWidth, imageHeight, canvasWidth, canvasHeight, safeMargin])

  const center = useCallback(() => {
    setTransform((current) =>
      createCenterTransform(imageWidth, imageHeight, { width: canvasWidth, height: canvasHeight }, current.scale),
    )
  }, [imageWidth, imageHeight, canvasWidth, canvasHeight])

  const setScale = useCallback(
    (scale: number) => {
      setTransform((current) => {
        const cx = canvasWidth / 2
        const cy = canvasHeight / 2
        return applyScaleAtPoint(current, scale, cx, cy)
      })
    },
    [applyScaleAtPoint, canvasWidth, canvasHeight],
  )

  const reset = useCallback((next: TransformState) => {
    setTransform(next)
  }, [])

  return {
    transform,
    setTransform,
    fit,
    center,
    setScale,
    reset,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onWheel,
    },
  }
}
