# Watching Ripples

A tiny, story-driven simulation about an enormous question:

> **Do my actions matter—can one person really make a difference?**

This project started after hearing someone ask Windstone Farm’s founder, Dr. Kirstin Jeffrey Johnson, a version of: _“You’re a small organization—can you really affect change?”_ The subtext landed on something even more personal: _“If I’m just one person, do my choices and relationships matter?”_

If people genuinely believe their actions don’t matter, the result isn’t neutrality—it’s despair, disengagement, and (at the extreme) social unraveling. This repository is my attempt to answer that question with a tool that feels concrete: **a ripple simulation of influence through relationships**.

It’s not a marketing pitch, a political program, or a guarantee. It’s a way to _see_ how meaningfully impacting even **one person per year** can compound through a social network—sometimes reaching very large numbers over decades depending on assumptions.

## What this is

A single-page HTML simulation you can open in a browser and play with.

- You choose an “influence per year” value (including fractional values like `0.5`).
- The simulation spreads influence year-by-year through a stylized social network.
- It visualizes growth over time and reports _why_ the simulation ended.

## What this is not

This is important:

- **Not a predictive model of real-world outcomes.** It’s a toy model designed to show flaws in our intuition regarding impact.
- **Not a claim that “good things always scale.”** Networks saturate. Bridge connections matter. Context matters.
- **Not a replacement for community organizing, policy, technology, or institutions.** It’s about the role of relationships inside the bigger picture.

Think of it like a “physics demo” for social influence: it can show patterns and constraints, even if it can’t forecast exact numbers.

## Where the assumptions come from

The simulation is motivated by a few widely-cited ideas:

- People can only maintain a limited number of meaningful relationships (often discussed via Dunbar’s number).
- Most relationships cluster within communities; a smaller fraction bridge between groups.
- Large networks are still surprisingly connected ("six degrees" intuition).

## Run it

TODO: update with correct steps once this is migrated to React + WASM

## Parameters you can explore (plain English)

Inside the UI you can tweak:

TODO: update the naming of parameters to be more descriptive.

- **Influence per year**: how many people each active influencer meaningfully impacts per year.
- **Total population**: the size of the simulated world.
- **Meaningful relationships per person**: average number of connections.
- **Within-community ratio**: how “clumpy” relationships are (how many stay local vs. bridge outward).
- **Max simulation years**: a stop condition so the sim doesn’t run forever.

The interesting part isn’t a single number—it’s how outcomes change when you change the _shape_ of the network.

## Contributing

Contributions are welcome, especially if they help keep the project:

- Story-first (readable to non-developers)
- Honest about limitations
- Simple to run
- Easy to extend

If you open an issue/PR, please describe the motivation in plain language first, and the code change second.

## License

MIT — see [LICENSE](LICENSE).
