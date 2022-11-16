import * as Cesium from "cesium";
import Immersion from "./Immersion";
import HawkEyeMap from "./hawkEyeMap/HawkEyeMap";
// @ts-ignore
var Knockout = Cesium.knockout;
var Camera = /** @class */ (function () {
    function Camera(viewer) {
        /**
         * 第一人称视角
         */
        this.immersion = null;
        /**
         * 鹰眼图
         * @param viewer
         */
        this.hawkEye = null;
        /**
         * 绕点旋转事件
         * @private
         */
        this.aroundClockEvent = null;
        if (!viewer) {
            throw Error("the constructor of Map need a parameter of type Cesium.Viewer");
        }
        this.viewer = viewer;
        this.immersion = new Immersion(viewer);
        this.hawkEye = new HawkEyeMap(viewer);
    }
    /**
     * 绕点旋转
     * @param position 绕点旋转的点
     * @param radius 旋转半径
     * @param duration 旋转时间
     * @param angle 旋转角度（速度）
     */
    Camera.prototype.flyAround = function (position, radius, duration, angle) {
        var _this = this;
        if (radius === void 0) { radius = 1000; }
        if (duration === void 0) { duration = 3; }
        if (angle === void 0) { angle = 0.005; }
        var curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
        var lng = curPosition.longitude * 180 / Math.PI;
        var lat = curPosition.latitude * 180 / Math.PI;
        var boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(lng, lat, 0), radius);
        var distance = Cesium.Cartesian3.distance(this.viewer.camera.position, position);
        distance = distance > radius ? radius : distance;
        var offset = new Cesium.HeadingPitchRange(this.viewer.camera.heading, this.viewer.camera.pitch, distance);
        this.viewer.camera.flyToBoundingSphere(boundingSphere, {
            offset: offset,
            duration: duration,
            complete: function () {
                var transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
                //相机位置初始化
                _this.viewer.scene.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(_this.viewer.camera.heading, _this.viewer.camera.pitch, distance));
                // 定时任务
                _this.aroundClockEvent = function () {
                    _this.viewer.scene.camera.rotateRight(angle);
                };
                _this.viewer.clock.onTick.addEventListener(_this.aroundClockEvent);
            }
        });
        return this.aroundClockEvent;
    };
    /**
     * 停止绕点旋转
     */
    Camera.prototype.stopAround = function () {
        this.viewer.clock.onTick.removeEventListener(this.aroundClockEvent);
        this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        this.viewer.scene.screenSpaceCameraController.enableInputs = true;
    };
    Camera.prototype.look = function (lon, lat, offset) {
        if (!this.viewer) {
            return;
        }
        var center = Cesium.Cartesian3.fromDegrees(lon, lat);
        var transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
        var camera = this.viewer.camera;
        camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;
        camera.lookAtTransform(transform, new Cesium.Cartesian3(-offset, -offset, offset));
        setTimeout(function () {
            camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        }, 100);
    };
    /**
     * 相机原地旋转
     */
    Camera.prototype._cameraRotate = function () {
        var _this = this;
        var timeId;
        var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        handler.setInputAction(function (event) {
            // 返回一个ray和地球表面的一个交点的Cartesian3坐标。
            var ray = _this.viewer.camera.getPickRay(event.position);
            if (!ray)
                return;
            var cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
            if (!cartesian)
                return;
            timeId && clearInterval(timeId);
            timeId = setInterval(function () {
                _this._rotateHeading();
            }, 30);
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        handler.setInputAction(function (event) {
            clearInterval(timeId);
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    };
    Camera.prototype._rotateHeading = function () {
        // 相机的当前heading
        var heading = Cesium.Math.toDegrees(this.viewer.camera.heading);
        if (heading >= 360 || heading <= -360)
            heading = 0;
        heading = heading + 0.25; //调节转动快慢
        var pitch = this.viewer.camera.pitch;
        var ellipsoid = this.viewer.scene.globe.ellipsoid; //获取椭球
        var cartographic = ellipsoid.cartesianToCartographic(this.viewer.camera.position);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var distance = cartographic.height;
        this.viewer.scene.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(lng, lat, distance),
            orientation: {
                heading: Cesium.Math.toRadians(heading),
                pitch: pitch
                // endTransform: Cesium.Matrix4.IDENTITY
            }
        });
    };
    return Camera;
}());
export default Camera;
