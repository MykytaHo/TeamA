# Traders Connect

## Project Description
Traders Connect is a web application for a local services platform, built using React, Vite, and Firebase. The app allows users to register, post jobs, view offers, and manage their profiles. It includes Firebase authentication and navigation between pages.

## Technologies
- **Frontend**: React 19, Vite 7
- **Routing**: React Router DOM 6
- **Authentication**: Firebase 10
- **Styling**: CSS (white theme)
- **Linting**: ESLint

## Project Structure
```
TeamA/
├── my-app/                 # Main application
│   ├── src/
│   │   ├── components/     # Components (Navigation.jsx, etc.)
│   │   ├── pages/          # Pages (Home.jsx, Dashboard.jsx, etc.)
│   │   ├── assets/         # Static files
│   │   └── main.jsx        # Entry point
│   ├── public/             # Public files
│   ├── package.json        # Dependencies
│   └── vite.config.js      # Vite configuration
├── ReadMe.txt              # (Outdated, can be deleted)
├── SETUP_DOCUMENTATION.md  # (Outdated, can be deleted)
└── README.md               # This file
```

## Installation and Setup

### Requirements
- Node.js (version 16+)
- npm

### Quick Start
1. Navigate to the project folder:
   ```bash
   cd TeamA/my-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173`.

### Alternative Method (from root)
```bash
cd TeamA
npm install my-app
npm run dev
```

## Navigation and Pages
The app has a white navigation bar with links to:
- **Home** (`/`) — Home page
- **Dashboard** (`/dashboard`) — Dashboard
- **Jobs** (`/jobs`) — Jobs
- **Profile** (`/profile`) — Profile

All pages are currently empty (white background with a title), but ready for content addition.

## Navigation Features
- White navigation bar at the top of the page
- Fixed position (sticky)
- Responsive design for mobile devices
- Hover effects on links
- Logo/brand name on the left

## Design Theme
- White background for all pages (#fff)
- Dark text (#333) for contrast
- Blue links (#0066cc)
- Clean, minimalist design

## Functional Requirements

### 1. Landing Page / Home Page (Unauthenticated)
**Purpose**: Build trust in <5 seconds + explain value.

**To-do**:
- Define primary value proposition (headline + subtext).
- Clear CTA buttons: "Post a Job", "Find Work".
- Visual trust elements: Clean layout, professional icons, subtle gradients (blue/green).
- Brief "How it works" (3 steps max).
- Footer: About, Contact, Terms/Privacy, FAQ.
- Loading state (skeleton or animation).

### 2. Login / Sign-Up Page
**Purpose**: Role selection + account creation.

**To-do**:
- Lock role after selection.
- Login form: Email, Password.
- Sign-up form: Email, Password, Confirm password.
- Error handling: Invalid credentials, missing fields.
- Clear visual hierarchy.
- Smooth fade transitions between states.

### 3. Trader Dashboard
**Purpose**: Immediate access to nearby jobs.

**To-do**:
- Auto-load nearby jobs on page load.
- Top bar: Location selector, Filter button.
- Job card component: Job title, Distance, Time posted, Short description, Tags (urgent, etc.), Message button.
- Card interactions: Hover/tap lift + shadow, Expand animation over dashboard, Collapse back to origin.
- States: Applied jobs visually distinct, "No jobs nearby right now" empty state.
- Pull-to-refresh.
- Side-slide filters panel.
- Bottom navigation bar: Jobs, Messages, History, Profile.

### 4. Job Details Page
**Purpose**: Full job context + apply.

**To-do**:
- Expanded job information: Full description, Photos (if uploaded), Location, Job type.
- Job status indicator.
- Action buttons: Message, Apply, Cancel.
- Apply interaction: Message input, Submit button, Cancel button.
- On submit: Job card updates to "Applied".
- Smooth expand/collapse animation.

### 5. Post a Job Page (Public Users)
**Purpose**: Simple, confident job posting.

**To-do**:
- Job type selector.
- Location input (manual or map).
- Description text area.
- Photo upload component.
- Submit button (large, clear).
- Validation + error messages.
- Success feedback: "Job Posted" notification.
- Loading state while submitting.

### 6. History Page (Both Roles)
**Purpose**: Track and review work.

**To-do**:
- Tabs or sections: Active jobs, Past jobs.
- Job summaries.
- Review system: Star rating, Optional comment.
- Visual distinction between active vs completed.
- Empty state handling.

### 7. Messages Page
**Purpose**: Job-based communication.

**To-do**:
- Conversation list: Latest message preview, Job reference header.
- Auto-sort by latest message.
- Conversation interaction: Lift animation on tap.
- Chat view: Message bubbles, Input field, Send button.
- Loading + empty states.

### 8. Profile Page (Trader)
**Purpose**: Build trust + credibility.

**To-do**:
- Profile photo upload.
- Trade type selector.
- Bio text field.
- Reviews section: Star ratings, Comments.
- Edit profile option.
- Clear visual hierarchy.

### 11. Global / System-Wide Tasks
**Design**:
- Define color system: Primary blue/green, One accent color.
- Ensure high-contrast text.
- Choose sans-serif font + heading scale.

**UX**:
- Button sizing for touch.
- Consistent hover/tap feedback.
- Fade/slide transitions (no harsh cuts).

**States**:
- Loading (never blank).
- Empty.
- Error.
- Success notifications.

## Next Steps
- Implement pages according to the functional requirements above.
- Add content to pages (forms, Firebase data).
- Integrate Firebase for authentication and data.
- Connect Firebase data.
- Test UX and design.

## Production Build
```bash
npm run build
```
Then run the preview:
```bash
npm run preview
```

## Linting
```bash
npm run lint
```

## Dependencies
Main packages are listed in `my-app/package.json`. Includes React, Firebase, React Router, and development tools.

## Notes
- After logging in via Firebase, the navigation bar appears.
- The app uses React Compiler (not enabled by default due to performance; see React docs for addition).
