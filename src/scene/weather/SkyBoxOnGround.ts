import * as Cesium from "cesium";

function skyBoxOnGround() {
  const BoxGeometry = Cesium.BoxGeometry;
  const Cartesian3 = Cesium.Cartesian3;
  const defaultValue = Cesium.defaultValue;
  const defined = Cesium.defined;
  const destroyObject = Cesium.destroyObject;
  const DeveloperError = Cesium.DeveloperError;
  const GeometryPipeline = Cesium.GeometryPipeline;
  const Matrix3 = Cesium.Matrix3;
  const Matrix4 = Cesium.Matrix4;
  const Transforms = Cesium.Transforms;
  const VertexFormat = Cesium.VertexFormat;
  // @ts-ignore
  const BufferUsage = Cesium.BufferUsage;
  // @ts-ignore
  const CubeMap = Cesium.CubeMap;
  // @ts-ignore
  const DrawCommand = Cesium.DrawCommand;
  // @ts-ignore
  const loadCubeMap = Cesium.loadCubeMap;
  // @ts-ignore
  const RenderState = Cesium.RenderState;
  // @ts-ignore
  const VertexArray = Cesium.VertexArray;
  const BlendingState = Cesium.BlendingState;
  const SceneMode = Cesium.SceneMode;
  // @ts-ignore
  const ShaderProgram = Cesium.ShaderProgram;
  // @ts-ignore
  const ShaderSource = Cesium.ShaderSource;
  //片元着色器，直接从源码复制
  const SkyBoxFS = "uniform samplerCube u_cubeMap;\n\
  varying vec3 v_texCoord;\n\
  void main()\n\
  {\n\
  vec4 color = textureCube(u_cubeMap, normalize(v_texCoord));\n\
  gl_FragColor = vec4(czm_gammaCorrect(color).rgb, czm_morphTime);\n\
  }\n\
  ";

  //顶点着色器有修改，主要是乘了一个旋转矩阵
  const SkyBoxVS = "attribute vec3 position;\n\
  varying vec3 v_texCoord;\n\
  uniform mat3 u_rotateMatrix;\n\
  void main()\n\
  {\n\
  vec3 p = czm_viewRotation * u_rotateMatrix * (czm_temeToPseudoFixed * (czm_entireFrustum.y * position));\n\
  gl_Position = czm_projection * vec4(p, 1.0);\n\
  v_texCoord = position.xyz;\n\
  }\n\
  ";
  /**
   * 为了兼容高版本的Cesium，因为新版cesium中getRotation被移除
   */
  if (!Cesium.defined(Cesium.Matrix4.getRotation)) {
    Cesium.Matrix4.getRotation = Cesium.Matrix4.getMatrix3;
  }

  class SkyBoxOnGround {
    sources: any;
    _sources: any;
    show: boolean;
    _command: any;
    _cubeMap: any;
    _attributeLocations: any;
    _useHdr: any;

    constructor(options: any) {
      /**
       * 近景天空盒
       * @type Object
       * @default undefined
       */
      this.sources = options.sources;
      this._sources = undefined;

      /**
       * Determines if the sky box will be shown.
       *
       * @type {Boolean}
       * @default true
       */
      this.show = defaultValue(options.show, true);

      this._command = new DrawCommand({
        modelMatrix: Matrix4.clone(Matrix4.IDENTITY),
        owner: this
      });
      this._cubeMap = undefined;

      this._attributeLocations = undefined;
      this._useHdr = undefined;
    }

    update(frameState: any, useHdr: any) {
      const that = this;

      if (!this.show) {
        return undefined;
      }

      if ((frameState.mode !== SceneMode.SCENE3D) &&
        (frameState.mode !== SceneMode.MORPHING)) {
        return undefined;
      }

      if (!frameState.passes.render) {
        return undefined;
      }

      const context = frameState.context;

      if (this._sources !== this.sources) {
        this._sources = this.sources;
        const sources = this.sources;

        if ((!defined(sources.positiveX)) ||
          (!defined(sources.negativeX)) ||
          (!defined(sources.positiveY)) ||
          (!defined(sources.negativeY)) ||
          (!defined(sources.positiveZ)) ||
          (!defined(sources.negativeZ))) {
          throw new DeveloperError("this.sources is required and must have positiveX, negativeX, positiveY, negativeY, positiveZ, and negativeZ properties.");
        }

        if ((typeof sources.positiveX !== typeof sources.negativeX) ||
          (typeof sources.positiveX !== typeof sources.positiveY) ||
          (typeof sources.positiveX !== typeof sources.negativeY) ||
          (typeof sources.positiveX !== typeof sources.positiveZ) ||
          (typeof sources.positiveX !== typeof sources.negativeZ)) {
          throw new DeveloperError("this.sources properties must all be the same type.");
        }

        if (typeof sources.positiveX === "string") {
          // Given urls for cube-map images.  Load them.
          loadCubeMap(context, this._sources).then(function(cubeMap: any) {
            that._cubeMap = that._cubeMap && that._cubeMap.destroy();
            that._cubeMap = cubeMap;
          });
        } else {
          this._cubeMap = this._cubeMap && this._cubeMap.destroy();
          this._cubeMap = new CubeMap({
            context: context,
            source: sources
          });
        }
      }

      const command = this._command;

      command.modelMatrix = Transforms.eastNorthUpToFixedFrame(frameState.camera._positionWC);
      if (!defined(command.vertexArray)) {
        command.uniformMap = {
          u_cubeMap: function() {
            return that._cubeMap;
          },
          u_rotateMatrix: function() {
            return Matrix4.getRotation(command.modelMatrix, skyboxMatrix3);
          }
        };

        const geometry = BoxGeometry.createGeometry(BoxGeometry.fromDimensions({
          dimensions: new Cartesian3(2.0, 2.0, 2.0),
          vertexFormat: VertexFormat.POSITION_ONLY
        }));
        let attributeLocations: any;
        if (geometry) {
          attributeLocations = this._attributeLocations = GeometryPipeline.createAttributeLocations(geometry);
        }

        command.vertexArray = VertexArray.fromGeometry({
          context: context,
          geometry: geometry,
          attributeLocations: attributeLocations,
          bufferUsage: BufferUsage._DRAW
        });

        command.renderState = RenderState.fromCache({
          blending: BlendingState.ALPHA_BLEND
        });
      }

      if (!defined(command.shaderProgram) || this._useHdr !== useHdr) {
        const fs = new ShaderSource({
          defines: [useHdr ? "HDR" : ""],
          sources: [SkyBoxFS]
        });
        command.shaderProgram = ShaderProgram.fromCache({
          context: context,
          vertexShaderSource: SkyBoxVS,
          fragmentShaderSource: fs,
          attributeLocations: this._attributeLocations
        });
        this._useHdr = useHdr;
      }

      if (!defined(this._cubeMap)) {
        return undefined;
      }

      return command;
    }

    isDestroyed() {
      return false;
    }

    destroy() {
      const command = this._command;
      command.vertexArray = command.vertexArray && command.vertexArray.destroy();
      command.shaderProgram = command.shaderProgram && command.shaderProgram.destroy();
      this._cubeMap = this._cubeMap && this._cubeMap.destroy();
      return destroyObject(this);
    }
  }

  const skyboxMatrix3 = new Matrix3();
  // @ts-ignore
  Cesium.GroundSkyBox = SkyBoxOnGround;
}

export default skyBoxOnGround;
