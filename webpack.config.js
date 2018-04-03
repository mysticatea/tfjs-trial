"use strict"

const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const { VueLoaderPlugin } = require("vue-loader")

module.exports = {
    entry: "./src/index.ts",
    mode: "development",
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
            },
            {
                test: /\.png$/,
                loader: "file-loader",
                options: {
                    outputPath: "assets/",
                },
            },
        ],
    },
    resolve: {
        extensions: [".vue", ".ts", ".js"],
    },
    plugins: [new CopyWebpackPlugin(["src/index.html"]), new VueLoaderPlugin()],
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist"),
    },
}
