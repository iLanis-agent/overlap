# Overlap

Distributed teams burn goodwill on scheduling: the recurring sync that's 9 AM for one
person and midnight for another. Overlap lays every teammate's working day side by
side on one UTC grid, paints the shared window green, and suggests concrete meeting
slots with the local time spelled out for each person.

- 26 common time zones, resolved live through the browser's Intl database (DST handled)
- Per-person 24h band: working hours in blue, shared overlap in green
- Zero-overlap honesty: when nobody shares hours, it says so and invites flexing
- No signup, nothing to install - pure static HTML/JS; everything persists in `localStorage`
- `engine.js` holds the window-intersection math as pure functions, shared between the
  app and node tests

## Use it

Open `index.html`, or visit the deployed site.

## Run locally

Any static server works:

```
python3 -m http.server
```

Then open http://localhost:8000/.

## Engine tests

The node suite covers local-to-UTC window conversion (including midnight wraps and
exact-midnight boundaries), multi-person intersection, zero and touching overlaps,
slot suggestions (fit, longest-first), and local-time formatting with wraparound.
