// SVG Asset Library Metadata
// Controls how each SVG is grouped and displayed in the
// Atelier library page at /mojo/design/svg-library.
//
// ADDING NEW SVGs:
// When a new SVG is added to MojoSvgAssets.tsx, it will
// automatically appear in the "Ungrouped" section of the
// library page. To properly group it, add an entry here.

export const SVG_GROUPS = [
  'Wide Panoramic',    // full-width header illustrations, ~900×180-220px
  'Square',            // compact decorative, roughly square
  'Tall Vertical',     // taller than wide
  'Medium Decorative', // wide but shorter, ornamental elements
  'Small Navigation',  // nav glyphs and UI icons, 14-32px native
  'Ungrouped',         // automatic fallback for new/unmapped SVGs
] as const

export type SvgGroup = typeof SVG_GROUPS[number]

export type SvgMeta = {
  group: SvgGroup
  displayName: string
  cardHeight: number      // height of the preview area in px
  bgDark?: boolean        // true = dark bg (default), false = light bg
  renderProps?: Record<string, unknown>  // extra props to pass when rendering
  notes?: string          // optional display note (shown below SVG name)
}

// Map from exact export function name → display metadata
// Any SVG not listed here falls through to 'Ungrouped'
export const svgLibraryMeta: Record<string, SvgMeta> = {

  // ─── WIDE PANORAMIC ─── (full-width, 140-220px tall)
  SvgHallOfMirrors:      { group: 'Wide Panoramic', displayName: 'Hall of Mirrors', cardHeight: 200 },
  SvgDiviningChamber:    { group: 'Wide Panoramic', displayName: 'Divining Chamber', cardHeight: 220 },
  SvgGrimoire:           { group: 'Wide Panoramic', displayName: 'Grimoire', cardHeight: 210 },
  SvgWitchesAttic:       { group: 'Wide Panoramic', displayName: "Witch's Attic", cardHeight: 220 },
  SvgPortraitHall:       { group: 'Wide Panoramic', displayName: 'Portrait Hall (Original)', cardHeight: 210 },
  SvgPortraitHallV2:     { group: 'Wide Panoramic', displayName: 'Portrait Hall (Masked Coven)', cardHeight: 210 },
  SvgLibraryBookshelf:   { group: 'Wide Panoramic', displayName: 'Library Bookshelf', cardHeight: 220 },
  SvgLibraryStudy:       { group: 'Wide Panoramic', displayName: 'Library Study / Hearth', cardHeight: 260 },
  SvgOpenLedger:         { group: 'Wide Panoramic', displayName: 'Open Ledger (Chronicle)', cardHeight: 180 },
  SvgCabinetOfCuriosities: { group: 'Wide Panoramic', displayName: 'Cabinet of Curiosities (Reliquary)', cardHeight: 200 },
  SvgGalleryCorridor:    { group: 'Wide Panoramic', displayName: 'Gallery Corridor (Faceclaims)', cardHeight: 160 },
  SvgDarkroomHeader:     { group: 'Wide Panoramic', displayName: 'Darkroom Header (Images)', cardHeight: 160 },
  SvgDreamHeader:        { group: 'Wide Panoramic', displayName: 'Dream Header (Wishlist)', cardHeight: 160 },
  SvgFamiliarPresence:   { group: 'Wide Panoramic', displayName: 'Familiar Presence (Eye)', cardHeight: 90 },
  SvgLargeCrescent:      { group: 'Wide Panoramic', displayName: 'Large Crescent (Dashboard)', cardHeight: 220 },
  SvgScryingBowl:        { group: 'Wide Panoramic', displayName: 'Scrying Bowl (Oracle/Search)', cardHeight: 220, renderProps: { size: 200 } },
  SvgHangingPhotographs: { group: 'Wide Panoramic', displayName: 'Hanging Photographs (Images)', cardHeight: 160 },
  SvgDevelopingTray:     { group: 'Wide Panoramic', displayName: 'Developing Tray (Images)', cardHeight: 120 },
  SvgLeatherTexture:     { group: 'Wide Panoramic', displayName: 'Leather Texture (Partners)', cardHeight: 120 },
  SvgStarfield:          { group: 'Wide Panoramic', displayName: 'Starfield (Wishlist)', cardHeight: 160 },
  SvgBotanicalSpray:     { group: 'Wide Panoramic', displayName: 'Botanical Spray (Wishlist)', cardHeight: 160 },
  SvgBookshelf:          { group: 'Wide Panoramic', displayName: 'Bookshelf (Old Library)', cardHeight: 180, notes: 'Replaced by SvgLibraryBookshelf' },

  // ─── SQUARE ─── (roughly square, compact decorative)
  SvgPhaseNewMoon:       { group: 'Square', displayName: 'Phase: New Moon', cardHeight: 80, renderProps: { size: 60 } },
  SvgPhaseWaxingCrescent: { group: 'Square', displayName: 'Phase: Waxing Crescent', cardHeight: 80, renderProps: { size: 60 } },
  SvgPhaseFirstQuarter:  { group: 'Square', displayName: 'Phase: First Quarter', cardHeight: 80, renderProps: { size: 60 } },
  SvgPhaseWaxingGibbous: { group: 'Square', displayName: 'Phase: Waxing Gibbous', cardHeight: 80, renderProps: { size: 60 } },
  SvgPhaseFullMoon:      { group: 'Square', displayName: 'Phase: Full Moon', cardHeight: 80, renderProps: { size: 60, active: true } },
  SvgPhaseWaningGibbous: { group: 'Square', displayName: 'Phase: Waning Gibbous', cardHeight: 80, renderProps: { size: 60 } },
  SvgPhaseLastQuarter:   { group: 'Square', displayName: 'Phase: Last Quarter', cardHeight: 80, renderProps: { size: 60 } },
  SvgPhaseWaningCrescent: { group: 'Square', displayName: 'Phase: Waning Crescent', cardHeight: 80, renderProps: { size: 60 } },
  SvgPortraitFrame:      { group: 'Square', displayName: 'Portrait Frame', cardHeight: 160 },
  SvgMedallion:          { group: 'Square', displayName: 'Medallion (Character)', cardHeight: 160 },
  SvgCornerBracket:      { group: 'Square', displayName: 'Corner Bracket', cardHeight: 60, renderProps: { size: 40 } },
  SvgBookSeal:           { group: 'Square', displayName: 'Book Seal (Partners)', cardHeight: 100 },
  SvgCandleFlame:        { group: 'Square', displayName: 'Candle Flame (hover)', cardHeight: 60, renderProps: { size: 32 } },
  SvgCandleUnlit:        { group: 'Square', displayName: 'Candle Unlit (Wishlist/idea)', cardHeight: 100 },
  SvgCandleSnuffed:      { group: 'Square', displayName: 'Candle Snuffed (Wishlist/shelved)', cardHeight: 100 },
  SvgPageCornerFold:     { group: 'Square', displayName: 'Page Corner Fold (Partners)', cardHeight: 80 },
  SvgFolderTab:          { group: 'Square', displayName: 'Folder Tab (Images)', cardHeight: 60, renderProps: { size: 32 } },
  SvgRotationRandom:     { group: 'Square', displayName: 'Rotation: Truly Random', cardHeight: 60, renderProps: { size: 40 } },
  SvgRotationWeighted:   { group: 'Square', displayName: 'Rotation: Weighted', cardHeight: 60, renderProps: { size: 40 } },
  SvgRotationSequential: { group: 'Square', displayName: 'Rotation: Sequential', cardHeight: 60, renderProps: { size: 40 } },
  SvgRotationNoRepeat:   { group: 'Square', displayName: 'Rotation: No Repeat', cardHeight: 60, renderProps: { size: 40 } },

  // ─── TALL VERTICAL ─── (taller than wide)
  SvgCandleRealistic:    { group: 'Tall Vertical', displayName: 'Candle Realistic (Dashboard)', cardHeight: 220, renderProps: { flameDelay: '0s' } },
  SvgCandelabra:         { group: 'Tall Vertical', displayName: 'Candelabra (Library)', cardHeight: 220, renderProps: { height: 200, flameDelay: '0s' } },
  SvgIvyColumn:          { group: 'Tall Vertical', displayName: 'Ivy Column (Library/Images)', cardHeight: 300, renderProps: { height: 280 } },
  SvgScrollEnd:          { group: 'Tall Vertical', displayName: 'Scroll End (Library/Chronicle)', cardHeight: 80 },

  // ─── MEDIUM DECORATIVE ─── (wide ornamental elements)
  SvgPageHeaderRule:     { group: 'Medium Decorative', displayName: 'Page Header Rule', cardHeight: 40 },
  SvgFiligreeRule:       { group: 'Medium Decorative', displayName: 'Filigree Rule', cardHeight: 40 },
  SvgIvyTrail:           { group: 'Medium Decorative', displayName: 'Ivy Trail (Character)', cardHeight: 60 },
  SvgIvyBorder:          { group: 'Medium Decorative', displayName: 'Ivy Border (Character)', cardHeight: 100 },
  SvgSilkRibbon:         { group: 'Medium Decorative', displayName: 'Silk Ribbon (Partners)', cardHeight: 60 },
  SvgFlourishUnderline:  { group: 'Medium Decorative', displayName: 'Flourish Underline', cardHeight: 40 },
  SvgTelegraphDots:      { group: 'Medium Decorative', displayName: 'Telegraph Dots (Library)', cardHeight: 30 },
  SvgOpenBook:           { group: 'Medium Decorative', displayName: 'Open Book (Character)', cardHeight: 80 },
  SvgDossierQuill:       { group: 'Medium Decorative', displayName: 'Dossier Quill (Character)', cardHeight: 80 },
  SvgChronicleQuill:     { group: 'Medium Decorative', displayName: 'Chronicle Quill', cardHeight: 80 },

  // ─── SMALL NAVIGATION ─── (14-32px glyphs, rendered larger for visibility)
  SvgCrescent:           { group: 'Small Navigation', displayName: 'Crescent (Top Bar)', cardHeight: 60, renderProps: { size: 40 } },
  SvgPortalIcon:         { group: 'Small Navigation', displayName: 'Portal Icon (Back to TWH)', cardHeight: 60 },
  SvgNavDashboard:       { group: 'Small Navigation', displayName: 'Nav: Dashboard', cardHeight: 50 },
  SvgNavImages:          { group: 'Small Navigation', displayName: 'Nav: Images', cardHeight: 50 },
  SvgNavFaceclaims:      { group: 'Small Navigation', displayName: 'Nav: Faceclaims', cardHeight: 50 },
  SvgNavLibrary:         { group: 'Small Navigation', displayName: 'Nav: Library', cardHeight: 50 },
  SvgNavWishlist:        { group: 'Small Navigation', displayName: 'Nav: Wishlist', cardHeight: 50 },
  SvgNavPartners:        { group: 'Small Navigation', displayName: 'Nav: Partners', cardHeight: 50 },
  SvgNavStacks:          { group: 'Small Navigation', displayName: 'Nav: Stacks', cardHeight: 50 },
  SvgNavSearch:          { group: 'Small Navigation', displayName: 'Nav: Search', cardHeight: 50 },
  SvgNavFamiliar:        { group: 'Small Navigation', displayName: 'Nav: Familiar', cardHeight: 50 },
  SvgNavDesign:          { group: 'Small Navigation', displayName: 'Nav: Atelier/Design', cardHeight: 50, renderProps: { active: true } },
  SvgNavChronicle:       { group: 'Small Navigation', displayName: 'Nav: Chronicle/Tracker', cardHeight: 50 },
  SvgSidebarOrnamentTop: { group: 'Small Navigation', displayName: 'Sidebar Ornament Top', cardHeight: 60 },
  SvgSidebarOrnamentBottom: { group: 'Small Navigation', displayName: 'Sidebar Ornament Bottom', cardHeight: 60 },

  // NOTE: SvgMoon, SvgCandle, SvgParchmentEdge, SvgWaxSeal intentionally
  // have no entry here — they fall through to 'Ungrouped' automatically,
  // demonstrating the fallback behavior described above.
}
