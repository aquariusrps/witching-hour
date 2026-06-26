'use client'

import { useEffect, useRef } from 'react'

const CANDLE_DATA = [
  { w:14, h:48, dripL:{l:2,t:8,w:3,h:14},  dripR:{l:10,t:18,w:4,h:10}, fo:'f1o 2.3s', fm:'f1m 1.8s', fc:'f1c 1.4s', fg:'fg1 2.3s', delay:0   },
  { w:18, h:70, dripL:{l:3,t:10,w:4,h:20}, dripR:{l:11,t:6,w:3,h:12},  fo:'f2o 2.8s', fm:'f2m 2.1s', fc:'f2c 1.6s', fg:'fg2 2.8s', delay:300 },
  { w:16, h:55, dripL:{l:2,t:6,w:3,h:16},  dripR:{l:11,t:14,w:4,h:9},  fo:'f3o 2.1s', fm:'f3m 1.9s', fc:'f3c 1.5s', fg:'fg3 2.1s', delay:180 },
  { w:22, h:82, dripL:{l:4,t:12,w:5,h:24}, dripR:{l:15,t:8,w:4,h:16},  fo:'f1o 3.2s', fm:'f1m 2.4s', fc:'f1c 1.9s', fg:'fg1 3.2s', delay:500 },
  { w:16, h:58, dripL:{l:2,t:8,w:3,h:18},  dripR:{l:11,t:16,w:4,h:11}, fo:'f4o 2.5s', fm:'f2m 2.0s', fc:'f2c 1.7s', fg:'fg2 2.5s', delay:80  },
  { w:14, h:44, dripL:{l:2,t:6,w:3,h:12},  dripR:{l:9,t:10,w:3,h:8},   fo:'f2o 1.9s', fm:'f3m 1.6s', fc:'f3c 1.3s', fg:'fg3 1.9s', delay:420 },
  { w:18, h:65, dripL:{l:3,t:10,w:4,h:18}, dripR:{l:12,t:5,w:3,h:14},  fo:'f3o 2.6s', fm:'f1m 2.2s', fc:'f1c 1.8s', fg:'fg1 2.6s', delay:240 },
]

// Staggered pulse durations — each candle breathes at its own rhythm
const PULSE_DURATIONS = ['3.1s','4.4s','2.8s','5.2s','3.7s','4.1s','2.5s']
const PULSE_DELAYS    = ['0s','1.3s','0.7s','2.1s','0.4s','1.8s','0.9s']

