# Habit Tracker Integration: Loop Habit Tracker (uhabits)

This document outlines the viability and technical mapping for importing data from [Loop Habit Tracker (uhabits)](https://github.com/iSoron/uhabits) into Kanso.

## 1. Viability: HIGH ✅

Loop Habit Tracker is a mature, open-source Android application that uses a local SQLite database and supports full data exports (SQLite and CSV). Its data structure is compatible with Kanso's "Mastery System" goals.

## 2. Technical Mapping

### Database Tables (SQLite)

| uhabits Table | Kanso Concept           | Description                                                   |
| :------------ | :---------------------- | :------------------------------------------------------------ |
| `Habits`      | **Mastery Categories**  | Definition of habits (name, description, frequency).          |
| `Repetitions` | **Activity Heatmap**    | Individual completion entries with timestamps and values.     |
| `Scores`      | **Flow Score**          | Historical habit strength scores, useful for "Insight" views. |
| `Streaks`     | **Consistency Circles** | Historical data for long-term consistency visualization.      |

### Schema Details

- **Habit ID**: Primary key linking definitions to entries.
- **Timestamps**: Stored as Unix timestamps (milliseconds) or ISO dates depending on export version.
- **Values**: `entry` values represent completion or numerical progress.

## 3. Implementation Strategy

### Import Flow

1. **User Action**: Provide an "Import from Loop" button in settings.
2. **File Handling**: User uploads the `.db` file (SQLite) or a zip containing the `.csv` files.
3. **Parsing**:
   - For `.db`: Use `sql.js` or similar client-side SQLite library to query tables.
   - For `.csv`: Parse using a standard CSV library.
4. **Data Injection**:
   - Map uhabits `Habits` to Kanso `projects` or a dedicated `mastery_skills` table.
   - Map `Repetitions` to a unified `activity_log` table.

### Data Normalization

- **Frequency**: Convert uhabits frequency strings/integers to Kanso's scheduling format.
- **Colors**: Map uhabits palette IDs to Kanso's "Matte & Ink" design tokens.

## 4. Design Guidelines (Zen-Modernism)

- **Ma (Space)**: Extracted data should be visualized using minimalist heatmaps and geometric consistency rings.
- **Seijaku (Calm)**: Avoid "Level Up" notifications during import. Focus on "Importing History" as a reflective act rather than a gamified one.

---

_Created: 2026-01-14_
