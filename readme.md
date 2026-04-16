# BIQ Basketball

A full-stack basketball analytics app built to explore NBA data through a custom player rating system called **BIQ** (**Basketball IQ**).

BIQ Basketball started as a fun project and turned into a great way for me to dive deeper into data analytics, sports data, backend performance, and building a cleaner user-facing product around all of it. The app combines a custom scoring formula, player and team pages, search, and a synced data pipeline to make basketball stats easier to explore and compare.

---

## Features

- Custom **BIQ** player rating formula
- NBA player leaderboard
- Player profile pages
- Team profile and dashboard pages
- Player and team search
- Cached backend responses for faster load times
- Data sync pipeline for processing NBA stats
- Full-stack architecture with separate frontend and backend layers

---

## BIQ Score Overview

The BIQ score is my custom formula for rating NBA players beyond just raw points per game.

It is designed to reward players who contribute in multiple ways, including:

- scoring
- playmaking
- rebounding
- defensive activity
- efficiency
- overall impact

The formula also tries to avoid overvaluing empty volume. A player scoring a lot inefficiently should not rate the same as someone contributing efficiently across the board. The goal is to create a more balanced rating that better reflects complete, winning basketball.

---

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- CSS

### Backend
- FastAPI
- Python
- Pydantic

### Data / Analytics
- NBA stats data
- Custom BIQ scoring pipeline
- Local processed snapshots
- Caching layer for performance improvements

---

## Project Structure

```bash
biq-basketball/
├── frontend/              # Next.js frontend
├── backend/               # FastAPI backend
├── app/                   # API routes, services, models
├── data/                  # processed data / snapshots
├── scripts/               # sync and analytics scripts
├── lib/                   # shared frontend utilities
└── README.md

Main Pages

Player Leaderboard

Ranks players using the BIQ formula so users can quickly compare overall impact.

Player Profiles

Shows more detailed player information, stats, and BIQ-related context.

Team Dashboards

Adds team-level context and gives the app more than just individual player rankings.

Search

Makes it easy to find players and teams without digging through large datasets manually.