import { cosineSimilarity, providers } from '@neurova/ai'
import { createStore, useComputed, useEvent, useSignal, useStore } from '@neurova/runtime'
import { themePresets } from '@neurova/themes'
import {
  Button,
  Card,
  ChatWindow,
  Input,
  Spinner,
  ThemeProvider,
  type ChatMessage as UIChatMessage,
  useTheme,
} from '@neurova/ui'
import { memo, useEffect, useState } from 'react'

/* ========================================================================== */
/*  Pexels helpers                                                             */
/* ========================================================================== */

const px = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

const IMG = {
  hero: px(312418, 1200),
  bar: px(2074130, 1200),
  pour: px(4109743, 900),
  beans: px(585753, 900),
  pastry: px(1775043, 900),
  brunch: px(1351238, 900),
  latteart: px(2074122, 900),
  shop: px(1813466, 1200),
  ethiopia: px(1695052, 900),
  colombia: px(885024, 900),
  brazil: px(894695, 900),
  kenya: px(2074131, 900),
  customer1: px(774909, 200),
  customer2: px(415829, 200),
  customer3: px(733872, 200),
}

/* ========================================================================== */
/*  Menu data — inspired by Kava Coffee Bar                                    */
/* ========================================================================== */

type MenuRow = {
  id: string
  name: string
  price: string
  desc?: string
  addable?: { name: string; price: number }
}

const HOT_DRINKS: MenuRow[] = [
  { id: 'espresso', name: 'Espresso', price: '£2.50', addable: { name: 'Espresso', price: 2.5 } },
  {
    id: 'double-espresso',
    name: 'Double Espresso',
    price: '£2.80',
    addable: { name: 'Double Espresso', price: 2.8 },
  },
  {
    id: 'flat-white',
    name: 'Flat White',
    price: '£3.40',
    addable: { name: 'Flat White', price: 3.4 },
  },
  {
    id: 'latte',
    name: 'Latte',
    price: '£3.40 / £3.70 / £3.90',
    desc: 'Small / Medium / Large',
    addable: { name: 'Latte (M)', price: 3.7 },
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    price: '£3.40 / £3.70 / £3.90',
    addable: { name: 'Cappuccino (M)', price: 3.7 },
  },
  {
    id: 'americano',
    name: 'Americano',
    price: '£3.20 / £3.70',
    addable: { name: 'Americano', price: 3.2 },
  },
  {
    id: 'mocha',
    name: 'Mocha',
    price: '£3.30 / £3.80 / £4.00',
    addable: { name: 'Mocha (M)', price: 3.8 },
  },
  {
    id: 'hot-choc',
    name: 'Hot Chocolate (ve)',
    price: '£3.50 / £3.90',
    addable: { name: 'Hot Chocolate', price: 3.5 },
  },
  {
    id: 'deluxe-hot-choc',
    name: 'Deluxe Hot Chocolate',
    price: '£4.60 / £4.90',
    desc: 'with cream & marshmallows',
    addable: { name: 'Deluxe Hot Chocolate', price: 4.6 },
  },
  {
    id: 'iced-latte',
    name: 'Iced Latte',
    price: '£4.80',
    addable: { name: 'Iced Latte', price: 4.8 },
  },
  { id: 'matcha', name: 'Matcha', price: '£3.90 / £4.30', addable: { name: 'Matcha', price: 3.9 } },
  {
    id: 'chai',
    name: 'Chai Tea Latte (ve)',
    price: '£3.90 / £4.30',
    addable: { name: 'Chai Latte', price: 3.9 },
  },
  {
    id: 'turmeric',
    name: 'Turmeric Latte (ve)',
    price: '£3.90 / £4.30',
    addable: { name: 'Turmeric Latte', price: 3.9 },
  },
  { id: 'tea', name: 'Pot of Tea', price: '£2.90', addable: { name: 'Pot of Tea', price: 2.9 } },
]

