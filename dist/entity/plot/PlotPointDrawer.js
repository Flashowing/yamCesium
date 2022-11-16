import PlotToolTip from "./PlotToolTip";
import * as Cesium from "cesium";
import layer from "../../plugins/lib/layer/Layer";
var PlotPointDrawer = /** @class */ (function () {
    function PlotPointDrawer(viewer) {
        this.image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABjUlEQVQ4T5WTO0gDQRCG598TUohgLqUIChcSEBsfjQ9MEWvtFDs7E+0tUllaa5JSECzstLdI46NQGxESc2JELBMLCxEuO86dXkhiAndX7c3O/PvPzregHl+sWBlpOioOQyXdbW7qsjGgq/VM4r07Hd0Bs2gfMfMkgT6hKcKAI0nfTBwF8NDIWJvtNR0CZsF+kcSaBFO9nEnskQiDjaw17u+3BKKF6q38TPcp7Agz0d1HNj7jBj2BWNHeF9sLspwLIiA5p9LOaz1j7cLM26Ni+wygqYDFXhoz3YOwCvPwaRkKObG1FEZAzF+S1nuI5e0dDV6XXubDCdANGCeIFp63xNAGiBdDCTBdM9Qxhg+qKWUgJyLpMAIMKrFD0oJQp1mdBx2hf4g7SgW94o3RpU+udVaWE0FcSHFJxlhzqWyB5FIobYwFEZAJ1HwaO1D+o9EWkbU+QldyesSnsEVie7JLpdacFotf4siQgqYicjTTkFK4cOlrz//3Gr07ETqJdRJQiV/qdIWgyo1t663b2Q/kAI6uzOBy0gAAAABJRU5ErkJggg==";
        this.layerId = "globeEntityDrawerLayer";
        this.isClickConfirm = false;
        this.viewer = viewer;
        this.scene = viewer.scene;
        this.clock = viewer.clock;
        this.canvas = viewer.scene.canvas;
        this.camera = viewer.scene.camera;
        this.ellipsoid = viewer.scene.globe.ellipsoid;
        this.tooltip = new PlotToolTip(viewer.container);
    }
    PlotPointDrawer.prototype.clear = function () {
        if (this.drawHandler) {
            this.drawHandler.destroy();
            this.drawHandler = null;
        }
        if (this.modifyHandler) {
            this.modifyHandler.destroy();
            this.modifyHandler = null;
        }
        if (this.toolBarIndex != null) {
            // layer.close(this.toolBarIndex);
        }
        this.entity = null;
        this._clearMarkers(this.layerId);
        this.tooltip.setVisible(false);
    };
    PlotPointDrawer.prototype.showModifyPoint = function (options) {
        // this.position = position;
        // this.okHandler = okHandler;
        // this.cancelHandler = cancelHandler;
        this.isClickConfirm = false;
        this.entity = null;
        // this._createPoint();
        // this._startModify();
        return this.startDrawPoint(options);
    };
    PlotPointDrawer.prototype.startDrawPoint = function (options) {
        var _this = this;
        // this.okHandler = okHandler;
        // this.cancelHandler = cancelHandler;
        this.entity = null;
        this.position = options.position; // 如果有传入position，则直接使用，没有传入则为undefined
        var floatingPoint = null;
        this.drawHandler = new Cesium.ScreenSpaceEventHandler(this.canvas);
        this.drawHandler.setInputAction(function (event) {
            var wp = event.position;
            if (!Cesium.defined(wp)) {
                return;
            }
            var ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            _this.position = cartesian;
            _this.entity.position.setValue(cartesian);
            _this.tooltip.setVisible(false);
            _this._startModify();
            _this.isClickConfirm = true;
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.drawHandler.setInputAction(function (event) {
            var wp = event.endPosition;
            if (!Cesium.defined(wp)) {
                return;
            }
            _this.tooltip.showAt(wp, "<p>选择位置</p>");
            var ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            _this.position = cartesian;
            if (_this.entity == null) {
                _this._createPoint();
            }
            else {
                _this.entity.position.setValue(cartesian);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        return new Promise(function (resolve, reject) {
            // 等待点击确认点位
            var timeId = setInterval(function () {
                // 如果确认点位则清楚定时器
                if (_this.isClickConfirm) {
                    _this.isClickConfirm = false;
                    clearInterval(timeId);
                    // 如果自定义了确认按钮则显示自定义按钮
                    if (options && options.confirmHandler) {
                        // confirmHandler需返回一个promise事件
                        options.confirmHandler().then(function () {
                            _this.clear();
                            resolve(_this.position);
                        }).catch(function () {
                            _this.clear();
                            reject();
                        });
                    }
                    else {
                        _this._showToolBar().then(function () {
                            _this.clear();
                            resolve(_this.position);
                        }).catch(function (err) {
                            _this.clear();
                            reject(err);
                        });
                    }
                }
            }, 100);
        });
    };
    PlotPointDrawer.prototype._startModify = function () {
        var _this = this;
        var isMoving = false;
        var pickedAnchor = null;
        if (this.drawHandler) {
            this.drawHandler.destroy();
            this.drawHandler = null;
        }
        // this._showToolBar();
        this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.canvas);
        this.modifyHandler.setInputAction(function (event) {
            var wp = event.position;
            if (!Cesium.defined(wp)) {
                return;
            }
            var ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (isMoving) {
                isMoving = false;
                pickedAnchor.position.setValue(cartesian);
                var oid = pickedAnchor.oid;
                _this.position = cartesian;
                _this.tooltip.setVisible(false);
            }
            else {
                var pickedObject = _this.scene.pick(wp);
                if (!Cesium.defined(pickedObject)) {
                    return;
                }
                if (!Cesium.defined(pickedObject.id)) {
                    return;
                }
                var entity = pickedObject.id;
                if (entity.layerId != _this.layerId || entity.flag != "anchor") {
                    return;
                }
                pickedAnchor = entity;
                isMoving = true;
                _this.tooltip.showAt(wp, "<p>移动位置</p>");
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.modifyHandler.setInputAction(function (event) {
            if (!isMoving) {
                return;
            }
            var wp = event.endPosition;
            if (!Cesium.defined(wp)) {
                return;
            }
            _this.tooltip.showAt(wp, "<p>移动位置</p>");
            var ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            pickedAnchor.position.setValue(cartesian);
            var oid = pickedAnchor.oid;
            _this.position = cartesian;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };
    PlotPointDrawer.prototype._createPoint = function () {
        var point = this.viewer.entities.add({
            position: this.position,
            billboard: {
                image: this.image,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                clampToGround: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
            }
        });
        point.oid = 0;
        point.layerId = this.layerId;
        point.flag = "anchor";
        this.entity = point;
        return point;
    };
    PlotPointDrawer.prototype._showToolBar = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            layer.confirm({
                title: false,
                content: "是否确认该点位？",
                type: 1,
                area: ["300px", "200px"],
                offset: "80px",
                skin: "yam-layer-title-lan",
                shade: false,
                shadeClose: false,
                move: true
            }).then(function (index) {
                _this.clear();
                layer.close(index);
                resolve();
            }).catch(function (index) {
                _this.clear();
                layer.close(index);
                reject();
            });
        });
    };
    PlotPointDrawer.prototype._getLonLat = function (cartesian) {
        var cartographic = this.ellipsoid.cartesianToCartographic(cartesian);
        cartographic.height = this.viewer.scene.globe.getHeight(cartographic);
        var pos = {
            lon: cartographic.longitude,
            lat: cartographic.latitude,
            alt: cartographic.height,
            height: cartographic.height
        };
        pos.lon = Cesium.Math.toDegrees(pos.lon);
        pos.lat = Cesium.Math.toDegrees(pos.lat);
        return pos;
    };
    PlotPointDrawer.prototype._clearMarkers = function (layerName) {
        var entityList = this.viewer.entities.values;
        if (entityList == null || entityList.length < 1)
            return;
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId == layerName) {
                this.viewer.entities.remove(entity);
                i--;
            }
        }
    };
    return PlotPointDrawer;
}());
export default PlotPointDrawer;
