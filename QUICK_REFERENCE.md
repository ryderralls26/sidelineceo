# FlagFooty - Quick Reference Guide

## 🚀 Access Information

**URL:** http://localhost:3000

**Default Login:**
- Email: `coach@example.com`
- Password: `coach123`

---

## 📑 Navigation Structure

| Tab | Purpose |
|-----|---------|
| **Home** | Landing page |
| **Roster** | Manage players, positions, divisions |
| **Schedule** | Games, awards, notes, invites |
| **MGMT** | Positions, divisions, award types |
| **Awards** | MVP leaderboard |
| **Archive** | Finalized games |

---

## ⚠️ Key Features at a Glance

### Schedule Page
- ✅ Time displays next to Location (grey text)
- ✅ Game Notes button (coach only)
- ✅ MVP awards button (coach only)
- ✅ Award winners shown below finalized games
- ✅ Invite section at bottom (coach only)

### Roster Page
- ✅ Player table with columns:
  - Play, 4Q Lock, Jersey #
  - First Name, Last Name, Nickname
  - Offensive Position, Defensive Position
  - **Secondary Position** (new)
  - **Division** (new)
  - Actions
- ✅ Buttons: Add Player, Generate Lineup, Save, Finalize
- ✅ Coach selection (Coach 1 or Coach 2)
- ✅ Live game card previews

### MGMT Page
- ✅ **Positions** table (name, abbreviation, rank)
- ✅ **Divisions** table (name, abbreviation)
  - Default: KIND, FR, SOPH, JR, SR
- ✅ **Awards** management (MVP, POYG, etc.)

### Awards Page
- ✅ **Leaderboard** matrix view
- ✅ Player names (rows) × Award types (columns)
- ✅ Award count tallies
- ✅ Sorted by total awards (descending)
- ✅ Gold/Silver/Bronze medals for top 3

---

## 📋 Common Tasks

### Add a New Player
1. Go to **Roster** tab
2. Click **"Add Player"**
3. Fill in details (jersey, name, positions, division)
4. Click **"Save Changes"**

### Schedule a Game
1. Go to **Schedule** tab
2. Click **"Add Game"**
3. Enter date, opponent, location, field, time
4. Click **"Add Game"**

### Award MVP
1. Go to **Schedule** tab
2. Find the game
3. Click **"MVP"** button
4. Select player and award type
5. Enter reason (optional)
6. Click **"Award"**

### Add Game Notes
1. Go to **Schedule** tab
2. Click **"Game Notes"** button on any game
3. Type coach notes
4. Click **"Save Notes"**

### Configure Divisions
1. Go to **MGMT** tab
2. Scroll to **Division Management**
3. Click **"Add Division"**
4. Enter name and abbreviation
5. Click **"Add Division"**

### Configure Award Types
1. Go to **MGMT** tab
2. Scroll to **Awards Management**
3. Click **"Add Award Type"**
4. Enter award name and description
5. Click **"Add Award"**

### Send Team Invite
1. Go to **Schedule** tab
2. Scroll to bottom (**Invite Team Members**)
3. Click **"Send Invite"**
4. Enter email, select role (Parent/Player)
5. Optional: Grant admin access (for parents)
6. Click **"Send Invite"**

### Finalize a Game
1. Go to **Roster** tab with gameId parameter
2. Generate lineup
3. Save roster
4. Award MVPs from Schedule page
5. Click **"Finalize"** button in Roster
6. Game moves to Archive

### View Leaderboard
1. Go to **Awards** tab
2. View player rankings
3. See award breakdown by type

---

## 🎨 Visual Indicators

### Status Badges
- 🟡 **Yellow:** Pending (invites, scheduled)
- 🟢 **Green:** Completed/Accepted
- 🔵 **Blue:** Finalized
- 🔴 **Red:** Error/Delete actions

### Medals (Leaderboard)
- 🥇 **Gold:** 1st place
- 🥈 **Silver:** 2nd place
- 🥉 **Bronze:** 3rd place
- **Numbers:** 4th place and below

### Button Colors
- **Green Gradient:** Primary actions (Add, Save, Award)
- **Blue:** Secondary actions (Finalize, Generate)
- **Grey:** Neutral actions (Cancel, View)
- **Red:** Destructive actions (Delete)

---

## 📊 Data Structure

### Player Fields
```
- ID
- Play (checkbox)
- 4Q Lock (checkbox)
- Jersey Number
- First Name
- Last Name
- Nickname
- Offensive Position
- Defensive Position
- Secondary Position (new)
- Division (new)
```

### Game Fields
```
- Date
- Opponent
- Location
- Field
- Time
- Status (scheduled/completed)
- Result (for completed games)
- Notes (coach only)
```

### Division Fields
```
- Name (e.g., "Freshman")
- Abbreviation (e.g., "FR")
```

