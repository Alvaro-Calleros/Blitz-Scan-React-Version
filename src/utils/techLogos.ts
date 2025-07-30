// Logos de tecnologías web para WhatWeb
export interface TechLogo {
  name: string;
  logo: string;
  color: string;
}

export const techLogos: Record<string, TechLogo> = {
  // CMS
  'WordPress': {
    name: 'WordPress',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg',
    color: '#21759b'
  },
  'Drupal': {
    name: 'Drupal',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/drupal/drupal-plain.svg',
    color: '#0678be'
  },
  'Joomla': {
    name: 'Joomla',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/joomla/joomla-plain.svg',
    color: '#f44321'
  },
  'Magento': {
    name: 'Magento',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/magento/magento-original.svg',
    color: '#f46f25'
  },
  'Shopify': {
    name: 'Shopify',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/shopify/shopify-plain.svg',
    color: '#95bf47'
  },

  // Web Servers
  'Apache': {
    name: 'Apache',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-line.svg',
    color: '#d22128'
  },
  'Nginx': {
    name: 'Nginx',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg',
    color: '#009639'
  },
  'LiteSpeed': {
    name: 'LiteSpeed',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg',
    color: '#009639'
  },
  'HTTPServer': {
    name: 'HTTP Server',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-line.svg',
    color: '#d22128'
  },
  'IIS': {
    name: 'IIS',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg',
    color: '#00a4ef'
  },

  // Programming Languages
  'PHP': {
    name: 'PHP',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-plain.svg',
    color: '#777bb4'
  },
  'Python': {
    name: 'Python',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-plain.svg',
    color: '#3776ab'
  },
  'Django': {
    name: 'Django',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
    color: '#092e20'
  },
  'Flask': {
    name: 'Flask',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-plain.svg',
    color: '#3776ab'
  },
  'Ruby': {
    name: 'Ruby',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-plain.svg',
    color: '#cc342d'
  },
  'Rails': {
    name: 'Rails',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rails/rails-plain.svg',
    color: '#cc0000'
  },
  'Java': {
    name: 'Java',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-plain.svg',
    color: '#007396'
  },
  'Node.js': {
    name: 'Node.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-plain.svg',
    color: '#339933'
  },

  // JS Frameworks
  'jQuery': {
    name: 'jQuery',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-plain.svg',
    color: '#0769ad'
  },
  'React': {
    name: 'React',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    color: '#61dafb'
  },
  'Angular': {
    name: 'Angular',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-plain.svg',
    color: '#dd0031'
  },
  'Vue.js': {
    name: 'Vue.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-plain.svg',
    color: '#4fc08d'
  },
  'Express.js': {
    name: 'Express.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
    color: '#000000'
  },
  'Next.js': {
    name: 'Next.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
    color: '#000000'
  },
  'Nuxt.js': {
    name: 'Nuxt.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nuxtjs/nuxtjs-original.svg',
    color: '#00dc82'
  },

  // CSS Frameworks
  'Bootstrap': {
    name: 'Bootstrap',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-plain.svg',
    color: '#7952b3'
  },
  'Tailwind CSS': {
    name: 'Tailwind CSS',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg',
    color: '#06b6d4'
  },
  'Foundation': {
    name: 'Foundation',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/foundation/foundation-plain.svg',
    color: '#2b4a6b'
  },
  'Bulma': {
    name: 'Bulma',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bulma/bulma-plain.svg',
    color: '#00d1b2'
  },

  // Analytics & Tracking
  'Google Analytics': {
    name: 'Google Analytics',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-plain.svg',
    color: '#4285f4'
  },
  'Google Tag Manager': {
    name: 'Google Tag Manager',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-plain.svg',
    color: '#4285f4'
  },
  'Facebook Pixel': {
    name: 'Facebook Pixel',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-plain.svg',
    color: '#1877f2'
  },

  // CDN & Hosting
  'Cloudflare': {
    name: 'Cloudflare',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cloudflare/cloudflare-original.svg',
    color: '#f38020'
  },
  'AWS': {
    name: 'AWS',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg',
    color: '#ff9900'
  },
  'Vercel': {
    name: 'Vercel',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-plain.svg',
    color: '#000000'
  },
  'Netlify': {
    name: 'Netlify',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/netlify/netlify-original.svg',
    color: '#00ad9f'
  },

  // HTML/CSS/JS
  'HTML5': {
    name: 'HTML5',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-plain.svg',
    color: '#e34f26'
  },
  'CSS3': {
    name: 'CSS3',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-plain.svg',
    color: '#1572b6'
  },
  'JavaScript': {
    name: 'JavaScript',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-plain.svg',
    color: '#f7df1e'
  },
  'TypeScript': {
    name: 'TypeScript',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-plain.svg',
    color: '#3178c6'
  },

  // Databases
  'MySQL': {
    name: 'MySQL',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-plain.svg',
    color: '#4479a1'
  },
  'PostgreSQL': {
    name: 'PostgreSQL',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-plain.svg',
    color: '#336791'
  },
  'MongoDB': {
    name: 'MongoDB',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-plain.svg',
    color: '#47a248'
  },

  // Additional technologies
  'Site Kit by Google': {
    name: 'Site Kit by Google',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-plain.svg',
    color: '#4285f4'
  },
  'Open-Graph-Protocol': {
    name: 'Open Graph Protocol',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-plain.svg',
    color: '#e34f26'
  },
  'MetaGenerator': {
    name: 'Meta Generator',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-plain.svg',
    color: '#e34f26'
  },
  'Frame': {
    name: 'Frame',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-plain.svg',
    color: '#e34f26'
  },
  'WooCommerce': {
    name: 'WooCommerce',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/woocommerce/woocommerce-plain.svg',
    color: '#96588a'
  },
  'Yoast SEO': {
    name: 'Yoast SEO',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg',
    color: '#21759b'
  }
};

