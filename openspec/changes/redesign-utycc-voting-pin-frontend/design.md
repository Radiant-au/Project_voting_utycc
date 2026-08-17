## Context

The current Next.js prototype has a voter entry flow that includes category selection and an existing project route. This change is limited to the voter-facing frontend: it must replace the entry experience with an event-issued 7-character uppercase alphanumeric voting code, preserve the project flow, and remain fully usable without a backend, database, OAuth provider, API route, server action, Supabase client, or real authentication.

## Goals / Non-Goals

**Goals:**

- Make `/` a UTYCC-branded, mobile-first PIN login page that validates three demo PINs and routes valid sessions to `/projects`.
- Keep mock verification, session shape, and future integration boundaries separate from UI components.
- Provide accessible PIN keyboard behavior, complete login states, logout confirmation, and category-bound project navigation.
- Apply one restrained glassmorphism visual system across the voter login and project pages.
- Keep the language switch visual-only while making its component boundary ready for later translations.

**Non-Goals:**

- Real authentication, PIN security, vote persistence, used-PIN enforcement, translation, backend work, Supabase, OAuth, or API/server code.
- An admin dashboard redesign beyond avoiding accidental voter-flow regressions.
- A new design-system package or UI dependency.

## Decisions

- **Use a local mock service boundary.** Add `verifyVotingPin(pin)` and a typed `MockPinSession` in the existing frontend library area. The UI consumes a result rather than reading the PIN map directly, so a future API adapter can replace the mock without rewriting the components. A small explicit map is preferred over a provider abstraction because there is only one mock implementation.
- **Store minimal session data.** Store only `pinId`, `category`, and `hasVoted` in a namespaced local-storage key. Do not persist the submitted PIN. Read the session at the project route and redirect to `/` when absent; treat malformed storage as logged out.
- **Make the voting-code input one controlled component.** Render seven inputs accepting uppercase `A-Z` and `0-9`, with refs for focus movement, Backspace behavior, paste distribution, arrow-key navigation, Enter submission, input filtering, and responsive sizing. This keeps interaction logic in one place and makes the card reusable.
- **Use CSS for the glass system and motion.** Reuse the existing global stylesheet and component styles; use gradients, pseudo-elements, blur, borders, shadows, media queries, safe-area padding, and `prefers-reduced-motion`. Do not add an animation or UI library.
- **Share voter chrome.** Build `UniversityBrand`, `LanguageSwitcher`, and `GlassNavbar` as small components used by the login card and project route. The project navbar reads the assigned category but exposes no category-changing control.
- **Represent unavailable backend states as mock preview states.** Used PIN, voting not started, voting closed, and network error are deterministic mock-service outcomes or clearly labeled UI previews. They must never look like real server validation.
- **Keep existing project behavior.** Wrap the existing project selection/cards with the new chrome and visual treatment, preserving project fields, selection, details, and vote-bar behavior. Remove only the voter-flow dependency on category selection.

## Risks / Trade-offs

- [Local storage is not secure authentication] → Label all demo behavior and keep the integration seam explicit; replace the mock service and session store before production.
- [Glass effects can reduce contrast or overflow on 360px screens] → Use opaque-enough card surfaces, readable text colors, visible focus rings, responsive PIN sizing, safe-area spacing, and mobile-width checks.
- [Mock state can be mistaken for completed voting] → Use explicit demo labels and simulated result states; do not claim persistence or real PIN security.
- [Existing route assumptions may bypass the new session] → Guard `/projects`, verify direct navigation, and test login, reload, logout, and invalid-PIN paths.

## Migration Plan

1. Add the mock PIN service, typed session helpers, and reusable voter chrome/input components.
2. Replace the voter entry page and remove category selection from the voter route.
3. Add session-aware project navigation and restyle the existing project flow.
4. Verify mobile/desktop routes and all required mock states.
5. Future production integration replaces the mock verifier/session store and translation labels without changing the visual component contracts.

## Open Questions

- The final university logo, exhibition title, and event year assets/text remain placeholders until supplied.
- The production PIN API contract, session expiration policy, and real used-PIN/vote lifecycle remain intentionally undecided.
