import type { ModuleDef } from '../types'
import { CATEGORY_COLORS } from '../ui/styles'

type IconKind =
  | 'ballista'
  | 'cannon'
  | 'swivel'
  | 'mortar'
  | 'catapult'
  | 'harpoon'
  | 'net'
  | 'chain'
  | 'fire'
  | 'ice'
  | 'acid'
  | 'thunder'
  | 'song'
  | 'portal'
  | 'helm'
  | 'compass'
  | 'map'
  | 'generator'
  | 'battery'
  | 'ammo'
  | 'powder'
  | 'forge'
  | 'crate'
  | 'sack'
  | 'snow'
  | 'vault'
  | 'rack'
  | 'anchor'
  | 'shield'
  | 'armor'
  | 'sail'
  | 'mast'
  | 'propeller'
  | 'oar'
  | 'pump'
  | 'tools'
  | 'hook'
  | 'bridge'
  | 'trap'
  | 'rune'
  | 'bed'
  | 'kitchen'
  | 'flask'
  | 'medic'
  | 'bars'
  | 'chest'
  | 'hull'
  | 'expand'

function iconKind(def: ModuleDef): IconKind {
  const id = def.id.toLowerCase()
  const hay = `${id} ${def.subtype ?? ''}`.toLowerCase()

  if (id.includes('kitchen')) return 'kitchen'
  if (id.includes('lab') || id.includes('alchemy')) return 'flask'
  if (id.includes('infirmary')) return 'medic'
  if (id.includes('brig')) return 'bars'
  if (id.includes('treasury') || id.includes('vault')) return 'chest'
  if (id.includes('armory') || id.includes('weapon-rack')) return 'rack'
  if (id.includes('forge')) return 'forge'
  if (id.includes('cold')) return 'snow'
  if (id.includes('dry')) return 'sack'
  if (id.includes('magic-ammo')) return 'ammo'
  if (id.includes('tool')) return 'tools'
  if (id.includes('sail') || id.includes('silk') || id.includes('storm') || id.includes('moon')) return 'sail'
  if (id.includes('mast')) return 'mast'
  if (id.includes('propeller') || id.includes('screw')) return 'propeller'
  if (id.includes('oar') || id.includes('rudder')) return 'oar'
  if (id.includes('pump')) return 'pump'
  if (id.includes('rune')) return 'rune'
  if (id.includes('bridge') || id.includes('gangway')) return 'bridge'
  if (id.includes('trap') || id.includes('spiked')) return 'trap'

  if (def.category === 'weapon') {
    if (hay.includes('ballista')) return 'ballista'
    if (hay.includes('catapult')) return 'catapult'
    if (hay.includes('swivel') || hay.includes('falconet')) return 'swivel'
    if (hay.includes('mortar')) return hay.includes('fire') ? 'fire' : hay.includes('ice') ? 'ice' : 'mortar'
    if (hay.includes('harpoon') || hay.includes('grapple') || hay.includes('anchor')) return 'harpoon'
    if (hay.includes('net')) return 'net'
    if (hay.includes('chain')) return 'chain'
    if (hay.includes('dragon') || hay.includes('fire')) return 'fire'
    if (hay.includes('ice')) return 'ice'
    if (hay.includes('acid')) return 'acid'
    if (hay.includes('thunder')) return 'thunder'
    if (hay.includes('siren') || hay.includes('sleep') || hay.includes('song')) return 'song'
    if (hay.includes('gate') || hay.includes('portal')) return 'portal'
    return 'cannon'
  }
  if (def.category === 'command') return id.includes('map') ? 'map' : id.includes('compass') ? 'compass' : 'helm'
  if (def.category === 'generator') return 'generator'
  if (def.category === 'energy') return 'battery'
  if (def.category === 'weapon_support') return id.includes('powder') ? 'powder' : id.includes('forge') ? 'forge' : 'ammo'
  if (def.category === 'storage') return id.includes('secret') || id.includes('pocket') ? 'vault' : 'crate'
  if (def.category === 'anchor') return 'anchor'
  if (def.category === 'defense') return id.includes('armor') || id.includes('plate') ? 'armor' : 'shield'
  if (def.category === 'movement') return 'propeller'
  if (def.category === 'repair') return 'tools'
  if (def.category === 'boarding') return 'hook'
  if (def.category === 'room') return 'bed'
  if (def.category === 'hull_upgrade') return 'hull'
  if (def.category === 'sails') return 'sail'
  return 'expand'
}

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

