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

import {
    html,
    CSSResultArray,
    TemplateResult,
    property,
    query,
    streamingListener,
} from '@spectrum-web-components/base';
import { Focusable } from '@spectrum-web-components/shared/src/focusable.js';
import '@spectrum-web-components/color-handle/sp-color-handle.js';
import styles from './color-wheel.css.js';
import { wheel } from './wheel-svg.js';
import { ColorHandle } from '@spectrum-web-components/color-handle/src/ColorHandle';
import { HSL, HSLA, HSV, HSVA, RGB, RGBA, TinyColor } from '@ctrl/tinycolor';

/**
 * @element sp-color-wheel
 */
export class ColorWheel extends Focusable {
    public static get styles(): CSSResultArray {
        return [styles];
    }

    @property({ type: Boolean, reflect: true })
    public disabled = false;

    @property({ type: Boolean, reflect: true })
    public focused = false;

    @query('.handle')
    private handle!: ColorHandle;

    @query('.handle')
    private handle!: ColorHandle;

    @property({ type: Number })
    public step = 1;

    @property({ type: Number })
    public get value(): number {
        return this._value;
    }

    public set value(hue: number) {
        const value = Math.min(360, Math.max(0, hue));
        if (value === this.value) {
            return;
        }
        const oldValue = this.value;
        const { s, v } = this._color.toHsv();
        this._color = new TinyColor({ h: value, s, v });
        this._value = value;
        this.requestUpdate('value', oldValue);
    }

    private _value = 0;

    @property({ type: String })
    public get color():
        | string
        | number
        | TinyColor
        | HSVA
        | HSV
        | RGB
        | RGBA
        | HSL
        | HSLA {
        switch (this._format[0]) {
            case 'rgb':
                return this._format[1]
                    ? this._color.toRgbString()
                    : this._color.toRgb();
            case 'prgb':
                return this._format[1]
                    ? this._color.toPercentageRgbString()
                    : this._color.toPercentageRgb();
            case 'hex':
            case 'hex3':
            case 'hex4':
            case 'hex6':
                return this._format[1]
                    ? this._color.toHexString()
                    : this._color.toHex();
            case 'hex8':
                return this._format[1]
                    ? this._color.toHex8String()
                    : this._color.toHex8();
            case 'name':
                return this._color.toName() || this._color.toRgbString();
            case 'hsl':
                return this._format[1]
                    ? this._color.toHslString()
                    : this._color.toHsl();
            case 'hsv':
                return this._format[1]
                    ? this._color.toHsvString()
                    : this._color.toHsv();
            default:
                return 'No color format applied.';
        }
    }

    public set color(
        color:
            | string
            | number
            | TinyColor
            | HSVA
            | HSV
            | RGB
            | RGBA
            | HSL
            | HSLA
    ) {
        if (color === this.color) {
            return;
        }
        const oldValue = this._color;
        this._color = new TinyColor(color);
        this._format = [
            this._color.format,
            typeof color === 'string' || color instanceof String,
        ];
        const { h } = this._color.toHsv();
        this.value = h;
        this.requestUpdate('color', oldValue);
    }

    private _color = new TinyColor({ h: 0, s: 1, v: 1 });

    private _format: [string, boolean] = ['', false];

    private get altered(): number {
        return this._altered;
    }

    private set altered(altered: number) {
        this._altered = altered;
        this.step = Math.max(1, this.altered * 10);
    }

    private _altered = 0;

    private altKeys = new Set();

    @query('input')
    public input!: HTMLInputElement;

    public get focusElement(): HTMLInputElement {
        return this.input;
    }

    private handleKeydown(event: KeyboardEvent): void {
        event.preventDefault();
        const { key } = event;
        if (
            key === 'Shift' ||
            key === 'Meta' ||
            key === 'Control' ||
            key === 'Alt'
        ) {
            this.altKeys.add(key);
            this.altered = this.altKeys.size;
        }
        let delta = 0;
        switch (key) {
            case 'ArrowUp':
                delta = this.step;
                break;
            case 'ArrowDown':
                delta = -this.step;
                break;
            case 'ArrowLeft':
                delta = this.step * (this.isLTR ? -1 : 1);
                break;
            case 'ArrowRight':
                delta = this.step * (this.isLTR ? 1 : -1);
                break;
        }
        this.value = (360 + this.value + delta) % 360;
    }

    private handleKeyup(event: KeyboardEvent): void {
        event.preventDefault();
        const { key } = event;
        if (
            key === 'Shift' ||
            key === 'Meta' ||
            key === 'Control' ||
            key === 'Alt'
        ) {
            this.altKeys.delete(key);
            this.altered = this.altKeys.size;
        }
    }

    private handleFocus(): void {
        this.focused = true;
    }

    private handleBlur(): void {
        this.focused = false;
    }

    private boundingClientRect!: DOMRect;

    private handlePointerdown(event: PointerEvent): void {
        this.boundingClientRect = this.getBoundingClientRect();
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
    }

    private handlePointermove(event: PointerEvent): void {
        this.value = this.calculateHandlePosition(event);
        this.color = `hsl(${this.value}, 100%, 50%)`;
    }

    private handlePointerup(event: PointerEvent): void {
        // Retain focus on input element after mouse up to enable keyboard interactions
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }

    /**
     * Returns the value under the cursor
     * @param: PointerEvent on slider
     * @return: Slider value that correlates to the position under the pointer
     */
    private calculateHandlePosition(event: PointerEvent): number {
        /* c8 ignore next 3 */
        if (!this.boundingClientRect) {
            return this.value;
        }
        const rect = this.boundingClientRect;
        const { width, height, left, top } = rect;
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const pointX = event.clientX - centerX;
        const pointY = event.clientY - centerY;
        const value = (Math.atan2(pointY, pointX) * 180) / Math.PI;

        return (360 + (360 + value)) % 360;
    }

    private handleGradientPointerdown(event: PointerEvent): void {
        event.stopPropagation();
        event.preventDefault();
        this.handle.dispatchEvent(new PointerEvent('pointerdown', event));
        this.handlePointermove(event);
    }

    protected render(): TemplateResult {
        this.boundingClientRect = this.getBoundingClientRect();
        const { width } = this.boundingClientRect;
        const radius = width / 2;
        const handleLocationStyles = `transform: translate(${
            (radius - 12.5) * Math.cos((this.value * Math.PI) / 180)
        }px, ${(radius - 12.5) * Math.sin((this.value * Math.PI) / 180)}px);`;
        return html`
            <slot
                name="gradient"
                @pointerdown=${this.handleGradientPointerdown}
            >
                ${wheel(radius)}
            </slot>

            <sp-color-handle
                class="handle"
                color=${this._color.toHslString()}
                ?disabled=${this.disabled}
                style=${handleLocationStyles}
                @manage=${streamingListener(
                    { type: 'pointerdown', fn: this.handlePointerdown },
                    { type: 'pointermove', fn: this.handlePointermove },
                    { type: 'pointerup', fn: this.handlePointerup }
                )}
            ></sp-color-handle>

            <input
                type="range"
                class="slider"
                aria-label="hue"
                min="0"
                max="360"
                step=${this.step}
                .value=${String(this.value)}
                @keydown=${this.handleKeydown}
                @keyup=${this.handleKeyup}
                @focus=${this.handleFocus}
                @blur=${this.handleBlur}
            />
        `;
    }
}