System.register(["./storybook-preview-46d09877.js","./lit-element-02beee92.js","./tslib.es6-dba2d4a0.js"],(function(){"use strict";var r,t,o,e,i,s,n,a,p,c,d,l;return{setters:[function(p){r=p.n,t=p.c,o=p.f,e=p.g,i=p.h,s=p.d,n=p.D,a=p.E},function(r){p=r.c,c=r.p,d=r.L},function(r){l=r._}],execute:function(){function u(){var t=r([':host{visibility:hidden;opacity:0;transition:transform var(--spectrum-global-animation-duration-100,.13s) ease-in-out,opacity var(--spectrum-global-animation-duration-100,.13s) ease-in-out,visibility 0s linear var(--spectrum-global-animation-duration-100,.13s);pointer-events:none;display:inline-flex;flex-direction:column;box-sizing:border-box;min-width:var(--spectrum-global-dimension-size-400);min-height:var(--spectrum-global-dimension-size-400);position:absolute;border-radius:var(--spectrum-popover-border-radius,var(--spectrum-alias-border-radius-regular));outline:0;background-color:var(--spectrum-popover-background-color,var(--spectrum-global-color-gray-50));border:var(--spectrum-popover-border-size,var(--spectrum-alias-border-size-thin)) solid var(--spectrum-popover-border-color,var(--spectrum-alias-border-color-dark));box-shadow:0 1px 4px var(--spectrum-popover-shadow-color,var(--spectrum-alias-dropshadow-color))}:host([open]){visibility:visible;opacity:1;transition-delay:0s;pointer-events:auto}:host([direction=bottom][open]){transform:translateY(var(--spectrum-dropdown-flyout-menu-offset-y,var(--spectrum-global-dimension-size-75)))}:host([direction=top][open]){transform:translateY(calc(-1*var(--spectrum-dropdown-flyout-menu-offset-y,var(--spectrum-global-dimension-size-75))))}:host([direction=right][open]){transform:translateX(var(--spectrum-dropdown-flyout-menu-offset-y,var(--spectrum-global-dimension-size-75)))}:host([direction=left][open]){transform:translateX(calc(-1*var(--spectrum-dropdown-flyout-menu-offset-y,var(--spectrum-global-dimension-size-75))))}#tip{overflow:hidden;width:calc(var(--spectrum-popover-tip-width,var(--spectrum-global-dimension-size-250)) + 1px);height:calc(var(--spectrum-popover-tip-width,var(--spectrum-global-dimension-size-250))/ 2 + var(--spectrum-popover-border-size,var(--spectrum-alias-border-size-thin)))}#tip,#tip:after{position:absolute}#tip:after{content:"";width:var(--spectrum-popover-tip-width,var(--spectrum-global-dimension-size-250));height:var(--spectrum-popover-tip-width,var(--spectrum-global-dimension-size-250));transform:rotate(45deg);top:-18px;left:-1px;background-color:var(--spectrum-popover-background-color,var(--spectrum-global-color-gray-50));border:var(--spectrum-popover-border-size,var(--spectrum-alias-border-size-thin)) solid var(--spectrum-popover-border-color,var(--spectrum-alias-border-color-dark));box-shadow:-1px -1px 4px var(--spectrum-popover-shadow-color,var(--spectrum-alias-dropshadow-color))}:host([dialog]){min-width:270px;padding:30px 29px}:host([direction=left][tip]){margin-right:13px}:host([direction=left]) #tip{right:-16px;transform:rotate(-90deg)}:host([direction=right][tip]){margin-left:13px}:host([direction=right]) #tip{left:-16px;transform:rotate(90deg)}:host([direction=left]) #tip,:host([direction=right]) #tip{top:50%;margin-top:-6px}:host([direction=bottom][tip]){margin-top:13px}:host([direction=bottom]) #tip{top:-11px;transform:rotate(180deg)}:host([direction=top][tip]){margin-bottom:13px}:host([direction=top]) #tip{bottom:-11px}:host([direction=bottom]) #tip,:host([direction=top]) #tip{left:50%;margin-left:-12px}.spectrum-Dialog-footer,.spectrum-Dialog-header,.spectrum-Dialog-wrapper{background-color:initial}']);return u=function(){return t},t}var m=p(u());function v(){var t=r([" <slot></slot> "," "]);return v=function(){return t},t}function h(){var t=r([' <div id="tip"></div> ']);return h=function(){return t},t}var b=function(r){function p(){var r;return o(this,p),(r=e(this,i(p).apply(this,arguments))).direction="none",r.tip=!1,r}return t(p,r),s(p,[{key:"renderTip",value:function(){return n(h())}},{key:"render",value:function(){return n(v(),this.tip?this.renderTip():a)}}],[{key:"styles",get:function(){return[m]}}]),p}(d);l([c({reflect:!0})],b.prototype,"direction",void 0),l([c({type:Boolean,reflect:!0})],b.prototype,"tip",void 0),customElements.get("sp-popover")||customElements.define("sp-popover",b)}}}));
//# sourceMappingURL=index-8889a3b5.js.map