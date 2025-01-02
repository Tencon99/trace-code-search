const { defineConfig } = require("@vue/cli-service");
const TerserPlugin = require("terser-webpack-plugin"); // 用于代码压缩
const CompressionWebpackPlugin = require("compression-webpack-plugin"); // 用于生成 gzip 文件
const WebpackObfuscator = require("webpack-obfuscator"); // 用于代码混淆

module.exports = defineConfig({
  transpileDependencies: true,

  // 设置项目的基础路径 (publicPath)
  publicPath:
    process.env.NODE_ENV === "production"
      ? "/trace-code-search/" // 替换为您的 GitHub 仓库名，用于生产环境
      : "/", // 用于本地开发环境

  // 配置 Webpack
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === "production") {
      // 生产环境配置
      config.optimization = {
        minimize: true, // 开启最小化
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true, // 移除 console.log
                drop_debugger: true, // 移除 debugger
              },
            },
          }),
        ],
      };

      // 生产环境额外插件
      config.plugins.push(
        // 代码混淆插件
        new WebpackObfuscator(
          {
            rotateStringArray: true,
            stringArray: true,
            stringArrayThreshold: 0.75,
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            disableConsoleOutput: true,
          },
          ["**/vendor.js"] // 排除的文件
        ),

        // gzip 压缩插件
        new CompressionWebpackPlugin({
          algorithm: "gzip",
          test: /\.(js|css|html|svg)$/, // 匹配需要压缩的文件
          threshold: 10240, // 文件大于 10KB 时进行压缩
          minRatio: 0.8, // 压缩比大于 0.8
        })
      );
    }
  },

  // 如果需要额外插件配置，可以在这里添加
});
