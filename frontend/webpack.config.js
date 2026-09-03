const path = require("path");
module.exports = {
  mode: "development",
  entry: "./src/main.tsx",
  output: {filename:"bundle.js",path:path.resolve(__dirname,"dist")},
  resolve:{extensions:[".tsx",".ts",".js"]},
  module:{
    rules:[
      {test:/\.tsx?$/,use:"babel-loader",exclude:/node_modules/},
      {test:/\.css$/,use:["style-loader","css-loader"]}
    ]
  }
}
//Я учусь использовать vite. Здесь впервые