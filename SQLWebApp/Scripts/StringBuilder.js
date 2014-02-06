define(["require", "exports"], function(require, exports) {
    var StringBuilder = (function () {
        function StringBuilder(value) {
            //StringBuilder code converted to TypeScript using code from http://www.codeproject.com/Articles/12375/JavaScript-StringBuilder
            this.escape = null;
            this.strings = [];
            if (value) {
                this.append(value);
            }
            if (document) {
                this.escape = document.createElement('textarea');
            }
        }
        StringBuilder.prototype.append = function (value) {
            if (value) {
                this.strings.push(value);
            }
        };

        // appendEscaped idea thanks to http://stackoverflow.com/users/552067/web-designer
        // http://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
        StringBuilder.prototype.appendEscaped = function (value) {
            if (value) {
                this.strings.push(this.escapeHTML(value));
            }
        };

        StringBuilder.prototype.clear = function () {
            this.strings.length = 1;
        };

        StringBuilder.prototype.toString = function () {
            return this.strings.join("");
        };

        StringBuilder.prototype.escapeHTML = function (html) {
            if (!this.escape) {
                throw "StringBuilder can only escape HTML if run with a global document variable (e.g. in a browser).";
            }
            this.escape.innerHTML = html;
            return this.escape.innerHTML;
        };
        return StringBuilder;
    })();
    exports.StringBuilder = StringBuilder;
});
//# sourceMappingURL=StringBuilder.js.map
