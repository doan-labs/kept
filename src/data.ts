type Cluster = { x: number; y: number; z: number; s: number; hidden?: boolean }

export type Item = {
  id: string
  src: string
  w: number
  ratio: number
  /** hero stack position, px from center */
  cluster: Cluster
  /** expanded hero: which cell of the mark's lattice the photograph fills (0 half disc, 1 ring, 2 triangle, 3 square). Items without one live in the sections below. */
  hero?: 0 | 1 | 2 | 3
  /** scroll parallax multiplier in the hero */
  depth: number
}

const hidden: Cluster = { x: 0, y: 0, z: 1, s: 0.45, hidden: true }

// Linh's photographs sit in public/photos, one jpeg per id, longest edge 2000px.
// Each ratio is that file's own width over height, measured from the file, so the
// aspect boxes in Gallery and Sections match the photograph instead of cropping it.
const photo = (id: string, w: number, ratio: number, cluster: Cluster, depth: number, hero?: Item['hero']): Item => ({
  id,
  w,
  ratio,
  cluster,
  depth,
  hero,
  src: `/photos/${id}.jpg`,
})

export const items: Item[] = [
  // hero stack, then the lattice cell each one fills when expanded
  photo('snow-tower', 340, 0.75, { x: 0, y: 0, z: 5, s: 1 }, 1, 0),
  photo('atrium', 250, 0.703, { x: -125, y: 8, z: 4, s: 1 }, 0.8, 1),
  photo('garden-hall', 250, 1.5, { x: 125, y: 8, z: 4, s: 1 }, 1.25, 2),
  photo('campus', 290, 1.05, hidden, 0.9, 3),
  photo('pavilion', 300, 0.784, hidden, 1.1),
  // below the fold once expanded
  photo('courtyard', 240, 1.727, hidden, 1),
  photo('lakeside', 260, 0.666, hidden, 1),
  photo('horizon', 320, 0.562, hidden, 1),
  photo('studio', 200, 0.666, hidden, 1),
  photo('forest', 280, 0.75, hidden, 1),
  photo('terrace', 260, 0.666, hidden, 1),
  photo('plaza', 240, 0.843, hidden, 1),
]
