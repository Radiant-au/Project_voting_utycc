## 1. Mock access and session boundary

- [x] 1.1 Add typed mock PIN categories, `MockPinSession`, and `verifyVotingPin(pin)` with the three demo PINs and deterministic preview outcomes for used, not-started, closed, and network-error states.
- [x] 1.2 Add a namespaced local-storage session helper that stores only `pinId`, `category`, and `hasVoted`, validates restored data, and exposes clear/logout behavior.
- [x] 1.3 Add focused frontend checks for valid Student/Teacher/Visitor PINs, invalid PINs, used PINs, malformed sessions, and the no-raw-PIN storage boundary.

## 2. Shared UTYCC voter components

- [x] 2.1 Create `UniversityBrand`, `LanguageSwitcher`, `GlassNavbar`, and `VoterCategoryBadge` with logo/exhibition/year placeholders, visual-only MY/EN state, and read-only assigned-category display.
- [x] 2.2 Create `VotingPinInput` with seven uppercase alphanumeric boxes, responsive sizing, focus movement, Backspace/arrow handling, complete paste, Enter submission, filtering, focus styling, and accessible labeling.
- [x] 2.3 Create `GlassLoginCard`, `DemoPinPanel`, `PinErrorMessage`, and `VotingPortalLogoutDialog` with copy feedback, demo-only labeling, validation messages, loading, success, and logout confirmation states.

## 3. PIN login route

- [x] 3.1 Replace the voter landing flow with the UTYCC PIN login page and remove Google OAuth/category-selection navigation from the voter path.
- [x] 3.2 Connect complete PIN submission to the mock verifier, simulated verifying delay, minimal session storage, success messaging, and redirect to `/projects`.
- [x] 3.3 Add invalid, used, not-started, closed, and network-error preview states without API routes, server actions, Supabase, or real authentication.

## 4. Glass project voting flow

- [x] 4.1 Guard `/projects` with the mock session and update its navigation with UTYCC branding, MY/EN control, assigned category badge, session menu, and Exit Voting Portal.
- [x] 4.2 Create or adapt `GlassProjectCard` to preserve project fields, details, search/filter/sort behavior, selected state, touch targets, and readable glass styling.
- [x] 4.3 Create or adapt `GlassVoteBar` with selected thumbnail/title, cancel, Vote Now, success, voting-not-started, and voting-closed feedback while preserving the existing frontend flow.

## 5. Responsive visual system

- [x] 5.1 Implement the mobile-first UTYCC glassmorphism background, card surfaces, borders, shadows, focus rings, gradients, safe-area spacing, and restrained floating elements using existing CSS and dependencies.
- [ ] 5.2 Verify 360px, tablet, and desktop layouts for no overflow, readable contrast, visible language controls, usable PIN boxes, project cards, and sticky vote controls.
- [x] 5.3 Add reduced-motion behavior and keyboard/accessibility checks for PIN entry, navigation, dialogs, language controls, and project selection.

## 6. Verification and integration boundaries

- [x] 6.1 Run the main typecheck, production build, and relevant frontend checks without adding backend or authentication infrastructure.
- [ ] 6.2 Exercise empty, partial, complete, invalid, verifying, valid category, already-used, unavailable voting, network-error, successful-login, and logout-confirmation states.
- [x] 6.3 Document the exact future seams for real PIN verification, category/used-PIN validation, voting session persistence, logout expiration, and Myanmar/English translations.
