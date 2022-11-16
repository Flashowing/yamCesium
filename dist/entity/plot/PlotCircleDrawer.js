import PlotToolTip from "./PlotToolTip";
import * as Cesium from "cesium";
import layer from "../../plugins/lib/layer/Layer";
var PlotCircleDrawer = /** @class */ (function () {
    function PlotCircleDrawer(viewer) {
        this.positions = [];
        this.dragIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAA+0lEQVQoU2NkQALX5VjTGBkYXYBCllDh40B6k8ajX0tgyhhhjBtybKuAHAUGhv9T/zExHwSJM/37a8/AwJj9n4HhAVBTGEgMrAGq+Kr6o1+NN2TY9BgZ/9v8Z2L4wfiP4bL649+nb8qx1QM1+QI1mTBCnZEA5FhBJRqQnQk0sQFskBzbpv8M/7cwAhmLGP7/Pw6UOPOfkfEUsmI4+x+DPgPjf2sGRkZLkIb7LP8YXf8w/7Nj+M84F5sGxv//s5n/M+36w/R/N1kaSHMS1NM+QE/7EfD0MaCnF8CC9QyQsZlAsGqD4oK8iEOK7Rgg2w85aQCdsUfz0e9ZMDUAG9CXv0chMrwAAAAASUVORK5CYII=";
        this.dragIconLight = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABjUlEQVQ4T5WTO0gDQRCG598TUohgLqUIChcSEBsfjQ9MEWvtFDs7E+0tUllaa5JSECzstLdI46NQGxESc2JELBMLCxEuO86dXkhiAndX7c3O/PvPzregHl+sWBlpOioOQyXdbW7qsjGgq/VM4r07Hd0Bs2gfMfMkgT6hKcKAI0nfTBwF8NDIWJvtNR0CZsF+kcSaBFO9nEnskQiDjaw17u+3BKKF6q38TPcp7Agz0d1HNj7jBj2BWNHeF9sLspwLIiA5p9LOaz1j7cLM26Ni+wygqYDFXhoz3YOwCvPwaRkKObG1FEZAzF+S1nuI5e0dDV6XXubDCdANGCeIFp63xNAGiBdDCTBdM9Qxhg+qKWUgJyLpMAIMKrFD0oJQp1mdBx2hf4g7SgW94o3RpU+udVaWE0FcSHFJxlhzqWyB5FIobYwFEZAJ1HwaO1D+o9EWkbU+QldyesSnsEVie7JLpdacFotf4siQgqYicjTTkFK4cOlrz//3Gr07ETqJdRJQiV/qdIWgyo1t663b2Q/kAI6uzOBy0gAAAABJRU5ErkJggg==";
        this.fill = true;
        this.outline = true;
        this.outlineWidth = 3;
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
    PlotCircleDrawer.prototype.clear = function () {
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
        }
        _this._clearMarkers(_this.layerId);
        _this.tooltip.setVisible(false);
    };
    PlotCircleDrawer.prototype.clear2 = function () {
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
    PlotCircleDrawer.prototype.showModifyCircle = function (options) {
        var _this_1 = this;
        var _this = this;
        _this.positions = options.positions;
        _this._showModifyRegion2Map();
        _this._showCircleOutline2Map();
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
    PlotCircleDrawer.prototype.startDrawCircle = function (options) {
        var _this_1 = this;
        var _this = this;
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
                _this._createCenter(cartesian, 0);
                floatingPoint = _this._createPoint(cartesian, -1);
                _this._showRegion2Map();
                _this._showCircleOutline2Map();
            }
            _this.positions.push(cartesian);
            if (num > 0) {
                _this._createPoint(cartesian, 1);
            }
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
    PlotCircleDrawer.prototype._startModify = function () {
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
    PlotCircleDrawer.prototype._createCenter = function (cartesian, oid) {
        var _this = this;
        var point = this.viewer.entities.add({
            position: cartesian,
            billboard: {
                image: _this.dragIcon,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        point.oid = oid;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        return point;
    };
    PlotCircleDrawer.prototype._createPoint = function (cartesian, oid) {
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
    PlotCircleDrawer.prototype._showRegion2Map = function () {
        var _this = this;
        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)");
        // }
        if (_this.radiusLineMaterial == null) {
            _this.radiusLineMaterial = new Cesium.PolylineDashMaterialProperty({
                dashLength: 16,
                color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
            });
        }
        var dynamicHierarchy = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var dis = _this._computeCircleRadius3D(_this.positions);
                dis = (dis / 1000).toFixed(3);
                //  _this.entity.label.text = dis + "km";
                var pnts = _this._computeCirclePolygon(_this.positions);
                return new Cesium.PolygonHierarchy(pnts);
            }
            else {
                return null;
            }
        }, false);
        var lineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                return _this.positions;
            }
            else {
                return null;
            }
        }, false);
        var labelDynamicPosition = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var p1 = _this.positions[0];
                var p2 = _this.positions[1];
                var cp = _this._computeCenterPotition(p1, p2);
                return cp;
            }
            else {
                return null;
            }
        }, false);
        var bData = {
            position: labelDynamicPosition,
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: _this.material
            }),
            polyline: {
                positions: lineDynamicPositions,
                clampToGround: true,
                width: 2,
                material: _this.radiusLineMaterial
            }
        };
        // if (_this.extrudedHeight > 0) {
        //   bData.polygon.extrudedHeight = _this.extrudedHeight;
        //   bData.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
        //   bData.polygon.closeTop = true;
        //   bData.polygon.closeBottom = true;
        // }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
    };
    PlotCircleDrawer.prototype._showModifyRegion2Map = function () {
        var _this = this;
        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)");
        // }
        if (_this.radiusLineMaterial == null) {
            _this.radiusLineMaterial = new Cesium.PolylineDashMaterialProperty({
                dashLength: 16,
                color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
            });
        }
        var dynamicHierarchy = new Cesium.CallbackProperty(function () {
            var dis = _this._computeCircleRadius3D(_this.positions);
            dis = (dis / 1000).toFixed(3);
            // _this.entity.label.text = dis + "km";
            var pnts = _this._computeCirclePolygon(_this.positions);
            return new Cesium.PolygonHierarchy(pnts);
        }, false);
        var lineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                return _this.positions;
            }
            else {
                return null;
            }
        }, false);
        var labelDynamicPosition = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var p1 = _this.positions[0];
                var p2 = _this.positions[1];
                var cp = _this._computeCenterPotition(p1, p2);
                return cp;
            }
            else {
                return null;
            }
        }, false);
        var dis = _this._computeCircleRadius3D(_this.positions);
        dis = (dis / 1000).toFixed(3) + "km";
        var bData = {
            position: labelDynamicPosition,
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: _this.material
            }),
            polyline: {
                positions: lineDynamicPositions,
                clampToGround: true,
                width: 2,
                material: _this.radiusLineMaterial
            }
        };
        // if (_this.extrudedHeight > 0) {
        //   bData.polygon.extrudedHeight = _this.extrudedHeight;
        //   bData.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
        //   bData.polygon.closeTop = true;
        //   bData.polygon.closeBottom = true;
        // }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
        _this._createCenter(_this.positions[0], 0);
        _this._createPoint(_this.positions[1], 1);
    };
    PlotCircleDrawer.prototype._showCircleOutline2Map = function () {
        var _this = this;
        // if (_this.outlineMaterial == null) {
        _this.outlineMaterial = new Cesium.PolylineGlowMaterialProperty({
            color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
        });
        // }
        var outelinePositions = new Cesium.CallbackProperty(function () {
            var pnts = _this._computeCirclePolygon(_this.positions);
            return pnts;
        }, false);
        var bData = {
            polyline: {
                positions: outelinePositions,
                clampToGround: true,
                width: _this.outlineWidth,
                material: _this.outlineMaterial
            }
        };
        _this.outlineEntity = _this.viewer.entities.add(bData);
        _this.outlineEntity.layerId = _this.layerId;
    };
    PlotCircleDrawer.prototype._computeCenterPotition = function (p1, p2) {
        var _this = this;
        var c1 = _this.ellipsoid.cartesianToCartographic(p1);
        var c2 = _this.ellipsoid.cartesianToCartographic(p2);
        var cm = new Cesium.EllipsoidGeodesic(c1, c2).interpolateUsingFraction(0.5);
        var cp = _this.ellipsoid.cartographicToCartesian(cm);
        return cp;
    };
    PlotCircleDrawer.prototype._computeCirclePolygon = function (positions) {
        var _this = this;
        try {
            if (!positions || positions.length < 2) {
                return null;
            }
            var cp = positions[0];
            var r = _this._computeCircleRadius3D(positions);
            return _this._computeCirclePolygon2(cp, r);
        }
        catch (err) {
            return null;
        }
    };
    PlotCircleDrawer.prototype._computeCirclePolygon2 = function (center, radius) {
        var _this = this;
        try {
            if (!center || radius <= 0) {
                return null;
            }
            // @ts-ignore
            var cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions({
                center: center,
                semiMajorAxis: radius,
                semiMinorAxis: radius,
                rotation: 0,
                granularity: 0.005
            }, false, true);
            if (!cep || !cep.outerPositions) {
                return null;
            }
            var pnts = Cesium.Cartesian3.unpackArray(cep.outerPositions);
            var first = pnts[0];
            pnts[pnts.length] = first;
            return pnts;
        }
        catch (err) {
            return null;
        }
    };
    PlotCircleDrawer.prototype._computeCirclePolygon3 = function (center, semiMajorAxis, semiMinorAxis, rotation) {
        var _this = this;
        try {
            if (!center || semiMajorAxis <= 0 || semiMinorAxis <= 0) {
                return null;
            }
            // @ts-ignore
            var cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions({
                center: center,
                semiMajorAxis: semiMajorAxis,
                semiMinorAxis: semiMinorAxis,
                rotation: rotation,
                granularity: 0.005
            }, false, true);
            if (!cep || !cep.outerPositions) {
                return null;
            }
            var pnts = Cesium.Cartesian3.unpackArray(cep.outerPositions);
            var first = pnts[0];
            pnts[pnts.length] = first;
            return pnts;
        }
        catch (err) {
            return null;
        }
    };
    PlotCircleDrawer.prototype._computeCirclePolygonForDegree = function (positions) {
        var _this = this;
        var cp = _this.ellipsoid.cartesianToCartographic(positions[0]);
        var rp = _this.ellipsoid.cartesianToCartographic(positions[1]);
        var x0 = cp.longitude;
        var y0 = cp.latitude;
        var xr = rp.longitude;
        var yr = rp.latitude;
        var r = Math.sqrt(Math.pow((x0 - xr), 2) + Math.pow((y0 - yr), 2));
        var pnts = [];
        for (var i = 0; i < 360; i++) {
            var x1 = x0 + r * Math.cos(i * Math.PI / 180);
            var y1 = y0 + r * Math.sin(i * Math.PI / 180);
            var p1 = Cesium.Cartesian3.fromRadians(x1, y1);
            pnts.push(p1);
        }
        return pnts;
    };
    PlotCircleDrawer.prototype._computeCircleRadius3D = function (positions) {
        var distance = 0;
        var c1 = positions[0];
        var c2 = positions[1];
        var x = Math.pow(c1.x - c2.x, 2);
        var y = Math.pow(c1.y - c2.y, 2);
        var z = Math.pow(c1.z - c2.z, 2);
        var dis = Math.sqrt(x + y + z);
        return dis;
    };
    PlotCircleDrawer.prototype.createToolBar = function () {
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
    PlotCircleDrawer.prototype._clearMarkers = function (layerName) {
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
    return PlotCircleDrawer;
}());
export default PlotCircleDrawer;
