export const CANONS = [
  { label: 'Charmed',                db: 'charmed',               color: '#e0b028', primary: true  },
  { label: 'Buffy & Angel',          db: 'buffy',                 color: '#3878a8', primary: true  },
  { label: 'The Craft',              db: 'the_craft',             color: '#4a7c59', primary: true  },
  { label: 'Practical Magic',        db: 'practical_magic',       color: '#9a7090', primary: true  },
  { label: 'AHS: Coven',             db: 'ahs_coven',             color: '#a8a0b8', primary: true  },
  { label: 'Chilling Adventures',    db: 'chilling_adventures',   color: '#6030a0', primary: true  },
  { label: 'The Secret Circle',      db: 'secret_circle',         color: '#7a6080', primary: true  },
  { label: 'Witches of East End',    db: 'witches_of_east_end',   color: '#806040', primary: false },
  { label: 'Motherland: Fort Salem', db: 'motherland_fort_salem', color: '#706880', primary: false },
  { label: 'A Discovery of Witches', db: 'discovery_of_witches',  color: '#507060', primary: false },
  { label: 'Sabrina (90s)',          db: 'sabrina_90s',           color: '#806870', primary: false },
] as const

export type CanonDb = typeof CANONS[number]['db']
