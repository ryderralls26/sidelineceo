# FlagFooty Feature Implementation Checklist

## Requirements Status

### 1. CRITICAL FIX ✅
- [x] Fix 'ReferenceError: Link is not defined' in `app/schedule/page.tsx`
  - **Status**: Already implemented
  - **Location**: Line 4 of schedule/page.tsx

### 2. ROSTER & COACHES ✅
- [x] Add 'Coaches' section below player list with separator line
  - **Location**: Lines 460-512 in roster/page.tsx
- [x] Add two editable slots: 'Coach 1' and 'Coach 2'
  - **Implementation**: Text inputs for coach names
- [x] Add checkboxes (radio buttons) in front of each name
  - **Logic**: Only one coach can be checked at a time
- [x] Checked coach name used on game cards
  - **Integration**: Passes selected coach to CoachCard and RefereeCard
- [x] Persist coach names and selection in StorageManager
  - **Storage**: CoachData interface with saveCoachData/getCoachData methods

### 3. SCHEDULE PAGE ✅
- [x] Restrict 'Add Game' to Coach/Admin roles only
  - **Implementation**: Conditional rendering based on `isCoach || canEdit`
  - **Location**: Lines 261-271
- [x] Include 'Time' field in 'Add Game' modal
  - **Location**: Lines 495-506
  - **Display**: Shows on game cards at lines 328-332
- [x] Hide 'MVP' and 'Generate Lineup' from Parents/Players
  - **Implementation**: Conditional rendering with `(isCoach || canEdit)`
  - **Location**: Lines 360-390
- [x] Show 'Final Roster' button for coaches/admins on finalized games
  - **Implementation**: Button text changes based on role
  - **Location**: Line 355

### 4. GAME CARDS ✅
- [x] Redesign cards as exact duplicate of standard 'Official Game Card'
  - **Style**: FlagFooty themed design
- [x] Layout: Two side-by-side cards (2-up) for both web and print
  - **Implementation**: Grid layout + print styles in globals.css
- [x] CoachCard: Show position abbreviations (QB, WR, etc.) in Q1-Q4 columns
  - **Location**: Lines 165-175 in GameCards.tsx
- [x] RefereeCard: Show 'X' in Q1-Q4 columns
  - **Location**: Lines 359-394 in GameCards.tsx
- [x] Editable fields on cards:
  - [x] Team Name
  - [x] Coach Name
  - [x] Division
  - [x] Field
  - [x] Time
  - [x] Opponent
  - **Implementation**: Controlled inputs with local state
- [x] Add 'Print' button above cards
  - **Location**: Lines 551-606 in roster/page.tsx
  - **Action**: Triggers `window.print()`
- [x] Print button saves snapshot to Archive
  - **Implementation**: Calls StorageManager.finalizeGame()
  - **Behavior**: Overwrites old snapshots for same game

### 5. UI POLISH ✅
- [x] Add popup 'Please login for full features' for unauthenticated users
  - **Component**: LoginPromptModal.tsx
  - **Triggers**: Print button click, game card preview click
- [x] Only most recently printed card saved in archive
  - **Implementation**: finalizeGame filters existing gameId before adding new

## Testing Checklist

### Authentication & Roles
- [x] Default coach account created on first load
- [x] Login/logout functionality works
- [x] Role-based permissions enforced

### Roster & Coaches
- [x] Can add/edit players
- [x] Can edit coach names
- [x] Radio buttons enforce single coach selection
- [x] Save button persists changes
- [x] Selected coach appears on game cards

### Schedule Management
- [x] Add Game button visible only to coaches/admins
- [x] Time field in Add Game modal
- [x] Time displays on game cards
- [x] MVP/Generate Lineup hidden from non-coaches
- [x] Final Roster button text correct for different roles

### Game Cards
- [x] CoachCard shows position abbreviations
- [x] RefereeCard shows X marks
- [x] All fields editable
- [x] Cards render side-by-side
- [x] Print button functional
- [x] Print saves to archive

### Print Functionality
- [x] 2-up layout in print view
- [x] Landscape orientation
- [x] Navigation/footer hidden when printing
- [x] Cards maintain proper styling
- [x] Archive snapshot saved

### Login Prompt
- [x] Shows when unauthenticated user clicks Print
- [x] Shows when unauthenticated user clicks game cards
- [x] Provides Cancel and Login buttons
- [x] Redirects to login page

## Known Behaviors

1. **Data Persistence**: All data stored in localStorage (client-side only)
2. **Default Login**: coach@example.com / coach123
3. **Coach Selection**: Enforced via radio buttons (only one at a time)
4. **Archive Updates**: Each print overwrites previous snapshot for that game
5. **Role Display**: Different UI elements based on user role
6. **Time Format**: Free-form text input (e.g., "3:00 PM", "15:00")

## Success Criteria Met ✅

All requirements have been successfully implemented:
- ✅ Critical Link import fix
- ✅ Coaches section with radio selection
- ✅ Schedule page role restrictions
- ✅ Time field throughout application
- ✅ Official game card design
- ✅ 2-up print layout
- ✅ Postion abbreviations on CoachCard
- ✅ X marks on Refereecard
- ✅ Editable card fields
- ✅ Print button with archive save
- ✅ Login prompt for unauthenticated users
- ✅ Archive snapshot management

## Server Status
🟣 Development server running on http://localhost:3000
