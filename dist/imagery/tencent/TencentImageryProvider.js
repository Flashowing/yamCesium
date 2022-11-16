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
var IMG_URL = "https://p{s}.map.gtimg.com/sateTiles/{z}/{sx}/{sy}/{x}_{reverseY}.jpg?version=400";
var ELEC_URL = "https://rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid={style}&scene=0&version=347";
var TencentImageryProvider = /** @class */ (function (_super) {
    __extends(TencentImageryProvider, _super);
    function TencentImageryProvider(options) {
        var url = options.style === "img" ? IMG_URL : ELEC_URL;
        options["url"] = url.replace("{style}", options.style || "1");
        if (!options.subdomains || !options.subdomains.length) {
            options["subdomains"] = ["0", "1", "2"];
        }
        if (options.style === "img") {
            options["customTags"] = {
                sx: function (imageryProvider, x, y, level) {
                    return x >> 4;
                },
                sy: function (imageryProvider, x, y, level) {
                    return ((1 << level) - y) >> 4;
                }
            };
        }
        return _super.call(this, options) || this;
    }
    return TencentImageryProvider;
}(Cesium.UrlTemplateImageryProvider));
export default TencentImageryProvider;
