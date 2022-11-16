import * as Cesium from "cesium";
// @ts-ignore
var Knockout = Cesium.knockout;
var Immersion = /** @class */ (function () {
    function Immersion(viewer) {
        /**
         * viewer
         * @type {null}
         */
        this.viewer = null;
        this.scene = null;
        this.viewModel = {
            enabled: false,
            firstPersonPerspective: false
        };
        if (!viewer) {
            throw Error("viewer can not be null");
        }
        this.viewer = viewer;
        this.scene = viewer.scene;
        this.canvas = viewer.canvas;
        this.bindModel();
        if (this.viewModel.enabled) {
            this.enable();
        }
    }
    Immersion.prototype.disEnable = function () {
        var scene = this.scene;
        var canvas = this.canvas;
        scene.screenSpaceCameraController.enableRotate = true;
        scene.screenSpaceCameraController.enableTranslate = true;
        scene.screenSpaceCameraController.enableZoom = true;
        scene.screenSpaceCameraController.enableTilt = true;
        scene.screenSpaceCameraController.enableLook = true;
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
        }
        this.viewer.clock.onTick.removeEventListener(this.clockEvent);
    };
    Immersion.prototype.enable = function () {
        var _this = this;
        var scene = this.scene;
        var canvas = this.canvas;
        canvas.setAttribute("tabindex", "0"); // needed to put focus on the canvas
        canvas.onclick = function () {
            canvas.focus();
        };
        var ellipsoid = scene.globe.ellipsoid;
        if (this.viewModel.firstPersonPerspective) {
            // 禁用默认事件
            scene.screenSpaceCameraController.enableRotate = false;
            scene.screenSpaceCameraController.enableTranslate = false;
            scene.screenSpaceCameraController.enableZoom = false;
            scene.screenSpaceCameraController.enableTilt = false;
            scene.screenSpaceCameraController.enableLook = false;
        }
        var startMousePosition;
        var mousePosition;
        var flags = {
            looking: false,
            moveForward: false,
            moveBackward: false,
            moveUp: false,
            moveDown: false,
            moveLeft: false,
            moveRight: false
        };
        this.handler = new Cesium.ScreenSpaceEventHandler(canvas);
        this.handler.setInputAction(function (movement) {
            flags.looking = true;
            mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.handler.setInputAction(function (movement) {
            mousePosition = movement.endPosition;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.setInputAction(function (position) {
            flags.looking = false;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
        function getFlagForKeyCode(keyCode) {
            switch (keyCode) {
                case "W".charCodeAt(0):
                    return "moveForward";
                case "S".charCodeAt(0):
                    return "moveBackward";
                case "Q".charCodeAt(0):
                    return "moveUp";
                case "E".charCodeAt(0):
                    return "moveDown";
                case "D".charCodeAt(0):
                    return "moveRight";
                case "A".charCodeAt(0):
                    return "moveLeft";
                default:
                    return undefined;
            }
        }
        document.addEventListener("keydown", function (e) {
            var flagName = getFlagForKeyCode(e.keyCode);
            if (typeof flagName !== "undefined") {
                // @ts-ignore
                flags[flagName] = true;
            }
        }, false);
        document.addEventListener("keyup", function (e) {
            var flagName = getFlagForKeyCode(e.keyCode);
            if (typeof flagName !== "undefined") {
                // @ts-ignore
                flags[flagName] = false;
            }
        }, false);
        this.clockEvent = function clockEvent(clock) {
            var camera = _this.viewer.camera;
            if (_this.viewModel.firstPersonPerspective && flags.looking) {
                var width = canvas.clientWidth;
                var height = canvas.clientHeight;
                // 坐标(0.0,0.0)将是点击鼠标的位置。
                var x = (mousePosition.x - startMousePosition.x) / width;
                var y = -(mousePosition.y - startMousePosition.y) / height;
                var lookFactor = 0.05;
                camera.lookRight(x * lookFactor);
                camera.lookUp(y * lookFactor);
            }
            // 根据相机到椭球表面的距离来改变移动速度。
            var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
            var moveRate = cameraHeight / 100.0;
            if (flags.moveForward) {
                camera.moveForward(moveRate);
            }
            if (flags.moveBackward) {
                camera.moveBackward(moveRate);
            }
            if (flags.moveUp) {
                camera.moveUp(moveRate);
            }
            if (flags.moveDown) {
                camera.moveDown(moveRate);
            }
            if (flags.moveLeft) {
                camera.moveLeft(moveRate);
            }
            if (flags.moveRight) {
                camera.moveRight(moveRate);
            }
        };
        this.viewer.clock.onTick.addEventListener(this.clockEvent);
    };
    /**
     * 属性绑定
     */
    Immersion.prototype.bindModel = function () {
        var _this_1 = this;
        var _this = this;
        Knockout.track(_this.viewModel);
        Knockout.getObservable(_this.viewModel, "enabled").subscribe(function (enabled) {
            if (enabled) {
                _this_1.enable();
            }
            else {
                _this_1.disEnable();
            }
        });
        Knockout.getObservable(_this.viewModel, "firstPersonPerspective").subscribe(function (enabled) {
            if (enabled) {
                _this.disEnable();
                if (!_this.viewModel.enabled) {
                    _this.viewModel.enabled = enabled;
                }
                else {
                    _this.enable();
                }
            }
            else {
                var scene = _this_1.scene;
                scene.screenSpaceCameraController.enableRotate = true;
                scene.screenSpaceCameraController.enableTranslate = true;
                scene.screenSpaceCameraController.enableZoom = true;
                scene.screenSpaceCameraController.enableTilt = true;
                scene.screenSpaceCameraController.enableLook = true;
                if (_this_1.handler) {
                    _this_1.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
                    _this_1.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    _this_1.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
                }
            }
        });
    };
    return Immersion;
}());
export default Immersion;
