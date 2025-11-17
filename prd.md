# TOON Prompt: Build an Advanced Todo List Application

## Objective
Create a fully functional todo list web application with timer tracking capabilities using vanilla HTML, CSS, and JavaScript.

## Core Requirements

### 1. User Interface
- Clean, centered container design with white background on blue gradient
- Header displaying app title with emoji and total time tracker
- Input field with add/update button for task management
- Dynamic list display with smooth animations
- Responsive design suitable for desktop and mobile

### 2. Task Management (CRUD Operations)
- **Create**: Add new tasks to the top of the list via button click or Enter key
- **Read**: Display all tasks with their current state from localStorage
- **Update**: Edit existing task text (click pencil icon)
- **Delete**: Remove tasks with confirmation dialog (with animated removal)
- **Complete**: Mark tasks done via double-click (strikethrough + checkmark)

### 3. Timer System
- **Individual Timers**: Each task has its own start/pause/reset timer
  - Display format: HH:MM:SS
  - Play button (▶️) to start timing
  - Pause button (⏸️) to pause timing
  - Reset button (🔄) to reset to 00:00:00
  - Visual indicator (green highlight) for active timers
- **Total Time Tracker**: Cumulative time across all tasks in header
- **Smart Behavior**:
  - Timers auto-pause when task is marked complete
  - Running timers resume after page refresh
  - Task deletion subtracts its time from total
  - Timer reset subtracts time from total

### 4. Data Persistence
- Save all task data to localStorage (task text, completion status, time spent, timer state)
- Save total time separately to localStorage
- Auto-restore all data and running timers on page load
- Assign unique IDs to each task using timestamps

### 5. Validation & UX
- Prevent empty task creation
- Prevent duplicate task entries
- Display success/error messages with auto-fade animation
- Confirmation dialog before task deletion
- Smooth animations for task creation and deletion

### 6. Visual Design
- Use Poppins font from Google Fonts
- Color scheme: Light blue background (#78c1f3), white container, green accents
- Hover effects on all interactive elements (scale transforms)
- CSS animations:
  - New items: slide down from top
  - Deleted items: rotate and slide out
  - Alert messages: fade out after 5 seconds
- Emoji icons instead of image files for zero dependencies

## Technical Specifications

### File Structure
```
/
├── index.html      # Main HTML structure
├── style.css       # All styles and animations
└── script.js       # JavaScript logic and timer management
```

### Key Features Implementation
- No external dependencies (except Google Fonts)
- Use modern ES6+ JavaScript features
- Efficient DOM manipulation
- Interval-based timer system with proper cleanup
- Event delegation where appropriate
- Semantic HTML structure

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- localStorage API support required
- CSS Grid/Flexbox for layout

## Deliverables
1. Fully functional HTML file with proper structure
2. Complete CSS with animations and responsive design
3. JavaScript with all CRUD operations and timer logic
4. Zero external image dependencies (use emoji)
5. Working localStorage persistence
6. Professional UI/UX with smooth interactions

## Success Criteria
- Tasks can be created, read, updated, and deleted
- Timers work independently for each task
- Total time accurately reflects sum of all task times
- Data persists across browser sessions
- All animations work smoothly
- Enter key adds new tasks
- New tasks appear at the top of the list
- No console errors
- Clean, maintainable code
