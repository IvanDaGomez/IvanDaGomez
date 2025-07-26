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
      `https://api.openweathermap.org/data/2.5/weather?q=bogota&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
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
 * Automatically detect technologies from repositories
 */
async function setDynamicTechnologies() {
  try {
    // Replace 'IvanDaGomez' with your GitHub username
    const { data: repos } = await octokit.rest.repos.listForUser({
      username: 'IvanDaGomez',
      per_page: 100,
      sort: 'updated'
    });

    // Count languages across all repos
    const languageCount = {};
    
    for (const repo of repos) {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    }

    // Technology mapping with colors and logos
    const techMapping = {
      'JavaScript': { color: 'F7DF1E', logoColor: 'black', logo: 'javascript' },
      'TypeScript': { color: '007ACC', logoColor: 'white', logo: 'typescript' },
      'Python': { color: '3776AB', logoColor: 'white', logo: 'python' },
      'Java': { color: 'ED8B00', logoColor: 'white', logo: 'java' },
      'C++': { color: '00599C', logoColor: 'white', logo: 'c%2B%2B' },
      'C': { color: 'A8B9CC', logoColor: 'black', logo: 'c' },
      'C#': { color: '239120', logoColor: 'white', logo: 'c-sharp' },
      'PHP': { color: '777BB4', logoColor: 'white', logo: 'php' },
      'Ruby': { color: 'CC342D', logoColor: 'white', logo: 'ruby' },
      'Go': { color: '00ADD8', logoColor: 'white', logo: 'go' },
      'Rust': { color: '000000', logoColor: 'white', logo: 'rust' },
      'Swift': { color: 'FA7343', logoColor: 'white', logo: 'swift' },
      'Kotlin': { color: '0095D5', logoColor: 'white', logo: 'kotlin' },
      'Dart': { color: '0175C2', logoColor: 'white', logo: 'dart' },
      'HTML': { color: 'E34F26', logoColor: 'white', logo: 'html5' },
      'CSS': { color: '1572B6', logoColor: 'white', logo: 'css3' },
      'SCSS': { color: 'CC6699', logoColor: 'white', logo: 'sass' },
      'Vue': { color: '4FC08D', logoColor: 'white', logo: 'vue.js' },
      'React': { color: '61DAFB', logoColor: 'black', logo: 'react' },
      'Angular': { color: 'DD0031', logoColor: 'white', logo: 'angular' },
      'Shell': { color: '89E051', logoColor: 'black', logo: 'gnu-bash' },
      'Dockerfile': { color: '2496ED', logoColor: 'white', logo: 'docker' },
      'Jupiter Notebook': { color: 'F37626', logoColor: 'white', logo: 'jupyter' },
      'Markdown': { color: '000000', logoColor: 'white', logo: 'markdown' },
      'SQL': { color: 'E34F26', logoColor: 'white', logo: 'mysql' },
      'GraphQL': { color: 'E10098', logoColor: 'white', logo: 'graphql' },
      'Firebase': { color: 'FFCA28', logoColor: 'black', logo: 'firebase' },
      'AWS': { color: 'FF9900', logoColor: 'white', logo: 'amazonaws' },
      'Azure': { color: '0078D4', logoColor: 'white', logo: 'azure' },
      'PostgreSQL': { color: '336791', logoColor: 'white', logo: 'postgresql' },
      'Redis': { color: 'DC382D', logoColor: 'white', logo: 'redis' },
      'MongoDB': { color: '47A248', logoColor: 'white', logo: 'mongodb' },
      'Elasticsearch': { color: '005571', logoColor: 'white', logo: 'elasticsearch' },
      'RabbitMQ': { color: 'FF6600', logoColor: 'white', logo: 'rabbitmq' },
      'Kubernetes': { color: '326CE5', logoColor: 'white', logo: 'kubernetes' },  
    };

    // Get top languages (limit to top 10)
    const topLanguages = Object.entries(languageCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([lang]) => lang);

    // Generate technology badges
    DATA.tech_badges = topLanguages
      .filter(lang => techMapping[lang])
      .map(lang => {
        const tech = techMapping[lang];
        return `<img alt=\"${lang}\" src=\"https://img.shields.io/badge/-${lang}-${tech.color}?style=flat-square&logo=${tech.logo}&logoColor=${tech.logoColor}\" />`;
      });

    // Add some common tools/frameworks (you can customize this)
    const commonTools = [
      { name: 'Git', color: 'F05032', logo: 'git', logoColor: 'white' },
      { name: 'GitHub', color: '181717', logo: 'github', logoColor: 'white' },
      { name: 'Node.js', color: '43853D', logo: 'node.js', logoColor: 'white' },
      { name: 'VS Code', color: '007ACC', logo: 'visual-studio-code', logoColor: 'white' }
    ];

    const toolBadges = commonTools.map(tool => 
      `<img alt=\"${tool.name}\" src=\"https://img.shields.io/badge/-${tool.name}-${tool.color}?style=flat-square&logo=${tool.logo}&logoColor=${tool.logoColor}\" />`
    );

    DATA.tech_badges = [...DATA.tech_badges, ...toolBadges];
    
    console.log(`✅ Dynamic technologies updated (found ${topLanguages.length} languages)`);
  } catch (error) {
    console.log('⚠️  Error fetching technologies:', error.message);
    // Fallback to empty array if error
    DATA.tech_badges = [];
  }
}

/**
 * Get featured projects automatically
 */
async function setFeaturedProjects() {
  try {
    // Replace 'IvanDaGomez' with your GitHub username
    const { data: repos } = await octokit.rest.repos.listForUser({
      username: 'IvanDaGomez',
      per_page: 100,
      sort: 'updated'
    });

    // Filter out forks and select interesting repos
    const ownRepos = repos.filter(repo => !repo.fork && !repo.private);
    
    // Sort by a combination of stars, recent activity, and having a description
    const scoredRepos = ownRepos.map(repo => {
      let score = 0;
      
      // Points for stars (each star = 10 points)
      score += repo.stargazers_count * 10;
      
      // Points for forks (each fork = 5 points)
      score += repo.forks_count * 5;
      
      // Points for having a description (50 points)
      if (repo.description && repo.description.trim()) {
        score += 50;
      }
      
      // Points for recent activity (more recent = more points)
      const daysSinceUpdate = (new Date() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate < 30) score += 30; // Updated in last month
      else if (daysSinceUpdate < 90) score += 15; // Updated in last 3 months
      
      // Points for having topics/languages
      if (repo.language) score += 20;
      if (repo.topics && repo.topics.length > 0) score += 10;
      
      return { ...repo, score };
    });
    
    // Get top 6 repositories
    const topRepos = scoredRepos
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
    
    // Format projects for template
    DATA.featured_projects = topRepos.map(repo => {
      // Generate tech stack from language and topics
      let techStack = [];
      if (repo.language) techStack.push(repo.language);
      if (repo.topics && repo.topics.length > 0) {
        // Add some topics as tech stack, but limit to avoid clutter
        techStack.push(...repo.topics.slice(0, 2));
      }
      
      return {
        name: repo.name,
        url: repo.html_url,
        description: repo.description || 'A cool project I\'m working on',
        tech_stack: techStack.length > 0 ? techStack.join(', ') : 'Various technologies',
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || 'Mixed'
      };
    });
    
    console.log(`✅ Featured projects updated (found ${DATA.featured_projects.length} projects)`);
  } catch (error) {
    console.log('⚠️  Error fetching featured projects:', error.message);
    // Fallback to empty array
    DATA.featured_projects = [];
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
    setFeaturedProjects(),
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
