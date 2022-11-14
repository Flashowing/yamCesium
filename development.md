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


# 简介

封装各种Cesium组件

# 功能点

1. Cesium 地图插件，用于添加国内各大地图厂商的地图。该功能基于[cesium-map](https://github.com/dvgis/cesium-map)插件进行封装。
2. Cesium navigation插件，用于添加地图导航控件。该功能基于[cesium-navigation-umd](https://github.com/worlddai/cesium-navigation-umd)
   插件进行封装。
3. 截屏，保存场景图片。注：必须设置preserveDrawingBuffer: true
4. 测量
5. 点聚合 TODO 完成primitive聚合，datasource聚合待完成
6. 图形绘制
7. 图层管理 TODO
8. 3dtiles模型 TODO
9. popup TODO
10. 第一人称视角
11. 鹰眼图
12. 雷达扫描 TODO
13. 热力图 TODO
14. geojson TODO
15. 水面 TODO
16. 坐标转换
17. dat.gui TODO
18. turf
19. proj4js TODO
20. 汉化
21. Geocoder TODO
22. 引入CesiumMethod和PublicMethod
23. 挖坑 TODO
24. 双击旋转
25. 底部经纬度显示 TODO


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
