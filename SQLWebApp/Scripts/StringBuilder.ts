export class StringBuilder {
    //StringBuilder code converted to TypeScript using code from http://www.codeproject.com/Articles/12375/JavaScript-StringBuilder

    private escape: HTMLTextAreaElement = null;
    public strings: string[] = [];

    constructor(value?: string) {
        if (value) {
            this.append(value);
        }
        if (document) {
            this.escape = document.createElement('textarea');
        }
    }

    public append(value: string): void {
        if (value) {
            this.strings.push(value);
        }
    }

    // appendEscaped idea thanks to http://stackoverflow.com/users/552067/web-designer
    // http://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
    public appendEscaped(value: string): void {
        if (value) {
            this.strings.push(this.escapeHTML(value));
        }
    }

    public clear(): void {
        this.strings.length = 1;
    }

    public toString(): string {
        return this.strings.join("");
    }

    public escapeHTML(html: string): string {
        if (!this.escape) {
            throw "StringBuilder can only escape HTML if run with a global document variable (e.g. in a browser).";
        }
        this.escape.innerHTML = html;
        return this.escape.innerHTML;
    }
}
