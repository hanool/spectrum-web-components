/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { __decorate } from "tslib";
import { LitElement, html, customElement, property, css, query, } from 'lit-element';
import * as Prism from 'prismjs';
import { toHtmlTemplateString } from '../utils/templates.js';
import DarkThemeStyles from 'prismjs/themes/prism-okaidia.css';
import LightThemeStyles from 'prismjs/themes/prism.css';
import Styles from './code-example.css';
import { stripIndent } from 'common-tags';
import { FocusVisiblePolyfillMixin } from '@spectrum-web-components/shared';
class Code extends LitElement {
    constructor() {
        super(...arguments);
        this.code = '';
    }
    get highlightedCode() {
        return toHtmlTemplateString(this.code);
    }
    render() {
        return html `
            <pre><code>${this.highlightedCode}</code></pre>
        `;
    }
}
__decorate([
    property()
], Code.prototype, "code", void 0);
let DarkCode = class DarkCode extends Code {
    static get styles() {
        return [DarkThemeStyles];
    }
};
DarkCode = __decorate([
    customElement('dark-code')
], DarkCode);
export { DarkCode };
let LightCode = class LightCode extends Code {
    static get styles() {
        return [
            LightThemeStyles,
            css `
                .token.attr-name,
                .token.builtin,
                .token.char,
                .token.inserted,
                .token.selector,
                .token.string {
                    color: #567f01;
                }
                .token.punctuation {
                    color: #737373;
                }
                .language-css .token.function {
                    color: inherit;
                }
            `,
        ];
    }
};
LightCode = __decorate([
    customElement('light-code')
], LightCode);
export { LightCode };
let CodeExample = class CodeExample extends FocusVisiblePolyfillMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.codeTheme = 'light';
        this.shouldManageTabOrderForScrolling = () => {
            [this.markup, this.demo].map((el) => {
                if (!el)
                    return;
                const { offsetWidth, scrollWidth } = el;
                if (offsetWidth < scrollWidth) {
                    el.tabIndex = 0;
                }
                else {
                    el.removeAttribute('tabindex');
                }
            });
        };
    }
    static get styles() {
        return [Styles];
    }
    get code() {
        return stripIndent `${this.textContent}` || '';
    }
    get language() {
        if (this.classList.contains('language-javascript')) {
            return 'javascript';
        }
        return 'markup';
    }
    get showDemo() {
        return (this.classList.contains('language-html') ||
            this.classList.contains('language-html-live'));
    }
    get highlightedCode() {
        const highlightedHtml = Prism.highlight(this.code, Prism.languages[this.language], this.language);
        if (this.codeTheme === 'dark') {
            return html `
                <dark-code .code=${highlightedHtml}></dark-code>
            `;
        }
        return html `
            <light-code .code=${highlightedHtml}></light-code>
        `;
    }
    get renderedCode() {
        if (this.classList.contains('language-html-live')) {
            const demo = document.createElement('div');
            demo.slot = 'demo';
            demo.innerHTML = this.code;
            this.append(demo);
        }
        return toHtmlTemplateString(this.code);
    }
    render() {
        const { highlightedCode, renderedCode } = this;
        return html `
            ${this.showDemo
            ? html `
                      <div class="demo-example">
                          <slot name="demo">${renderedCode}</slot>
                      </div>
                  `
            : undefined}
            <bdo id="markup" dir="ltr">${highlightedCode}</bdo>
        `;
    }
    updated() {
        requestAnimationFrame(() => {
            this.shouldManageTabOrderForScrolling();
        });
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', this.shouldManageTabOrderForScrolling);
    }
    disconnectedCallback() {
        window.removeEventListener('resize', this.shouldManageTabOrderForScrolling);
        super.disconnectedCallback();
    }
};
__decorate([
    query('#markup')
], CodeExample.prototype, "markup", void 0);
__decorate([
    query('.demo-example')
], CodeExample.prototype, "demo", void 0);
__decorate([
    property()
], CodeExample.prototype, "codeTheme", void 0);
CodeExample = __decorate([
    customElement('code-example')
], CodeExample);
export { CodeExample };
//# sourceMappingURL=code-example.js.map