function signature(def: ModuleDef): string {
  const parts = def.id.split('-')
  const last = parts[parts.length - 1] ?? def.id
  const prev = parts[parts.length - 2] ?? ''
  const text = `${prev.charAt(0)}${last.replace(/[^a-z0-9]/g, '').slice(0, 2)}`.toUpperCase()
  return text || def.category.slice(0, 2).toUpperCase()
}

function isMagicWeapon(def: ModuleDef): boolean {
  if (def.category !== 'weapon') return false

  const hay = [
    def.id,
    def.name,
    def.subtype ?? '',
    def.description ?? '',
    def.effect ?? '',
    ...(def.requirements ?? []),
  ]
    .join(' ')
    .toLowerCase()

  return (
    (def.energyCost ?? 0) > 0 ||
    hay.includes('генератор') ||
    hay.includes('маг') ||
    hay.includes('magic') ||
    hay.includes('rune') ||
    hay.includes('dragon') ||
    hay.includes('thunder') ||
    hay.includes('ice') ||
    hay.includes('acid') ||
    hay.includes('siren') ||
    hay.includes('mist') ||
    hay.includes('wave') ||
    hay.includes('shadow') ||
    hay.includes('deep') ||
    hay.includes('light') ||
    hay.includes('sleep') ||
    hay.includes('sun') ||
    hay.includes('magnetic') ||
    hay.includes('abyss') ||
    hay.includes('star') ||
    hay.includes('leviathan')
  )
}

function artColors(def: ModuleDef) {
  if (def.category !== 'weapon') return CATEGORY_COLORS[def.category]
  return isMagicWeapon(def) ? { base: '#075f78', border: '#67e8f9' } : { base: '#7f1d1d', border: '#ef4444' }
}

export default function ModuleArt({ def, compact = false, tiny = false }: { def: ModuleDef; compact?: boolean; tiny?: boolean }) {
  const magicWeapon = isMagicWeapon(def)
  const colors = artColors(def)
  const sizeClass = tiny ? 'h-10 w-10' : compact ? 'h-14 w-14' : 'h-24 w-24'
  const h = hashId(def.id)
  const markCount = 2 + (h % 4)
  return (
    <div
      className={`module-art relative shrink-0 overflow-hidden rounded border ${sizeClass}`}
      style={{
        borderColor: colors.border,
        background:
          `radial-gradient(circle at ${30 + (h % 40)}% ${24 + (h % 28)}%, rgba(255,244,205,.18), transparent 30%), ` +
          `linear-gradient(${160 + (h % 70)}deg, ${colors.base}e6, rgba(46,22,9,.95))`,
        boxShadow: `inset 0 0 18px rgba(255,226,160,.08), inset 0 -18px 28px rgba(0,0,0,.42), 0 0 10px rgba(0,0,0,.35)`,
        color: def.category === 'weapon' ? (magicWeapon ? '#d7fbff' : '#ffe7e0') : '#fff5d7',
      }}
      title={def.name}
      aria-label={def.name}
    >
      <Icon kind={iconKind(def)} />
      {def.category === 'weapon' && (
        <span
          className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border border-black/45"
          style={{ backgroundColor: magicWeapon ? '#67e8f9' : '#ef4444', boxShadow: `0 0 8px ${magicWeapon ? '#67e8f9' : '#ef4444'}` }}
          title={magicWeapon ? 'Магическое орудие' : 'Немагическое орудие'}
        />
      )}
      <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 100 100" aria-hidden="true">
        {Array.from({ length: markCount }).map((_, i) => {
          const x = 14 + ((h >> (i * 3)) % 72)
          const y = 14 + ((h >> (i * 5 + 2)) % 72)
          return <circle key={i} cx={x} cy={y} r={2 + (i % 2)} fill="currentColor" />
        })}
      </svg>
      <span className="absolute bottom-1 left-1 rounded-sm bg-black/55 px-1 text-[8px] font-bold leading-4 text-white/85">
        {signature(def)}
      </span>
      {def.weaponSize && !tiny && (
        <span className="absolute bottom-1 right-1 rounded-sm bg-black/60 px-1 text-[9px] font-bold uppercase leading-4 text-white/80">
          {def.weaponSize.slice(0, 1)}
        </span>
      )}
    </div>
  )
}

