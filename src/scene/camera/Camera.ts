import * as Cesium from "cesium";
import Immersion from "./Immersion";
import HawkEyeMap from "./hawkEyeMap/HawkEyeMap";
// @ts-ignore
const Knockout = Cesium.knockout;

class Camera {
  viewer: Cesium.Viewer;
  /**
   * 第一人称视角
   */
  immersion: Immersion | null = null;

  /**
   * 鹰眼图
   * @param viewer
   */
  hawkEye: HawkEyeMap | null = null;

  /**
   * 绕点旋转事件
   * @private
   */
  private aroundClockEvent: any = null;

  constructor(viewer: any) {
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
  flyAround(position: Cesium.Cartesian3, radius: number = 1000, duration: number = 3, angle: number = 0.005) {
    const curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
    const lng = curPosition.longitude * 180 / Math.PI;
    const lat = curPosition.latitude * 180 / Math.PI;
    const boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(lng, lat, 0), radius);
    let distance = Cesium.Cartesian3.distance(this.viewer.camera.position, position);
    distance = distance > radius ? radius : distance;
    const offset = new Cesium.HeadingPitchRange(this.viewer.camera.heading, this.viewer.camera.pitch, distance);
    this.viewer.camera.flyToBoundingSphere(boundingSphere, {
      offset: offset,
      duration: duration,
      complete: () => {
        const transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        //相机位置初始化
        this.viewer.scene.camera.lookAtTransform(transform, new Cesium.HeadingPitchRange(this.viewer.camera.heading, this.viewer.camera.pitch, distance));
        // 定时任务
        this.aroundClockEvent = () => {
          this.viewer.scene.camera.rotateRight(angle);
        };
        this.viewer.clock.onTick.addEventListener(this.aroundClockEvent);
      }
    });
    return this.aroundClockEvent;
  }

  /**
   * 停止绕点旋转
   */
  stopAround() {
    this.viewer.clock.onTick.removeEventListener(this.aroundClockEvent);
    this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    this.viewer.scene.screenSpaceCameraController.enableInputs = true;
  }

  look(lon: number, lat: number, offset: number) {
    if (!this.viewer) {
      return;
    }
    const center = Cesium.Cartesian3.fromDegrees(lon, lat);
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    const camera = this.viewer.camera;
    camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;
    camera.lookAtTransform(transform, new Cesium.Cartesian3(-offset, -offset, offset));
    setTimeout(function() {
      camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }, 100);
  }

  /**
   * 相机原地旋转
   */
  _cameraRotate() {
    let timeId: string | number | NodeJS.Timeout | undefined;
    let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction((event: any) => {
      // 返回一个ray和地球表面的一个交点的Cartesian3坐标。
      let ray = this.viewer.camera.getPickRay(event.position);
      if (!ray) return;
      let cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      if (!cartesian) return;
      timeId && clearInterval(timeId);
      timeId = setInterval(() => {
        this._rotateHeading();
      }, 30);
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    handler.setInputAction((event: any) => {
      clearInterval(timeId);
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
  }

  private _rotateHeading() {
    // 相机的当前heading
    let heading = Cesium.Math.toDegrees(this.viewer.camera.heading);
    if (heading >= 360 || heading <= -360) heading = 0;
    heading = heading + 0.25;//调节转动快慢
    let pitch = this.viewer.camera.pitch;
    let ellipsoid = this.viewer.scene.globe.ellipsoid;//获取椭球
    let cartographic = ellipsoid.cartesianToCartographic(this.viewer.camera.position);
    let lat = Cesium.Math.toDegrees(cartographic.latitude);
    let lng = Cesium.Math.toDegrees(cartographic.longitude);
    let distance = cartographic.height;
    this.viewer.scene.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, distance), // 点的坐标
      orientation: {
        heading: Cesium.Math.toRadians(heading),
        pitch: pitch
        // endTransform: Cesium.Matrix4.IDENTITY
      }
    });
  }
}

export default Camera;
