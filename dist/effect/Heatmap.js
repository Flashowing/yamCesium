/**
 * 热力图
 */
import HeatMap from "heatmap-ts";
import * as Cesium from "cesium";
var Heatmap = /** @class */ (function () {
    function Heatmap(options) {
        this._viewer = options.viewer;
        var heatDoc = document.createElement("div");
        heatDoc.setAttribute("style", "width:1000px;height:1000px;margin: 0px;display: none;");
        document.body.appendChild(heatDoc);
        var config = {
            container: heatDoc,
            radius: Cesium.defaultValue(options.radius, 20),
            maxOpacity: Cesium.defaultValue(options.maxOpacity, .5),
            minOpacity: Cesium.defaultValue(options.minOpacity, 0),
            blur: Cesium.defaultValue(options.blur, .75)
        };
        this.heatmap = new HeatMap(config);
        this.render(options.max, options.data);
        this.createRectangle(this._viewer, options.rect);
        return this.heatmap;
    }
    Heatmap.prototype.render = function (max, data) {
        this.heatmap.setData({
            max: max,
            data: data
        });
    };
    Heatmap.prototype.createRectangle = function (viewer, rect) {
        this.heatmap = viewer.entities.add({
            name: "Rotating rectangle with rotating texture coordinate",
            show: true,
            rectangle: {
                coordinates: rect,
                material: this.heatmap.renderer.canvas // 核心语句，填充热力图
            }
        });
    };
    /**
     * 构建一些随机数据点
     * @param len 数据点个数
     */
    Heatmap.randomData = function (len) {
        var points = [];
        var max = 0;
        var width = 1000;
        var height = 1000;
        while (len--) {
            var val = Math.floor(Math.random() * 1000);
            max = Math.max(max, val);
            var point = {
                x: Math.floor(Math.random() * width),
                y: Math.floor(Math.random() * height),
                value: val
            };
            points.push(point);
        }
        return { max: max, data: points };
    };
    return Heatmap;
}());
export default Heatmap;
