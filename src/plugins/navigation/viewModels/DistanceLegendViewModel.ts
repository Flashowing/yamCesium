/* eslint-disable no-unused-vars */
import Cesium from "../../../cesium/Cesium";
import loadView from "../core/loadView";

const defined = Cesium.defined;
const DeveloperError = Cesium.DeveloperError;
const EllipsoidGeodesic = Cesium.EllipsoidGeodesic;
const Cartesian2 = Cesium.Cartesian2;
const getTimestamp = Cesium.getTimestamp;
const EventHelper = Cesium.EventHelper;
const Knockout = Cesium.knockout;

const geodesic = new EllipsoidGeodesic();

const distances = [
  1, 2, 3, 5,
  10, 20, 30, 50,
  100, 200, 300, 500,
  1000, 2000, 3000, 5000,
  10000, 20000, 30000, 50000,
  100000, 200000, 300000, 500000,
  1000000, 2000000, 3000000, 5000000,
  10000000, 20000000, 30000000, 50000000];

class DistanceLegendViewModel {
  terria: any;
  _removeSubscription: any;
  _lastLegendUpdate: any;
  eventHelper: any;
  enableDistanceLegend: any;
  distanceLabel: any;
  barWidth: any;

  constructor(options: any) {
    let _this = this;
    if (!defined(options) || !defined(options.terria)) {
      throw new DeveloperError("options.terria is required.");
    }

    this.terria = options.terria;
    this._removeSubscription = undefined;
    this._lastLegendUpdate = undefined;
    this.eventHelper = new EventHelper();

    this.distanceLabel = undefined;
    this.barWidth = undefined;

    this.enableDistanceLegend = (defined(options.enableDistanceLegend)) ? options.enableDistanceLegend : true;

    Knockout.track(this, ["distanceLabel", "barWidth"]);

    this.eventHelper.add(this.terria.afterWidgetChanged, () => {
      if (defined(this._removeSubscription)) {
        this._removeSubscription();
        this._removeSubscription = undefined;
      }
    }, this);
    //        this.terria.beforeWidgetChanged.addEventListener(function () {
    //            if (defined(this._removeSubscription)) {
    //                this._removeSubscription();
    //                this._removeSubscription = undefined;
    //            }
    //        }, this);

    var that = this;

    const addUpdateSubscription = () => {
      if (defined(that.terria)) {
        var scene = that.terria.scene;
        that._removeSubscription = scene.postRender.addEventListener(() => {
          updateDistanceLegendCesium(this, scene);
        }, that);
      }
    };

    addUpdateSubscription();
    this.eventHelper.add(this.terria.afterWidgetChanged, function() {
      addUpdateSubscription();
    }, this);
    // this.terria.afterWidgetChanged.addEventListener(function() {
    //    addUpdateSubscription();
    // }, this);
  }

  destroy() {
    this.eventHelper.removeAll();
  }

  show(container: any) {
    let testing;
    if (this.enableDistanceLegend) {
      testing = "<div class=\"distance-legend\" data-bind=\"visible: distanceLabel && barWidth\">" +
        "<div class=\"distance-legend-label\" data-bind=\"text: distanceLabel\"></div>" +
        "<div class=\"distance-legend-scale-bar\" data-bind=\"style: { width: barWidth + 'px', left: (5 + (125 - barWidth) / 2) + 'px' }\"></div>" +
        "</div>";
    } else {
      testing = "<div class=\"distance-legend\"  style=\"display: none;\" data-bind=\"visible: distanceLabel && barWidth\">" +
        "<div class=\"distance-legend-label\"  data-bind=\"text: distanceLabel\"></div>" +
        "<div class=\"distance-legend-scale-bar\"  data-bind=\"style: { width: barWidth + 'px', left: (5 + (125 - barWidth) / 2) + 'px' }\"></div>" +
        "</div>";
    }
    loadView(testing, container, this);
    // loadView(distanceLegendTemplate, container, this);
    // loadView(require('fs').readFileSync(__dirname + '/../Views/DistanceLegend.html', 'utf8'), container, this);
  }

  static create(options: any) {
    const result = new DistanceLegendViewModel(options);
    result.show(options.container);
    return result;
  }
}

