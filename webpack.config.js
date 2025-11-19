const path = require('path');

module.exports = {
  entry: './vibesheet/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'vibe-sheet.js',
    library: 'VibeSheet',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  externals: {
    'react': 'react',
    'react-dom': 'react-dom'
  }
};