const BREAKFAST: MenuRow[] = [
  {
    id: 'farmhouse-toast',
    name: 'Farmhouse toast & butter',
    price: '£3.30',
    addable: { name: 'Farmhouse toast', price: 3.3 },
  },
  {
    id: 'tea-bread',
    name: 'Toasted tea bread & butter',
    price: '£3.40',
    addable: { name: 'Tea bread', price: 3.4 },
  },
  {
    id: 'scrambled-egg',
    name: 'Scrambled egg on toast (v)',
    price: '£5.40',
    addable: { name: 'Scrambled egg on toast', price: 5.4 },
  },
  {
    id: 'beans-toast',
    name: 'Beans on toast (v)',
    price: '£5.40',
    addable: { name: 'Beans on toast', price: 5.4 },
  },
  {
    id: 'bacon-roll',
    name: 'Large bacon roll',
    price: '£6.30',
    desc: 'staff favourite',
    addable: { name: 'Bacon roll', price: 6.3 },
  },
  {
    id: 'avocado-toast',
    name: 'Smashed avocado on ciabatta',
    price: '£6.00',
    addable: { name: 'Avocado toast', price: 6.0 },
  },
  {
    id: 'eggs-benedict',
    name: 'Eggs Benedict — Classic Bacon',
    price: '£11.50',
    desc: 'served until 12pm',
    addable: { name: 'Eggs Benedict', price: 11.5 },
  },
  {
    id: 'eggs-royale',
    name: 'Eggs Royale — Smoked Salmon',
    price: '£13.50',
    addable: { name: 'Eggs Royale', price: 13.5 },
  },
]

const LUNCH: MenuRow[] = [
  {
    id: 'panini-classic',
    name: 'Classic Panini',
    price: '£8.50',
    desc: 'ham & cheese · with crisps & salad',
    addable: { name: 'Classic Panini', price: 8.5 },
  },
  {
    id: 'panini-veggie',
    name: 'Veggie Panini',
    price: '£8.50',
    desc: 'spinach, mushrooms & cheese',
    addable: { name: 'Veggie Panini', price: 8.5 },
  },
  {
    id: 'panini-meat',
    name: 'Meat Feast Panini',
    price: '£9.00',
    desc: 'chicken, chorizo, bacon & cheese',
    addable: { name: 'Meat Feast Panini', price: 9.0 },
  },
  {
    id: 'jacket-cheese',
    name: 'Jacket Potato — Cheese',
    price: '£8.20',
    addable: { name: 'Jacket — Cheese', price: 8.2 },
  },
  {
    id: 'jacket-tuna',
    name: 'Jacket Potato — Tuna mayo',
    price: '£8.40',
    addable: { name: 'Jacket — Tuna', price: 8.4 },
  },
  {
    id: 'salad-meaty',
    name: 'Salad Bowl — Chicken & Chorizo',
    price: '£7.80',
    addable: { name: 'Meaty Salad', price: 7.8 },
  },
  {
    id: 'soup',
    name: 'Tomato & basil soup',
    price: '£6.50',
    desc: 'with 3 slices ciabatta',
    addable: { name: 'Soup', price: 6.5 },
  },
]

/* ========================================================================== */
/*  Recipes & Origins                                                          */
/* ========================================================================== */

type Recipe = {
  id: string
  name: string
  group: 'Classics' | 'Seasonal' | 'Around the world'
  ingredients: string[]
  blurb: string
}

const RECIPES: Recipe[] = [
  {
    id: 'r-espresso',
    name: 'Espresso',
    group: 'Classics',
    ingredients: ['espresso'],
    blurb: 'The single shot that anchors every milk drink on the menu.',
  },
  {
    id: 'r-cappuccino',
    name: 'Cappuccino',
    group: 'Classics',
    ingredients: ['espresso', 'steamed milk', 'foamed milk'],
    blurb: 'Equal parts espresso, steamed milk and dense foam.',
  },
  {
    id: 'r-flatwhite',
    name: 'Flat White',
    group: 'Classics',
    ingredients: ['espresso', 'steamed milk'],
    blurb: 'A double ristretto under silky microfoam — Antipodean classic.',
  },
  {
    id: 'r-latte',
    name: 'Latte',
    group: 'Classics',
    ingredients: ['espresso', 'steamed milk', 'foamed milk'],
    blurb: 'Long, mellow and milky — perfect for first-thing mornings.',
  },
  {
    id: 'r-mocha',
    name: 'Mocha',
    group: 'Classics',
    ingredients: ['espresso', 'steamed milk', 'chocolate'],
    blurb: 'A latte with a hit of dark chocolate. Cosy in cup form.',
  },
  {
    id: 'r-macchiato',
    name: 'Macchiato',
    group: 'Classics',
    ingredients: ['espresso', 'foamed milk'],
    blurb: 'Espresso "stained" with a teaspoon of foam.',
  },
  {
    id: 'r-pumpkin',
    name: 'Pumpkin Spice Latte',
    group: 'Seasonal',
    ingredients: ['espresso', 'steamed milk', 'pumpkin syrup', 'spice'],
    blurb: 'Autumn in a cup — cinnamon, nutmeg, clove.',
  },
  {
    id: 'r-iced',
    name: 'Iced Coffee',
    group: 'Seasonal',
    ingredients: ['cold brew', 'ice', 'milk (optional)'],
    blurb: 'Slow-steeped 18 hours, poured long over ice.',
  },
  {
    id: 'r-frappe',
    name: 'Frappé',
    group: 'Seasonal',
    ingredients: ['espresso', 'sugar', 'ice', 'milk'],
    blurb: 'Greek-style shaken iced coffee with a thick foamy head.',
  },
  {
    id: 'r-cortado',
    name: 'Cortado',
    group: 'Around the world',
    ingredients: ['espresso', 'steamed milk'],
    blurb: 'Spanish 1:1 espresso to milk — bold but balanced.',
  },
  {
    id: 'r-affogato',
    name: 'Affogato',
    group: 'Around the world',
    ingredients: ['espresso', 'vanilla ice cream'],
    blurb: 'A scoop of gelato "drowned" in fresh espresso.',
  },
  {
    id: 'r-yuanyang',
    name: 'Yuanyang',
    group: 'Around the world',
    ingredients: ['coffee', 'milk tea'],
    blurb: 'Hong Kong street favourite — coffee meets milk tea.',
  },
]