function Icon({ kind }: { kind: IconKind }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 5,
  }
  return (
    <svg className="absolute inset-[10%] h-[80%] w-[80%] drop-shadow" viewBox="0 0 100 100" aria-hidden="true">
      {kind === 'ballista' && <><path {...common} d="M18 70h64M50 18v52M28 26l22 18 22-18M28 26h44M37 44h26M30 70l-8 12M70 70l8 12" /><path {...common} d="M50 44l28-26" /></>}
      {kind === 'cannon' && <><path {...common} d="M18 60h54l13-12-13-12H18c-7 0-11 5-11 12s4 12 11 12Z" /><path {...common} d="M26 60v15M62 60v15M20 75h52" /><circle cx="28" cy="78" r="8" fill="currentColor" /><circle cx="66" cy="78" r="8" fill="currentColor" /></>}
      {kind === 'swivel' && <><path {...common} d="M18 48h46l14-8-14-8H18c-6 0-9 4-9 8s3 8 9 8Z" /><path {...common} d="M48 50v24M30 74h38M50 74l-12 12M50 74l12 12" /></>}
      {kind === 'mortar' && <><path {...common} d="M28 64l32-38 18 13-24 45H30Z" /><path {...common} d="M22 84h60M37 66l17 10" /><circle cx="72" cy="20" r="8" fill="currentColor" /></>}
      {kind === 'catapult' && <><path {...common} d="M18 76h64M28 76V48h36l10 28M34 48l30-26M60 25l14 12" /><circle cx="30" cy="80" r="7" fill="currentColor" /><circle cx="70" cy="80" r="7" fill="currentColor" /></>}
      {kind === 'harpoon' && <><path {...common} d="M14 78 82 18M62 18h20v20M26 66l18 18M34 60l18 18" /><path {...common} d="M61 39c-6 2-11 1-16-4" /></>}
      {kind === 'net' && <><path {...common} d="M20 20h60v60H20Z" /><path {...common} d="M20 40h60M20 60h60M40 20v60M60 20v60M20 20l60 60M80 20L20 80" /></>}
      {kind === 'chain' && <><path {...common} d="M28 62 62 28M20 54c-8 8-8 20 0 28s20 8 28 0l8-8M44 26l8-8c8-8 20-8 28 0s8 20 0 28L46 80" /></>}
      {kind === 'fire' && <><path {...common} d="M30 82h40M36 82c-11-18 3-27 7-41 11 9 11 19 8 28 8-5 11-14 8-25 16 15 23 36 5 38" /><path {...common} d="M22 70h16M70 62h16" /></>}
      {kind === 'ice' && <><path {...common} d="M50 12v76M18 32l64 36M82 32 18 68M28 20l22 12 22-12M28 80l22-12 22 12" /></>}
      {kind === 'acid' && <><path {...common} d="M34 18h32M42 18v28L26 74c-4 8 2 14 11 14h26c9 0 15-6 11-14L58 46V18" /><circle cx="45" cy="68" r="4" fill="currentColor" /><circle cx="58" cy="76" r="3" fill="currentColor" /></>}
      {kind === 'thunder' && <><path {...common} d="M52 10 26 54h22l-8 36 34-50H52Z" /><path {...common} d="M18 30c-8 10-8 30 0 40M82 30c8 10 8 30 0 40" /></>}
      {kind === 'song' && <><path {...common} d="M38 22v44c0 8-8 14-17 10s-7-14 1-17 16 1 16 1M38 22h36v34c0 8-8 14-17 10s-7-14 1-17 16 1 16 1" /></>}
      {kind === 'portal' && <><ellipse {...common} cx="50" cy="50" rx="25" ry="35" /><path {...common} d="M35 28c22 4 32 18 30 44M65 28c-22 4-32 18-30 44" /></>}
      {kind === 'helm' && <><circle {...common} cx="50" cy="50" r="26" /><circle cx="50" cy="50" r="8" fill="currentColor" /><path {...common} d="M50 10v22M50 68v22M10 50h22M68 50h22M22 22l16 16M78 22 62 38M22 78l16-16M78 78 62 62" /></>}
      {kind === 'compass' && <><circle {...common} cx="50" cy="50" r="34" /><path {...common} d="M62 28 52 58 28 70l12-28Z" /><circle cx="50" cy="50" r="4" fill="currentColor" /></>}
      {kind === 'map' && <><path {...common} d="M18 24l22-8 22 8 20-8v60l-20 8-22-8-22 8Z" /><path {...common} d="M40 16v60M62 24v60M28 52c12-10 28 10 44-2" /></>}
      {kind === 'generator' && <><path {...common} d="M25 72V28h50v44Z" /><path {...common} d="M38 18h24M38 82h24M50 34 39 54h16l-5 18 14-26H49Z" /></>}
      {kind === 'battery' && <><path {...common} d="M24 30h46v48H24Z" /><path {...common} d="M38 20h18v10M40 45h20M50 35v20M34 66h26" /></>}
      {kind === 'ammo' && <><path {...common} d="M22 72h56M28 72V40l22-16 22 16v32M38 72V48M50 72V38M62 72V48" /><circle cx="32" cy="30" r="6" fill="currentColor" /><circle cx="68" cy="30" r="6" fill="currentColor" /></>}
      {kind === 'powder' && <><path {...common} d="M34 26h32v12H34ZM40 38h20l8 42H32Z" /><path {...common} d="M68 30c10-10 16-6 18 2" /></>}
      {kind === 'forge' && <><path {...common} d="M20 62h60M30 62c4-16 36-16 40 0M38 62v22h24V62" /><path {...common} d="M34 36h32M40 24h20M46 24v38M54 24v38" /></>}
      {kind === 'crate' && <><path {...common} d="M22 28h56v56H22Z" /><path {...common} d="M22 28l56 56M78 28 22 84M22 48h56M42 28v56" /></>}
      {kind === 'sack' && <><path {...common} d="M40 18h20M42 18c4 10 12 10 16 0M34 36c-18 22-16 52 16 52s34-30 16-52Z" /><path {...common} d="M36 38h28" /></>}
      {kind === 'snow' && <><path {...common} d="M50 14v72M18 32l64 36M82 32 18 68" /><circle cx="50" cy="50" r="7" fill="currentColor" /></>}
      {kind === 'vault' && <><path {...common} d="M24 30h52v48H24Z" /><circle {...common} cx="50" cy="54" r="15" /><path {...common} d="M50 39v30M35 54h30" /></>}
      {kind === 'rack' && <><path {...common} d="M24 78h52M30 78V24M70 78V24M36 38h28M36 56h28" /><path {...common} d="M42 24l16 52M58 24 42 76" /></>}
      {kind === 'anchor' && <><circle {...common} cx="50" cy="18" r="8" /><path {...common} d="M50 26v50M30 42h40M22 68c7 14 19 18 28 8 9 10 21 6 28-8M22 68h16M78 68H62" /></>}
      {kind === 'shield' && <><path {...common} d="M50 14 78 26v22c0 20-12 34-28 42-16-8-28-22-28-42V26Z" /><path {...common} d="M50 18v66M30 45h40" /></>}
      {kind === 'armor' && <><path {...common} d="M34 18h32l14 14-10 14v38H30V46L20 32Z" /><path {...common} d="M34 18c4 14 28 14 32 0M38 54h24" /></>}
      {kind === 'sail' && <><path {...common} d="M50 12v76M54 18c18 16 24 32 16 52H54ZM46 22C30 37 25 52 32 70h14Z" /><path {...common} d="M28 88h44" /></>}
      {kind === 'mast' && <><path {...common} d="M50 10v80M28 26h44M22 54h56M34 88h32" /><path {...common} d="M50 26 30 54M50 26l20 28" /></>}
      {kind === 'propeller' && <><circle cx="50" cy="50" r="7" fill="currentColor" /><path {...common} d="M50 43c-6-20 5-29 18-31 6 14 2 26-11 35M57 53c20 6 29 17 31 30-14 6-26 2-35-11M43 53c-20 6-29 17-31 30 14 6 26 2 35-11" /></>}
      {kind === 'oar' && <><path {...common} d="M18 78 72 24" /><path {...common} d="M70 18c12 2 16 10 10 20-12-2-16-10-10-20ZM22 82l-8 8" /></>}
      {kind === 'pump' && <><path {...common} d="M34 80V38h32v42M26 80h48M42 38V22h16v16" /><path {...common} d="M66 50h18v20" /></>}
      {kind === 'tools' && <><path {...common} d="M30 72 72 30M63 22l15 15M24 62l14 14" /><path {...common} d="M28 24c10-4 20 6 16 16L24 60C20 50 18 34 28 24Z" /></>}
      {kind === 'hook' && <><path {...common} d="M50 14v48c0 15-11 24-24 17-9-5-8-18 2-21" /><path {...common} d="M36 22h28M64 22c18 12 22 32 8 46" /></>}
      {kind === 'bridge' && <><path {...common} d="M18 34h64v32H18Z" /><path {...common} d="M26 34v32M42 34v32M58 34v32M74 34v32" /></>}
      {kind === 'trap' && <><path {...common} d="M18 76h64M28 76l10-38 12 38 12-38 10 38" /><path {...common} d="M28 28h44" /></>}
      {kind === 'rune' && <><circle {...common} cx="50" cy="50" r="28" /><path {...common} d="M36 70 50 22l14 48M42 52h16" /></>}
      {kind === 'bed' && <><path {...common} d="M20 66h60M24 66V42h52v24M24 54h52M28 42v-8h18v8M24 66v14M76 66v14" /></>}
      {kind === 'kitchen' && <><path {...common} d="M28 40h44v34c0 10-8 16-22 16s-22-6-22-16Z" /><path {...common} d="M24 40h52M40 26c-8-8 8-10 0-18M56 26c-8-8 8-10 0-18" /></>}
      {kind === 'flask' && <><path {...common} d="M40 16h20M44 16v28L26 76c-4 8 2 14 12 14h24c10 0 16-6 12-14L56 44V16" /><path {...common} d="M34 70h32" /></>}
      {kind === 'medic' && <><path {...common} d="M50 18v64M18 50h64" /><path {...common} d="M28 28h44v44H28Z" /></>}
      {kind === 'bars' && <><path {...common} d="M24 18h52v64H24Z" /><path {...common} d="M36 18v64M50 18v64M64 18v64M24 38h52M24 62h52" /></>}
      {kind === 'chest' && <><path {...common} d="M20 44h60v36H20Z" /><path {...common} d="M30 44c0-16 40-16 40 0M20 58h60M50 58v12" /></>}
      {kind === 'hull' && <><path {...common} d="M50 10c25 13 35 28 35 50 0 15-13 24-35 30-22-6-35-15-35-30 0-22 10-37 35-50Z" /><path {...common} d="M50 18v64M27 52h46M34 30h32M34 72h32" /></>}
      {kind === 'expand' && <><path {...common} d="M20 20h22M20 20v22M80 20H58M80 20v22M20 80h22M20 80V58M80 80H58M80 80V58" /><path {...common} d="M22 22L42 42M78 22L58 42M22 78l20-20M78 78L58 58" /></>}
    </svg>
  )
}
