# SidelineCEO Final Polish Plan

## Overview
This plan outlines the final polish tasks for the SidelineCEO application, focusing on schedule management, roster/coach management, game card improvements, and UI polish for authentication.

---

## Task 1: Fix Schedule Page (app/schedule/page.tsx)

### 1.1 Import Verification
- **Action**: Ensure `Link` is correctly imported from `next/link`
- **Location**: Top of `app/schedule/page.tsx`
- **Validation**: Check import statement matches `import Link from 'next/link'`

### 1.2 Role-Based Button Visibility
- **Action**: Update 'Add Game' and 'MVP' buttons to only show if `canEdit` or `isCoach` is true
- **Implementation**:
  - Wrap button rendering in conditional checks: `{(canEdit || isCoach) && <button>...</button>}`
  - Apply to both 'Add Game' button and 'MVP' navigation button
- **Validation**: Test with different user roles (guest, player, coach, admin)

### 1.3 Add Time Field to Game Creation
- **Action**: Add a 'Time' field to the game creation modal form
- **Implementation**:
  - Add time input field in the modal form (type="time" or custom time picker)
  - Update game creation state to include time field
  - Update Supabase insert operation to save time data
- **Database**: Ensure `games` table has a `time` column (add if missing)

### 1.4 Display Time in Schedule View
- **Action**: Update the game schedule view to show a 'Time' placeholder in the specified location
- **Implementation**:
  - Add time display in game card component
  - Format time display (12-hour or 24-hour format)
  - Position time near date information
- **Fallback**: Display "TBD" if time is not set

### 1.5 Final Roster Button for Coaches
- **Action**: Replace 'View in Archive' with 'Final Roster' for coach/admin roles on finalized games
- **Implementation**:
  - Check game status (finalized vs. active)
  - Check user role (isCoach || canEdit)
  - Conditionally render 'Final Roster' button instead of 'View in Archive'
  - Link to appropriate roster/lineup page
- **Logic**: `{(isCoach || canEdit) && gameFinalized ? 'Final Roster' : 'View in Archive'}`

---

## Task 2: Update Roster & Coaches (app/roster/page.tsx)

### 2.1 Add Horizontal Separator
- **Action**: Locate the bottom of the player roster table and add separator
- **Implementation**: Insert `<hr className="border-slate-700 my-8" />` after roster table
- **Location**: After player roster table closing tag, before coaches section

### 2.2 Create Coaches Section
- **Action**: Create a 'Coaches' section with two editable input slots
- **Implementation**:
  ```tsx
  <div className="coaches-section">
    <h2 className="text-xl font-bold mb-4">Coaches</h2>
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input type="checkbox" id="coach1-primary" />
        <label htmlFor="coach1-primary">Primary</label>
        <input type="text" placeholder="Coach 1" className="..." />
      </div>
      <div className="flex items-center gap-4">
        <input type="checkbox" id="coach2-primary" />
        <label htmlFor="coach2-primary">Primary</label>
        <input type="text" placeholder="Coach 2" className="..." />
      </div>
    </div>
  </div>
  ```
- **Styling**: Match existing roster table styling

### 2.3 Exclusive Checkbox Logic
- **Action**: Implement exclusive checkboxes for selecting the primary coach
- **Implementation**:
  - Use state to track which coach is primary: `const [primaryCoach, setPrimaryCoach] = useState<1 | 2 | null>(null)`
  - When checkbox is clicked, uncheck the other: `setPrimaryCoach(1)` or `setPrimaryCoach(2)`
  - Ensure only one checkbox can be checked at a time
- **Validation**: Test toggling between coaches

### 2.4 Pass Coach Name to GameCards
- **Action**: Ensure the selected coach's name is passed to the GameCards component
- **Implementation**:
  - Store coach names in state: `const [coach1Name, setCoach1Name] = useState('')`
  - Pass selected coach name to GameCards: `coachName={primaryCoach === 1 ? coach1Name : coach2Name}`
  - Save coach data to database/localStorage for persistence

---

## Task 3: Identical Game Cards (components/GameCards.tsx)

### 3.1 Sync CoachCard and RefereeCard UI
- **Action**: Make `CoachCard` UI identical to `RefereeCard` in layout
- **Implementation**:
  - Compare both component structures
  - Align grid/table layouts
  - Match spacing, borders, colors, and typography
  - Use same container classes and dimensions

### 3.2 CoachCard Position Abbreviations
- **Action**: Modify `CoachCard` to display position abbreviations (QB, WR, etc.) in Q1-Q4 columns
- **Implementation**:
  - Update Q1-Q4 cells to show player position abbreviations
  - Pull position data from player assignments
  - Display format: "QB", "WR", "RB", "CB", etc.
- **Data Source**: Player position assignments for each quarter

### 3.3 RefereeCard 'X' Markers
- **Action**: Modify `RefereeCard` to display 'X' in Q1-Q4 columns
- **Implementation**:
  - Update Q1-Q4 cells to show 'X' character
  - Center align the 'X' markers
  - Style consistently with CoachCard cells

### 3.4 Side-by-Side Layout
- **Action**: Display cards side-by-side in 2-up layout
- **Implementation**:
  ```tsx
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <CoachCard {...props} />
    <RefereeCard {...props} />
  </div>
  ```
- **Responsive**: Single column on mobile, two columns on desktop

