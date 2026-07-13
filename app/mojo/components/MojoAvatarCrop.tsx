'use client'

import { useEffect, useRef, useState } from 'react'

type Rect = { x: number; y: number; w: number; h: number }
type Corner = 'tl' | 'tr' | 'bl' | 'br'
type ExpiryOption = 'never' | '1year' | 'custom'
type CropMeta = { title: string; expiresAt: string | null }

const HANDLE_SIZE = 8
const HANDLE_HIT_RADIUS = 10
const MIN_SELECTION = 20
const MAX_CANVAS_W = 400
const MAX_CANVAS_H = 300

const RATIO_PRESETS: { key: string; label: string; ratio: number | null }[] = [
  { key: 'free', label: 'Free', ratio: null },
  { key: '1:1', label: '1:1', ratio: 1 },
  { key: '2:3', label: '2:3', ratio: 2 / 3 },
  { key: '3:4', label: '3:4', ratio: 3 / 4 },
]

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  background: 'var(--raised)',
  color: 'var(--roseash)',
  border: '1px solid var(--elevated)',
  borderRadius: 2,
  fontFamily: 'var(--f-body)',
  fontSize: '0.8125rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--f-ui)',
  fontSize: '0.65rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--faded)',
  marginBottom: 4,
}

function computeExpiryIso(option: ExpiryOption, customDate: string): string | null {
  if (option === 'never') return null
  if (option === '1year') {
    const d = new Date()
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString()
  }
  if (customDate) return new Date(customDate).toISOString()
  return null
}

function clampRect(r: Rect, cw: number, ch: number): Rect {
  const w = Math.min(r.w, cw)
  const h = Math.min(r.h, ch)
  const x = Math.max(0, Math.min(r.x, cw - w))
  const y = Math.max(0, Math.min(r.y, ch - h))
  return { x, y, w, h }
}

function applyRatio(r: Rect, ratio: number | null, cw: number, ch: number): Rect {
  if (!ratio) return r
  const cx = r.x + r.w / 2
  const cy = r.y + r.h / 2
  const h = r.w / ratio
  return clampRect({ x: cx - r.w / 2, y: cy - h / 2, w: r.w, h }, cw, ch)
}

function oppositeCorner(corner: Corner, r: Rect): { x: number; y: number } {
  if (corner === 'tl') return { x: r.x + r.w, y: r.y + r.h }
  if (corner === 'tr') return { x: r.x, y: r.y + r.h }
  if (corner === 'bl') return { x: r.x + r.w, y: r.y }
  return { x: r.x, y: r.y }
}

function rectFromDrag(
  fixed: { x: number; y: number },
  pointer: { x: number; y: number },
  ratio: number | null,
  cw: number,
  ch: number
): Rect {
  const px = Math.max(0, Math.min(pointer.x, cw))
  const py = Math.max(0, Math.min(pointer.y, ch))
  const w = Math.max(Math.abs(px - fixed.x), MIN_SELECTION)
  let h = Math.max(Math.abs(py - fixed.y), MIN_SELECTION)
  if (ratio) h = w / ratio
  const dirX = px >= fixed.x ? 1 : -1
  const dirY = py >= fixed.y ? 1 : -1
  const x = dirX === 1 ? fixed.x : fixed.x - w
  const y = dirY === 1 ? fixed.y : fixed.y - h
  return clampRect({ x, y, w, h }, cw, ch)
}

function hitTestCorner(pos: { x: number; y: number }, r: Rect): Corner | null {
  const corners: { key: Corner; x: number; y: number }[] = [
    { key: 'tl', x: r.x, y: r.y },
    { key: 'tr', x: r.x + r.w, y: r.y },
    { key: 'bl', x: r.x, y: r.y + r.h },
    { key: 'br', x: r.x + r.w, y: r.y + r.h },
  ]
  for (const c of corners) {
    if (Math.abs(pos.x - c.x) <= HANDLE_HIT_RADIUS && Math.abs(pos.y - c.y) <= HANDLE_HIT_RADIUS) {
      return c.key
    }
  }
  return null
}

function isInsideRect(pos: { x: number; y: number }, r: Rect): boolean {
  return pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h
}

