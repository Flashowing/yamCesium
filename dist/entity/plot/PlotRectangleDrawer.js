import PlotToolTip from "./PlotToolTip";
import * as Cesium from "cesium";
import layer from "../../plugins/lib/layer/Layer";
var PlotRectangleDrawer = /** @class */ (function () {
    function PlotRectangleDrawer(viewer) {
        this.positions = [];
        this.dragIconLight = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABjUlEQVQ4T5WTO0gDQRCG598TUohgLqUIChcSEBsfjQ9MEWvtFDs7E+0tUllaa5JSECzstLdI46NQGxESc2JELBMLCxEuO86dXkhiAndX7c3O/PvPzregHl+sWBlpOioOQyXdbW7qsjGgq/VM4r07Hd0Bs2gfMfMkgT6hKcKAI0nfTBwF8NDIWJvtNR0CZsF+kcSaBFO9nEnskQiDjaw17u+3BKKF6q38TPcp7Agz0d1HNj7jBj2BWNHeF9sLspwLIiA5p9LOaz1j7cLM26Ni+wygqYDFXhoz3YOwCvPwaRkKObG1FEZAzF+S1nuI5e0dDV6XXubDCdANGCeIFp63xNAGiBdDCTBdM9Qxhg+qKWUgJyLpMAIMKrFD0oJQp1mdBx2hf4g7SgW94o3RpU+udVaWE0FcSHFJxlhzqWyB5FIobYwFEZAJ1HwaO1D+o9EWkbU+QldyesSnsEVie7JLpdacFotf4siQgqYicjTTkFK4cOlrz//3Gr07ETqJdRJQiV/qdIWgyo1t663b2Q/kAI6uzOBy0gAAAABJRU5ErkJggg==";
        this.fill = true;
        this.outline = true;
        this.outlineWidth = 2;
        this.extrudedHeight = 0;
        this.layerId = "globeEntityDrawerLayer";
        this.params = {}; // 封装需要传递的参数
        this.ground = true; // 图形是否贴地
        this.isClickConfirm = false;
        var _this = this;
        _this.viewer = viewer;
        _this.scene = viewer.scene;
        _this.clock = viewer.clock;
        _this.canvas = viewer.scene.canvas;
        _this.camera = viewer.scene.camera;
        _this.ellipsoid = viewer.scene.globe.ellipsoid;
        _this.tooltip = new PlotToolTip(viewer.container);
    }
    PlotRectangleDrawer.prototype.clear = function () {
        var _this = this;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        if (_this.modifyHandler) {
            _this.modifyHandler.destroy();
            _this.modifyHandler = null;
        }
        if (_this.toolBarIndex != null) {
            // layer.close(_this.toolBarIndex, function () {
            //     $("#shapeEditContainer").remove();
            // });
        }
        _this._clearMarkers(_this.layerId);
        _this.tooltip.setVisible(false);
        // $("#shapeEditContainer").hide();
    };
    PlotRectangleDrawer.prototype.clear2 = function () {
        var _this = this;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        if (_this.modifyHandler) {
            _this.modifyHandler.destroy();
            _this.modifyHandler = null;
        }
        _this._clearMarkers(_this.layerId);
        _this.tooltip.setVisible(false);
        _this.viewer.entities.remove(_this.entity);
    };
    PlotRectangleDrawer.prototype.showModifyRectangle = function (options) {
        var _this_1 = this;
        var _this = this;
        _this.positions = options.positions;
        // _this.okHandler = okHandler;
        // _this.cancelHandler = cancelHandler;
        _this._showModifyRegion2Map();
        _this._startModify();
        return new Promise(function (resolve, reject) {
            if (options && options.confirmHandler) {
                // confirmHandler需返回一个promise事件
                options.confirmHandler().then(function () {
                    resolve(_this_1.positions);
                    _this_1.clear();
                    _this_1.viewer.entities.remove(_this_1.entity);
                }).catch(function () {
                    _this_1.clear();
                    reject();
                });
            }
            else {
                _this_1.createToolBar().then(function () {
                    resolve(_this_1.positions);
                    _this_1.clear();
                    _this_1.viewer.entities.remove(_this_1.entity);
                }).catch(function () {
                    _this_1.clear();
                    reject();
                });
            }
        });
    };
    PlotRectangleDrawer.prototype.startDrawRectangle = function (options) {
        var _this_1 = this;
        var _this = this;
        // _this.okHandler = okHandler;
        // _this.cancelHandler = cancelHandler;
        _this.positions = [];
        var floatingPoint = null;
        // let definedColor = $("#paigusu").data("color2");
        // if (definedColor) {
        _this.shapeColor = "rgba(67,106,190,0.5)"; // 设置自定义的绘图颜色
        // }
        _this.drawHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);
        _this.drawHandler.setInputAction(function (event) {
            var position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            var num = _this.positions.length;
            if (num == 0) {
                _this.positions.push(cartesian);
                floatingPoint = _this._createPoint(cartesian, -1);
                _this._showRegion2Map();
            }
            _this.positions.push(cartesian);
            var oid = _this.positions.length - 2;
            _this._createPoint(cartesian, oid);
            if (num > 1) {
                _this_1.isClickConfirm = true;
                _this.positions.pop();
                _this.viewer.entities.remove(floatingPoint);
                _this.tooltip.setVisible(false);
                _this._startModify();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        _this.drawHandler.setInputAction(function (event) {
            var position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            if (_this.positions.length < 1) {
                _this.tooltip.showAt(position, "<p>选择起点</p>");
                return;
            }
            _this.tooltip.showAt(position, "<p>选择终点</p>");
            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            floatingPoint.position.setValue(cartesian);
            _this.positions.pop();
            _this.positions.push(cartesian);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        return new Promise(function (resolve, reject) {
            // 等待点击确认点位
            var timeId = setInterval(function () {
                // 如果确认点位则清楚定时器
                if (_this_1.isClickConfirm) {
                    _this_1.isClickConfirm = false;
                    clearInterval(timeId);
                    // 如果自定义了确认按钮则显示自定义按钮
                    if (options && options.confirmHandler) {
                        // confirmHandler需返回一个promise事件
                        options.confirmHandler().then(function () {
                            resolve(_this_1.positions);
                            _this_1.clear();
                            _this_1.viewer.entities.remove(_this_1.entity);
                        }).catch(function () {
                            _this_1.clear();
                            reject();
                        });
                    }
                    else {
                        _this_1.createToolBar().then(function () {
                            resolve(_this_1.positions);
                            _this_1.clear();
                            _this_1.viewer.entities.remove(_this_1.entity);
                        }).catch(function () {
                            _this_1.clear();
                            reject();
                        });
                    }
                }
            }, 100);
        });
    };
    PlotRectangleDrawer.prototype._startModify = function () {
        var _this = this;
        var isMoving = false;
        var pickedAnchor = null;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        // _this._showToolBar();
        _this.modifyHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);
        _this.modifyHandler.setInputAction(function (event) {
            var position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            var ray = _this.camera.getPickRay(position);
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
                _this.positions[oid] = cartesian;
                _this.tooltip.setVisible(false);
            }
            else {
                var pickedObject = _this.scene.pick(position);
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
                _this.tooltip.showAt(position, "<p>移动控制点</p>");
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        _this.modifyHandler.setInputAction(function (event) {
            if (!isMoving) {
                return;
            }
            var position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            _this.tooltip.showAt(position, "<p>移动控制点</p>");
            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            pickedAnchor.position.setValue(cartesian);
            var oid = pickedAnchor.oid;
            _this.positions[oid] = cartesian;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };
    PlotRectangleDrawer.prototype._createPoint = function (cartesian, oid) {
        var _this = this;
        var point = this.viewer.entities.add({
            position: cartesian,
            billboard: {
                image: _this.dragIconLight,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        point.oid = oid;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        return point;
    };
    PlotRectangleDrawer.prototype._showRegion2Map = function () {
        var _this = this;
        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)");
        // }
        // if (_this.outlineMaterial == null) {
        _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
        });
        // }
        var dynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                return rect;
            }
            else {
                return null;
            }
        }, false);
        var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north];
                var positions = Cesium.Cartesian3.fromRadiansArray(arr);
                return positions;
            }
            else {
                return null;
            }
        }, false);
        var bData = {
            rectangle: {
                coordinates: dynamicPositions,
                material: _this.material,
                show: _this.fill
            },
            polyline: {
                positions: outlineDynamicPositions,
                clampToGround: true,
                width: _this.outlineWidth,
                material: _this.outlineMaterial,
                show: _this.outline
            }
        };
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
    };
    PlotRectangleDrawer.prototype._showModifyRegion2Map = function () {
        var _this = this;
        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)");
        // }
        // if (_this.outlineMaterial == null) {
        _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
        });
        // }
        var dynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                return rect;
            }
            else {
                return null;
            }
        }, false);
        var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north];
                var positions_1 = Cesium.Cartesian3.fromRadiansArray(arr);
                return positions_1;
            }
            else {
                return null;
            }
        }, false);
        var bData = {
            rectangle: {
                coordinates: dynamicPositions,
                material: _this.material,
                show: _this.fill
            },
            polyline: {
                positions: outlineDynamicPositions,
                clampToGround: true,
                width: _this.outlineWidth,
                material: _this.outlineMaterial,
                show: _this.outline
            }
        };
        if (!_this.ground) {
            // bData.rectangle.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            // bData.rectangle.height = 1000;
            // bData.rectangle.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
        var positions = _this.positions;
        for (var i = 0; i < positions.length; i++) {
            _this._createPoint(positions[i], i);
        }
    };
    PlotRectangleDrawer.prototype._computeRectangle = function (p1, p2) {
        var _this = this;
        var c1 = _this.ellipsoid.cartesianToCartographic(p1);
        var c2 = _this.ellipsoid.cartesianToCartographic(p2);
        var rect = Cesium.Rectangle.fromCartesianArray([p1, p2]);
        return rect;
    };
    PlotRectangleDrawer.prototype.createToolBar = function () {
        return new Promise(function (resolve, reject) {
            layer.confirm({
                title: false,
                content: "是否完成绘制？",
                type: 1,
                area: ["300px", "200px"],
                offset: "80px",
                skin: "yam-layer-title-lan",
                shade: false,
                shadeClose: false,
                move: true
            }).then(function (index) {
                // this.clear();
                layer.close(index);
                resolve();
            }).catch(function (index) {
                // this.clear();
                layer.close(index);
                reject();
            });
        });
    };
    PlotRectangleDrawer.prototype._isSimpleXYZ = function (p1, p2) {
        return p1.x == p2.x && p1.y == p2.y && p1.z == p2.z;
    };
    PlotRectangleDrawer.prototype._clearMarkers = function (layerName) {
        var _this = this;
        var viewer = _this.viewer;
        var entityList = viewer.entities.values;
        if (entityList == null || entityList.length < 1)
            return;
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId == layerName) {
                viewer.entities.remove(entity);
                i--;
            }
        }
    };
    return PlotRectangleDrawer;
}());
export default PlotRectangleDrawer;