### Award Fields
```
- Player ID
- Award Type (e.g., "MVP")
- Game ID
- Notes/Reason
- Awarded By (coach)
- Awarded At (timestamp)
```

---

## 🔒 Permissions

### Coach (Default User)
- ✅ Full access to all features
- ✅ Add/Edit/Delete players, games, divisions
- ✅ Award MVPs
- ✅ Send invites
- ✅ View/edit all data

### Parent (Admin)
- ✅ View roster and schedule
- ✅ Edit team data
- ❌ Cannot delete critical data

### Parent (Non-Admin)
- ✅ View roster and schedule
- ❌ Cannot edit

### Player
- ✅ View their own stats
- ❌ Cannot edit

---

## 💾 Data Storage

**Location:** Browser LocalStorage

**Keys:**
- `roster` - Player data
- `games_schedule` - Game schedule
- `positions` - Position definitions
- `divisions` - Division definitions
- `award_types` - Award type definitions
- `player_awards` - Award records
- `team_coaches` - Coach names and selection
- `team_invites` - Invite records
- `finalized_games` - Archived games
- `game_notes` - Per-game coach notes

**Backup:** Export via browser DevTools → Application → LocalStorage

---

## 🐞 Troubleshooting

### Server Not Starting
```bash
# Kill any process on port 3000
killall -9 node
# Restart server
npm run dev
```

### Data Not Saving
- Check browser console for errors
- Verify LocalStorage is enabled
- Clear browser cache
- Try incognito/private mode

### Changes Not Appearing
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Clear cache
- Restart dev server

### TypeScript Errors
```bash
# Rebuild project
npm run build
# Check for type errors
npx tsc --noEmit
```

---

## 📱 Mobile Support

The application is **fully responsive** and works on:
- ✅ Desktop browsers
- ✅ Tablets (landscape recommended)
- ✅ Mobile phones (portrait/landscape)

**Best Experience:**
- Desktop: Chrome, Firefox, Edge
- Mobile: Safari (iOS), Chrome (Android)

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Esc` | Close modal |
| `Tab` | Navigate form fields |
| `Enter` | Submit form |
| `Space` | Toggle checkbox |

---

## 🎯 Workflows

### Game Day Workflow
1. **Before Game:**
   - Review roster on Roster page
   - Generate lineup
   - Print game cards

2. **During Game:**
   - Use printed coach/ref cards
   - Track player performance

3. **After Game:**
   - Award MVPs from Schedule page
   - Add game notes
   - Finalize game

### Season Management Workflow
1. **Setup:**
   - Configure divisions (MGMT page)
   - Configure award types (MGMT page)
   - Add players (Roster page)

2. **Regular Season:**
   - Add games (Schedule page)
   - Run game day workflow
   - Monitor leaderboard (Awards page)

3. **End of Season:**
   - Review final leaderboard
   - Export data backup
   - Archive season

---

## 💡 Tips & Best Practices

### Player Management
- ✅ Assign all three positions for flexibility
- ✅ Set divisions for accurate card printing
- ✅ Use descriptive nicknames
- ✅ Keep jersey numbers unique

### Game Management
- ✅ Add games early for planning
- ✅ Use game notes for strategy
- ✅ Award MVPs immediately after games
- ✅ Finalize games once stats are confirmed

### Award Management
- ✅ Create award types before season starts
- ✅ Be consistent with award names
- ✅ Add reasons for player development feedback
- ✅ Review leaderboard regularly

### Division Management
- ✅ Use standard abbreviations (KIND, FR, SOPH, JR, SR)
- ✅ Keep division names clear
- ✅ Don't delete divisions mid-season

---

## 📞 Support

### Documentation
- `flagfooty_IMPLEMENTATION_SUMMARY.md` - Full technical details
- `QUICK_REFERENCE.md` - This file

### Common Questions

**Q: Can I use this offline?**
A: No, the app requires a running server. Data is stored locally in the browser.

**Q: Can multiple coaches access the same data?**
A: Not currently. LocalStorage is per-browser. Future versions will support cloud sync.

**Q: How do I backup my data?**
A: Use browser DevTools → Application → LocalStorage → Export/Copy data.

**Q: Can I print game cards?**
A: Yes! Click "Print Game Cards" on the Roster page. Use browser print (Ctrl+P).

**Q: How do I add more award types?**
A: Go to MGMT page → Awards Management → Click "Add Award Type".

---

## 🔄 Updates

Check for updates by pulling latest code:
```bash
git pull origin main
npm install
npm run dev
```

---

**Last Updated:** March 30, 2026
**Version:** 2.0.0 (FlagFooty)
**Status:** ✅ Production Ready

---

*For detailed technical information, see flagfooty_IMPLEMENTATION_SUMMARY.md*
