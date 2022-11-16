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
var MAP_URL = "https://t{s}.tianditu.gov.cn/DataServer?T={style}_w&x={x}&y={y}&l={z}&tk={key}";
var TdtImageryProvider = /** @class */ (function (_super) {
    __extends(TdtImageryProvider, _super);
    function TdtImageryProvider(options) {
        return _super.call(this, {
            url: MAP_URL.replace(/\{style\}/g, options.style || "vec").replace(/\{key\}/g, options.key || ""),
            subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 18
        }) || this;
    }
    return TdtImageryProvider;
}(Cesium.UrlTemplateImageryProvider));
export default TdtImageryProvider;
