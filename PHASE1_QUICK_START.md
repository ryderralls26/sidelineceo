# PHASE 1 Quick Start Guide
## FlagFooty - Core Management & Dashboard

---

## 🚀 Getting Started

The development server is running on **http://localhost:3000**

All PHASE 1 features are now live and ready to test!

---

## ✨ New Features at a Glance

### 1. Share Feature 📤
**Where to find it:**
- Navigation bar (icon) - for logged-in users
- Dashboard header - "Recruit Your Crew" button
- Home page hero - "Share Playbook" button
- Archive footer - "Share FlagFooty" link

**What it does:**
Opens your email client with a pre-written referral message about FlagFooty

---

### 2. Enhanced Navigation 🧭
**Home Link Behavior:**
- **Not logged in:** Goes to home page (/)
- **Logged in:** Goes to dashboard (/dashboard)

---

### 3. Coach Dashboard Improvements 🎯

#### Team Card Interactions
**Main Click:** Sets active team → Navigates to /schedule

**Three-Dot Menu (⋮):**
- **Duplicate** - Copy team with full roster
- **Edit** - Modify team details
- **Delete** - Remove team (with confirmation)

#### Create/Edit Team Modal
**Fields:**
- Team Name (required)
- Sport (Flag Football or Soccer)
- Division (KIND, FR, SO, JR, SR)
- Season (Fall, Spring, Summer)
- Year (required)
- Logo Upload (optional)

---

### 4. Team Duplication 📋

**What gets copied:**
- ✅ Team info (name + " (Copy)")
- ✅ Logo
- ✅ Division, Season, Year
- ✅ All players (new records)
- ✅ Award types

**Duplication Defaults:**
- ✅ Play: Checked
- ✅ 4Q Lock: Unchecked

**What DOESN'T get copied:**
- ❌ Schedule/Games
- ❌ Game Cards
- ❌ Awards (historical)
- ❌ Quarters Played

---

### 5. Updated Award Types 🏆

**New Defaults for All Teams:**
1. MVP
2. Defensive Player of the Game
3. Offensive Player of the Game

**Migration:**
Run once to update existing data:
```bash
npx ts-node scripts/run-award-migration.ts
```

---

## 🎯 Testing Checklist

### Share Feature
- [ ] Click share icon in nav bar (logged in)
- [ ] Click "Recruit Your Crew" on dashboard
- [ ] Click "Share Playbook" on home page
- [ ] Click share link in archive footer
- [ ] Verify mailto link opens with correct subject/body

### Dashboard Navigation
- [ ] Verify Home link goes to /dashboard when logged in
- [ ] Click team card and verify navigation to /schedule
- [ ] Verify active team is set correctly

### Coach Dashboard
- [ ] Create a new team
- [ ] Upload a team logo
- [ ] Edit an existing team
- [ ] Duplicate a team with players
- [ ] Verify duplicated team has correct defaults
- [ ] Delete a team (with confirmation)
- [ ] View schedule from team card

### Award Types
- [ ] Create new team → Check default awards
- [ ] Duplicate team → Verify awards copied
- [ ] Run migration script (if needed)

---

## 📂 Key Files Reference

### New Components
```
/components/ShareButton.tsx          - Reusable share component
```

### Modified Pages
```
/app/dashboard/page.tsx              - User dashboard
/app/page.tsx                        - Landing page
/app/archive/page.tsx                - Archive page
/app/coach-dashboard/CoachDashboardClient.tsx - Coach dashboard
```

### Server Actions
```
/lib/actions/teams.ts                - Team management logic
/lib/actions/awards.ts               - Award defaults
/app/api/actions/teams.ts            - Team API endpoints
```

### Migration
```
/lib/migrations/rename-award-types.ts - Award migration
/scripts/run-award-migration.ts       - Migration runner
```

---

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Run award type migration (one-time)
npx ts-node scripts/run-award-migration.ts

# Build for production
npm run build

# Run production server
npm start
```

---

## 🐛 Troubleshooting

### Issue: Share button not showing in nav
**Solution:** Make sure you're logged in. Share button only appears for authenticated users.

### Issue: Team duplication not working
**Solution:** Ensure the user has COACH role for the team being duplicated.

### Issue: Home link not going to dashboard
**Solution:** Verify user is logged in. Navigation logic checks authentication state.

### Issue: Award types incorrect
**Solution:** Run the migration script to update existing data:
```bash
npx ts-node scripts/run-award-migration.ts
```

---

## 📋 API Reference

### Team Duplication
```typescript
duplicateTeam(teamId: string, userId: string)
```
- **Returns:** `{ success: boolean, team?: Team, error?: string }`
- **Creates:** New team with copied roster and award types
- **Transaction:** Atomic operation via Prisma

### Share Button
```typescript
<ShareButton variant="button" | "link" | "icon">
  Custom Text (optional)
</ShareButton>
```

---

## 🎨 UI/UX Notes

### Colors
- Primary: `#16a34a` (green-600)
- Secondary: `#22c55e` (green-500)
- Background: `#1e293b` (slate-800)

### Components
- All modals use backdrop blur
- Buttons have gradient hover effects
- Cards have border transitions on hover

### Accessibility
- Icon buttons have aria-labels
- Modals can be closed with click outside
- Menu closes when option selected

---

## 🚦 Status

**PHASE 1: ✅ COMPLETE**

All features from Prompts 16, 17, 18, and 19 have been successfully implemented and are ready for testing.

**Development Server:** ✅ Running
**Compilation:** ✅ No Errors
**Type Safety:** ✅ Verified

---

## 📞 Support

For issues or questions about PHASE 1 implementation:
1. Check this Quick Start Guide
2. Review PHASE1_IMPLEMENTATION_SUMMARY.md for details
3. Check browser console for runtime errors
4. Verify database connection and Prisma setup

---

**Ready to test!** 🎉

Navigate to http://localhost:3000 to see all the new features in action.