const BASE_CSS = `
  .twh-candles {
    display:flex;align-items:flex-end;justify-content:center;
    gap:clamp(8px,2vw,20px);
  }
  .twh-candle { display:flex;flex-direction:column;align-items:center;position:relative; }
  .twh-flame-wrap { position:relative;display:flex;align-items:flex-end;justify-content:center;margin-bottom:-2px; }
  .twh-fo { position:absolute;bottom:0;border-radius:50% 50% 30% 30%;filter:blur(2px);transform-origin:bottom center;
    background:radial-gradient(ellipse 60% 80% at 50% 90%,rgba(200,56,24,0.9) 0%,rgba(200,56,24,0.4) 50%,transparent 100%); }
  .twh-fm { position:absolute;bottom:2px;border-radius:50% 50% 30% 30%;transform-origin:bottom center;
    background:radial-gradient(ellipse 60% 80% at 50% 90%,rgba(240,140,20,0.95) 0%,rgba(220,90,20,0.6) 60%,transparent 100%); }
  .twh-fc { position:absolute;bottom:3px;border-radius:50% 50% 30% 30%;transform-origin:bottom center;
    background:radial-gradient(ellipse 60% 80% at 50% 80%,rgba(255,240,180,1) 0%,rgba(255,200,80,0.8) 60%,transparent 100%); }
  .twh-fg { position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);filter:blur(4px);
    background:radial-gradient(ellipse,rgba(200,56,24,0.35) 0%,transparent 70%);height:20px; }

  /* Default (dark claret) candle body */
  .twh-body {
    position:relative;border-radius:1px 1px 0 0;
    background:linear-gradient(to right,#1a0c0c 0%,#2a1010 15%,#3a1818 35%,#2e1414 65%,#1e0c0c 85%,#120808 100%);
  }
  .twh-drip { position:absolute;background:linear-gradient(to bottom,#3a1818,#2a1212);border-radius:0 0 4px 4px;opacity:0.9; }
  .twh-holder { height:6px;background:linear-gradient(to bottom,#4a2828,#2a1414);border-radius:0 0 3px 3px;box-shadow:0 2px 4px rgba(0,0,0,0.5); }
  .twh-base   { height:4px;background:linear-gradient(to bottom,#3a2020,#1a0c0c);border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.6); }

  /* Cream variant */
  .twh-body-cream {
    position:relative;border-radius:1px 1px 0 0;
    background:linear-gradient(to right,#d4c8a8 0%,#e8dfc0 15%,#f0e8cc 35%,#ece4c4 65%,#ddd4b0 85%,#ccc4a0 100%);
  }
  .twh-drip-cream { position:absolute;background:linear-gradient(to bottom,#e8dfc0,#d4c8a8);border-radius:0 0 4px 4px;opacity:0.85; }
  .twh-holder-cream { height:6px;background:linear-gradient(to bottom,#b8a880,#907860);border-radius:0 0 3px 3px;box-shadow:0 2px 4px rgba(0,0,0,0.4); }
  .twh-base-cream   { height:4px;background:linear-gradient(to bottom,#a09070,#706050);border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.5); }

  /* Flame shape animations */
  @keyframes f1o{0%,100%{transform:scaleX(1) scaleY(1) rotate(-0.5deg)}25%{transform:scaleX(0.9) scaleY(1.08) rotate(1deg)}50%{transform:scaleX(1.05) scaleY(0.95) rotate(-1deg)}75%{transform:scaleX(0.95) scaleY(1.05) rotate(0.5deg)}}
  @keyframes f2o{0%,100%{transform:scaleX(1) scaleY(1) rotate(0.5deg)}20%{transform:scaleX(1.08) scaleY(0.92) rotate(-1deg)}55%{transform:scaleX(0.9) scaleY(1.1) rotate(1.5deg)}80%{transform:scaleX(1.05) scaleY(0.97) rotate(-0.5deg)}}
  @keyframes f3o{0%,100%{transform:scaleX(1) scaleY(1)}33%{transform:scaleX(0.88) scaleY(1.12) rotate(1deg)}66%{transform:scaleX(1.1) scaleY(0.9) rotate(-1.5deg)}}
  @keyframes f4o{0%,100%{transform:scaleX(1) scaleY(1) rotate(1deg)}40%{transform:scaleX(1.12) scaleY(0.88) rotate(-0.5deg)}70%{transform:scaleX(0.92) scaleY(1.08) rotate(1deg)}}
  @keyframes f1m{0%,100%{transform:scaleX(1) scaleY(1) rotate(-0.3deg) translateX(0)}30%{transform:scaleX(0.85) scaleY(1.1) rotate(2deg) translateX(1px)}60%{transform:scaleX(1.1) scaleY(0.92) rotate(-1.5deg) translateX(-1px)}}
  @keyframes f2m{0%,100%{transform:scaleX(1) scaleY(1) translateX(0)}25%{transform:scaleX(1.1) scaleY(0.88) rotate(1deg) translateX(-1px)}65%{transform:scaleX(0.88) scaleY(1.12) rotate(-2deg) translateX(1px)}}
  @keyframes f3m{0%,100%{transform:scaleX(1) scaleY(1) rotate(0.5deg)}40%{transform:scaleX(0.9) scaleY(1.1) rotate(-2deg) translateX(1px)}75%{transform:scaleX(1.08) scaleY(0.94) rotate(1.5deg)}}
  @keyframes f1c{0%,100%{transform:scaleX(1) scaleY(1)}35%{transform:scaleX(0.8) scaleY(1.15) translateX(1.5px)}70%{transform:scaleX(1.15) scaleY(0.88) translateX(-1px)}}
  @keyframes f2c{0%,100%{transform:scaleX(1) scaleY(1) translateX(0)}20%{transform:scaleX(1.2) scaleY(0.85) translateX(-1.5px)}60%{transform:scaleX(0.82) scaleY(1.18) translateX(1px)}}
  @keyframes f3c{0%,100%{transform:scaleX(1) scaleY(1)}45%{transform:scaleX(0.78) scaleY(1.2) translateX(2px)}80%{transform:scaleX(1.1) scaleY(0.9) translateX(-0.5px)}}
  @keyframes fg1{0%,100%{opacity:0.35;transform:translateX(-50%) scale(1)}50%{opacity:0.5;transform:translateX(-50%) scale(1.15)}}
  @keyframes fg2{0%,100%{opacity:0.28;transform:translateX(-50%) scale(1)}40%{opacity:0.45;transform:translateX(-50%) scale(1.2)}}
  @keyframes fg3{0%,100%{opacity:0.4;transform:translateX(-50%) scale(1)}60%{opacity:0.25;transform:translateX(-50%) scale(0.9)}}

  /* Soft per-candle brightness pulse — layered on top of shape animations */
  @keyframes flamePulse {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.72; }
  }

  @media(prefers-reduced-motion:reduce){
    .twh-fo,.twh-fm,.twh-fc,.twh-fg,.twh-flame-wrap{animation:none!important;}
  }
`

