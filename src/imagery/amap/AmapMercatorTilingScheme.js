import * as Cesium from "cesium";
import CoordTransform from "../../transform/CoordTransform";
/**
 * @class
 * @desc 高德地图瓦片坐标系
 * @extends Cesium.WebMercatorTilingScheme
 */
class AmapMercatorTilingScheme extends Cesium.WebMercatorTilingScheme {
    constructor(options) {
        super(options);
        this._projection = {};
        let projection = new Cesium.WebMercatorProjection();
        this._projection.project = function (cartographic, result = []) {
            result = CoordTransform.WGS84ToGCJ02(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude));
            result = projection.project(new Cesium.Cartographic(Cesium.Math.toRadians(result[0]), Cesium.Math.toRadians(result[1])));
            return new Cesium.Cartesian2(result.x, result.y);
        };
        this._projection.unproject = function (cartesian, result = []) {
            let cartographic = projection.unproject(cartesian);
            result = CoordTransform.GCJ02ToWGS84(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude));
            return new Cesium.Cartographic(Cesium.Math.toRadians(result[0]), Cesium.Math.toRadians(result[1]));
        };
    }
}
export default AmapMercatorTilingScheme;