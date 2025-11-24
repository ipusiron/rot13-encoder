# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ROT13 encoder/decoder educational tool - a single-page web application that demonstrates the ROT13 cipher (Caesar cipher with 13-character shift). The tool provides real-time conversion and interactive visualization of the cipher mapping.

## Architecture

- **Modular structure**: Separated into HTML, CSS, and JavaScript files
- **Static site**: No build process or dependencies - runs directly in browser
- **Educational focus**: Designed for learning classical cryptography concepts
- **Class-based JavaScript**: ROT13Encoder class encapsulates all functionality

## Core Components

### JavaScript Functions
- `rot13(str)`: Core cipher implementation using ASCII character manipulation
- `createTable()`: Dynamically generates interactive cipher mapping tables
- `highlightChars(text)`: Visual feedback system that highlights corresponding characters in cipher tables
- `convert()`: Real-time text conversion with visual updates

### UI Elements
- Dual cipher tables (uppercase/lowercase) with visual character mapping
- Input/output text areas with real-time conversion
- Interactive highlighting system that shows cipher relationships
- Copy/clear utility buttons

## Development Commands

Since this is a static HTML site with no build process:
- **Local testing**: Open `index.html` directly in browser or use `python -m http.server` for local server
- **No build/lint/test commands**: Project uses vanilla HTML/CSS/JS without tooling

## Development Notes

- Uses vanilla JavaScript (no frameworks or build tools)
- Responsive design with CSS flexbox
- Character highlighting uses DOM manipulation with class toggling
- ROT13 implementation handles only ASCII A-Z and a-z (numbers/symbols unchanged)
- Modern JavaScript features: classes, arrow functions, async/await for clipboard API

## Deployment

This is a GitHub Pages site served from the main branch. Any changes pushed to main are automatically deployed to the live demo at: https://ipusiron.github.io/rot13-encoder/

## Key Implementation Details

- ROT13 logic: `((char.charCodeAt(0) - start + 13) % 26) + start` where start=65 for uppercase, 97 for lowercase
- Cipher tables built dynamically with unique IDs for highlighting (`up-A`, `uc-A`, `lp-a`, `lc-a`)
- Real-time conversion triggered by `input` event listener
- Copy functionality uses modern `navigator.clipboard` API with `document.execCommand('copy')` fallback

## Files

- `index.html`: Main HTML structure and markup
- `styles.css`: All CSS styling and responsive design
- `script.js`: JavaScript functionality using ROT13Encoder class
- `README.md`: Comprehensive project documentation in Japanese
- `*.png`: Educational images showing cipher mechanics and screenshots