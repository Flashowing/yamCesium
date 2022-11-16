/**
 * 效果
 */
import CircleSpread from "./CircleSpread";
import RadarScan from "./RadarScan";
import HeatMap from "./Heatmap";
var Effect = /** @class */ (function () {
    function Effect() {
        /**
         * 圆扩散
         */
        this.circleSpread = CircleSpread;
        /**
         * 雷达扫描
         */
        this.radarScan = RadarScan;
        /**
         * 热力图
         */
        this.heatMap = HeatMap;
    }
    return Effect;
}());
export default new Effect();
