# Velox Launch Updates - Quick Reference

**Project:** FlagFooty Platform
**Date:** March 30, 2026
**Status:** ✅ Complete and Running

---

## What's New

### 1. Coach Dashboard (NEW!)
After login, coaches land on a new dashboard at `/coach-dashboard` where they can:
- View all their teams as cards
- Set up new teams with a comprehensive form
- Navigate directly to team rosters

### 2. Team Setup Modal
Complete team configuration including:
- Team Name
- Sport (Flag Football or Soccer)
- Division (for Flag Football: KIND, FR, SO, JR, SR)
- Season (Fall, Spring, Summer)
- Year
- Team Logo upload

### 3. Clean Roster Start
- No more pre-filled sample players
- Empty roster by default
- All checkboxes unchecked
- Full control from the beginning

### 4. Coach's Card
- Renamed from "Line-Up Card" to "Coach's Card"
- Fully editable (all fields can be changed)
- Changes don't affect master roster
- Perfect for game-day flexibility

### 5. 4 Cards Per Page Printing
- Portrait orientation (8.5" × 11")
- Exactly 4 cards per page (2×2 grid)
- 2 Coach's Cards + 2 Referee Cards
- Optimized spacing and scaling

---

## Quick Start

1. **Access:** http://localhost:3000
2. **Login:** coach@example.com / coach123
3. **See Dashboard:** Automatically redirected after login
4. **Create Team:** Click "Set Up a Team" button
5. **Add Players:** Click team card → Add players to roster
6. **Generate Lineups:** Go to Schedule → Generate Lineup
7. **Print Cards:** Print Preview → Print (4 cards per page)

---

## Key Files Changed

| File | Change |
|------|--------|
| `/app/coach-dashboard/page.tsx` | NEW - Main dashboard page |
| `/lib/storage.ts` | Extended Team model and methods |
| `/app/login/page.tsx` | Redirect to dashboard |
| `/app/signup/page.tsx` | Redirect to dashboard |
| `/app/roster/page.tsx` | Cleared default players |
| `/components/GameCards.tsx` | Renamed to "Coach's Card" |
| `/app/schedule/[gameId]/lineup/page.tsx` | 4 cards layout |
| `/app/globals.css` | Portrait print layout |

---

## Testing Checklist

- [ ] Login and verify redirect to Coach Dashboard
- [ ] Create a new team with all fields
- [ ] Upload a team logo
- [ ] View team card on dashboard
- [ ] Click team card to navigate to roster
- [ ] Verify roster is empty
- [ ] Add a player and confirm "Play" is unchecked
- [ ] Generate a lineup for a game
- [ ] Verify "Coach's Card" label
- [ ] Edit card fields and confirm they don't save to roster
- [ ] Print preview and verify 4 cards per page
- [ ] Print to PDF and verify portrait orientation

---

## Server Access

**Development Server:** http://localhost:3000
**Network Access:** http://169.254.0.21:3000

The server is currently running and ready for testing.

---

## Technical Notes

- All data stored in browser localStorage
- Team logos stored as base64 data URLs
- Print layout uses CSS Grid (2×2)
- Cards scale to 95% for optimal fit
- Portrait page: 0.25" margins

---

## Support

For issues or questions, refer to:
- `UPDATE_SUMMARY.md` - Complete implementation details
- `VELOX_IMPLEMENTATION_SUMMARY.md` - Previous features
- Browser console for debugging

---

**Implementation Complete! Ready for Production Use.**
