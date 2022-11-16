/**
 * @class CoordTransform
 */
var BD_FACTOR = (3.14159265358979324 * 3000.0) / 180.0;
var PI = 3.1415926535897932384626;
var RADIUS = 6378245.0;
var EE = 0.00669342162296594323;
var CoordTransform = /** @class */ (function () {
    function CoordTransform() {
    }
    /**
     * BD-09 To GCJ-02
     * @param lng
     * @param lat
     * @returns {number[]}
     */
    CoordTransform.BD09ToGCJ02 = function (lng, lat) {
        var x = +lng - 0.0065;
        var y = +lat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * BD_FACTOR);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * BD_FACTOR);
        var gg_lng = z * Math.cos(theta);
        var gg_lat = z * Math.sin(theta);
        return [gg_lng, gg_lat];
    };
    /**
     * GCJ-02 To BD-09
     * @param lng
     * @param lat
     * @returns {number[]}
     */
    CoordTransform.GCJ02ToBD09 = function (lng, lat) {
        lat = +lat;
        lng = +lng;
        var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * BD_FACTOR);
        var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * BD_FACTOR);
        var bd_lng = z * Math.cos(theta) + 0.0065;
        var bd_lat = z * Math.sin(theta) + 0.006;
        return [bd_lng, bd_lat];
    };
    /**
     * WGS-84 To GCJ-02
     * @param lng
     * @param lat
     * @returns {number[]}
     */
    CoordTransform.WGS84ToGCJ02 = function (lng, lat) {
        lat = +lat;
        lng = +lng;
        if (this.out_of_china(lng, lat)) {
            return [lng, lat];
        }
        else {
            var d = this.delta(lng, lat);
            return [lng + d[0], lat + d[1]];
        }
    };
    /**
     * GCJ-02 To WGS-84
     * @param lng
     * @param lat
     * @returns {number[]}
     */
    CoordTransform.GCJ02ToWGS84 = function (lng, lat) {
        lat = +lat;
        lng = +lng;
        if (this.out_of_china(lng, lat)) {
            return [lng, lat];
        }
        else {
            var d = this.delta(lng, lat);
            var mgLng = lng + d[0];
            var mgLat = lat + d[1];
            return [lng * 2 - mgLng, lat * 2 - mgLat];
        }
    };
    /**
     *x
     * @param lng
     * @param lat
     * @returns {number[]}
     */
    CoordTransform.delta = function (lng, lat) {
        var dLng = this.transformLng(lng - 105, lat - 35);
        var dLat = this.transformLat(lng - 105, lat - 35);
        var radLat = (lat / 180) * PI;
        var magic = Math.sin(radLat);
        magic = 1 - EE * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLng = (dLng * 180) / ((RADIUS / sqrtMagic) * Math.cos(radLat) * PI);
        dLat = (dLat * 180) / (((RADIUS * (1 - EE)) / (magic * sqrtMagic)) * PI);
        return [dLng, dLat];
    };
    /**
     *
     * @param lng
     * @param lat
     * @returns {number}
     */
    CoordTransform.transformLng = function (lng, lat) {
        lat = +lat;
        lng = +lng;
        var ret = 300.0 +
            lng +
            2.0 * lat +
            0.1 * lng * lng +
            0.1 * lng * lat +
            0.1 * Math.sqrt(Math.abs(lng));
        ret +=
            ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) *
                2.0) /
                3.0;
        ret +=
            ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) /
                3.0;
        ret +=
            ((150.0 * Math.sin((lng / 12.0) * PI) +
                300.0 * Math.sin((lng / 30.0) * PI)) *
                2.0) /
                3.0;
        return ret;
    };
    /**
     *
     * @param lng
     * @param lat
     * @returns {number}
     */
    CoordTransform.transformLat = function (lng, lat) {
        lat = +lat;
        lng = +lng;
        var ret = -100.0 +
            2.0 * lng +
            3.0 * lat +
            0.2 * lat * lat +
            0.1 * lng * lat +
            0.2 * Math.sqrt(Math.abs(lng));
        ret +=
            ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) *
                2.0) /
                3.0;
        ret +=
            ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) /
                3.0;
        ret +=
            ((160.0 * Math.sin((lat / 12.0) * PI) +
                320 * Math.sin((lat * PI) / 30.0)) *
                2.0) /
                3.0;
        return ret;
    };
    /**
     *
     * @param lng
     * @param lat
     * @returns {boolean}
     */
    CoordTransform.out_of_china = function (lng, lat) {
        lat = +lat;
        lng = +lng;
        return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
    };
    return CoordTransform;
}());
export default CoordTransform;
