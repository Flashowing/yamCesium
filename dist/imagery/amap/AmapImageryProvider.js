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
import AmapMercatorTilingScheme from "./AmapMercatorTilingScheme";
var IMG_URL = "https://webst{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}";
var ELEC_URL = "https://webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}";
var CVA_URL = "https://webst{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}";
/**
 * @class
 * @desc 高德地图图层
 * @extends Cesium.UrlTemplateImageryProvider
 */
var AmapImageryProvider = /** @class */ (function (_super) {
    __extends(AmapImageryProvider, _super);
    function AmapImageryProvider(options) {
        options["url"] =
            options["url"]
                ? options["url"]
                : options.style === "img"
                    ? IMG_URL
                    : options.style === "cva"
                        ? CVA_URL
                        : ELEC_URL;
        if (!options.subdomains || !options.subdomains.length) {
            options["subdomains"] = ["01", "02", "03", "04"];
        }
        if (options.crs === "WGS84") {
            options["tilingScheme"] = new AmapMercatorTilingScheme();
        }
        return _super.call(this, options) || this;
    }
    return AmapImageryProvider;
}(Cesium.UrlTemplateImageryProvider));
export default AmapImageryProvider;
