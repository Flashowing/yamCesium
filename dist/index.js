import * as Cesium from "cesium";
var pkg = require("../package.json");
// 设置版本号
export var version = pkg.version;
// 设置默认token
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YWJlYzNkNS0yY2M0LTQxZWQtOGZhNi05MjEzYmVmZGVkNTkiLCJpZCI6MzU1NTEsImlhdCI6MTYwNDYyNzY2NH0.JxhQQxEvJTrmeARILcywKaPoPEPjO1RlqL28CRjktx8";
import Map from "./cesium/Map";
export { Map };
// 图层加载
import BaiduImageryProvider from "./imagery/baidu/BaiduImageryProvider";
import AmapImageryProvider from "./imagery/amap/AmapImageryProvider";
import TencentImageryProvider from "./imagery/tencent/TencentImageryProvider";
import TdtImageryProvider from "./imagery/tdt/TdtImageryProvider";
import GoogleImageryProvider from "./imagery/google/GoogleImageryProvider";
export { AmapImageryProvider };
export { BaiduImageryProvider };
export { TencentImageryProvider };
export { TdtImageryProvider };
export { GoogleImageryProvider };
// 坐标转换工具
import coordTransform from "./transform/CoordTransform";
export { coordTransform };
// 指北针
import viewerCesiumNavigationMixin from "./plugins/navigation/viewerCesiumNavigationMixin";
// import CesiumNavigation from "./navigation/CesiumNavigation";
// export { CesiumNavigation };
// @ts-ignore
export { viewerCesiumNavigationMixin };
// 截屏
export { Canvas2Image } from "./scene/shortcut/Canvas2Image";
// 汉化
export { CesiumZh } from "./plugins/cesiumZh/CesiumZh";
// turf
// 引入turf打包文件较大，建议在需要的时候再引入
// const turf = require("@turf/turf");
// export { turf };
// CesiumMethod
import CesiumMethod from "./plugins/lib/CesiumMethod";
export { CesiumMethod };
// PublicMethod
import PublicMethod from "./plugins/lib/PublicMethod";
export { PublicMethod };
// primitive图元聚合 （打包KDBush会增加打包文件50kb）
import PrimitiveCluster from "./entity/dataSource/PrimitiveCluster";
// @ts-ignore
Cesium.PrimitiveCluster = PrimitiveCluster;
// export { PrimitiveCluster };
// 聚合工具类
import ClusterUtil from "./entity/dataSource/ClusterUtil";
export { ClusterUtil };
// 绘制
import PlotTracker from "./entity/plot/PlotTracker";
export { PlotTracker };
import Plot from "./entity/plot/Plot";
export { Plot };
import MeasureTools from "./entity/plot/measure/MeasureTools";
export { MeasureTools };
import Effect from "./effect/Effect";
/**
 * 效果
 */
export { Effect };
// import skyBoxOnGround from "SkyBoxOnGround.js";
import skyBoxOnGround from "./scene/weather/SkyBoxOnGround";
// const skyBoxOnGround = require("scene/weather/SkyBoxOnGround.js");
// @ts-ignore
// Cesium.skyBoxOnGround = skyBoxOnGround;
skyBoxOnGround();
/**
 * 天气
 */
import Weather from "./scene/weather/Weather";
export { Weather };
/**
 * popup
 */
import Popup from "./plugins/popup/Popup";
export { Popup };