// var DistanceLegendViewModel = function (options: any) {
//   if (!defined(options) || !defined(options.terria)) {
//     throw new DeveloperError('options.terria is required.')
//   }
//
//   this.terria = options.terria
//   this._removeSubscription = undefined
//   this._lastLegendUpdate = undefined
//   this.eventHelper = new EventHelper()
//
//   this.distanceLabel = undefined
//   this.barWidth = undefined
//
//   this.enableDistanceLegend = (defined(options.enableDistanceLegend)) ? options.enableDistanceLegend : true
//
//   Knockout.track(this, ['distanceLabel', 'barWidth'])
//
//   this.eventHelper.add(this.terria.afterWidgetChanged, function () {
//     if (defined(this._removeSubscription)) {
//       this._removeSubscription()
//       this._removeSubscription = undefined
//     }
//   }, this)
//   //        this.terria.beforeWidgetChanged.addEventListener(function () {
//   //            if (defined(this._removeSubscription)) {
//   //                this._removeSubscription();
//   //                this._removeSubscription = undefined;
//   //            }
//   //        }, this);
//
//   var that = this
//
//   function addUpdateSubscription () {
//     if (defined(that.terria)) {
//       var scene = that.terria.scene
//       that._removeSubscription = scene.postRender.addEventListener(function () {
//         updateDistanceLegendCesium(this, scene)
//       }, that)
//     }
//   }
//
//   addUpdateSubscription()
//   this.eventHelper.add(this.terria.afterWidgetChanged, function () {
//     addUpdateSubscription()
//   }, this)
//   // this.terria.afterWidgetChanged.addEventListener(function() {
//   //    addUpdateSubscription();
//   // }, this);
// }

// DistanceLegendViewModel.prototype.destroy = function () {
//   this.eventHelper.removeAll()
// }

// DistanceLegendViewModel.prototype.show = function (container) {
//   var testing
//   if (this.enableDistanceLegend) {
//     testing = '<div class="distance-legend" data-bind="visible: distanceLabel && barWidth">' +
//       '<div class="distance-legend-label" data-bind="text: distanceLabel"></div>' +
//       '<div class="distance-legend-scale-bar" data-bind="style: { width: barWidth + \'px\', left: (5 + (125 - barWidth) / 2) + \'px\' }"></div>' +
//       '</div>'
//   } else {
//     testing = '<div class="distance-legend"  style="display: none;" data-bind="visible: distanceLabel && barWidth">' +
//       '<div class="distance-legend-label"  data-bind="text: distanceLabel"></div>' +
//       '<div class="distance-legend-scale-bar"  data-bind="style: { width: barWidth + \'px\', left: (5 + (125 - barWidth) / 2) + \'px\' }"></div>' +
//       '</div>'
//   }
//   loadView(testing, container, this)
//   // loadView(distanceLegendTemplate, container, this);
//   // loadView(require('fs').readFileSync(__dirname + '/../Views/DistanceLegend.html', 'utf8'), container, this);
// }

// DistanceLegendViewModel.create = function (options) {
//   var result = new DistanceLegendViewModel(options)
//   result.show(options.container)
//   return result
// }

// var geodesic = new EllipsoidGeodesic()
//
// var distances = [
//   1, 2, 3, 5,
//   10, 20, 30, 50,
//   100, 200, 300, 500,
//   1000, 2000, 3000, 5000,
//   10000, 20000, 30000, 50000,
//   100000, 200000, 300000, 500000,
//   1000000, 2000000, 3000000, 5000000,
//   10000000, 20000000, 30000000, 50000000]

function updateDistanceLegendCesium(viewModel: any, scene: any) {
  if (!viewModel.enableDistanceLegend) {
    viewModel.barWidth = undefined;
    viewModel.distanceLabel = undefined;
    return;
  }
  var now = getTimestamp();
  if (now < viewModel._lastLegendUpdate + 250) {
    return;
  }

  viewModel._lastLegendUpdate = now;

  // Find the distance between two pixels at the bottom center of the screen.
  var width = scene.canvas.clientWidth;
  var height = scene.canvas.clientHeight;

  var left = scene.camera.getPickRay(new Cartesian2((width / 2) | 0, height - 1));
  var right = scene.camera.getPickRay(new Cartesian2(1 + (width / 2) | 0, height - 1));

  var globe = scene.globe;
  var leftPosition = globe.pick(left, scene);
  var rightPosition = globe.pick(right, scene);

  if (!defined(leftPosition) || !defined(rightPosition)) {
    viewModel.barWidth = undefined;
    viewModel.distanceLabel = undefined;
    return;
  }

  var leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
  var rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);

  geodesic.setEndPoints(leftCartographic, rightCartographic);
  var pixelDistance = geodesic.surfaceDistance;

  // Find the first distance that makes the scale bar less than 100 pixels.
  var maxBarWidth = 100;
  var distance: number | undefined = undefined;
  for (let i = distances.length - 1; !defined(distance) && i >= 0; --i) {
    if (distances[i] / pixelDistance < maxBarWidth) {
      distance = distances[i];
    }
  }

  if (defined(distance)) {
    var label;
    // @ts-ignore
    if (distance >= 1000) {
      // @ts-ignore
      label = (distance / 1000).toString() + " km";
    } else {
      // @ts-ignore
      label = distance.toString() + " m";
    }

    // @ts-ignore
    viewModel.barWidth = (distance / pixelDistance) | 0;
    viewModel.distanceLabel = label;
  } else {
    viewModel.barWidth = undefined;
    viewModel.distanceLabel = undefined;
  }
}

export default DistanceLegendViewModel;
