# TerraVue Command — Design Direction

## Three Stylistic Approaches

### Theme Name: Orbital Operations Grid
**Very Brief Intro:** A dark mission-control interface that treats every thermal signal as an operational object. Dense, precise, and quietly cinematic, with amber as the visual language of heat and urgency.
**Probability:** 0.08

### Theme Name: Cartographic Field Manual
**Very Brief Intro:** A tactile intelligence brief inspired by printed topographic charts, annotated satellite imagery, and field notebooks. It would feel observational, archival, and grounded in physical geography.
**Probability:** 0.03

### Theme Name: Solar Sentinel
**Very Brief Intro:** A high-contrast observatory interface built around a near-black canvas, restrained orange signal lines, and precise pulses of activity. It would emphasize surveillance, response, and clear escalation paths.
**Probability:** 0.06

## Chosen Direction: Orbital Operations Grid

### Design Movement
**Contemporary mission control / neo-institutional systems design.** TerraVue Command borrows from NASA and ISRO telemetry consoles, intelligence briefings, and modern operations software without becoming retro-futurist or game-like.

### Core Principles
1. **Evidence before decoration.** Every panel should make a status, confidence, source, or action legible within seconds.
2. **Heat has hierarchy.** Amber and orange are reserved for thermal detections, confidence levels, and response urgency; they should never become general-purpose decoration.
3. **Asymmetric operational composition.** Use a persistent left rail, a dominant map field, and narrow telemetry columns rather than a centered marketing layout.
4. **Quiet authority.** The system should feel calm, exact, and trustworthy even when showing active incidents.

### Color Philosophy
The base is a low-luminance blue-charcoal that protects map legibility and evokes deep-space operations rooms. Cool slate and desaturated blue-gray carry interface structure without competing with the data. **Signal Amber (#F5A524)** is the ownable brand color: it marks heat, active review, and the intelligence layer. Ember orange is reserved for high-severity or confirmed thermal clusters. Pale ice text creates high-contrast reading surfaces, while muted steel text keeps secondary data quiet.

### Layout Paradigm
A command-center frame with a slim fixed rail, a top status band, and a map-led workspace. The center is not a single card: the map is a field with layered panels, scan lines, heat points, and region controls. Supporting telemetry sits in stacked modules on the right, while a low, horizontal activity ribbon anchors the viewport with incident rows and confidence markers.

### Signature Elements
- **Orbital reticle:** A thin crosshair-and-ring motif appears in the logo, map controls, and selected incident state.
- **Signal brackets:** Square corner brackets and small amber notches indicate active or selected data without rounded consumer-card styling.
- **Telemetry tick marks:** Tiny mono numerals, rules, and periodic ticks frame sections like instrument readouts.

### Interaction Philosophy
Interactions should feel like operating an instrument, not browsing a consumer app. Active states use a clear amber edge, concise status change, and subtle focus glow. Buttons acknowledge input with a short press scale and color response. The map can switch layers and simulate a refreshed detection feed; structural placeholder actions should use a quiet toast that states they are coming soon rather than implying a backend exists.

### Animation
Use short, intentional transitions under 240ms. On load, map layers and telemetry panels fade and rise in a controlled stagger. Live scan lines move slowly and continuously, while thermal points use a restrained 2-step pulse only for active detections. Hover reveals should be instantaneous or near-instantaneous for high-frequency rows. Keep motion to transform and opacity, and disable non-essential animation under `prefers-reduced-motion`.

### Typography System
Use **Rajdhani** for instrument labels, navigation, numerals, and compact telemetry; it gives the interface a mission-control cadence without feeling like a game. Use **IBM Plex Sans** for body copy, table rows, and longer explanations; it is engineered, readable, and institutional. Display headings use Rajdhani at heavy weight with generous tracking, while metadata stays uppercase with tighter line-height and visible letter spacing.

### Brand Essence
**TerraVue Command is a satellite intelligence console for public-sector teams that need to distinguish dangerous fire from industrial, agricultural, and mining heat — before it becomes a response problem.**

**Personality:** vigilant, exact, composed.

### Brand Voice
Headlines are concise operational statements, not marketing slogans. CTAs sound like controlled decisions. Microcopy reports state, source, timestamp, confidence, and next action without hype.

Example headline: **"Classify the heat before it becomes an incident."**

Example CTA: **"Open incident queue"**

### Wordmark & Logo
The wordmark is set in uppercase Rajdhani with a small offset between `TERRA` and `VUE`, paired with a geometric mark that combines a topographic contour ring, a satellite orbital arc, and a central thermal pulse. The mark is icon-first and works at favicon size without relying on the wordmark.

### Signature Brand Color
**Signal Amber — #F5A524.** A high-visibility, low-neon amber that reads as thermal energy, caution, and active intelligence against the blue-charcoal base.

### Implementation Reminder
Do not dilute this direction with soft pastel colors, oversized rounded cards, playful illustrations, purple gradients, or generic SaaS hero copy. The map, incident state, and classification confidence must remain the visual priorities.

## Style Decisions

- TerraVue Command always shows an icon-first orbital-reticle mark and an uppercase Rajdhani wordmark in the primary console chrome; the brand is visible in both the persistent rail and the top status band.
- Signal Amber `#F5A524` remains reserved for thermal detections, selected or active review states, urgency labels, and primary analyst actions; ordinary structure stays slate, ice, or muted steel.
- The default page frame remains a command console: persistent left instrument rail, top status band, dominant map field, right telemetry stack, and bottom incident ribbon.
- Bracket, tick-mark, and orbital geometry motifs are repeated in panel framing, selected rows, map controls, and brand lockups so the product remains recognizable even when the map is cropped.
