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
var ELEC_URL = "http://mt{s}.google.cn/vt/lyrs=m@207000000&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=Galile";
var IMG_URL = "http://mt{s}.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali";
var TER_URL = "http://mt{s}.google.cn/vt/lyrs=t@131,r@227000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galile";
var GoogleImageryProvider = /** @class */ (function (_super) {
    __extends(GoogleImageryProvider, _super);
    function GoogleImageryProvider(options) {
        options["url"] =
            options.style === "img"
                ? IMG_URL
                : options.style === "ter"
                    ? TER_URL
                    : ELEC_URL;
        if (!options.subdomains || !options.subdomains.length) {
            options["subdomains"] = ["1", "2", "3"];
        }
        return _super.call(this, options) || this;
    }
    return GoogleImageryProvider;
}(Cesium.UrlTemplateImageryProvider));
export default GoogleImageryProvider;
