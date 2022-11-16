import * as Cesium from "cesium";
import PlotTracker from "./PlotTracker";
import PlotMoveDrawer from "./PlotMoveDrawer";
var Plot = /** @class */ (function () {
    function Plot(viewer) {
        this.draw = {
            flag: 0,
            layerId: "globeDrawerDemoLayer",
            shape: [],
            shapeDic: {}
        };
        this._editParams = {
            objId: "",
            isEdit: false,
            shapeType: ""
        };
        this._shapeTypes = ["Polygon", "Polyline", "Rectangle", "Circle", "Point", "BufferLine", "StraightArrow", "AttackArrow", "PincerArrow"];
        this.viewer = viewer;
        this.plotTracker = new PlotTracker(this.viewer);
        this.moveDrawer = new PlotMoveDrawer(this.viewer, this);
        this.bindGloveEvent();
    }
    Plot.prototype.bindGloveEvent = function () {
        var _this_1 = this;
        var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        handler.setInputAction(function (movement) {
            var pick = _this_1.viewer.scene.pick(movement.position);
            if (!pick) {
                return;
            }
            var obj = pick.id;
            if (!obj || !obj.layerId || _this_1.draw.flag == 0) {
                return;
            }
            var objId = obj.objId;
            //flag为编辑或删除标识,1为编辑，2为删除
            if (_this_1.draw.flag == 1 && _this_1._shapeTypes.indexOf(obj.shapeType) > -1) {
                _this_1.draw.flag = 0;
                _this_1._editParams = {
                    objId: objId,
                    isEdit: true,
                    shapeType: obj.shapeType
                };
            }
            else if (_this_1.draw.flag == 2) {
                _this_1.clearEntityById(objId);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };
    Plot.prototype.moveShape = function () {
        this.plotTracker.clear();
        return this.moveDrawer.moveShape();
    };
    Plot.prototype.editShape = function () {
        var _this_1 = this;
        // TODO 编辑图形时使用自定义弹窗
        this.draw.flag = 1;
        //清除标绘状态
        this.plotTracker.clear();
        return new Promise(function (resolve, reject) {
            var timeId = setInterval(function () {
                if (_this_1._editParams.isEdit) {
                    clearInterval(timeId);
                    // @ts-ignore
                    _this_1["edit".concat(_this_1._editParams.shapeType)](_this_1._editParams.objId).then(function (res) {
                        _this_1._editParams.isEdit = false;
                        resolve(res);
                    }).catch(function () {
                        _this_1._editParams.isEdit = false;
                        reject();
                    });
                }
            }, 100);
        });
    };
    Plot.prototype.drawPoint = function (options) {
        var _this_1 = this;
        this.draw.flag = 0;
        var objId = (new Date()).getTime() + "";
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.trackPoint(options).then(function (position) {
                _this_1.draw.shapeDic[objId] = position;
                var entity = _this_1.createPoint(position, objId);
                resolve({ position: position, entity: entity });
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    Plot.prototype.showPoint = function (options) {
        var position = options.position, objId = options.objId;
        var entity = this.createPoint(position, objId);
        return { position: position, entity: entity };
    };
    Plot.prototype.createPoint = function (position, objId) {
        var entity = this.viewer.entities.add({
            layerId: this.draw.layerId,
            objId: objId,
            shapeType: "Point",
            position: position,
            billboard: {
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABjUlEQVQ4T5WTO0gDQRCG598TUohgLqUIChcSEBsfjQ9MEWvtFDs7E+0tUllaa5JSECzstLdI46NQGxESc2JELBMLCxEuO86dXkhiAndX7c3O/PvPzregHl+sWBlpOioOQyXdbW7qsjGgq/VM4r07Hd0Bs2gfMfMkgT6hKcKAI0nfTBwF8NDIWJvtNR0CZsF+kcSaBFO9nEnskQiDjaw17u+3BKKF6q38TPcp7Agz0d1HNj7jBj2BWNHeF9sLspwLIiA5p9LOaz1j7cLM26Ni+wygqYDFXhoz3YOwCvPwaRkKObG1FEZAzF+S1nuI5e0dDV6XXubDCdANGCeIFp63xNAGiBdDCTBdM9Qxhg+qKWUgJyLpMAIMKrFD0oJQp1mdBx2hf4g7SgW94o3RpU+udVaWE0FcSHFJxlhzqWyB5FIobYwFEZAJ1HwaO1D+o9EWkbU+QldyesSnsEVie7JLpdacFotf4siQgqYicjTTkFK4cOlrz//3Gr07ETqJdRJQiV/qdIWgyo1t663b2Q/kAI6uzOBy0gAAAABJRU5ErkJggg==",
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                clampToGround: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
            },
            clampToGround: true
        });
        this.draw.shape.push(entity);
        return entity;
    };
    Plot.prototype.editPoint = function (objId) {
        var _this_1 = this;
        var position = this.draw.shapeDic[objId];
        var oldPosition = JSON.parse(JSON.stringify(position));
        //先移除entity
        this.clearEntityById(objId);
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.pointDrawer.showModifyPoint({ position: position }).then(function (position) {
                _this_1.draw.shapeDic[objId] = position;
                var res = _this_1.showPoint({ position: position, objId: objId });
                resolve(res);
            }).catch(function () {
                _this_1.draw.shapeDic[objId] = oldPosition;
                var res = _this_1.showPoint({ position: oldPosition, objId: objId });
                reject(res);
            });
        });
    };
    Plot.prototype.drawPolyline = function (options) {
        var _this_1 = this;
        this.draw.flag = 0;
        var objId = (new Date()).getTime() + "";
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.trackPolyline(options).then(function (positions) {
                _this_1.draw.shapeDic[objId] = positions;
                var entity = _this_1.createPolyline(positions, objId);
                resolve({ positions: positions, entity: entity });
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    Plot.prototype.showPolyline = function (options) {
        var positions = options.positions, objId = options.objId;
        var entity = this.createPolyline(positions, objId);
        return { positions: positions, entity: entity };
    };
    Plot.prototype.createPolyline = function (positions, objId) {
        var material = new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)")
        });
        var bData = {
            name: "折线",
            layerId: this.draw.layerId,
            objId: objId,
            shapeType: "Polyline",
            polyline: {
                positions: positions,
                clampToGround: true,
                width: 8,
                material: material
            }
        };
        var entity = this.viewer.entities.add(bData);
        this.draw.shape.push(entity);
        return entity;
    };
    Plot.prototype.editPolyline = function (objId) {
        var _this_1 = this;
        var positions = this.draw.shapeDic[objId];
        var oldPositions = JSON.parse(JSON.stringify(positions));
        //先移除entity
        this.clearEntityById(objId);
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.polylineDrawer.showModifyPolyline({ positions: positions }).then(function (positions) {
                _this_1.draw.shapeDic[objId] = positions;
                var res = _this_1.showPolyline({ positions: positions, objId: objId });
                resolve(res);
            }).catch(function () {
                _this_1.draw.shapeDic[objId] = oldPositions;
                var res = _this_1.showPolyline({ positions: oldPositions, objId: objId });
                reject(res);
            });
        });
    };
    Plot.prototype.drawPolygon = function (options) {
        var _this_1 = this;
        this.draw.flag = 0;
        var objId = (new Date()).getTime() + "";
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.trackPolygon(options).then(function (positions) {
                console.log(positions);
                _this_1.draw.shapeDic[objId] = positions;
                var entity = _this_1.createPolygon(positions, objId);
                resolve({ positions: positions, entity: entity });
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    Plot.prototype.showPolygon = function (options) {
        var positions = options.positions, objId = options.objId;
        var entity = this.createPolygon(positions, objId);
        return { positions: positions, entity: entity };
    };
    Plot.prototype.createPolygon = function (positions, objId) {
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
        });
        // @ts-ignore
        var outlinePositions = [].concat(positions);
        // @ts-ignore
        outlinePositions.push(positions[0]);
        var bData = {
            layerId: this.draw.layerId,
            objId: objId,
            shapeType: "Polygon",
            cType: "plot",
            polyline: {
                positions: outlinePositions,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            },
            polygon: {
                hierarchy: positions,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                asynchronous: false,
                material: Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)")
            }
        };
        var entity = this.viewer.entities.add(bData);
        this.draw.shape.push(entity);
        return entity;
    };
    Plot.prototype.editPolygon = function (objId) {
        var _this_1 = this;
        var positions = this.draw.shapeDic[objId];
        var oldPositions = JSON.parse(JSON.stringify(positions));
        //先移除entity
        this.clearEntityById(objId);
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.polygonDrawer.showModifyPolygon({ positions: positions }).then(function (positions) {
                console.log(positions);
                _this_1.draw.shapeDic[objId] = positions;
                var res = _this_1.showPolygon({ positions: positions, objId: objId });
                resolve(res);
            }).catch(function () {
                _this_1.draw.shapeDic[objId] = oldPositions;
                var res = _this_1.showPolygon({ positions: oldPositions, objId: objId });
                reject(res);
            });
        });
    };
    Plot.prototype.drawRectangle = function (options) {
        var _this_1 = this;
        this.draw.flag = 0;
        var objId = (new Date()).getTime() + "";
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.trackRectangle(options).then(function (positions) {
                console.log(positions);
                _this_1.draw.shapeDic[objId] = positions;
                var entity = _this_1.createRectangle(positions, objId);
                resolve({ positions: positions, entity: entity });
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    Plot.prototype.showRectangle = function (options) {
        var positions = options.positions, objId = options.objId;
        var entity = this.createRectangle(positions, objId);
        return { positions: positions, entity: entity };
    };
    Plot.prototype.createRectangle = function (positions, objId) {
        var material = new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)"));
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
        });
        var rect = Cesium.Rectangle.fromCartesianArray(positions);
        var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west,
            rect.north
        ];
        var outlinePositions = Cesium.Cartesian3.fromRadiansArray(arr);
        var bData = {
            rectanglePosition: positions,
            layerId: this.draw.layerId,
            objId: objId,
            shapeType: "Rectangle",
            polyline: {
                positions: outlinePositions,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            },
            rectangle: {
                coordinates: rect,
                material: material
            }
        };
        var entity = this.viewer.entities.add(bData);
        this.draw.shape.push(entity);
        return entity;
    };
    Plot.prototype.editRectangle = function (objId) {
        var _this_1 = this;
        var positions = this.draw.shapeDic[objId];
        var oldPositions = JSON.parse(JSON.stringify(positions));
        //先移除entity
        this.clearEntityById(objId);
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.rectangleDrawer.showModifyRectangle({ positions: positions }).then(function (positions) {
                console.log(positions);
                _this_1.draw.shapeDic[objId] = positions;
                var res = _this_1.showRectangle({ positions: positions, objId: objId });
                resolve(res);
            }).catch(function () {
                _this_1.draw.shapeDic[objId] = oldPositions;
                var res = _this_1.showRectangle({ positions: oldPositions, objId: objId });
                reject(res);
            });
        });
    };
    Plot.prototype.drawCircle = function (options) {
        var _this_1 = this;
        this.draw.flag = 0;
        var objId = (new Date()).getTime() + "";
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.trackCircle(options).then(function (positions) {
                console.log(positions);
                _this_1.draw.shapeDic[objId] = positions;
                var entity = _this_1.createCircle(positions, objId);
                resolve({ positions: positions, entity: entity });
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    Plot.prototype.showCircle = function (options) {
        var positions = options.positions, objId = options.objId;
        var entity = this.createCircle(positions, objId);
        return { positions: positions, entity: entity };
    };
    Plot.prototype.createCircle = function (positions, objId) {
        var distance = 0;
        for (var i = 0; i < positions.length - 1; i++) {
            var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
            var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
            /**根据经纬度计算出距离**/
            var geodesic = new Cesium.EllipsoidGeodesic();
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            var s = geodesic.surfaceDistance;
            //返回两点之间的距离
            //			s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            s = Math.abs(point2cartographic.height - point1cartographic.height);
            distance = distance + s;
        }
        var material = Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)");
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
        });
        var radiusMaterial = new Cesium.PolylineGlowMaterialProperty({
            // @ts-ignore
            dashLength: 16,
            color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
        });
        var pnts = this.plotTracker.circleDrawer._computeCirclePolygon(positions);
        var dis = this.plotTracker.circleDrawer._computeCircleRadius3D(positions);
        // dis = (dis / 1000).toFixed(3);
        var value = typeof positions.getValue === "function" ? positions.getValue(0) : positions;
        var text = dis + "km";
        var r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2));
        // var r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2));
        var bData = {
            circlePosition: positions,
            layerId: this.draw.layerId,
            objId: objId,
            shapeType: "Circle",
            position: positions[0],
            ellipse: {
                semiMajorAxis: dis ? dis : dis + 1,
                semiMinorAxis: dis ? dis : dis + 1,
                material: material
            },
            polyline: {
                positions: pnts,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            }
        };
        var entity = this.viewer.entities.add(bData);
        this.draw.shape.push(entity);
        return entity;
    };
    Plot.prototype.editCircle = function (objId) {
        var _this_1 = this;
        var positions = this.draw.shapeDic[objId];
        var oldPositions = JSON.parse(JSON.stringify(positions));
        //先移除entity
        this.clearEntityById(objId);
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.circleDrawer.showModifyCircle({ positions: positions }).then(function (positions) {
                console.log(positions);
                _this_1.draw.shapeDic[objId] = positions;
                var res = _this_1.showCircle({ positions: positions, objId: objId });
                resolve(res);
            }).catch(function () {
                _this_1.draw.shapeDic[objId] = oldPositions;
                var res = _this_1.showCircle({ positions: oldPositions, objId: objId });
                reject(res);
            });
        });
    };
    Plot.prototype.drawAttackArrow = function (options) {
        var _this_1 = this;
        this.draw.flag = 0;
        var objId = (new Date()).getTime() + "";
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.trackAttackArrow(options).then(function (data) {
                _this_1.draw.shapeDic[objId] = {
                    custom: data.custom,
                    positions: data.positions
                };
                var entity = _this_1.createAttackArrow(data.positions, objId);
                resolve({ data: data, entity: entity });
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    Plot.prototype.showAttackArrow = function (options) {
        var positions = options.positions, objId = options.objId;
        var entity = this.createAttackArrow(positions, objId);
        return { positions: positions, entity: entity };
    };
    Plot.prototype.createAttackArrow = function (positions, objId) {
        var material = Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)");
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
        });
        var outlinePositions = [].concat(positions);
        outlinePositions.push(positions[0]);
        var bData = {
            layerId: this.draw.layerId,
            objId: objId,
            shapeType: "AttackArrow",
            polyline: {
                positions: outlinePositions,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            },
            polygon: new Cesium.PolygonGraphics({
                hierarchy: positions,
                // @ts-ignore
                asynchronous: false,
                material: material
            })
        };
        var entity = this.viewer.entities.add(bData);
        this.draw.shape.push(entity);
        return entity;
    };
    Plot.prototype.editAttackArrow = function (objId) {
        var _this_1 = this;
        var data = this.draw.shapeDic[objId];
        var oldData = JSON.parse(JSON.stringify(data));
        //先移除entity
        this.clearEntityById(objId);
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.attackArrowDrawer.showModifyAttackArrow({ custom: data.custom }).then(function (data) {
                //保存编辑结果
                _this_1.draw.shapeDic[objId] = {
                    custom: data.custom,
                    positions: data.positions
                };
                var res = _this_1.showAttackArrow({ positions: data.positions, objId: objId });
                resolve(res);
            }).catch(function () {
                //保存编辑结果
                _this_1.draw.shapeDic[objId] = {
                    custom: oldData.custom,
                    positions: oldData.positions
                };
                var res = _this_1.showAttackArrow({ positions: oldData.positions, objId: objId });
                reject(res);
            });
        });
    };
    Plot.prototype.drawPincerArrow = function (options) {
        var _this_1 = this;
        this.draw.flag = 0;
        var objId = (new Date()).getTime() + "";
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.trackPincerArrow(options).then(function (data) {
                _this_1.draw.shapeDic[objId] = {
                    custom: data.custom,
                    positions: data.positions
                };
                var entity = _this_1.createPincerArrow(data.positions, objId);
                resolve({ data: data, entity: entity });
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    Plot.prototype.showPincerArrow = function (options) {
        var positions = options.positions, objId = options.objId;
        var entity = this.createPincerArrow(positions, objId);
        return { positions: positions, entity: entity };
    };
    Plot.prototype.createPincerArrow = function (positions, objId) {
        var material = Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)");
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
        });
        var outlinePositions = [].concat(positions);
        outlinePositions.push(positions[0]);
        var bData = {
            layerId: this.draw.layerId,
            objId: objId,
            shapeType: "PincerArrow",
            polyline: {
                positions: outlinePositions,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            },
            polygon: new Cesium.PolygonGraphics({
                hierarchy: positions,
                // @ts-ignore
                asynchronous: false,
                material: material
            })
        };
        var entity = this.viewer.entities.add(bData);
        this.draw.shape.push(entity);
        return entity;
    };
    Plot.prototype.editPincerArrow = function (objId) {
        var _this_1 = this;
        var data = this.draw.shapeDic[objId];
        var oldData = JSON.parse(JSON.stringify(data));
        //先移除entity
        this.clearEntityById(objId);
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.pincerArrowDrawer.showModifyPincerArrow({ custom: data.custom }).then(function (data) {
                //保存编辑结果
                _this_1.draw.shapeDic[objId] = {
                    custom: data.custom,
                    positions: data.positions
                };
                var res = _this_1.showPincerArrow({ positions: data.positions, objId: objId });
                resolve(res);
            }).catch(function () {
                //保存编辑结果
                _this_1.draw.shapeDic[objId] = {
                    custom: oldData.custom,
                    positions: oldData.positions
                };
                var res = _this_1.showPincerArrow({ positions: oldData.positions, objId: objId });
                reject(res);
            });
        });
    };
    Plot.prototype.drawStraightArrow = function (options) {
        var _this_1 = this;
        this.draw.flag = 0;
        var objId = (new Date()).getTime() + "";
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.trackStraightArrow(options).then(function (positions) {
                _this_1.draw.shapeDic[objId] = {
                    positions: positions
                };
                var entity = _this_1.createStraightArrow(positions, objId);
                resolve({ positions: positions, entity: entity });
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    Plot.prototype.showStraightArrow = function (options) {
        var positions = options.positions, objId = options.objId;
        var entity = this.createStraightArrow(positions, objId);
        return { positions: positions, entity: entity };
    };
    Plot.prototype.createStraightArrow = function (positions, objId) {
        var material = Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)");
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString("rgb(210,215,68)")
        });
        var outlinePositions = [].concat(positions);
        outlinePositions.push(positions[0]);
        var bData = {
            layerId: this.draw.layerId,
            objId: objId,
            shapeType: "StraightArrow",
            polyline: {
                positions: outlinePositions,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            },
            polygon: new Cesium.PolygonGraphics({
                hierarchy: positions,
                // @ts-ignore
                asynchronous: false,
                material: material
            })
        };
        var entity = this.viewer.entities.add(bData);
        this.draw.shape.push(entity);
        return entity;
    };
    Plot.prototype.editStraightArrow = function (objId) {
        var _this_1 = this;
        var positions = this.draw.shapeDic[objId].positions;
        var oldPositions = JSON.parse(JSON.stringify(positions));
        //先移除entity
        this.clearEntityById(objId);
        return new Promise(function (resolve, reject) {
            _this_1.plotTracker.straightArrowDrawer.showModifyStraightArrow({ positions: positions }).then(function (positions) {
                //保存编辑结果
                _this_1.draw.shapeDic[objId] = {
                    positions: positions
                };
                var res = _this_1.showStraightArrow({ positions: positions, objId: objId });
                resolve(res);
            }).catch(function () {
                //保存编辑结果
                _this_1.draw.shapeDic[objId] = {
                    positions: oldPositions
                };
                var res = _this_1.showStraightArrow({ positions: oldPositions, objId: objId });
                reject(res);
            });
        });
    };
    Plot.prototype.clearEntityById = function (objId) {
        var _this = this;
        var entityList = _this.viewer.entities.values;
        if (entityList == null || entityList.length < 1) {
            return;
        }
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId === _this.draw.layerId && entity.objId === objId) {
                _this.viewer.entities.remove(entity);
                i--;
            }
        }
    };
    Plot.prototype.getEntity = function (objId) {
        var _this = this;
        var entityList = _this.viewer.entities.values;
        if (entityList == null || entityList.length < 1) {
            return;
        }
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId === _this.draw.layerId && entity.objId === objId) {
                i--;
                return entity;
            }
        }
    };
    return Plot;
}());
export default Plot;
