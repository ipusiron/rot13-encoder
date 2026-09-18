# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ROT13 encoder/decoder educational tool - a single-page web application that demonstrates the ROT13 cipher (Caesar cipher with 13-character shift). The tool provides real-time conversion and interactive visualization of the cipher mapping.

## Architecture

- **Modular structure**: HTML, CSS, DOM-independent rot13.js, and DOM-handling script.js
- **Static site**: No build process or dependencies - runs directly in browser
- **Educational focus**: Designed for learning classical cryptography concepts
- **Class-based JavaScript**: ROT13Encoder class handles the UI; Rot13 exposes pure functions
- **Verification and documentation**: test/, package.json, .github/workflows/test.yml, assets/, and MIT LICENSE

## Core Components

### Pure Functions (rot13.js)
- `rot13(text)`: Core cipher implementation using ASCII character manipulation
- `buildTable()`: Uppercase and lowercase input/output pairs
- `usedLetters(text)`: Unique ASCII letters in alphabetical order
- `countStats(text)`: Code point counts for converted, unchanged, and fullwidth letters

### DOM Methods (script.js)
- `createTable()`: Dynamically generates interactive cipher mapping tables
- `highlightChars(text)`: Visual feedback system that highlights corresponding characters in cipher tables
- `convert()`: Real-time text conversion with visual updates

### UI Elements
- Dual cipher tables (uppercase/lowercase) with visual character mapping
- Input/output text areas with real-time conversion
- Interactive highlighting system that shows cipher relationships
- Copy/clear and result-to-input buttons, conversion counts, and a fullwidth-letter hint

## Development Commands

Since this is a static HTML site with no build process:
- **Local testing**: Open `index.html` directly in browser or use `python -m http.server` for local server
- **Tests**: `npm test` uses node --test on Node.js 22 or later, with no dependencies
- **CI**: GitHub Actions runs the tests on push and pull_request

## Development Notes

- Uses vanilla JavaScript (no frameworks or build tools)
- Responsive design with CSS grid: 26 columns on desktop, 13 columns by 2 rows at widths up to 700px
- Character highlighting uses DOM manipulation with class toggling
- ROT13 implementation handles only ASCII A-Z and a-z (numbers/symbols unchanged)
- Modern JavaScript features: classes, arrow functions, async/await for clipboard API

## Deployment

This is a GitHub Pages site served from the main branch. Any changes pushed to main are automatically deployed to the live demo at: https://ipusiron.github.io/rot13-encoder/

## Key Implementation Details

- ROT13 logic: `((char.charCodeAt(0) - start + 13) % 26) + start` where start=65 for uppercase, 97 for lowercase
- Do not normalize Unicode: keeping the original code units preserves rot13(rot13(text)) === text
- Do not use the regular-expression i flag: with u, it would also match Kelvin sign and long s
- Classic deferred scripts and DOMContentLoaded keep file:// support and initialization order explicit
- Cipher tables built dynamically with unique IDs for highlighting (`up-A`, `uc-A`, `lp-a`, `lc-a`)
- Real-time conversion triggered by `input` event listener
- Copy uses navigator.clipboard only; on failure, select the output for manual copying
- Copy labels and status messages use separate resettable timers; styling uses classes only
- User data is rendered with textContent/value. No network requests, storage, or Unicode normalization
- Meta CSP and no-referrer are set; inline event handlers and inline styles are not used

## Files

- `index.html`: Main HTML structure and markup
- `styles.css`: All CSS styling and responsive design
- `script.js`: JavaScript functionality using ROT13Encoder class
- `rot13.js`: Pure conversion, table, letter collection, and statistics functions
- `README.md`: Comprehensive project documentation in Japanese
- `*.png`: Educational images showing cipher mechanics and screenshots
- `assets/`: Three current screenshots (desktop, mobile, fullwidth hint)
- `test/`: Logic, README, HTML, contrast, and formatting tests
- `package.json`: Dependency-free npm test command
- `.github/workflows/test.yml`: Node.js 22 CI
- `LICENSE`: MIT License, Copyright (c) 2025 ipusiron
