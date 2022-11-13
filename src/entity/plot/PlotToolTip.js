export default class PlotToolTip {
    constructor(frameDiv) {
        const div = document.createElement("DIV");
        div.className = "twipsy right";
        const arrow = document.createElement("DIV");
        arrow.className = "twipsy-arrow";
        div.appendChild(arrow);
        const title = document.createElement("DIV");
        title.className = "twipsy-inner";
        div.appendChild(title);
        frameDiv.appendChild(div);
        this._div = div;
        this._title = title;
        this._frameDiv = frameDiv;
    }
    setVisible(visible) {
        this._div.style.display = visible ? "block" : "none";
    }
    showAt(position, message) {
        if (position && message) {
            this.setVisible(true);
            this._title.innerHTML = message;
            this._div.style.left = position.x + 10 + "px";
            this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
        }
    }
}
