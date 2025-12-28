# Troubleshooting: No Courses Showing

## 🔍 Quick Diagnosis Steps

### Step 1: Check Browser Console

1. Open your browser to `http://localhost:5173/`
2. Login with your credentials
3. **Open Browser Console** (Press `F12` or right-click → "Inspect" → "Console" tab)

### Step 2: Look for These Console Logs

You should see these logs in order:

```
🔄 Initializing app...
✅ Token found, fetching user data...
📥 Data received: { userProfileRaw: {...}, coursesDataRaw: [...] }
📦 After mock check: { userProfile: {...}, coursesData: [3 items], coursesCount: 3 }
📚 LearningPath received: { courses: [3 items], coursesLength: 3, isLoading: false }
```

### Step 3: Interpret the Logs

#### ✅ **GOOD** - You see mock data:
```
📦 After mock check: { coursesData: [3 items], coursesCount: 3 }
```
- **Courses should appear on screen!**
- If you still don't see them, scroll down the dashboard
- They appear under "Progress Insights" and "Focus Engine"

#### ⚠️ **WARNING** - You see one of these:
```
🔄 Backend returned empty courses data. Using mock data for testing.
```
or
```
🔄 Backend returned API URLs instead of courses data. Using mock data for testing.
```
- **This is OKAY** - Mock data should kick in automatically
- You should still see 3 courses on the dashboard

#### ❌ **ERROR** - You see:
```
❌ Failed to fetch data: [error message]
```
- Backend might not be running
- Check if `http://localhost:8000` is accessible

---

## 🎯 Quick Fixes

### Fix 1: Refresh the Page
Sometimes HMR (Hot Module Replacement) doesn't apply all changes:
```
Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```
This forces a hard refresh.

### Fix 2: Clear Cache and Reload
If courses still don't show:
1. Open browser console (`F12`)
2. Paste this and press Enter:
```javascript
localStorage.clear();
location.reload();
```
3. Login again

### Fix 3: Check if Backend is Running
The backend should be running on port 8000:
```bash
# In a terminal:
cd /Users/aug/Documents/GitHub/NVLP-Backend
source venv/bin/activate
python manage.py runserver
```

### Fix 4: Verify Mock Data is Working
Open browser console and paste:
```javascript
// Check if mock data function exists
console.log("Mock courses:", [
  { id: 1, title: 'Introduction to Python', description: 'Master Python fundamentals with hands-on projects' },
  { id: 2, title: 'Web Development Basics', description: 'Learn HTML, CSS, and JavaScript essentials' },
  { id: 3, title: 'Data Structures & Algorithms', description: 'Build problem-solving skills with core CS concepts' }
]);
```

---

## 📍 Where Courses Should Appear

On the dashboard, scroll down. You should see:

```
┌─────────────────────────────────────┐
│   NVLP Student Dashboard            │  ← Top Header
└─────────────────────────────────────┘

┌──────────────┐  ┌──────────────────────────────────┐
│  Profile     │  │  Progress Insights               │
│  Summary     │  │  (Tasks Smashed, Focus Minutes)  │
├──────────────┤  ├──────────────────────────────────┤
│  Sensory     │  │  Focus Engine (Pomodoro Timer)   │
│  Controls    │  ├──────────────────────────────────┤
├──────────────┤  │  ╔═════════════════════════════╗ │
│  Smart Tags  │  │  ║ YOUR LEARNING PATH          ║ │  ← COURSES HERE!
└──────────────┘  │  ║                             ║ │
                  │  ║  📘 Introduction to Python  ║ │
                  │  ║  [Start Lesson] button      ║ │
                  │  ║                             ║ │
                  │  ║  🌐 Web Development Basics  ║ │
                  │  ║  [Start Lesson] button      ║ │
                  │  ║                             ║ │
                  │  ║  🧠 Data Structures & Algo  ║ │
                  │  ║  [Start Lesson] button      ║ │
                  │  ╚═════════════════════════════╝ │
                  ├──────────────────────────────────┤
                  │  Task Breaker                    │
                  └──────────────────────────────────┘
```

---

## 🐛 Common Issues

### Issue 1: "isLoadingCourses" stuck at `true`
**Symptom**: You see skeleton loaders forever
**Fix**: Check console for errors, backend might be down

### Issue 2: Empty "No courses available yet."
**Symptom**: You see the "Your Learning Path" section but it says "No courses available yet."
**Fix**: 
1. Check console logs (see Step 2 above)
2. Verify mock data is being applied
3. Hard refresh the page (Ctrl+Shift+R)

### Issue 3: Dashboard loads but Learning Path section is missing entirely
**Symptom**: You don't even see the "Your Learning Path" heading
**Fix**: This shouldn't happen, but if it does:
1. Check browser console for JavaScript errors
2. Restart the dev server: `npm run dev`

---

## 📞 Still Stuck?

If courses still don't appear after trying all fixes:

1. **Take a screenshot** of your browser showing:
   - The full dashboard
   - The browser console with logs visible

2. **Share the console logs** - Look for:
   - Any red error messages
   - The `📦 After mock check` log
   - The `📚 LearningPath received` log

3. **Verify your view** - Make sure you're logged in and seeing the dashboard, not the login screen

---

## ✅ Expected Result

After following these steps, you should see:

- ✅ 3 courses listed under "Your Learning Path"
- ✅ Each course has a blue "Start Lesson" button
- ✅ Clicking "Start Lesson" navigates to `/lesson/1` (or `/lesson/2`, etc.)
- ✅ Lesson player loads with video

If you're seeing all of this: **Success!** 🎉

---

**Updated**: Phase 7 with improved mock data fallback


