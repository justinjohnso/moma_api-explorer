# AGENTS.md — MoMA NYU Hackathon

Hackathon project for MoMA collection exploration. Contains MoMA API playground, Solana integration app, and local MoMA collection database tools.

## Quick Reference

### Local Collection Database
```bash
cd moma-local-collection
python build_moma.py          # Build SQLite DB from MoMA JSON data
```
**Prerequisites:** Ensure `git lfs pull` has been run in `collection/` to fetch the large JSON files.

### Database Schema
- `artworks` table: ObjectID (PK), Title, Artist, Date, Medium, Dimensions, etc.
- `artists` table: ConstituentID (PK), Name, Nationality, Gender, BirthYear, DeathYear, etc.

## Project Structure

```
moma-nyu-hackathon/
├── app-moma-api/             # MoMA API playground/exploration app
├── app-moma-sol/             # Solana blockchain integration app
└── moma-local-collection/    # Local MoMA collection database tools
    ├── build_moma.py         # Script to build SQLite DB from JSON
    ├── moma_full.db          # SQLite database (generated)
    └── collection/           # MoMA collection data (git submodule)
        ├── Artworks.json     # ~160K artwork records
        └── Artists.json      # ~16K artist records
```

## MoMA Collection Data

The local collection contains the full MoMA public dataset:
- **Artworks**: 160,629 records with metadata (title, artist, date, medium, dimensions, acquisition date)
- **Artists**: 15,859 records with metadata (name, nationality, gender, birth/death years, Wiki QID, Getty ULAN ID)
- **License**: CC0 (public domain)
- **Source**: [MoMA Collection on GitHub](https://github.com/MuseumofModernArt/collection)

### Working with the Database
```python
import sqlite3
conn = sqlite3.connect("moma-local-collection/moma_full.db")
cur = conn.cursor()

# Example queries
cur.execute("SELECT Title, Artist, Date FROM artworks LIMIT 10")
cur.execute("SELECT DisplayName, Nationality FROM artists WHERE Gender = 'Female'")
```

## Code Conventions

- **Language**: Python for data processing, JavaScript/TypeScript for apps
- **Database**: SQLite for local collection queries
- **Data cleaning**: The `build_moma.py` script handles JSON array formatting and null values

## Development Principles

1. **Use the local database** for fast prototyping rather than hitting external APIs
2. **Respect data attribution** — credit MoMA when using collection data publicly
3. **Handle incomplete data** — many records are "not Curator Approved" with missing fields
4. **Test with subsets first** — the full dataset is large; use LIMIT clauses during development

## Git Workflow & Branch Hygiene (Mandatory)

1. **No direct feature work on `main`:** start every implementation in a dedicated branch.
2. **Use worktrees for active efforts:** each significant task gets its own `git worktree` + branch pair.
3. **Fleet/parallel rule:** if running multiple workflows in parallel ("fleet"), each workflow must run in a separate worktree/branch.
4. **Commit as you go:** create small, logical commits at each stable milestone, not one large end-of-session commit.
5. **Keep working trees clean:** before context-switching, either commit, or explicitly stash with a clear label.
6. **Merge readiness gate:** merge to `main` only after relevant checks pass.
7. **PR-first integration:** prefer merge via PR (even solo) to preserve review history and rollback clarity.
8. **Never add `Co-authored-by` trailers** to git commit messages.
