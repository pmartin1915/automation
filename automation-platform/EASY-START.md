# 🚂 Automation Station - Easy Start Guide

## 📦 First Time Setup (One Time Only)

### 1. Install the App

Double-click: **`rebuild-installer.bat`**

This creates the installer. When it's done:
1. Open the `release` folder (it opens automatically)
2. Run `Automation Station Setup 1.0.0.exe`
3. Follow the installer
4. Launch the app
5. Right-click the app icon in your taskbar
6. Click "Pin to taskbar"

**Done!** You now have Automation Station pinned to your taskbar.

---

## 🎯 Daily Use

Just **click the taskbar icon**! That's it.

The app works like any Windows program:
- Drag folders to add projects
- Run tests
- Copy results for Claude
- All features work!

---

## 🔄 When You Want to Update

### Quick Test (Fast - 30 seconds)
**Use this when:** You made small changes and want to test quickly

Double-click: **`quick-test.bat`**

This runs the app without reinstalling. Good for:
- Testing code changes
- Quick checks
- Development work

### Update from Git (Medium - 3-4 minutes)
**Use this when:** You want the latest version from the repository

Double-click: **`update-and-rebuild.bat`**

This automatically:
1. Pulls latest code from git
2. Builds a new installer
3. Opens the release folder

Then just:
1. Close the running app
2. Run the new installer
3. Your pinned app is updated!

### Rebuild Only (Medium - 2-3 minutes)
**Use this when:** You made local changes

Double-click: **`rebuild-installer.bat`**

This builds a new installer from your current code.

---

## 🎨 The Helper Scripts

Put these in your `automation-platform` folder:

| Script | What It Does | Speed |
|--------|--------------|-------|
| `quick-test.bat` | Quick test without installing | ⚡ Fast (30s) |
| `rebuild-installer.bat` | Build new installer | 🔄 Medium (2-3min) |
| `update-and-rebuild.bat` | Pull from git + rebuild | 🔄 Medium (3-4min) |

---

## 💡 Pro Tips

### Tip 1: Keep Two Versions
- **Taskbar App**: Installed version for daily use
- **Quick Test**: Use `quick-test.bat` when developing

### Tip 2: Update Weekly
Run `update-and-rebuild.bat` once a week to get the latest features.

### Tip 3: Desktop Shortcuts
Right-click any `.bat` file > "Create shortcut" > drag to Desktop
Now you can update with one desktop click!

### Tip 4: Keyboard Shortcut for Scripts
1. Right-click the `.bat` file > Properties
2. Click in the "Shortcut key" field
3. Press Ctrl+Alt+T (or any combo)
4. Click OK
5. Now Ctrl+Alt+T runs that script!

---

## 🔧 Troubleshooting

### "npm is not recognized"
- Make sure Node.js is installed
- Restart your terminal/computer

### "git is not recognized"
- Install Git for Windows
- Or just use `rebuild-installer.bat` (no git needed)

### App won't start
- Check Windows Defender didn't block it
- Right-click the installer > Properties > Unblock

### "Already running" error
- Close the old app first
- Check system tray for hidden icon
- Task Manager > End "Automation Station"

---

## 📁 File Locations Reference

**Project Code:**
```
D:\Automation\automation-platform\
```

**Installed App:**
```
C:\Program Files\Automation Station\
```

**Your Data:**
```
C:\Users\<YourName>\AppData\Roaming\automation-station\
```

**Installers:**
```
D:\Automation\automation-platform\release\
```

---

## 🎉 That's It!

You're all set. Most of the time, you'll just:
1. Click the taskbar icon to use the app
2. Run `update-and-rebuild.bat` when you want updates

Easy! 🚀
