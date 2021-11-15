const path = require("path");
// const CompressionPlugin = require("compression-webpack-plugin")
function resolve(dir) {
    return path.join(__dirname, dir);
}
export default {
    publicDir: './',
    chainWebpack: config => {
        // if (process.env.NODE_ENV === 'production') {
        //     压缩代码
        //     config.plugin('compressionPlugin')
        //         .use(new CompressionPlugin({
        //             test: /\.js$|\.html$|.\css/, // 匹配文件名
        //             threshold: 10240, // 对超过10k的数据压缩
        //             deleteOriginalAssets: false // 不删除源文件
        //         }))
        // }
        config.resolve.alias
            .set("views", resolve("src/views")).
            set("assets", resolve("src/assets")).
            set("components", resolve("src/components")).
            set("api", resolve("src/api")).set("store", resolve("src/store")).set('assets', resolve('src/assets'))
    }
}