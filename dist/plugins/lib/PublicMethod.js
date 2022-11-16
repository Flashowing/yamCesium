/**
 * 公共函数
 */
var PublicMethod = /** @class */ (function () {
    function PublicMethod() {
    }
    /**
     * 将json格式的参数遍历放入obj对象中
     * @param {object} obj json对象
     * @param {object} options json格式的参数
     */
    PublicMethod.setOptions = function (obj, options) {
        for (var key in options) {
            if (Object.hasOwnProperty.call(options, key)) {
                obj[key] = options[key];
            }
        }
    };
    /**
     * 字典比对
     * @param {string} type 类型
     * @param {object} dict 字典对象
     * @returns 字典的中与type对应key的值
     */
    PublicMethod.compareDict = function (type, dict) {
        for (var key in dict) {
            if (Object.hasOwnProperty.call(dict, key)) {
                var element = dict[key];
                if (type == key) {
                    return element;
                }
            }
        }
    };
    /**
     *  filename 保存的文件名
     *  txt 保存的文本
     */
    PublicMethod.downloadTxt = function (filename, content, contentType) {
        if (!contentType)
            contentType = "application/octet-stream";
        var a = document.createElement("a");
        var blob = new Blob([content], { "type": contentType });
        a.href = window.URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    };
    PublicMethod.getQueryVariable = function (variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
        return false;
    };
    return PublicMethod;
}());
export default PublicMethod;