export const getTechLogo = (techName: string): TechLogo => {
  const normalizedName = techName.toLowerCase().trim();
  
  // Buscar coincidencias exactas primero
  for (const [key, logo] of Object.entries(techLogos)) {
    if (key.toLowerCase() === normalizedName) {
      return logo;
    }
  }
  
  // Buscar coincidencias parciales más inteligentes
  for (const [key, logo] of Object.entries(techLogos)) {
    const keyLower = key.toLowerCase();
    
    // Coincidencia exacta
    if (normalizedName === keyLower) {
      return logo;
    }
    
    // Coincidencia parcial
    if (normalizedName.includes(keyLower) || keyLower.includes(normalizedName)) {
      return logo;
    }
    
    // Coincidencias especiales por tecnología
    const techMatches = {
      'wordpress': ['wordpress', 'wp'],
      'jquery': ['jquery', 'jq'],
      'bootstrap': ['bootstrap', 'bs'],
      'php': ['php'],
      'html': ['html', 'html5'],
      'css': ['css', 'css3'],
      'javascript': ['javascript', 'js'],
      'nginx': ['nginx'],
      'apache': ['apache'],
      'google': ['google', 'analytics', 'gtag'],
      'cloudflare': ['cloudflare'],
      'react': ['react'],
      'angular': ['angular'],
      'vue': ['vue'],
      'node': ['node', 'nodejs'],
      'python': ['python'],
      'django': ['django'],
      'flask': ['flask'],
      'ruby': ['ruby'],
      'rails': ['rails'],
      'java': ['java'],
      'mysql': ['mysql'],
      'postgresql': ['postgresql', 'postgres'],
      'mongodb': ['mongodb'],
      'aws': ['aws', 'amazon'],
      'vercel': ['vercel'],
      'netlify': ['netlify'],
      'tailwind': ['tailwind'],
      'next': ['next'],
      'nuxt': ['nuxt'],
      'woocommerce': ['woocommerce', 'woo'],
      'yoast': ['yoast', 'seo']
    };
    
    for (const [tech, keywords] of Object.entries(techMatches)) {
      if (keyLower.includes(tech) && keywords.some(keyword => normalizedName.includes(keyword))) {
        return logo;
      }
    }
  }
  
  // Logo por defecto basado en el tipo de tecnología
  if (normalizedName.includes('server') || normalizedName.includes('http')) {
    return {
      name: techName,
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-line.svg',
      color: '#d22128'
    };
  }
  
  if (normalizedName.includes('framework') || normalizedName.includes('js')) {
    return {
      name: techName,
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-plain.svg',
      color: '#f7df1e'
    };
  }
  
  if (normalizedName.includes('meta') || normalizedName.includes('graph')) {
    return {
      name: techName,
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-plain.svg',
      color: '#e34f26'
    };
  }
  
  if (normalizedName.includes('analytics') || normalizedName.includes('tracking')) {
    return {
      name: techName,
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-plain.svg',
      color: '#4285f4'
    };
  }
  
  // Logo por defecto genérico
  return {
    name: techName,
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg',
    color: '#6b7280'
  };
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'CMS': '📰',
    'Web Server': '🌐',
    'Programming Language': '💻',
    'JS Framework': '⚛️',
    'CSS Framework': '🎨',
    'Analytics': '📊',
    'CDN': '🚀',
    'Database': '🗄️',
    'Hosting': '☁️',
    'Other': '🔧'
  };
  
  return icons[category] || '🔧';
}; 