"use strict"

module.exports = {
    base: "/tfjs-trial/",
    title: "AlphaZero Clone",
    locales: {
        "/": { lang: "ja-JP" },
    },
    serviceWorker: true,

    themeConfig: {
        docsDir: "pages",
        repo: "mysticatea/tfjs-trial",
        search: false,
        sidebar: [
            ["/", "アルゴリズム解説"],
            {
                title: "五目並べ",
                children: [
                    ["/gomoku/play", "対戦"],
                    ["/gomoku/selfplay", "自己対戦"],
                    ["/gomoku/train", "強化学習"],
                ],
            },
        ],
    },

    chainWebpack(config) {
        defineBabelLoader(config)
        defineTypeScriptLoader(config)
    },
}

// vuepress はデフォルトで buble-loader を使っていて、buble は async/await
// 未対応なので Babel にする。
// https://github.com/vuejs/vuepress/issues/124
function defineBabelLoader(config) {
    const jsRule = config.module.rule("js")
    jsRule.uses.delete("buble-loader")
    jsRule
        .use("babel-loader")
        .loader("babel-loader")
        .options({
            presets: [
                [
                    "@babel/preset-env",
                    {
                        modules: false,
                        targets: { browsers: ["last 2 versions"] },
                        useBuiltIns: "usage",
                    },
                ],
            ],
            plugins: ["@babel/plugin-syntax-dynamic-import"],
        })
}

function defineTypeScriptLoader(config) {
    config.module
        .rule("ts")
        .test(/\.ts$/)
        .use("ts-loader")
        .loader("ts-loader")
        .options({
            context: __dirname,
        })
    config.resolve.extensions.merge([".ts"])
}
