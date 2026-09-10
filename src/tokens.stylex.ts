import * as stylex from '@stylexjs/stylex'

/*
 * Doan's warm monochrome, lifted from doan-labs.com/src/styles.css. The
 * gallery runs on the dark paper, so nothing here is a new colour.
 */
export const dark = stylex.defineVars({
  paper: '#151412',
  surface: '#1d1b18',
  ink: '#e9e6df',
  inkMuted: '#a49e93',
  inkFaint: '#6e695f',
  line: '#2a2722',
  lineStrong: '#403c34',
})

export const font = stylex.defineVars({
  sans: '"Inter Variable", ui-sans-serif, system-ui, sans-serif',
  serif: '"Source Serif 4 Variable", ui-serif, Georgia, serif',
  mono: '"JetBrains Mono Variable", ui-monospace, "SF Mono", Menlo, monospace',
})
