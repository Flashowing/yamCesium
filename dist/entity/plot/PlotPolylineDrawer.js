import PlotToolTip from "./PlotToolTip";
import * as Cesium from "cesium";
import layer from "../../plugins/lib/layer/Layer";
var PlotPolylineDrawer = /** @class */ (function () {
    function PlotPolylineDrawer(viewer) {
        this.viewer = null;
        this.scene = null;
        this.clock = null;
        this.canvas = null;
        this.camera = null;
        this.ellipsoid = null;
        this.tooltip = null;
        this.entity = null;
        this.positions = [];
        this.tempPositions = [];
        this.drawHandler = null;
        this.modifyHandler = null;
        this.okHandler = null;
        this.cancelHandler = null;
        this.dragIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAA+0lEQVQoU2NkQALX5VjTGBkYXYBCllDh40B6k8ajX0tgyhhhjBtybKuAHAUGhv9T/zExHwSJM/37a8/AwJj9n4HhAVBTGEgMrAGq+Kr6o1+NN2TY9BgZ/9v8Z2L4wfiP4bL649+nb8qx1QM1+QI1mTBCnZEA5FhBJRqQnQk0sQFskBzbpv8M/7cwAhmLGP7/Pw6UOPOfkfEUsmI4+x+DPgPjf2sGRkZLkIb7LP8YXf8w/7Nj+M84F5sGxv//s5n/M+36w/R/N1kaSHMS1NM+QE/7EfD0MaCnF8CC9QyQsZlAsGqD4oK8iEOK7Rgg2w85aQCdsUfz0e9ZMDUAG9CXv0chMrwAAAAASUVORK5CYII=";
        this.dragIconLight = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABjUlEQVQ4T5WTO0gDQRCG598TUohgLqUIChcSEBsfjQ9MEWvtFDs7E+0tUllaa5JSECzstLdI46NQGxESc2JELBMLCxEuO86dXkhiAndX7c3O/PvPzregHl+sWBlpOioOQyXdbW7qsjGgq/VM4r07Hd0Bs2gfMfMkgT6hKcKAI0nfTBwF8NDIWJvtNR0CZsF+kcSaBFO9nEnskQiDjaw17u+3BKKF6q38TPcp7Agz0d1HNj7jBj2BWNHeF9sLspwLIiA5p9LOaz1j7cLM26Ni+wygqYDFXhoz3YOwCvPwaRkKObG1FEZAzF+S1nuI5e0dDV6XXubDCdANGCeIFp63xNAGiBdDCTBdM9Qxhg+qKWUgJyLpMAIMKrFD0oJQp1mdBx2hf4g7SgW94o3RpU+udVaWE0FcSHFJxlhzqWyB5FIobYwFEZAJ1HwaO1D+o9EWkbU+QldyesSnsEVie7JLpdacFotf4siQgqYicjTTkFK4cOlrz//3Gr07ETqJdRJQiV/qdIWgyo1t663b2Q/kAI6uzOBy0gAAAABJRU5ErkJggg==";
        this.material = null;
        this.toolBarIndex = null;
        this.markers = {};
        this.layerId = "globeDrawerLayer";
        this.width = 8;
        this.params = {};
        this.shapeName = "折线";
        this.floatingPoint = null;
        this.isClickConfirm = false;
        this.viewer = viewer;
        this.scene = viewer.scene;
        this.clock = viewer.clock;
        this.canvas = viewer.scene.canvas;
        this.camera = viewer.scene.camera;
        this.ellipsoid = viewer.scene.globe.ellipsoid;
        this.tooltip = new PlotToolTip(viewer.container);
    }
    PlotPolylineDrawer.prototype.clear = function () {
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
        this._clearMarkers(this.layerId);
        this.tooltip.setVisible(false);
    };
    PlotPolylineDrawer.prototype.showModifyPolyline = function (options) {
        var _this_1 = this;
        this.positions = options.positions;
        this.isClickConfirm = false;
        this._showModifyPolyline2Map();
        // 如果自定义了确认按钮则显示自定义按钮
        return new Promise(function (resolve, reject) {
            if (options && options.confirmHandler) {
                // confirmHandler需返回一个promise事件
                options.confirmHandler().then(function () {
                    var positions = _this_1._getPositionsWithSid();
                    var lonLats = _this_1._getLonLats(positions);
                    _this_1.positions = positions;
                    resolve(_this_1.positions);
                    _this_1.clear();
                }).catch(function () {
                    _this_1.clear();
                    reject();
                });
            }
            else {
                _this_1._showToolBar().then(function () {
                    var positions = _this_1._getPositionsWithSid();
                    var lonLats = _this_1._getLonLats(positions);
                    _this_1.positions = positions;
                    resolve(_this_1.positions);
                    _this_1.clear();
                }).catch(function () {
                    _this_1.clear();
                    reject();
                });
            }
        });
        // return
    };
    PlotPolylineDrawer.prototype.startDrawPolyline = function (options) {
        var _this_1 = this;
        this.positions = options.positions || [];
        this.drawHandler = new Cesium.ScreenSpaceEventHandler(this.canvas);
        this.drawHandler.setInputAction(function (event) {
            var position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            var ray = _this_1.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this_1.scene.globe.pick(ray, _this_1.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            var num = _this_1.positions.length;
            if (num == 1) { // 原为 num == 0 因在移动事件中新增的一个点，所以等于1
                _this_1.positions.pop(); // 新增 将移动事件中的第一个点移除
                _this_1.positions.push(cartesian);
                _this_1.floatingPoint = _this_1._createPoint(cartesian, -1);
                _this_1._showPolyline2Map();
            }
            _this_1.positions.push(cartesian);
            var oid = _this_1.positions.length - 2;
            _this_1._createPoint(cartesian, oid);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.drawHandler.setInputAction(function (event) {
            var position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            var ray = _this_1.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this_1.scene.globe.pick(ray, _this_1.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (_this_1.positions.length <= 1) {
                _this_1.tooltip.showAt(position, "<p>选择起点</p>");
                _this_1.positions.pop();
                _this_1.positions.push(cartesian); //新增
                _this_1.viewer.entities.remove(_this_1.floatingPoint);
                _this_1.floatingPoint = _this_1._createPoint(cartesian, -1); //新增
                return;
            }
            // if (this.positions.length === 2) {
            //   this.positions.push(this.floatingPoint.position.getValue());
            // }
            var num = _this_1.positions.length;
            var tip = "<p>点击添加下一个点</p>";
            if (num > 2) {
                tip += "<p>右键结束绘制</p>";
            }
            _this_1.tooltip.showAt(position, tip);
            _this_1.floatingPoint.position.setValue(cartesian);
            _this_1.positions.pop();
            _this_1.positions.push(cartesian);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.drawHandler.setInputAction(function (movement) {
            if (_this_1.positions.length < 3) {
                return;
            }
            _this_1.positions.pop();
            _this_1.viewer.entities.remove(_this_1.floatingPoint);
            _this_1.tooltip.setVisible(false);
            //进入编辑状态
            _this_1.isClickConfirm = true;
            _this_1.clear();
            _this_1._showModifyPolyline2Map(); // 这句注释能够做到右键撤销上次绘制的线
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
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
                            var positions = _this_1._getPositionsWithSid();
                            var lonLats = _this_1._getLonLats(positions);
                            _this_1.positions = positions;
                            resolve(_this_1.positions);
                            _this_1.clear();
                        }).catch(function () {
                            _this_1.clear();
                            reject();
                        });
                    }
                    else {
                        _this_1._showToolBar().then(function () {
                            var positions = _this_1._getPositionsWithSid();
                            var lonLats = _this_1._getLonLats(positions);
                            _this_1.positions = positions;
                            resolve(_this_1.positions);
                            _this_1.clear();
                        }).catch(function () {
                            _this_1.clear();
                            reject();
                        });
                    }
                }
            }, 100);
        });
    };
    PlotPolylineDrawer.prototype._startModify = function () {
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
                _this.tempPositions[oid] = cartesian;
                _this.tooltip.setVisible(false);
                if (pickedAnchor.flag == "mid_anchor") {
                    _this._updateModifyAnchors(oid);
                }
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
                if (entity.layerId != _this.layerId) {
                    return;
                }
                if (entity.flag != "anchor" && entity.flag != "mid_anchor") {
                    return;
                }
                pickedAnchor = entity;
                isMoving = true;
                if (entity.flag == "anchor") {
                    _this.tooltip.showAt(position, "<p>移动控制点</p>");
                }
                if (entity.flag == "mid_anchor") {
                    _this.tooltip.showAt(position, "<p>移动创建新的控制点</p>");
                }
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
            var oid = pickedAnchor.oid;
            if (pickedAnchor.flag == "anchor") {
                pickedAnchor.position.setValue(cartesian);
                _this.tempPositions[oid] = cartesian;
                //左右两个中点
                _this._updateNewMidAnchors(oid);
            }
            else if (pickedAnchor.flag == "mid_anchor") {
                pickedAnchor.position.setValue(cartesian);
                _this.tempPositions[oid] = cartesian;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    };
    PlotPolylineDrawer.prototype._showPolyline2Map = function () {
        var _this = this;
        // if (_this.material == null) {
        _this.material = new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)")
        });
        // }
        var dynamicPositions = new Cesium.CallbackProperty(function () {
            return _this.positions;
        }, false);
        var bData = {
            polyline: {
                positions: dynamicPositions,
                clampToGround: true,
                width: _this.width,
                material: _this.material
            }
        };
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
    };
    PlotPolylineDrawer.prototype._showModifyPolyline2Map = function () {
        var _this = this;
        _this._startModify();
        _this._computeTempPositions();
        var dynamicPositions = new Cesium.CallbackProperty(function () {
            return _this.tempPositions;
        }, false);
        // if (_this.material == null) {
        _this.material = new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString("rgba(67,106,190,0.5)")
        });
        // }
        var bData = {
            polyline: {
                positions: dynamicPositions,
                clampToGround: true,
                width: _this.width,
                material: _this.material
            }
        };
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
        var positions = _this.tempPositions;
        for (var i = 0; i < positions.length; i++) {
            var ys = i % 2;
            if (ys == 0) {
                _this._createPoint(positions[i], i);
            }
            else {
                _this._createMidPoint(positions[i], i);
            }
        }
    };
    PlotPolylineDrawer.prototype._updateModifyAnchors = function (oid) {
        var _this = this;
        var num = _this.tempPositions.length;
        if (oid == 0 || oid == num - 1) {
            return;
        }
        //重新计算tempPositions
        var p = _this.tempPositions[oid];
        var p1 = _this.tempPositions[oid - 1];
        var p2 = _this.tempPositions[oid + 1];
        //计算中心
        var cp1 = _this._computeCenterPotition(p1, p);
        var cp2 = _this._computeCenterPotition(p, p2);
        //插入点
        var arr = [cp1, p, cp2];
        _this.tempPositions.splice(oid, 1, cp1, p, cp2);
        //重新加载锚点
        _this._clearAnchors();
        var positions = _this.tempPositions;
        for (var i = 0; i < positions.length; i++) {
            var ys = i % 2;
            if (ys == 0) {
                _this._createPoint(positions[i], i);
            }
            else {
                _this._createMidPoint(positions[i], i);
            }
        }
    };
    PlotPolylineDrawer.prototype._updateNewMidAnchors = function (oid) {
        var _this = this;
        if (oid == null) {
            return;
        }
        //左边两个中点，oid2为临时中间点
        var oid1 = null;
        var oid2 = null;
        //右边两个中点，oid3为临时中间点
        var oid3 = null;
        var oid4 = null;
        var num = _this.tempPositions.length;
        if (oid == 0) {
            oid1 = num - 2;
            oid2 = num - 1;
            oid3 = oid + 1;
            oid4 = oid + 2;
        }
        else if (oid == num - 2) {
            oid1 = oid - 2;
            oid2 = oid - 1;
            oid3 = num - 1;
            oid4 = 0;
        }
        else {
            oid1 = oid - 2;
            oid2 = oid - 1;
            oid3 = oid + 1;
            oid4 = oid + 2;
        }
        var c1 = _this.tempPositions[oid1];
        var c = _this.tempPositions[oid];
        var c4 = _this.tempPositions[oid4];
        if (oid == 0) {
            var c3 = _this._computeCenterPotition(c4, c);
            _this.tempPositions[oid3] = c3;
            _this.markers[oid3].position.setValue(c3);
        }
        else if (oid == num - 1) {
            var c2 = _this._computeCenterPotition(c1, c);
            _this.tempPositions[oid2] = c2;
            _this.markers[oid2].position.setValue(c2);
        }
        else {
            var c2 = _this._computeCenterPotition(c1, c);
            var c3 = _this._computeCenterPotition(c4, c);
            _this.tempPositions[oid2] = c2;
            _this.tempPositions[oid3] = c3;
            _this.markers[oid2].position.setValue(c2);
            _this.markers[oid3].position.setValue(c3);
        }
    };
    PlotPolylineDrawer.prototype._createPoint = function (cartesian, oid) {
        var point = this.viewer.entities.add({
            position: cartesian,
            billboard: {
                image: this.dragIconLight,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
            }
        });
        point.oid = oid;
        point.sid = cartesian.sid; //记录原始序号
        point.layerId = this.layerId;
        point.flag = "anchor";
        this.markers[oid] = point;
        return point;
    };
    PlotPolylineDrawer.prototype._createMidPoint = function (cartesian, oid) {
        var point = this.viewer.entities.add({
            position: cartesian,
            billboard: {
                image: this.dragIcon,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
            }
        });
        point.oid = oid;
        point.layerId = this.layerId;
        point.flag = "mid_anchor";
        this.markers[oid] = point;
        return point;
    };
    PlotPolylineDrawer.prototype._computeTempPositions = function () {
        var _this = this;
        var pnts = [].concat(_this.positions);
        var num = pnts.length;
        _this.tempPositions = [];
        for (var i = 1; i < num; i++) {
            var p1 = pnts[i - 1];
            var p2 = pnts[i];
            p1.sid = i - 1;
            p2.sid = i;
            var cp = _this._computeCenterPotition(p1, p2);
            _this.tempPositions.push(p1);
            _this.tempPositions.push(cp);
        }
        var last = pnts[num - 1];
        _this.tempPositions.push(last);
    };
    PlotPolylineDrawer.prototype._computeCenterPotition = function (p1, p2) {
        var _this = this;
        var c1 = _this.ellipsoid.cartesianToCartographic(p1);
        var c2 = _this.ellipsoid.cartesianToCartographic(p2);
        var cm = new Cesium.EllipsoidGeodesic(c1, c2).interpolateUsingFraction(0.5);
        var cp = _this.ellipsoid.cartographicToCartesian(cm);
        return cp;
    };
    PlotPolylineDrawer.prototype._showToolBar = function () {
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
    // _showToolBar() {
    // let _this = this;
    // _this._createToolBar();
    // let width = $(window).width();
    // let wTop = 300;
    // // let wLeft = parseInt((width - 145) / 2);
    // let wLeft = 600;
    // _this.toolBarIndex = layer.open({
    //   title: false,
    //   type: 1,
    //   fixed: true,
    //   resize: false,
    //   shade: 0,
    //   content: $("#shapeEditContainer"),
    //   offset: [wTop + "px", wLeft + "px"],
    //   move: "#shapeEditRTCorner",
    //   area: ['400px','300px'],
    //   skin: 'layui-draw-alert',
    // });
    // let cssSel = "#layui-layer" + _this.toolBarIndex + " .layui-layer-close2";
    // $(cssSel).hide();
    // }
    PlotPolylineDrawer.prototype._createToolBar = function () {
        //   let _this = this;
        //   let objs = $("#shapeEditContainer");
        //   objs.remove();
        //   // let html = '<div id="shapeEditContainer" style="padding: 10px 10px;">'
        //   //          + '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>'
        //   //          + '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>'
        //   //          + '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">'
        //   //          + '    </div>'
        //   //          + '</div>';
        // //         let html = `<div id="shapeEditContainer" style="color:black; height:300px;width:350px">
        // //         <div id="shapeEditRTCorner">折线</div>
        // //         <hr>
        // //         <div>
        // //             <label>名称:</label><input id="polylineName" type="text" value="折线"/>
        // //             </div>
        // //             <div>
        // //           <!--  <label>贴地</label>
        // //             <input id="clamp" type="checkbox" name="clamp" checked> -->
        // //             <div>
        // //             <label>颜色</label>
        // //             <span class="polyline-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;margin:0;"></span>
        // //             </div>
        // //            <div><label>宽度</label><input id="polylineWidth" type="range" min="1" max="100" step="1"/></div>
        // //         <div style="position: absolute;bottom: 10px;right: 10px;" class="layerBtn">
        // //         <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>
        // //         <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>
        // //         </div>
        // //         </div>
        // // </div>
        // // `
        //   let html = `<div id="shapeEditContainer" >
        // <div id="shapeEditRTCorner">折线</div>
        //
        // <div style="margin-left: 10%; margin-top: 5%;">
        //     <label>名称:</label><input style="background: rgba(30,32,45,0.9);    margin-left: 3%; color: #ffffff;    font-size: 14px;
        //     width: 200px;
        //     height: 25px;
        //     text-indent: 10px;outline:none; border:none;" id="polylineName" type="text" value="折线"/>
        //     </div>
        //     <div style="margin-top: 5%;">
        //   <!--  <label style="font-size: 14px;
        //   margin-left: 10%;">贴地</label>
        //     <input id="clamp" type="checkbox" name="clamp" checked> -->
        //     <div style="margin-left: 10%;">
        //     <label style="    position: relative; top: 38%;">颜色：</label>
        //     <span class="polyline-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;"></span>
        //     </div>
        //    <div style="margin-left: 10%; margin-top: 5%;"><label>宽度：</label><input style="  width: 200px; margin-left: 1%;position: absolute;" id="polylineWidth" type="range" min="1" max="100" step="1"/></div>
        // <div style="position: absolute;bottom: 10px;right: 10px;" class="layerBtn">
        // <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>
        // <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>
        // </div>
        // </div>
        // </div>
        // `
        //   $("body").append(html);
        //   _this.initPanelData();
        //   _this.setAttribute();
        //   let btnOK = $("#shapeEditContainer button[name='btnOK']");
        //   let btnCancel = $("#shapeEditContainer button[name='btnCancel']");
        //   btnOK.unbind("click").bind("click", function () {
        //     if (_this.okHandler) {
        //       //let positions = [];
        //       //for (let i = 0; i < _this.tempPositions.length; i += 2) {
        //       //    let p = _this.tempPositions[i];
        //       //    positions.push(p);
        //       //}
        //       let positions = _this._getPositionsWithSid();
        //       let lonLats = _this._getLonLats(positions);
        //       _this.positions = positions;
        //       _this.params.color = _this.shapeColor;
        //       _this.params.width = _this.width;
        //       _this.params.name = _this.shapeName;
        //       _this.okHandler(positions, lonLats, _this.params);
        //       _this.clear();
        //       layer.close(_this.toolBarIndex);
        //       _this.resetParams();
        //     } else {
        //       _this.clear();
        //       layer.close(_this.toolBarIndex);
        //       _this.resetParams();
        //     }
        //   });
        //   btnCancel.unbind("click").bind("click", function () {
        //     _this.clear();
        //     layer.close(_this.toolBarIndex);
        //     if (_this.cancelHandler) {
        //       _this.cancelHandler();
        //     }
        //   });
    };
    PlotPolylineDrawer.prototype._getPositionsWithSid = function () {
        var _this = this;
        var viewer = _this.viewer;
        var rlt = [];
        var entityList = viewer.entities.values;
        if (entityList == null || entityList.length < 1) {
            return rlt;
        }
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId != _this.layerId) {
                continue;
            }
            if (entity.flag != "anchor") {
                continue;
            }
            var p = entity.position.getValue(new Date().getTime());
            p.sid = entity.sid;
            p.oid = entity.oid;
            rlt.push(p);
        }
        //排序
        rlt.sort(function (obj1, obj2) {
            if (obj1.oid > obj2.oid) {
                return 1;
            }
            else if (obj1.oid == obj2.oid) {
                return 0;
            }
            else {
                return -1;
            }
        });
        return rlt;
    };
    PlotPolylineDrawer.prototype._getLonLat = function (cartesian) {
        var _this = this;
        var cartographic = _this.ellipsoid.cartesianToCartographic(cartesian);
        cartographic.height = _this.viewer.scene.globe.getHeight(cartographic);
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
    PlotPolylineDrawer.prototype._getLonLats = function (positions) {
        var _this = this;
        var arr = [];
        for (var i = 0; i < positions.length; i++) {
            var c = positions[i];
            var p = _this._getLonLat(c);
            p.sid = c.sid;
            p.oid = c.oid;
            arr.push(p);
        }
        return arr;
    };
    PlotPolylineDrawer.prototype._isSimpleXYZ = function (p1, p2) {
        return p1.x == p2.x && p1.y == p2.y && p1.z == p2.z;
    };
    PlotPolylineDrawer.prototype._clearAnchors = function () {
        var _this = this;
        for (var key in _this.markers) {
            var m = _this.markers[key];
            _this.viewer.entities.remove(m);
        }
        _this.markers = {};
    };
    PlotPolylineDrawer.prototype._clearMarkers = function (layerName) {
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
    return PlotPolylineDrawer;
}());
export default PlotPolylineDrawer;
