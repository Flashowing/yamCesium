import * as Cesium from "cesium";
import PrimitiveCluster from "./PrimitiveCluster";
var ClusterUtil = /** @class */ (function () {
    /**
     * 聚合
     * @param {Cesium.Viewer} viewer
     */
    function ClusterUtil(viewer) {
        this._viewer = viewer;
        this._myPrimitives = this._viewer.scene.primitives.add(new Cesium.PrimitiveCollection());
        this._myBillboardCollection = new Cesium.BillboardCollection();
        this._myPrimitiveCluster = new PrimitiveCluster();
    }
    Object.defineProperty(ClusterUtil.prototype, "viewer", {
        /**
         * @constant
         * @desc Cesium.Viewer
         */
        get: function () {
            return this._viewer;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClusterUtil.prototype, "myPrimitives", {
        /**
         * @constant Cesium.PrimitiveCollection
         * @desc 原语集合，可以包含页面显示的pointPrimitiveCollection、billboardCollection、labelCollection、primitiveCollection、primitiveCluster
         */
        get: function () {
            return this._myPrimitives;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClusterUtil.prototype, "myPrimitiveCluster", {
        /**
         * @constant
         * @desc 自定义原语集群
         */
        // @ts-ignore
        get: function () {
            return this._myPrimitiveCluster;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClusterUtil.prototype, "myBillboardCollection", {
        /**
         * @constant
         * @desc 广告牌集合(站点显示的内容数据)
         */
        get: function () {
            return this._myBillboardCollection;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * @param {Object} options 具有以下属性的对象
     * @param {Number} options.delay=800 防抖处理定时器的time
     * @param {Boolean} options.enabled=true 是否启用集群
     * @param {Number} options.pixelRange=15 用于扩展屏幕空间包围框的像素范围
     * @param {Number} options.minimumClusterSize=2 可集群的屏幕空间对象的最小数量
     * @param {Function} options.customStyle 自定义样式
     * @desc 处理原语集合，并实现聚合集群功能方法
     */
    ClusterUtil.prototype.load = function (options) {
        if (options === void 0) { options = {}; }
        this.myPrimitives.add(this.myPrimitiveCluster);
        this.myPrimitiveCluster.delay = Cesium.defaultValue(options.delay, 800);
        this.myPrimitiveCluster.enabled = Cesium.defaultValue(options.enabled, true);
        this.myPrimitiveCluster.pixelRange = Cesium.defaultValue(options.pixelRange, 15);
        this.myPrimitiveCluster.minimumClusterSize = Cesium.defaultValue(options.minimumClusterSize, 2);
        this.myPrimitiveCluster._billboardCollection = this.myBillboardCollection;
        this.myPrimitiveCluster._initialize(this._viewer.scene);
        var removeListener;
        var pinBuilder = new Cesium.PinBuilder();
        /* 定义广告牌 fromText（显示文字，颜色，大小） */
        var pin50 = pinBuilder.fromText("50+", Cesium.Color.RED, 40).toDataURL();
        var pin40 = pinBuilder.fromText("40+", Cesium.Color.ORANGE, 40).toDataURL();
        var pin30 = pinBuilder.fromText("30+", Cesium.Color.YELLOW, 40).toDataURL();
        var pin20 = pinBuilder.fromText("20+", Cesium.Color.GREEN, 40).toDataURL();
        var pin10 = pinBuilder.fromText("10+", Cesium.Color.BLUE, 40).toDataURL();
        /* 数量小于十个的聚合广告牌 */
        var singleDigitPins = new Array(8);
        for (var i = 0; i < singleDigitPins.length; ++i) {
            singleDigitPins[i] = pinBuilder
                .fromText("" + (i + 2), Cesium.Color.VIOLET, 40)
                .toDataURL();
        }
        var _ = this;
        function customStyle() {
            if (Cesium.defined(removeListener)) {
                if (removeListener) {
                    removeListener();
                }
                removeListener = undefined;
            }
            else {
                removeListener = _.myPrimitiveCluster.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
                    cluster.label.show = false;
                    cluster.billboard.show = true;
                    cluster.billboard.id = cluster.label.id;
                    cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                    /* 根据站点(参数)的数量给予对应的广告牌  */
                    if (clusteredEntities.length >= 50) {
                        cluster.billboard.image = pin50;
                    }
                    else if (clusteredEntities.length >= 40) {
                        cluster.billboard.image = pin40;
                    }
                    else if (clusteredEntities.length >= 30) {
                        cluster.billboard.image = pin30;
                    }
                    else if (clusteredEntities.length >= 20) {
                        cluster.billboard.image = pin20;
                    }
                    else if (clusteredEntities.length >= 10) {
                        cluster.billboard.image = pin10;
                    }
                    else {
                        cluster.billboard.image =
                            singleDigitPins[clusteredEntities.length - 2];
                    }
                });
            }
            // force a re-cluster with the new styling
            var pixelRange = _.myPrimitiveCluster.pixelRange;
            _.myPrimitiveCluster.pixelRange = 0;
            _.myPrimitiveCluster.pixelRange = pixelRange;
        }
        // start with custom style
        options.customStyle ? options.customStyle(_, removeListener, _.myPrimitiveCluster) : customStyle();
        // customStyle();
        return {
            billboard: this.myBillboardCollection,
            primitive: this.myPrimitives
        };
    };
    /**
     * @params enable bool值控制开启或关闭集群
     * @desc 控制集群生效与否
     */
    ClusterUtil.prototype.enableCluster = function (enable) {
        if (Cesium.defined(this.myPrimitiveCluster)) {
            this.myPrimitiveCluster.enabled = enable;
        }
    };
    /**
     * @params id 站点ID
     * @return 返回可操作的广告牌[siteBillboard.image = 'xxxx']
     * @desc 根据id在集合中获取指定站点广告牌
     */
    ClusterUtil.prototype.getSiteBillboardById = function (id) {
        if (!Cesium.defined(this.myBillboardCollection))
            return undefined;
        var _b = this.myBillboardCollection;
        var l = _b.length;
        var siteBillboard = undefined;
        for (var i = 0; i < l; i++) {
            if (id == _b.get(i).id) {
                siteBillboard = _b.get(i);
                break;
            }
        }
        return siteBillboard;
    };
    /**
     * @desc 删除所有站点广告牌
     */
    ClusterUtil.prototype.removeAll = function () {
        if (Cesium.defined(this.myPrimitives)) {
            this._viewer.scene.primitives.remove(this.myPrimitives);
        }
    };
    /**
     * @params show bool值 控制显示或隐藏
     * @desc 隐藏或显示所有站点广告牌
     */
    ClusterUtil.prototype.showStatus = function (show) {
        if (show === void 0) { show = true; }
        this.myPrimitives.show = show;
    };
    /**
     * @desc 根据id删除指定站点广告牌
     */
    ClusterUtil.prototype.remove = function (id) {
        var billboard = this.getSiteBillboardById(id);
        billboard && this.myBillboardCollection.remove(billboard);
    };
    /**
     * @desc 销毁
     */
    ClusterUtil.prototype.destroy = function () {
        this.myPrimitives.destroy();
        this.myPrimitiveCluster.destroy();
        this.myBillboardCollection.destroy();
        // this._viewer.scene.primitives.destroy()
    };
    return ClusterUtil;
}());
export default ClusterUtil;
