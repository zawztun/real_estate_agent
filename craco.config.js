const path = require('path');

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss')(path.resolve(__dirname, 'tailwind.config.js')),
        require('autoprefixer'),
      ],
    },
  },
}