# Design Guide

This document describes the main color variables used in the project and how they relate to Upbit's visual palette. It also lists common component class names so that CSS designers know where to apply styles.

## Color Variables

The global CSS variables are defined in [`src/styles/variables.css`](../src/styles/variables.css) and applied via [`src/styles/global.css`](../src/styles/global.css). They mirror Upbit's palette, using blue tones for primary actions and the Korean convention of red for upward price movement and blue for downward.

| Variable | Hex | Purpose |
|----------|-----|---------|
| `--primary-blue` | `#007bff` | Upbit main blue used for links and highlights |
| `--primary-blue-dark` | `#0069d9` | Darker blue for active states |
| `--secondary-text` | `#5a6677` | Secondary text color |
| `--light-text` | `#8c98a9` | Subtle text and placeholders |
| `--primary-text` | `#1e2026` | Default body text |
| `--background` | `#f4f5f8` | Light mode background |
| `--panel` | `#ffffff` | Panel backgrounds |
| `--border` | `#e3e6ea` | Borders and separators |
| `--input-background` | `#ffffff` | Input fields |
| `--button-hover` | `#f0f2f5` | Hover state for buttons |
| `--red-price` | `#d60000` | Price increase (red) |
| `--green-price` | `#0051c7` | Price decrease (Upbit blue) |
| `--background-dark` | `#121212` | Dark mode background |
| `--panel-dark` | `#1e1e1e` | Dark mode panels |
| `--text-dark-primary` | `#e0e0e0` | Dark mode primary text |
| `--text-dark-secondary` | `#a0a0a0` | Dark mode secondary text |
| `--border-dark` | `#333333` | Dark mode borders |

## Component Class Reference

Use the following class names when styling common UI elements:

| Component | Example Classes |
|-----------|----------------|
| Buttons | `.login-btn`, `.register-btn`, `.order-btn`, `.quick-order`, `.submit-order` |
| Headers | `.navbar`, `.coin-header`, `.chart-header`, `.sidebar-header` |
| Tables  | `.coin-table`, `.sidebar-table`, `.orderbook` |

These class names appear across pages such as `TradingLayout`, `CoinListPage`, and `MarketSidebar`. Applying your custom styles to them ensures consistency with the existing markup.