interface CandlesProps {
  variant?: 'default' | 'cream'
  indices?: number[]
}

export default function Candles({ variant = 'default', indices }: CandlesProps) {
  const injected = useRef(false)

  useEffect(() => {
    if (injected.current) return
    injected.current = true
    const style = document.createElement('style')
    style.textContent = BASE_CSS
    document.head.appendChild(style)
  }, [])

  const cream = variant === 'cream'
  const data = indices ? indices.map(i => CANDLE_DATA[i]) : CANDLE_DATA

  return (
    <div className="twh-candles">
      {data.map((c, i) => {
        const flameH = Math.round(c.w * 2.2)
        const glowW  = c.w + 14
        const delay  = `${c.delay}ms`
        // Use the original candle index for pulse timing if indices provided, else use position
        const pulseIdx = indices ? indices[i] : i
        const pulseDur   = PULSE_DURATIONS[pulseIdx % PULSE_DURATIONS.length]
        const pulseDelay = PULSE_DELAYS[pulseIdx % PULSE_DELAYS.length]

        return (
          <div key={i} className="twh-candle">

            {/* Flame — pulse wraps all flame layers for a unified per-candle breathe */}
            <div
              className="twh-flame-wrap"
              style={{
                width: c.w + 4,
                height: flameH,
                animation: `flamePulse ${pulseDur} ${pulseDelay} ease-in-out infinite`,
              }}
            >
              <div className="twh-fg" style={{ width: glowW, animation: `${c.fg} ease-in-out infinite`, animationDelay: delay }} />
              <div className="twh-fo" style={{ width: c.w + 2, height: Math.round(flameH * 0.8), animation: `${c.fo} ease-in-out infinite`, animationDelay: delay }} />
              <div className="twh-fm" style={{ width: Math.round(c.w * 0.7), height: Math.round(flameH * 0.6), animation: `${c.fm} ease-in-out infinite`, animationDelay: delay }} />
              <div className="twh-fc" style={{ width: Math.round(c.w * 0.28), height: Math.round(flameH * 0.35), animation: `${c.fc} ease-in-out infinite`, animationDelay: delay }} />
            </div>

            {/* Body */}
            <div className={cream ? 'twh-body-cream' : 'twh-body'} style={{ width: c.w, height: c.h }}>
              <div className={cream ? 'twh-drip-cream' : 'twh-drip'} style={{ left: c.dripL.l, top: c.dripL.t, width: c.dripL.w, height: c.dripL.h }} />
              <div className={cream ? 'twh-drip-cream' : 'twh-drip'} style={{ left: c.dripR.l, top: c.dripR.t, width: c.dripR.w, height: c.dripR.h }} />
            </div>

            {/* Holder & base */}
            <div className={cream ? 'twh-holder-cream' : 'twh-holder'} style={{ width: c.w + 8 }} />
            <div className={cream ? 'twh-base-cream'   : 'twh-base'}   style={{ width: c.w + 16 }} />

          </div>
        )
      })}
    </div>
  )
}
