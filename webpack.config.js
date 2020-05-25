const path = require("path");
const webpack = require("webpack");
const Settings = require("./package.json");
const SERVER_ROOT = Settings.serverRoot;

module.exports = {
    entry: ["@babel/polyfill", "./src/index.tsx"],
    mode: "production",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /(node_modules|bower_components|\.d\.ts$)/,
                use: [
                    "react-hot-loader/webpack",
                    "babel-loader",
                ],
            },
            {
                test: /\.d\.ts$/,
                loader: 'ignore-loader'
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|jpe?g|gif|ttf|woff2?|eot|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            }
        ]
    },
    resolve: { extensions: [".tsx", ".ts", ".js", "*"] },
    output: {
        path: path.resolve(__dirname, "dist/"),
        publicPath: SERVER_ROOT + "/static/game/",
        filename: "bundle.js"
    },
    devServer: {
        contentBase: path.join(__dirname, "public/"),
        contentBasePublicPath: SERVER_ROOT + "/",
        port: 3000,
        publicPath: "http://localhost:3000" + SERVER_ROOT + "/static/game/",
        hotOnly: true
    },
    plugins: [new webpack.HotModuleReplacementPlugin()]
};
