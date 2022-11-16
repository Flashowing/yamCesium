import "./layer.css";
var layer = /** @class */ (function () {
    function layer() {
    }
    layer.close = function (index) {
        var layerContainer = document.querySelector("#yam-layer-container" + index);
        if (layerContainer) {
            layerContainer.remove();
        }
    };
    layer.alert = function (content, options, yes) {
        var layerOptions = {
            title: false,
            type: 0,
            content: content,
            skin: "yam-layer-title-lan",
            shade: 0.3,
            shadeClose: true,
            move: true,
            yes: yes || function () {
                layer.close(layer.layerId);
            }
        };
        if (options) {
            Object.assign(layerOptions, options);
        }
        this.open(layerOptions);
    };
    layer.confirm = function (content, options) {
        var _this = this;
        if (arguments.length === 1) {
            options = content;
            content = options.content;
        }
        var layerOptions = {
            title: false,
            type: 0,
            content: content,
            skin: "yam-layer-title-lan",
            shade: 0.3,
            shadeClose: true,
            move: true
        };
        if (options) {
            Object.assign(layerOptions, options);
        }
        return this.open(layerOptions).then(function (layerId) {
            return new Promise(function (resolve, reject) {
                var btn = document.createElement("div");
                btn.classList.add("yam-layer-btn");
                var yes = document.createElement("a");
                yes.classList.add("yam-layer-btn-yes");
                yes.innerHTML = "确定";
                btn.appendChild(yes);
                yes.addEventListener("click", function () {
                    resolve(layerId);
                });
                var cancel = document.createElement("a");
                cancel.classList.add("yam-layer-btn-cancel");
                cancel.innerHTML = "取消";
                btn.appendChild(cancel);
                cancel.addEventListener("click", function () {
                    reject(layerId);
                });
                var layer = document.querySelector("#yam-layer".concat(_this.layerId));
                layer.appendChild(btn);
            });
        });
    };
    layer.open = function (options) {
        var _this = this;
        var _a;
        this.close(this.layerId);
        if (typeof options.title == "undefined") {
            options.title = "信息";
        }
        var layerDiv = document.createElement("div");
        var html = "\n     <div class=\"yam-layer-shade\" id=\"yam-layer-shade".concat(this.layerId, "\" style=\"z-index: ").concat(this.zIndex++, ";background-color: rgb(0, 0, 0); opacity: 0.3;\"></div>\n     <div class=\"yam-layer yam-layer-dialog\" id=\"yam-layer").concat(this.layerId, "\" style=\"z-index: ").concat(this.zIndex++, ";\">\n       <div class=\"yam-layer-title\">").concat(options.title, "</div>\n        <div class=\"yam-layer-content\">").concat(options.content, "</div>\n    </div>\n     ");
        layerDiv.innerHTML = html;
        layerDiv.id = "yam-layer-container" + this.layerId;
        document.body.appendChild(layerDiv);
        var layer = document.querySelector("#yam-layer".concat(this.layerId));
        if (options.title == false) {
            (_a = layer === null || layer === void 0 ? void 0 : layer.querySelector(".yam-layer-title")) === null || _a === void 0 ? void 0 : _a.remove();
        }
        var clientWidth = layer.clientWidth;
        var clientHeight = layer.clientHeight;
        var windowHeight = window.innerHeight;
        var windowWidth = window.innerWidth;
        var top = (windowHeight - clientHeight) / 2;
        var left = windowWidth / 2 - clientWidth / 2;
        layer.style.top = top + "px";
        layer.style.left = left + "px";
        if (options.offset) {
            if (typeof options.offset === "string") {
                switch (options.offset) {
                    case "auto":
                        layer.style.top = top + "px";
                        layer.style.left = left + "px";
                        break;
                    case "t":
                        layer.style.top = "0px";
                        layer.style.left = left + "px";
                        break;
                    case "r":
                        layer.style.top = top + "px";
                        layer.style.left = windowWidth - clientWidth + "px";
                        break;
                    case "b":
                        layer.style.top = windowHeight - clientHeight + "px";
                        layer.style.left = left + "px";
                        break;
                    case "l":
                        layer.style.top = top + "px";
                        layer.style.left = "0px";
                        break;
                    case "lt":
                        layer.style.top = "0px";
                        layer.style.left = "0px";
                        break;
                    case "lb":
                        layer.style.top = windowHeight - clientHeight + "px";
                        layer.style.left = "0px";
                        break;
                    case "rt":
                        layer.style.top = "0px";
                        layer.style.left = windowWidth - clientWidth + "px";
                        break;
                    case "rb":
                        layer.style.top = windowHeight - clientHeight + "px";
                        layer.style.left = windowWidth - clientWidth + "px";
                        break;
                    default:
                        layer.style.top = options.offset;
                        layer.style.left = left + "px";
                }
            }
            else {
                layer.style.top = options.offset[0] + "px";
                layer.style.left = options.offset[1] + "px";
            }
        }
        if (options.skin) {
            layer.classList.add(options.skin);
        }
        if (options.area) {
            if (typeof options.area === "string") {
                var area = options.area.split(" ");
                layer.style.width = area[0];
                layer.style.height = area[1];
            }
            else {
                layer.style.width = options.area[0] + "px";
                layer.style.height = options.area[1] + "px";
            }
        }
        if (options.closeBtn) {
            var closeBtn = document.createElement("span");
            closeBtn.classList.add("yam-layer-close");
            closeBtn.innerHTML = "×";
            layer.appendChild(closeBtn);
            closeBtn.addEventListener("click", function () {
                _this.close(_this.layerId);
            });
        }
        var shade = document.querySelector("#yam-layer-shade".concat(this.layerId));
        if (options.shade) {
            if (typeof options.shade === "number") {
                shade.style.backgroundColor = "rgba(0,0,0,".concat(options.shade, ")");
            }
            else if (typeof options.shade === "boolean") {
                shade.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
            }
            else {
                shade.style.backgroundColor = "rgba(".concat(options.shade[0], ",").concat(options.shade[1], ",").concat(options.shade[2], ",").concat(options.shade[3], ")");
            }
        }
        else {
            shade.style.display = "none";
        }
        if (options.shadeClose) {
            var shade_1 = document.querySelector("#yam-layer-shade".concat(this.layerId));
            shade_1.addEventListener("click", function () {
                _this.close(_this.layerId);
            });
        }
        if (options.time) {
            setTimeout(function () {
                _this.close(_this.layerId);
            }, options.time);
        }
        if (options.resize) {
            window.addEventListener("resize", function () {
                var clientWidth = layer.clientWidth;
                var clientHeight = layer.clientHeight;
                var windowHeight = window.innerHeight;
                var windowWidth = window.innerWidth;
                var top = (windowHeight - clientHeight) / 2;
                var left = windowWidth / 2 - clientWidth / 2;
                layer.style.top = top + "px";
                layer.style.left = left + "px";
            });
        }
        if (options.move) {
            if (typeof options.move === "string") {
                var move = document.querySelector(options.move);
                move.style.userSelect = "none";
                move.style.cursor = "move";
                move.addEventListener("mousedown", function (e) {
                    var x = e.clientX - layer.offsetLeft;
                    var y = e.clientY - layer.offsetTop;
                    document.onmousemove = function (e) {
                        layer.style.left = e.clientX - x + "px";
                        layer.style.top = e.clientY - y + "px";
                        // 拖动div，禁止拖动超出屏幕
                        if (e.clientX - x < 0) {
                            layer.style.left = 0 + "px";
                        }
                        if (e.clientX - x > window.innerWidth - layer.clientWidth) {
                            layer.style.left = window.innerWidth - layer.clientWidth + "px";
                        }
                        if (e.clientY - y < 0) {
                            layer.style.top = 0 + "px";
                        }
                        if (e.clientY - y > window.innerHeight - layer.clientHeight) {
                            layer.style.top = window.innerHeight - layer.clientHeight + "px";
                        }
                    };
                    document.onmouseup = function () {
                        document.onmousemove = null;
                        document.onmouseup = null;
                    };
                });
            }
            else {
                var move = document.querySelector("#yam-layer".concat(this.layerId, " .yam-layer-title"));
                if (move) {
                    move.style.userSelect = "none";
                    move.style.cursor = "move";
                    move.addEventListener("mousedown", function (e) {
                        var x = e.clientX - layer.offsetLeft;
                        var y = e.clientY - layer.offsetTop;
                        document.onmousemove = function (e) {
                            layer.style.left = e.clientX - x + "px";
                            layer.style.top = e.clientY - y + "px";
                            // 拖动div，禁止拖动超出屏幕
                            if (e.clientX - x < 0) {
                                layer.style.left = 0 + "px";
                            }
                            if (e.clientX - x > window.innerWidth - layer.clientWidth) {
                                layer.style.left = window.innerWidth - layer.clientWidth + "px";
                            }
                            if (e.clientY - y < 0) {
                                layer.style.top = 0 + "px";
                            }
                            if (e.clientY - y > window.innerHeight - layer.clientHeight) {
                                layer.style.top = window.innerHeight - layer.clientHeight + "px";
                            }
                        };
                        document.onmouseup = function () {
                            document.onmousemove = null;
                            document.onmouseup = null;
                        };
                    });
                }
            }
        }
        // if (options.yes) {
        //   const btn = document.createElement("div");
        //   btn.classList.add("yam-layer-btn");
        //   const yes = document.createElement("a");
        //   yes.classList.add("yam-layer-btn-yes");
        //   yes.innerHTML = "确定";
        //   btn.appendChild(yes);
        //   yes.addEventListener("click", () => {
        //     options.yes && options.yes(this.layerId);
        //   });
        //   if (options.cancel) {
        //     const cancel = document.createElement("a");
        //     cancel.classList.add("yam-layer-btn-cancel");
        //     cancel.innerHTML = "取消";
        //     btn.appendChild(cancel);
        //     cancel.addEventListener("click", () => {
        //       options.cancel && options.cancel(this.layerId);
        //     });
        //   }
        //   layer.appendChild(btn);
        // }
        this.layers.push(this.layerId);
        // return this.layerId;
        return new Promise(function (resolve, reject) {
            resolve(_this.layerId);
        });
    };
    layer.layers = [];
    layer.zIndex = 20001123;
    layer.layerId = 10000;
    return layer;
}());
export default layer;
