import * as Cesium from "cesium";
import CesiumMethod from "../../plugins/lib/CesiumMethod";
var PlotMoveDrawer = /** @class */ (function () {
    function PlotMoveDrawer(viewer, plot) {
        this.objId = (new Date()).getTime();
        this.leftDownFlag = false;
        // 保存线，多边形，矩形坐标
        this.polylinePreviousCoordinates = {};
        this.polygonPreviousCoordinates = {};
        this.rectanglePreviousCoordinates = {};
        this.ellipsePreviousCoordinates = {};
        this.pointPreviousCoordinates = {};
        this.rectanglePosition = {};
        this.bufferLinePreviousCoordinates = {};
        this.straightArrowCoordinates = {};
        this.attackArrowCoordinates = {};
        this.pincerArrowCoordinates = {};
        // 临时存储点坐标
        this.rectanglePoint = [];
        this.currentsPoint = [];
        this.savePointCurrentsPoint = [];
        this.savePolylineCurrentsPoint = [];
        this.savePolygonCurrentsPoint = [];
        this.saveRectangleCurrentsPoint = [];
        this.saveCircleCurrentsPoint = [];
        this.saveBufferLineCurrentsPoint = [];
        this.saveAttackArrowCurrentsPoint = [];
        this.savePincerArrowCurrentsPoint = [];
        this.saveStraightArrowCurrentsPoint = [];
        this.saveRectangle = [];
        this.saveAttackArrow = [];
        this.savePincerArrow = [];
        this.pincerPoints = []; //保存钳击箭头中“点”的经纬度
        this.pincerPointsCart = []; //保存钳击箭头中“点”的墨卡托
        this.attackPoints = []; //保存攻击箭头中“点”的经纬度
        this.attackPointsCart = []; //保存攻击箭头中“点”的墨卡托
        this.plot = {};
        this.viewer = viewer;
        this.scene = viewer.scene;
        this.clock = viewer.clock;
        this.canvas = viewer.scene.canvas;
        this.camera = viewer.scene.camera;
        this.ellipsoid = viewer.scene.globe.ellipsoid;
        this.plot = plot;
    }
    PlotMoveDrawer.prototype.clear = function () {
        if (this.moveHandler) {
            if (!this.moveHandler.isDestroyed()) {
                this.moveHandler.destroy();
            }
        }
    };
    PlotMoveDrawer.prototype.moveShape = function () {
        var _this = this;
        this.plot.flag = 0;
        this.plot.plotTracker.clear();
        var isMoving = false;
        var isClickConfirm = false;
        var currentEntityId = "";
        this.moveHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.moveHandler.setInputAction(function (movement) {
            var _a, _b;
            if (isMoving) {
                isMoving = false;
                isClickConfirm = true;
                currentEntityId = (_b = (_a = _this.pointDragged) === null || _a === void 0 ? void 0 : _a.id) === null || _b === void 0 ? void 0 : _b.id;
                _this.confirmClick();
            }
            else {
                _this.pointDragged = null;
                _this.pointDragged = _this.viewer.scene.pick(movement.position);
                if (!_this.pointDragged) {
                    return;
                }
                _this.obj = null;
                _this.obj = _this.pointDragged.id;
                if (!_this.obj || !_this.obj.layerId) {
                    isMoving = false;
                    return;
                }
                isMoving = true;
                _this.objId = _this.obj.objId;
                // this.circleOutlineEntity = this.getEntityByObjId(this.objId);
                // console.log(this.circleOutlineEntity);
                _this.leftDownFlag = true;
                _this.currentsPoint = [];
                //记录按下去的坐标
                _this.startPoint = _this.viewer.scene.pickPosition(movement.position);
                _this.viewer.scene.screenSpaceCameraController.enableRotate = false; //锁定相机
                // @ts-ignore
                _this.startTime = new Cesium.JulianDate.now();
                if (_this.plot.flag == 0) {
                    switch (_this.obj.shapeType) {
                        case "Polygon":
                            _this.plot.flag = 0;
                            _this.clickPolygon(_this.pointDragged);
                            break;
                        case "Polyline":
                            _this.plot.flag = 0;
                            _this.clickPolyline(_this.pointDragged);
                            break;
                        case "Rectangle":
                            _this.plot.flag = 0;
                            _this.clickRectangle(_this.pointDragged);
                            break;
                        case "Circle":
                            _this.plot.flag = 0;
                            _this.clickCircle(_this.pointDragged);
                            break;
                        case "Point":
                            _this.plot.flag = 0;
                            _this.clickPoint(_this.pointDragged);
                            break;
                        case "BufferLine":
                            _this.plot.flag = 0;
                            _this.clickBufferLine(_this.pointDragged);
                            break;
                        case "StraightArrow":
                            _this.plot.flag = 0;
                            _this.clickStraightArrow(_this.pointDragged);
                            break;
                        case "AttackArrow":
                            _this.plot.flag = 0;
                            _this.clickAttackArrow(_this.pointDragged);
                            break;
                        case "PincerArrow":
                            _this.plot.flag = 0;
                            _this.clickPincerArrow(_this.pointDragged);
                            break;
                        default:
                            break;
                    }
                }
                _this.moveHandler.setInputAction(function (movement) {
                    var startPosition;
                    var endPosition;
                    // 有地形和无地形的情况下, 获取三维坐标的值会有差异，所以需要判断
                    if (_this.viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider) { // 没有加载地形的情况
                        startPosition = _this.viewer.camera.pickEllipsoid(movement.startPosition, _this.ellipsoid);
                        endPosition = _this.viewer.camera.pickEllipsoid(movement.endPosition, _this.ellipsoid);
                    }
                    else { // 有地形的情况
                        startPosition = _this.viewer.scene.pickPosition(movement.startPosition);
                        endPosition = _this.viewer.scene.pickPosition(movement.endPosition);
                    }
                    if (startPosition && endPosition) {
                        if (Cesium.defined(_this.currentsPoint)) {
                            //计算每次的偏差
                            var changed_x = endPosition.x - startPosition.x;
                            var changed_y = endPosition.y - startPosition.y;
                            var changed_z = endPosition.z - startPosition.z;
                            if (!_this.pointDragged) {
                                return;
                            }
                            if (_this.pointDragged.id.shapeType == "StraightArrow") {
                                _this.currentsPoint = [];
                                for (var i = 0; i < _this.straightArrowCoordinates.positions.length; i++) {
                                    _this.straightArrowCoordinates.positions[i].x += changed_x;
                                    _this.straightArrowCoordinates.positions[i].y += changed_y;
                                    _this.straightArrowCoordinates.positions[i].z += changed_z;
                                    _this.currentsPoint.push(_this.straightArrowCoordinates.positions[i]);
                                }
                                _this.saveStraightArrowCurrentsPoint = _this.currentsPoint;
                            }
                            if (_this.pointDragged.id.shapeType == "AttackArrow") {
                                _this.currentsPoint = []; //笛卡尔
                                _this.saveAttackArrow = []; //经纬度
                                for (var i = 0; i < _this.attackArrowCoordinates.positions.length; i++) {
                                    _this.attackArrowCoordinates.positions[i].x += changed_x;
                                    _this.attackArrowCoordinates.positions[i].y += changed_y;
                                    _this.attackArrowCoordinates.positions[i].z += changed_z;
                                    _this.currentsPoint.push(_this.attackArrowCoordinates.positions[i]);
                                }
                                for (var i = 0; i < _this.attackPointsCart.length; i++) {
                                    _this.attackPointsCart[i].x += changed_x;
                                    _this.attackPointsCart[i].y += changed_y;
                                    _this.attackPointsCart[i].z += changed_z;
                                    var cartographic = Cesium.Cartographic.fromCartesian(_this.attackPointsCart[i]);
                                    var lon = Cesium.Math.toDegrees(cartographic.longitude);
                                    var lat = Cesium.Math.toDegrees(cartographic.latitude);
                                    _this.saveAttackArrow.push([lon, lat]);
                                }
                                _this.saveAttackArrowCurrentsPoint = _this.currentsPoint;
                                _this.plot.draw.shapeDic[_this.objId] = {
                                    custom: _this.saveAttackArrow,
                                    positions: _this.currentsPoint
                                };
                            }
                            if (_this.pointDragged.id.shapeType == "PincerArrow") {
                                _this.currentsPoint = [];
                                _this.savePincerArrow = [];
                                for (var i = 0; i < _this.pincerArrowCoordinates.positions.length; i++) {
                                    _this.pincerArrowCoordinates.positions[i].x += changed_x;
                                    _this.pincerArrowCoordinates.positions[i].y += changed_y;
                                    _this.pincerArrowCoordinates.positions[i].z += changed_z;
                                    _this.currentsPoint.push(_this.pincerArrowCoordinates.positions[i]);
                                }
                                for (var i = 0; i < _this.pincerPointsCart.length; i++) {
                                    _this.pincerPointsCart[i].x += changed_x;
                                    _this.pincerPointsCart[i].y += changed_y;
                                    _this.pincerPointsCart[i].z += changed_z;
                                    var cartographic = Cesium.Cartographic.fromCartesian(_this.pincerPointsCart[i]);
                                    var lon = Cesium.Math.toDegrees(cartographic.longitude);
                                    var lat = Cesium.Math.toDegrees(cartographic.latitude);
                                    _this.savePincerArrow.push([lon, lat]);
                                }
                                _this.savePincerArrowCurrentsPoint = _this.currentsPoint;
                                _this.plot.draw.shapeDic[_this.objId] = {
                                    custom: _this.savePincerArrow,
                                    positions: _this.currentsPoint
                                };
                            }
                            if (_this.pointDragged.id.shapeType == "Point") {
                                _this.currentsPoint = [];
                                _this.savePointCurrentsPoint = endPosition;
                                _this.plot.draw.shapeDic[_this.objId] = endPosition;
                            }
                            if (_this.pointDragged.id.polyline && _this.pointDragged.id.shapeType == "Polyline") {
                                _this.currentsPoint = [];
                                for (var i = 0; i < _this.polylinePreviousCoordinates.length; i++) {
                                    //与之前的算差 替换掉
                                    _this.polylinePreviousCoordinates[i].x += changed_x;
                                    _this.polylinePreviousCoordinates[i].y += changed_y;
                                    _this.polylinePreviousCoordinates[i].z += changed_z;
                                    _this.currentsPoint.push(_this.polylinePreviousCoordinates[i]);
                                }
                                _this.savePolylineCurrentsPoint = _this.currentsPoint;
                            }
                            if (_this.pointDragged.id.polyline && _this.pointDragged.id.shapeType == "BufferLine") {
                                _this.currentsPoint = [];
                                for (var i = 0; i < _this.bufferLinePreviousCoordinates.length; i++) {
                                    //与之前的算差 替换掉
                                    _this.bufferLinePreviousCoordinates[i].x += changed_x;
                                    _this.bufferLinePreviousCoordinates[i].y += changed_y;
                                    _this.bufferLinePreviousCoordinates[i].z += changed_z;
                                    _this.currentsPoint.push(_this.bufferLinePreviousCoordinates[i]);
                                }
                                _this.saveBufferLineCurrentsPoint = _this.currentsPoint;
                            }
                            if (_this.pointDragged.id.polygon && _this.pointDragged.id.shapeType == "Polygon") {
                                if (_this.polygonPreviousCoordinates.positions) {
                                    _this.currentsPoint = [];
                                    _this.savePolygonCurrentsPoint = [];
                                    for (var i = 0; i < _this.polygonPreviousCoordinates.positions.length; i++) {
                                        _this.polygonPreviousCoordinates.positions[i].x += changed_x;
                                        _this.polygonPreviousCoordinates.positions[i].y += changed_y;
                                        _this.polygonPreviousCoordinates.positions[i].z += changed_z;
                                        var newCart = new Cesium.Cartesian3(_this.polygonPreviousCoordinates.positions[i].x, _this.polygonPreviousCoordinates.positions[i].y, _this.polygonPreviousCoordinates.positions[i].z);
                                        _this.currentsPoint.push(newCart);
                                    }
                                    _this.savePolygonCurrentsPoint = _this.currentsPoint;
                                    // 给边框的坐标赋值
                                    var outlinePositions = [].concat(_this.currentsPoint);
                                    outlinePositions.push(_this.currentsPoint[0]); // 将第一个点添加到边框坐标中，让边框闭合
                                    _this.savePolylineCurrentsPoint = outlinePositions;
                                    _this.plot.draw.shapeDic[_this.objId] = _this.savePolygonCurrentsPoint;
                                }
                            }
                            if (_this.pointDragged.id.shapeType == "Rectangle") {
                                var storePoint = {};
                                _this.rectanglePoint = [];
                                var cartographic_start = Cesium.Cartographic.fromCartesian(startPosition);
                                var longitude_start = Cesium.Math.toDegrees(cartographic_start.longitude);
                                var latitude_start = Cesium.Math.toDegrees(cartographic_start.latitude);
                                var height_start = cartographic_start.height;
                                var cartographic_end = Cesium.Cartographic.fromCartesian(endPosition);
                                var longitude_end = Cesium.Math.toDegrees(cartographic_end.longitude);
                                var latitude_end = Cesium.Math.toDegrees(cartographic_end.latitude);
                                var height_end = cartographic_end.height;
                                var changer_lng = longitude_end - longitude_start;
                                var changer_lat = latitude_end - latitude_start;
                                _this.rectanglePreviousCoordinates.west = Cesium.Math.toRadians(Cesium.Math.toDegrees(_this.rectanglePreviousCoordinates.west) +
                                    changer_lng);
                                _this.rectanglePreviousCoordinates.east = Cesium.Math.toRadians(Cesium.Math.toDegrees(_this.rectanglePreviousCoordinates.east) +
                                    changer_lng);
                                _this.rectanglePreviousCoordinates.south = Cesium.Math.toRadians(Cesium.Math.toDegrees(_this.rectanglePreviousCoordinates.south) +
                                    changer_lat);
                                _this.rectanglePreviousCoordinates.north = Cesium.Math.toRadians(Cesium.Math.toDegrees(_this.rectanglePreviousCoordinates.north) +
                                    changer_lat);
                                storePoint = _this.rectanglePreviousCoordinates;
                                _this.saveRectangleCurrentsPoint = storePoint;
                                for (var i = 0; i < _this.rectanglePosition.length; i++) {
                                    //与之前的算差 替换掉
                                    _this.rectanglePosition[i].x += changed_x;
                                    _this.rectanglePosition[i].y += changed_y;
                                    _this.rectanglePosition[i].z += changed_z;
                                    _this.rectanglePoint.push(_this.rectanglePosition[i]);
                                }
                                _this.obj.rectanglePosition = _this.rectanglePoint;
                                _this.plot.draw.shapeDic[_this.objId] = _this.rectanglePoint;
                                // 给边框的坐标赋值
                                var rect = Cesium.Rectangle.fromCartesianArray(_this.rectanglePoint);
                                var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north];
                                _this.savePolylineCurrentsPoint = Cesium.Cartesian3.fromRadiansArray(arr);
                            }
                            if (_this.pointDragged.id.shapeType == "Circle") {
                                _this.currentsPoint = [];
                                for (var i = 0; i < _this.ellipsePreviousCoordinates.length; i++) {
                                    //与之前的算差 替换掉
                                    _this.ellipsePreviousCoordinates[i].x += changed_x;
                                    _this.ellipsePreviousCoordinates[i].y += changed_y;
                                    _this.ellipsePreviousCoordinates[i].z += changed_z;
                                    _this.currentsPoint.push(_this.ellipsePreviousCoordinates[i]);
                                }
                                _this.saveCircleCurrentsPoint = _this.currentsPoint;
                                // 给边框的坐标赋值
                                // this.savePolylineCurrentsPoint = this.plot.plotTracker.circleDrawer._computeCirclePolygon(this.saveCircleCurrentsPoint);
                                // 给边框的坐标赋值
                                var outlinePositions = [].concat(_this.currentsPoint);
                                outlinePositions.push(_this.currentsPoint[0]); // 将第一个点添加到边框坐标中，让边框闭合
                                _this.savePolylineCurrentsPoint = outlinePositions;
                                _this.plot.draw.shapeDic[_this.objId] = CesiumMethod._computeCirclePolygon(_this.savePolylineCurrentsPoint);
                            }
                        }
                    }
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // TODO 右键取消移动，图形返回原来的位置
        // this.moveHandler.setInputAction((movement: any) => {
        //   this.moveHandler.destroy();
        //   this.viewer.scene.screenSpaceCameraController.enableRotate = true; //解锁相机
        // }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        return new Promise(function (resolve, reject) {
            var timeId = setInterval(function () {
                if (isClickConfirm) {
                    clearInterval(timeId);
                    var entity = null;
                    if (currentEntityId && currentEntityId.length > 0) {
                        entity = _this.viewer.entities.getById(currentEntityId);
                        resolve(entity);
                    }
                    else {
                        reject();
                    }
                }
            }, 100);
        });
    };
    PlotMoveDrawer.prototype.clickPolygon = function (pointDragged) {
        var _this = this;
        this.polygonPreviousCoordinates = pointDragged.id.polygon.hierarchy.getValue();
        // 获取图形坐标
        this.savePolygonCurrentsPoint = pointDragged.id.polygon.hierarchy.getValue().positions;
        // 点击图形进入移动状态，动态改变图形坐标
        pointDragged.id.polygon.hierarchy = new Cesium.CallbackProperty(function (time, result) {
            return new Cesium.PolygonHierarchy(_this.savePolygonCurrentsPoint);
        }, false);
        this.polylinePreviousCoordinates = pointDragged.id.polyline.positions.getValue();
        this.savePolylineCurrentsPoint = pointDragged.id.polyline.positions.getValue();
        pointDragged.id.polyline.positions = new Cesium.CallbackProperty(function () {
            return _this.savePolylineCurrentsPoint;
        }, false);
    };
    PlotMoveDrawer.prototype.clickPolyline = function (pointDragged) {
        var _this = this;
        this.polylinePreviousCoordinates = pointDragged.id.polyline.positions.getValue();
        this.savePolylineCurrentsPoint = pointDragged.id.polyline.positions.getValue();
        pointDragged.id.polyline.positions = new Cesium.CallbackProperty(function () {
            return _this.savePolylineCurrentsPoint;
        }, false);
    };
    PlotMoveDrawer.prototype.clickRectangle = function (pointDragged) {
        var _this = this;
        this.rectanglePreviousCoordinates = pointDragged.id.rectangle.coordinates.getValue();
        this.rectanglePosition = pointDragged.id.rectanglePosition;
        this.saveRectangleCurrentsPoint = pointDragged.id.rectangle.coordinates.getValue();
        pointDragged.id.rectangle.coordinates = new Cesium.CallbackProperty(function () {
            return _this.saveRectangleCurrentsPoint;
        }, false);
        this.polylinePreviousCoordinates = pointDragged.id.polyline.positions.getValue();
        this.savePolylineCurrentsPoint = pointDragged.id.polyline.positions.getValue();
        pointDragged.id.polyline.positions = new Cesium.CallbackProperty(function () {
            return _this.savePolylineCurrentsPoint;
        }, false);
    };
    PlotMoveDrawer.prototype.clickCircle = function (pointDragged) {
        var _this = this;
        this.ellipsePreviousCoordinates = pointDragged.id.circlePosition;
        this.saveCircleCurrentsPoint = pointDragged.id.circlePosition;
        pointDragged.id.position = new Cesium.CallbackProperty(function () {
            return _this.saveCircleCurrentsPoint[0];
        }, false);
        pointDragged.id.polyline.positions = new Cesium.CallbackProperty(function () {
            return CesiumMethod._computeCirclePolygon(_this.savePolylineCurrentsPoint);
        }, false);
        // this.polylinePreviousCoordinates = this.circleOutlineEntity.polyline.positions.getValue();
        // this.savePolylineCurrentsPoint = this.circleOutlineEntity.polyline.positions.getValue();
        // this.circleOutlineEntity.polyline.positions = new Cesium.CallbackProperty(() => {
        //   return this.savePolylineCurrentsPoint;
        // }, false);
    };
    PlotMoveDrawer.prototype.clickPoint = function (pointDragged) {
        var _this = this;
        this.pointPreviousCoordinates = pointDragged.id.position.getValue(new Cesium.JulianDate());
        this.savePointCurrentsPoint = pointDragged.id.position.getValue(new Cesium.JulianDate());
        pointDragged.id.position = new Cesium.CallbackProperty(function () {
            return _this.savePointCurrentsPoint;
        }, false);
    };
    PlotMoveDrawer.prototype.clickBufferLine = function (pointDragged) {
        var _this = this;
        this.bufferLinePreviousCoordinates = pointDragged.id.polyline.positions.getValue();
        this.saveBufferLineCurrentsPoint = pointDragged.id.polyline.positions.getValue();
        pointDragged.id.polyline.positions = new Cesium.CallbackProperty(function () {
            return _this.saveBufferLineCurrentsPoint;
        }, false);
    };
    PlotMoveDrawer.prototype.clickStraightArrow = function (pointDragged) {
        var _this = this;
        this.straightArrowCoordinates = pointDragged.id.polygon.hierarchy.getValue();
        this.saveStraightArrowCurrentsPoint = pointDragged.id.polygon.hierarchy.getValue().positions;
        pointDragged.id.polygon.hierarchy = new Cesium.CallbackProperty(function () {
            return new Cesium.PolygonHierarchy(_this.saveStraightArrowCurrentsPoint);
        }, false);
        pointDragged.id.polyline.positions = new Cesium.CallbackProperty(function () {
            return _this.saveStraightArrowCurrentsPoint;
        }, false);
    };
    PlotMoveDrawer.prototype.clickAttackArrow = function (pointDragged) {
        var _this = this;
        this.attackArrowCoordinates = pointDragged.id.polygon.hierarchy.getValue();
        this.attackPoints = this.plot.draw.shapeDic[this.objId].custom;
        for (var i = 0; i < this.attackPoints.length; i++) {
            this.attackPointsCart.push(Cesium.Cartesian3.fromDegrees(this.attackPoints[i][0], this.attackPoints[i][1]));
        }
        this.saveAttackArrowCurrentsPoint = pointDragged.id.polygon.hierarchy.getValue().positions;
        pointDragged.id.polygon.hierarchy = new Cesium.CallbackProperty(function () {
            return new Cesium.PolygonHierarchy(_this.saveAttackArrowCurrentsPoint);
        }, false);
        pointDragged.id.polyline.positions = new Cesium.CallbackProperty(function () {
            return _this.saveAttackArrowCurrentsPoint;
        }, false);
    };
    PlotMoveDrawer.prototype.clickPincerArrow = function (pointDragged) {
        var _this = this;
        this.pincerArrowCoordinates = pointDragged.id.polygon.hierarchy.getValue();
        this.pincerPoints = this.plot.draw.shapeDic[this.objId].custom;
        for (var i = 0; i < this.pincerPoints.length; i++) {
            this.pincerPointsCart.push(Cesium.Cartesian3.fromDegrees(this.pincerPoints[i][0], this.pincerPoints[i][1]));
        }
        this.savePincerArrowCurrentsPoint = pointDragged.id.polygon.hierarchy.getValue().positions;
        pointDragged.id.polygon.hierarchy = new Cesium.CallbackProperty(function () {
            return new Cesium.PolygonHierarchy(_this.savePincerArrowCurrentsPoint);
        }, false);
        pointDragged.id.polyline.positions = new Cesium.CallbackProperty(function () {
            return _this.savePincerArrowCurrentsPoint;
        }, false);
    };
    PlotMoveDrawer.prototype.confirmClick = function () {
        this.viewer.scene.screenSpaceCameraController.enableRotate = true; //解锁相机
        // console.log(("解锁相机"));
        if (!this.pointDragged) {
            return;
        }
        if (!this.obj) {
            return;
        }
        switch (this.obj.shapeType) {
            case "Point":
                this.obj.position = this.savePointCurrentsPoint;
                break;
            case "Polygon":
                this.obj.polygon.hierarchy = this.savePolygonCurrentsPoint;
                this.obj.polyline.positions = this.savePolylineCurrentsPoint;
                break;
            case "Polyline":
                this.obj.polyline.positions = this.savePolylineCurrentsPoint;
                break;
            case "Rectangle":
                this.obj.rectangle.coordinates = this.saveRectangleCurrentsPoint;
                this.obj.polyline.positions = this.savePolylineCurrentsPoint;
                break;
            case "Circle":
                this.obj.position = this.saveCircleCurrentsPoint[0];
                // this.circleOutlineEntity.polyline.positions = this.savePolylineCurrentsPoint;
                this.obj.polyline.positions = CesiumMethod._computeCirclePolygon(this.savePolylineCurrentsPoint);
                break;
            case "BufferLine":
                this.obj.polyline.positions = this.saveBufferLineCurrentsPoint;
                break;
            case "StraightArrow":
                this.obj.polygon.hierarchy = new Cesium.PolygonHierarchy(this.saveStraightArrowCurrentsPoint);
                this.obj.polyline.positions = this.saveStraightArrowCurrentsPoint;
                break;
            case "AttackArrow":
                this.obj.polygon.hierarchy = new Cesium.PolygonHierarchy(this.saveAttackArrowCurrentsPoint);
                this.obj.polyline.positions = this.saveAttackArrowCurrentsPoint;
                break;
            case "PincerArrow":
                this.obj.polygon.hierarchy = new Cesium.PolygonHierarchy(this.savePincerArrowCurrentsPoint);
                this.obj.polyline.positions = this.savePincerArrowCurrentsPoint;
                break;
            default:
                break;
        }
        this.currentsPoint = undefined;
        this.pointDragged = undefined;
        this.obj = undefined;
        this.savePolygonCurrentsPoint = undefined;
        this.savePolylineCurrentsPoint = [];
        this.saveRectangleCurrentsPoint = [];
        this.saveCircleCurrentsPoint = [];
        this.saveBufferLineCurrentsPoint = [];
        this.saveStraightArrowCurrentsPoint = [];
        this.saveAttackArrowCurrentsPoint = [];
        this.savePincerArrowCurrentsPoint = [];
        this.polygonPreviousCoordinates = undefined;
        this.circleOutlineEntity = null;
        this.clear();
    };
    PlotMoveDrawer.prototype.getEntityByObjId = function (objId) {
        var entityList = this.viewer.entities.values;
        if (entityList == null || entityList.length < 1) {
            return;
        }
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId == this.plot.draw.layerId && entity.objId == objId && entity.shapeType == "CircleOutline") {
                return entity;
            }
        }
    };
    return PlotMoveDrawer;
}());
export default PlotMoveDrawer;
