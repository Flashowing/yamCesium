var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "cesium"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * 圆扩散
     */
    var Cesium = __importStar(require("cesium"));
    var CircleSpread = /** @class */ (function () {
        /**
         * 生成动态圆
         * @param options 参数
         * @param options.viewer viewer
         * @param options.center 中心点
         * @param options.color 颜色
         * @param options.radius 半径
         * @param options.duration 持续时间
         */
        function CircleSpread(options) {
            this.viewer = options.viewer;
            this.addCircleScan(options);
        }
        /**
         * 生成动态圆
         * @param options
         */
        CircleSpread.prototype.addCircleScan = function (options) {
            var _this = this;
            var viewer = options.viewer;
            var _Cartesian3Center = options.center;
            var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);
            var _CartograhpicCenter1 = Cesium.Cartographic.fromCartesian(options.center);
            _CartograhpicCenter1.height += 1;
            var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartograhpicCenter1);
            var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);
            var _time = new Date().getTime();
            var _scratchCartesian4Center = new Cesium.Cartesian4();
            var _scratchCartesian4Center1 = new Cesium.Cartesian4();
            var _scratchCartesian3Normal = new Cesium.Cartesian3();
            var ScanPostStage = new Cesium.PostProcessStage({
                fragmentShader: _this.shader(),
                uniforms: {
                    u_scanCenterEC: function () {
                        return Cesium.Matrix4.multiplyByVector(viewer.camera.viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                    },
                    u_scanPlaneNormalEC: function () {
                        var temp = Cesium.Matrix4.multiplyByVector(viewer.camera.viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                        var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera.viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                        _scratchCartesian3Normal.x = temp1.x - temp.x;
                        _scratchCartesian3Normal.y = temp1.y - temp.y;
                        _scratchCartesian3Normal.z = temp1.z - temp.z;
                        Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
                        return _scratchCartesian3Normal;
                    },
                    u_radius: function () {
                        return options.radius * ((new Date().getTime() - _time) % options.duration) / options.duration;
                    },
                    u_scanColor: options.color
                }
            });
            viewer.scene.postProcessStages.add(ScanPostStage);
            return ScanPostStage;
        };
        CircleSpread.prototype.shader = function () {
            return "\n\
                uniform sampler2D colorTexture;\n\
                uniform sampler2D depthTexture;\n\
                varying vec2 v_textureCoordinates;\n\
                uniform vec4 u_scanCenterEC;\n\
                uniform vec3 u_scanPlaneNormalEC;\n\
                uniform float u_radius;\n\
                uniform vec4 u_scanColor;\n\
                \n\
                vec4 toEye(in vec2 uv,in float depth)\n\
                {\n\
                            vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n\
                            vec4 posIncamera = czm_inverseProjection * vec4(xy,depth,1.0);\n\
                            posIncamera = posIncamera/posIncamera.w;\n\
                            return posIncamera;\n\
                }\n\
                \n\
                vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point)\n\
                {\n\
                            vec3 v01 = point - planeOrigin;\n\
                            float d = dot(planeNormal,v01);\n\
                            return (point-planeNormal * d);\n\
                }\n\
                float getDepth(in vec4 depth)\n\
                {\n\
                            float z_window = czm_unpackDepth(depth);\n\
                            z_window = czm_reverseLogDepth(z_window);\n\
                            float n_range = czm_depthRange.near;\n\
                            float f_range = czm_depthRange.far;\n\
                            return (2.0 * z_window - n_range - f_range)/(f_range-n_range);\n\
                } \n\
                void main()\n\
                {\n\
                            gl_FragColor = texture2D(colorTexture,v_textureCoordinates);\n\
                            float depth = getDepth(texture2D(depthTexture,v_textureCoordinates));\n\
                            vec4 viewPos = toEye(v_textureCoordinates,depth);\n\
                            vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz,u_scanCenterEC.xyz,viewPos.xyz);\n\
                            float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n\
                            if(dis<u_radius)\n\
                            {\n\
                                float f = 1.0-abs(u_radius - dis )/ u_radius;\n\
                                f = pow(f,4.0);\n\
                                gl_FragColor = mix(gl_FragColor,u_scanColor,f);\n\
                            }\n\
                } \n ";
        };
        return CircleSpread;
    }());
    exports.default = CircleSpread;
});
