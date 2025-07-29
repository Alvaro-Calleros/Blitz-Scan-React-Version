// Logos de tecnologías web para WhatWeb
export interface TechLogo {
  name: string;
  logo: string;
  color: string;
}

// Mapeo de tecnologías a sus logos
export const techLogos: Record<string, TechLogo> = {
  // CMS
  'WordPress': { name: 'WordPress', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg', color: '#21759b' },
  'Drupal': { name: 'Drupal', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/drupal/drupal-plain.svg', color: '#0678be' },
  'Joomla': { name: 'Joomla', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/joomla/joomla-plain.svg', color: '#f44321' },
  'Magento': { name: 'Magento', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/magento/magento-original.svg', color: '#f46f25' },
  'Shopify': { name: 'Shopify', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/shopify/shopify-original.svg', color: '#95bf47' },
  'WooCommerce': { name: 'WooCommerce', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/woocommerce/woocommerce-plain.svg', color: '#7f54b3' },
  
  // Web Servers
  'Apache': { name: 'Apache', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg', color: '#d22128' },
  'Nginx': { name: 'Nginx', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg', color: '#009639' },
  'IIS': { name: 'IIS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg', color: '#00a4ef' },
  'LiteSpeed': { name: 'LiteSpeed', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg', color: '#ff6b35' },
  
  // Programming Languages
  'PHP': { name: 'PHP', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg', color: '#777bb4' },
  'Python': { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', color: '#3776ab' },
  'Node.js': { name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', color: '#339933' },
  'Ruby': { name: 'Ruby', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg', color: '#cc342d' },
  'Java': { name: 'Java', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg', color: '#ed8b00' },
  'ASP.NET': { name: 'ASP.NET', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg', color: '#512bd4' },
  
  // JavaScript Frameworks
  'React': { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', color: '#61dafb' },
  'Vue.js': { name: 'Vue.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg', color: '#4fc08d' },
  'Angular': { name: 'Angular', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg', color: '#dd0031' },
  'jQuery': { name: 'jQuery', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original.svg', color: '#0769ad' },
  'Bootstrap': { name: 'Bootstrap', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg', color: '#7952b3' },
  'Tailwind CSS': { name: 'Tailwind CSS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg', color: '#06b6d4' },
  
  // Analytics
  'Google Analytics': { name: 'Google Analytics', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg', color: '#4285f4' },
  'Google Tag Manager': { name: 'Google Tag Manager', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg', color: '#4285f4' },
  'Facebook Pixel': { name: 'Facebook Pixel', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg', color: '#1877f2' },
  
  // CDN
  'Cloudflare': { name: 'Cloudflare', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cloudflare/cloudflare-original.svg', color: '#f38020' },
  'AWS': { name: 'AWS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg', color: '#ff9900' },
  'Google Cloud': { name: 'Google Cloud', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg', color: '#4285f4' },
  'Azure': { name: 'Azure', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg', color: '#0089d6' },
  
  // Databases
  'MySQL': { name: 'MySQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', color: '#4479a1' },
  'PostgreSQL': { name: 'PostgreSQL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', color: '#336791' },
  'MongoDB': { name: 'MongoDB', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', color: '#47a248' },
  'Redis': { name: 'Redis', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg', color: '#dc382d' },
  
  // Operating Systems
  'Linux': { name: 'Linux', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg', color: '#fcc624' },
  'Ubuntu': { name: 'Ubuntu', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-plain.svg', color: '#e95420' },
  'CentOS': { name: 'CentOS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/centos/centos-original.svg', color: '#932279' },
  'Windows': { name: 'Windows', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg', color: '#0078d4' },
  
  // Security
  'SSL': { name: 'SSL', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg', color: '#009639' },
  'Let\'s Encrypt': { name: 'Let\'s Encrypt', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg', color: '#00a4ef' },
  
  // Others
  'Docker': { name: 'Docker', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', color: '#2496ed' },
  'Git': { name: 'Git', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', color: '#f05032' },
  'GitHub': { name: 'GitHub', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', color: '#181717' },
  'Bitbucket': { name: 'Bitbucket', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bitbucket/bitbucket-original.svg', color: '#0052cc' },
  
  // Frameworks adicionales
  'Laravel': { name: 'Laravel', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-plain.svg', color: '#ff2d20' },
  'Django': { name: 'Django', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg', color: '#092e20' },
  'Flask': { name: 'Flask', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', color: '#000000' },
  'Express': { name: 'Express', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', color: '#000000' },
  'Spring': { name: 'Spring', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg', color: '#6db33f' },
  'Symfony': { name: 'Symfony', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/symfony/symfony-original.svg', color: '#000000' },
  
  // Frontend frameworks
  'Svelte': { name: 'Svelte', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg', color: '#ff3e00' },
  'Next.js': { name: 'Next.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', color: '#000000' },
  'Nuxt.js': { name: 'Nuxt.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg', color: '#00dc82' },
  'Gatsby': { name: 'Gatsby', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gatsby/gatsby-plain.svg', color: '#663399' },
  
  // CSS frameworks
  'Sass': { name: 'Sass', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg', color: '#cc6699' },
  'Less': { name: 'Less', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/less/less-plain-wordmark.svg', color: '#1d365d' },
  'Stylus': { name: 'Stylus', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/stylus/stylus-original.svg', color: '#ff6347' },
  
  // Build tools
  'Webpack': { name: 'Webpack', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/webpack/webpack-original.svg', color: '#8dd6f9' },
  'Vite': { name: 'Vite', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg', color: '#646cff' },
  'Rollup': { name: 'Rollup', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rollupjs/rollupjs-original.svg', color: '#ff3333' },
  
  // Testing frameworks
  'Jest': { name: 'Jest', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg', color: '#c21325' },
  'Cypress': { name: 'Cypress', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cypress/cypress-plain.svg', color: '#17202c' },
  
  // State management
  'Redux': { name: 'Redux', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg', color: '#764abc' },
  'Vuex': { name: 'Vuex', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg', color: '#4fc08d' },
  
  // Mobile frameworks
  'React Native': { name: 'React Native', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', color: '#61dafb' },
  'Ionic': { name: 'Ionic', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ionic/ionic-original.svg', color: '#3880ff' },
  
  // CMS adicionales
  'Squarespace': { name: 'Squarespace', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg', color: '#000000' },
  'Wix': { name: 'Wix', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg', color: '#000000' },
  'Webflow': { name: 'Webflow', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg', color: '#4353ff' },
  
  // E-commerce
  'PrestaShop': { name: 'PrestaShop', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg', color: '#df0067' },
  
  // Servicios en la nube
  'Firebase': { name: 'Firebase', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg', color: '#ffca28' },
  'Vercel': { name: 'Vercel', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg', color: '#000000' },
  'Netlify': { name: 'Netlify', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/netlify/netlify-original.svg', color: '#00ad9f' },
  
  // Herramientas de desarrollo
  'TypeScript': { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', color: '#3178c6' },
  'Babel': { name: 'Babel', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/babel/babel-original.svg', color: '#f9dc3e' },
  'ESLint': { name: 'ESLint', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/eslint/eslint-original.svg', color: '#4b32c3' },
  'Prettier': { name: 'Prettier', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prettier/prettier-original.svg', color: '#f7b93e' },
};

// Logo genérico para tecnologías no encontradas
export const defaultTechLogo: TechLogo = {
  name: 'Technology',
  logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
  color: '#6b7280'
};

// Función para obtener el logo de una tecnología
export function getTechLogo(techName: string): TechLogo {
  // Buscar coincidencia exacta
  if (techLogos[techName]) {
    return techLogos[techName];
  }
  
  // Buscar coincidencia parcial (case insensitive)
  const normalizedTechName = techName.toLowerCase();
  for (const [key, logo] of Object.entries(techLogos)) {
    if (key.toLowerCase().includes(normalizedTechName) || 
        normalizedTechName.includes(key.toLowerCase())) {
      return logo;
    }
  }
  
  // Buscar por palabras clave más específicas
  const keywords: Record<string, string> = {
    // CMS
    'wordpress': 'WordPress',
    'drupal': 'Drupal',
    'joomla': 'Joomla',
    'magento': 'Magento',
    'shopify': 'Shopify',
    'woocommerce': 'WooCommerce',
    'squarespace': 'Squarespace',
    'wix': 'Wix',
    'webflow': 'Webflow',
    'prestashop': 'PrestaShop',
    
    // Web Servers
    'apache': 'Apache',
    'nginx': 'Nginx',
    'iis': 'IIS',
    'litespeed': 'LiteSpeed',
    
    // Programming Languages
    'php': 'PHP',
    'python': 'Python',
    'node': 'Node.js',
    'ruby': 'Ruby',
    'java': 'Java',
    'asp': 'ASP.NET',
    'typescript': 'TypeScript',
    
    // Frameworks
    'react': 'React',
    'vue': 'Vue.js',
    'angular': 'Angular',
    'jquery': 'jQuery',
    'bootstrap': 'Bootstrap',
    'tailwind': 'Tailwind CSS',
    'laravel': 'Laravel',
    'django': 'Django',
    'flask': 'Flask',
    'express': 'Express',
    'spring': 'Spring',
    'symfony': 'Symfony',
    'svelte': 'Svelte',
    'next': 'Next.js',
    'nuxt': 'Nuxt.js',
    'gatsby': 'Gatsby',
    
    // CSS Preprocessors
    'sass': 'Sass',
    'less': 'Less',
    'stylus': 'Stylus',
    
    // Build Tools
    'webpack': 'Webpack',
    'vite': 'Vite',
    'rollup': 'Rollup',
    'babel': 'Babel',
    
    // Testing
    'jest': 'Jest',
    'cypress': 'Cypress',
    
    // State Management
    'redux': 'Redux',
    'vuex': 'Vuex',
    
    // Mobile
    'react native': 'React Native',
    'ionic': 'Ionic',
    
    // Analytics
    'analytics': 'Google Analytics',
    'gtm': 'Google Tag Manager',
    'facebook': 'Facebook Pixel',
    
    // CDN & Cloud
    'cloudflare': 'Cloudflare',
    'aws': 'AWS',
    'google': 'Google Cloud',
    'azure': 'Azure',
    'firebase': 'Firebase',
    'vercel': 'Vercel',
    'netlify': 'Netlify',
    
    // Databases
    'mysql': 'MySQL',
    'postgresql': 'PostgreSQL',
    'mongodb': 'MongoDB',
    'redis': 'Redis',
    
    // Operating Systems
    'linux': 'Linux',
    'ubuntu': 'Ubuntu',
    'centos': 'CentOS',
    'windows': 'Windows',
    
    // Security
    'ssl': 'SSL',
    'letsencrypt': 'Let\'s Encrypt',
    
    // Development Tools
    'docker': 'Docker',
    'git': 'Git',
    'github': 'GitHub',
    'bitbucket': 'Bitbucket',
    'eslint': 'ESLint',
    'prettier': 'Prettier'
  };
  
  for (const [keyword, techKey] of Object.entries(keywords)) {
    if (normalizedTechName.includes(keyword)) {
      return techLogos[techKey] || defaultTechLogo;
    }
  }
  
  return defaultTechLogo;
}

// Función para obtener el color de categoría
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'CMS': 'from-purple-500 to-pink-500',
    'Web Server': 'from-green-500 to-emerald-500',
    'Programming Language': 'from-blue-500 to-indigo-500',
    'JS Framework': 'from-yellow-500 to-orange-500',
    'Analytics': 'from-red-500 to-pink-500',
    'Operating System': 'from-gray-500 to-slate-500',
    'CDN': 'from-cyan-500 to-blue-500',
    'Database': 'from-teal-500 to-green-500',
    'Security': 'from-orange-500 to-red-500',
    'Other': 'from-gray-400 to-gray-600'
  };
  
  return colors[category] || colors['Other'];
} 