### 3.5 Editable Input Fields
- **Action**: Add editable input fields for 'Team Name', 'Coach Name', and 'Division' directly on the card components
- **Implementation**:
  - Replace static text with controlled input components
  - Add state management for each field
  - Style inputs to match card aesthetic
  - Example:
  ```tsx
  <input
    type="text"
    value={teamName}
    onChange={(e) => setTeamName(e.target.value)}
    className="border-b border-slate-600 bg-transparent px-2 py-1"
    placeholder="Team Name"
  />
  ```

### 3.6 Print Functionality
- **Action**: Add a 'Print' button that triggers `window.print()` and saves a snapshot
- **Implementation**:
  - Add Print button to each card: `<button onClick={handlePrint}>Print</button>`
  - Create handlePrint function:
  ```tsx
  const handlePrint = async () => {
    // Save current card state to archive
    await saveToArchive({
      teamName,
      coachName,
      division,
      players: currentLineup,
      timestamp: new Date().toISOString()
    });
    // Trigger print dialog
    window.print();
  };
  ```
- **Print Styles**: Add `@media print` CSS rules to optimize print output
- **Archive**: Save snapshot to database before printing

---

## Task 4: UI Polish

### 4.1 Authentication Prompt
- **Action**: Implement a popup/modal/toast for unauthenticated users trying to access restricted features
- **Implementation**:
  ```tsx
  const showLoginPrompt = () => {
    // Using a toast library like react-hot-toast or custom modal
    toast.error('Please login for full features', {
      duration: 3000,
      action: {
        label: 'Login',
        onClick: () => router.push('/login')
      }
    });
  };
  ```
- **Triggers**: Wrap restricted actions with authentication checks
- **Example**: Before 'Add Game', 'Edit Roster', 'MVP Vote', etc.
- **Options**:
  - Option 1: Toast notification (lightweight, non-blocking)
  - Option 2: Modal dialog (more prominent)
  - Option 3: Inline message with redirect button

### 4.2 Install Toast Library (if needed)
- **Action**: Install react-hot-toast or similar
- **Command**: `npm install react-hot-toast`
- **Setup**: Add `<Toaster />` component to layout.tsx
- **Alternative**: Build custom modal component if preferred

---

## Verification Checklist

### Development Testing
- [ ] Run the dev server: `npm run dev`
- [ ] Navigate to `/schedule` page
- [ ] Test role-based button visibility (guest, player, coach, admin)
- [ ] Test 'Add Game' modal with new Time field
- [ ] Verify time display on game cards
- [ ] Check 'Final Roster' button for coaches on finalized games

### Roster & Coaches Testing
- [ ] Navigate to `/roster` page
- [ ] Verify horizontal separator displays correctly
- [ ] Test coach input fields (type names)
- [ ] Test exclusive checkbox selection (only one primary at a time)
- [ ] Verify selected coach name is passed to game cards

### Game Cards Testing
- [ ] Navigate to game cards view
- [ ] Verify CoachCard and RefereeCard are visually identical
- [ ] Check position abbreviations display in CoachCard Q1-Q4 columns
- [ ] Check 'X' markers display in RefereeCard Q1-Q4 columns
- [ ] Verify cards display side-by-side on desktop
- [ ] Test editable fields (Team Name, Coach Name, Division)
- [ ] Test Print button:
  - [ ] Triggers print dialog
  - [ ] Saves snapshot to archive
  - [ ] Print output looks clean

### Authentication Testing
- [ ] Logout or use incognito mode (guest user)
- [ ] Try to click 'Add Game' → Should show login prompt
- [ ] Try to click 'MVP' → Should show login prompt
- [ ] Try to edit roster → Should show login prompt
- [ ] Verify login prompt has working link to `/login` page

### Cross-Browser Testing
- [ ] Test on Chrome/Edge
- [ ] Test on Firefox
- [ ] Test on Safari (if available)
- [ ] Test responsive design (mobile, tablet, desktop)

---

## Implementation Order

1. **Start with Schedule Page** (Task 1)
   - Most critical user-facing features
   - Establishes authentication patterns

2. **Roster & Coaches** (Task 2)
   - Depends on schedule data
   - Feeds into game cards

3. **Game Cards** (Task 3)
   - Depends on roster/coach data
   - Most complex component changes

4. **UI Polish** (Task 4)
   - Can be implemented in parallel
   - Applies across all pages

---

## Database Schema Changes

### Games Table
Ensure the following columns exist:
```sql
ALTER TABLE games ADD COLUMN IF NOT EXISTS time TIME;
```

### Archive Table (if not exists)
```sql
CREATE TABLE IF NOT EXISTS game_archive (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID REFERENCES games(id),
  team_name TEXT,
  coach_name TEXT,
  division TEXT,
  lineup JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Notes

- **Testing Strategy**: Test each task immediately after implementation
- **Rollback Plan**: Use git commits after each major task completion
- **Performance**: Monitor print functionality with large rosters
- **Accessibility**: Ensure all interactive elements are keyboard accessible
- **Mobile**: Pay special attention to game cards layout on small screens

---

## Success Criteria

✅ All restricted buttons are hidden for non-authenticated/non-privileged users
✅ Game creation includes time field and displays properly
✅ Coaches section is functional with exclusive selection
✅ Game cards are visually consistent and print-friendly
✅ Authentication prompts guide users to login when needed
✅ All existing functionality remains intact
✅ No console errors or warnings
✅ Responsive design works across all breakpoints
