# Debugging Guide for Learn Better Frontend

## ✅ Setup Complete!

Debug configuration has been added to `.vscode/launch.json`

## 🚀 How to Start Debugging

### Method 1: Launch New Browser (Easiest)

1. **Set a breakpoint**:
   - Open `src/components/QuizPopup.jsx`
   - Click in the gutter (left of line numbers) on line 244
   - A red dot appears ⭕

2. **Start debugging**:
   - Press `F5` (or click Debug icon in sidebar → select "Debug React App (Chrome)" → click green play button)
   - A new Chrome window opens automatically
   - Navigate to your quiz

3. **Answer a question** - Cursor will pause at your breakpoint!

### Method 2: Attach to Existing Browser

1. **Close all Chrome windows**

2. **Launch Chrome with debugging**:
   ```bash
   # Mac:
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
   
   # Windows:
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
   ```

3. **In Chrome**, navigate to http://localhost:3000

4. **In Cursor**:
   - Press `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows)
   - Select "Attach to Running Chrome"
   - Press `F5`

## 🎯 Key Breakpoint Locations for Quiz Debugging

### To debug answer format:

1. **ObjectiveQuestion.jsx - Line 18**
   ```javascript
   onAnswer(optionLetter)  // See what letter is sent (A, B, C, D)
   ```

2. **TrueFalseQuestion.jsx - Line 15**
   ```javascript
   onAnswer(answer.toLowerCase())  // See lowercase true/false
   ```

3. **QuizPopup.jsx - Line 244**
   ```javascript
   const correct = validateAnswer(question, answer)  // See validation
   ```

4. **quizValidator.js - Line 14**
   ```javascript
   return correctAnswers.includes(userAnswer)  // See comparison
   ```

## 🔍 Debug Controls

While paused at a breakpoint:

| Key | Action |
|-----|--------|
| `F5` | Continue to next breakpoint |
| `F10` | Step over (execute line, move to next) |
| `F11` | Step into (go inside function) |
| `Shift+F11` | Step out (exit function) |
| `F9` | Toggle breakpoint on current line |
| `Shift+F5` | Stop debugging |

## 👀 What to Watch

In the Debug sidebar, add these to **WATCH**:

- `question.correct_answers` - See backend format
- `answer` - See what component sends
- `currentIndex` - Current question number
- `userAnswers` - All submitted answers
- `showFeedback` - Is feedback showing?
- `isCorrect` - Was answer correct?

## 🐛 Debug Console Commands

While debugging, use the Debug Console (bottom panel) to run JavaScript:

```javascript
// Check current question
question.question_type

// See correct answers
question.correct_answers

// Compare values
answer === question.correct_answers[0]

// See all options
question.answer_options

// Check user answers array
userAnswers.map(a => a.userAnswer)
```

## 📊 Common Debug Scenarios

### Scenario 1: "Why is my answer wrong?"

1. Set breakpoint at `QuizPopup.jsx:244`
2. Answer a question
3. When paused, check:
   - `answer` = what you sent (should be "A", not "Paris")
   - `question.correct_answers` = what backend expects (should be `["A"]`)
   - `correct` = result (should be true/false)

### Scenario 2: "Why doesn't my selection show when I navigate back?"

1. Set breakpoint at `ObjectiveQuestion.jsx:17` (inside `getOptionFromLetter`)
2. Navigate to next question, then click "Previous"
3. Check:
   - `userAnswer` = should be a letter like "A"
   - `getOptionFromLetter(userAnswer)` = should return "Paris"
   - `selectedOption` state = should match the full text

### Scenario 3: "Why isn't the correct answer highlighted?"

1. Set breakpoint at `ObjectiveQuestion.jsx:46` (inside `getOptionClass`)
2. Answer wrong on purpose
3. Check:
   - `option` = the option being checked (e.g., "Paris")
   - `optionLetter` = converted letter (e.g., "A")
   - `question.correct_answers?.includes(optionLetter)` = should be true for correct answer

## 🎓 Pro Tips

1. **Conditional Breakpoints**: Right-click breakpoint → "Edit Breakpoint" → Add condition like `currentIndex === 2` to only break on question 3

2. **Logpoints**: Right-click → "Add Logpoint" → Type `Answer: {answer}, Correct: {question.correct_answers}` to log without stopping

3. **Call Stack**: Shows how you got to current line - great for understanding flow

4. **Step Into**: Use `F11` to go inside `validateAnswer()` and see exactly how validation works

5. **Hot Reload**: Cursor's debugger supports hot reload! Edit code while debugging and it updates automatically

## 🔧 Troubleshooting

**Breakpoint not hitting?**
- Hard refresh browser (`Cmd+Shift+R`)
- Make sure sourcemaps are enabled (already added to `vite.config.js`)
- Check that dev server is running on port 3000

**Can't attach to Chrome?**
- Close ALL Chrome windows
- Launch with `--remote-debugging-port=9222` flag
- Make sure no other debugger is attached

**Variables show as undefined?**
- You might be at a line before the variable is set
- Press `F10` to step over and watch it populate

## 📝 Quick Start Checklist

- [ ] Dev server running (`npm run dev`)
- [ ] Set breakpoint in `QuizPopup.jsx` line 244
- [ ] Press `F5` to start debugging
- [ ] Navigate to quiz in browser
- [ ] Answer a question
- [ ] See Cursor pause - you're debugging! 🎉

---

## 🎯 Your First Debug Session

1. Open `src/components/QuizPopup.jsx`
2. Click line 244 to set breakpoint (red dot appears)
3. Press `F5`
4. When browser opens, go to your quiz
5. Click an answer option
6. Cursor pops up - paused at breakpoint!
7. Hover over `question` to see its data
8. Hover over `answer` to see what was sent
9. Press `F10` to execute line and see `correct` result
10. Press `F5` to continue

Happy debugging! 🐛🔍

