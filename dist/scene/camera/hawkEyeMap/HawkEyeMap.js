import * as Cesium from "cesium";
import "./hawkEyeMap.css";
// @ts-ignore
var Knockout = Cesium.knockout;
var HawkEyeMap = /** @class */ (function () {
    function HawkEyeMap(viewer) {
        this.viewModel = {
            enabled: false
        };
        this.viewer = viewer;
        this.hawkEyeMap = null;
        this.bindModel();
    }
    // 初始化函数
    HawkEyeMap.prototype.init = function () {
        this.eye = document.createElement("div");
        this.eye.id = "hawkEyeMap";
        this.eye.classList.add("hawkEye");
        document.body.appendChild(this.eye);
        this.hawkEyeMap = new Cesium.Viewer("hawkEyeMap", {
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            baseLayerPicker: false,
            navigationHelpButton: false,
            animation: false,
            timeline: false,
            fullscreenButton: false
        });
        this.hawkEyeMap.cesiumWidget.creditContainer.style.display = "none";
        this.hawkEyeMap.scene.backgroundColor = Cesium.Color.TRANSPARENT;
        this.hawkEyeMap.imageryLayers.removeAll();
        // 鹰眼图中添加高德路网中文注记图
        this.hawkEyeMap.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
            url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
            minimumLevel: 3,
            maximumLevel: 18
        }));
        // 引起事件监听的相机变化幅度
        this.viewer.camera.percentageChanged = 0.01;
        this.bindEvent();
    };
    // 绑定事件
    HawkEyeMap.prototype.bindEvent = function () {
        // 监听主图相机变化
        // this.viewer.camera.changed.addEventListener(this.syncMap, this);
        // 第一次刷新渲染时联动（否则第一次鹰眼地图不会联动）
        this.viewer.scene.preRender.addEventListener(this.syncMap, this);
    };
    HawkEyeMap.prototype.destroy = function () {
        var isRemoved1 = this.viewer.scene.preRender.removeEventListener(this.syncMap, this);
        if (isRemoved1) {
            this.hawkEyeMap.destroy();
            this.hawkEyeMap = null;
            this.viewModel.enabled = false;
            this.eye && document.body.removeChild(this.eye);
        }
        else {
            throw new Error("鹰眼地图销毁失败");
        }
    };
    // 同步主图与鹰眼地图
    HawkEyeMap.prototype.syncMap = function () {
        this.hawkEyeMap.camera.flyTo({
            destination: this.viewer.camera.position,
            orientation: {
                heading: this.viewer.camera.heading,
                pitch: this.viewer.camera.pitch,
                roll: this.viewer.camera.roll
            },
            duration: 0.0
        });
    };
    /**
     * 属性绑定
     */
    HawkEyeMap.prototype.bindModel = function () {
        var _this = this;
        Knockout.track(_this.viewModel);
        Knockout.getObservable(_this.viewModel, "enabled").subscribe(function (enabled) {
            if (enabled && _this.hawkEyeMap == null) {
                _this.init();
            }
            else {
                _this.eye && (_this.eye.style.display = enabled ? "block" : "none");
            }
        });
    };
    return HawkEyeMap;
}());
export default HawkEyeMap;
