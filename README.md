
# Wayfriend

> A pocket-sized travel assistant for everyday moments abroad. Every cent counts.

Wayfriend is an open-source mobile app for tourists and budget-conscious travelers. Instead of selling itineraries, it focuses on the small tasks that are difficult in practice: converting prices on the spot, finding affordable food nearby, tracking expenses, and keeping bookings and tickets organized — with or without an internet connection.

> **Status: Design and specification phase.** The product design and technical specification are complete. App development has not started yet. See the [Roadmap](#roadmap).
>
> **Working name.** The final product name is still being decided.

## Why Wayfriend?

Travelers still convert prices in their heads, lose track of expenses on calculators, overlook card fees, and keep bookings scattered across multiple apps.

Wayfriend aims to replace these fragmented workflows with one simple, reliable travel companion.

## Features

- **Price lists with automatic currency conversion.** Save items while shopping. Each price is stored in its original currency and converted to your home currency, with a running total.
- **Price-tag scanner.** Scan a price tag with your camera and add the item to your list. Text recognition runs on the device.
- **Affordable food map.** Find nearby meal deals and budget-friendly food, with walking times and community-confirmed prices. Compare options to see whether a longer walk offers a better deal.
- **Trip budget.** Plan and track spending by category before and during your trip.
- **Real payment cost.** Compare paying in the local currency with paying in your home currency, including card fees.
- **Plans, tours, bookings, and tickets.** Organize your trip and access saved tickets and QR codes offline.
- **Travel memories.** Get a post-trip summary with visited places, distance walked, and spending.
- **AI assistant.** Ask questions and get place recommendations grounded in verified price and location data. The assistant should clearly indicate when it does not have enough information.
- **Offline-first experience.** Lists, budgets, tickets, and downloaded city packs remain available without an internet connection.

## Design

The design system, including colors, typography, components, and screen specifications, is documented in [`docs/TROCADO_SPEC.md`](docs/TROCADO_SPEC.md).

Reference images are available in [`docs/design/`](docs/design/).

## Planned Tech Stack

| Area | Technology |
|---|---|
| Mobile app | React Native, Expo, TypeScript, `expo-router` |
| Local database | `expo-sqlite` with Drizzle ORM |
| State management | TanStack Query, Zustand |
| Maps | MapLibre with OpenStreetMap data and offline packs |
| Text recognition | On-device ML Kit (Android) and Vision (iOS) |
| Backend | PostgreSQL, potentially Supabase, with a lightweight API |
| AI | Claude model accessed exclusively through the backend and grounded in verified project data |
| Exchange rates | Pluggable provider with backend and device-side caching |

## Technical Principles

1. **Offline-first.** The local database is the source of truth for the user interface.
2. **Accurate money handling.** Monetary amounts are stored as integers in the currency's smallest unit, alongside an ISO 4217 currency code. Conversions use explicit rounding rules. Floating-point arithmetic is not used for monetary values.
3. **Timestamped exchange rates.** Every conversion records the exchange rate used and when it was retrieved.
4. **Privacy by default.** Location is accessed only with permission. Photos remain on the device unless the user explicitly chooses otherwise.
5. **Grounded AI.** The assistant uses verified data and never invents prices or opening hours.
6. **Transparent costs.** Currency conversions and payment comparisons make applicable rates, fees, and assumptions explicit.

## Getting Started

The application is currently in the design and specification phase. Its source code and development setup are not available yet.

Once implementation begins, this section will include installation instructions, development commands, and setup requirements.

```bash
git clone https://github.com/priscillalea/travel-friend.git
cd travel-friend

# Installation and development commands will be available
# once the initial implementation is released.
```

## Roadmap

- [x] Product design and technical specification
- [ ] **Phase 1 — MVP:** Price lists with currency conversion, price-tag scanner, offline support, and one launch city
- [ ] **Phase 2 — Affordable food map:** Nearby food options and community price votes
- [ ] **Phase 3 — Trip finances:** Budget tracking and real payment cost comparison
- [ ] **Phase 4 — Trip organization:** Plans, tours, bookings, and tickets
- [ ] **Phase 5 — AI and memories:** Grounded travel assistant and post-trip summaries
- [ ] **Phase 6 — Sustainability:** Subscription and affiliate partnerships

## Contributing

Contributions will be welcome once the initial implementation is available.

In the meantime, you can open an issue to share feedback, discuss the product design, or suggest improvements to the technical specification.

Before submitting a pull request:

- Open an issue to discuss significant changes before implementation.
- Add tests for logic involving money, currency conversion, and rounding.
- Sign off your commits using `git commit -s`, certifying the [Developer Certificate of Origin (DCO)](https://developercertificate.org/).

Contributors may be asked to agree to a Contributor License Agreement (CLA) in the future. This would allow the project to offer a commercial license alongside its open-source license.

## License

Wayfriend is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

See [`LICENSE`](LICENSE) for the full license text.

The AGPL-3.0 is a strong copyleft license. If you modify the covered source code and distribute your modified version, you must make the corresponding source code available under the same license. If you modify the software and make it available to users over a network, the AGPL-3.0 also requires you to offer those users access to the corresponding source code of your modified version.

### What the license covers

- **Source code:** Covered by the GNU AGPL-3.0.
- **Name and logo:** The project name, logo, and other brand assets are not automatically licensed for use in other products.
- **Data:** The project's price and place database is not included in this repository's code license and may have separate terms.
- **Map data:** OpenStreetMap data is subject to the [Open Database License (ODbL)](https://www.openstreetmap.org/copyright).

See the license text for the complete terms and conditions.
