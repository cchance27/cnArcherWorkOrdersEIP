const path = require('path');

module.exports = {
  entry: './src/app.js',
  mode: 'production',
  optimization: {
    usedExports: true,
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components|static)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['css-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'image-webpack-loader',
        enforce: 'pre'
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      }
    ]
  },
  externals: [],
  resolve: { extensions: ["*", ".js"] },
  output: {
    path: path.resolve(__dirname, 'dist/'),
    publicPath: '/AdminPortal862/cnArcher/',
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: path.join(__dirname, "/static/"),
    port: 3000,
    publicPath: "/AdminPortal862/cnArcher/",
  },
}