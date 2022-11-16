// @ts-ignore
// const turf = window.turf;
import * as turf from "@turf/turf";
import * as Cesium from "cesium";
var CesiumMethod = /** @class */ (function () {
    function CesiumMethod(viewer) {
        this.viewer = viewer;
    }
    /**
     * 笛卡尔转经纬度
     * @param {Cartesian3} cartesian
     * @param withHeight
     * @return {Array<Number>}
     */
    CesiumMethod.cartesian3ToLngLat = function (cartesian, withHeight) {
        if (withHeight === void 0) { withHeight = false; }
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        var lon = Cesium.Math.toDegrees(cartographic.longitude);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var height = cartographic.height;
        if (withHeight) {
            return [lon, lat, height];
        }
        else {
            return [lon, lat];
        }
    };
    /**
     * 笛卡尔转经纬度
     * @param {Cartesian3} cartesian
     * @param withHeight
     * @return {Array<Number>}
     */
    CesiumMethod.cartesian2ToLngLat = function (cartesian, withHeight) {
        if (withHeight === void 0) { withHeight = false; }
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        var lon = Cesium.Math.toDegrees(cartographic.longitude);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var height = cartographic.height;
        if (withHeight) {
            return [lon, lat, height];
        }
        else {
            return [lon, lat];
        }
    };
    /**
     * 笛卡尔转经纬度
     * @param cartesian3s
     * @param withHeight
     * @return {Array<Array<number>>}
     */
    CesiumMethod.cartesian3sToLngLats = function (cartesian3s, withHeight) {
        if (withHeight === void 0) { withHeight = false; }
        var coordinates = [];
        for (var i = 0, len = cartesian3s.length; i < len; i++) {
            coordinates.push(this.cartesian3ToLngLat(cartesian3s[i], withHeight));
        }
        return coordinates;
    };
    /**
     * 根据笛卡尔解析绝对中心坐标点
     * @param {Array<Cartesian3>} cartesian3s
     * @return {Feature<Point, Properties>}
     */
    CesiumMethod.calcAbsoluteCenterByCartesian3s = function (cartesian3s) {
        var turfPoints = [];
        for (var i = 0, len = cartesian3s.length; i < len; i++) {
            turfPoints.push(turf.point(this.cartesian3ToLngLat(cartesian3s[i])));
        }
        return turf.center(turf.featureCollection(turfPoints));
    };
    /**
     * 根据笛卡尔解析绝对中心坐标点
     * @param {Array<Cartesian3>} cartesian3s
     * @return {{coord: coord, cart: Cartesian3}}
     */
    CesiumMethod.countPolygonCenter = function (cartesian3s) {
        var tempPos = [];
        for (var i = 0, len = cartesian3s.length; i < len; i++) {
            tempPos.push(turf.point(this.cartesian3ToLngLat(cartesian3s[i])));
        }
        var center = turf.center(turf.featureCollection(tempPos));
        var coord = center.geometry.coordinates;
        var cartesian = Cesium.Cartesian3.fromDegrees(coord[0], coord[1]);
        return {
            coord: coord,
            cart: cartesian
        };
    };
    /**
     * 计算多边形面积
     * @param {Array<Array>} coords 一个包含经纬度坐标的二维数组
     * @return {number}
     */
    CesiumMethod.calcPolygonArea = function (coords) {
        var polygon = turf.polygon([coords]);
        return turf.area(polygon);
    };
    /**
     * 获取地形高度
     * @param positions
     * @param callback
     */
    CesiumMethod.prototype.getTerrainHeight = function (positions, callback) {
        var terrain = this.viewer.scene.terrainProvider;
        var promise = Cesium.sampleTerrainMostDetailed(terrain, positions);
        // @ts-ignore
        // Cesium.when(promise, function(updatedPositions: Cesium.Cartesian3) {
        //   callback(updatedPositions);
        // }).otherwise(function(error: any) {
        //   console.log(error);
        // });
    };
    /**
     * 获取camera高度
     */
    CesiumMethod.prototype.getCameraHeight = function () {
        if (this.viewer) {
            var scene = this.viewer.scene;
            var ellipsoid = scene.globe.ellipsoid;
            return ellipsoid.cartesianToCartographic(this.viewer.camera.position).height;
        }
        return null;
    };
    /**
     * 获取camera中心点坐标
     * @returns {{lon: number, lat: number, height: number}}
     */
    CesiumMethod.prototype.getCenterPosition = function () {
        var result = this.viewer.camera.pickEllipsoid(new Cesium.Cartesian2(this.viewer.canvas.clientWidth / 2, this.viewer.canvas
            .clientHeight / 2));
        var curPosition;
        if (!result) {
            return {};
        }
        curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(result);
        var lon = curPosition.longitude * 180 / Math.PI;
        var lat = curPosition.latitude * 180 / Math.PI;
        var height = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(this.viewer.camera.position).height;
        return {
            lon: lon,
            lat: lat,
            height: height
        };
    };
    /**
     * 笛卡尔添加高度
     */
    CesiumMethod.addHeightWithCartesian3 = function (cartesian, height) {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height + height);
    };
    /**
     * 根据两个笛卡尔坐标获取之间的距离
     * @param cartesian1
     * @param cartesian2
     */
    CesiumMethod.measureDistanceWithCartesian3 = function (cartesian1, cartesian2) {
        return Cesium.Cartesian3.distance(cartesian1, cartesian2);
    };
    CesiumMethod._computeCirclePolygon = function (positions) {
        var _this = this;
        try {
            if (!positions || positions.length < 2) {
                return null;
            }
            var cp = positions[0];
            var r = _this._computeCircleRadius3D(positions);
            return _this._computeCirclePolygon2(cp, r);
        }
        catch (err) {
            return null;
        }
    };
    CesiumMethod._computeCirclePolygon2 = function (center, radius) {
        try {
            if (!center || radius <= 0) {
                return null;
            }
            // @ts-ignore
            var cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions({
                center: center,
                semiMajorAxis: radius,
                semiMinorAxis: radius,
                rotation: 0,
                granularity: 0.005
            }, false, true);
            if (!cep || !cep.outerPositions) {
                return null;
            }
            var pnts = Cesium.Cartesian3.unpackArray(cep.outerPositions);
            pnts[pnts.length] = pnts[0];
            return pnts;
        }
        catch (err) {
            return null;
        }
    };
    CesiumMethod._computeCircleRadius3D = function (positions) {
        var c1 = positions[0];
        var c2 = positions[1];
        var x = Math.pow(c1.x - c2.x, 2);
        var y = Math.pow(c1.y - c2.y, 2);
        var z = Math.pow(c1.z - c2.z, 2);
        return Math.sqrt(x + y + z);
    };
    return CesiumMethod;
}());
export default CesiumMethod;
