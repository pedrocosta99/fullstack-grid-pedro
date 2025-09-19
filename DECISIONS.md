# Design Decisions

Please fill out this document with your design decisions and rationale as you implement TinyGrid.

## Design Analysis

### V7 Labs Study

After reviewing [v7labs.com](https://v7labs.com):

I really liked how it felt clean and professional. Their animations were gentle and everything had breathing room. Too much scrolling through but they have good amount of information each step.

**What I would adapt differently:**

- TODO: What doesn't translate well to spreadsheet UX?
- TODO: What would you change for this use case?

- To be honest, I totally disliked this style. Too bright for my taste. Does not feel professional, as I expect from a spreadsheet.
- Too colorful and dark, too much contrast.
- Distracting

### My Take

I ended up taking V7's spacing principles but made it more focused and kinda colorful with green and orange that I felt like would make it a little less rigid.

## The Core Stuff

### How Cells Work

**Selection**: Click once to select, get a nice musk green ring around it. Simple.
**Editing**: Double-click or just start typing. Enter saves, Escape cancels, Tab moves to the next cell.
**Navigation**: Arrow keys move around, Tab goes right, Shift+Tab goes left.

### Cell

I used React's `useState` for most things. Focus management was tricky - had to be careful about when the grid vs formula bar was active. Event handling can get messy with all the bubbling.

## Making It Look Good

### Colors - The Musk Green & Dark Orange Combo

I went with musk green (`#2d6b2d`) as the main color because it feels earthy and professional. Dark orange (`#cc6600`) for buttons and interactive stuff because it pops without being too aggressive.

The full palette:

- **Musk Green**: From light (`#f0f9f0`) to dark (`#0d1f0d`)
- **Dark Orange**: From light (`#fff4e6`) to dark (`#4d2600`)
- **Neutrals**: Clean grays for backgrounds and borders

### Typography & Spacing

- Cells are 80px wide × 32px tall - comfortable to read
- 4px padding inside cells so text doesn't feel cramped
- System fonts for data, monospace for formulas
- 12px base size - small enough for density, big enough to read

### Visual Hierarchy

Headers are darker, selected cells get the musk green ring, errors show up in red. Interactive elements use the dark orange so you know what to click.

## The Formula Engine

I picked them all

- **SUM/AVERAGE**: Math stuff
- **COUNT**: Data validation
- **MIN/MAX**: Comparisons
- **IF**: Logic
- **CONCAT**: Text manipulation

They work together nicely and expose the edge cases I needed to handle.

### How It Works

Built a custom parser from scratch (which was surprisingly fun!). Tokenizer breaks down the formula, recursive descent parser handles precedence, then it evaluates everything. No fancy dependency graphs - just recalculate when things change.

## What I'm Proud Of

**The formula dropdown** - Users can discover formulas without memorizing syntax
**Focus management** - Seamless switching between grid and formula bar  
**The loading animation** - Multi-layered CSS that feels premium
**Case-insensitive formulas** - Because who wants to remember exact capitalization?

## What I Skipped

- Charts and pivot tables (too complex for this scope)
- Collaborative editing (would need real backend)
- Advanced formula dependencies (basic evaluation works fine)
- Data persistence (just session storage for now)

## Time Breakdown

- Setup & Planning: ~20 minutes
- Core Functionality: ~35 minutes
- Visual Design: ~30 minutes
- Formula Engine: ~20 minutes
- Testing & Polish: ~30 minutes
- Documentation: ~15 minutes

## If I Had More Time

- Undo/redo functionality
- Data persistence with localStorage
- Keyboard shortcuts help system
- Multi-cell selection

## The Bottom Line

This turned out way better than I expected. Building a custom formula parser was more satisfying than I thought it would be, and the focus on user experience details really paid off. The code is clean, maintainable, and ready for someone else to pick up and extend.

The musk green and dark orange color scheme gives it a unique, professional feel that's not too flashy but still modern. Perfect for a spreadsheet that people will actually want to use.
