import * as Cesium from "cesium";

import "./popup.css";

interface popupOptions {
  popId: string; // 气泡的唯一标识
  title: string; // 气泡的标题
  position: Cesium.Cartesian3; // 气泡的位置
  offset: { x: number, y: number }; // 气泡的偏移量
  content: string; // 气泡的内容
  close: boolean; // 是否显示关闭按钮
  closeCallback: Function; // 关闭按钮的回调函数
}


interface popObj {
  popupsId: string; // 气泡的唯一标识
  scenePosition: Cesium.Cartesian3; // 气泡的位置
  popupOptions: popupOptions; // 气泡的参数
}

class Popup {

  // 气泡
  pop?: popObj;

  a: number = 0;
  viewer: any;
  renderEvent: Function | undefined;

  constructor(viewer: Cesium.Viewer, popupOptions: popupOptions) {
    let _this = this;
    _this.viewer = viewer;
    this.renderEvent = _this.viewer.scene.postRender.addEventListener(function() { // 每一帧都去计算气泡的正确位置
      if (_this.pop) {
        let infoboxContainer = document.getElementById(_this.pop.popupsId);
        if (infoboxContainer != null) {
          if (_this.pop.scenePosition) {
            // let canvasHeight = _this.viewer.scene.canvas.height;  // 获取canvas高度在笔记本上有偏差，所以使用屏幕高度
            let canvasHeight = window.innerHeight;
            let windowPosition = new Cesium.Cartesian2();
            Cesium.SceneTransforms.wgs84ToWindowCoordinates(_this.viewer.scene, _this.pop
              .scenePosition, windowPosition);
            infoboxContainer.style.bottom = (canvasHeight - windowPosition.y + _this.pop
              .popupOptions.offset.y) + "px";
            infoboxContainer.style.left = (windowPosition.x + -(infoboxContainer
              .scrollWidth / 2)) + "px";
            infoboxContainer.style.overflow = "hidden";
            infoboxContainer.style.whiteSpace = "nowrap";
          }
        }
      }
    });
    this.addPop(popupOptions);
  }

  /**
   * 关闭气泡
   * @param popId {String} 气泡的唯一标识
   * @param closeCallback {Function} 关闭按钮的回调函数
   */
  close(popId: string, closeCallback: Function) {
    let _this = this;
    // 移除div
    (document.querySelector("#" + popId))?.remove();
    closeCallback && closeCallback();
    this.renderEvent && this.renderEvent();
  }

  /**
   * 添加气泡
   * @param popupOptions {Object} 参数对象
   * @param popupOptions.popId {String} 气泡的唯一标识
   * @param popupOptions.position {Cesium.Cartesian3} 气泡的位置
   * @param popupOptions.offset {Cesium.Cartesian2} 气泡的偏移量
   * @param popupOptions.content {String} 气泡的内容
   * @param popupOptions.close {Boolean} 是否显示关闭按钮
   * @param popupOptions.closeCallback {Function} 关闭按钮的回调函数
   * @returns {*|string}
   */
  addPop(popupOptions: popupOptions) {
    let _this = this;
    let popId: string, title, content, position, offset, close, closeCallback: Function;
    popId = popupOptions.popId ? popupOptions.popId : "popId" + new Date().getTime() + Math.floor(Math.random() * 1000);
    title = popupOptions.title ? popupOptions.title : "";
    content = popupOptions.content ? popupOptions.content : "";
    if (!popupOptions.position) {
      throw new Error("position is required");
    }
    position = popupOptions.position;
    offset = popupOptions.offset ? popupOptions.offset : { x: 0, y: 0 };
    close = popupOptions.close ? popupOptions.close : true;
    closeCallback = popupOptions.closeCallback;
    popupOptions.popId = popId;
    popupOptions.title = title;
    popupOptions.content = content;
    popupOptions.offset = offset;
    popupOptions.close = close;
    let html = `<div class="popup_header_ctn">
                    ${title}
                    </div>
                    <div class="popup_content_ctn">
                        <div class="popup_content">
                            ${content}
                        </div>
                    </div>
                    <div class="popup_tip_container">
                        <div class="popup_tip">
                        </div>
                    </div>`;
    let div = document.createElement("div");
    div.classList.add("popup_ctn");
    div.innerHTML = html;
    div.id = popId;
    let a = document.createElement("a");
    a.classList.add("popup_close_button");
    a.innerText = "X";
    a.onclick = function() {
      _this.close(popId, closeCallback);
    };
    if (close) {
      div.appendChild(a);
    }
    document.body.append(div);
    this.pop = {
      popupsId: popId,
      scenePosition: position,
      popupOptions: popupOptions
    };
  }
}

export default Popup;
