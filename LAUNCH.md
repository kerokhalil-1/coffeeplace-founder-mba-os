# CoffeePlace Founder MBA OS v2 — Launch Guide

## Fix & Launch (run once)
```bash
cd "/Users/kerokhalil/Documents/Claude/Projects/CoffeePlace Founder MBA OS/webapp"
rm -rf node_modules .next
npm install
npm run dev
```

Open: **http://localhost:3000**

---

## All 15 Pages

| Page | URL | What's Inside |
|------|-----|---------------|
| **Dashboard** | `/` | Founder Score, all stats, skill bars, roadmap progress, quick actions |
| **Founder Readiness** | `/readiness` | Dual score dials, weighted breakdown, recommendations, snapshot history |
| **Skill Scorecard** | `/skills` | 0–100 per discipline, evidence tracking, trend, Add Evidence |
| **Knowledge Map** | `/knowledge` | 14 disciplines, all topics/subtopics/objectives, completion tracking |
| **MBA Roadmap** | `/roadmap` | 6-month plan, checklists, CoffeePlace implementation, editable |
| **Courses** | `/courses` | Full CRUD, progress, instructor, link, key lessons, CoffeePlace app |
| **Books** | `/books` | 7 seeded books, progress, star rating, action items, CP applications |
| **Exams** | `/exams` | 3 real exams seeded (Finance, Operations, Marketing), MCQ + practical |
| **Case Studies** | `/case-studies` | 7 seeded companies, full analysis, CP applications |
| **Assignments** | `/assignments` | CRUD, topic-linked, scoring, CoffeePlace implementation |
| **Notes** | `/notes` | Two-panel editor, tags, pin, course linking |
| **CP Applications** | `/applications` | Kanban + list, idea→implemented pipeline |
| **Weekly Review** | `/weekly-review` | Structured CEO review with history |
| **Monthly Review** | `/monthly-review` | Deep monthly MBA reflection |

---

## What's Pre-loaded
- **Knowledge Map**: All 14 disciplines with ~60 topics and 200+ subtopics
- **MBA Roadmap**: 6 months of curriculum with goals, checklists, CoffeePlace tasks
- **Books**: 7 essential reads (E-Myth, Profit First, Blue Ocean, Good to Great, etc.)
- **Case Studies**: Starbucks, Blue Bottle, % Arabica, Costa, Sweetgreen, Chipotle, Pret
- **Exams**: Finance Fundamentals, Operations & Systems, Marketing & Brand (real questions)
- **Skill Scorecard**: All 14 categories ready to track (start at 0, build to 100)

---

## How to Build Your Founder Score
1. Complete topics in **Knowledge Map** → earn progress
2. Add **Evidence** to each skill manually (courses, exams, implementations)
3. Submit **Assignments** and get graded
4. Take **Exams** in Finance, Operations, Marketing
5. Watch your **Founder Readiness** score climb

All data saves locally in your browser. No server, no account required.
