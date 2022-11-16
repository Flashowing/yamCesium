import * as Cesium from "cesium";
import "./raindrop.css";
var Weather = /** @class */ (function () {
    function Weather(viewer) {
        this.stage = null;
        this.sign = false;
        this.snowLayer = "";
        this.viewModel = {
            lightRainEnabled: false,
            moderateRainEnabled: false,
            heavyRainEnabled: false,
            raindropEnabled: false,
            thunderEnabled: false,
            snowEnabled: false,
            overcastEnabled: false,
            cloudyEnabled: false,
            sunnyEnabled: false,
            nightViewEnabled: false,
            screenFogEnabled: false
        };
        this.defaultSkyBoxSource = {
            negativeX: Cesium.buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_mx.jpg"),
            negativeY: Cesium.buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_my.jpg"),
            negativeZ: Cesium.buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_mz.jpg"),
            positiveX: Cesium.buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_px.jpg"),
            positiveY: Cesium.buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_py.jpg"),
            positiveZ: Cesium.buildModuleUrl("Assets/Textures/SkyBox/tycho2t3_80_pz.jpg")
        };
        this.showStatus = {
            cloud: false,
            sun: false
        };
        this.stages = {
            "小雨": null,
            "中雨": null,
            "大雨": null,
            "下雪": null,
            "雨滴": null,
            "闪电": null,
            "多云": null,
            "晴天": null,
            "阴天": null,
            "雾": null
        };
        this.viewer = viewer;
        this.postProcessStages = viewer.scene.postProcessStages;
        this.skyAtmosphere = viewer.scene.skyAtmosphere;
        this.bindModel();
    }
    /**
     * 属性绑定
     */
    Weather.prototype.bindModel = function () {
        var _this = this;
        // @ts-ignore
        var Knockout = Cesium.knockout;
        Knockout.track(_this.viewModel);
        Knockout.getObservable(_this.viewModel, "lightRainEnabled").subscribe(function (newValue) {
            if (!newValue) {
                _this.closeFunction("小雨");
                return;
            }
            _this.lightRain();
        });
        Knockout.getObservable(_this.viewModel, "moderateRainEnabled").subscribe(function (newValue) {
            if (!newValue) {
                _this.closeFunction("中雨");
                return;
            }
            _this.moderateRain();
        });
        Knockout.getObservable(_this.viewModel, "heavyRainEnabled").subscribe(function (newValue) {
            if (!newValue) {
                _this.closeFunction("大雨");
                return;
            }
            _this.heavyRain();
        });
        Knockout.getObservable(_this.viewModel, "raindropEnabled").subscribe(function (newValue) {
            if (!newValue) {
                _this.closeFunction("雨滴");
                return;
            }
            _this.raindrop();
        });
        Knockout.getObservable(_this.viewModel, "thunderEnabled").subscribe(function (newValue) {
            if (!newValue) {
                _this.closeFunction("闪电");
                return;
            }
            _this.thunderstorm();
        });
        Knockout.getObservable(_this.viewModel, "snowEnabled").subscribe(function (newValue) {
            if (!newValue) {
                _this.closeFunction("下雪");
                return;
            }
            _this.snow();
        });
        Knockout.getObservable(_this.viewModel, "overcastEnabled").subscribe(function (newValue) {
            if (!newValue) {
                _this.closeFunction("阴天");
                return;
            }
            _this.overcast();
        });
        Knockout.getObservable(_this.viewModel, "cloudyEnabled").subscribe(function (newValue) {
            if (!newValue) {
                _this.closeFunction("多云");
                return;
            }
            _this.cloudy();
        });
        Knockout.getObservable(_this.viewModel, "sunnyEnabled").subscribe(function (newValue) {
            if (!newValue) {
                _this.closeFunction("晴天");
                return;
            }
            _this.sunny();
        });
        Knockout.getObservable(_this.viewModel, "nightViewEnabled").subscribe(function (newValue) {
            if (!newValue) {
                _this.closeFunction("夜晚");
                return;
            }
            _this.darkness();
        });
    };
    Weather.prototype.closeFunction = function (funcName) {
        var _this = this;
        var cesiumViewer = document.querySelector(".cesium-viewer");
        switch (funcName) {
            case "小雨":
                _this.postProcessStages.remove(_this.stages[funcName]);
                _this.skyAtmosphere.hueShift = 0;
                _this.skyAtmosphere.saturationShift = 0;
                _this.skyAtmosphere.brightnessShift = 0;
                if (!_this.viewModel.moderateRainEnabled && !_this.viewModel.heavyRainEnabled
                    && !_this.viewModel.snowEnabled && !_this.viewModel.overcastEnabled
                    && !_this.viewModel.cloudyEnabled && !_this.viewModel.sunnyEnabled) {
                    cesiumViewer.style.filter = "brightness(1)";
                }
                break;
            case "中雨":
                _this.postProcessStages.remove(_this.stages[funcName]);
                _this.skyAtmosphere.hueShift = 0;
                _this.skyAtmosphere.saturationShift = 0;
                _this.skyAtmosphere.brightnessShift = 0;
                if (!_this.viewModel.lightRainEnabled && !_this.viewModel.heavyRainEnabled
                    && !_this.viewModel.snowEnabled && !_this.viewModel.overcastEnabled
                    && !_this.viewModel.cloudyEnabled && !_this.viewModel.sunnyEnabled) {
                    cesiumViewer.style.filter = "brightness(1)";
                }
                break;
            case "大雨":
                _this.postProcessStages.remove(_this.stages[funcName]);
                _this.skyAtmosphere.hueShift = 0;
                _this.skyAtmosphere.saturationShift = 0;
                _this.skyAtmosphere.brightnessShift = 0;
                if (!_this.viewModel.lightRainEnabled && !_this.viewModel.moderateRainEnabled
                    && !_this.viewModel.snowEnabled && !_this.viewModel.overcastEnabled
                    && !_this.viewModel.cloudyEnabled && !_this.viewModel.sunnyEnabled) {
                    cesiumViewer.style.filter = "brightness(1)";
                }
                break;
            case "下雪":
                _this.postProcessStages.remove(_this.stages[funcName]);
                _this.skyAtmosphere.hueShift = 0;
                _this.skyAtmosphere.saturationShift = 0;
                _this.skyAtmosphere.brightnessShift = 0;
                if (!_this.viewModel.lightRainEnabled && !_this.viewModel.moderateRainEnabled
                    && !_this.viewModel.heavyRainEnabled && !_this.viewModel.overcastEnabled
                    && !_this.viewModel.cloudyEnabled && !_this.viewModel.sunnyEnabled) {
                    cesiumViewer.style.filter = "brightness(1)";
                }
                break;
            case "雨滴":
                _this.removeElement();
                break;
            case "闪电":
                _this.sign = true; // 关闭闪电
                break;
            case "阴天":
                _this.postProcessStages.remove(_this.stages[funcName]);
                _this.skyAtmosphere.hueShift = 0;
                _this.skyAtmosphere.saturationShift = 0;
                _this.skyAtmosphere.brightnessShift = 0;
                if (!_this.viewModel.lightRainEnabled && !_this.viewModel.moderateRainEnabled
                    && !_this.viewModel.heavyRainEnabled && !_this.viewModel.snowEnabled
                    && !_this.viewModel.cloudyEnabled && !_this.viewModel.sunnyEnabled) {
                    cesiumViewer.style.filter = "brightness(1)";
                }
                break;
            case "多云":
                _this.showStatus.cloud = false;
                _this.loadSkybox();
                if (!_this.viewModel.lightRainEnabled && !_this.viewModel.moderateRainEnabled
                    && !_this.viewModel.heavyRainEnabled && !_this.viewModel.snowEnabled
                    && !_this.viewModel.overcastEnabled && !_this.viewModel.sunnyEnabled) {
                    cesiumViewer.style.filter = "brightness(1)";
                }
                break;
            case "晴天":
                _this.showStatus.sun = false;
                _this.loadSkybox();
                if (!_this.viewModel.lightRainEnabled && !_this.viewModel.moderateRainEnabled
                    && !_this.viewModel.heavyRainEnabled && !_this.viewModel.snowEnabled
                    && !_this.viewModel.overcastEnabled && !_this.viewModel.cloudyEnabled) {
                    cesiumViewer.style.filter = "brightness(1)";
                }
                break;
            case "夜晚":
                var bloom = _this.viewer.scene.postProcessStages.bloom;
                clearInterval(this.darkTime);
                this.darkTime = setInterval(_this.changeToDayLight, 50);
                _this.viewer.scene.skyAtmosphere.show = true;
                break;
        }
    };
    Weather.prototype.rain = function (name, shader) {
        this.stages[name] = new Cesium.PostProcessStage({
            // this.stage = new Cesium.PostProcessStage({
            name: name,
            fragmentShader: shader
        });
        // 设置天空气氛
        this.postProcessStages.add(this.stages[name]);
        this.skyAtmosphere.hueShift = -0.8;
        this.skyAtmosphere.saturationShift = -0.7;
        this.skyAtmosphere.brightnessShift = -0.33;
        var cesiumViewer = document.querySelector(".cesium-viewer");
        cesiumViewer.style.filter = "brightness(1.2)";
    };
    Weather.prototype.raindrop = function () {
        var _a, _b;
        var hrElement;
        var counter = 200;
        var raindrop = document.querySelector("#raindrop");
        if (!raindrop) {
            var div = document.createElement("div");
            div.id = "raindrop";
            (_a = document.querySelector(".cesium-viewer")) === null || _a === void 0 ? void 0 : _a.appendChild(div);
        }
        for (var i = 0; i < counter; i++) {
            hrElement = document.createElement("HR");
            if (i === counter - 1) {
                hrElement.className = "raindrop";
                hrElement.style.display = "none";
            }
            else {
                hrElement.style.left = Math.floor(Math.random() * (window.innerWidth + 120)) + "px";
                hrElement.style.animationDuration = 0.5 + Math.random() * 0.3 + "s";
                hrElement.style.animationDelay = Math.random() * 5 + "s";
            }
            (_b = document.querySelector("#raindrop")) === null || _b === void 0 ? void 0 : _b.appendChild(hrElement);
        }
    };
    Weather.prototype.removeElement = function () {
        var _a;
        var raindrop = document.querySelector("#raindrop");
        if (raindrop) {
            (_a = document.querySelector(".cesium-viewer")) === null || _a === void 0 ? void 0 : _a.removeChild(raindrop);
        }
    };
    Weather.prototype.lightRain = function () {
        this.rain("小雨", this.shaderLight());
    };
    Weather.prototype.moderateRain = function () {
        this.rain("中雨", this.shaderMod());
    };
    Weather.prototype.heavyRain = function () {
        this.rain("大雨", this.shaderHeavy());
    };
    Weather.prototype.snow = function () {
        this.rain("下雪", this.shaderSnow());
        var cesiumViewer = document.querySelector(".cesium-viewer");
        if (cesiumViewer) {
            cesiumViewer.style.filter = "brightness(1.0)";
        }
    };
    Weather.prototype.overcast = function () {
        this.rain("阴天", this.shaderOvercast());
    };
    Weather.prototype.shaderLight = function () {
        return "uniform sampler2D colorTexture;\n " +
            "   varying vec2 v_textureCoordinates;\n " +
            " \n " +
            "    float hash(float x){\n " +
            "        return fract(sin(x*133.3)*13.13);\n " +
            " }\n " +
            " \n " +
            " void main(void){\n " +
            " \n " +
            "     float time = czm_frameNumber / 180.0;\n " + //time:雨出现的波数   越大越密集
            " vec2 resolution = czm_viewport.zw;\n " +
            " \n " +
            //uv:雨滴的多少
            " vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n " +
            " vec3 c=vec3(.4,.5,.6);\n " + //雨的离镜头远近
            " \n " +
            //雨出现的角度1：中间 ；4左上到右下
            " float a=-.1;\n " +
            " float si=sin(a),co=cos(a);\n " +
            " uv*=mat2(co,-si,si,co);\n " +
            //屏幕刷新频率
            " uv*=length(uv+vec2(0,4.9))*.10+3.;\n " +
            " \n " +
            //100,雨滴的多少
            " float v=1.-sin(hash(floor(uv.x*50.))*2.);\n " +
            //雨的宽度;最后一个参数：雨的透明度
            " float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*10.;\n " +
            " c*=v*b; \n " + //雨的颜色
            " \n " +
            //第二参数：离镜头远近；第3参数：背景透明度
            " gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,2), 0.2);  \n " +
            " }\n ";
    };
    Weather.prototype.shaderMod = function () {
        return "uniform sampler2D colorTexture;\n\ " +
            "   varying vec2 v_textureCoordinates;\n\ " +
            " \n\ " +
            "    float hash(float x){\n\ " +
            "        return fract(sin(x*133.3)*13.13);\n\ " +
            " }\n\ " +
            " \n\ " +
            " void main(void){\n\ " +
            " \n\ " +
            "     float time = czm_frameNumber / 120.0;\n\ " + //time:雨出现的波数   越大越密集
            " vec2 resolution = czm_viewport.zw;\n\ " +
            " \n\ " +
            //uv:雨滴的多少
            " vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\ " +
            " vec3 c=vec3(.6,.7,.8);\n\ " + //雨的离镜头远近
            " \n\ " +
            //雨出现的角度1：中间 ；4左上到右下
            " float a=-.2;\n\ " +
            " float si=sin(a),co=cos(a);\n\ " +
            " uv*=mat2(co,-si,si,co);\n\ " +
            //屏幕刷新频率
            " uv*=length(uv+vec2(0,4.9))*.10+2.;\n\ " +
            " \n\ " +
            //100,雨滴的多少
            " float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\ " +
            //雨的宽度;最后一个参数：雨的透明度
            " float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n\ " +
            " c*=v*b; \n\ " + //雨的颜色
            " \n\ " +
            //第二参数：离镜头远近；第3参数：背景透明度
            " gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,2), 0.2);  \n\ " +
            " }\n\ ";
    };
    Weather.prototype.shaderHeavy = function () {
        return "uniform sampler2D colorTexture;\n " +
            "   varying vec2 v_textureCoordinates;\n " +
            " \n " +
            "    float hash(float x){\n " +
            "        return fract(sin(x*133.3)*13.13);\n " +
            " }\n " +
            " \n " +
            " void main(void){\n " +
            " \n " +
            "     float time = czm_frameNumber / 90.0;\n " + //time:雨出现的波数   越大越密集
            " vec2 resolution = czm_viewport.zw;\n " +
            " \n " +
            //uv:雨滴的多少
            " vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n " +
            " vec3 c=vec3(.6,.7,.8);\n " + //雨的离镜头远近
            " \n " +
            //雨出现的角度1：中间 ；4左上到右下
            " float a=-.1;\n " +
            " float si=sin(a),co=cos(a);\n " +
            " uv*=mat2(co,-si,si,co);\n " +
            //屏幕刷新频率
            " uv*=length(uv+vec2(0,4.9))*.10+3.;\n " +
            " \n " +
            //100,雨滴的多少
            " float v=1.-sin(hash(floor(uv.x*100.))*2.);\n " +
            //雨的宽度;最后一个参数：雨的透明度
            " float b=clamp(abs(sin(20.*time*v+uv.y*(5./(3.+v))))-.95,0.,1.)*50.;\n " +
            " c*=v*b; \n " + //雨的颜色
            " \n " +
            //第二参数：离镜头远近；第3参数：背景透明度
            " gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.2);  \n " +
            " }\n ";
    };
    Weather.prototype.shaderSnow = function () {
        return "uniform sampler2D colorTexture;\n\
                varying vec2 v_textureCoordinates;\n\
                \n\
                float snow(vec2 uv,float scale)\n\
                {\n\
                    float time = czm_frameNumber / 60.0;\n\
                    float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
                    uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
                    uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
                    p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
                    k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
                    return k*w;\n\
                }\n\
                \n\
                void main(void){\n\
                    vec2 resolution = czm_viewport.zw;\n\
                    vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                    vec3 finalColor=vec3(0);\n\
                    float c = 0.0;\n\
                    c+=snow(uv,30.)*.0;\n\
                    c+=snow(uv,20.)*.0;\n\
                    c+=snow(uv,15.)*.0;\n\
                    c+=snow(uv,10.);\n\
                    c+=snow(uv,8.);\n\
                c+=snow(uv,6.);\n\
                    c+=snow(uv,5.);\n\
                    finalColor=(vec3(c)); \n\
                    gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.5); \n\
                \n\
                }\n\
                ";
    };
    Weather.prototype.shaderOvercast = function () {
        return "uniform sampler2D colorTexture;\n " +
            "   varying vec2 v_textureCoordinates;\n " +
            " \n " +
            "    float hash(float x){\n " +
            "        return fract(sin(x*133.3)*13.13);\n " +
            " }\n " +
            " \n " +
            " void main(void){\n " +
            " \n " +
            "     float time = czm_frameNumber / 180.0;\n " + //time:雨出现的波数   越大越密集
            " vec2 resolution = czm_viewport.zw;\n " +
            " \n " +
            //uv:雨滴的多少
            " vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n " +
            " vec3 c=vec3(.4,.5,.6);\n " + //雨的离镜头远近
            " \n " +
            //雨出现的角度1：中间 ；4左上到右下
            " float a=-.2;\n " +
            " float si=sin(a),co=cos(a);\n " +
            " uv*=mat2(co,-si,si,co);\n " +
            //屏幕刷新频率
            " uv*=length(uv+vec2(0,4.9))*.10+3.;\n " +
            " \n " +
            //100,雨滴的多少
            " float v=1.-sin(hash(floor(uv.x*50.))*2.);\n " +
            //雨的宽度;最后一个参数：雨的透明度
            " float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*1.;\n " +
            " c*=v*b; \n " + //雨的颜色
            " \n " +
            //第二参数：离镜头远近；第3参数：背景透明度
            " gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,2), 0.2);  \n " +
            " }\n ";
    };
    Weather.prototype.shaderFog = function (delta) {
        // console.log(delta);
        return "uniform sampler2D colorTexture;\n" +
            "  uniform sampler2D depthTexture;\n" +
            "  varying vec2 v_textureCoordinates;\n" +
            "  void main(void)\n" +
            "  {\n" +
            "      vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);\n" +
            "      vec4 fogcolor=vec4(0.5,0.5,0.5," + delta + ");\n" +
            "      float depth = czm_readDepth(depthTexture, v_textureCoordinates);\n" +
            "      vec4 depthcolor=texture2D(depthTexture, v_textureCoordinates);\n" +
            "      float f=(depthcolor.r-0.7)/0.2;\n" +
            "      if(f<0.0) f=0.0;\n" +
            "      else if(f>1.0) f=1.0;\n" +
            "      gl_FragColor = mix(origcolor,fogcolor,f);\n" +
            "   }";
    };
    Weather.prototype.thunderstorm = function () {
        this.sign = false;
        this.timeout();
    };
    Weather.prototype.timeout = function () {
        var _this_1 = this;
        if (this.sign) {
            return;
        }
        var cesiumViewer = document.querySelector(".cesium-viewer");
        setTimeout(function () {
            cesiumViewer.style.filter = "brightness(1.8)";
            setTimeout(function () {
                cesiumViewer.style.filter = "brightness(1.7)";
                setTimeout(function () {
                    cesiumViewer.style.filter = "brightness(1.6)";
                    setTimeout(function () {
                        cesiumViewer.style.filter = "brightness(1.5)";
                        setTimeout(function () {
                            cesiumViewer.style.filter = "brightness(1.4)";
                            setTimeout(function () {
                                cesiumViewer.style.filter = "brightness(1.3)";
                            }, 20);
                        }, 20);
                    }, 19);
                }, 12);
            }, 10);
        }, 1);
        setTimeout(function () {
            _this_1.timeout();
        }, 4000);
        cesiumViewer.style.filter = "brightness(1.0)";
    };
    Weather.prototype.addRainDrop = function () {
        var _this = this;
        this.raindrop();
        function load() {
            var raindrop = document.querySelector("#raindrop");
            if (!raindrop) {
                window.removeEventListener("resize", load, true);
            }
            else {
                _this.removeElement();
                _this.raindrop();
            }
        }
        window.addEventListener("resize", load, true);
        this.stage = "addRainDrop";
        var cesiumViewer = document.querySelector(".cesium-viewer");
        cesiumViewer.style.filter = "brightness(1.0)";
    };
    Weather.prototype.cloudy = function () {
        this.showStatus.cloud = true;
        if (this.showStatus.sun) {
            this.viewModel.sunnyEnabled = false;
        }
        // 关闭大气层否则近地情况下的天空是蓝色的
        this.skyAtmosphere.show = false;
        // @ts-ignore
        this.viewer.scene.skyBox = new Cesium.GroundSkyBox({
            sources: {
                positiveX: "./img/weather/cloudy/Right.jpg",
                negativeX: "./img/weather/cloudy/Left.jpg",
                positiveY: "./img/weather/cloudy/Front.jpg",
                negativeY: "./img/weather/cloudy/Back.jpg",
                positiveZ: "./img/weather/cloudy/Up.jpg",
                negativeZ: "./img/weather/cloudy/Down.jpg"
            }
        });
        this.stage = "Cloudy";
        var cesiumViewer = document.querySelector(".cesium-viewer");
        cesiumViewer.style.filter = "brightness(1.0)";
    };
    Weather.prototype.sunny = function () {
        this.showStatus.sun = true;
        if (this.showStatus.cloud) {
            this.viewModel.cloudyEnabled = false;
        }
        this.skyAtmosphere.show = false;
        try {
            // @ts-ignore
            this.viewer.scene.skyBox = new Cesium.GroundSkyBox({
                sources: {
                    positiveX: "./img/weather/sunny/Right.bmp",
                    negativeX: "./img/weather/sunny/Left.bmp",
                    positiveY: "./img/weather/sunny/Front.bmp",
                    negativeY: "./img/weather/sunny/Back.bmp",
                    positiveZ: "./img/weather/sunny/Up.bmp",
                    negativeZ: "./img/weather/sunny/Down.bmp"
                }
            });
        }
        catch (error) {
            console.log(error);
        }
        this.stage = "sunny";
        var cesiumViewer = document.querySelector(".cesium-viewer");
        cesiumViewer.style.filter = "brightness(1.3)";
    };
    Weather.prototype.darkness = function () {
        clearInterval(this.darkTime);
        var bloom = this.viewer.scene.postProcessStages.bloom;
        bloom.enabled = true;
        bloom.uniforms.glowOnly = true;
        bloom.uniforms.contrast = -11.28;
        bloom.uniforms.brightness = -0.01;
        bloom.uniforms.delta = 1;
        bloom.uniforms.sigma = 1;
        bloom.uniforms.stepSize = 0;
        this.darkTime = setInterval(this.changeToDark, 50);
        this.viewer.scene.skyAtmosphere.show = false;
    };
    Weather.prototype.changeToDark = function () {
        var bloom = this.viewer.scene.postProcessStages.bloom;
        var contrast = bloom.uniforms.contrast;
        var brightness = bloom.uniforms.brightness;
        var delta = bloom.uniforms.delta;
        var sigma = bloom.uniforms.sigma;
        var stepSize = bloom.uniforms.stepSize;
        var contrastPer = (164 - (-11.28)) / 100;
        if (contrast < 164) {
            contrast += contrastPer;
            bloom.uniforms.contrast = contrast;
        }
        var brightnessPer = (-0.2 - (-0.01)) / 100;
        if (brightness > -0.2) {
            brightness += brightnessPer;
            bloom.uniforms.brightness = brightness;
        }
        var deltaPer = (1 - 0.9) / 100;
        if (delta > 0.9) {
            delta -= deltaPer;
            bloom.uniforms.delta = delta;
        }
        var sigmaPer = (1 - 0.2) / 100;
        if (sigma > 0.2) {
            sigma -= sigmaPer;
            bloom.uniforms.sigma = sigma;
        }
        var stepSizePer = (2.4 - 0) / 100;
        if (stepSize < 2.4) {
            stepSize += stepSizePer;
            bloom.uniforms.stepSize = stepSize;
        }
        if (contrast >= 164 && brightness <= -0.2 && delta <= 0.9 && sigma <= 0.2 && stepSize >= 2.4) {
            clearInterval(this.darkTime);
        }
    };
    Weather.prototype.changeToDayLight = function () {
        var bloom = this.viewer.scene.postProcessStages.bloom;
        var contrast = bloom.uniforms.contrast;
        var brightness = bloom.uniforms.brightness;
        var delta = bloom.uniforms.delta;
        var sigma = bloom.uniforms.sigma;
        var stepSize = bloom.uniforms.stepSize;
        var contrastPer = (164 - (-11.28)) / 100;
        if (contrast > -11.28) {
            contrast -= contrastPer;
            bloom.uniforms.contrast = contrast;
        }
        var brightnessPer = (-0.2 - (-0.01)) / 100;
        if (brightness < -0.01) {
            brightness -= brightnessPer;
            bloom.uniforms.brightness = brightness;
        }
        var deltaPer = (1 - 0.9) / 100;
        if (delta < 1) {
            delta += deltaPer;
            bloom.uniforms.delta = delta;
        }
        var sigmaPer = (1 - 0.2) / 100;
        if (sigma < 1) {
            sigma += sigmaPer;
            bloom.uniforms.sigma = sigma;
        }
        var stepSizePer = (2.4 - 0) / 100;
        if (stepSize > 0) {
            stepSize -= stepSizePer;
            bloom.uniforms.stepSize = stepSize;
        }
        if (contrast <= -11.28 && brightness >= -0.01 && delta >= 1 && sigma >= 1 && stepSize <= 0) {
            clearInterval(this.darkTime);
            bloom.enabled = false;
        }
    };
    Weather.prototype.screenFog = function (delta) {
        var fragmentShader = "  uniform sampler2D colorTexture;\n" +
            "  uniform sampler2D depthTexture;\n" +
            "  varying vec2 v_textureCoordinates;\n" +
            "  void main(void)\n" +
            "  {\n" +
            "      vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);\n" +
            "      vec4 fogcolor=vec4(0.8,0.8,0.8," + delta + ");\n" +
            "\n" +
            "      float depth = czm_readDepth(depthTexture, v_textureCoordinates);\n" +
            "      vec4 depthcolor=texture2D(depthTexture, v_textureCoordinates);\n" +
            "\n" +
            "      float f=(depthcolor.r-0.22)/0.2;\n" +
            "      if(f<0.0) f=0.0;\n" +
            "      else if(f>1.0) f=1.0;\n" +
            "      gl_FragColor = mix(origcolor,fogcolor,f);\n" +
            "   }";
        this.FogStage = Cesium.PostProcessStageLibrary.createBrightnessStage();
        this.FogStage.uniforms.brightness = 2; //整个场景通过后期渲染变亮 1为保持不变 大于1变亮 0-1变暗 uniforms后面为对应glsl里面定义的uniform参数
        this.FogStage = new Cesium.PostProcessStage({
            "name": "self",
            //sampleMode:PostProcessStageSampleMode.LINEAR,
            fragmentShader: fragmentShader
        });
        this.viewer.scene.postProcessStages.add(this.FogStage);
        this.FogStage.enabled = true;
        // console.log(this.FogStage);
        this.stage = "fog";
    };
    /**
     * 加载天空盒子
     * @param {string} sources 天空盒子图片路径 如果不传表示恢复默认天空盒子
     * @param {string} sources.negativeX
     * @param {string} sources.negativeX
     * @param {string} sources.positiveY
     * @param {string} sources.negativeY
     * @param {string} sources.positiveZ
     * @param {string} sources.negativeZ
     */
    Weather.prototype.loadSkybox = function (sources) {
        this.skyAtmosphere.show = !sources;
        var source = Cesium.defaultValue(sources, this.defaultSkyBoxSource);
        // @ts-ignore
        this.viewer.scene.skyBox = new Cesium.GroundSkyBox({
            sources: source
        });
    };
    Weather.prototype.clear = function () {
        var cesiumViewer = document.querySelector(".cesium-viewer");
        if (this.stage == "sunny" || this.stage == "Cloudy") {
            this.loadSkybox();
            cesiumViewer.style.filter = "brightness(1)";
            this.stage = null;
        }
        if (this.stage == "thunderstorm" || this.stage == "addRainDrop") {
            this.removeElement();
            this.stage = null;
            cesiumViewer.style.filter = "brightness(1)";
        }
        if (this.stage == "darkness") {
            // this.layer.show = false;
            this.stage = null;
            // 关闭黑夜时，将时间重新设置为白天
            // this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date('2021-01-01T12:00:00'));
            this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
        }
        if (this.snowLayer == "snow") {
            // object.water.snow.end();
            this.viewer.entities.remove(this.snowPolygon);
            this.snowLayer = "";
        }
        if (this.stage) {
            this.sign = true;
            this.postProcessStages.remove(this.stage);
            this.stage = null;
            this.skyAtmosphere.hueShift = 0;
            this.skyAtmosphere.saturationShift = 0;
            this.skyAtmosphere.brightnessShift = 0;
            cesiumViewer.style.filter = "brightness(1)";
        }
    };
    return Weather;
}());
export default Weather;
