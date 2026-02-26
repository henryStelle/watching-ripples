# Watching Ripples

A simulation that asks an enormous question:

> **Do my actions matter—can one person really make a difference?**

This project started after hearing someone ask Windstone Farm's founder, Dr. Kirstin Jeffrey Johnson, a version of: _"You're a small organization—can you really affect change?"_ The subtext landed on something even more personal: _"If I'm just one person, do my choices and relationships matter?"_

If people genuinely believe their actions don't matter, the result isn't neutrality—it's despair, disengagement, and (at the extreme) social unraveling. This tool is an attempt to answer that question concretely: **a ripple simulation of influence spreading through a social network**.

The core problem it addresses is a failure of intuition. We naturally model change **linearly**: I influence a few people, they mention it to a few others, and the signal fades. But when each person you reach becomes a source of influence themselves, growth **compounds**. Our intuitions about linear processes are reasonable. Our intuitions about exponential ones are reliably, demonstrably wrong—and that gap is exactly what this simulation makes visible.

## What this is

A React app that lets you play with the assumptions behind personal influence.

- You choose an **influence per year** value—how many people you meaningfully reach each year (fractional values like `0.5` work too).
- The simulation spreads that influence year-by-year through a stylized social network where ~95% of relationships stay within communities and ~5% act as bridges to the wider world.
- It visualizes the resulting growth curve and reports _why_ the simulation ended.

The interesting part isn't a single output number—it's watching a curve that looks flat for years suddenly accelerate, or seeing the network saturate unexpectedly early because bridge connections are too sparse.

## What this is not

This is important:

- **Not a predictive model of real-world outcomes.** It's a toy model designed to expose flaws in our linear intuitions about impact—not to forecast exact numbers.
- **Not a claim that "good things always scale."** Networks saturate. Bridge connections matter. Context matters enormously.
- **Not a replacement for community organizing, policy, technology, or institutions.** It's about the role of authentic relationships inside the bigger picture.

Think of it like a physics demo for social influence: it surfaces real patterns and constraints even though it's far simpler than the real world.

## Where the assumptions come from

The simulation is motivated by a few widely-cited ideas:

- People can only maintain a limited number of meaningful relationships (often discussed via Dunbar’s number).
- Most relationships cluster within communities; a smaller fraction bridge between groups.
- Large networks are still surprisingly connected ("six degrees" intuition).

## Run it

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:5173](http://localhost:5173).

## Parameters you can explore

- **Influence per year**: how many people each active influencer meaningfully reaches in a year. This is the primary lever—try values between `0.5` and `5`.
- **Total population**: the size of the simulated world.
- **Meaningful relationships per person**: average number of connections per person (default: 150, per Dunbar's number).
- **Within-community ratio**: how "clumpy" the network is—what fraction of relationships stay within a community vs. bridge outward. The bridge fraction is what lets the ripple cross into new groups.
- **Max simulation years**: a stop condition so the simulation doesn't run indefinitely.

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