type Origin = {
  id: string
  name: string
  country: string
  process: string
  altitude: string
  notes: string[]
  blurb: string
  img: string
}

const ORIGINS: Origin[] = [
  {
    id: 'ethiopia',
    name: 'Yirgacheffe',
    country: 'Ethiopia',
    process: 'Washed',
    altitude: '1,900–2,200 m',
    notes: ['jasmine', 'bergamot', 'lemon zest'],
    blurb:
      'Bright, floral and tea-like. Our house single-origin since 2024 — a lifted, aromatic cup that wakes up any morning.',
    img: IMG.ethiopia,
  },
  {
    id: 'colombia',
    name: 'Huila Pink Bourbon',
    country: 'Colombia',
    process: 'Honey',
    altitude: '1,750 m',
    notes: ['red apple', 'caramel', 'rose'],
    blurb:
      'Silky body, juicy acidity. Honey processing brings a sweet, almost wine-like depth — superb as a flat white.',
    img: IMG.colombia,
  },
  {
    id: 'brazil',
    name: 'Cerrado Mineiro',
    country: 'Brazil',
    process: 'Natural',
    altitude: '1,100 m',
    notes: ['hazelnut', 'milk chocolate', 'brown sugar'],
    blurb:
      'The chocolatey backbone of our espresso blend. Low acidity, big body, and a long finish that loves milk.',
    img: IMG.brazil,
  },
  {
    id: 'kenya',
    name: 'Nyeri AA',
    country: 'Kenya',
    process: 'Washed',
    altitude: '1,800 m',
    notes: ['blackcurrant', 'tomato', 'molasses'],
    blurb:
      'Punchy, savoury, juicy. A guest spot on our pour-over bar through summer — bold enough for a cortado.',
    img: IMG.kenya,
  },
]

const TESTIMONIALS = [
  {
    quote:
      'Best flat white in Shoreditch, hands down. The Yirgacheffe pour-over is something else.',
    name: 'Aisha P.',
    role: 'regular',
    img: IMG.customer1,
  },
  {
    quote:
      'I work from the corner table every Thursday. Wifi is fast, staff are warm, the bacon roll is a religious experience.',
    name: 'Marco D.',
    role: 'remote worker',
    img: IMG.customer2,
  },
  {
    quote: 'Bottomless brunch beat my expectations — and I had high ones. Eggs Royale was perfect.',
    name: 'Lucia H.',
    role: 'weekend visitor',
    img: IMG.customer3,
  },
] as const

/* ========================================================================== */
/*  Cart store — createStore + useStore                                        */
/* ========================================================================== */

type CartLine = { id: string; name: string; price: number; qty: number }
const cartStore = createStore<{ lines: CartLine[] }>({ lines: [] })

function addLine(item: { id: string; name: string; price: number }) {
  cartStore.setState((s) => {
    const found = s.lines.find((l) => l.id === item.id)
    return {
      lines: found
        ? s.lines.map((l) => (l.id === item.id ? { ...l, qty: l.qty + 1 } : l))
        : [...s.lines, { ...item, qty: 1 }],
    }
  })
}
const removeLine = (id: string) =>
  cartStore.setState((s) => ({ lines: s.lines.filter((l) => l.id !== id) }))
