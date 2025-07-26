const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');
const moment = require('moment');
const { Octokit } = require('@octokit/rest');

const TEMPLATE_FILE = './README.template.md';
const OUTPUT_FILE = './README.md';

// Initialize Octokit for GitHub API calls
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

let DATA = {
  refresh_date: moment().format('dddd, MMMM Do YYYY, h:mm A'),
  year: new Date().getFullYear(),
};

/**
 * Get weather information for your location
 */
async function setWeatherInformation() {
  if (!process.env.OPEN_WEATHER_MAP_KEY) {
    console.log('⚠️  No weather API key found, skipping weather data');
    return;
  }

  try {
    // Change 'madrid' to your preferred city
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=madrid&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
    );
    const data = await response.json();
    
    DATA.city_temperature = Math.round(data.main.temp);
    DATA.city_weather = data.weather[0].description;
    DATA.city_weather_icon = data.weather[0].icon;
    DATA.sun_rise = moment(data.sys.sunrise * 1000).format('HH:mm');
    DATA.sun_set = moment(data.sys.sunset * 1000).format('HH:mm');
    DATA.city_name = data.name;
    
    console.log('✅ Weather data updated');
  } catch (error) {
    console.log('⚠️  Error fetching weather data:', error.message);
  }
}

/**
 * Get GitHub stats
 */
async function setGitHubStats() {
  try {
    // Replace 'IvanDaGomez' with your GitHub username
    const { data: user } = await octokit.rest.users.getByUsername({
      username: 'IvanDaGomez',
    });

    DATA.github_followers = user.followers;
    DATA.github_following = user.following;
    DATA.github_public_repos = user.public_repos;
    
    console.log('✅ GitHub stats updated');
  } catch (error) {
    console.log('⚠️  Error fetching GitHub stats:', error.message);
  }
}

/**
 * Get recent GitHub activity
 */
async function setRecentActivity() {
  try {
    // Replace 'IvanDaGomez' with your GitHub username
    const { data: events } = await octokit.rest.activity.listPublicEventsForUser({
      username: 'IvanDaGomez',
      per_page: 5,
    });

    DATA.recent_activity = events.map(event => {
      const date = moment(event.created_at).fromNow();
      let action = '';
      
      switch (event.type) {
        case 'PushEvent':
          const commitCount = event.payload.commits.length;
          action = `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''} to ${event.repo.name}`;
          break;
        case 'CreateEvent':
          action = `Created ${event.payload.ref_type} in ${event.repo.name}`;
          break;
        case 'IssuesEvent':
          action = `${event.payload.action} issue in ${event.repo.name}`;
          break;
        case 'PullRequestEvent':
          action = `${event.payload.action} pull request in ${event.repo.name}`;
          break;
        case 'WatchEvent':
          action = `Starred ${event.repo.name}`;
          break;
        default:
          action = `${event.type.replace('Event', '')} in ${event.repo.name}`;
      }
      
      return {
        action,
        date,
        repo: event.repo.name
      };
    });
    
    console.log('✅ Recent activity updated');
  } catch (error) {
    console.log('⚠️  Error fetching recent activity:', error.message);
  }
}

/**
 * Generate README from template
 */
async function generateReadMe() {
  try {
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');
    
    // Read current README to preserve WakaTime stats
    let currentReadme = '';
    if (fs.existsSync(OUTPUT_FILE)) {
      currentReadme = fs.readFileSync(OUTPUT_FILE, 'utf8');
      
      // Extract WakaTime stats
      const wakaStart = currentReadme.indexOf('<!--START_SECTION:waka-->');
      const wakaEnd = currentReadme.indexOf('<!--END_SECTION:waka-->');
      
      if (wakaStart !== -1 && wakaEnd !== -1) {
        DATA.waka_stats = currentReadme.substring(wakaStart, wakaEnd + '<!--END_SECTION:waka-->'.length);
      }
    }
    
    const output = Mustache.render(template, DATA);
    fs.writeFileSync(OUTPUT_FILE, output);
    
    console.log('✅ README generated successfully');
  } catch (error) {
    console.log('❌ Error generating README:', error.message);
    process.exit(1);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting README generation...');
  
  // Fetch all dynamic data
  await Promise.all([
    setWeatherInformation(),
    setGitHubStats(),
    setRecentActivity(),
  ]);
  
  // Generate README
  await generateReadMe();
  
  console.log('✨ README generation completed!');
}

// Execute if run directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main, DATA };
