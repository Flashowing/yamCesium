var PlotToolTip = /** @class */ (function () {
    function PlotToolTip(frameDiv) {
        var div = document.createElement("DIV");
        div.className = "twipsy right";
        var arrow = document.createElement("DIV");
        arrow.className = "twipsy-arrow";
        div.appendChild(arrow);
        var title = document.createElement("DIV");
        title.className = "twipsy-inner";
        div.appendChild(title);
        frameDiv.appendChild(div);
        this._div = div;
        this._title = title;
        this._frameDiv = frameDiv;
    }
    PlotToolTip.prototype.setVisible = function (visible) {
        this._div.style.display = visible ? "block" : "none";
    };
    PlotToolTip.prototype.showAt = function (position, message) {
        if (position && message) {
            this.setVisible(true);
            this._title.innerHTML = message;
            this._div.style.left = position.x + 10 + "px";
            this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
        }
    };
    return PlotToolTip;
}());
export default PlotToolTip;
