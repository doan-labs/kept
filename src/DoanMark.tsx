/*
 * The Doan mark, study II.02 `Vòng`: a half disc, a ring, a triangle and a
 * tilted square, one to a cell on a 24x24 grid. Transcribed from
 * doan-labs.com/src/components/doan-mark.tsx, not redrawn. Drawn in
 * currentColor so it takes the ink of wherever it sits.
 *
 * The hover quarter turn lives in index.css under .dm-*, because it needs
 * descendant selectors StyleX does not write.
 */
export function DoanMark({ size }: { size: number | string }) {
  return (
    <svg className="doan-mark dm-host" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <rect className="dm-hit" width="24" height="24" fill="none" />
      <g className="dm-grid">
        <g className="dm-ctr">
          <path d="M5.6 3.4A4.1 4.1 0 0 1 5.6 11.6Z" fill="currentColor" />
        </g>
        <g className="dm-ctr">
          <circle cx="16.5" cy="7.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </g>
        <g className="dm-ctr">
          <polygon points="7.5,12.9 3.5,20.1 11.5,20.1" fill="currentColor" />
        </g>
        <g className="dm-ctr">
          <rect className="dm-n" x="13.9" y="13.9" width="5.2" height="5.2" fill="none" stroke="currentColor" strokeWidth="1.75" />
        </g>
      </g>
    </svg>
  )
}
