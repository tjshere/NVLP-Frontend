# Phase 7: Testing Guide

## ✅ What's Been Implemented

1. **LessonPlayer Component** (`src/components/LessonPlayer.jsx`)
   - Full-featured video player using react-player
   - Interactive transcript with click-to-seek
   - Focus mode for distraction-free learning
   - Progress tracking and backend synchronization
   - Complete sensory preference integration

2. **API Integration** (`src/api.js`)
   - `getCourse(courseId)` - Fetch course details
   - `getLesson(lessonId)` - Fetch lesson data (currently uses mock data)

3. **Dashboard Integration** (`src/components/StudentDashboard.jsx`)
   - "Start Lesson" button on each course card
   - Lesson player opens as fullscreen overlay
   - Seamless return to dashboard on close

4. **Skeleton Component** (`src/components/Skeleton.jsx`)
   - LessonPlayerSkeleton for loading states
   - ProgressInsightsSkeleton added

## 🧪 How to Test

### Step 1: Start Both Servers

**Backend** (Terminal 1):
```bash
cd /Users/aug/Documents/GitHub/NVLP-Backend
source venv/bin/activate
python manage.py runserver
```

**Frontend** (Terminal 2):
```bash
cd /Users/aug/Documents/GitHub/NVLP-Frontend
npm run dev
```

### Step 2: Login

1. Open `http://localhost:5173`
2. Login with: `agustindavila22@gmail.com` / `**Admin96`

### Step 3: Test Lesson Player

1. **Open a Lesson**:
   - Click the blue "Start Lesson" button on any course card
   - The URL should change to `/lesson/1` (or `/lesson/2`, etc.)
   - The lesson player should render fullscreen
   - **Test URL Directly**: Try navigating to `http://localhost:5173/lesson/1` - should load lesson directly

2. **Test Video Controls**:
   - Click the play button (should start the YouTube video)
   - Adjust volume slider
   - Click mute/unmute button
   - Observe progress bar updating

3. **Test Interactive Transcript**:
   - Click any transcript line
   - Video should jump to that timestamp
   - Current line should highlight as video plays

4. **Test Tabs**:
   - Click "Interactive Transcript" tab
   - Click "Lesson Notes" tab (should show formatted markdown content)

5. **Test Focus Mode**:
   - Click "Focus Mode" button in header
   - Header should hide, video should expand
   - Click "Exit Focus Mode" to return

6. **Test Transcript Toggle**:
   - Click the eye icon button to hide transcript
   - Video should expand to full width
   - Click again to show transcript

7. **Test Sensory Preferences**:
   - **Low Audio**: Enable from dashboard, then open lesson - volume should be capped at 30%
   - **Reduce Animations**: Enable from dashboard, then open lesson - all animations should be disabled
   - **Dark Mode**: Toggle from dashboard, then open lesson - player should use dark colors
   - **Bionic Reading**: Enable from dashboard, then open lesson - transcript text should be bold-formatted
   - **Dyslexic Font**: Enable from dashboard, then open lesson - transcript should use OpenDyslexic font

8. **Test Close Mechanisms**:
   - Click the X button in header - URL should change back to `/`
   - Click the back arrow button - URL should change back to `/`
   - Use browser back button - should also return to dashboard
   - Should return to dashboard in all cases

9. **Test Progress Tracking** (requires backend):
   - Watch for ~30 seconds
   - Check console for progress update logs
   - Backend should receive PATCH requests to update progress

10. **Test React Router Integration**:
   - **Direct URL Access**: Navigate directly to `http://localhost:5173/lesson/2` - should load lesson for course 2
   - **Browser Back Button**: After opening a lesson, click browser back - should return to dashboard
   - **Browser Forward Button**: After going back, click forward - should return to lesson
   - **URL Bookmarking**: Bookmark a lesson URL and reopen it - should work (after login)
   - **Invalid Route**: Try `http://localhost:5173/invalid-route` - should redirect to dashboard
   - **SensoryProvider Availability**: Open lesson, toggle dark mode in browser console, refresh - preferences should persist across routes

## 🐛 Known Limitations (Mock Data Mode)

Since there's no Lesson model in the backend yet, the lesson player uses mock data:

- **Video**: Python tutorial from YouTube (public domain)
- **Transcript**: 7 hardcoded timestamped segments
- **Content**: Sample markdown lesson notes
- **Duration**: Fixed at 60 seconds

The mock data is fully functional and demonstrates all features!

## ✨ Expected Behavior

### Loading State
- Should show a spinner with "Loading lesson..." message

### Error State
- If lesson fails to load, shows error message with "Go Back" button

### Normal Operation
- Video player responsive and functional
- Transcript auto-highlights based on playback time
- All buttons responsive and smooth
- Sensory preferences applied correctly

### Progress Tracking
- Check browser console for log messages like:
  - "✅ Progress updated: 45% complete"
  - "⏱️ Engagement time: 00:02:30"

## 🔍 Troubleshooting

### HMR Error in Terminal
If you see "Unterminated JSX contents" in Vite output:
1. It's a hot module replacement cache issue
2. Save the file again or restart the dev server
3. The app should still work fine in the browser

### Video Won't Play
- YouTube embeds require internet connection
- Some videos may have embedding restrictions
- Check browser console for errors

### Transcript Not Highlighting
- Make sure video is actually playing (not paused)
- Check browser console for JavaScript errors

### Sensory Preferences Not Applying
- Make sure preferences are saved on the dashboard first
- Check if the preference state is being passed correctly
- Look for console logs showing preference values

## 📊 What to Check in Console

Good console logs to see:
- `✅ Lesson loaded: Introduction to Programming`
- `⏱️ Current time: 12.5s`
- `🎯 Active transcript index: 2`
- `📈 Progress update sent: 45%`

## 🎯 Success Criteria

- ✅ Lesson player opens smoothly
- ✅ Video plays without issues
- ✅ Transcript highlighting works
- ✅ All navigation buttons work
- ✅ Focus mode toggles correctly
- ✅ Sensory preferences apply
- ✅ Closing returns to dashboard
- ✅ No console errors

---

**Ready to test?** Follow the steps above and let me know what you find!

