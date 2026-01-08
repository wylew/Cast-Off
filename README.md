# Ringside of the Sea - Session Diary

A beautiful, Material Design 3 session diary for tabletop RPG campaigns. Track your adventures with session recaps, conversations, quotes, and notes—all organized by session in separate markdown files.

![Campaign Diary Screenshot](https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800)

## ✨ Features

- 📚 **Session-Based Organization** - Each session in its own markdown file
- 🎨 **Customizable Theme** - Change colors to match your campaign (colors currently here:https://colorpeek.com/#a8c7fa,0a2540,0d47a1,d3e4fd,bac8db,243140,3a4857,d6e3f7,d0bcff,1f1635,5a4570,eaddff,0f1419,0f1419,34393e,0a0e13,171c21,1b2025,252a30,30353b,e1e3e6,c1c7ce,8b9198,41484d,ffb4ab,690005,93000a,ffdad6)
- 🖼️ **Custom Masthead** - Add your own background image and title
- 📝 **Multiple Post Types** - Recaps, characters, locations, travel, conversations, quotes, and text entries
- 🔄 **GitHub Integration** - Automatic commits to your repository
- 📱 **Responsive Design** - Works beautifully on desktop and mobile
- 🎲 **Custom Fonts** - Use your own fantasy fonts
- 🎯 **Material Design 3** - Modern, clean interface

## 🚀 Quick Start

### 1. Download Files

Download all files from this repository:

```
your-campaign/
├── index.html
├── styles.css
├── script.js
├── DUNGRG__.TTF (your custom font)
├── README.md
└── sessions/
    ├── session-1.md
    ├── session-2.md
    └── session-3.md
```

### 2. Upload to GitHub

1. Create a new GitHub repository
2. Upload all files to the repository
3. Go to **Settings** → **Pages**
4. Set source to **main branch**
5. Save and wait for deployment

### 3. Configure Settings

1. Visit your site: `https://yourusername.github.io/your-repo/`
2. Click the ⚙️ **Settings** icon
3. Configure:
   - **Masthead**: Background image URL and campaign title
   - **GitHub Integration**: Repository details and access token
   - **Theme Colors**: Customize the color scheme

### 4. Start Adding Sessions!

Click the **+** button to create your first session post.

## 📝 Usage Guide

### Creating a New Session

1. Click the **+** (FAB) button in the bottom-right
2. Select **Session Recap** as the post type
3. Enter the session number (e.g., `1`)
4. Add a title and content
5. Click **Publish Post**

**With GitHub configured:** Automatically commits to `sessions/session-X.md`  
**Without GitHub:** Downloads the file for manual upload

### Post Types & Formatting

Separated by `---` (three dashes on their own line), each post uses metadata at the top followed by the content.

#### **Session Recap**
The main summary of what happened. Featured at the top.
```markdown
Type: recap
Date: Dec 20, 2024
Title: The Port of Saltmere

Your summary here...
```

#### **Character**
A card for NPCs or Player Characters. Feature a portrait (matching the Name to `portraits.json`).
```markdown
Type: character
Name: Phinneas
Date: Jan 03, 2026

Detailed description of the character...
```

#### **Location**
A card for important places with a map icon and golden theme.
```markdown
Type: location
Name: New Haven
Date: Jan 08, 2026

Description of the harbor, trade, and important landmarks...
```

#### **Travel**
A nautical journey visualization with a wavy dashed line and bobbing ship.
```markdown
Type: travel
From: New Haven
To: Traitor Joe's
Date: Jan 10, 2026

We set sail at dawn, navigating the choppy waters...
```

#### **Conversation**
Dialogue between characters or the DM in chat bubbles.
```markdown
Type: conversation
Date: Dec 20, 2024

DM: You see a figure in the distance.
Kaelen: Can I make out any details?
```

#### **Quote**
Highlighted memorable lines with author portraits.
```markdown
Type: quote
Date: Dec 20, 2024
Author: Captain Rhogar

The sea remembers everything. Every soul she claims.
```

#### **Text Entry**
Standard notes or player journal entries.
```markdown
Type: text
Date: Dec 20, 2024
Title: Mira's Journal

Detailed notes about the day...
```

### Session File Format

Each session is stored in `sessions/session-X.md`:

```markdown
Type: recap
Date: Dec 20, 2024
Title: The Port of Saltmere

Our adventure began in the bustling port city...
---
Type: travel
From: New Haven
To: The Whisper Reef
Date: Dec 20, 2024

We set sail at dawn...
---
Type: character
Name: Theron
Date: Dec 20, 2024

A stalwart dwarf cleric...
---
Type: quote
Author: Captain Rhogar
Date: Dec 20, 2024

"The sea remembers everything."
```

Posts are separated by `---` (three dashes on their own line).

## ⚙️ Configuration

### GitHub Integration

To enable automatic publishing:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token**
3. Give it **repo** permission
4. Copy the token (starts with `ghp_`)
5. In your diary, click ⚙️ → GitHub Integration
6. Enter:
   - **Repository Owner**: Your GitHub username
   - **Repository Name**: Your repo name
   - **Branch**: `main` (or `gh-pages`)
   - **Personal Access Token**: Paste your token

### Custom Font

1. Place your `.ttf` font file in the repository root
2. Name it `DUNGRG__.TTF` (or update `styles.css`)
3. The masthead will automatically use your font

**To use a different font:**

Edit `styles.css`:

```css
@font-face {
    font-family: 'YourFont';
    src: url('your-font.ttf') format('truetype');
}

.masthead-title {
    font-family: 'YourFont', serif;
}
```

### Theme Colors

Customize colors in Settings → Theme Colors:

- **Primary**: Main brand color (buttons, links)
- **Secondary**: Accent color (chat bubbles)
- **Tertiary**: Quote highlights
- **Surface**: Background color
- **Surface Container**: Card background

All colors use hex format: `#6750A4`

### Masthead

Customize in Settings → Masthead:

- **Background Image URL**: Link to your header image
- **Campaign Title**: Your campaign name

## 📂 File Structure

```
your-campaign/
├── index.html              # Main HTML file
├── styles.css              # All styles and theme
├── script.js               # Application logic
├── DUNGRG__.TTF            # Custom font (optional)
├── README.md               # This file
├── campaign.md             # Campaign details and meta-notes
└── sessions/               # Session files
    ├── session-1.md        # Session 1 posts
    ├── session-2.md        # Session 2 posts
    └── session-X.md        # More sessions...
```

## 🎨 Customization

### Change Masthead Size

Edit `styles.css`:

```css
.masthead {
    height: 250px; /* Change this value */
}
```

### Change Font Size

Edit `styles.css`:

```css
.masthead-title {
    font-size: 64px; /* Change this value */
}
```

### Change Sidebar Width

Edit `styles.css`:

```css
:root {
    --sidebar-width: 280px; /* Change this value */
}
```

### Add Custom Post Types

Edit `script.js` and add your type to the switch statement in `createPostCardHtml()`.

## ⌨️ Keyboard Shortcuts

- **Cmd/Ctrl + K** - Create new post
- **Cmd/Ctrl + ,** - Open settings
- **Escape** - Close dialogs

## 🔧 Troubleshooting

### Sessions Not Loading?

- Check that files are in `sessions/` folder
- Verify filenames: `session-1.md`, `session-2.md`, etc.
- Check for valid markdown format
- Look at browser console (F12) for errors

### GitHub Integration Not Working?

- Verify your token has **repo** permission
- Check that owner and repo names are correct
- Ensure the `sessions/` folder exists in your repo
- Try regenerating your personal access token

### Font Not Loading?

- Verify font file is in repository root
- Check filename matches CSS: `DUNGRG__.TTF`
- Check browser console for 404 errors
- Try using the full URL to the font file

### Images Not Showing?

- Use full URLs for images: `https://example.com/image.jpg`
- Check image URL is accessible (not behind login)
- Verify CORS headers allow loading

## 📱 Mobile Support

The diary is fully responsive:

- Sidebar slides in/out on mobile
- Masthead scales appropriately
- Cards stack vertically
- Touch-friendly buttons

Tap the **☰** menu icon to toggle the sidebar on mobile.

## 🎲 Recommended Workflows

### Solo DM

1. Create session file before game
2. Add recap after game
3. Add conversations/quotes during prep for next session

### Player Journal

1. DM creates recap
2. Players add their character's thoughts as text entries
3. Everyone contributes memorable quotes

### Collaborative

1. Create shared GitHub repo
2. Each player gets their own token
3. Everyone can add posts to any session
4. Use text entries for individual character perspectives

## 🔒 Security Notes

- **Personal Access Tokens** are stored in browser localStorage only
- Never commit your token to the repository
- Tokens are not sent anywhere except GitHub
- Use fine-grained tokens when possible
- Set token expiration dates
- Regenerate tokens periodically

## 🆘 Getting Help

### Common Issues

**"Session X not found"**
- File doesn't exist in `sessions/` folder
- Filename format is wrong (must be `session-X.md`)

**"Failed to publish"**
- GitHub token expired or invalid
- No internet connection
- Repository doesn't exist

**Theme not saving**
- Check for valid hex color codes (`#RRGGBB`)
- Clear browser cache and try again

### Need More Help?

1. Check the browser console (F12) for errors
2. Verify file structure matches the guide
3. Try with a fresh clone of the repository
4. Test without GitHub integration first

## 📋 Checklist for New Campaigns

- [ ] Upload all files to GitHub
- [ ] Enable GitHub Pages
- [ ] Add custom font (optional)
- [ ] Configure masthead image and title
- [ ] Set up GitHub integration (optional)
- [ ] Customize theme colors
- [ ] Create Session 1 recap
- [ ] Share site URL with players

## 🎯 Best Practices

1. **Start each session with a recap** - Helps everyone remember what happened
2. **Add posts chronologically** - Keep things in order
3. **Use descriptive titles** - Makes it easier to find content later
4. **Back up regularly** - Download session files periodically
5. **Use conversations** - Capture memorable RP moments
6. **Add quotes liberally** - Great for NPCs and players alike
7. **Text entries for details** - Deep dive into discoveries or character thoughts

## 🚀 Advanced Usage

### Custom Themes

Create theme presets in `script.js`:

```javascript
const themes = {
    ocean: {
        primary: '#0077BE',
        secondary: '#00A896',
        tertiary: '#FF6B35'
    },
    forest: {
        primary: '#2D6A4F',
        secondary: '#52796F',
        tertiary: '#8B4513'
    }
};
```

### Multiple Campaigns

Create separate repositories for each campaign:

```
your-username/
├── ringside-of-the-sea/
├── frostmaiden-diary/
└── ravenloft-chronicles/
```

Or use branches:

```
main (Campaign 1)
campaign-2
campaign-3
```

### Export to PDF

Use browser print (Cmd/Ctrl + P) to save sessions as PDF:

1. Navigate to a session
2. Press Cmd/Ctrl + P
3. Select "Save as PDF"
4. Choose layout and save

## 📜 License

This project is open source and available for personal and commercial use.

## 🙏 Credits

- Material Design 3 by Google
- Marked.js for markdown parsing
- Icons from Material Symbols

## 📊 Version History

### v2.1.0 (Current)
- ✨ Added **Character**, **Location**, and **Travel** post types
- ✨ Implemented **Campaign Details** view with structured post support
- ✨ Added **Session Subtitles** and **Material Icons** to sidebar
- ✨ Improved markdown parsing for meta-less content
- ✨ Added "History Edu" icons and centered navigation

### v2.0.0
- ✨ Split sessions into separate files
- ✨ Added session sidebar navigation
- ✨ Added masthead customization
- ✨ Added custom font support
- ✨ Improved GitHub integration

### v1.0.0
- Initial release
- Single posts.md file
- Basic blog layout

---

**Happy adventuring!** 🎲✨

For updates and more features, star the repository on GitHub!
