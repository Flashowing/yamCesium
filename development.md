# package.json
1. webpack //构建工具；
2. webpack-cli //webpack命令行工具；
3. webpack-dev-server //webpack开发服务器；
4. typescript //ts编译器；
5. ts-loader //ts加载器、用于在webpack中编译ts文件；
6. html-webpack-plugin //webpakc中html插件，用于自动创建html文件；
7. clean-webpack-plugin //webpack中的清除插件，用于每一次构建时都清理打包目录下的文件。
8. @babel/core // babel的核心工具
9. @babel/preset-evn //babel预设环境
10. babel-loader //babel在webpack中的加载器
11. core-js //用来把JS的新语法转成低版本的JS语法，兼容老版本的浏览器
12. kdbush //聚合点的工具
13. turf //空间计算的工具
14. jsdoc //文档生成
15. heatmap-ts //热力图


# 简介

封装各种Cesium组件

# 功能点

1. 地图瓦片插件，用于添加百度、高德、腾讯的地图
2. 指北针
3. 截屏，保存场景图片。注：必须设置preserveDrawingBuffer: true
4. 测量
5. 点聚合 TODO 完成primitive聚合，datasource聚合待完成
6. 图形绘制
7. 3dtiles模型
8. popup
9. 第一人称视角
10. 鹰眼图
11. 雷达扫描
12. 热力图
13. geojson TODO
14. 水面 TODO
15. 坐标转换
16. turf
17. proj4js TODO
18. 汉化
19. 引入CesiumMethod和PublicMethod
20. 双击旋转
21. 天气 


# 更新日志

**2020-10-14**

初始化项目
添加图层加载

**2020-10-15**

添加指北针组件

**2020-10-17**

添加截屏

添加第一人称视角

**2022-10-18**

添加鹰眼图

**2022-10-20**

添加公共方法
引入turf

**2022-10-26**

添加primitive聚合类和聚合工具类

**2022-11-05**

绘制图形

**2022-11-06**

安装Cesium，引入Cesium.d.ts

**2022-11-07**

添加测量工具

**2022-11-12**

绕点旋转

**2022-11-14**

添加热力图、雷达、扫描

**2022-11-16**

添加天气、弹窗

**2022-11-17**

3dTiles模型
