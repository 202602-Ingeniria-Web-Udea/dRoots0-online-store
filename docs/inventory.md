# Inventory

## Overview

The inventory domain has two entities:

- **Inventory master**: an item with a unique name, an initial balance and the user who created it.
- **Inventory movement**: an incoming or outgoing quantity registered against a master, with the responsible user and the moment it occurred (`occurredAt`).

Masters can only be created by administrators. Any authenticated user can register movements. Movements are append-only: there are no update or delete endpoints.

## Initial balance convention

The initial balance is a property of the master, **not** a movement. It is never stored as a movement, so it is counted exactly once in every calculation.

## Current balance

```text
currentBalance = initialBalance + sum(INCOMING) - sum(OUTGOING)
```

All authoritative calculations use decimal arithmetic (`decimal.js`) on top of `Decimal(14, 3)` database columns, so there is no floating-point drift. Values are converted to `number` only to draw the chart.

## Daily balance and chart

`buildDailyBalances` starts from the initial balance, applies the movements chronologically and returns the end-of-day balance for every calendar day from the first movement until today (days without movements repeat the previous balance). Days are grouped in the `America/Bogota` time zone (UTC-5, no daylight saving), so a movement registered at 21:00 on October 20 belongs to October 20 even though it is already October 21 in UTC.

The Transactions page plots this series as a line chart for the selected master, with labeled axes and a tooltip. The chart refreshes automatically after a movement is created.

## Movement validation and negative-balance policy

- The quantity must be a positive decimal with up to 3 decimals (zero, negative, malformed and non-finite values are rejected on the client and on the server).
- The movement type must be `INCOMING` or `OUTGOING`.
- The responsible user is always taken from the server session, never from the client.
- An outgoing movement that would make the balance negative is rejected.
- Writes run inside a `Serializable` database transaction that is retried on write conflicts, so concurrent requests cannot produce an invalid balance.
- Errors returned to the client are generic and never include stack traces.

## Tests

Run `pnpm test`. The suite covers the balance calculation, the daily series, input validation, movement creation rules (including the negative-balance policy and retries) and the authorization of master creation.