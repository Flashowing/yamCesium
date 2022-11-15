import * as Cesium from "cesium";
import BaiduMercatorTilingScheme from "./BaiduMercatorTilingScheme";
const IMG_URL = "http://shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46";
const VEC_URL = "http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020";
const CUSTOM_URL = "http://api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid={style}";
/**
 * @desc 百度地图图层
 */
class BaiduImageryProvider {
    /**
     * @param options {BaiduImageryProviderOptions} 百度地图图层参数
     * @param {Ellipsoid} [options.ellipsoid=Ellipsoid.WGS84] 其表面被平铺的椭球体。默认为WGS84椭球.
     * @param {Number} [options.numberOfLevelZeroTilesX=1] X方向上0级的平铺数瓦片树.
     * @param {Number} [options.numberOfLevelZeroTilesY=1] 级别0处Y方向的平铺数瓦片树.
     * @param {Cartesian2} [options.rectangleSouthwestInMeters] 覆盖的矩形的西南角瓷砖方案，单位为米。
     * 如果未指定此参数或矩形NortheastInMeters地球在经度方向上覆盖，在纬度方向上覆盖相等的距离方向，导致正方形投影.
     * @param {Cartesian2} [options.rectangleNortheastInMeters] 覆盖的矩形的东北角瓷砖方案，单位为米。
     * 如果未指定此参数或矩形SouthwestInMeters地球在经度方向上覆盖，在纬度方向上覆盖相等的距离方向，导致正方形投影.
     * @param {String} [options.style] 图层类型 img:影像图，vec:矢量图，custom:自定义图
     * @param {String} [options.crs] 投影方式 BD09:百度墨卡托，WGS84:WGS84坐标系
     */
    constructor(options) {
        this._url =
            options.style === "img"
                ? IMG_URL
                : options.style === "vec"
                    ? VEC_URL
                    : CUSTOM_URL;
        this._tileWidth = 256;
        this._tileHeight = 256;
        this._maximumLevel = 18;
        this._crs = options.crs || "BD09";
        if (options.crs === "WGS84") {
            let resolutions = [];
            for (let i = 0; i < 19; i++) {
                resolutions[i] = 256 * Math.pow(2, 18 - i);
            }
            this._tilingScheme = new BaiduMercatorTilingScheme({
                resolutions,
                rectangleSouthwestInMeters: new Cesium.Cartesian2(-20037726.37, -12474104.17),
                rectangleNortheastInMeters: new Cesium.Cartesian2(20037726.37, 12474104.17)
            });
        }
        else {
            this._tilingScheme = new Cesium.WebMercatorTilingScheme({
                rectangleSouthwestInMeters: new Cesium.Cartesian2(-33554054, -33746824),
                rectangleNortheastInMeters: new Cesium.Cartesian2(33554054, 33746824)
            });
        }
        this._rectangle = this._tilingScheme.rectangle;
        this._credit = undefined;
        this._style = options.style || "normal";
    }
    get url() {
        return this._url;
    }
    get token() {
        return this._token;
    }
    get tileWidth() {
        if (!this.ready) {
            throw new Cesium.DeveloperError("tileWidth must not be called before the imagery provider is ready.");
        }
        return this._tileWidth;
    }
    get tileHeight() {
        if (!this.ready) {
            throw new Cesium.DeveloperError("tileHeight must not be called before the imagery provider is ready.");
        }
        return this._tileHeight;
    }
    get maximumLevel() {
        if (!this.ready) {
            throw new Cesium.DeveloperError("maximumLevel must not be called before the imagery provider is ready.");
        }
        return this._maximumLevel;
    }
    get minimumLevel() {
        if (!this.ready) {
            throw new Cesium.DeveloperError("minimumLevel must not be called before the imagery provider is ready.");
        }
        return 0;
    }
    get tilingScheme() {
        if (!this.ready) {
            throw new Cesium.DeveloperError("tilingScheme must not be called before the imagery provider is ready.");
        }
        return this._tilingScheme;
    }
    get rectangle() {
        if (!this.ready) {
            throw new Cesium.DeveloperError("rectangle must not be called before the imagery provider is ready.");
        }
        return this._rectangle;
    }
    get ready() {
        return !!this._url;
    }
    get credit() {
        return this._credit;
    }
    get hasAlphaChannel() {
        return true;
    }
    getTileCredits(x, y, level) {
    }
    requestImage(x, y, level) {
        if (!this.ready) {
            throw new Cesium.DeveloperError("requestImage must not be called before the imagery provider is ready.");
        }
        let xTiles = this._tilingScheme.getNumberOfXTilesAtLevel(level);
        let yTiles = this._tilingScheme.getNumberOfYTilesAtLevel(level);
        let url = this._url
            .replace("{z}", level)
            .replace("{s}", String(1))
            .replace("{style}", this._style);
        if (this._crs === "WGS84") {
            url = url.replace("{x}", String(x)).replace("{y}", String(-y));
        }
        else {
            url = url
                .replace("{x}", String(x - xTiles / 2))
                .replace("{y}", String(yTiles / 2 - y - 1));
        }
        // @ts-ignore
        return Cesium.ImageryProvider.loadImage(this, url);
    }
}
export default BaiduImageryProvider;