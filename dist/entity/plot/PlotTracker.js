import PlotPointDrawer from "./PlotPointDrawer";
import "./css/plot.css";
import PlotPolylineDrawer from "./PlotPolylineDrawer";
import PlotPolygonDrawer from "./PlotPolygonDrawer";
import PlotCircleDrawer from "./PlotCircleDrawer";
import PlotRectangleDrawer from "./PlotRectangleDrawer";
import PlotAttackArrowDrawer from "./PlotAttackArrowDrawer";
import PlotPincerArrowDrawer from "./PlotPincerArrowDrawer";
import PlotStraightArrowDrawer from "./PlotStraightArrowDrawer";
var PlotTracker = /** @class */ (function () {
    function PlotTracker(viewer) {
        this.ctrArr = [];
        this.viewer = viewer;
        this.pointDrawer = new PlotPointDrawer(viewer);
        this.polylineDrawer = new PlotPolylineDrawer(viewer);
        this.polygonDrawer = new PlotPolygonDrawer(viewer);
        this.rectangleDrawer = new PlotRectangleDrawer(viewer);
        this.circleDrawer = new PlotCircleDrawer(viewer);
        this.attackArrowDrawer = new PlotAttackArrowDrawer(viewer);
        this.pincerArrowDrawer = new PlotPincerArrowDrawer(viewer);
        this.straightArrowDrawer = new PlotStraightArrowDrawer(viewer);
        this.ctrArr.push(this.pointDrawer);
    }
    PlotTracker.prototype.clear = function () {
        for (var i = 0; i < this.ctrArr.length; i++) {
            try {
                var ctr = this.ctrArr[i];
                if (ctr.clear) {
                    ctr.clear();
                }
            }
            catch (err) {
                console.log("发生未知出错：GlobeTracker.clear");
            }
        }
    };
    PlotTracker.prototype.trackPoint = function (options) {
        this.clear();
        if (this.pointDrawer == null) {
            this.pointDrawer = new PlotPointDrawer(this.viewer);
            this.ctrArr.push(this.pointDrawer);
        }
        return this.pointDrawer.startDrawPoint(options);
    };
    PlotTracker.prototype.trackPolyline = function (options) {
        this.clear();
        if (this.polylineDrawer == null) {
            this.polylineDrawer = new PlotPolylineDrawer(this.viewer);
            this.ctrArr.push(this.polylineDrawer);
        }
        return this.polylineDrawer.startDrawPolyline(options);
    };
    PlotTracker.prototype.trackPolygon = function (options) {
        this.clear();
        if (this.polygonDrawer == null) {
            this.polygonDrawer = new PlotPolygonDrawer(this.viewer);
            this.ctrArr.push(this.polygonDrawer);
        }
        return this.polygonDrawer.startDrawPolygon(options);
    };
    PlotTracker.prototype.trackRectangle = function (options) {
        this.clear();
        if (this.rectangleDrawer == null) {
            this.rectangleDrawer = new PlotRectangleDrawer(this.viewer);
            this.ctrArr.push(this.rectangleDrawer);
        }
        return this.rectangleDrawer.startDrawRectangle(options);
    };
    PlotTracker.prototype.trackCircle = function (options) {
        this.clear();
        if (this.circleDrawer == null) {
            this.circleDrawer = new PlotCircleDrawer(this.viewer);
            this.ctrArr.push(this.circleDrawer);
        }
        return this.circleDrawer.startDrawCircle(options);
    };
    PlotTracker.prototype.trackAttackArrow = function (options) {
        this.clear();
        if (this.attackArrowDrawer == null) {
            this.attackArrowDrawer = new PlotAttackArrowDrawer(this.viewer);
            this.ctrArr.push(this.attackArrowDrawer);
        }
        return this.attackArrowDrawer.startDrawAttackArrow(options);
    };
    PlotTracker.prototype.trackPincerArrow = function (options) {
        this.clear();
        if (this.pincerArrowDrawer == null) {
            this.pincerArrowDrawer = new PlotPincerArrowDrawer(this.viewer);
            this.ctrArr.push(this.pincerArrowDrawer);
        }
        return this.pincerArrowDrawer.startDrawPincerArrow(options);
    };
    PlotTracker.prototype.trackStraightArrow = function (options) {
        this.clear();
        if (this.straightArrowDrawer == null) {
            this.straightArrowDrawer = new PlotStraightArrowDrawer(this.viewer);
            this.ctrArr.push(this.straightArrowDrawer);
        }
        return this.straightArrowDrawer.startDrawStraightArrow(options);
    };
    return PlotTracker;
}());
export default PlotTracker;