const clearCart = () => cartStore.setState({ lines: [] })

function CartBadge() {
  const qty = useStore(cartStore, (s) => s.lines.reduce((n, l) => n + l.qty, 0))
  return <span className="badge">☕ cart · {qty}</span>
}

function CartPanel() {
  const lines = useStore(cartStore, (s) => s.lines)
  const total = useComputed(() => lines.reduce((s, l) => s + l.price * l.qty, 0), [lines])
  return (
    <div className="cart-panel">
      <div className="head">
        <h3 style={{ margin: 0 }}>Your order</h3>
        <Button size="sm" variant="ghost" onClick={clearCart}>
          clear
        </Button>
      </div>
      {lines.length === 0 ? (
        <p className="empty">Pick something tasty from the menu →</p>
      ) : (
        <ul>
          {lines.map((l) => (
            <li key={l.id}>
              <span>
                {l.qty} × {l.name}
              </span>
              <span>
                £{(l.price * l.qty).toFixed(2)}
                <button
                  type="button"
                  className="x"
                  aria-label={`Remove ${l.name}`}
                  onClick={() => removeLine(l.id)}
                >
                  ×
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="total">
        <span>Total</span>
        <span>£{total.toFixed(2)}</span>
      </div>
      <Button variant="primary" disabled={lines.length === 0}>
        Checkout
      </Button>
    </div>
  )
}

/* ========================================================================== */
/*  Menu list                                                                  */
/* ========================================================================== */

const MenuList = memo(function MenuList({
  title,
  rows,
  prefix,
}: {
  title: string
  rows: MenuRow[]
  prefix: string
}) {
  const onAdd = useEvent((row: MenuRow) => {
    if (!row.addable) return
    addLine({
      id: `${prefix}-${row.id}`,
      name: row.addable.name,
      price: row.addable.price,
    })
  })
  return (
    <div className="menu-list">
      <h3>{title}</h3>
      {rows.map((r) => (
        <div className="row" key={r.id}>
          <div>
            <span className="name">{r.name}</span>
            {r.desc && <span className="desc">{r.desc}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="price">{r.price}</span>
            {r.addable && (
              <button
                type="button"
                className="add"
                aria-label={`Add ${r.addable.name}`}
                onClick={() => onAdd(r)}
              >
                +
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
})

/* ========================================================================== */
/*  AI recommender                                                             */
/* ========================================================================== */

const echo = providers.echo()

function Recommender() {
  const [query, setQuery] = useSignal('something sweet and chocolatey')
  const [busy, setBusy] = useSignal(false)
  const [best, setBest] = useSignal<{ name: string; score: number } | null>(null)

  const pool = HOT_DRINKS.filter((r) => r.addable).map((r) => ({
    name: r.name,
    text: `${r.name} ${r.desc ?? ''}`,
  }))

  const recommend = useEvent(async () => {
    setBusy(true)
    try {
      const { vectors } = await echo.embed({ input: [query, ...pool.map((p) => p.text)] })
      const [q, ...rest] = vectors
      let bestIdx = 0
      let bestScore = Number.NEGATIVE_INFINITY
      rest.forEach((v, i) => {
        const s = cosineSimilarity(q, v)
        if (s > bestScore) {
          bestScore = s
          bestIdx = i
        }
      })
      setBest({ name: pool[bestIdx].name, score: bestScore })
    } finally {
      setBusy(false)
    }
  })

  useEffect(() => {
    void recommend()
  }, [recommend])

  return (
    <div className="ai-card">
      <strong>Tell our barista what you fancy</strong>
      <div className="row">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. iced and refreshing"
        />
        <Button variant="primary" onClick={() => void recommend()} loading={busy}>
          Recommend
        </Button>
      </div>
      {busy ? (
        <Spinner />
      ) : best ? (
        <div className="score">
          We suggest <strong>{best.name}</strong> · match {(best.score * 100).toFixed(0)}%
        </div>
      ) : null}
    </div>
  )
}

/* ========================================================================== */
/*  Theme switcher                                                             */
/* ========================================================================== */

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const names = Object.keys(themePresets) as Array<keyof typeof themePresets>
  return (
    <div className="theme-row">
      <span>theme:</span>
      {names.map((n) => (
        <Button
          key={n}
          size="sm"
          variant={theme === n ? 'primary' : 'ghost'}
          onClick={() => setTheme(n)}
        >
          {n}
        </Button>
      ))}
    </div>
  )
}

/* ========================================================================== */
/*  HuggingFace chat — multiple personas share one token                       */
/* ========================================================================== */

// HF Inference Providers — OpenAI-compatible chat router
// (the legacy api-inference.huggingface.co/models/{id} endpoint was retired in 2025)
const HF_ENDPOINT = 'https://router.huggingface.co/v1/chat/completions'
const HF_MODEL = 'meta-llama/Llama-3.1-8B-Instruct:novita'
const TOKEN_KEY = 'bean-brew.hf-token'

type Persona = {
  id: 'bean' | 'sage' | 'concierge'
  label: string
  emoji: string
  system: string
  intro: string
}

const PERSONAS: Record<Persona['id'], Persona> = {
  bean: {
    id: 'bean',
    label: 'Bean — barista',
    emoji: '☕',
    system: `You are "Bean", a warm and witty barista at Bean & Brew, a slow-roast coffee bar in Shoreditch, London.
You know the menu (espresso £2.50, flat white £3.40, latte £3.40-£3.90, cappuccino £3.40-£3.90, mocha £3.30-£4.00, iced latte £4.80, eggs benedict £11.50, paninis £8.50-£9, jacket potatoes £8.20-£8.40).
You open daily 7am-6pm. Friendly, brief (2-4 sentences). Recommend drinks/food, accept simple orders. Use British English.`,
    intro: "Hi! I'm Bean. What can I get you today?",
  },
  sage: {
    id: 'sage',
    label: 'Sage — coffee sommelier',
    emoji: '🌿',
    system: `You are "Sage", a coffee sommelier at Bean & Brew's roastery.
You know our four single-origins: Ethiopia Yirgacheffe (washed, jasmine/bergamot/lemon), Colombia Huila Pink Bourbon (honey, red apple/caramel/rose), Brazil Cerrado (natural, hazelnut/chocolate), Kenya Nyeri AA (washed, blackcurrant/tomato/molasses).
Talk about brew methods (V60, AeroPress, espresso, French press), grind sizes, ratios, tasting notes. Be precise but welcoming. 2-4 sentences. British English.`,
    intro: "Hello, I'm Sage. Ask me about origins, brew ratios, or tasting notes.",
  },
  concierge: {
    id: 'concierge',
    label: 'Olive — concierge',
    emoji: '🛎️',
    system: `You are "Olive", the concierge at Bean & Brew on 42 Redchurch Street, Shoreditch, London E2 7DP.
Opening hours: Mon-Thu 7am-6pm, Fri 7am-7pm, Sat 8am-7pm, Sun 9am-4pm. Bottomless brunch Sat/Sun 10am-1pm £29pp.
Help visitors with bookings, directions (5 min from Shoreditch High St station), accessibility, events, gift cards. Brief, friendly. British English.`,
    intro: "Hi, I'm Olive. Booking a table or planning a visit? I can help.",
  },
}

type HFRole = 'user' | 'assistant'
type HFMsg = { role: HFRole; content: string }

async function callHuggingFace(
  token: string,
  systemPrompt: string,
  history: HFMsg[],
): Promise<string> {
  const res = await fetch(HF_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: HF_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...history],
      max_tokens: 220,
      temperature: 0.7,
      stream: false,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HF ${res.status}: ${body.slice(0, 220)}`)
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
    error?: string | { message?: string }
  }
  if (data.error) {
    const msg =
      typeof data.error === 'string' ? data.error : (data.error.message ?? 'unknown error')
    throw new Error(msg)
  }
  return (data.choices?.[0]?.message?.content ?? '').trim()
}

/* simple token store (shared across all bots) */
const tokenStore = createStore<{ token: string }>({
  token: typeof localStorage !== 'undefined' ? (localStorage.getItem(TOKEN_KEY) ?? '') : '',
})
const setToken = (t: string) => {
  if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, t)
  tokenStore.setState({ token: t })
}

function ChatBot({
  persona,
  open,
  onClose,
}: {
  persona: Persona
  open: boolean
  onClose: () => void
}) {
  const token = useStore(tokenStore, (s) => s.token)
  const [tokenInput, setTokenInput] = useState('')
  const [messages, setMessages] = useState<UIChatMessage[]>([
    { id: `${persona.id}-hello`, role: 'assistant', content: persona.intro },
  ])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveToken = () => {
    const t = tokenInput.trim()
    if (!t) return
    setToken(t)
    setTokenInput('')
    setError(null)
  }

  const onSend = async (text: string) => {
    setError(null)
    const userMsg: UIChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setPending(true)
    try {
      const history: HFMsg[] = [...messages, userMsg]
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role as HFRole, content: m.content }))
      const reply = await callHuggingFace(token, persona.system, history)
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: reply || '(empty reply)' },
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setPending(false)
    }
  }

  if (!open) return null
  return (
    <div className={`chat-dock persona-${persona.id}`} role="dialog" aria-label={persona.label}>
      <div className="head">
        <div>
          <strong>{persona.label}</strong>
          <div className="sub">Powered by Hugging Face · Llama 3.2</div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      {!token && (
        <div className="token-bar">
          <span>HF token:</span>
          <input
            type="password"
            placeholder="hf_xxx…"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveToken()}
          />
          <button type="button" onClick={saveToken}>
            Save
          </button>
        </div>
      )}
      {error && <div className="err">⚠ {error}</div>}
      <div className="body">
        <ChatWindow
          messages={messages}
          onSend={onSend}
          pending={pending || !token}
          placeholder={
            token
              ? `Ask ${persona.label.split(' ')[0]} anything…`
              : 'Paste your HF token above first'
          }
        />
      </div>
    </div>
  )
}

function BotDock({ personas }: { personas: Persona[] }) {
  const [openId, setOpenId] = useState<Persona['id'] | null>(null)
  return (
    <div className="fab-stack">
      {openId && <ChatBot persona={PERSONAS[openId]} open onClose={() => setOpenId(null)} />}
      {personas.map((p) => (
        <button
          key={p.id}
          type="button"
          className="fab"
          aria-label={`Chat with ${p.label}`}
          title={p.label}
          onClick={() => setOpenId((cur) => (cur === p.id ? null : p.id))}
        >
          {openId === p.id ? '×' : p.emoji}
        </button>
      ))}
    </div>
  )
}

/* ========================================================================== */
/*  Hash router                                                                */
/* ========================================================================== */

type Route = 'home' | 'menu' | 'roastery'

const parseRoute = (): Route => {
  const h = (typeof location !== 'undefined' ? location.hash : '').replace(/^#\/?/, '')
  if (h === 'menu') return 'menu'
  if (h === 'roastery') return 'roastery'
  return 'home'
}

function useRoute(): [Route, (r: Route) => void] {
  const [route, setRouteState] = useState<Route>(parseRoute)
  useEffect(() => {
    const onHash = () => setRouteState(parseRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const setRoute = (r: Route) => {
    location.hash = r === 'home' ? '/' : `/${r}`
  }
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [])
  return [route, setRoute]
}

/* ========================================================================== */
/*  Layout: nav + footer                                                       */
/* ========================================================================== */

function Nav({ route, go }: { route: Route; go: (r: Route) => void }) {
  const link = (r: Route, label: string) => (
    <a
      href={`#/${r === 'home' ? '' : r}`}
      className={route === r ? 'active' : ''}
      onClick={(e) => {
        e.preventDefault()
        go(r)
      }}
    >
      {label}
    </a>
  )
  return (
    <header className="container nav">
      <div className="brand">
        <span className="logo" />
        <span>Bean &amp; Brew</span>
      </div>
      <nav className="nav-links">
        {link('home', 'Home')}
        {link('menu', 'Menu')}
        {link('roastery', 'Roastery')}
        <CartBadge />
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer>
      Built with <a href="https://www.npmjs.com/org/neurova">neurova.js v2.2.2</a> · imagery by{' '}
      <a href="https://www.pexels.com" target="_blank" rel="noreferrer">
        Pexels
      </a>{' '}
      · chat by{' '}
      <a href="https://huggingface.co" target="_blank" rel="noreferrer">
        Hugging Face
      </a>{' '}
      · © 2026 Bean &amp; Brew
    </footer>
  )
}

/* ========================================================================== */
/*  Page: Home                                                                 */
/* ========================================================================== */

function HomePage({ go }: { go: (r: Route) => void }) {
  return (
    <>
      <section className="container hero">
        <div>
          <span className="eyebrow">☕ Open daily · 7am – 6pm · Shoreditch</span>
          <h1 className="h1">
            Slow-roasted coffee, <em>poured with love</em> in Shoreditch.
          </h1>
          <p className="lead">
            Single-origin beans, house-baked pastries and a sunlit corner to call your own. Order
            ahead — your cup will be waiting on the counter.
          </p>
          <div className="cta">
            <Button variant="primary" onClick={() => go('menu')}>
              Order from the menu
            </Button>
            <Button variant="ghost" onClick={() => go('roastery')}>
              Meet our roastery
            </Button>
          </div>
          <ThemeSwitcher />
        </div>
        <div className="hero-art">
          <img src={IMG.hero} alt="A creamy cappuccino with latte art" />
          <div className="hero-tag">Today's roast · Ethiopia Yirgacheffe</div>
        </div>
      </section>

      <section className="container section">
        <h2>A morning in pictures</h2>
        <p className="sub">A peek inside the bar — the pour, the pastry, the regulars.</p>
        <div className="gallery">
          <div className="tile wide tall">
            <img src={IMG.bar} alt="Coffee bar interior" />
            <span className="cap">The bar · 7:14am</span>
          </div>
          <div className="tile">
            <img src={IMG.pour} alt="Pour-over coffee" />
            <span className="cap">V60 pour-over</span>
          </div>
          <div className="tile">
            <img src={IMG.pastry} alt="Pastries" />
            <span className="cap">Daily pastries</span>
          </div>
          <div className="tile wide">
            <img src={IMG.brunch} alt="Brunch plate" />
            <span className="cap">Bottomless brunch · weekends</span>
          </div>
          <div className="tile">
            <img src={IMG.latteart} alt="Latte art" />
            <span className="cap">House latte art</span>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="stats">
          <div className="stat">
            <div className="n">12</div>
            <div className="l">single-origin beans</div>
          </div>
          <div className="stat">
            <div className="n">4.9★</div>
            <div className="l">2,300+ reviews</div>
          </div>
          <div className="stat">
            <div className="n">7am</div>
            <div className="l">opens daily</div>
          </div>
          <div className="stat">
            <div className="n">100%</div>
            <div className="l">compostable cups</div>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2>Loved by the neighbourhood</h2>
        <p className="sub">A few words from regulars and weekend visitors.</p>
        <div className="quotes">
          {TESTIMONIALS.map((t) => (
            <div className="quote" key={t.name}>
              <p>“{t.quote}”</p>
              <div className="who">
                <img src={t.img} alt={t.name} />
                <div>
                  <strong>{t.name}</strong>
                  <small>{t.role}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container section" id="visit">
        <h2>Come say hello</h2>
        <p className="sub">5 minutes from Shoreditch High Street station.</p>
        <div className="visit-grid">
          <div className="visit-card">
            <p>
              <strong>Bean &amp; Brew</strong>
            </p>
            <p>42 Redchurch Street</p>
            <p>London E2 7DP</p>
            <p style={{ marginTop: 16 }}>
              ☎ <a href="tel:+442077778888">020 7777 8888</a>
            </p>
            <p>
              ✉ <a href="mailto:hello@beanandbrew.test">hello@beanandbrew.test</a>
            </p>
            <img
              src={IMG.shop}
              alt="Bean & Brew shopfront"
              style={{
                width: '100%',
                borderRadius: 16,
                marginTop: 18,
                aspectRatio: '16/9',
                objectFit: 'cover',
              }}
            />
          </div>
          <div className="hours">
            <h3>Opening hours</h3>
            <table>
              <tbody>
                <tr>
                  <td>Monday</td>
                  <td>07:00 – 18:00</td>
                </tr>
                <tr>
                  <td>Tuesday</td>
                  <td>07:00 – 18:00</td>
                </tr>
                <tr>
                  <td>Wednesday</td>
                  <td>07:00 – 18:00</td>
                </tr>
                <tr>
                  <td>Thursday</td>
                  <td>07:00 – 18:00</td>
                </tr>
                <tr>
                  <td>Friday</td>
                  <td>07:00 – 19:00</td>
                </tr>
                <tr>
                  <td>Saturday</td>
                  <td>08:00 – 19:00</td>
                </tr>
                <tr>
                  <td>Sunday</td>
                  <td>09:00 – 16:00</td>
                </tr>
              </tbody>
            </table>
            <p className="note">Bottomless brunch every Sat/Sun, 10am – 1pm · £29pp</p>
          </div>
        </div>
      </section>
    </>
  )
}

/* ========================================================================== */
/*  Page: Menu                                                                 */
/* ========================================================================== */

function MenuPage() {
  return (
    <>
      <section className="container page-hero">
        <div>
          <span className="eyebrow">Menu</span>
          <h2 className="h2">
            Today's <em>menu</em>
          </h2>
          <p className="lead">
            Every coffee pulled to order. Tap <code>+</code> to add to your cart — state syncs
            everywhere via <code>createStore</code> + <code>useStore</code>.
          </p>
          <div className="cta">
            <Button
              variant="primary"
              onClick={() => addLine({ id: 'menu-fw', name: 'Flat White', price: 3.4 })}
            >
              Add a Flat White
            </Button>
            <Button
              variant="ghost"
              onClick={() => addLine({ id: 'menu-bacon', name: 'Bacon roll', price: 6.3 })}
            >
              Add a Bacon Roll
            </Button>
          </div>
        </div>
        <div className="hero-art">
          <img src={IMG.latteart} alt="Latte with rosetta art" />
          <div className="hero-tag">Pulled fresh every 9 minutes</div>
        </div>
      </section>

      <section className="container section">
        <div className="menu-cols">
          <div style={{ display: 'grid', gap: 22 }}>
            <MenuList title="Hot & Cold Drinks" rows={HOT_DRINKS} prefix="hot" />
            <MenuList title="All-Day Breakfast" rows={BREAKFAST} prefix="bk" />
            <MenuList title="Lunch · 12 – 2:30pm" rows={LUNCH} prefix="lu" />
          </div>
          <div
            style={{
              display: 'grid',
              gap: 22,
              alignContent: 'start',
              position: 'sticky',
              top: 16,
            }}
          >
            <CartPanel />
            <Card title="AI · Barista's pick">
              <Recommender />
            </Card>
          </div>
        </div>
      </section>
    </>
  )
}

/* ========================================================================== */
/*  Page: Roastery                                                             */
/* ========================================================================== */

function RoasteryPage() {
  return (
    <>
      <section className="container page-hero">
        <div>
          <span className="eyebrow">Roastery</span>
          <h2 className="h2">
            From the farm to your <em>cup</em>
          </h2>
          <p className="lead">
            We roast every Tuesday in small 12 kg batches, working directly with four farms across
            Africa and South America. Ask Sage — our sommelier — for brew ratios and tasting notes.
          </p>
        </div>
        <div className="hero-art">
          <img src={IMG.beans} alt="Roasted coffee beans" />
          <div className="hero-tag">Roasted Tuesdays · rested 7 days</div>
        </div>
      </section>

      <section className="container section">
        <h2>Our origins</h2>
        <p className="sub">
          Four single-origins on rotation. Each is sold whole-bean by the 250 g bag from the
          counter.
        </p>
        <div className="origin-grid">
          {ORIGINS.map((o) => (
            <article className="origin" key={o.id}>
              <div className="photo">
                <img src={o.img} alt={`${o.name}, ${o.country}`} />
              </div>
              <div className="body">
                <h4>{o.name}</h4>
                <div className="meta">
                  <span>{o.country}</span>
                  <span>{o.process}</span>
                  <span>{o.altitude}</span>
                </div>
                <p>{o.blurb}</p>
                <div className="notes">
                  {o.notes.map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2>Coffee recipes</h2>
        <p className="sub">
          Curious how the magic happens? Here's how our baristas pull every drink on the menu.
        </p>
        {(['Classics', 'Seasonal', 'Around the world'] as const).map((group) => (
          <div key={group} style={{ marginBottom: 28 }}>
            <h3 style={{ margin: '8px 0 14px', color: 'var(--brand-strong)' }}>{group}</h3>
            <div className="recipe-grid">
              {RECIPES.filter((r) => r.group === group).map((r) => (
                <article className="recipe" key={r.id}>
                  <span className="tag">{group}</span>
                  <h4>{r.name}</h4>
                  <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>{r.blurb}</p>
                  <div className="ingredients">
                    {r.ingredients.map((i) => (
                      <span key={i}>{i}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  )
}

/* ========================================================================== */
/*  Shell                                                                      */
/* ========================================================================== */

function Shell() {
  const [route, go] = useRoute()
  const personas: Persona[] =
    route === 'menu'
      ? [PERSONAS.bean, PERSONAS.concierge]
      : route === 'roastery'
        ? [PERSONAS.sage, PERSONAS.bean]
        : [PERSONAS.concierge, PERSONAS.bean]

  return (
    <div>
      <Nav route={route} go={go} />
      {route === 'home' && <HomePage go={go} />}
      {route === 'menu' && <MenuPage />}
      {route === 'roastery' && <RoasteryPage />}
      <Footer />
      <BotDock personas={personas} />
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Shell />
    </ThemeProvider>
  )
}
