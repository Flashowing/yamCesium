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
import CoordTransform from "../../transform/CoordTransform";
/**
 * @class
 * @desc 高德地图瓦片坐标系
 * @extends Cesium.WebMercatorTilingScheme
 */
var AmapMercatorTilingScheme = /** @class */ (function (_super) {
    __extends(AmapMercatorTilingScheme, _super);
    function AmapMercatorTilingScheme(options) {
        var _this = _super.call(this, options) || this;
        _this._projection = {};
        var projection = new Cesium.WebMercatorProjection();
        _this._projection.project = function (cartographic, result) {
            if (result === void 0) { result = []; }
            result = CoordTransform.WGS84ToGCJ02(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude));
            result = projection.project(new Cesium.Cartographic(Cesium.Math.toRadians(result[0]), Cesium.Math.toRadians(result[1])));
            return new Cesium.Cartesian2(result.x, result.y);
        };
        _this._projection.unproject = function (cartesian, result) {
            if (result === void 0) { result = []; }
            var cartographic = projection.unproject(cartesian);
            result = CoordTransform.GCJ02ToWGS84(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude));
            return new Cesium.Cartographic(Cesium.Math.toRadians(result[0]), Cesium.Math.toRadians(result[1]));
        };
        return _this;
    }
    return AmapMercatorTilingScheme;
}(Cesium.WebMercatorTilingScheme));
export default AmapMercatorTilingScheme;
