import * as Cesium from "cesium";
declare class PlotCircleDrawer {
    viewer: any;
    scene: any;
    clock: any;
    canvas: any;
    camera: any;
    ellipsoid: any;
    tooltip: any;
    entity: any;
    outlineEntity: any;
    positions: any;
    drawHandler: any;
    modifyHandler: any;
    okHandler: any;
    cancelHandler: any;
    dragIcon: string;
    dragIconLight: string;
    material: any;
    radiusLineMaterial: any;
    outlineMaterial: any;
    fill: boolean;
    outline: boolean;
    outlineWidth: number;
    extrudedHeight: number;
    toolBarIndex: any;
    layerId: string;
    params: any;
    ground: boolean;
    shapeColor: any;
    outlineColor: any;
    shapeName: any;
    isClickConfirm: boolean;
    constructor(viewer: any);
    clear(): void;
    clear2(): void;
    showModifyCircle(options: any): Promise<unknown>;
    startDrawCircle(options: any): Promise<unknown>;
    _startModify(): void;
    _createCenter(cartesian: any, oid: any): any;
    _createPoint(cartesian: any, oid: any): any;
    _showRegion2Map(): void;
    _showModifyRegion2Map(): void;
    _showCircleOutline2Map(): void;
    _computeCenterPotition(p1: any, p2: any): any;
    _computeCirclePolygon(positions: any): Cesium.Cartesian3[] | null;
    _computeCirclePolygon2(center: any, radius: any): Cesium.Cartesian3[] | null;
    _computeCirclePolygon3(center: any, semiMajorAxis: any, semiMinorAxis: any, rotation: any): Cesium.Cartesian3[] | null;
    _computeCirclePolygonForDegree(positions: any): Cesium.Cartesian3[];
    _computeCircleRadius3D(positions: any): number;
    createToolBar(): Promise<void>;
    _clearMarkers(layerName: string): void;
}
export default PlotCircleDrawer;
