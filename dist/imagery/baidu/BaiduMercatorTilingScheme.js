var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as Cesium from "cesium";
import BaiduMercatorProjection from "./BaiduMercatorProjection";
import CoordTransform from "../../transform/CoordTransform";
/**
 * @class
 * @extends Cesium.WebMercatorTilingScheme
 */
var BaiduMercatorTilingScheme = /** @class */ (function (_super) {
    __extends(BaiduMercatorTilingScheme, _super);
    function BaiduMercatorTilingScheme(options) {
        var _this = _super.call(this, options) || this;
        _this._projection = {};
        _this.resolutions = [];
        _this._rectangle = {};
        var projection = new BaiduMercatorProjection();
        _this._projection.project = function (cartographic, result) {
            if (result === void 0) { result = []; }
            result = result || {};
            result = CoordTransform.WGS84ToGCJ02(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude));
            result = CoordTransform.GCJ02ToBD09(result[0], result[1]);
            result[0] = Math.min(result[0], 180);
            result[0] = Math.max(result[0], -180);
            result[1] = Math.min(result[1], 74.000022);
            result[1] = Math.max(result[1], -71.988531);
            result = projection.lngLatToPoint({
                lng: result[0],
                lat: result[1]
            });
            return new Cesium.Cartesian2(result.x, result.y);
        };
        _this._projection.unproject = function (cartesian, result) {
            if (result === void 0) { result = []; }
            result = result || {};
            result = projection.mercatorToLngLat({
                lng: cartesian.x,
                lat: cartesian.y
            });
            result = CoordTransform.BD09ToGCJ02(result.lng, result.lat);
            result = CoordTransform.GCJ02ToWGS84(result[0], result[1]);
            return new Cesium.Cartographic(Cesium.Math.toRadians(result[0]), Cesium.Math.toRadians(result[1]));
        };
        _this.resolutions = options.resolutions || [];
        return _this;
    }
    /**
     *
     * @param x
     * @param y
     * @param level
     * @param result
     * @returns {module:cesium.Rectangle|*}
     */
    // @ts-ignore
    BaiduMercatorTilingScheme.prototype.tileXYToNativeRectangle = function (x, y, level, result) {
        var tileWidth = this.resolutions[level];
        var west = x * tileWidth;
        var east = (x + 1) * tileWidth;
        var north = ((y = -y) + 1) * tileWidth;
        var south = y * tileWidth;
        if (!Cesium.defined(result)) {
            return new Cesium.Rectangle(west, south, east, north);
        }
        result.west = west;
        result.south = south;
        result.east = east;
        result.north = north;
        return result;
    };
    /**
     *
     * @param position
     * @param level
     * @param result
     * @returns {undefined|*}
     */
    // @ts-ignore
    BaiduMercatorTilingScheme.prototype.positionToTileXY = function (position, level, result) {
        var rectangle = this._rectangle;
        if (!Cesium.Rectangle.contains(rectangle, position)) {
            return undefined;
        }
        var projection = this._projection;
        var webMercatorPosition = projection.project(position);
        if (!Cesium.defined(webMercatorPosition)) {
            return undefined;
        }
        var tileWidth = this.resolutions[level];
        var xTileCoordinate = Math.floor(webMercatorPosition.x / tileWidth);
        var yTileCoordinate = -Math.floor(webMercatorPosition.y / tileWidth);
        if (!Cesium.defined(result)) {
            return new Cesium.Cartesian2(xTileCoordinate, yTileCoordinate);
        }
        result.x = xTileCoordinate;
        result.y = yTileCoordinate;
        return result;
    };
    return BaiduMercatorTilingScheme;
}(Cesium.WebMercatorTilingScheme));
export default BaiduMercatorTilingScheme;
