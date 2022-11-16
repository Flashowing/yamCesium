import PlotToolTip from "./PlotToolTip";
import * as Cesium from "cesium";
import { xp } from "./algorithm";
import layer from "../../plugins/lib/layer/Layer";
var PlotAttackArrowDrawer = /** @class */ (function () {
    function PlotAttackArrowDrawer(viewer) {
        this.positions = [];
        this.tempPositions = [];
        this.dragIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAA+0lEQVQoU2NkQALX5VjTGBkYXYBCllDh40B6k8ajX0tgyhhhjBtybKuAHAUGhv9T/zExHwSJM/37a8/AwJj9n4HhAVBTGEgMrAGq+Kr6o1+NN2TY9BgZ/9v8Z2L4wfiP4bL649+nb8qx1QM1+QI1mTBCnZEA5FhBJRqQnQk0sQFskBzbpv8M/7cwAhmLGP7/Pw6UOPOfkfEUsmI4+x+DPgPjf2sGRkZLkIb7LP8YXf8w/7Nj+M84F5sGxv//s5n/M+36w/R/N1kaSHMS1NM+QE/7EfD0MaCnF8CC9QyQsZlAsGqD4oK8iEOK7Rgg2w85aQCdsUfz0e9ZMDUAG9CXv0chMrwAAAAASUVORK5CYII=";
        this.dragIconLight = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABjUlEQVQ4T5WTO0gDQRCG598TUohgLqUIChcSEBsfjQ9MEWvtFDs7E+0tUllaa5JSECzstLdI46NQGxESc2JELBMLCxEuO86dXkhiAndX7c3O/PvPzregHl+sWBlpOioOQyXdbW7qsjGgq/VM4r07Hd0Bs2gfMfMkgT6hKcKAI0nfTBwF8NDIWJvtNR0CZsF+kcSaBFO9nEnskQiDjaw17u+3BKKF6q38TPcp7Agz0d1HNj7jBj2BWNHeF9sLspwLIiA5p9LOaz1j7cLM26Ni+wygqYDFXhoz3YOwCvPwaRkKObG1FEZAzF+S1nuI5e0dDV6XXubDCdANGCeIFp63xNAGiBdDCTBdM9Qxhg+qKWUgJyLpMAIMKrFD0oJQp1mdBx2hf4g7SgW94o3RpU+udVaWE0FcSHFJxlhzqWyB5FIobYwFEZAJ1HwaO1D+o9EWkbU+QldyesSnsEVie7JLpdacFotf4siQgqYicjTTkFK4cOlrz//3Gr07ETqJdRJQiV/qdIWgyo1t663b2Q/kAI6uzOBy0gAAAABJRU5ErkJggg==";
        this.fill = true;
        this.outline = true;
        this.outlineWidth = 2;
        this.extrudedHeight = 0;
        this.markers = {};
        this.layerId = "globeDrawerLayer";
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
    PlotAttackArrowDrawer.prototype.clear = function () {
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
            // layer.close(_this.toolBarIndex, function() {
            //   $("#shapeEditContainer").remove();
            // });
            _this.toolBarIndex = null;
        }
        _this._clearMarkers(_this.layerId);
        _this.tooltip.setVisible(false);
        // $("#shapeEditContainer").hide(); // 设置确定按钮隐藏
    };
    PlotAttackArrowDrawer.prototype.showModifyAttackArrow = function (options) {
        var _this_1 = this;
        var _this = this;
        var arr = [];
        for (var i = 0; i < options.custom.length; i++) {
            var p = options.custom[i];
            var c = Cesium.Cartesian3.fromDegrees(p[0], p[1]);
            arr.push(c);
        }
        _this.positions = arr;
        _this._showModifyRegion2Map();
        return new Promise(function (resolve, reject) {
            if (options && options.confirmHandler) {
                // confirmHandler需返回一个promise事件
                options.confirmHandler().then(function () {
                    var lonLats = _this._getLonLatArr(_this.positions);
                    var doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
                    var positions = doubleArrow.polygonalPoint;
                    var custom = doubleArrow.controlPoint;
                    resolve({ positions: positions, custom: custom });
                    _this_1.clear();
                    _this_1.viewer.entities.remove(_this_1.entity);
                }).catch(function () {
                    _this_1.clear();
                    reject();
                });
            }
            else {
                _this_1.createToolBar().then(function () {
                    var lonLats = _this._getLonLatArr(_this.positions);
                    var doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
                    var positions = doubleArrow.polygonalPoint;
                    var custom = doubleArrow.controlPoint;
                    resolve({ positions: positions, custom: custom });
                    _this_1.clear();
                    _this_1.viewer.entities.remove(_this_1.entity);
                }).catch(function () {
                    _this_1.clear();
                    reject();
                });
            }
        });
    };
    PlotAttackArrowDrawer.prototype.startDrawAttackArrow = function (options) {
        var _this_1 = this;
        var _this = this;
        _this.positions = [];
        var floatingPoint = null;
        // let definedColor = $("#paigusu").data("color2");
        // if (definedColor) {
        //     _this.shapeColor = "rgba(" + definedColor + ")"; // 设置自定义的绘图颜色
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
            _this.tooltip.showAt(position, "<p>新增控制点</p><p>右键结束绘制</p>");
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
        _this.drawHandler.setInputAction(function (movement) {
            if (_this.positions.length < 2) {
                return;
            }
            _this_1.isClickConfirm = true;
            _this.positions.pop();
            _this.viewer.entities.remove(floatingPoint);
            _this.tooltip.setVisible(false);
            _this._startModify();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        _this.drawHandler.setInputAction(function (movement) {
            if (_this.positions.length < 2) {
                return;
            }
            _this_1.isClickConfirm = true;
            _this.positions.pop();
            _this.viewer.entities.remove(floatingPoint);
            _this.tooltip.setVisible(false);
            _this._startModify();
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
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
                            var lonLats = _this._getLonLatArr(_this.positions);
                            var doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
                            var positions = doubleArrow.polygonalPoint;
                            var custom = doubleArrow.controlPoint;
                            resolve({ positions: positions, custom: custom });
                            _this_1.clear();
                            _this_1.viewer.entities.remove(_this_1.entity);
                        }).catch(function () {
                            _this_1.clear();
                            reject();
                        });
                    }
                    else {
                        _this_1.createToolBar().then(function () {
                            var lonLats = _this._getLonLatArr(_this.positions);
                            var doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
                            var positions = doubleArrow.polygonalPoint;
                            var custom = doubleArrow.controlPoint;
                            resolve({ positions: positions, custom: custom });
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
    PlotAttackArrowDrawer.prototype._startModify = function () {
        var _this = this;
        var isMoving = false;
        var pickedAnchor = null;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
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
    PlotAttackArrowDrawer.prototype._showRegion2Map = function () {
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
        var dynamicHierarchy = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var lonLats = _this._getLonLatArr(_this.positions);
                var doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
                var positions = doubleArrow.polygonalPoint;
                if (positions == null || positions.length < 3) {
                    return null;
                }
                var pHierarchy = new Cesium.PolygonHierarchy(positions);
                return pHierarchy;
            }
            else {
                return null;
            }
        }, false);
        var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length < 2) {
                return null;
            }
            var lonLats = _this._getLonLatArr(_this.positions);
            var doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
            var positions = doubleArrow.polygonalPoint;
            if (positions == null || positions.length < 3) {
                return null;
            }
            var firstPoint = positions[0];
            positions.push(firstPoint);
            return positions;
        }, false);
        var bData = {
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: _this.material,
                show: _this.fill
            }),
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
    PlotAttackArrowDrawer.prototype._showModifyRegion2Map = function () {
        var _this = this;
        _this._startModify();
        _this._computeTempPositions();
        var dynamicHierarchy = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var lonLats = _this._getLonLatArr(_this.positions);
                var doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
                var positions_1 = doubleArrow.polygonalPoint;
                if (positions_1 == null || positions_1.length < 3) {
                    return null;
                }
                var pHierarchy = new Cesium.PolygonHierarchy(positions_1);
                return pHierarchy;
            }
            else {
                return null;
            }
        }, false);
        var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length < 2) {
                return null;
            }
            var lonLats = _this._getLonLatArr(_this.positions);
            var doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
            var positions = doubleArrow.polygonalPoint;
            if (positions == null || positions.length < 2) {
                return null;
            }
            var firstPoint = positions[0];
            positions.push(firstPoint);
            return positions;
        }, false);
        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)");
        // }
        // if (_this.outlineMaterial == null) {
        _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
        });
        // }
        var bData = {
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: _this.material,
                show: _this.fill
            }),
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
        var positions = _this.positions;
        for (var i = 0; i < positions.length; i++) {
            _this._createPoint(positions[i], i);
        }
    };
    PlotAttackArrowDrawer.prototype._createPoint = function (cartesian, oid) {
        var _this = this;
        var point = this.viewer.entities.add({
            position: cartesian,
            billboard: {
                image: _this.dragIconLight,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        point.oid = oid;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        _this.markers[oid] = point;
        return point;
    };
    PlotAttackArrowDrawer.prototype._computeTempPositions = function () {
        var _this = this;
        var pnts = [].concat(_this.positions);
        var num = pnts.length;
        var first = pnts[0];
        var last = pnts[num - 1];
        if (!_this._isSimpleXYZ(first, last)) {
            pnts.push(first);
            num += 1;
        }
        _this.tempPositions = [];
        for (var i = 1; i < num; i++) {
            var p1 = pnts[i - 1];
            var p2 = pnts[i];
            var cp = _this._computeCenterPotition(p1, p2);
            _this.tempPositions.push(p1);
            _this.tempPositions.push(cp);
        }
    };
    PlotAttackArrowDrawer.prototype._computeCenterPotition = function (p1, p2) {
        var _this = this;
        var c1 = _this.ellipsoid.cartesianToCartographic(p1);
        var c2 = _this.ellipsoid.cartesianToCartographic(p2);
        var cm = new Cesium.EllipsoidGeodesic(c1, c2).interpolateUsingFraction(0.5);
        var cp = _this.ellipsoid.cartographicToCartesian(cm);
        return cp;
    };
    PlotAttackArrowDrawer.prototype.createToolBar = function () {
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
    PlotAttackArrowDrawer.prototype._getLonLat = function (cartesian) {
        var _this = this;
        var cartographic = _this.ellipsoid.cartesianToCartographic(cartesian);
        cartographic.height = _this.viewer.scene.globe.getHeight(cartographic);
        var pos = {
            lon: cartographic.longitude,
            lat: cartographic.latitude,
            alt: cartographic.height
        };
        pos.lon = Cesium.Math.toDegrees(pos.lon);
        pos.lat = Cesium.Math.toDegrees(pos.lat);
        return pos;
    };
    PlotAttackArrowDrawer.prototype._getLonLatArr = function (positions) {
        var _this = this;
        var arr = [];
        for (var i = 0; i < positions.length; i++) {
            var p = _this._getLonLat(positions[i]);
            if (p != null) {
                arr.push([p.lon, p.lat]);
            }
        }
        return arr;
    };
    PlotAttackArrowDrawer.prototype._isSimpleXYZ = function (p1, p2) {
        if (p1.x == p2.x && p1.y == p2.y && p1.z == p2.z) {
            return true;
        }
        return false;
    };
    PlotAttackArrowDrawer.prototype._clearMarkers = function (layerName) {
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
    PlotAttackArrowDrawer.prototype._clearAnchors = function () {
        var _this = this;
        for (var key in _this.markers) {
            var m = _this.markers[key];
            _this.viewer.entities.remove(m);
        }
        _this.markers = {};
    };
    return PlotAttackArrowDrawer;
}());
export default PlotAttackArrowDrawer;
