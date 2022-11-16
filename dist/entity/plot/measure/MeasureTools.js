import * as Cesium from "cesium";
import CesiumMethod from "../../../plugins/lib/CesiumMethod";
var MeasureTools = /** @class */ (function () {
    function MeasureTools(viewer, turf) {
        this.entityCollection = [];
        this.dis = "0";
        this.distance = 0;
        this.tempEntityCollection = [];
        this.viewModel = {
            measurePointEnabled: false,
            measureDistanceEnabled: false,
            measureAreaEnabled: false,
            measureHeightEnabled: false
        };
        this.viewer = viewer;
        // @ts-ignore
        this.turf = turf || window["turf"];
        if (!this.turf) {
            console.error("请引入turf.js");
            return;
        }
        this.bindModel();
    }
    /**
     * 属性绑定
     */
    MeasureTools.prototype.bindModel = function () {
        var _this_1 = this;
        // @ts-ignore
        Cesium.knockout.track(this.viewModel);
        // @ts-ignore
        Cesium.knockout.getObservable(this.viewModel, "measurePointEnabled").subscribe(function (newValue) {
            _this_1.clear();
            if (newValue) {
                _this_1.closeOtherFunc("measurePointEnabled");
                _this_1.measurePoint();
            }
            else {
                _this_1.clearTempEntity();
            }
        });
        // @ts-ignore
        Cesium.knockout.getObservable(this.viewModel, "measureDistanceEnabled").subscribe(function (newValue) {
            _this_1.clear();
            if (newValue) {
                _this_1.closeOtherFunc("measureDistanceEnabled");
                _this_1.measureDis();
            }
            else {
                _this_1.clearTempEntity();
            }
        });
        // @ts-ignore
        Cesium.knockout.getObservable(this.viewModel, "measureAreaEnabled").subscribe(function (newValue) {
            _this_1.clear();
            if (newValue) {
                _this_1.closeOtherFunc("measureAreaEnabled");
                _this_1.measureArea();
            }
            else {
                _this_1.clearTempEntity();
            }
        });
        // @ts-ignore
        Cesium.knockout.getObservable(this.viewModel, "measureHeightEnabled").subscribe(function (newValue) {
            _this_1.clear();
            if (newValue) {
                _this_1.closeOtherFunc("measureHeightEnabled");
                _this_1.measureHeight();
            }
            else {
                _this_1.clearTempEntity();
            }
        });
    };
    MeasureTools.prototype.clear = function () {
        var _this = this;
        // 移除最后一个label
        if (_this.pointEntity) {
            _this.viewer.entities.remove(_this.pointEntity);
        }
        _this.distance = 0;
        // _this.tempEntityCollection = [];
        _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    MeasureTools.prototype.clearTempEntity = function () {
        var _this = this;
        for (var i = 0; i < _this.tempEntityCollection.length; i++) {
            _this.viewer.entities.remove(_this.tempEntityCollection[i]);
        }
        _this.tempEntityCollection = [];
    };
    MeasureTools.prototype.closeOtherFunc = function (nowFunc) {
        var _this = this;
        for (var viewModelKey in this.viewModel) {
            if (viewModelKey !== nowFunc) {
                this.viewModel[viewModelKey] = false;
            }
        }
        _this.clearTempEntity();
    };
    MeasureTools.prototype.getCollection = function () {
        var _this = this;
        return _this.entityCollection;
    };
    MeasureTools.prototype.destroy = function () {
        var _this = this;
        for (var i = 0; i < _this.entityCollection.length; i++) {
            _this.viewer.entities.remove(_this.entityCollection[i]);
        }
        _this.entityCollection = [];
        _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    MeasureTools.prototype.measurePoint = function () {
        var _this = this;
        _this.viewer.screenSpaceEventHandler.setInputAction(function (event) {
            var _a;
            var wp = event.position;
            if (!Cesium.defined(wp)) {
                return;
            }
            var ray = _this.viewer.scene.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (cartesian) {
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                var lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
                var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
                var elev = (_a = _this.viewer.scene.globe.getHeight(cartographic)) === null || _a === void 0 ? void 0 : _a.toFixed(2);
                var lengthText = "经度：" + lon + "\n" + "纬度：" + lat + "\n" + "高度：" + elev;
                // let entity = _this.addLabel(cartesian, lengthText);
                var entity = _this.addLabelWithPoint(cartesian, lengthText);
                _this.entityCollection.push(entity);
                // _this.addPoint(cartesian);
            }
            ;
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //
        _this.viewer.screenSpaceEventHandler.setInputAction(function (moveEvent) {
            var _a;
            var movePosition = _this.viewer.scene.pickPosition(moveEvent.endPosition); // 鼠标移动的点
            if (_this.pointEntity) {
                _this.viewer.entities.remove(_this.pointEntity);
            }
            if (movePosition) {
                var cartographic = Cesium.Cartographic.fromCartesian(movePosition);
                if (!cartographic) {
                    return;
                }
                var lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
                var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
                var elev = (_a = _this.viewer.scene.globe.getHeight(cartographic)) === null || _a === void 0 ? void 0 : _a.toFixed(2);
                var lengthText = "经度：" + lon + "\n" + "纬度：" + lat + "\n" + "高度：" + elev;
                _this.pointEntity = _this.addLabelWithPoint(movePosition, lengthText);
                _this.entityCollection.push(_this.pointEntity);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        // 右击结束
        _this.viewer.screenSpaceEventHandler.setInputAction(function (clickEvent) {
            // 移除最后一个label
            _this.pointEntity && _this.viewer.entities.remove(_this.pointEntity);
            _this.distance = 0;
            _this.tempEntityCollection = [];
            _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            _this.viewModel.measurePointEnabled = false;
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    };
    MeasureTools.prototype.measureDis = function () {
        var _this = this;
        var positions = [];
        var clickStatus = false;
        var labelEntity;
        var totalLabelEntity;
        var totalLengthText = "总距离：" + "0.00米";
        var finalLengthText = "";
        var firstCartesian;
        // let dis = 0;
        _this.viewer.screenSpaceEventHandler.setInputAction(function (clickEvent) {
            finalLengthText = totalLengthText;
            clickStatus = true;
            var ray = _this.viewer.camera.getPickRay(clickEvent.position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (!firstCartesian) {
                firstCartesian = JSON.parse(JSON.stringify(cartesian));
            }
            if (positions.length == 0) {
                positions.push(cartesian.clone()); //鼠标左击 添加第1个点
                _this.addPoint(cartesian);
                // 计算距离
                totalLabelEntity = _this.addLabelWithPoint(cartesian, totalLengthText);
                _this.entityCollection.push(totalLabelEntity);
                _this.tempEntityCollection.push(totalLabelEntity);
                _this.viewer.screenSpaceEventHandler.setInputAction(function (moveEvent) {
                    var ray = _this.viewer.camera.getPickRay(moveEvent.endPosition);
                    if (!ray) {
                        return;
                    }
                    var movePosition = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
                    if (!movePosition) {
                        return;
                    }
                    if (positions.length == 1) {
                        positions.push(movePosition);
                        _this.addLine(positions);
                    }
                    else {
                        if (labelEntity && !clickStatus) {
                            _this.viewer.entities.remove(labelEntity);
                            _this.entityCollection.splice(_this.entityCollection.indexOf(labelEntity), 1);
                        }
                        if (totalLabelEntity) {
                            _this.viewer.entities.remove(totalLabelEntity);
                            _this.entityCollection.splice(_this.entityCollection.indexOf(totalLabelEntity), 1);
                        }
                        // 计算中点
                        var centerPoint = Cesium.Cartesian3.midpoint(positions[positions.length - 2], positions[positions.length - 1], new Cesium.Cartesian3());
                        var dis = _this.getLengthText(positions[positions.length - 2], positions[positions.length - 1]);
                        if (_this.distance > 1000) {
                            _this.dis = ((dis + _this.distance) / 1000).toFixed(2) + " 公里";
                        }
                        else {
                            _this.dis = (dis + _this.distance).toFixed(2) + " 米";
                        }
                        // 计算距离
                        var lengthText = "距离：" + _this.dis;
                        totalLengthText = "总距离：" + _this.dis;
                        labelEntity = _this.addLabel(centerPoint, lengthText);
                        _this.entityCollection.push(labelEntity);
                        _this.tempEntityCollection.push(labelEntity);
                        totalLabelEntity = _this.addLabel(cartesian, totalLengthText);
                        _this.entityCollection.push(totalLabelEntity);
                        _this.tempEntityCollection.push(totalLabelEntity);
                        if (clickStatus) {
                            positions.push(movePosition);
                        }
                        else {
                            positions.pop();
                            positions.push(movePosition);
                        }
                    }
                    if (positions.length >= 3) {
                        // 绘制label
                        if (labelEntity) {
                            var a = _this.viewer.entities.remove(labelEntity);
                            _this.entityCollection.splice(_this.entityCollection.indexOf(labelEntity), 1);
                        }
                        // 计算中点
                        var centerPoint = Cesium.Cartesian3.midpoint(positions[positions.length - 2], positions[positions.length - 1], new Cesium.Cartesian3());
                        var dis = _this.getLengthText(positions[positions.length - 2], positions[positions.length - 1]);
                        if (dis > 1000) {
                            _this.dis = (dis / 1000).toFixed(2) + " 公里";
                        }
                        else {
                            _this.dis = dis.toFixed(2) + " 米";
                        }
                        // 计算距离
                        var lengthText = "距离：" + _this.dis;
                        labelEntity = _this.addLabel(centerPoint, lengthText);
                        _this.entityCollection.push(labelEntity);
                        _this.tempEntityCollection.push(labelEntity);
                    }
                    clickStatus = false;
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            }
            else if (positions.length == 2) {
                positions.pop();
                positions.push(cartesian.clone()); // 鼠标左击 添加第2个点
                _this.addPoint(cartesian);
                // _this.addLine(positions);
                // 右击结束
                _this.viewer.screenSpaceEventHandler.setInputAction(function (clickEvent) {
                    // 移除最后一个label
                    var ray = _this.viewer.camera.getPickRay(clickEvent.position);
                    if (!ray) {
                        return;
                    }
                    var clickPosition = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
                    if (!clickPosition) {
                        return;
                    }
                    if (!clickStatus) {
                        positions.pop();
                        _this.viewer.entities.remove(labelEntity);
                    }
                    if (positions.length < 2) {
                        positions.push(clickPosition);
                        _this.addPoint(clickPosition);
                    }
                    else {
                    }
                    // positions.push(clickPosition);
                    // positions.push(positions[0]); // 闭合
                    // _this.addPoint(clickPosition);
                    _this.distance = 0;
                    _this.tempEntityCollection = [];
                    _this.entityCollection.splice(_this.entityCollection.indexOf(totalLabelEntity), 1);
                    var b = _this.viewer.entities.remove(totalLabelEntity);
                    // _this.tempEntityCollection.push(totalLabelEntity);
                    if (b) {
                        totalLabelEntity = _this.addLabel(firstCartesian, finalLengthText);
                        _this.entityCollection.push(totalLabelEntity);
                    }
                    firstCartesian = new Cesium.Cartesian3();
                    _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                    _this.viewModel.measureDistanceEnabled = false;
                }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            }
            else if (positions.length >= 3) {
                positions.pop();
                positions.push(cartesian.clone()); // 鼠标左击 添加第3个点
                _this.addPoint(cartesian);
            }
            _this.distance += _this.getLengthText(positions[positions.length - 2], positions[positions.length - 1]);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
    MeasureTools.prototype.measureHeight = function () {
        var _this = this;
        var positions = [];
        var labelEntity_1; // 标签实体
        var labelEntity_2; // 标签实体
        var labelEntity_3; // 标签实体
        // 注册鼠标左击事件
        _this.viewer.screenSpaceEventHandler.setInputAction(function (clickEvent) {
            var cartesian = _this.viewer.scene.pickPosition(clickEvent.position); // 坐标
            // 存储第一个点
            if (positions.length == 0) {
                positions.push(cartesian.clone());
                _this.addPoint(cartesian);
                // 注册鼠标移动事件
                _this.viewer.screenSpaceEventHandler.setInputAction(function (moveEvent) {
                    var movePosition = _this.viewer.scene.pickPosition(moveEvent.endPosition); // 鼠标移动的点
                    if (typeof movePosition == "undefined") { // 如果鼠标悬停在label上, 就有可能获取不到坐标
                        return;
                    }
                    if (positions.length >= 2) {
                        positions.pop();
                        positions.pop();
                        positions.pop();
                        try {
                            var cartographic = Cesium.Cartographic.fromCartesian(movePosition);
                            var height = Cesium.Cartographic.fromCartesian(positions[0]).height;
                            var verticalPoint = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude), height);
                            positions.push(verticalPoint);
                            positions.push(movePosition);
                            positions.push(positions[0]);
                            // 绘制label
                            if (labelEntity_1) {
                                _this.viewer.entities.remove(labelEntity_1);
                                _this.entityCollection.splice(_this.entityCollection.indexOf(labelEntity_1), 1);
                                _this.viewer.entities.remove(labelEntity_2);
                                _this.entityCollection.splice(_this.entityCollection.indexOf(labelEntity_2), 1);
                                _this.viewer.entities.remove(labelEntity_3);
                                _this.entityCollection.splice(_this.entityCollection.indexOf(labelEntity_3), 1);
                            }
                            // 计算中点
                            // let centerPoint_1 = Cesium.Cartesian3.midpoint(positions[0], positions[1], new Cesium.Cartesian3());
                            var centerPoint_1 = positions[0];
                            // 计算距离
                            var lengthText_1 = "水平距离：" + _this.getLengthText(positions[0], positions[1]).toFixed(4) + "米";
                            labelEntity_1 = _this.addLabel(centerPoint_1, lengthText_1);
                            _this.entityCollection.push(labelEntity_1);
                            _this.tempEntityCollection.push(labelEntity_1);
                            // 计算中点
                            // let centerPoint_2 = Cesium.Cartesian3.midpoint(positions[1], positions[2], new Cesium.Cartesian3());
                            var centerPoint_2 = positions[2];
                            // 计算距离
                            var lengthText_2 = "垂直距离：" + _this.getLengthText(positions[1], positions[2]).toFixed(4) + "米";
                            labelEntity_2 = _this.addLabel(centerPoint_2, lengthText_2);
                            _this.entityCollection.push(labelEntity_2);
                            _this.tempEntityCollection.push(labelEntity_2);
                            // 计算中点
                            var centerPoint_3 = Cesium.Cartesian3.midpoint(positions[2], positions[3], new Cesium.Cartesian3());
                            // 计算距离
                            var lengthText_3 = "直线距离：" + _this.getLengthText(positions[2], positions[3]).toFixed(4) + "米";
                            labelEntity_3 = _this.addLabel(centerPoint_3, lengthText_3);
                            _this.entityCollection.push(labelEntity_3);
                            _this.tempEntityCollection.push(labelEntity_3);
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }
                    else {
                        try {
                            var verticalPoint = new Cesium.Cartesian3(movePosition.x, movePosition.y, positions[0].z);
                            positions.push(verticalPoint);
                            positions.push(movePosition);
                            positions.push(positions[0]);
                            // 绘制线
                            _this.addLine(positions);
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            }
            else {
                // 存储第二个点
                positions.pop();
                positions.pop();
                positions.pop();
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                var height = Cesium.Cartographic.fromCartesian(positions[0]).height;
                var verticalPoint = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude), height);
                positions.push(verticalPoint);
                positions.push(cartesian);
                positions.push(positions[0]);
                _this.addPoint(cartesian);
                _this.tempEntityCollection = [];
                _this.viewModel.measureHeightEnabled = false;
                _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                _this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
    //测量面积
    MeasureTools.prototype.measureArea = function () {
        var _this = this;
        // let tooltip = document.getElementById("measureTip");
        var isDraw = false;
        var polygonPath = [];
        var polygon;
        var handler = _this.viewer.screenSpaceEventHandler;
        var AllEnities = [];
        var tempAreaLabel;
        handler.setInputAction(function (movement) {
            //新增部分
            var position1;
            var cartographic;
            var ray = _this.viewer.scene.camera.getPickRay(movement.endPosition);
            if (ray)
                position1 = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
            if (position1)
                cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position1);
            if (cartographic) {
                //海拔
                var height = _this.viewer.scene.globe.getHeight(cartographic);
                var point = Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180, height);
                if (isDraw) {
                    if (polygonPath.length < 2) {
                        return;
                    }
                    if (!Cesium.defined(polygon)) {
                        polygonPath.push(point);
                        // @ts-ignore
                        polygon = new CreatePolygon(polygonPath, Cesium);
                        AllEnities.push(polygon);
                    }
                    else {
                        if (tempAreaLabel) {
                            _this.viewer.entities.remove(tempAreaLabel);
                        }
                        if (polygonPath.length >= 4) {
                            var coordinates = CesiumMethod.cartesian3sToLngLats(polygonPath);
                            var first = CesiumMethod.cartesian3ToLngLat(polygonPath[0]);
                            coordinates.push(first);
                            tempAreaLabel = createAreaLabel(coordinates);
                            AllEnities.push(tempAreaLabel);
                            _this.entityCollection.push(tempAreaLabel);
                            _this.tempEntityCollection.push(tempAreaLabel);
                        }
                        polygon.path.pop();
                        polygon.path.push(point);
                        AllEnities.push(polygon);
                    }
                    if (polygonPath.length >= 2) {
                        // tooltip.innerHTML = '<p>双击确定终点</p>';
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.setInputAction(function (movement) {
            isDraw = true;
            //新增部分
            var position1;
            var cartographic;
            var ray = _this.viewer.scene.camera.getPickRay(movement.position);
            if (ray)
                position1 = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
            if (position1)
                cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position1);
            if (cartographic) {
                //海拔
                var height = _this.viewer.scene.globe.getHeight(cartographic);
                var point = Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180, height);
                if (isDraw) {
                    polygonPath.push(point);
                    var temp = _this.addPoint(point);
                    // let temp = _this.addPoint(point);
                    AllEnities.push(temp);
                    _this.entityCollection.push(temp);
                    _this.tempEntityCollection.push(temp);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction(function () {
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            if (polygonPath.length >= 2) {
                var coords = [];
                for (var i = 0; i < polygon.path.length; i++) {
                    var element = polygon.path[i];
                    var cartographic = Cesium.Cartographic.fromCartesian(element);
                    var lon = Cesium.Math.toDegrees(cartographic.longitude);
                    var lat = Cesium.Math.toDegrees(cartographic.latitude);
                    coords.push([lon, lat]);
                }
                coords.push(coords[0]);
                var lastpoint = createAreaLabel(coords);
                AllEnities.push(lastpoint);
                _this.entityCollection.push(lastpoint);
                _this.tempEntityCollection.push(lastpoint);
            }
            _this.viewer.entities.remove(tempAreaLabel);
            _this.viewer.trackedEntity = undefined;
            isDraw = false;
            // tooltip.style.display = 'none';
            _this.tempEntityCollection = [];
            _this.viewModel.measureAreaEnabled = false;
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        var createAreaLabel = function (coords) {
            var area = CesiumMethod.calcPolygonArea(coords).toFixed(2);
            var label = String(countAreaInCartesian3(polygon.path));
            area = area.substring(0, area.indexOf(".", 0));
            var text;
            if (area.length < 6)
                text = area + "平方米";
            else {
                area = String(+area / 1000000);
                area = area.substring(0, area.indexOf(".", 0) + 3);
                text = area + "平方公里";
            }
            var res = CesiumMethod.countPolygonCenter(polygon.path);
            var textArea = text;
            return _this.addLabel(res.cart, textArea);
        };
        var CreatePolygon = (function () {
            function _(positions) {
                if (!Cesium.defined(positions)) {
                    throw new Cesium.DeveloperError("positions is required!");
                }
                if (positions.length < 3) {
                    throw new Cesium.DeveloperError("positions 的长度必须大于等于3");
                }
                _.prototype.options = {
                    polygon: {
                        show: true,
                        hierarchy: undefined,
                        outline: true,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 3,
                        // material: Cesium.Color.YELLOW.withAlpha(0.4)
                        material: Cesium.Color.fromCssColorString("#2a747d").withAlpha(0.5)
                    }
                };
                _.prototype.path = positions;
                _.prototype.hierarchy = positions;
                _.prototype._init();
            }
            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    // return _self.hierarchy;
                    return new Cesium.PolygonHierarchy(_self.hierarchy);
                };
                //实时更新polygon.hierarchy
                this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
                var oo = _this.viewer.entities.add(this.options);
                AllEnities.push(oo);
                _this.entityCollection.push(oo);
                _this.tempEntityCollection.push(oo);
            };
            return _;
        })();
        //微元法求面积
        var countAreaInCartesian3 = function (ps) {
            var s = 0;
            for (var i = 0; i < ps.length; i++) {
                var p1 = ps[i];
                var p2 = void 0;
                if (i < ps.length - 1)
                    p2 = ps[i + 1];
                else
                    p2 = ps[0];
                s += p1.x * p2.y - p2.x * p1.y;
            }
            return Math.abs(s / 2);
        };
    };
    MeasureTools.prototype.addPoint = function (position) {
        var _this = this;
        var entity = _this.viewer.entities.add(new Cesium.Entity({
            position: position,
            // billboard: {
            //   image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAADDVJREFUeF7t3V2MVVcVB/C176Vocar1ARubGBulAe6FIhlj2geTQlN90WhUiDGxgT4QCz60M3emtJ0LB84lIHMu9EFpS2JKrC9C1MT46Mek8aWx9MFyzx1iY4gxtk0lJIA2wtyzzdCOnUzn43zss89ea//70gf23mev/1q/npnOMKMI/yABJLBkAgrZIAEksHQCAILpQALLJAAgGA8kACCYASSQLwG8QfLlhl2eJAAgnjQaZeZLAEDy5YZdniQAIJ40GmXmSwBA8uWGXZ4kACCeNBpl5ksAQPLlhl2eJAAgnjQaZeZLAEDy5YZdniQAIJ40GmXmSwBA8uWGXZ4kACCeNBpl5ksAQPLlhl2eJAAgnjQaZeZLAEDy5YZdniQAIJ40GmXmSwBA8uWGXZ4kACCeNBpl5ksAQPLlhl2eJAAgnjQaZeZLAEDy5YZdniQAIMIavX58/A6VrB6uaRqmWu3vKqn1et0gFlamtXIAxFrU5T+oMdLeRYoOkqJ75j9NE01p0oemo85U+beQ9QQAEdLPxmj7RVK0a/lydBBHnUNCSrZSBoBYibnchzRa7bNEtCPdU4AkXU7vrQKQLGk5uDYbjrkCgCRtKwEkbVIOrsuHA0iytBJAsqTl0NpiOIAkbSsBJG1SDq0zgwNI0rQUQNKk5NAasziAZKXWAshKCTn05+XgAJLlWgwgDgFY7irl4gCSpbIHEAZA7OAAksVGAUAcB2IXB5AsHAcAcRhINTiAZP5IAIijQKrFASRzCQCIg0DcwAEkswkAiGNA3MIBJADiEBA3cfiNBEAcAeI2Dn+RAIgDQHjg8BMJgFQMhBcO/5AASIVAeOLwCwmAVASENw5/kABIBUBk4PADCYBYBiILh3wkAGIRiEwcspEAiCUgsnHIRQIgFoD4gUMmEgApGYhfOOQhAZASgfiJQxYSACkJiN845CABkBKAAMf8UHn/mFMAMQwEOBYLlC8SAFmkn839wTp9I/ks1WiINA2Rmvt3MkSkruiauqJnkitUU5cpmblMH6HL00ePXgaO5f5rwxOJt0AaQbCarg+2EqkvkE6apNQ60nQvKVpn+KWC4/6fAD8k3gDZ9PjExmSVepiU/tJ7KKiJya0iAV5IxALZvH//J5PB6u2kk4c0qe1EtL6KccAzeX9OIg7IhtbEg4rU7G9b2qGI1mJAXU2Ax5tEBJB1Tz219rYbq3aQuoXiQVdHAvdamID7SFgD2fj0059WN2p7iNQeIrobA8gxAbeRsAQCGBwh8PxfwKyArB8fv6OerB7BG0MakNl63HyTsAHSGGvvIq1HidQmieOBmtxE4jyQ5viBbaT1iNb0NQyRDwm49SZxGkhjtH2UFO33YSxQo5vf4OgkkM89+eQnPjpYfYqIvofB8TUBN94kzgHZ8ER7c61OLxPRnb6OBuqeS6B6JE4BaY5N7NNa/RgDggQ+SKBaJM4AabQmDhKpAKOBBD6cQHVInACycfSZ7ytV+xlGAwksnUA1SJwA0my1f6mJvoXxQALLJ2AfSeVAhoNgzbvXB//GaCCBNAkkpLdNR52pNGtNrKkcyIbR9nBN0asmisEZ8hPQRFP9KNxmq9LKgQzvCda8+3G8QWw1XMJzalTfciEK/mKjlsqBzBbZaLVfI6KtNgrGM/gnoHXySL975CUblTgBZGOr/bgiOmmjYDxDQAJat+Jup2ujEieA3HqLjLV/TZq+aaNoPIN3AjY/UXcGSHM0aOja4Cx+2gjv4S399pouDer/ve/i8ePXSn8WETkDZLZYILHRcubPSGh3fCI8Y6sKp4AAia22M32OpjNxN9xt8/bOAQESm+1n9axzcRTutH1jJ4EAie0xcP55leCYTcVZIEDi/NDaumBlOJwHAiS2ZtDZ51SKgwUQIHF2eMu+WOU42AABkrJn0bnzncDBCgiQODfEZV3IGRzsgABJWTPpzLlO4WAJBEicGWbTF3EOB1sgQGJ6Nis/z0kcrIEASeVDbeoCzuJgDwRITM1oZec4jUMEECCpbLiLPth5HGKAAEnRWbW+nwUOUUCAxPqQ530gGxzigABJ3pm1to8VDpFAgMTasGd9EDscYoEASdbZLX09SxyigQBJ6UOf9gFscYgHAiRpZ7i0daxxeAEESEob/pUOZo/DGyBAstIsG/9zETi8AgIkxhEsdaAYHN4BAZLSkYjC4SUQICkNiTgc3gIBEuNIROLwGgiQGEMiFof3QICkMBLROADk/fnAT5XPBUU8DgCZNxdAkgmJFzgAZMFMAEkqJN7gAJBF5gFIlkcSR6HTP/A8FfEMi7wqNm0uQLJ0Ujdum/nUG0ePvpM2S+7rAGSRDjZaEweJVMC9uWXcX+l6s9cN4jLOdvFMAFnQFeBYfkxt/oZZF8AAyLwuAEeKkVRqZzx5+FyKlSKWAMj7bQSOdPOsNe3rd8NT6VbzXwUgRAQcWQZZB3HUOZRlB+e13gMBjmzjq0mP96POZLZdfFd7DQQ4sg+uUvqHvcnOT7Lv5LnDWyDAkXdg9aNx1Hkx725u+7wEAhz5x1QnyXf7J478Iv8JvHZ6BwQ4ig1oTemvX5js/LbYKXx2ewWkNByKeqSpyaft+W+qSD/Uizp/yH8Cr53eACkNB+lA6VXndG1w1gcktZpuXDje6fMa8/y39QJImTjmvibgyzc43j5U/9j5IPhP/pHjtVM8EBs45lruAZJ/xVG4lteIF7utaCA2cXiC5HwchV8sNnK8dosFUgUO6UgU0a96UfhtXiNe7LYigVSJQzISTfRsPwqfKDZyvHaLA+ICDrlI/Poq+mwfRQFxCYdEJGpw897eyWNv8HoHFLutGCAu4hCFRNPf4m74+WLjxm+3CCAu45CCRJF+qRd1HuE34sVuzB4IBxwykOgfxFHnhWLjxm83ayCccHBHoqm+uR8FF/iNeLEbswXCEQdjJK/EUXh/sVHjuZslEM44eCLx6++hz6fMDogEHAyR3B9H4Ss83wHFbs0KiCQcjJB4++EVqy8USsTBA4m/H16xASIZBwMk3n54xQKIDzgcRvK7OAofLvZRPO/dTn8O4hMOJ5EktDs+EZ7hPeLFbu8sEB9xOIakf/vVt7ecP336ZrER473bSSA+43AFiSY90Y86R3iPd/HbOwcEOD5oaoV/x/1qMlPfMv1scKn4iPE+wSkgwPHhYaoCiSL1XC86vJf3aJu5vTNAgGPphlpGco3q9ED8o7BnZsR4n+IEEOBYeYhsIdGkwn50+MDKN/JjReVAgCP9oFlAcrG+6uYDrx87diX9rWSvrBQIcGQfrlKRaHos7obPZ7+V3B2VAQGO/ENVChJNf4y74fb8t5K5sxIgwFF8mEwjUYn+Ru9E5zfFbybrBOtAgMPcAJlC4tvvHczSAatANoy2h2uKXs1ywXRr/f2W7MJIFD0fT4aPpcvZv1VWgTTG2i+Qpj1mY/YXx1yOeZFoonfuGqrfPRUEM2Z7Iuc0u0Ba7deIaKu5+ICjCJJBTW+4eLxz0Vw/5J1kF8hY+y3SdJeZGIFjYY5Z3iRa075+NzxlphdyT7EGpLE3GKI1g2tmogSOpXKcRUJqcFITfWWpNVrpvf3JznNmeiH7FGtAmvuDdXpm8NficQJHmgwbrfYkafoOKbrn1npNl5TSvx8Q/Xw66kylOQNrLP5098ZY+8uk6eVioQNH1vw2jTzzmRldu3P6ZPh61r1YbxNIq72TiAr8AnrgwMDaT8Dah1iNVnuEiLr5SgSOfLlhV9EE7AEZaz9Kmn6a/cLAkT0z7DCVgD0gI+2tVKc/kaY16S8PHOmzwsoyErAGZPbyK34flqK3SdM/SdGfk4ROT3fD82UUjTORQNoErAKZvVRz9MBXE5Xcp0gNiOgfpOhNVa+/qa/SW/Gp4Hrai2MdErCRgHUgNorCM5CAqQQAxFSSOEdkAgAisq0oylQCAGIqSZwjMgEAEdlWFGUqAQAxlSTOEZkAgIhsK4oylQCAmEoS54hMAEBEthVFmUoAQEwliXNEJgAgItuKokwlACCmksQ5IhMAEJFtRVGmEgAQU0niHJEJAIjItqIoUwkAiKkkcY7IBABEZFtRlKkEAMRUkjhHZAIAIrKtKMpUAgBiKkmcIzIBABHZVhRlKgEAMZUkzhGZAICIbCuKMpUAgJhKEueITABARLYVRZlKAEBMJYlzRCbwPyLEeBQfYsxXAAAAAElFTkSuQmCC",
            //   width: 20,
            //   height: 20,
            //   eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
            //   heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //绝对贴地
            //   disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
            // }
            point: {
                pixelSize: 10,
                color: Cesium.Color.fromCssColorString("#e9fabc").withAlpha(0.6),
                outlineColor: Cesium.Color.fromCssColorString("#2a747d").withAlpha(0.8),
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
            }
        }));
        _this.entityCollection.push(entity);
        _this.tempEntityCollection.push(entity);
        return entity;
    };
    MeasureTools.prototype.addLine = function (positions) {
        var _this = this;
        var dynamicPositions = new Cesium.CallbackProperty(function () {
            return positions;
        }, false);
        var entity = _this.viewer.entities.add(new Cesium.Entity({
            polyline: {
                positions: dynamicPositions,
                width: 4,
                clampToGround: true,
                material: Cesium.Color.fromCssColorString("#e9fabc").withAlpha(0.8)
            }
        }));
        _this.entityCollection.push(entity);
        _this.tempEntityCollection.push(entity);
    };
    MeasureTools.prototype.addPolyGon = function (positions) {
        var _this = this;
        var dynamicPositions = new Cesium.CallbackProperty(function () {
            return new Cesium.PolygonHierarchy(positions);
        }, false);
        var entity = _this.viewer.entities.add(new Cesium.Entity({
            polygon: {
                hierarchy: dynamicPositions,
                material: Cesium.Color.fromCssColorString("#2a747d").withAlpha(0.5),
                classificationType: Cesium.ClassificationType.BOTH // 贴地表和贴模型,如果设置了，就不能使用挤出高度
            }
        }));
        _this.entityCollection.push(entity);
        _this.tempEntityCollection.push(entity);
    };
    MeasureTools.prototype.addLabel = function (centerPoint, text) {
        var _this = this;
        return _this.viewer.entities.add(new Cesium.Entity({
            position: centerPoint,
            label: {
                text: text,
                font: "16px Microsoft YaHei",
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.WHITE,
                showBackground: false,
                backgroundPadding: new Cesium.Cartesian2(6, 6),
                pixelOffset: new Cesium.Cartesian2(0, -25),
                disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
            }
        }));
    };
    MeasureTools.prototype.addLabelWithPoint = function (centerPoint, text) {
        var _this = this;
        return _this.viewer.entities.add(new Cesium.Entity({
            position: centerPoint,
            // billboard: {
            //   image: "data:image/png;base64,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",
            //   width: 20,
            //   height: 20,
            //   eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
            //   heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //绝对贴地
            //   disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
            // },
            point: {
                pixelSize: 10,
                color: Cesium.Color.fromCssColorString("#e9fabc").withAlpha(0.6),
                outlineColor: Cesium.Color.fromCssColorString("#2a747d").withAlpha(0.8),
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
            },
            label: {
                text: text,
                font: "16px Microsoft YaHei",
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.WHITE,
                showBackground: false,
                backgroundPadding: new Cesium.Cartesian2(6, 6),
                pixelOffset: new Cesium.Cartesian2(0, -35),
                disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
            }
        }));
    };
    MeasureTools.prototype.getLengthText = function (firstPoint, secondPoint) {
        // 计算距离
        var length = 0;
        if (firstPoint) {
            length = Cesium.Cartesian3.distance(firstPoint, secondPoint);
        }
        return length;
    };
    MeasureTools.prototype.getArea = function (points) {
        var _this = this;
        var radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
        var degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度
        /*角度*/
        function Angle(p1, p2, p3) {
            var bearing21 = Bearing(p2, p1);
            var bearing23 = Bearing(p2, p3);
            var angle = bearing21 - bearing23;
            if (angle < 0) {
                angle += 360;
            }
            return angle;
        }
        /*方向*/
        function Bearing(from, to) {
            var fromCarto = Cesium.Cartographic.fromCartesian(from);
            var toCarto = Cesium.Cartographic.fromCartesian(to);
            var lat1 = fromCarto.latitude;
            var lon1 = fromCarto.longitude;
            var lat2 = toCarto.latitude;
            var lon2 = toCarto.longitude;
            var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
            if (angle < 0) {
                angle += Math.PI * 2.0;
            }
            angle = angle * degreesPerRadian; //角度
            return angle;
        }
        function distance(point1, point2) {
            var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
            var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
            /**根据经纬度计算出距离**/
            var geodesic = new Cesium.EllipsoidGeodesic();
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            var s = geodesic.surfaceDistance;
            //返回两点之间的距离
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            return s;
        }
        var res = 0;
        //拆分三角曲面
        for (var i = 0; i < points.length - 2; i++) {
            var j = (i + 1) % points.length;
            var k = (i + 2) % points.length;
            var totalAngle = Angle(points[i], points[j], points[k]);
            var dis_temp1 = distance(points[j], points[0]);
            var dis_temp2 = distance(points[k], points[0]);
            res += dis_temp1 * dis_temp2 * Math.sin(totalAngle) / 2;
        }
        var resStr = "";
        if (res < 1000000) {
            resStr = Math.abs(res).toFixed(4) + " 平方米";
        }
        else {
            resStr = Math.abs(Number((res / 1000000.0).toFixed(4))) + " 平方公里";
        }
        return resStr;
    };
    MeasureTools.prototype.getCenterOfGravityPoint = function (mPoints) {
        var _this = this;
        var centerPoint = mPoints[0];
        for (var i = 1; i < mPoints.length; i++) {
            centerPoint = Cesium.Cartesian3.midpoint(centerPoint, mPoints[i], new Cesium.Cartesian3());
        }
        return centerPoint;
    };
    return MeasureTools;
}());
export default MeasureTools;