export default function MojoAvatarCrop({
  file,
  onCrop,
  onSkip,
}: {
  file: File
  onCrop: (blob: Blob, meta: CropMeta) => void
  onSkip: (blob: Blob, meta: CropMeta) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const dragRef = useRef<
    | { mode: 'resize'; corner: Corner; fixed: { x: number; y: number } }
    | { mode: 'move'; offset: { x: number; y: number } }
    | null
  >(null)

  const [loaded, setLoaded] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ w: MAX_CANVAS_W, h: MAX_CANVAS_H })
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 })
  const [ratioKey, setRatioKey] = useState('free')
  const [title, setTitle] = useState(() => file.name.replace(/\.[^.]+$/, ''))
  const [expiryOption, setExpiryOption] = useState<ExpiryOption>('never')
  const [customDate, setCustomDate] = useState('')

  useEffect(() => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(MAX_CANVAS_W / img.naturalWidth, MAX_CANVAS_H / img.naturalHeight, 1)
      const cw = Math.round(img.naturalWidth * scale)
      const ch = Math.round(img.naturalHeight * scale)
      imgRef.current = img
      setCanvasSize({ w: cw, h: ch })
      const w = cw * 0.6
      const h = ch * 0.6
      setRect({ x: (cw - w) / 2, y: (ch - h) / 2, w, h })
      setLoaded(true)
    }
    img.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !loaded) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { w: cw, h: ch } = canvasSize

    ctx.clearRect(0, 0, cw, ch)
    ctx.drawImage(img, 0, 0, cw, ch)

    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 0, cw, rect.y)
    ctx.fillRect(0, rect.y + rect.h, cw, ch - (rect.y + rect.h))
    ctx.fillRect(0, rect.y, rect.x, rect.h)
    ctx.fillRect(rect.x + rect.w, rect.y, cw - (rect.x + rect.w), rect.h)

    ctx.strokeStyle = '#a02840'
    ctx.lineWidth = 2
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h)

    ctx.fillStyle = '#a02840'
    const hs = HANDLE_SIZE / 2
    const corners = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.w, y: rect.y },
      { x: rect.x, y: rect.y + rect.h },
      { x: rect.x + rect.w, y: rect.y + rect.h },
    ]
    for (const c of corners) {
      ctx.fillRect(c.x - hs, c.y - hs, HANDLE_SIZE, HANDLE_SIZE)
    }
  }, [rect, canvasSize, loaded])

  function getPointerPos(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const canvas = canvasRef.current!
    const bounds = canvas.getBoundingClientRect()
    const point = 'touches' in e ? e.touches[0] ?? e.changedTouches[0] : e
    return { x: point.clientX - bounds.left, y: point.clientY - bounds.top }
  }

  function handlePointerDown(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    const pos = getPointerPos(e)
    const corner = hitTestCorner(pos, rect)
    if (corner) {
      dragRef.current = { mode: 'resize', corner, fixed: oppositeCorner(corner, rect) }
    } else if (isInsideRect(pos, rect)) {
      dragRef.current = { mode: 'move', offset: { x: pos.x - rect.x, y: pos.y - rect.y } }
    }
  }

  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
    const drag = dragRef.current
    if (!drag) return
    e.preventDefault()
    const pos = getPointerPos(e)
    const ratio = RATIO_PRESETS.find((p) => p.key === ratioKey)?.ratio ?? null

    if (drag.mode === 'resize') {
      setRect(rectFromDrag(drag.fixed, pos, ratio, canvasSize.w, canvasSize.h))
    } else {
      const x = Math.max(0, Math.min(pos.x - drag.offset.x, canvasSize.w - rect.w))
      const y = Math.max(0, Math.min(pos.y - drag.offset.y, canvasSize.h - rect.h))
      setRect((r) => ({ ...r, x, y }))
    }
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  function selectRatio(key: string) {
    setRatioKey(key)
    const ratio = RATIO_PRESETS.find((p) => p.key === key)?.ratio ?? null
    setRect((r) => applyRatio(r, ratio, canvasSize.w, canvasSize.h))
  }

  function buildMeta(): CropMeta {
    return { title: title.trim(), expiresAt: computeExpiryIso(expiryOption, customDate) }
  }

  function handleCropAndUpload() {
    const img = imgRef.current
    if (!img) return
    const scaleX = img.naturalWidth / canvasSize.w
    const scaleY = img.naturalHeight / canvasSize.h
    const srcX = rect.x * scaleX
    const srcY = rect.y * scaleY
    const srcW = rect.w * scaleX
    const srcH = rect.h * scaleY

    const off = document.createElement('canvas')
    off.width = Math.max(1, Math.round(srcW))
    off.height = Math.max(1, Math.round(srcH))
    const ctx = off.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, off.width, off.height)

    off.toBlob((blob) => {
      if (blob) onCrop(blob, buildMeta())
    }, 'image/png')
  }

  function handleSkip() {
    onSkip(new Blob([file], { type: file.type }), buildMeta())
  }

  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      <div style={{ flex: '0 0 auto' }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          style={{ display: 'block', touchAction: 'none', cursor: 'crosshair', background: 'var(--char)' }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>

      <div style={{ flex: '1 1 220px', minWidth: 200, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={LABEL_STYLE}>Aspect Ratio</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {RATIO_PRESETS.map((p) => {
              const isActive = p.key === ratioKey
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => selectRatio(p.key)}
                  style={{
                    background: isActive ? 'var(--ember)' : 'var(--raised)',
                    color: isActive ? 'var(--roseash)' : 'var(--faded)',
                    border: 'none',
                    borderRadius: 2,
                    padding: '4px 10px',
                    fontFamily: 'var(--f-ui)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label style={LABEL_STYLE}>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={INPUT_STYLE} />
        </div>

        <div>
          <label style={LABEL_STYLE}>Link expires</label>
          <select
            value={expiryOption}
            onChange={(e) => setExpiryOption(e.target.value as ExpiryOption)}
            style={INPUT_STYLE}
          >
            <option value="never">Never</option>
            <option value="1year">1 year</option>
            <option value="custom">Custom date</option>
          </select>
          {expiryOption === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              style={{ ...INPUT_STYLE, marginTop: 8 }}
            />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          <button
            type="button"
            onClick={handleCropAndUpload}
            disabled={!title.trim()}
            style={{
              background: 'var(--ember)',
              color: 'var(--roseash)',
              border: 'none',
              borderRadius: 2,
              padding: '8px 16px',
              fontFamily: 'var(--f-ui)',
              fontSize: '0.8125rem',
              cursor: title.trim() ? 'pointer' : 'not-allowed',
              opacity: title.trim() ? 1 : 0.6,
            }}
          >
            Crop &amp; Upload
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={!title.trim()}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--faded)',
              fontFamily: 'var(--f-body)',
              fontSize: '0.8125rem',
              cursor: title.trim() ? 'pointer' : 'not-allowed',
              textAlign: 'left',
              padding: 0,
            }}
          >
            Skip crop — use original
          </button>
        </div>
      </div>
    </div>
  )
}
