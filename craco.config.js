const path = require('path');
module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@images': path.resolve(__dirname, 'src/Assets/Images'),
      '@login': path.resolve(__dirname, 'src/Components/Login'),
      '@portal': path.resolve(__dirname, 'src/Components/Portal'),
      '@delib':path.resolve(__dirname, 'src/Components/Delib'),
      '@framework':path.resolve(__dirname, 'src/Components/Framework'),
    },
  },
};