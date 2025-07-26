# 🚀 Enhanced GitHub Profile README Setup

This setup combines your existing WakaTime integration with dynamic content generation inspired by thmsgbrt's implementation.

## ✨ Features

- **WakaTime Integration**: Shows your coding time statistics
- **Dynamic Weather**: Displays current weather for your city
- **GitHub Stats**: Live follower count, repos, and recent activity
- **Animated Typing**: Cool typing animation for your intro
- **Auto-updating**: Refreshes every 3 hours automatically
- **GitHub Activity**: Shows your recent GitHub activity
- **Modern Design**: Clean, modern layout with badges and stats

## 🛠️ Setup Instructions

### 1. Repository Secrets

You need to set up these secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

#### Required:
- `WAKATIME_API_KEY`: Your WakaTime API key (already configured)
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

#### Optional:
- `OPEN_WEATHER_MAP_KEY`: For weather data (get it from [OpenWeatherMap](https://openweathermap.org/api))

### 2. Customize Your Profile

Edit the following files to match your profile:

#### `generate-readme.js`:
- Line 32: Change `'madrid'` to your city
- Line 49: Change `'IvanDaGomez'` to your GitHub username
- Line 66: Change `'IvanDaGomez'` to your GitHub username

#### `README.template.md`:
- Update personal information, skills, and project links
- Modify the "Featured Projects" section with your actual projects
- Update social media links
- Customize the Buy Me a Coffee link

### 3. Installation

1. Make sure all files are in your profile repository
2. Install dependencies (GitHub Actions will do this automatically):
   ```bash
   npm install
   ```

3. Test locally (optional):
   ```bash
   # Set your environment variables
   export GITHUB_TOKEN="your_github_token"
   export OPEN_WEATHER_MAP_KEY="your_weather_key"
   
   # Run the generator
   node generate-readme.js
   ```

### 4. GitHub Actions Workflow

The action will run:
- **Automatically**: Every 3 hours
- **On push**: When you push to the main branch
- **Manually**: You can trigger it from the Actions tab

## 📁 File Structure

```
├── .github/
│   └── workflows/
│       └── enhanced-profile.yml    # Main GitHub Action
├── generate-readme.js              # Dynamic content generator
├── README.template.md              # README template with placeholders
├── package.json                    # Node.js dependencies
├── SETUP.md                       # This setup guide
└── .gitignore                     # Git ignore file
```

## 🎨 Customization Options

### Weather Location
Change the city in `generate-readme.js`:
```javascript
const response = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?q=YOUR_CITY&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
);
```

### GitHub Stats Theme
Update the theme in `README.template.md`:
```markdown
![Stats](https://github-readme-stats.vercel.app/api?username=YourUsername&show_icons=true&theme=radical)
```

Available themes: `dark`, `radical`, `merko`, `gruvbox`, `tokyonight`, `onedark`, `cobalt`, `synthwave`, `highcontrast`, `dracula`

### WakaTime Configuration
Modify the WakaTime settings in `.github/workflows/enhanced-profile.yml`:
```yaml
- name: Update WakaTime Stats
  uses: athul/waka-readme@master
  with:
    WAKATIME_API_KEY: ${{ secrets.WAKATIME_API_KEY }}
    SHOW_TITLE: true
    TIME_RANGE: last_7_days  # Options: last_7_days, last_30_days, last_6_months, last_year
    LANG_COUNT: 8           # Number of languages to show
    SHOW_TOTAL: true        # Show total time
    SHOW_TIME: true         # Show time for each language
    STOP_AT_OTHER: true     # Stop at "Other" category
```

## 🚨 Troubleshooting

### WakaTime not updating
- Check that your `WAKATIME_API_KEY` is correct
- Ensure you have WakaTime tracking enabled in your IDE
- Verify the WakaTime section comments exist in your README

### Weather not showing
- Make sure you've set the `OPEN_WEATHER_MAP_KEY` secret
- Check that the city name is correct (try different variations)
- The weather section will be hidden if no key is provided

### GitHub Stats not showing
- Ensure your GitHub username is correct in `generate-readme.js`
- Check that your profile is public
- The `GITHUB_TOKEN` should be automatically provided

### Action fails
- Check the Actions tab for error logs
- Ensure all dependencies are listed in `package.json`
- Verify all file paths are correct

## 🆘 Getting Help

If you encounter issues:
1. Check the Actions logs in your repository
2. Ensure all secrets are properly configured
3. Verify your template syntax is correct
4. Test the script locally if possible

## 🎉 That's it!

Your enhanced GitHub profile should now update automatically with:
- ⏰ WakaTime coding statistics
- 🌤️ Current weather information
- 📊 Live GitHub statistics
- 🎯 Recent GitHub activity
- ✨ Modern, professional layout

The profile will refresh every 3 hours automatically, keeping your information current!
