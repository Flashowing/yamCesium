import * as Cesium from "cesium";
import {
  Axis,
  Cartesian2,
  Cartesian3,
  Cesium3DTileset,
  ClassificationType,
  ClippingPlaneCollection,
  Color,
  Ellipsoid,
  ImageBasedLighting,
  Matrix4,
  ShadowMode,
  SplitDirection
} from "cesium";
import PublicMethod from "../plugins/lib/PublicMethod";
import CesiumMethod from "../plugins/lib/CesiumMethod";

interface tilesetOptions {
  scale: number;
  color?: string;
  name?: string;
  longitude: number;
  latitude: number;
  height?: number;
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

class Cesium3DTiles {

  viewer: Cesium.Viewer;

  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer;
  }

  add3dTiles(params: {
    url: string;
    show?: boolean;
    modelMatrix?: Matrix4;
    modelUpAxis?: Axis;
    modelForwardAxis?: Axis;
    shadows?: ShadowMode;
    maximumScreenSpaceError?: number;
    maximumMemoryUsage?: number;
    cullWithChildrenBounds?: boolean;
    cullRequestsWhileMoving?: boolean;
    cullRequestsWhileMovingMultiplier?: number;
    preloadWhenHidden?: boolean;
    preloadFlightDestinations?: boolean;
    preferLeaves?: boolean;
    dynamicScreenSpaceError?: boolean;
    dynamicScreenSpaceErrorDensity?: number;
    dynamicScreenSpaceErrorFactor?: number;
    dynamicScreenSpaceErrorHeightFalloff?: number;
    progressiveResolutionHeightFraction?: number;
    foveatedScreenSpaceError?: boolean;
    foveatedConeSize?: number;
    foveatedMinimumScreenSpaceErrorRelaxation?: number;
    foveatedInterpolationCallback?: Cesium3DTileset.foveatedInterpolationCallback;
    foveatedTimeDelay?: number;
    skipLevelOfDetail?: boolean;
    baseScreenSpaceError?: number;
    skipScreenSpaceErrorFactor?: number;
    skipLevels?: number;
    immediatelyLoadDesiredLevelOfDetail?: boolean;
    loadSiblings?: boolean;
    clippingPlanes?: ClippingPlaneCollection;
    classificationType?: ClassificationType;
    ellipsoid?: Ellipsoid;
    pointCloudShading?: any;
    lightColor?: Cartesian3;
    imageBasedLighting?: ImageBasedLighting;
    backFaceCulling?: boolean;
    enableShowOutline?: boolean;
    showOutline?: boolean;
    outlineColor?: Color;
    vectorClassificationOnly?: boolean;
    vectorKeepDecodedPositions?: boolean;
    featureIdLabel?: string | number;
    instanceFeatureIdLabel?: string | number;
    showCreditsOnScreen?: boolean;
    splitDirection?: SplitDirection;
    projectTo2D?: boolean;
    debugHeatmapTilePropertyName?: string;
    debugFreezeFrame?: boolean;
    debugColorizeTiles?: boolean;
    enableDebugWireframe?: boolean;
    debugWireframe?: boolean;
    debugShowBoundingVolume?: boolean;
    debugShowContentBoundingVolume?: boolean;
    debugShowViewerRequestVolume?: boolean;
    debugShowGeometricError?: boolean;
    debugShowRenderingStatistics?: boolean;
    debugShowMemoryUsage?: boolean;
    debugShowUrl?: boolean;
    imageBasedLightingFactor: Cartesian2;
  }, options: tilesetOptions = {
    scale: 1,
    color: "color()",
    name: "3D模型",
    longitude: 0,
    latitude: 0,
    height: 0,
    rotation: {
      x: 0,
      y: 0,
      z: 0
    }
  }) {
    let tileParams: any = {
      maximumScreenSpaceError: 19.698310613518657, //最大屏幕空间误差
      maximumNumberOfLoadedTiles: 1000 //最大加载瓦片个数

    };
    PublicMethod.setOptions(tileParams, params);
    tileParams.imageBasedLightingFactor = new Cesium.Cartesian2(1.0, 1.0);
    let tileset = new Cesium.Cesium3DTileset(tileParams) as any;
    let tileId = (new Date()).getTime();
    tileset.name = options.name ? options.name : "3D模型";
    tileset.coordinate = [options.longitude, options.latitude]; // 将模型的经纬度保存起来
    tileset.tileId = tileId;
    tileset.scale = options.scale ? options.scale : 1; // 保存模型的缩放级别
    tileset.rotation = options.rotation;
    tileset.originParams = {};
    PublicMethod.setOptions(tileset.originParams, options);
    tileset.originParams.url = params.url;
    tileset.originParams.coordinate = [options.longitude, options.latitude];
    tileset.originParams.height = options.height;
    tileset.originParams.scale = options.scale;
    tileset.originParams.rotation = options.rotation;
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: options.color
    });
    tileset.readyPromise.then((tileset: any) => {
      let positions: Cesium.Cartographic[] = [];
      if (options.longitude != null && options.latitude != null) {
        positions = [
          Cesium.Cartographic.fromDegrees(options.longitude, options.latitude)
        ];
      }
      let terrain = this.viewer.scene.terrainProvider;
      if (!options.longitude || !options.latitude) {
        console.log("无坐标添加模型");
        this.viewer.scene.primitives.add(tileset);
        let coordinate = CesiumMethod.cartesian3ToLngLat(tileset.boundingSphere.center);
        tileset.coordinate = coordinate;
        tileset.originParams.coordinate = coordinate;
        return;
      }
      let promise = Cesium.sampleTerrainMostDetailed(terrain, positions);

      // @ts-ignore
      Cesium.when(promise, (updatedPositions) => {
        let longitude = options.longitude as number, latitude = options.latitude as number;
        let terrainHeight = updatedPositions[0].height;
        if (options.height && options.height > 0) { // 这里使用options.height没有错, 判断有没有传入height属性
          terrainHeight = options.height;   // 这里使用o.height也没有错，使用处理后的高度
        }
        tileset.coordinate.push(terrainHeight); // 保存模型的高度
        //跳转到设定的经纬度，地形高度
        tileset._root.transform = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(longitude, latitude, 0));

        this.viewer.scene.primitives.add(tileset);
        //处理当前3D模型的偏移
        let cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center); //获取到倾斜数据中心点的经纬度坐标（弧度）
        let surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
        let position = Cesium.Cartesian3.fromDegrees(longitude, latitude, terrainHeight); //正确位置
        let translation = Cesium.Cartesian3.subtract(position, surface, new Cesium.Cartesian3()); //偏移的多少
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation); //完成偏移
        tileset.m = Cesium.Matrix4.fromTranslation(translation); //保存模型缩放等级为1的矩阵
        tileset.originPosition = Cesium.Matrix4.fromTranslation(translation); //保存模型的原始矩阵
        // 缩放
        let m1 = Cesium.Matrix3.fromScale(new Cesium.Cartesian3(options.scale, options.scale, options.scale));
        // 再次变换矩阵
        this.translate(tileset, m1, tileset.modelMatrix);
        // 设置旋转角度
        this.rotate(options.rotation?.x, options.rotation?.y, options.rotation?.z, options.scale, tileset);
        const bcenter = JSON.stringify(tileset.boundingSphere.center);
        tileset.originParams.boundingSphereCenter = JSON.parse(bcenter);
        tileset.originParams.modelMatrix = Cesium.Matrix4.clone(tileset.modelMatrix);
      });
    }).otherwise(function(error: any) {
      console.log(error);
    });
    return tileset;
  }

  translate(tileset: any, transform: any, matrix?: any) {
    let m = Cesium.Matrix4.clone(matrix) as any;
    var transformMat = Cesium.Matrix4.fromArray(m);
    var matRotation = Cesium.Matrix4.getMatrix3(transformMat, new Cesium.Matrix3());
    var inverseMatRotation = Cesium.Matrix3.inverse(matRotation, new Cesium.Matrix3());
    var matTranslation = Cesium.Matrix4.getTranslation(transformMat, new Cesium.Cartesian3());

    var transformation = Cesium.Transforms.eastNorthUpToFixedFrame(tileset.boundingSphere.center);
    var transformRotation = Cesium.Matrix4.getMatrix3(transformation, new Cesium.Matrix3());
    var transformTranslation = Cesium.Matrix4.getTranslation(transformation, new Cesium.Cartesian3());

    var matToTranslation: any = Cesium.Cartesian3.subtract(matTranslation, transformTranslation, new Cesium.Cartesian3());
    matToTranslation = Cesium.Matrix4.fromTranslation(matToTranslation, new Cesium.Matrix4());

    var matToTransformation = Cesium.Matrix3.multiply(inverseMatRotation, transformRotation, new Cesium.Matrix3());
    matToTransformation = Cesium.Matrix3.inverse(matToTransformation, new Cesium.Matrix3());
    matToTransformation = Cesium.Matrix4.fromRotationTranslation(matToTransformation);

    var rotationTranslation = Cesium.Matrix4.fromRotationTranslation(transform);

    Cesium.Matrix4.multiply(transformation, rotationTranslation, transformation);
    Cesium.Matrix4.multiply(transformation, matToTransformation, transformation);
    Cesium.Matrix4.multiply(transformation, matToTranslation, transformation);
    tileset.modelMatrix = transformation;
  }

  rotate(x: number, y: number, z: number, scale: number, tileset: any) {
    let anglex = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(x));
    let angley = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(y));
    let anglez = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(z));

    var m1 = Cesium.Matrix3.fromScale(new Cesium.Cartesian3(scale, scale, scale));

    Cesium.Matrix3.multiply(angley, anglez, angley);
    Cesium.Matrix3.multiply(anglex, angley, anglex);
    Cesium.Matrix3.multiply(anglex, anglez, anglex);
    Cesium.Matrix3.multiply(anglex, m1, anglex);

    this.translate(tileset, anglex, tileset.m);
  }
}

export default Cesium3DTiles;
