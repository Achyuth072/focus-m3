# Data Safety & Backup Strategy

**File:** `docs/BACKUP_STRATEGY.md`
**Purpose:** Automated insurance against bad code or accidental deletions.

## 1. The Strategy

Since Supabase Free Tier does not offer Point-in-Time Recovery (PITR) for free, we will implement a **"Nightly Dump"** strategy.

1.  A GitHub Action runs every night at 3 AM.
2.  It connects to your Supabase DB.
3.  It runs `pg_dump` (extracts all data to a file).
4.  It commits this file to a private branch in your repo.

## 2. Implementation (GitHub Action)

Create this file at `.github/workflows/backup.yml`:

```yaml
name: Nightly Database Backup

on:
  schedule:
    - cron: "0 3 * * *" # Runs at 03:00 UTC every day
  workflow_dispatch: # Allows you to run it manually from GitHub UI

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Install Postgres Client
        run: sudo apt-get install -y postgresql-client

      - name: Dump Database
        env:
          # Add this to your GitHub Repo Secrets: SUPABASE_DB_URL
          # Format: postgres://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
          DATABASE_URL: ${{ secrets.SUPABASE_DB_URL }}
        run: |
          mkdir -p backups
          # Dump data to a compressed file with date
          pg_dump $DATABASE_URL -F c -b -v -f backups/backup_$(date +%Y-%m-%d).dump

      - name: Delete Old Backups (Keep last 7 days)
        run: |
          cd backups
          ls -t 2>/dev/null | tail -n +8 | xargs -r -I {} rm -- {}

      - name: Commit and Push
        run: |
          git config --global user.name 'Backup Bot'
          git config --global user.email 'bot@noreply.github.com'
          git add backups/
          git commit -m "Automated DB Backup: $(date +%Y-%m-%d)"
          git push
```

## 3. Restoration Plan

If you accidentally delete your data:

1.  Pull the latest backup file from GitHub.
2.  Run: `pg_restore -d [YOUR_DB_URL] backups/backup_2025-XX-XX.dump`
