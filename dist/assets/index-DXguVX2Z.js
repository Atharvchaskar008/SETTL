(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();function ap(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var vc={exports:{}},fi={},xc={exports:{}},O={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Br=Symbol.for("react.element"),up=Symbol.for("react.portal"),cp=Symbol.for("react.fragment"),dp=Symbol.for("react.strict_mode"),fp=Symbol.for("react.profiler"),pp=Symbol.for("react.provider"),hp=Symbol.for("react.context"),mp=Symbol.for("react.forward_ref"),gp=Symbol.for("react.suspense"),vp=Symbol.for("react.memo"),xp=Symbol.for("react.lazy"),Ma=Symbol.iterator;function yp(e){return e===null||typeof e!="object"?null:(e=Ma&&e[Ma]||e["@@iterator"],typeof e=="function"?e:null)}var yc={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},wc=Object.assign,kc={};function Yn(e,t,n){this.props=e,this.context=t,this.refs=kc,this.updater=n||yc}Yn.prototype.isReactComponent={};Yn.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Yn.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Sc(){}Sc.prototype=Yn.prototype;function Cs(e,t,n){this.props=e,this.context=t,this.refs=kc,this.updater=n||yc}var js=Cs.prototype=new Sc;js.constructor=Cs;wc(js,Yn.prototype);js.isPureReactComponent=!0;var $a=Array.isArray,Cc=Object.prototype.hasOwnProperty,Es={current:null},jc={key:!0,ref:!0,__self:!0,__source:!0};function Ec(e,t,n){var r,o={},i=null,l=null;if(t!=null)for(r in t.ref!==void 0&&(l=t.ref),t.key!==void 0&&(i=""+t.key),t)Cc.call(t,r)&&!jc.hasOwnProperty(r)&&(o[r]=t[r]);var a=arguments.length-2;if(a===1)o.children=n;else if(1<a){for(var u=Array(a),d=0;d<a;d++)u[d]=arguments[d+2];o.children=u}if(e&&e.defaultProps)for(r in a=e.defaultProps,a)o[r]===void 0&&(o[r]=a[r]);return{$$typeof:Br,type:e,key:i,ref:l,props:o,_owner:Es.current}}function wp(e,t){return{$$typeof:Br,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function _s(e){return typeof e=="object"&&e!==null&&e.$$typeof===Br}function kp(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var La=/\/+/g;function Hi(e,t){return typeof e=="object"&&e!==null&&e.key!=null?kp(""+e.key):t.toString(36)}function So(e,t,n,r,o){var i=typeof e;(i==="undefined"||i==="boolean")&&(e=null);var l=!1;if(e===null)l=!0;else switch(i){case"string":case"number":l=!0;break;case"object":switch(e.$$typeof){case Br:case up:l=!0}}if(l)return l=e,o=o(l),e=r===""?"."+Hi(l,0):r,$a(o)?(n="",e!=null&&(n=e.replace(La,"$&/")+"/"),So(o,t,n,"",function(d){return d})):o!=null&&(_s(o)&&(o=wp(o,n+(!o.key||l&&l.key===o.key?"":(""+o.key).replace(La,"$&/")+"/")+e)),t.push(o)),1;if(l=0,r=r===""?".":r+":",$a(e))for(var a=0;a<e.length;a++){i=e[a];var u=r+Hi(i,a);l+=So(i,t,n,u,o)}else if(u=yp(e),typeof u=="function")for(e=u.call(e),a=0;!(i=e.next()).done;)i=i.value,u=r+Hi(i,a++),l+=So(i,t,n,u,o);else if(i==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return l}function Jr(e,t,n){if(e==null)return e;var r=[],o=0;return So(e,r,"","",function(i){return t.call(n,i,o++)}),r}function Sp(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var Te={current:null},Co={transition:null},Cp={ReactCurrentDispatcher:Te,ReactCurrentBatchConfig:Co,ReactCurrentOwner:Es};function _c(){throw Error("act(...) is not supported in production builds of React.")}O.Children={map:Jr,forEach:function(e,t,n){Jr(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return Jr(e,function(){t++}),t},toArray:function(e){return Jr(e,function(t){return t})||[]},only:function(e){if(!_s(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};O.Component=Yn;O.Fragment=cp;O.Profiler=fp;O.PureComponent=Cs;O.StrictMode=dp;O.Suspense=gp;O.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Cp;O.act=_c;O.cloneElement=function(e,t,n){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=wc({},e.props),o=e.key,i=e.ref,l=e._owner;if(t!=null){if(t.ref!==void 0&&(i=t.ref,l=Es.current),t.key!==void 0&&(o=""+t.key),e.type&&e.type.defaultProps)var a=e.type.defaultProps;for(u in t)Cc.call(t,u)&&!jc.hasOwnProperty(u)&&(r[u]=t[u]===void 0&&a!==void 0?a[u]:t[u])}var u=arguments.length-2;if(u===1)r.children=n;else if(1<u){a=Array(u);for(var d=0;d<u;d++)a[d]=arguments[d+2];r.children=a}return{$$typeof:Br,type:e.type,key:o,ref:i,props:r,_owner:l}};O.createContext=function(e){return e={$$typeof:hp,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:pp,_context:e},e.Consumer=e};O.createElement=Ec;O.createFactory=function(e){var t=Ec.bind(null,e);return t.type=e,t};O.createRef=function(){return{current:null}};O.forwardRef=function(e){return{$$typeof:mp,render:e}};O.isValidElement=_s;O.lazy=function(e){return{$$typeof:xp,_payload:{_status:-1,_result:e},_init:Sp}};O.memo=function(e,t){return{$$typeof:vp,type:e,compare:t===void 0?null:t}};O.startTransition=function(e){var t=Co.transition;Co.transition={};try{e()}finally{Co.transition=t}};O.unstable_act=_c;O.useCallback=function(e,t){return Te.current.useCallback(e,t)};O.useContext=function(e){return Te.current.useContext(e)};O.useDebugValue=function(){};O.useDeferredValue=function(e){return Te.current.useDeferredValue(e)};O.useEffect=function(e,t){return Te.current.useEffect(e,t)};O.useId=function(){return Te.current.useId()};O.useImperativeHandle=function(e,t,n){return Te.current.useImperativeHandle(e,t,n)};O.useInsertionEffect=function(e,t){return Te.current.useInsertionEffect(e,t)};O.useLayoutEffect=function(e,t){return Te.current.useLayoutEffect(e,t)};O.useMemo=function(e,t){return Te.current.useMemo(e,t)};O.useReducer=function(e,t,n){return Te.current.useReducer(e,t,n)};O.useRef=function(e){return Te.current.useRef(e)};O.useState=function(e){return Te.current.useState(e)};O.useSyncExternalStore=function(e,t,n){return Te.current.useSyncExternalStore(e,t,n)};O.useTransition=function(){return Te.current.useTransition()};O.version="18.3.1";xc.exports=O;var U=xc.exports;const Oe=ap(U);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var jp=U,Ep=Symbol.for("react.element"),_p=Symbol.for("react.fragment"),Np=Object.prototype.hasOwnProperty,zp=jp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Rp={key:!0,ref:!0,__self:!0,__source:!0};function Nc(e,t,n){var r,o={},i=null,l=null;n!==void 0&&(i=""+n),t.key!==void 0&&(i=""+t.key),t.ref!==void 0&&(l=t.ref);for(r in t)Np.call(t,r)&&!Rp.hasOwnProperty(r)&&(o[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps,t)o[r]===void 0&&(o[r]=t[r]);return{$$typeof:Ep,type:e,key:i,ref:l,props:o,_owner:zp.current}}fi.Fragment=_p;fi.jsx=Nc;fi.jsxs=Nc;vc.exports=fi;var s=vc.exports,Sl={},zc={exports:{}},Fe={},Rc={exports:{}},Tc={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(e){function t(R,E){var A=R.length;R.push(E);e:for(;0<A;){var H=A-1>>>1,I=R[H];if(0<o(I,E))R[H]=E,R[A]=I,A=H;else break e}}function n(R){return R.length===0?null:R[0]}function r(R){if(R.length===0)return null;var E=R[0],A=R.pop();if(A!==E){R[0]=A;e:for(var H=0,I=R.length,te=I>>>1;H<te;){var Q=2*(H+1)-1,K=R[Q],_e=Q+1,we=R[_e];if(0>o(K,A))_e<I&&0>o(we,K)?(R[H]=we,R[_e]=A,H=_e):(R[H]=K,R[Q]=A,H=Q);else if(_e<I&&0>o(we,A))R[H]=we,R[_e]=A,H=_e;else break e}}return E}function o(R,E){var A=R.sortIndex-E.sortIndex;return A!==0?A:R.id-E.id}if(typeof performance=="object"&&typeof performance.now=="function"){var i=performance;e.unstable_now=function(){return i.now()}}else{var l=Date,a=l.now();e.unstable_now=function(){return l.now()-a}}var u=[],d=[],h=1,m=null,g=3,k=!1,x=!1,S=!1,_=typeof setTimeout=="function"?setTimeout:null,p=typeof clearTimeout=="function"?clearTimeout:null,c=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function f(R){for(var E=n(d);E!==null;){if(E.callback===null)r(d);else if(E.startTime<=R)r(d),E.sortIndex=E.expirationTime,t(u,E);else break;E=n(d)}}function y(R){if(S=!1,f(R),!x)if(n(u)!==null)x=!0,ae(j);else{var E=n(d);E!==null&&b(y,E.startTime-R)}}function j(R,E){x=!1,S&&(S=!1,p(C),C=-1),k=!0;var A=g;try{for(f(E),m=n(u);m!==null&&(!(m.expirationTime>E)||R&&!F());){var H=m.callback;if(typeof H=="function"){m.callback=null,g=m.priorityLevel;var I=H(m.expirationTime<=E);E=e.unstable_now(),typeof I=="function"?m.callback=I:m===n(u)&&r(u),f(E)}else r(u);m=n(u)}if(m!==null)var te=!0;else{var Q=n(d);Q!==null&&b(y,Q.startTime-E),te=!1}return te}finally{m=null,g=A,k=!1}}var N=!1,w=null,C=-1,M=5,T=-1;function F(){return!(e.unstable_now()-T<M)}function Y(){if(w!==null){var R=e.unstable_now();T=R;var E=!0;try{E=w(!0,R)}finally{E?Z():(N=!1,w=null)}}else N=!1}var Z;if(typeof c=="function")Z=function(){c(Y)};else if(typeof MessageChannel<"u"){var D=new MessageChannel,$=D.port2;D.port1.onmessage=Y,Z=function(){$.postMessage(null)}}else Z=function(){_(Y,0)};function ae(R){w=R,N||(N=!0,Z())}function b(R,E){C=_(function(){R(e.unstable_now())},E)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(R){R.callback=null},e.unstable_continueExecution=function(){x||k||(x=!0,ae(j))},e.unstable_forceFrameRate=function(R){0>R||125<R?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):M=0<R?Math.floor(1e3/R):5},e.unstable_getCurrentPriorityLevel=function(){return g},e.unstable_getFirstCallbackNode=function(){return n(u)},e.unstable_next=function(R){switch(g){case 1:case 2:case 3:var E=3;break;default:E=g}var A=g;g=E;try{return R()}finally{g=A}},e.unstable_pauseExecution=function(){},e.unstable_requestPaint=function(){},e.unstable_runWithPriority=function(R,E){switch(R){case 1:case 2:case 3:case 4:case 5:break;default:R=3}var A=g;g=R;try{return E()}finally{g=A}},e.unstable_scheduleCallback=function(R,E,A){var H=e.unstable_now();switch(typeof A=="object"&&A!==null?(A=A.delay,A=typeof A=="number"&&0<A?H+A:H):A=H,R){case 1:var I=-1;break;case 2:I=250;break;case 5:I=1073741823;break;case 4:I=1e4;break;default:I=5e3}return I=A+I,R={id:h++,callback:E,priorityLevel:R,startTime:A,expirationTime:I,sortIndex:-1},A>H?(R.sortIndex=A,t(d,R),n(u)===null&&R===n(d)&&(S?(p(C),C=-1):S=!0,b(y,A-H))):(R.sortIndex=I,t(u,R),x||k||(x=!0,ae(j))),R},e.unstable_shouldYield=F,e.unstable_wrapCallback=function(R){var E=g;return function(){var A=g;g=E;try{return R.apply(this,arguments)}finally{g=A}}}})(Tc);Rc.exports=Tc;var Tp=Rc.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Pp=U,Ve=Tp;function z(e){for(var t="https://reactjs.org/docs/error-decoder.html?invariant="+e,n=1;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var Pc=new Set,jr={};function pn(e,t){Hn(e,t),Hn(e+"Capture",t)}function Hn(e,t){for(jr[e]=t,e=0;e<t.length;e++)Pc.add(t[e])}var kt=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Cl=Object.prototype.hasOwnProperty,Ap=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Ia={},Ha={};function Mp(e){return Cl.call(Ha,e)?!0:Cl.call(Ia,e)?!1:Ap.test(e)?Ha[e]=!0:(Ia[e]=!0,!1)}function $p(e,t,n,r){if(n!==null&&n.type===0)return!1;switch(typeof t){case"function":case"symbol":return!0;case"boolean":return r?!1:n!==null?!n.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function Lp(e,t,n,r){if(t===null||typeof t>"u"||$p(e,t,n,r))return!0;if(r)return!1;if(n!==null)switch(n.type){case 3:return!t;case 4:return t===!1;case 5:return isNaN(t);case 6:return isNaN(t)||1>t}return!1}function Pe(e,t,n,r,o,i,l){this.acceptsBooleans=t===2||t===3||t===4,this.attributeName=r,this.attributeNamespace=o,this.mustUseProperty=n,this.propertyName=e,this.type=t,this.sanitizeURL=i,this.removeEmptyString=l}var ye={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){ye[e]=new Pe(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var t=e[0];ye[t]=new Pe(t,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){ye[e]=new Pe(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){ye[e]=new Pe(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){ye[e]=new Pe(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){ye[e]=new Pe(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){ye[e]=new Pe(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){ye[e]=new Pe(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){ye[e]=new Pe(e,5,!1,e.toLowerCase(),null,!1,!1)});var Ns=/[\-:]([a-z])/g;function zs(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var t=e.replace(Ns,zs);ye[t]=new Pe(t,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var t=e.replace(Ns,zs);ye[t]=new Pe(t,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var t=e.replace(Ns,zs);ye[t]=new Pe(t,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){ye[e]=new Pe(e,1,!1,e.toLowerCase(),null,!1,!1)});ye.xlinkHref=new Pe("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){ye[e]=new Pe(e,1,!1,e.toLowerCase(),null,!0,!0)});function Rs(e,t,n,r){var o=ye.hasOwnProperty(t)?ye[t]:null;(o!==null?o.type!==0:r||!(2<t.length)||t[0]!=="o"&&t[0]!=="O"||t[1]!=="n"&&t[1]!=="N")&&(Lp(t,n,o,r)&&(n=null),r||o===null?Mp(t)&&(n===null?e.removeAttribute(t):e.setAttribute(t,""+n)):o.mustUseProperty?e[o.propertyName]=n===null?o.type===3?!1:"":n:(t=o.attributeName,r=o.attributeNamespace,n===null?e.removeAttribute(t):(o=o.type,n=o===3||o===4&&n===!0?"":""+n,r?e.setAttributeNS(r,t,n):e.setAttribute(t,n))))}var Et=Pp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,qr=Symbol.for("react.element"),xn=Symbol.for("react.portal"),yn=Symbol.for("react.fragment"),Ts=Symbol.for("react.strict_mode"),jl=Symbol.for("react.profiler"),Ac=Symbol.for("react.provider"),Mc=Symbol.for("react.context"),Ps=Symbol.for("react.forward_ref"),El=Symbol.for("react.suspense"),_l=Symbol.for("react.suspense_list"),As=Symbol.for("react.memo"),Rt=Symbol.for("react.lazy"),$c=Symbol.for("react.offscreen"),Oa=Symbol.iterator;function Jn(e){return e===null||typeof e!="object"?null:(e=Oa&&e[Oa]||e["@@iterator"],typeof e=="function"?e:null)}var ie=Object.assign,Oi;function sr(e){if(Oi===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);Oi=t&&t[1]||""}return`
`+Oi+e}var bi=!1;function Di(e,t){if(!e||bi)return"";bi=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(t)if(t=function(){throw Error()},Object.defineProperty(t.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(t,[])}catch(d){var r=d}Reflect.construct(e,[],t)}else{try{t.call()}catch(d){r=d}e.call(t.prototype)}else{try{throw Error()}catch(d){r=d}e()}}catch(d){if(d&&r&&typeof d.stack=="string"){for(var o=d.stack.split(`
`),i=r.stack.split(`
`),l=o.length-1,a=i.length-1;1<=l&&0<=a&&o[l]!==i[a];)a--;for(;1<=l&&0<=a;l--,a--)if(o[l]!==i[a]){if(l!==1||a!==1)do if(l--,a--,0>a||o[l]!==i[a]){var u=`
`+o[l].replace(" at new "," at ");return e.displayName&&u.includes("<anonymous>")&&(u=u.replace("<anonymous>",e.displayName)),u}while(1<=l&&0<=a);break}}}finally{bi=!1,Error.prepareStackTrace=n}return(e=e?e.displayName||e.name:"")?sr(e):""}function Ip(e){switch(e.tag){case 5:return sr(e.type);case 16:return sr("Lazy");case 13:return sr("Suspense");case 19:return sr("SuspenseList");case 0:case 2:case 15:return e=Di(e.type,!1),e;case 11:return e=Di(e.type.render,!1),e;case 1:return e=Di(e.type,!0),e;default:return""}}function Nl(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case yn:return"Fragment";case xn:return"Portal";case jl:return"Profiler";case Ts:return"StrictMode";case El:return"Suspense";case _l:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case Mc:return(e.displayName||"Context")+".Consumer";case Ac:return(e._context.displayName||"Context")+".Provider";case Ps:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case As:return t=e.displayName||null,t!==null?t:Nl(e.type)||"Memo";case Rt:t=e._payload,e=e._init;try{return Nl(e(t))}catch{}}return null}function Hp(e){var t=e.type;switch(e.tag){case 24:return"Cache";case 9:return(t.displayName||"Context")+".Consumer";case 10:return(t._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=t.render,e=e.displayName||e.name||"",t.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return t;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Nl(t);case 8:return t===Ts?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t}return null}function Wt(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Lc(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Op(e){var t=Lc(e)?"checked":"value",n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t),r=""+e[t];if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,i=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(l){r=""+l,i.call(this,l)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return r},setValue:function(l){r=""+l},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function eo(e){e._valueTracker||(e._valueTracker=Op(e))}function Ic(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),r="";return e&&(r=Lc(e)?e.checked?"true":"false":e.value),e=r,e!==n?(t.setValue(e),!0):!1}function bo(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function zl(e,t){var n=t.checked;return ie({},t,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??e._wrapperState.initialChecked})}function ba(e,t){var n=t.defaultValue==null?"":t.defaultValue,r=t.checked!=null?t.checked:t.defaultChecked;n=Wt(t.value!=null?t.value:n),e._wrapperState={initialChecked:r,initialValue:n,controlled:t.type==="checkbox"||t.type==="radio"?t.checked!=null:t.value!=null}}function Hc(e,t){t=t.checked,t!=null&&Rs(e,"checked",t,!1)}function Rl(e,t){Hc(e,t);var n=Wt(t.value),r=t.type;if(n!=null)r==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+n):e.value!==""+n&&(e.value=""+n);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}t.hasOwnProperty("value")?Tl(e,t.type,n):t.hasOwnProperty("defaultValue")&&Tl(e,t.type,Wt(t.defaultValue)),t.checked==null&&t.defaultChecked!=null&&(e.defaultChecked=!!t.defaultChecked)}function Da(e,t,n){if(t.hasOwnProperty("value")||t.hasOwnProperty("defaultValue")){var r=t.type;if(!(r!=="submit"&&r!=="reset"||t.value!==void 0&&t.value!==null))return;t=""+e._wrapperState.initialValue,n||t===e.value||(e.value=t),e.defaultValue=t}n=e.name,n!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,n!==""&&(e.name=n)}function Tl(e,t,n){(t!=="number"||bo(e.ownerDocument)!==e)&&(n==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+n&&(e.defaultValue=""+n))}var ar=Array.isArray;function Tn(e,t,n,r){if(e=e.options,t){t={};for(var o=0;o<n.length;o++)t["$"+n[o]]=!0;for(n=0;n<e.length;n++)o=t.hasOwnProperty("$"+e[n].value),e[n].selected!==o&&(e[n].selected=o),o&&r&&(e[n].defaultSelected=!0)}else{for(n=""+Wt(n),t=null,o=0;o<e.length;o++){if(e[o].value===n){e[o].selected=!0,r&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function Pl(e,t){if(t.dangerouslySetInnerHTML!=null)throw Error(z(91));return ie({},t,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function Va(e,t){var n=t.value;if(n==null){if(n=t.children,t=t.defaultValue,n!=null){if(t!=null)throw Error(z(92));if(ar(n)){if(1<n.length)throw Error(z(93));n=n[0]}t=n}t==null&&(t=""),n=t}e._wrapperState={initialValue:Wt(n)}}function Oc(e,t){var n=Wt(t.value),r=Wt(t.defaultValue);n!=null&&(n=""+n,n!==e.value&&(e.value=n),t.defaultValue==null&&e.defaultValue!==n&&(e.defaultValue=n)),r!=null&&(e.defaultValue=""+r)}function Fa(e){var t=e.textContent;t===e._wrapperState.initialValue&&t!==""&&t!==null&&(e.value=t)}function bc(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Al(e,t){return e==null||e==="http://www.w3.org/1999/xhtml"?bc(t):e==="http://www.w3.org/2000/svg"&&t==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var to,Dc=function(e){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(t,n,r,o){MSApp.execUnsafeLocalFunction(function(){return e(t,n,r,o)})}:e}(function(e,t){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=t;else{for(to=to||document.createElement("div"),to.innerHTML="<svg>"+t.valueOf().toString()+"</svg>",t=to.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;t.firstChild;)e.appendChild(t.firstChild)}});function Er(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var pr={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},bp=["Webkit","ms","Moz","O"];Object.keys(pr).forEach(function(e){bp.forEach(function(t){t=t+e.charAt(0).toUpperCase()+e.substring(1),pr[t]=pr[e]})});function Vc(e,t,n){return t==null||typeof t=="boolean"||t===""?"":n||typeof t!="number"||t===0||pr.hasOwnProperty(e)&&pr[e]?(""+t).trim():t+"px"}function Fc(e,t){e=e.style;for(var n in t)if(t.hasOwnProperty(n)){var r=n.indexOf("--")===0,o=Vc(n,t[n],r);n==="float"&&(n="cssFloat"),r?e.setProperty(n,o):e[n]=o}}var Dp=ie({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Ml(e,t){if(t){if(Dp[e]&&(t.children!=null||t.dangerouslySetInnerHTML!=null))throw Error(z(137,e));if(t.dangerouslySetInnerHTML!=null){if(t.children!=null)throw Error(z(60));if(typeof t.dangerouslySetInnerHTML!="object"||!("__html"in t.dangerouslySetInnerHTML))throw Error(z(61))}if(t.style!=null&&typeof t.style!="object")throw Error(z(62))}}function $l(e,t){if(e.indexOf("-")===-1)return typeof t.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Ll=null;function Ms(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Il=null,Pn=null,An=null;function Ba(e){if(e=Gr(e)){if(typeof Il!="function")throw Error(z(280));var t=e.stateNode;t&&(t=vi(t),Il(e.stateNode,e.type,t))}}function Bc(e){Pn?An?An.push(e):An=[e]:Pn=e}function Uc(){if(Pn){var e=Pn,t=An;if(An=Pn=null,Ba(e),t)for(e=0;e<t.length;e++)Ba(t[e])}}function Wc(e,t){return e(t)}function Gc(){}var Vi=!1;function Yc(e,t,n){if(Vi)return e(t,n);Vi=!0;try{return Wc(e,t,n)}finally{Vi=!1,(Pn!==null||An!==null)&&(Gc(),Uc())}}function _r(e,t){var n=e.stateNode;if(n===null)return null;var r=vi(n);if(r===null)return null;n=r[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error(z(231,t,typeof n));return n}var Hl=!1;if(kt)try{var qn={};Object.defineProperty(qn,"passive",{get:function(){Hl=!0}}),window.addEventListener("test",qn,qn),window.removeEventListener("test",qn,qn)}catch{Hl=!1}function Vp(e,t,n,r,o,i,l,a,u){var d=Array.prototype.slice.call(arguments,3);try{t.apply(n,d)}catch(h){this.onError(h)}}var hr=!1,Do=null,Vo=!1,Ol=null,Fp={onError:function(e){hr=!0,Do=e}};function Bp(e,t,n,r,o,i,l,a,u){hr=!1,Do=null,Vp.apply(Fp,arguments)}function Up(e,t,n,r,o,i,l,a,u){if(Bp.apply(this,arguments),hr){if(hr){var d=Do;hr=!1,Do=null}else throw Error(z(198));Vo||(Vo=!0,Ol=d)}}function hn(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,t.flags&4098&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function Zc(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Ua(e){if(hn(e)!==e)throw Error(z(188))}function Wp(e){var t=e.alternate;if(!t){if(t=hn(e),t===null)throw Error(z(188));return t!==e?null:e}for(var n=e,r=t;;){var o=n.return;if(o===null)break;var i=o.alternate;if(i===null){if(r=o.return,r!==null){n=r;continue}break}if(o.child===i.child){for(i=o.child;i;){if(i===n)return Ua(o),e;if(i===r)return Ua(o),t;i=i.sibling}throw Error(z(188))}if(n.return!==r.return)n=o,r=i;else{for(var l=!1,a=o.child;a;){if(a===n){l=!0,n=o,r=i;break}if(a===r){l=!0,r=o,n=i;break}a=a.sibling}if(!l){for(a=i.child;a;){if(a===n){l=!0,n=i,r=o;break}if(a===r){l=!0,r=i,n=o;break}a=a.sibling}if(!l)throw Error(z(189))}}if(n.alternate!==r)throw Error(z(190))}if(n.tag!==3)throw Error(z(188));return n.stateNode.current===n?e:t}function Qc(e){return e=Wp(e),e!==null?Kc(e):null}function Kc(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var t=Kc(e);if(t!==null)return t;e=e.sibling}return null}var Xc=Ve.unstable_scheduleCallback,Wa=Ve.unstable_cancelCallback,Gp=Ve.unstable_shouldYield,Yp=Ve.unstable_requestPaint,se=Ve.unstable_now,Zp=Ve.unstable_getCurrentPriorityLevel,$s=Ve.unstable_ImmediatePriority,Jc=Ve.unstable_UserBlockingPriority,Fo=Ve.unstable_NormalPriority,Qp=Ve.unstable_LowPriority,qc=Ve.unstable_IdlePriority,pi=null,pt=null;function Kp(e){if(pt&&typeof pt.onCommitFiberRoot=="function")try{pt.onCommitFiberRoot(pi,e,void 0,(e.current.flags&128)===128)}catch{}}var ot=Math.clz32?Math.clz32:qp,Xp=Math.log,Jp=Math.LN2;function qp(e){return e>>>=0,e===0?32:31-(Xp(e)/Jp|0)|0}var no=64,ro=4194304;function ur(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function Bo(e,t){var n=e.pendingLanes;if(n===0)return 0;var r=0,o=e.suspendedLanes,i=e.pingedLanes,l=n&268435455;if(l!==0){var a=l&~o;a!==0?r=ur(a):(i&=l,i!==0&&(r=ur(i)))}else l=n&~o,l!==0?r=ur(l):i!==0&&(r=ur(i));if(r===0)return 0;if(t!==0&&t!==r&&!(t&o)&&(o=r&-r,i=t&-t,o>=i||o===16&&(i&4194240)!==0))return t;if(r&4&&(r|=n&16),t=e.entangledLanes,t!==0)for(e=e.entanglements,t&=r;0<t;)n=31-ot(t),o=1<<n,r|=e[n],t&=~o;return r}function e0(e,t){switch(e){case 1:case 2:case 4:return t+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function t0(e,t){for(var n=e.suspendedLanes,r=e.pingedLanes,o=e.expirationTimes,i=e.pendingLanes;0<i;){var l=31-ot(i),a=1<<l,u=o[l];u===-1?(!(a&n)||a&r)&&(o[l]=e0(a,t)):u<=t&&(e.expiredLanes|=a),i&=~a}}function bl(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function ed(){var e=no;return no<<=1,!(no&4194240)&&(no=64),e}function Fi(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function Ur(e,t,n){e.pendingLanes|=t,t!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,t=31-ot(t),e[t]=n}function n0(e,t){var n=e.pendingLanes&~t;e.pendingLanes=t,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=t,e.mutableReadLanes&=t,e.entangledLanes&=t,t=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<n;){var o=31-ot(n),i=1<<o;t[o]=0,r[o]=-1,e[o]=-1,n&=~i}}function Ls(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var r=31-ot(n),o=1<<r;o&t|e[r]&t&&(e[r]|=t),n&=~o}}var G=0;function td(e){return e&=-e,1<e?4<e?e&268435455?16:536870912:4:1}var nd,Is,rd,od,id,Dl=!1,oo=[],It=null,Ht=null,Ot=null,Nr=new Map,zr=new Map,Pt=[],r0="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Ga(e,t){switch(e){case"focusin":case"focusout":It=null;break;case"dragenter":case"dragleave":Ht=null;break;case"mouseover":case"mouseout":Ot=null;break;case"pointerover":case"pointerout":Nr.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":zr.delete(t.pointerId)}}function er(e,t,n,r,o,i){return e===null||e.nativeEvent!==i?(e={blockedOn:t,domEventName:n,eventSystemFlags:r,nativeEvent:i,targetContainers:[o]},t!==null&&(t=Gr(t),t!==null&&Is(t)),e):(e.eventSystemFlags|=r,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function o0(e,t,n,r,o){switch(t){case"focusin":return It=er(It,e,t,n,r,o),!0;case"dragenter":return Ht=er(Ht,e,t,n,r,o),!0;case"mouseover":return Ot=er(Ot,e,t,n,r,o),!0;case"pointerover":var i=o.pointerId;return Nr.set(i,er(Nr.get(i)||null,e,t,n,r,o)),!0;case"gotpointercapture":return i=o.pointerId,zr.set(i,er(zr.get(i)||null,e,t,n,r,o)),!0}return!1}function ld(e){var t=en(e.target);if(t!==null){var n=hn(t);if(n!==null){if(t=n.tag,t===13){if(t=Zc(n),t!==null){e.blockedOn=t,id(e.priority,function(){rd(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function jo(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=Vl(e.domEventName,e.eventSystemFlags,t[0],e.nativeEvent);if(n===null){n=e.nativeEvent;var r=new n.constructor(n.type,n);Ll=r,n.target.dispatchEvent(r),Ll=null}else return t=Gr(n),t!==null&&Is(t),e.blockedOn=n,!1;t.shift()}return!0}function Ya(e,t,n){jo(e)&&n.delete(t)}function i0(){Dl=!1,It!==null&&jo(It)&&(It=null),Ht!==null&&jo(Ht)&&(Ht=null),Ot!==null&&jo(Ot)&&(Ot=null),Nr.forEach(Ya),zr.forEach(Ya)}function tr(e,t){e.blockedOn===t&&(e.blockedOn=null,Dl||(Dl=!0,Ve.unstable_scheduleCallback(Ve.unstable_NormalPriority,i0)))}function Rr(e){function t(o){return tr(o,e)}if(0<oo.length){tr(oo[0],e);for(var n=1;n<oo.length;n++){var r=oo[n];r.blockedOn===e&&(r.blockedOn=null)}}for(It!==null&&tr(It,e),Ht!==null&&tr(Ht,e),Ot!==null&&tr(Ot,e),Nr.forEach(t),zr.forEach(t),n=0;n<Pt.length;n++)r=Pt[n],r.blockedOn===e&&(r.blockedOn=null);for(;0<Pt.length&&(n=Pt[0],n.blockedOn===null);)ld(n),n.blockedOn===null&&Pt.shift()}var Mn=Et.ReactCurrentBatchConfig,Uo=!0;function l0(e,t,n,r){var o=G,i=Mn.transition;Mn.transition=null;try{G=1,Hs(e,t,n,r)}finally{G=o,Mn.transition=i}}function s0(e,t,n,r){var o=G,i=Mn.transition;Mn.transition=null;try{G=4,Hs(e,t,n,r)}finally{G=o,Mn.transition=i}}function Hs(e,t,n,r){if(Uo){var o=Vl(e,t,n,r);if(o===null)Ji(e,t,r,Wo,n),Ga(e,r);else if(o0(o,e,t,n,r))r.stopPropagation();else if(Ga(e,r),t&4&&-1<r0.indexOf(e)){for(;o!==null;){var i=Gr(o);if(i!==null&&nd(i),i=Vl(e,t,n,r),i===null&&Ji(e,t,r,Wo,n),i===o)break;o=i}o!==null&&r.stopPropagation()}else Ji(e,t,r,null,n)}}var Wo=null;function Vl(e,t,n,r){if(Wo=null,e=Ms(r),e=en(e),e!==null)if(t=hn(e),t===null)e=null;else if(n=t.tag,n===13){if(e=Zc(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null);return Wo=e,null}function sd(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Zp()){case $s:return 1;case Jc:return 4;case Fo:case Qp:return 16;case qc:return 536870912;default:return 16}default:return 16}}var Mt=null,Os=null,Eo=null;function ad(){if(Eo)return Eo;var e,t=Os,n=t.length,r,o="value"in Mt?Mt.value:Mt.textContent,i=o.length;for(e=0;e<n&&t[e]===o[e];e++);var l=n-e;for(r=1;r<=l&&t[n-r]===o[i-r];r++);return Eo=o.slice(e,1<r?1-r:void 0)}function _o(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function io(){return!0}function Za(){return!1}function Be(e){function t(n,r,o,i,l){this._reactName=n,this._targetInst=o,this.type=r,this.nativeEvent=i,this.target=l,this.currentTarget=null;for(var a in e)e.hasOwnProperty(a)&&(n=e[a],this[a]=n?n(i):i[a]);return this.isDefaultPrevented=(i.defaultPrevented!=null?i.defaultPrevented:i.returnValue===!1)?io:Za,this.isPropagationStopped=Za,this}return ie(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=io)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=io)},persist:function(){},isPersistent:io}),t}var Zn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},bs=Be(Zn),Wr=ie({},Zn,{view:0,detail:0}),a0=Be(Wr),Bi,Ui,nr,hi=ie({},Wr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Ds,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==nr&&(nr&&e.type==="mousemove"?(Bi=e.screenX-nr.screenX,Ui=e.screenY-nr.screenY):Ui=Bi=0,nr=e),Bi)},movementY:function(e){return"movementY"in e?e.movementY:Ui}}),Qa=Be(hi),u0=ie({},hi,{dataTransfer:0}),c0=Be(u0),d0=ie({},Wr,{relatedTarget:0}),Wi=Be(d0),f0=ie({},Zn,{animationName:0,elapsedTime:0,pseudoElement:0}),p0=Be(f0),h0=ie({},Zn,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),m0=Be(h0),g0=ie({},Zn,{data:0}),Ka=Be(g0),v0={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},x0={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},y0={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function w0(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=y0[e])?!!t[e]:!1}function Ds(){return w0}var k0=ie({},Wr,{key:function(e){if(e.key){var t=v0[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=_o(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?x0[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Ds,charCode:function(e){return e.type==="keypress"?_o(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?_o(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),S0=Be(k0),C0=ie({},hi,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Xa=Be(C0),j0=ie({},Wr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Ds}),E0=Be(j0),_0=ie({},Zn,{propertyName:0,elapsedTime:0,pseudoElement:0}),N0=Be(_0),z0=ie({},hi,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),R0=Be(z0),T0=[9,13,27,32],Vs=kt&&"CompositionEvent"in window,mr=null;kt&&"documentMode"in document&&(mr=document.documentMode);var P0=kt&&"TextEvent"in window&&!mr,ud=kt&&(!Vs||mr&&8<mr&&11>=mr),Ja=" ",qa=!1;function cd(e,t){switch(e){case"keyup":return T0.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function dd(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var wn=!1;function A0(e,t){switch(e){case"compositionend":return dd(t);case"keypress":return t.which!==32?null:(qa=!0,Ja);case"textInput":return e=t.data,e===Ja&&qa?null:e;default:return null}}function M0(e,t){if(wn)return e==="compositionend"||!Vs&&cd(e,t)?(e=ad(),Eo=Os=Mt=null,wn=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return ud&&t.locale!=="ko"?null:t.data;default:return null}}var $0={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function eu(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!$0[e.type]:t==="textarea"}function fd(e,t,n,r){Bc(r),t=Go(t,"onChange"),0<t.length&&(n=new bs("onChange","change",null,n,r),e.push({event:n,listeners:t}))}var gr=null,Tr=null;function L0(e){Cd(e,0)}function mi(e){var t=Cn(e);if(Ic(t))return e}function I0(e,t){if(e==="change")return t}var pd=!1;if(kt){var Gi;if(kt){var Yi="oninput"in document;if(!Yi){var tu=document.createElement("div");tu.setAttribute("oninput","return;"),Yi=typeof tu.oninput=="function"}Gi=Yi}else Gi=!1;pd=Gi&&(!document.documentMode||9<document.documentMode)}function nu(){gr&&(gr.detachEvent("onpropertychange",hd),Tr=gr=null)}function hd(e){if(e.propertyName==="value"&&mi(Tr)){var t=[];fd(t,Tr,e,Ms(e)),Yc(L0,t)}}function H0(e,t,n){e==="focusin"?(nu(),gr=t,Tr=n,gr.attachEvent("onpropertychange",hd)):e==="focusout"&&nu()}function O0(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return mi(Tr)}function b0(e,t){if(e==="click")return mi(t)}function D0(e,t){if(e==="input"||e==="change")return mi(t)}function V0(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var st=typeof Object.is=="function"?Object.is:V0;function Pr(e,t){if(st(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),r=Object.keys(t);if(n.length!==r.length)return!1;for(r=0;r<n.length;r++){var o=n[r];if(!Cl.call(t,o)||!st(e[o],t[o]))return!1}return!0}function ru(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function ou(e,t){var n=ru(e);e=0;for(var r;n;){if(n.nodeType===3){if(r=e+n.textContent.length,e<=t&&r>=t)return{node:n,offset:t-e};e=r}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=ru(n)}}function md(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?md(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function gd(){for(var e=window,t=bo();t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=bo(e.document)}return t}function Fs(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}function F0(e){var t=gd(),n=e.focusedElem,r=e.selectionRange;if(t!==n&&n&&n.ownerDocument&&md(n.ownerDocument.documentElement,n)){if(r!==null&&Fs(n)){if(t=r.start,e=r.end,e===void 0&&(e=t),"selectionStart"in n)n.selectionStart=t,n.selectionEnd=Math.min(e,n.value.length);else if(e=(t=n.ownerDocument||document)&&t.defaultView||window,e.getSelection){e=e.getSelection();var o=n.textContent.length,i=Math.min(r.start,o);r=r.end===void 0?i:Math.min(r.end,o),!e.extend&&i>r&&(o=r,r=i,i=o),o=ou(n,i);var l=ou(n,r);o&&l&&(e.rangeCount!==1||e.anchorNode!==o.node||e.anchorOffset!==o.offset||e.focusNode!==l.node||e.focusOffset!==l.offset)&&(t=t.createRange(),t.setStart(o.node,o.offset),e.removeAllRanges(),i>r?(e.addRange(t),e.extend(l.node,l.offset)):(t.setEnd(l.node,l.offset),e.addRange(t)))}}for(t=[],e=n;e=e.parentNode;)e.nodeType===1&&t.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<t.length;n++)e=t[n],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var B0=kt&&"documentMode"in document&&11>=document.documentMode,kn=null,Fl=null,vr=null,Bl=!1;function iu(e,t,n){var r=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Bl||kn==null||kn!==bo(r)||(r=kn,"selectionStart"in r&&Fs(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),vr&&Pr(vr,r)||(vr=r,r=Go(Fl,"onSelect"),0<r.length&&(t=new bs("onSelect","select",null,t,n),e.push({event:t,listeners:r}),t.target=kn)))}function lo(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var Sn={animationend:lo("Animation","AnimationEnd"),animationiteration:lo("Animation","AnimationIteration"),animationstart:lo("Animation","AnimationStart"),transitionend:lo("Transition","TransitionEnd")},Zi={},vd={};kt&&(vd=document.createElement("div").style,"AnimationEvent"in window||(delete Sn.animationend.animation,delete Sn.animationiteration.animation,delete Sn.animationstart.animation),"TransitionEvent"in window||delete Sn.transitionend.transition);function gi(e){if(Zi[e])return Zi[e];if(!Sn[e])return e;var t=Sn[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in vd)return Zi[e]=t[n];return e}var xd=gi("animationend"),yd=gi("animationiteration"),wd=gi("animationstart"),kd=gi("transitionend"),Sd=new Map,lu="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function Yt(e,t){Sd.set(e,t),pn(t,[e])}for(var Qi=0;Qi<lu.length;Qi++){var Ki=lu[Qi],U0=Ki.toLowerCase(),W0=Ki[0].toUpperCase()+Ki.slice(1);Yt(U0,"on"+W0)}Yt(xd,"onAnimationEnd");Yt(yd,"onAnimationIteration");Yt(wd,"onAnimationStart");Yt("dblclick","onDoubleClick");Yt("focusin","onFocus");Yt("focusout","onBlur");Yt(kd,"onTransitionEnd");Hn("onMouseEnter",["mouseout","mouseover"]);Hn("onMouseLeave",["mouseout","mouseover"]);Hn("onPointerEnter",["pointerout","pointerover"]);Hn("onPointerLeave",["pointerout","pointerover"]);pn("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));pn("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));pn("onBeforeInput",["compositionend","keypress","textInput","paste"]);pn("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));pn("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));pn("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var cr="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),G0=new Set("cancel close invalid load scroll toggle".split(" ").concat(cr));function su(e,t,n){var r=e.type||"unknown-event";e.currentTarget=n,Up(r,t,void 0,e),e.currentTarget=null}function Cd(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var r=e[n],o=r.event;r=r.listeners;e:{var i=void 0;if(t)for(var l=r.length-1;0<=l;l--){var a=r[l],u=a.instance,d=a.currentTarget;if(a=a.listener,u!==i&&o.isPropagationStopped())break e;su(o,a,d),i=u}else for(l=0;l<r.length;l++){if(a=r[l],u=a.instance,d=a.currentTarget,a=a.listener,u!==i&&o.isPropagationStopped())break e;su(o,a,d),i=u}}}if(Vo)throw e=Ol,Vo=!1,Ol=null,e}function J(e,t){var n=t[Zl];n===void 0&&(n=t[Zl]=new Set);var r=e+"__bubble";n.has(r)||(jd(t,e,2,!1),n.add(r))}function Xi(e,t,n){var r=0;t&&(r|=4),jd(n,e,r,t)}var so="_reactListening"+Math.random().toString(36).slice(2);function Ar(e){if(!e[so]){e[so]=!0,Pc.forEach(function(n){n!=="selectionchange"&&(G0.has(n)||Xi(n,!1,e),Xi(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[so]||(t[so]=!0,Xi("selectionchange",!1,t))}}function jd(e,t,n,r){switch(sd(t)){case 1:var o=l0;break;case 4:o=s0;break;default:o=Hs}n=o.bind(null,t,n,e),o=void 0,!Hl||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),r?o!==void 0?e.addEventListener(t,n,{capture:!0,passive:o}):e.addEventListener(t,n,!0):o!==void 0?e.addEventListener(t,n,{passive:o}):e.addEventListener(t,n,!1)}function Ji(e,t,n,r,o){var i=r;if(!(t&1)&&!(t&2)&&r!==null)e:for(;;){if(r===null)return;var l=r.tag;if(l===3||l===4){var a=r.stateNode.containerInfo;if(a===o||a.nodeType===8&&a.parentNode===o)break;if(l===4)for(l=r.return;l!==null;){var u=l.tag;if((u===3||u===4)&&(u=l.stateNode.containerInfo,u===o||u.nodeType===8&&u.parentNode===o))return;l=l.return}for(;a!==null;){if(l=en(a),l===null)return;if(u=l.tag,u===5||u===6){r=i=l;continue e}a=a.parentNode}}r=r.return}Yc(function(){var d=i,h=Ms(n),m=[];e:{var g=Sd.get(e);if(g!==void 0){var k=bs,x=e;switch(e){case"keypress":if(_o(n)===0)break e;case"keydown":case"keyup":k=S0;break;case"focusin":x="focus",k=Wi;break;case"focusout":x="blur",k=Wi;break;case"beforeblur":case"afterblur":k=Wi;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":k=Qa;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":k=c0;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":k=E0;break;case xd:case yd:case wd:k=p0;break;case kd:k=N0;break;case"scroll":k=a0;break;case"wheel":k=R0;break;case"copy":case"cut":case"paste":k=m0;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":k=Xa}var S=(t&4)!==0,_=!S&&e==="scroll",p=S?g!==null?g+"Capture":null:g;S=[];for(var c=d,f;c!==null;){f=c;var y=f.stateNode;if(f.tag===5&&y!==null&&(f=y,p!==null&&(y=_r(c,p),y!=null&&S.push(Mr(c,y,f)))),_)break;c=c.return}0<S.length&&(g=new k(g,x,null,n,h),m.push({event:g,listeners:S}))}}if(!(t&7)){e:{if(g=e==="mouseover"||e==="pointerover",k=e==="mouseout"||e==="pointerout",g&&n!==Ll&&(x=n.relatedTarget||n.fromElement)&&(en(x)||x[St]))break e;if((k||g)&&(g=h.window===h?h:(g=h.ownerDocument)?g.defaultView||g.parentWindow:window,k?(x=n.relatedTarget||n.toElement,k=d,x=x?en(x):null,x!==null&&(_=hn(x),x!==_||x.tag!==5&&x.tag!==6)&&(x=null)):(k=null,x=d),k!==x)){if(S=Qa,y="onMouseLeave",p="onMouseEnter",c="mouse",(e==="pointerout"||e==="pointerover")&&(S=Xa,y="onPointerLeave",p="onPointerEnter",c="pointer"),_=k==null?g:Cn(k),f=x==null?g:Cn(x),g=new S(y,c+"leave",k,n,h),g.target=_,g.relatedTarget=f,y=null,en(h)===d&&(S=new S(p,c+"enter",x,n,h),S.target=f,S.relatedTarget=_,y=S),_=y,k&&x)t:{for(S=k,p=x,c=0,f=S;f;f=mn(f))c++;for(f=0,y=p;y;y=mn(y))f++;for(;0<c-f;)S=mn(S),c--;for(;0<f-c;)p=mn(p),f--;for(;c--;){if(S===p||p!==null&&S===p.alternate)break t;S=mn(S),p=mn(p)}S=null}else S=null;k!==null&&au(m,g,k,S,!1),x!==null&&_!==null&&au(m,_,x,S,!0)}}e:{if(g=d?Cn(d):window,k=g.nodeName&&g.nodeName.toLowerCase(),k==="select"||k==="input"&&g.type==="file")var j=I0;else if(eu(g))if(pd)j=D0;else{j=O0;var N=H0}else(k=g.nodeName)&&k.toLowerCase()==="input"&&(g.type==="checkbox"||g.type==="radio")&&(j=b0);if(j&&(j=j(e,d))){fd(m,j,n,h);break e}N&&N(e,g,d),e==="focusout"&&(N=g._wrapperState)&&N.controlled&&g.type==="number"&&Tl(g,"number",g.value)}switch(N=d?Cn(d):window,e){case"focusin":(eu(N)||N.contentEditable==="true")&&(kn=N,Fl=d,vr=null);break;case"focusout":vr=Fl=kn=null;break;case"mousedown":Bl=!0;break;case"contextmenu":case"mouseup":case"dragend":Bl=!1,iu(m,n,h);break;case"selectionchange":if(B0)break;case"keydown":case"keyup":iu(m,n,h)}var w;if(Vs)e:{switch(e){case"compositionstart":var C="onCompositionStart";break e;case"compositionend":C="onCompositionEnd";break e;case"compositionupdate":C="onCompositionUpdate";break e}C=void 0}else wn?cd(e,n)&&(C="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(C="onCompositionStart");C&&(ud&&n.locale!=="ko"&&(wn||C!=="onCompositionStart"?C==="onCompositionEnd"&&wn&&(w=ad()):(Mt=h,Os="value"in Mt?Mt.value:Mt.textContent,wn=!0)),N=Go(d,C),0<N.length&&(C=new Ka(C,e,null,n,h),m.push({event:C,listeners:N}),w?C.data=w:(w=dd(n),w!==null&&(C.data=w)))),(w=P0?A0(e,n):M0(e,n))&&(d=Go(d,"onBeforeInput"),0<d.length&&(h=new Ka("onBeforeInput","beforeinput",null,n,h),m.push({event:h,listeners:d}),h.data=w))}Cd(m,t)})}function Mr(e,t,n){return{instance:e,listener:t,currentTarget:n}}function Go(e,t){for(var n=t+"Capture",r=[];e!==null;){var o=e,i=o.stateNode;o.tag===5&&i!==null&&(o=i,i=_r(e,n),i!=null&&r.unshift(Mr(e,i,o)),i=_r(e,t),i!=null&&r.push(Mr(e,i,o))),e=e.return}return r}function mn(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function au(e,t,n,r,o){for(var i=t._reactName,l=[];n!==null&&n!==r;){var a=n,u=a.alternate,d=a.stateNode;if(u!==null&&u===r)break;a.tag===5&&d!==null&&(a=d,o?(u=_r(n,i),u!=null&&l.unshift(Mr(n,u,a))):o||(u=_r(n,i),u!=null&&l.push(Mr(n,u,a)))),n=n.return}l.length!==0&&e.push({event:t,listeners:l})}var Y0=/\r\n?/g,Z0=/\u0000|\uFFFD/g;function uu(e){return(typeof e=="string"?e:""+e).replace(Y0,`
`).replace(Z0,"")}function ao(e,t,n){if(t=uu(t),uu(e)!==t&&n)throw Error(z(425))}function Yo(){}var Ul=null,Wl=null;function Gl(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Yl=typeof setTimeout=="function"?setTimeout:void 0,Q0=typeof clearTimeout=="function"?clearTimeout:void 0,cu=typeof Promise=="function"?Promise:void 0,K0=typeof queueMicrotask=="function"?queueMicrotask:typeof cu<"u"?function(e){return cu.resolve(null).then(e).catch(X0)}:Yl;function X0(e){setTimeout(function(){throw e})}function qi(e,t){var n=t,r=0;do{var o=n.nextSibling;if(e.removeChild(n),o&&o.nodeType===8)if(n=o.data,n==="/$"){if(r===0){e.removeChild(o),Rr(t);return}r--}else n!=="$"&&n!=="$?"&&n!=="$!"||r++;n=o}while(n);Rr(t)}function bt(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?")break;if(t==="/$")return null}}return e}function du(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"){if(t===0)return e;t--}else n==="/$"&&t++}e=e.previousSibling}return null}var Qn=Math.random().toString(36).slice(2),ft="__reactFiber$"+Qn,$r="__reactProps$"+Qn,St="__reactContainer$"+Qn,Zl="__reactEvents$"+Qn,J0="__reactListeners$"+Qn,q0="__reactHandles$"+Qn;function en(e){var t=e[ft];if(t)return t;for(var n=e.parentNode;n;){if(t=n[St]||n[ft]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=du(e);e!==null;){if(n=e[ft])return n;e=du(e)}return t}e=n,n=e.parentNode}return null}function Gr(e){return e=e[ft]||e[St],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function Cn(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(z(33))}function vi(e){return e[$r]||null}var Ql=[],jn=-1;function Zt(e){return{current:e}}function ee(e){0>jn||(e.current=Ql[jn],Ql[jn]=null,jn--)}function X(e,t){jn++,Ql[jn]=e.current,e.current=t}var Gt={},Ee=Zt(Gt),$e=Zt(!1),sn=Gt;function On(e,t){var n=e.type.contextTypes;if(!n)return Gt;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===t)return r.__reactInternalMemoizedMaskedChildContext;var o={},i;for(i in n)o[i]=t[i];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=t,e.__reactInternalMemoizedMaskedChildContext=o),o}function Le(e){return e=e.childContextTypes,e!=null}function Zo(){ee($e),ee(Ee)}function fu(e,t,n){if(Ee.current!==Gt)throw Error(z(168));X(Ee,t),X($e,n)}function Ed(e,t,n){var r=e.stateNode;if(t=t.childContextTypes,typeof r.getChildContext!="function")return n;r=r.getChildContext();for(var o in r)if(!(o in t))throw Error(z(108,Hp(e)||"Unknown",o));return ie({},n,r)}function Qo(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Gt,sn=Ee.current,X(Ee,e),X($e,$e.current),!0}function pu(e,t,n){var r=e.stateNode;if(!r)throw Error(z(169));n?(e=Ed(e,t,sn),r.__reactInternalMemoizedMergedChildContext=e,ee($e),ee(Ee),X(Ee,e)):ee($e),X($e,n)}var vt=null,xi=!1,el=!1;function _d(e){vt===null?vt=[e]:vt.push(e)}function eh(e){xi=!0,_d(e)}function Qt(){if(!el&&vt!==null){el=!0;var e=0,t=G;try{var n=vt;for(G=1;e<n.length;e++){var r=n[e];do r=r(!0);while(r!==null)}vt=null,xi=!1}catch(o){throw vt!==null&&(vt=vt.slice(e+1)),Xc($s,Qt),o}finally{G=t,el=!1}}return null}var En=[],_n=0,Ko=null,Xo=0,We=[],Ge=0,an=null,xt=1,yt="";function Xt(e,t){En[_n++]=Xo,En[_n++]=Ko,Ko=e,Xo=t}function Nd(e,t,n){We[Ge++]=xt,We[Ge++]=yt,We[Ge++]=an,an=e;var r=xt;e=yt;var o=32-ot(r)-1;r&=~(1<<o),n+=1;var i=32-ot(t)+o;if(30<i){var l=o-o%5;i=(r&(1<<l)-1).toString(32),r>>=l,o-=l,xt=1<<32-ot(t)+o|n<<o|r,yt=i+e}else xt=1<<i|n<<o|r,yt=e}function Bs(e){e.return!==null&&(Xt(e,1),Nd(e,1,0))}function Us(e){for(;e===Ko;)Ko=En[--_n],En[_n]=null,Xo=En[--_n],En[_n]=null;for(;e===an;)an=We[--Ge],We[Ge]=null,yt=We[--Ge],We[Ge]=null,xt=We[--Ge],We[Ge]=null}var De=null,be=null,ne=!1,rt=null;function zd(e,t){var n=Ye(5,null,null,0);n.elementType="DELETED",n.stateNode=t,n.return=e,t=e.deletions,t===null?(e.deletions=[n],e.flags|=16):t.push(n)}function hu(e,t){switch(e.tag){case 5:var n=e.type;return t=t.nodeType!==1||n.toLowerCase()!==t.nodeName.toLowerCase()?null:t,t!==null?(e.stateNode=t,De=e,be=bt(t.firstChild),!0):!1;case 6:return t=e.pendingProps===""||t.nodeType!==3?null:t,t!==null?(e.stateNode=t,De=e,be=null,!0):!1;case 13:return t=t.nodeType!==8?null:t,t!==null?(n=an!==null?{id:xt,overflow:yt}:null,e.memoizedState={dehydrated:t,treeContext:n,retryLane:1073741824},n=Ye(18,null,null,0),n.stateNode=t,n.return=e,e.child=n,De=e,be=null,!0):!1;default:return!1}}function Kl(e){return(e.mode&1)!==0&&(e.flags&128)===0}function Xl(e){if(ne){var t=be;if(t){var n=t;if(!hu(e,t)){if(Kl(e))throw Error(z(418));t=bt(n.nextSibling);var r=De;t&&hu(e,t)?zd(r,n):(e.flags=e.flags&-4097|2,ne=!1,De=e)}}else{if(Kl(e))throw Error(z(418));e.flags=e.flags&-4097|2,ne=!1,De=e}}}function mu(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;De=e}function uo(e){if(e!==De)return!1;if(!ne)return mu(e),ne=!0,!1;var t;if((t=e.tag!==3)&&!(t=e.tag!==5)&&(t=e.type,t=t!=="head"&&t!=="body"&&!Gl(e.type,e.memoizedProps)),t&&(t=be)){if(Kl(e))throw Rd(),Error(z(418));for(;t;)zd(e,t),t=bt(t.nextSibling)}if(mu(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(z(317));e:{for(e=e.nextSibling,t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"){if(t===0){be=bt(e.nextSibling);break e}t--}else n!=="$"&&n!=="$!"&&n!=="$?"||t++}e=e.nextSibling}be=null}}else be=De?bt(e.stateNode.nextSibling):null;return!0}function Rd(){for(var e=be;e;)e=bt(e.nextSibling)}function bn(){be=De=null,ne=!1}function Ws(e){rt===null?rt=[e]:rt.push(e)}var th=Et.ReactCurrentBatchConfig;function rr(e,t,n){if(e=n.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(z(309));var r=n.stateNode}if(!r)throw Error(z(147,e));var o=r,i=""+e;return t!==null&&t.ref!==null&&typeof t.ref=="function"&&t.ref._stringRef===i?t.ref:(t=function(l){var a=o.refs;l===null?delete a[i]:a[i]=l},t._stringRef=i,t)}if(typeof e!="string")throw Error(z(284));if(!n._owner)throw Error(z(290,e))}return e}function co(e,t){throw e=Object.prototype.toString.call(t),Error(z(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e))}function gu(e){var t=e._init;return t(e._payload)}function Td(e){function t(p,c){if(e){var f=p.deletions;f===null?(p.deletions=[c],p.flags|=16):f.push(c)}}function n(p,c){if(!e)return null;for(;c!==null;)t(p,c),c=c.sibling;return null}function r(p,c){for(p=new Map;c!==null;)c.key!==null?p.set(c.key,c):p.set(c.index,c),c=c.sibling;return p}function o(p,c){return p=Bt(p,c),p.index=0,p.sibling=null,p}function i(p,c,f){return p.index=f,e?(f=p.alternate,f!==null?(f=f.index,f<c?(p.flags|=2,c):f):(p.flags|=2,c)):(p.flags|=1048576,c)}function l(p){return e&&p.alternate===null&&(p.flags|=2),p}function a(p,c,f,y){return c===null||c.tag!==6?(c=sl(f,p.mode,y),c.return=p,c):(c=o(c,f),c.return=p,c)}function u(p,c,f,y){var j=f.type;return j===yn?h(p,c,f.props.children,y,f.key):c!==null&&(c.elementType===j||typeof j=="object"&&j!==null&&j.$$typeof===Rt&&gu(j)===c.type)?(y=o(c,f.props),y.ref=rr(p,c,f),y.return=p,y):(y=Mo(f.type,f.key,f.props,null,p.mode,y),y.ref=rr(p,c,f),y.return=p,y)}function d(p,c,f,y){return c===null||c.tag!==4||c.stateNode.containerInfo!==f.containerInfo||c.stateNode.implementation!==f.implementation?(c=al(f,p.mode,y),c.return=p,c):(c=o(c,f.children||[]),c.return=p,c)}function h(p,c,f,y,j){return c===null||c.tag!==7?(c=on(f,p.mode,y,j),c.return=p,c):(c=o(c,f),c.return=p,c)}function m(p,c,f){if(typeof c=="string"&&c!==""||typeof c=="number")return c=sl(""+c,p.mode,f),c.return=p,c;if(typeof c=="object"&&c!==null){switch(c.$$typeof){case qr:return f=Mo(c.type,c.key,c.props,null,p.mode,f),f.ref=rr(p,null,c),f.return=p,f;case xn:return c=al(c,p.mode,f),c.return=p,c;case Rt:var y=c._init;return m(p,y(c._payload),f)}if(ar(c)||Jn(c))return c=on(c,p.mode,f,null),c.return=p,c;co(p,c)}return null}function g(p,c,f,y){var j=c!==null?c.key:null;if(typeof f=="string"&&f!==""||typeof f=="number")return j!==null?null:a(p,c,""+f,y);if(typeof f=="object"&&f!==null){switch(f.$$typeof){case qr:return f.key===j?u(p,c,f,y):null;case xn:return f.key===j?d(p,c,f,y):null;case Rt:return j=f._init,g(p,c,j(f._payload),y)}if(ar(f)||Jn(f))return j!==null?null:h(p,c,f,y,null);co(p,f)}return null}function k(p,c,f,y,j){if(typeof y=="string"&&y!==""||typeof y=="number")return p=p.get(f)||null,a(c,p,""+y,j);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case qr:return p=p.get(y.key===null?f:y.key)||null,u(c,p,y,j);case xn:return p=p.get(y.key===null?f:y.key)||null,d(c,p,y,j);case Rt:var N=y._init;return k(p,c,f,N(y._payload),j)}if(ar(y)||Jn(y))return p=p.get(f)||null,h(c,p,y,j,null);co(c,y)}return null}function x(p,c,f,y){for(var j=null,N=null,w=c,C=c=0,M=null;w!==null&&C<f.length;C++){w.index>C?(M=w,w=null):M=w.sibling;var T=g(p,w,f[C],y);if(T===null){w===null&&(w=M);break}e&&w&&T.alternate===null&&t(p,w),c=i(T,c,C),N===null?j=T:N.sibling=T,N=T,w=M}if(C===f.length)return n(p,w),ne&&Xt(p,C),j;if(w===null){for(;C<f.length;C++)w=m(p,f[C],y),w!==null&&(c=i(w,c,C),N===null?j=w:N.sibling=w,N=w);return ne&&Xt(p,C),j}for(w=r(p,w);C<f.length;C++)M=k(w,p,C,f[C],y),M!==null&&(e&&M.alternate!==null&&w.delete(M.key===null?C:M.key),c=i(M,c,C),N===null?j=M:N.sibling=M,N=M);return e&&w.forEach(function(F){return t(p,F)}),ne&&Xt(p,C),j}function S(p,c,f,y){var j=Jn(f);if(typeof j!="function")throw Error(z(150));if(f=j.call(f),f==null)throw Error(z(151));for(var N=j=null,w=c,C=c=0,M=null,T=f.next();w!==null&&!T.done;C++,T=f.next()){w.index>C?(M=w,w=null):M=w.sibling;var F=g(p,w,T.value,y);if(F===null){w===null&&(w=M);break}e&&w&&F.alternate===null&&t(p,w),c=i(F,c,C),N===null?j=F:N.sibling=F,N=F,w=M}if(T.done)return n(p,w),ne&&Xt(p,C),j;if(w===null){for(;!T.done;C++,T=f.next())T=m(p,T.value,y),T!==null&&(c=i(T,c,C),N===null?j=T:N.sibling=T,N=T);return ne&&Xt(p,C),j}for(w=r(p,w);!T.done;C++,T=f.next())T=k(w,p,C,T.value,y),T!==null&&(e&&T.alternate!==null&&w.delete(T.key===null?C:T.key),c=i(T,c,C),N===null?j=T:N.sibling=T,N=T);return e&&w.forEach(function(Y){return t(p,Y)}),ne&&Xt(p,C),j}function _(p,c,f,y){if(typeof f=="object"&&f!==null&&f.type===yn&&f.key===null&&(f=f.props.children),typeof f=="object"&&f!==null){switch(f.$$typeof){case qr:e:{for(var j=f.key,N=c;N!==null;){if(N.key===j){if(j=f.type,j===yn){if(N.tag===7){n(p,N.sibling),c=o(N,f.props.children),c.return=p,p=c;break e}}else if(N.elementType===j||typeof j=="object"&&j!==null&&j.$$typeof===Rt&&gu(j)===N.type){n(p,N.sibling),c=o(N,f.props),c.ref=rr(p,N,f),c.return=p,p=c;break e}n(p,N);break}else t(p,N);N=N.sibling}f.type===yn?(c=on(f.props.children,p.mode,y,f.key),c.return=p,p=c):(y=Mo(f.type,f.key,f.props,null,p.mode,y),y.ref=rr(p,c,f),y.return=p,p=y)}return l(p);case xn:e:{for(N=f.key;c!==null;){if(c.key===N)if(c.tag===4&&c.stateNode.containerInfo===f.containerInfo&&c.stateNode.implementation===f.implementation){n(p,c.sibling),c=o(c,f.children||[]),c.return=p,p=c;break e}else{n(p,c);break}else t(p,c);c=c.sibling}c=al(f,p.mode,y),c.return=p,p=c}return l(p);case Rt:return N=f._init,_(p,c,N(f._payload),y)}if(ar(f))return x(p,c,f,y);if(Jn(f))return S(p,c,f,y);co(p,f)}return typeof f=="string"&&f!==""||typeof f=="number"?(f=""+f,c!==null&&c.tag===6?(n(p,c.sibling),c=o(c,f),c.return=p,p=c):(n(p,c),c=sl(f,p.mode,y),c.return=p,p=c),l(p)):n(p,c)}return _}var Dn=Td(!0),Pd=Td(!1),Jo=Zt(null),qo=null,Nn=null,Gs=null;function Ys(){Gs=Nn=qo=null}function Zs(e){var t=Jo.current;ee(Jo),e._currentValue=t}function Jl(e,t,n){for(;e!==null;){var r=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,r!==null&&(r.childLanes|=t)):r!==null&&(r.childLanes&t)!==t&&(r.childLanes|=t),e===n)break;e=e.return}}function $n(e,t){qo=e,Gs=Nn=null,e=e.dependencies,e!==null&&e.firstContext!==null&&(e.lanes&t&&(Me=!0),e.firstContext=null)}function Qe(e){var t=e._currentValue;if(Gs!==e)if(e={context:e,memoizedValue:t,next:null},Nn===null){if(qo===null)throw Error(z(308));Nn=e,qo.dependencies={lanes:0,firstContext:e}}else Nn=Nn.next=e;return t}var tn=null;function Qs(e){tn===null?tn=[e]:tn.push(e)}function Ad(e,t,n,r){var o=t.interleaved;return o===null?(n.next=n,Qs(t)):(n.next=o.next,o.next=n),t.interleaved=n,Ct(e,r)}function Ct(e,t){e.lanes|=t;var n=e.alternate;for(n!==null&&(n.lanes|=t),n=e,e=e.return;e!==null;)e.childLanes|=t,n=e.alternate,n!==null&&(n.childLanes|=t),n=e,e=e.return;return n.tag===3?n.stateNode:null}var Tt=!1;function Ks(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Md(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function wt(e,t){return{eventTime:e,lane:t,tag:0,payload:null,callback:null,next:null}}function Dt(e,t,n){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,V&2){var o=r.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),r.pending=t,Ct(e,n)}return o=r.interleaved,o===null?(t.next=t,Qs(r)):(t.next=o.next,o.next=t),r.interleaved=t,Ct(e,n)}function No(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194240)!==0)){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Ls(e,n)}}function vu(e,t){var n=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,n===r)){var o=null,i=null;if(n=n.firstBaseUpdate,n!==null){do{var l={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};i===null?o=i=l:i=i.next=l,n=n.next}while(n!==null);i===null?o=i=t:i=i.next=t}else o=i=t;n={baseState:r.baseState,firstBaseUpdate:o,lastBaseUpdate:i,shared:r.shared,effects:r.effects},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}function ei(e,t,n,r){var o=e.updateQueue;Tt=!1;var i=o.firstBaseUpdate,l=o.lastBaseUpdate,a=o.shared.pending;if(a!==null){o.shared.pending=null;var u=a,d=u.next;u.next=null,l===null?i=d:l.next=d,l=u;var h=e.alternate;h!==null&&(h=h.updateQueue,a=h.lastBaseUpdate,a!==l&&(a===null?h.firstBaseUpdate=d:a.next=d,h.lastBaseUpdate=u))}if(i!==null){var m=o.baseState;l=0,h=d=u=null,a=i;do{var g=a.lane,k=a.eventTime;if((r&g)===g){h!==null&&(h=h.next={eventTime:k,lane:0,tag:a.tag,payload:a.payload,callback:a.callback,next:null});e:{var x=e,S=a;switch(g=t,k=n,S.tag){case 1:if(x=S.payload,typeof x=="function"){m=x.call(k,m,g);break e}m=x;break e;case 3:x.flags=x.flags&-65537|128;case 0:if(x=S.payload,g=typeof x=="function"?x.call(k,m,g):x,g==null)break e;m=ie({},m,g);break e;case 2:Tt=!0}}a.callback!==null&&a.lane!==0&&(e.flags|=64,g=o.effects,g===null?o.effects=[a]:g.push(a))}else k={eventTime:k,lane:g,tag:a.tag,payload:a.payload,callback:a.callback,next:null},h===null?(d=h=k,u=m):h=h.next=k,l|=g;if(a=a.next,a===null){if(a=o.shared.pending,a===null)break;g=a,a=g.next,g.next=null,o.lastBaseUpdate=g,o.shared.pending=null}}while(!0);if(h===null&&(u=m),o.baseState=u,o.firstBaseUpdate=d,o.lastBaseUpdate=h,t=o.shared.interleaved,t!==null){o=t;do l|=o.lane,o=o.next;while(o!==t)}else i===null&&(o.shared.lanes=0);cn|=l,e.lanes=l,e.memoizedState=m}}function xu(e,t,n){if(e=t.effects,t.effects=null,e!==null)for(t=0;t<e.length;t++){var r=e[t],o=r.callback;if(o!==null){if(r.callback=null,r=n,typeof o!="function")throw Error(z(191,o));o.call(r)}}}var Yr={},ht=Zt(Yr),Lr=Zt(Yr),Ir=Zt(Yr);function nn(e){if(e===Yr)throw Error(z(174));return e}function Xs(e,t){switch(X(Ir,t),X(Lr,e),X(ht,Yr),e=t.nodeType,e){case 9:case 11:t=(t=t.documentElement)?t.namespaceURI:Al(null,"");break;default:e=e===8?t.parentNode:t,t=e.namespaceURI||null,e=e.tagName,t=Al(t,e)}ee(ht),X(ht,t)}function Vn(){ee(ht),ee(Lr),ee(Ir)}function $d(e){nn(Ir.current);var t=nn(ht.current),n=Al(t,e.type);t!==n&&(X(Lr,e),X(ht,n))}function Js(e){Lr.current===e&&(ee(ht),ee(Lr))}var re=Zt(0);function ti(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!==void 0){if(t.flags&128)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var tl=[];function qs(){for(var e=0;e<tl.length;e++)tl[e]._workInProgressVersionPrimary=null;tl.length=0}var zo=Et.ReactCurrentDispatcher,nl=Et.ReactCurrentBatchConfig,un=0,oe=null,fe=null,me=null,ni=!1,xr=!1,Hr=0,nh=0;function Se(){throw Error(z(321))}function ea(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!st(e[n],t[n]))return!1;return!0}function ta(e,t,n,r,o,i){if(un=i,oe=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,zo.current=e===null||e.memoizedState===null?lh:sh,e=n(r,o),xr){i=0;do{if(xr=!1,Hr=0,25<=i)throw Error(z(301));i+=1,me=fe=null,t.updateQueue=null,zo.current=ah,e=n(r,o)}while(xr)}if(zo.current=ri,t=fe!==null&&fe.next!==null,un=0,me=fe=oe=null,ni=!1,t)throw Error(z(300));return e}function na(){var e=Hr!==0;return Hr=0,e}function dt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return me===null?oe.memoizedState=me=e:me=me.next=e,me}function Ke(){if(fe===null){var e=oe.alternate;e=e!==null?e.memoizedState:null}else e=fe.next;var t=me===null?oe.memoizedState:me.next;if(t!==null)me=t,fe=e;else{if(e===null)throw Error(z(310));fe=e,e={memoizedState:fe.memoizedState,baseState:fe.baseState,baseQueue:fe.baseQueue,queue:fe.queue,next:null},me===null?oe.memoizedState=me=e:me=me.next=e}return me}function Or(e,t){return typeof t=="function"?t(e):t}function rl(e){var t=Ke(),n=t.queue;if(n===null)throw Error(z(311));n.lastRenderedReducer=e;var r=fe,o=r.baseQueue,i=n.pending;if(i!==null){if(o!==null){var l=o.next;o.next=i.next,i.next=l}r.baseQueue=o=i,n.pending=null}if(o!==null){i=o.next,r=r.baseState;var a=l=null,u=null,d=i;do{var h=d.lane;if((un&h)===h)u!==null&&(u=u.next={lane:0,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null}),r=d.hasEagerState?d.eagerState:e(r,d.action);else{var m={lane:h,action:d.action,hasEagerState:d.hasEagerState,eagerState:d.eagerState,next:null};u===null?(a=u=m,l=r):u=u.next=m,oe.lanes|=h,cn|=h}d=d.next}while(d!==null&&d!==i);u===null?l=r:u.next=a,st(r,t.memoizedState)||(Me=!0),t.memoizedState=r,t.baseState=l,t.baseQueue=u,n.lastRenderedState=r}if(e=n.interleaved,e!==null){o=e;do i=o.lane,oe.lanes|=i,cn|=i,o=o.next;while(o!==e)}else o===null&&(n.lanes=0);return[t.memoizedState,n.dispatch]}function ol(e){var t=Ke(),n=t.queue;if(n===null)throw Error(z(311));n.lastRenderedReducer=e;var r=n.dispatch,o=n.pending,i=t.memoizedState;if(o!==null){n.pending=null;var l=o=o.next;do i=e(i,l.action),l=l.next;while(l!==o);st(i,t.memoizedState)||(Me=!0),t.memoizedState=i,t.baseQueue===null&&(t.baseState=i),n.lastRenderedState=i}return[i,r]}function Ld(){}function Id(e,t){var n=oe,r=Ke(),o=t(),i=!st(r.memoizedState,o);if(i&&(r.memoizedState=o,Me=!0),r=r.queue,ra(bd.bind(null,n,r,e),[e]),r.getSnapshot!==t||i||me!==null&&me.memoizedState.tag&1){if(n.flags|=2048,br(9,Od.bind(null,n,r,o,t),void 0,null),ge===null)throw Error(z(349));un&30||Hd(n,t,o)}return o}function Hd(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=oe.updateQueue,t===null?(t={lastEffect:null,stores:null},oe.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function Od(e,t,n,r){t.value=n,t.getSnapshot=r,Dd(t)&&Vd(e)}function bd(e,t,n){return n(function(){Dd(t)&&Vd(e)})}function Dd(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!st(e,n)}catch{return!0}}function Vd(e){var t=Ct(e,1);t!==null&&it(t,e,1,-1)}function yu(e){var t=dt();return typeof e=="function"&&(e=e()),t.memoizedState=t.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Or,lastRenderedState:e},t.queue=e,e=e.dispatch=ih.bind(null,oe,e),[t.memoizedState,e]}function br(e,t,n,r){return e={tag:e,create:t,destroy:n,deps:r,next:null},t=oe.updateQueue,t===null?(t={lastEffect:null,stores:null},oe.updateQueue=t,t.lastEffect=e.next=e):(n=t.lastEffect,n===null?t.lastEffect=e.next=e:(r=n.next,n.next=e,e.next=r,t.lastEffect=e)),e}function Fd(){return Ke().memoizedState}function Ro(e,t,n,r){var o=dt();oe.flags|=e,o.memoizedState=br(1|t,n,void 0,r===void 0?null:r)}function yi(e,t,n,r){var o=Ke();r=r===void 0?null:r;var i=void 0;if(fe!==null){var l=fe.memoizedState;if(i=l.destroy,r!==null&&ea(r,l.deps)){o.memoizedState=br(t,n,i,r);return}}oe.flags|=e,o.memoizedState=br(1|t,n,i,r)}function wu(e,t){return Ro(8390656,8,e,t)}function ra(e,t){return yi(2048,8,e,t)}function Bd(e,t){return yi(4,2,e,t)}function Ud(e,t){return yi(4,4,e,t)}function Wd(e,t){if(typeof t=="function")return e=e(),t(e),function(){t(null)};if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Gd(e,t,n){return n=n!=null?n.concat([e]):null,yi(4,4,Wd.bind(null,t,e),n)}function oa(){}function Yd(e,t){var n=Ke();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&ea(t,r[1])?r[0]:(n.memoizedState=[e,t],e)}function Zd(e,t){var n=Ke();t=t===void 0?null:t;var r=n.memoizedState;return r!==null&&t!==null&&ea(t,r[1])?r[0]:(e=e(),n.memoizedState=[e,t],e)}function Qd(e,t,n){return un&21?(st(n,t)||(n=ed(),oe.lanes|=n,cn|=n,e.baseState=!0),t):(e.baseState&&(e.baseState=!1,Me=!0),e.memoizedState=n)}function rh(e,t){var n=G;G=n!==0&&4>n?n:4,e(!0);var r=nl.transition;nl.transition={};try{e(!1),t()}finally{G=n,nl.transition=r}}function Kd(){return Ke().memoizedState}function oh(e,t,n){var r=Ft(e);if(n={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null},Xd(e))Jd(t,n);else if(n=Ad(e,t,n,r),n!==null){var o=Re();it(n,e,r,o),qd(n,t,r)}}function ih(e,t,n){var r=Ft(e),o={lane:r,action:n,hasEagerState:!1,eagerState:null,next:null};if(Xd(e))Jd(t,o);else{var i=e.alternate;if(e.lanes===0&&(i===null||i.lanes===0)&&(i=t.lastRenderedReducer,i!==null))try{var l=t.lastRenderedState,a=i(l,n);if(o.hasEagerState=!0,o.eagerState=a,st(a,l)){var u=t.interleaved;u===null?(o.next=o,Qs(t)):(o.next=u.next,u.next=o),t.interleaved=o;return}}catch{}finally{}n=Ad(e,t,o,r),n!==null&&(o=Re(),it(n,e,r,o),qd(n,t,r))}}function Xd(e){var t=e.alternate;return e===oe||t!==null&&t===oe}function Jd(e,t){xr=ni=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function qd(e,t,n){if(n&4194240){var r=t.lanes;r&=e.pendingLanes,n|=r,t.lanes=n,Ls(e,n)}}var ri={readContext:Qe,useCallback:Se,useContext:Se,useEffect:Se,useImperativeHandle:Se,useInsertionEffect:Se,useLayoutEffect:Se,useMemo:Se,useReducer:Se,useRef:Se,useState:Se,useDebugValue:Se,useDeferredValue:Se,useTransition:Se,useMutableSource:Se,useSyncExternalStore:Se,useId:Se,unstable_isNewReconciler:!1},lh={readContext:Qe,useCallback:function(e,t){return dt().memoizedState=[e,t===void 0?null:t],e},useContext:Qe,useEffect:wu,useImperativeHandle:function(e,t,n){return n=n!=null?n.concat([e]):null,Ro(4194308,4,Wd.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Ro(4194308,4,e,t)},useInsertionEffect:function(e,t){return Ro(4,2,e,t)},useMemo:function(e,t){var n=dt();return t=t===void 0?null:t,e=e(),n.memoizedState=[e,t],e},useReducer:function(e,t,n){var r=dt();return t=n!==void 0?n(t):t,r.memoizedState=r.baseState=t,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:t},r.queue=e,e=e.dispatch=oh.bind(null,oe,e),[r.memoizedState,e]},useRef:function(e){var t=dt();return e={current:e},t.memoizedState=e},useState:yu,useDebugValue:oa,useDeferredValue:function(e){return dt().memoizedState=e},useTransition:function(){var e=yu(!1),t=e[0];return e=rh.bind(null,e[1]),dt().memoizedState=e,[t,e]},useMutableSource:function(){},useSyncExternalStore:function(e,t,n){var r=oe,o=dt();if(ne){if(n===void 0)throw Error(z(407));n=n()}else{if(n=t(),ge===null)throw Error(z(349));un&30||Hd(r,t,n)}o.memoizedState=n;var i={value:n,getSnapshot:t};return o.queue=i,wu(bd.bind(null,r,i,e),[e]),r.flags|=2048,br(9,Od.bind(null,r,i,n,t),void 0,null),n},useId:function(){var e=dt(),t=ge.identifierPrefix;if(ne){var n=yt,r=xt;n=(r&~(1<<32-ot(r)-1)).toString(32)+n,t=":"+t+"R"+n,n=Hr++,0<n&&(t+="H"+n.toString(32)),t+=":"}else n=nh++,t=":"+t+"r"+n.toString(32)+":";return e.memoizedState=t},unstable_isNewReconciler:!1},sh={readContext:Qe,useCallback:Yd,useContext:Qe,useEffect:ra,useImperativeHandle:Gd,useInsertionEffect:Bd,useLayoutEffect:Ud,useMemo:Zd,useReducer:rl,useRef:Fd,useState:function(){return rl(Or)},useDebugValue:oa,useDeferredValue:function(e){var t=Ke();return Qd(t,fe.memoizedState,e)},useTransition:function(){var e=rl(Or)[0],t=Ke().memoizedState;return[e,t]},useMutableSource:Ld,useSyncExternalStore:Id,useId:Kd,unstable_isNewReconciler:!1},ah={readContext:Qe,useCallback:Yd,useContext:Qe,useEffect:ra,useImperativeHandle:Gd,useInsertionEffect:Bd,useLayoutEffect:Ud,useMemo:Zd,useReducer:ol,useRef:Fd,useState:function(){return ol(Or)},useDebugValue:oa,useDeferredValue:function(e){var t=Ke();return fe===null?t.memoizedState=e:Qd(t,fe.memoizedState,e)},useTransition:function(){var e=ol(Or)[0],t=Ke().memoizedState;return[e,t]},useMutableSource:Ld,useSyncExternalStore:Id,useId:Kd,unstable_isNewReconciler:!1};function et(e,t){if(e&&e.defaultProps){t=ie({},t),e=e.defaultProps;for(var n in e)t[n]===void 0&&(t[n]=e[n]);return t}return t}function ql(e,t,n,r){t=e.memoizedState,n=n(r,t),n=n==null?t:ie({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var wi={isMounted:function(e){return(e=e._reactInternals)?hn(e)===e:!1},enqueueSetState:function(e,t,n){e=e._reactInternals;var r=Re(),o=Ft(e),i=wt(r,o);i.payload=t,n!=null&&(i.callback=n),t=Dt(e,i,o),t!==null&&(it(t,e,o,r),No(t,e,o))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var r=Re(),o=Ft(e),i=wt(r,o);i.tag=1,i.payload=t,n!=null&&(i.callback=n),t=Dt(e,i,o),t!==null&&(it(t,e,o,r),No(t,e,o))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=Re(),r=Ft(e),o=wt(n,r);o.tag=2,t!=null&&(o.callback=t),t=Dt(e,o,r),t!==null&&(it(t,e,r,n),No(t,e,r))}};function ku(e,t,n,r,o,i,l){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,i,l):t.prototype&&t.prototype.isPureReactComponent?!Pr(n,r)||!Pr(o,i):!0}function ef(e,t,n){var r=!1,o=Gt,i=t.contextType;return typeof i=="object"&&i!==null?i=Qe(i):(o=Le(t)?sn:Ee.current,r=t.contextTypes,i=(r=r!=null)?On(e,o):Gt),t=new t(n,i),e.memoizedState=t.state!==null&&t.state!==void 0?t.state:null,t.updater=wi,e.stateNode=t,t._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=o,e.__reactInternalMemoizedMaskedChildContext=i),t}function Su(e,t,n,r){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,r),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,r),t.state!==e&&wi.enqueueReplaceState(t,t.state,null)}function es(e,t,n,r){var o=e.stateNode;o.props=n,o.state=e.memoizedState,o.refs={},Ks(e);var i=t.contextType;typeof i=="object"&&i!==null?o.context=Qe(i):(i=Le(t)?sn:Ee.current,o.context=On(e,i)),o.state=e.memoizedState,i=t.getDerivedStateFromProps,typeof i=="function"&&(ql(e,t,i,n),o.state=e.memoizedState),typeof t.getDerivedStateFromProps=="function"||typeof o.getSnapshotBeforeUpdate=="function"||typeof o.UNSAFE_componentWillMount!="function"&&typeof o.componentWillMount!="function"||(t=o.state,typeof o.componentWillMount=="function"&&o.componentWillMount(),typeof o.UNSAFE_componentWillMount=="function"&&o.UNSAFE_componentWillMount(),t!==o.state&&wi.enqueueReplaceState(o,o.state,null),ei(e,n,o,r),o.state=e.memoizedState),typeof o.componentDidMount=="function"&&(e.flags|=4194308)}function Fn(e,t){try{var n="",r=t;do n+=Ip(r),r=r.return;while(r);var o=n}catch(i){o=`
Error generating stack: `+i.message+`
`+i.stack}return{value:e,source:t,stack:o,digest:null}}function il(e,t,n){return{value:e,source:null,stack:n??null,digest:t??null}}function ts(e,t){try{console.error(t.value)}catch(n){setTimeout(function(){throw n})}}var uh=typeof WeakMap=="function"?WeakMap:Map;function tf(e,t,n){n=wt(-1,n),n.tag=3,n.payload={element:null};var r=t.value;return n.callback=function(){ii||(ii=!0,ds=r),ts(e,t)},n}function nf(e,t,n){n=wt(-1,n),n.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var o=t.value;n.payload=function(){return r(o)},n.callback=function(){ts(e,t)}}var i=e.stateNode;return i!==null&&typeof i.componentDidCatch=="function"&&(n.callback=function(){ts(e,t),typeof r!="function"&&(Vt===null?Vt=new Set([this]):Vt.add(this));var l=t.stack;this.componentDidCatch(t.value,{componentStack:l!==null?l:""})}),n}function Cu(e,t,n){var r=e.pingCache;if(r===null){r=e.pingCache=new uh;var o=new Set;r.set(t,o)}else o=r.get(t),o===void 0&&(o=new Set,r.set(t,o));o.has(n)||(o.add(n),e=Ch.bind(null,e,t,n),t.then(e,e))}function ju(e){do{var t;if((t=e.tag===13)&&(t=e.memoizedState,t=t!==null?t.dehydrated!==null:!0),t)return e;e=e.return}while(e!==null);return null}function Eu(e,t,n,r,o){return e.mode&1?(e.flags|=65536,e.lanes=o,e):(e===t?e.flags|=65536:(e.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(t=wt(-1,1),t.tag=2,Dt(n,t,1))),n.lanes|=1),e)}var ch=Et.ReactCurrentOwner,Me=!1;function ze(e,t,n,r){t.child=e===null?Pd(t,null,n,r):Dn(t,e.child,n,r)}function _u(e,t,n,r,o){n=n.render;var i=t.ref;return $n(t,o),r=ta(e,t,n,r,i,o),n=na(),e!==null&&!Me?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~o,jt(e,t,o)):(ne&&n&&Bs(t),t.flags|=1,ze(e,t,r,o),t.child)}function Nu(e,t,n,r,o){if(e===null){var i=n.type;return typeof i=="function"&&!fa(i)&&i.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(t.tag=15,t.type=i,rf(e,t,i,r,o)):(e=Mo(n.type,null,r,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(i=e.child,!(e.lanes&o)){var l=i.memoizedProps;if(n=n.compare,n=n!==null?n:Pr,n(l,r)&&e.ref===t.ref)return jt(e,t,o)}return t.flags|=1,e=Bt(i,r),e.ref=t.ref,e.return=t,t.child=e}function rf(e,t,n,r,o){if(e!==null){var i=e.memoizedProps;if(Pr(i,r)&&e.ref===t.ref)if(Me=!1,t.pendingProps=r=i,(e.lanes&o)!==0)e.flags&131072&&(Me=!0);else return t.lanes=e.lanes,jt(e,t,o)}return ns(e,t,n,r,o)}function of(e,t,n){var r=t.pendingProps,o=r.children,i=e!==null?e.memoizedState:null;if(r.mode==="hidden")if(!(t.mode&1))t.memoizedState={baseLanes:0,cachePool:null,transitions:null},X(Rn,He),He|=n;else{if(!(n&1073741824))return e=i!==null?i.baseLanes|n:n,t.lanes=t.childLanes=1073741824,t.memoizedState={baseLanes:e,cachePool:null,transitions:null},t.updateQueue=null,X(Rn,He),He|=e,null;t.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=i!==null?i.baseLanes:n,X(Rn,He),He|=r}else i!==null?(r=i.baseLanes|n,t.memoizedState=null):r=n,X(Rn,He),He|=r;return ze(e,t,o,n),t.child}function lf(e,t){var n=t.ref;(e===null&&n!==null||e!==null&&e.ref!==n)&&(t.flags|=512,t.flags|=2097152)}function ns(e,t,n,r,o){var i=Le(n)?sn:Ee.current;return i=On(t,i),$n(t,o),n=ta(e,t,n,r,i,o),r=na(),e!==null&&!Me?(t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~o,jt(e,t,o)):(ne&&r&&Bs(t),t.flags|=1,ze(e,t,n,o),t.child)}function zu(e,t,n,r,o){if(Le(n)){var i=!0;Qo(t)}else i=!1;if($n(t,o),t.stateNode===null)To(e,t),ef(t,n,r),es(t,n,r,o),r=!0;else if(e===null){var l=t.stateNode,a=t.memoizedProps;l.props=a;var u=l.context,d=n.contextType;typeof d=="object"&&d!==null?d=Qe(d):(d=Le(n)?sn:Ee.current,d=On(t,d));var h=n.getDerivedStateFromProps,m=typeof h=="function"||typeof l.getSnapshotBeforeUpdate=="function";m||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(a!==r||u!==d)&&Su(t,l,r,d),Tt=!1;var g=t.memoizedState;l.state=g,ei(t,r,l,o),u=t.memoizedState,a!==r||g!==u||$e.current||Tt?(typeof h=="function"&&(ql(t,n,h,r),u=t.memoizedState),(a=Tt||ku(t,n,a,r,g,u,d))?(m||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount()),typeof l.componentDidMount=="function"&&(t.flags|=4194308)):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=r,t.memoizedState=u),l.props=r,l.state=u,l.context=d,r=a):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),r=!1)}else{l=t.stateNode,Md(e,t),a=t.memoizedProps,d=t.type===t.elementType?a:et(t.type,a),l.props=d,m=t.pendingProps,g=l.context,u=n.contextType,typeof u=="object"&&u!==null?u=Qe(u):(u=Le(n)?sn:Ee.current,u=On(t,u));var k=n.getDerivedStateFromProps;(h=typeof k=="function"||typeof l.getSnapshotBeforeUpdate=="function")||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(a!==m||g!==u)&&Su(t,l,r,u),Tt=!1,g=t.memoizedState,l.state=g,ei(t,r,l,o);var x=t.memoizedState;a!==m||g!==x||$e.current||Tt?(typeof k=="function"&&(ql(t,n,k,r),x=t.memoizedState),(d=Tt||ku(t,n,d,r,g,x,u)||!1)?(h||typeof l.UNSAFE_componentWillUpdate!="function"&&typeof l.componentWillUpdate!="function"||(typeof l.componentWillUpdate=="function"&&l.componentWillUpdate(r,x,u),typeof l.UNSAFE_componentWillUpdate=="function"&&l.UNSAFE_componentWillUpdate(r,x,u)),typeof l.componentDidUpdate=="function"&&(t.flags|=4),typeof l.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof l.componentDidUpdate!="function"||a===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||a===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),t.memoizedProps=r,t.memoizedState=x),l.props=r,l.state=x,l.context=u,r=d):(typeof l.componentDidUpdate!="function"||a===e.memoizedProps&&g===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||a===e.memoizedProps&&g===e.memoizedState||(t.flags|=1024),r=!1)}return rs(e,t,n,r,i,o)}function rs(e,t,n,r,o,i){lf(e,t);var l=(t.flags&128)!==0;if(!r&&!l)return o&&pu(t,n,!1),jt(e,t,i);r=t.stateNode,ch.current=t;var a=l&&typeof n.getDerivedStateFromError!="function"?null:r.render();return t.flags|=1,e!==null&&l?(t.child=Dn(t,e.child,null,i),t.child=Dn(t,null,a,i)):ze(e,t,a,i),t.memoizedState=r.state,o&&pu(t,n,!0),t.child}function sf(e){var t=e.stateNode;t.pendingContext?fu(e,t.pendingContext,t.pendingContext!==t.context):t.context&&fu(e,t.context,!1),Xs(e,t.containerInfo)}function Ru(e,t,n,r,o){return bn(),Ws(o),t.flags|=256,ze(e,t,n,r),t.child}var os={dehydrated:null,treeContext:null,retryLane:0};function is(e){return{baseLanes:e,cachePool:null,transitions:null}}function af(e,t,n){var r=t.pendingProps,o=re.current,i=!1,l=(t.flags&128)!==0,a;if((a=l)||(a=e!==null&&e.memoizedState===null?!1:(o&2)!==0),a?(i=!0,t.flags&=-129):(e===null||e.memoizedState!==null)&&(o|=1),X(re,o&1),e===null)return Xl(t),e=t.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?(t.mode&1?e.data==="$!"?t.lanes=8:t.lanes=1073741824:t.lanes=1,null):(l=r.children,e=r.fallback,i?(r=t.mode,i=t.child,l={mode:"hidden",children:l},!(r&1)&&i!==null?(i.childLanes=0,i.pendingProps=l):i=Ci(l,r,0,null),e=on(e,r,n,null),i.return=t,e.return=t,i.sibling=e,t.child=i,t.child.memoizedState=is(n),t.memoizedState=os,e):ia(t,l));if(o=e.memoizedState,o!==null&&(a=o.dehydrated,a!==null))return dh(e,t,l,r,a,o,n);if(i){i=r.fallback,l=t.mode,o=e.child,a=o.sibling;var u={mode:"hidden",children:r.children};return!(l&1)&&t.child!==o?(r=t.child,r.childLanes=0,r.pendingProps=u,t.deletions=null):(r=Bt(o,u),r.subtreeFlags=o.subtreeFlags&14680064),a!==null?i=Bt(a,i):(i=on(i,l,n,null),i.flags|=2),i.return=t,r.return=t,r.sibling=i,t.child=r,r=i,i=t.child,l=e.child.memoizedState,l=l===null?is(n):{baseLanes:l.baseLanes|n,cachePool:null,transitions:l.transitions},i.memoizedState=l,i.childLanes=e.childLanes&~n,t.memoizedState=os,r}return i=e.child,e=i.sibling,r=Bt(i,{mode:"visible",children:r.children}),!(t.mode&1)&&(r.lanes=n),r.return=t,r.sibling=null,e!==null&&(n=t.deletions,n===null?(t.deletions=[e],t.flags|=16):n.push(e)),t.child=r,t.memoizedState=null,r}function ia(e,t){return t=Ci({mode:"visible",children:t},e.mode,0,null),t.return=e,e.child=t}function fo(e,t,n,r){return r!==null&&Ws(r),Dn(t,e.child,null,n),e=ia(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function dh(e,t,n,r,o,i,l){if(n)return t.flags&256?(t.flags&=-257,r=il(Error(z(422))),fo(e,t,l,r)):t.memoizedState!==null?(t.child=e.child,t.flags|=128,null):(i=r.fallback,o=t.mode,r=Ci({mode:"visible",children:r.children},o,0,null),i=on(i,o,l,null),i.flags|=2,r.return=t,i.return=t,r.sibling=i,t.child=r,t.mode&1&&Dn(t,e.child,null,l),t.child.memoizedState=is(l),t.memoizedState=os,i);if(!(t.mode&1))return fo(e,t,l,null);if(o.data==="$!"){if(r=o.nextSibling&&o.nextSibling.dataset,r)var a=r.dgst;return r=a,i=Error(z(419)),r=il(i,r,void 0),fo(e,t,l,r)}if(a=(l&e.childLanes)!==0,Me||a){if(r=ge,r!==null){switch(l&-l){case 4:o=2;break;case 16:o=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:o=32;break;case 536870912:o=268435456;break;default:o=0}o=o&(r.suspendedLanes|l)?0:o,o!==0&&o!==i.retryLane&&(i.retryLane=o,Ct(e,o),it(r,e,o,-1))}return da(),r=il(Error(z(421))),fo(e,t,l,r)}return o.data==="$?"?(t.flags|=128,t.child=e.child,t=jh.bind(null,e),o._reactRetry=t,null):(e=i.treeContext,be=bt(o.nextSibling),De=t,ne=!0,rt=null,e!==null&&(We[Ge++]=xt,We[Ge++]=yt,We[Ge++]=an,xt=e.id,yt=e.overflow,an=t),t=ia(t,r.children),t.flags|=4096,t)}function Tu(e,t,n){e.lanes|=t;var r=e.alternate;r!==null&&(r.lanes|=t),Jl(e.return,t,n)}function ll(e,t,n,r,o){var i=e.memoizedState;i===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:r,tail:n,tailMode:o}:(i.isBackwards=t,i.rendering=null,i.renderingStartTime=0,i.last=r,i.tail=n,i.tailMode=o)}function uf(e,t,n){var r=t.pendingProps,o=r.revealOrder,i=r.tail;if(ze(e,t,r.children,n),r=re.current,r&2)r=r&1|2,t.flags|=128;else{if(e!==null&&e.flags&128)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Tu(e,n,t);else if(e.tag===19)Tu(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(X(re,r),!(t.mode&1))t.memoizedState=null;else switch(o){case"forwards":for(n=t.child,o=null;n!==null;)e=n.alternate,e!==null&&ti(e)===null&&(o=n),n=n.sibling;n=o,n===null?(o=t.child,t.child=null):(o=n.sibling,n.sibling=null),ll(t,!1,o,n,i);break;case"backwards":for(n=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&ti(e)===null){t.child=o;break}e=o.sibling,o.sibling=n,n=o,o=e}ll(t,!0,n,null,i);break;case"together":ll(t,!1,null,null,void 0);break;default:t.memoizedState=null}return t.child}function To(e,t){!(t.mode&1)&&e!==null&&(e.alternate=null,t.alternate=null,t.flags|=2)}function jt(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),cn|=t.lanes,!(n&t.childLanes))return null;if(e!==null&&t.child!==e.child)throw Error(z(153));if(t.child!==null){for(e=t.child,n=Bt(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Bt(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function fh(e,t,n){switch(t.tag){case 3:sf(t),bn();break;case 5:$d(t);break;case 1:Le(t.type)&&Qo(t);break;case 4:Xs(t,t.stateNode.containerInfo);break;case 10:var r=t.type._context,o=t.memoizedProps.value;X(Jo,r._currentValue),r._currentValue=o;break;case 13:if(r=t.memoizedState,r!==null)return r.dehydrated!==null?(X(re,re.current&1),t.flags|=128,null):n&t.child.childLanes?af(e,t,n):(X(re,re.current&1),e=jt(e,t,n),e!==null?e.sibling:null);X(re,re.current&1);break;case 19:if(r=(n&t.childLanes)!==0,e.flags&128){if(r)return uf(e,t,n);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),X(re,re.current),r)break;return null;case 22:case 23:return t.lanes=0,of(e,t,n)}return jt(e,t,n)}var cf,ls,df,ff;cf=function(e,t){for(var n=t.child;n!==null;){if(n.tag===5||n.tag===6)e.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===t)break;for(;n.sibling===null;){if(n.return===null||n.return===t)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};ls=function(){};df=function(e,t,n,r){var o=e.memoizedProps;if(o!==r){e=t.stateNode,nn(ht.current);var i=null;switch(n){case"input":o=zl(e,o),r=zl(e,r),i=[];break;case"select":o=ie({},o,{value:void 0}),r=ie({},r,{value:void 0}),i=[];break;case"textarea":o=Pl(e,o),r=Pl(e,r),i=[];break;default:typeof o.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=Yo)}Ml(n,r);var l;n=null;for(d in o)if(!r.hasOwnProperty(d)&&o.hasOwnProperty(d)&&o[d]!=null)if(d==="style"){var a=o[d];for(l in a)a.hasOwnProperty(l)&&(n||(n={}),n[l]="")}else d!=="dangerouslySetInnerHTML"&&d!=="children"&&d!=="suppressContentEditableWarning"&&d!=="suppressHydrationWarning"&&d!=="autoFocus"&&(jr.hasOwnProperty(d)?i||(i=[]):(i=i||[]).push(d,null));for(d in r){var u=r[d];if(a=o!=null?o[d]:void 0,r.hasOwnProperty(d)&&u!==a&&(u!=null||a!=null))if(d==="style")if(a){for(l in a)!a.hasOwnProperty(l)||u&&u.hasOwnProperty(l)||(n||(n={}),n[l]="");for(l in u)u.hasOwnProperty(l)&&a[l]!==u[l]&&(n||(n={}),n[l]=u[l])}else n||(i||(i=[]),i.push(d,n)),n=u;else d==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,a=a?a.__html:void 0,u!=null&&a!==u&&(i=i||[]).push(d,u)):d==="children"?typeof u!="string"&&typeof u!="number"||(i=i||[]).push(d,""+u):d!=="suppressContentEditableWarning"&&d!=="suppressHydrationWarning"&&(jr.hasOwnProperty(d)?(u!=null&&d==="onScroll"&&J("scroll",e),i||a===u||(i=[])):(i=i||[]).push(d,u))}n&&(i=i||[]).push("style",n);var d=i;(t.updateQueue=d)&&(t.flags|=4)}};ff=function(e,t,n,r){n!==r&&(t.flags|=4)};function or(e,t){if(!ne)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var r=null;n!==null;)n.alternate!==null&&(r=n),n=n.sibling;r===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function Ce(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,r=0;if(t)for(var o=e.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags&14680064,r|=o.flags&14680064,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)n|=o.lanes|o.childLanes,r|=o.subtreeFlags,r|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=r,e.childLanes=n,t}function ph(e,t,n){var r=t.pendingProps;switch(Us(t),t.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Ce(t),null;case 1:return Le(t.type)&&Zo(),Ce(t),null;case 3:return r=t.stateNode,Vn(),ee($e),ee(Ee),qs(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(uo(t)?t.flags|=4:e===null||e.memoizedState.isDehydrated&&!(t.flags&256)||(t.flags|=1024,rt!==null&&(hs(rt),rt=null))),ls(e,t),Ce(t),null;case 5:Js(t);var o=nn(Ir.current);if(n=t.type,e!==null&&t.stateNode!=null)df(e,t,n,r,o),e.ref!==t.ref&&(t.flags|=512,t.flags|=2097152);else{if(!r){if(t.stateNode===null)throw Error(z(166));return Ce(t),null}if(e=nn(ht.current),uo(t)){r=t.stateNode,n=t.type;var i=t.memoizedProps;switch(r[ft]=t,r[$r]=i,e=(t.mode&1)!==0,n){case"dialog":J("cancel",r),J("close",r);break;case"iframe":case"object":case"embed":J("load",r);break;case"video":case"audio":for(o=0;o<cr.length;o++)J(cr[o],r);break;case"source":J("error",r);break;case"img":case"image":case"link":J("error",r),J("load",r);break;case"details":J("toggle",r);break;case"input":ba(r,i),J("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!i.multiple},J("invalid",r);break;case"textarea":Va(r,i),J("invalid",r)}Ml(n,i),o=null;for(var l in i)if(i.hasOwnProperty(l)){var a=i[l];l==="children"?typeof a=="string"?r.textContent!==a&&(i.suppressHydrationWarning!==!0&&ao(r.textContent,a,e),o=["children",a]):typeof a=="number"&&r.textContent!==""+a&&(i.suppressHydrationWarning!==!0&&ao(r.textContent,a,e),o=["children",""+a]):jr.hasOwnProperty(l)&&a!=null&&l==="onScroll"&&J("scroll",r)}switch(n){case"input":eo(r),Da(r,i,!0);break;case"textarea":eo(r),Fa(r);break;case"select":case"option":break;default:typeof i.onClick=="function"&&(r.onclick=Yo)}r=o,t.updateQueue=r,r!==null&&(t.flags|=4)}else{l=o.nodeType===9?o:o.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=bc(n)),e==="http://www.w3.org/1999/xhtml"?n==="script"?(e=l.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=l.createElement(n,{is:r.is}):(e=l.createElement(n),n==="select"&&(l=e,r.multiple?l.multiple=!0:r.size&&(l.size=r.size))):e=l.createElementNS(e,n),e[ft]=t,e[$r]=r,cf(e,t,!1,!1),t.stateNode=e;e:{switch(l=$l(n,r),n){case"dialog":J("cancel",e),J("close",e),o=r;break;case"iframe":case"object":case"embed":J("load",e),o=r;break;case"video":case"audio":for(o=0;o<cr.length;o++)J(cr[o],e);o=r;break;case"source":J("error",e),o=r;break;case"img":case"image":case"link":J("error",e),J("load",e),o=r;break;case"details":J("toggle",e),o=r;break;case"input":ba(e,r),o=zl(e,r),J("invalid",e);break;case"option":o=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},o=ie({},r,{value:void 0}),J("invalid",e);break;case"textarea":Va(e,r),o=Pl(e,r),J("invalid",e);break;default:o=r}Ml(n,o),a=o;for(i in a)if(a.hasOwnProperty(i)){var u=a[i];i==="style"?Fc(e,u):i==="dangerouslySetInnerHTML"?(u=u?u.__html:void 0,u!=null&&Dc(e,u)):i==="children"?typeof u=="string"?(n!=="textarea"||u!=="")&&Er(e,u):typeof u=="number"&&Er(e,""+u):i!=="suppressContentEditableWarning"&&i!=="suppressHydrationWarning"&&i!=="autoFocus"&&(jr.hasOwnProperty(i)?u!=null&&i==="onScroll"&&J("scroll",e):u!=null&&Rs(e,i,u,l))}switch(n){case"input":eo(e),Da(e,r,!1);break;case"textarea":eo(e),Fa(e);break;case"option":r.value!=null&&e.setAttribute("value",""+Wt(r.value));break;case"select":e.multiple=!!r.multiple,i=r.value,i!=null?Tn(e,!!r.multiple,i,!1):r.defaultValue!=null&&Tn(e,!!r.multiple,r.defaultValue,!0);break;default:typeof o.onClick=="function"&&(e.onclick=Yo)}switch(n){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(t.flags|=4)}t.ref!==null&&(t.flags|=512,t.flags|=2097152)}return Ce(t),null;case 6:if(e&&t.stateNode!=null)ff(e,t,e.memoizedProps,r);else{if(typeof r!="string"&&t.stateNode===null)throw Error(z(166));if(n=nn(Ir.current),nn(ht.current),uo(t)){if(r=t.stateNode,n=t.memoizedProps,r[ft]=t,(i=r.nodeValue!==n)&&(e=De,e!==null))switch(e.tag){case 3:ao(r.nodeValue,n,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&ao(r.nodeValue,n,(e.mode&1)!==0)}i&&(t.flags|=4)}else r=(n.nodeType===9?n:n.ownerDocument).createTextNode(r),r[ft]=t,t.stateNode=r}return Ce(t),null;case 13:if(ee(re),r=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(ne&&be!==null&&t.mode&1&&!(t.flags&128))Rd(),bn(),t.flags|=98560,i=!1;else if(i=uo(t),r!==null&&r.dehydrated!==null){if(e===null){if(!i)throw Error(z(318));if(i=t.memoizedState,i=i!==null?i.dehydrated:null,!i)throw Error(z(317));i[ft]=t}else bn(),!(t.flags&128)&&(t.memoizedState=null),t.flags|=4;Ce(t),i=!1}else rt!==null&&(hs(rt),rt=null),i=!0;if(!i)return t.flags&65536?t:null}return t.flags&128?(t.lanes=n,t):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(t.child.flags|=8192,t.mode&1&&(e===null||re.current&1?he===0&&(he=3):da())),t.updateQueue!==null&&(t.flags|=4),Ce(t),null);case 4:return Vn(),ls(e,t),e===null&&Ar(t.stateNode.containerInfo),Ce(t),null;case 10:return Zs(t.type._context),Ce(t),null;case 17:return Le(t.type)&&Zo(),Ce(t),null;case 19:if(ee(re),i=t.memoizedState,i===null)return Ce(t),null;if(r=(t.flags&128)!==0,l=i.rendering,l===null)if(r)or(i,!1);else{if(he!==0||e!==null&&e.flags&128)for(e=t.child;e!==null;){if(l=ti(e),l!==null){for(t.flags|=128,or(i,!1),r=l.updateQueue,r!==null&&(t.updateQueue=r,t.flags|=4),t.subtreeFlags=0,r=n,n=t.child;n!==null;)i=n,e=r,i.flags&=14680066,l=i.alternate,l===null?(i.childLanes=0,i.lanes=e,i.child=null,i.subtreeFlags=0,i.memoizedProps=null,i.memoizedState=null,i.updateQueue=null,i.dependencies=null,i.stateNode=null):(i.childLanes=l.childLanes,i.lanes=l.lanes,i.child=l.child,i.subtreeFlags=0,i.deletions=null,i.memoizedProps=l.memoizedProps,i.memoizedState=l.memoizedState,i.updateQueue=l.updateQueue,i.type=l.type,e=l.dependencies,i.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),n=n.sibling;return X(re,re.current&1|2),t.child}e=e.sibling}i.tail!==null&&se()>Bn&&(t.flags|=128,r=!0,or(i,!1),t.lanes=4194304)}else{if(!r)if(e=ti(l),e!==null){if(t.flags|=128,r=!0,n=e.updateQueue,n!==null&&(t.updateQueue=n,t.flags|=4),or(i,!0),i.tail===null&&i.tailMode==="hidden"&&!l.alternate&&!ne)return Ce(t),null}else 2*se()-i.renderingStartTime>Bn&&n!==1073741824&&(t.flags|=128,r=!0,or(i,!1),t.lanes=4194304);i.isBackwards?(l.sibling=t.child,t.child=l):(n=i.last,n!==null?n.sibling=l:t.child=l,i.last=l)}return i.tail!==null?(t=i.tail,i.rendering=t,i.tail=t.sibling,i.renderingStartTime=se(),t.sibling=null,n=re.current,X(re,r?n&1|2:n&1),t):(Ce(t),null);case 22:case 23:return ca(),r=t.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(t.flags|=8192),r&&t.mode&1?He&1073741824&&(Ce(t),t.subtreeFlags&6&&(t.flags|=8192)):Ce(t),null;case 24:return null;case 25:return null}throw Error(z(156,t.tag))}function hh(e,t){switch(Us(t),t.tag){case 1:return Le(t.type)&&Zo(),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Vn(),ee($e),ee(Ee),qs(),e=t.flags,e&65536&&!(e&128)?(t.flags=e&-65537|128,t):null;case 5:return Js(t),null;case 13:if(ee(re),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(z(340));bn()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return ee(re),null;case 4:return Vn(),null;case 10:return Zs(t.type._context),null;case 22:case 23:return ca(),null;case 24:return null;default:return null}}var po=!1,je=!1,mh=typeof WeakSet=="function"?WeakSet:Set,P=null;function zn(e,t){var n=e.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(r){le(e,t,r)}else n.current=null}function ss(e,t,n){try{n()}catch(r){le(e,t,r)}}var Pu=!1;function gh(e,t){if(Ul=Uo,e=gd(),Fs(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var o=r.anchorOffset,i=r.focusNode;r=r.focusOffset;try{n.nodeType,i.nodeType}catch{n=null;break e}var l=0,a=-1,u=-1,d=0,h=0,m=e,g=null;t:for(;;){for(var k;m!==n||o!==0&&m.nodeType!==3||(a=l+o),m!==i||r!==0&&m.nodeType!==3||(u=l+r),m.nodeType===3&&(l+=m.nodeValue.length),(k=m.firstChild)!==null;)g=m,m=k;for(;;){if(m===e)break t;if(g===n&&++d===o&&(a=l),g===i&&++h===r&&(u=l),(k=m.nextSibling)!==null)break;m=g,g=m.parentNode}m=k}n=a===-1||u===-1?null:{start:a,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(Wl={focusedElem:e,selectionRange:n},Uo=!1,P=t;P!==null;)if(t=P,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,P=e;else for(;P!==null;){t=P;try{var x=t.alternate;if(t.flags&1024)switch(t.tag){case 0:case 11:case 15:break;case 1:if(x!==null){var S=x.memoizedProps,_=x.memoizedState,p=t.stateNode,c=p.getSnapshotBeforeUpdate(t.elementType===t.type?S:et(t.type,S),_);p.__reactInternalSnapshotBeforeUpdate=c}break;case 3:var f=t.stateNode.containerInfo;f.nodeType===1?f.textContent="":f.nodeType===9&&f.documentElement&&f.removeChild(f.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(z(163))}}catch(y){le(t,t.return,y)}if(e=t.sibling,e!==null){e.return=t.return,P=e;break}P=t.return}return x=Pu,Pu=!1,x}function yr(e,t,n){var r=t.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var o=r=r.next;do{if((o.tag&e)===e){var i=o.destroy;o.destroy=void 0,i!==void 0&&ss(t,n,i)}o=o.next}while(o!==r)}}function ki(e,t){if(t=t.updateQueue,t=t!==null?t.lastEffect:null,t!==null){var n=t=t.next;do{if((n.tag&e)===e){var r=n.create;n.destroy=r()}n=n.next}while(n!==t)}}function as(e){var t=e.ref;if(t!==null){var n=e.stateNode;switch(e.tag){case 5:e=n;break;default:e=n}typeof t=="function"?t(e):t.current=e}}function pf(e){var t=e.alternate;t!==null&&(e.alternate=null,pf(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&(delete t[ft],delete t[$r],delete t[Zl],delete t[J0],delete t[q0])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function hf(e){return e.tag===5||e.tag===3||e.tag===4}function Au(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||hf(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function us(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.nodeType===8?n.parentNode.insertBefore(e,t):n.insertBefore(e,t):(n.nodeType===8?(t=n.parentNode,t.insertBefore(e,n)):(t=n,t.appendChild(e)),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=Yo));else if(r!==4&&(e=e.child,e!==null))for(us(e,t,n),e=e.sibling;e!==null;)us(e,t,n),e=e.sibling}function cs(e,t,n){var r=e.tag;if(r===5||r===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(cs(e,t,n),e=e.sibling;e!==null;)cs(e,t,n),e=e.sibling}var ve=null,tt=!1;function Nt(e,t,n){for(n=n.child;n!==null;)mf(e,t,n),n=n.sibling}function mf(e,t,n){if(pt&&typeof pt.onCommitFiberUnmount=="function")try{pt.onCommitFiberUnmount(pi,n)}catch{}switch(n.tag){case 5:je||zn(n,t);case 6:var r=ve,o=tt;ve=null,Nt(e,t,n),ve=r,tt=o,ve!==null&&(tt?(e=ve,n=n.stateNode,e.nodeType===8?e.parentNode.removeChild(n):e.removeChild(n)):ve.removeChild(n.stateNode));break;case 18:ve!==null&&(tt?(e=ve,n=n.stateNode,e.nodeType===8?qi(e.parentNode,n):e.nodeType===1&&qi(e,n),Rr(e)):qi(ve,n.stateNode));break;case 4:r=ve,o=tt,ve=n.stateNode.containerInfo,tt=!0,Nt(e,t,n),ve=r,tt=o;break;case 0:case 11:case 14:case 15:if(!je&&(r=n.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){o=r=r.next;do{var i=o,l=i.destroy;i=i.tag,l!==void 0&&(i&2||i&4)&&ss(n,t,l),o=o.next}while(o!==r)}Nt(e,t,n);break;case 1:if(!je&&(zn(n,t),r=n.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=n.memoizedProps,r.state=n.memoizedState,r.componentWillUnmount()}catch(a){le(n,t,a)}Nt(e,t,n);break;case 21:Nt(e,t,n);break;case 22:n.mode&1?(je=(r=je)||n.memoizedState!==null,Nt(e,t,n),je=r):Nt(e,t,n);break;default:Nt(e,t,n)}}function Mu(e){var t=e.updateQueue;if(t!==null){e.updateQueue=null;var n=e.stateNode;n===null&&(n=e.stateNode=new mh),t.forEach(function(r){var o=Eh.bind(null,e,r);n.has(r)||(n.add(r),r.then(o,o))})}}function qe(e,t){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var o=n[r];try{var i=e,l=t,a=l;e:for(;a!==null;){switch(a.tag){case 5:ve=a.stateNode,tt=!1;break e;case 3:ve=a.stateNode.containerInfo,tt=!0;break e;case 4:ve=a.stateNode.containerInfo,tt=!0;break e}a=a.return}if(ve===null)throw Error(z(160));mf(i,l,o),ve=null,tt=!1;var u=o.alternate;u!==null&&(u.return=null),o.return=null}catch(d){le(o,t,d)}}if(t.subtreeFlags&12854)for(t=t.child;t!==null;)gf(t,e),t=t.sibling}function gf(e,t){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(qe(t,e),ct(e),r&4){try{yr(3,e,e.return),ki(3,e)}catch(S){le(e,e.return,S)}try{yr(5,e,e.return)}catch(S){le(e,e.return,S)}}break;case 1:qe(t,e),ct(e),r&512&&n!==null&&zn(n,n.return);break;case 5:if(qe(t,e),ct(e),r&512&&n!==null&&zn(n,n.return),e.flags&32){var o=e.stateNode;try{Er(o,"")}catch(S){le(e,e.return,S)}}if(r&4&&(o=e.stateNode,o!=null)){var i=e.memoizedProps,l=n!==null?n.memoizedProps:i,a=e.type,u=e.updateQueue;if(e.updateQueue=null,u!==null)try{a==="input"&&i.type==="radio"&&i.name!=null&&Hc(o,i),$l(a,l);var d=$l(a,i);for(l=0;l<u.length;l+=2){var h=u[l],m=u[l+1];h==="style"?Fc(o,m):h==="dangerouslySetInnerHTML"?Dc(o,m):h==="children"?Er(o,m):Rs(o,h,m,d)}switch(a){case"input":Rl(o,i);break;case"textarea":Oc(o,i);break;case"select":var g=o._wrapperState.wasMultiple;o._wrapperState.wasMultiple=!!i.multiple;var k=i.value;k!=null?Tn(o,!!i.multiple,k,!1):g!==!!i.multiple&&(i.defaultValue!=null?Tn(o,!!i.multiple,i.defaultValue,!0):Tn(o,!!i.multiple,i.multiple?[]:"",!1))}o[$r]=i}catch(S){le(e,e.return,S)}}break;case 6:if(qe(t,e),ct(e),r&4){if(e.stateNode===null)throw Error(z(162));o=e.stateNode,i=e.memoizedProps;try{o.nodeValue=i}catch(S){le(e,e.return,S)}}break;case 3:if(qe(t,e),ct(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{Rr(t.containerInfo)}catch(S){le(e,e.return,S)}break;case 4:qe(t,e),ct(e);break;case 13:qe(t,e),ct(e),o=e.child,o.flags&8192&&(i=o.memoizedState!==null,o.stateNode.isHidden=i,!i||o.alternate!==null&&o.alternate.memoizedState!==null||(aa=se())),r&4&&Mu(e);break;case 22:if(h=n!==null&&n.memoizedState!==null,e.mode&1?(je=(d=je)||h,qe(t,e),je=d):qe(t,e),ct(e),r&8192){if(d=e.memoizedState!==null,(e.stateNode.isHidden=d)&&!h&&e.mode&1)for(P=e,h=e.child;h!==null;){for(m=P=h;P!==null;){switch(g=P,k=g.child,g.tag){case 0:case 11:case 14:case 15:yr(4,g,g.return);break;case 1:zn(g,g.return);var x=g.stateNode;if(typeof x.componentWillUnmount=="function"){r=g,n=g.return;try{t=r,x.props=t.memoizedProps,x.state=t.memoizedState,x.componentWillUnmount()}catch(S){le(r,n,S)}}break;case 5:zn(g,g.return);break;case 22:if(g.memoizedState!==null){Lu(m);continue}}k!==null?(k.return=g,P=k):Lu(m)}h=h.sibling}e:for(h=null,m=e;;){if(m.tag===5){if(h===null){h=m;try{o=m.stateNode,d?(i=o.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none"):(a=m.stateNode,u=m.memoizedProps.style,l=u!=null&&u.hasOwnProperty("display")?u.display:null,a.style.display=Vc("display",l))}catch(S){le(e,e.return,S)}}}else if(m.tag===6){if(h===null)try{m.stateNode.nodeValue=d?"":m.memoizedProps}catch(S){le(e,e.return,S)}}else if((m.tag!==22&&m.tag!==23||m.memoizedState===null||m===e)&&m.child!==null){m.child.return=m,m=m.child;continue}if(m===e)break e;for(;m.sibling===null;){if(m.return===null||m.return===e)break e;h===m&&(h=null),m=m.return}h===m&&(h=null),m.sibling.return=m.return,m=m.sibling}}break;case 19:qe(t,e),ct(e),r&4&&Mu(e);break;case 21:break;default:qe(t,e),ct(e)}}function ct(e){var t=e.flags;if(t&2){try{e:{for(var n=e.return;n!==null;){if(hf(n)){var r=n;break e}n=n.return}throw Error(z(160))}switch(r.tag){case 5:var o=r.stateNode;r.flags&32&&(Er(o,""),r.flags&=-33);var i=Au(e);cs(e,i,o);break;case 3:case 4:var l=r.stateNode.containerInfo,a=Au(e);us(e,a,l);break;default:throw Error(z(161))}}catch(u){le(e,e.return,u)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function vh(e,t,n){P=e,vf(e)}function vf(e,t,n){for(var r=(e.mode&1)!==0;P!==null;){var o=P,i=o.child;if(o.tag===22&&r){var l=o.memoizedState!==null||po;if(!l){var a=o.alternate,u=a!==null&&a.memoizedState!==null||je;a=po;var d=je;if(po=l,(je=u)&&!d)for(P=o;P!==null;)l=P,u=l.child,l.tag===22&&l.memoizedState!==null?Iu(o):u!==null?(u.return=l,P=u):Iu(o);for(;i!==null;)P=i,vf(i),i=i.sibling;P=o,po=a,je=d}$u(e)}else o.subtreeFlags&8772&&i!==null?(i.return=o,P=i):$u(e)}}function $u(e){for(;P!==null;){var t=P;if(t.flags&8772){var n=t.alternate;try{if(t.flags&8772)switch(t.tag){case 0:case 11:case 15:je||ki(5,t);break;case 1:var r=t.stateNode;if(t.flags&4&&!je)if(n===null)r.componentDidMount();else{var o=t.elementType===t.type?n.memoizedProps:et(t.type,n.memoizedProps);r.componentDidUpdate(o,n.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var i=t.updateQueue;i!==null&&xu(t,i,r);break;case 3:var l=t.updateQueue;if(l!==null){if(n=null,t.child!==null)switch(t.child.tag){case 5:n=t.child.stateNode;break;case 1:n=t.child.stateNode}xu(t,l,n)}break;case 5:var a=t.stateNode;if(n===null&&t.flags&4){n=a;var u=t.memoizedProps;switch(t.type){case"button":case"input":case"select":case"textarea":u.autoFocus&&n.focus();break;case"img":u.src&&(n.src=u.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(t.memoizedState===null){var d=t.alternate;if(d!==null){var h=d.memoizedState;if(h!==null){var m=h.dehydrated;m!==null&&Rr(m)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(z(163))}je||t.flags&512&&as(t)}catch(g){le(t,t.return,g)}}if(t===e){P=null;break}if(n=t.sibling,n!==null){n.return=t.return,P=n;break}P=t.return}}function Lu(e){for(;P!==null;){var t=P;if(t===e){P=null;break}var n=t.sibling;if(n!==null){n.return=t.return,P=n;break}P=t.return}}function Iu(e){for(;P!==null;){var t=P;try{switch(t.tag){case 0:case 11:case 15:var n=t.return;try{ki(4,t)}catch(u){le(t,n,u)}break;case 1:var r=t.stateNode;if(typeof r.componentDidMount=="function"){var o=t.return;try{r.componentDidMount()}catch(u){le(t,o,u)}}var i=t.return;try{as(t)}catch(u){le(t,i,u)}break;case 5:var l=t.return;try{as(t)}catch(u){le(t,l,u)}}}catch(u){le(t,t.return,u)}if(t===e){P=null;break}var a=t.sibling;if(a!==null){a.return=t.return,P=a;break}P=t.return}}var xh=Math.ceil,oi=Et.ReactCurrentDispatcher,la=Et.ReactCurrentOwner,Ze=Et.ReactCurrentBatchConfig,V=0,ge=null,de=null,xe=0,He=0,Rn=Zt(0),he=0,Dr=null,cn=0,Si=0,sa=0,wr=null,Ae=null,aa=0,Bn=1/0,mt=null,ii=!1,ds=null,Vt=null,ho=!1,$t=null,li=0,kr=0,fs=null,Po=-1,Ao=0;function Re(){return V&6?se():Po!==-1?Po:Po=se()}function Ft(e){return e.mode&1?V&2&&xe!==0?xe&-xe:th.transition!==null?(Ao===0&&(Ao=ed()),Ao):(e=G,e!==0||(e=window.event,e=e===void 0?16:sd(e.type)),e):1}function it(e,t,n,r){if(50<kr)throw kr=0,fs=null,Error(z(185));Ur(e,n,r),(!(V&2)||e!==ge)&&(e===ge&&(!(V&2)&&(Si|=n),he===4&&At(e,xe)),Ie(e,r),n===1&&V===0&&!(t.mode&1)&&(Bn=se()+500,xi&&Qt()))}function Ie(e,t){var n=e.callbackNode;t0(e,t);var r=Bo(e,e===ge?xe:0);if(r===0)n!==null&&Wa(n),e.callbackNode=null,e.callbackPriority=0;else if(t=r&-r,e.callbackPriority!==t){if(n!=null&&Wa(n),t===1)e.tag===0?eh(Hu.bind(null,e)):_d(Hu.bind(null,e)),K0(function(){!(V&6)&&Qt()}),n=null;else{switch(td(r)){case 1:n=$s;break;case 4:n=Jc;break;case 16:n=Fo;break;case 536870912:n=qc;break;default:n=Fo}n=Ef(n,xf.bind(null,e))}e.callbackPriority=t,e.callbackNode=n}}function xf(e,t){if(Po=-1,Ao=0,V&6)throw Error(z(327));var n=e.callbackNode;if(Ln()&&e.callbackNode!==n)return null;var r=Bo(e,e===ge?xe:0);if(r===0)return null;if(r&30||r&e.expiredLanes||t)t=si(e,r);else{t=r;var o=V;V|=2;var i=wf();(ge!==e||xe!==t)&&(mt=null,Bn=se()+500,rn(e,t));do try{kh();break}catch(a){yf(e,a)}while(!0);Ys(),oi.current=i,V=o,de!==null?t=0:(ge=null,xe=0,t=he)}if(t!==0){if(t===2&&(o=bl(e),o!==0&&(r=o,t=ps(e,o))),t===1)throw n=Dr,rn(e,0),At(e,r),Ie(e,se()),n;if(t===6)At(e,r);else{if(o=e.current.alternate,!(r&30)&&!yh(o)&&(t=si(e,r),t===2&&(i=bl(e),i!==0&&(r=i,t=ps(e,i))),t===1))throw n=Dr,rn(e,0),At(e,r),Ie(e,se()),n;switch(e.finishedWork=o,e.finishedLanes=r,t){case 0:case 1:throw Error(z(345));case 2:Jt(e,Ae,mt);break;case 3:if(At(e,r),(r&130023424)===r&&(t=aa+500-se(),10<t)){if(Bo(e,0)!==0)break;if(o=e.suspendedLanes,(o&r)!==r){Re(),e.pingedLanes|=e.suspendedLanes&o;break}e.timeoutHandle=Yl(Jt.bind(null,e,Ae,mt),t);break}Jt(e,Ae,mt);break;case 4:if(At(e,r),(r&4194240)===r)break;for(t=e.eventTimes,o=-1;0<r;){var l=31-ot(r);i=1<<l,l=t[l],l>o&&(o=l),r&=~i}if(r=o,r=se()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*xh(r/1960))-r,10<r){e.timeoutHandle=Yl(Jt.bind(null,e,Ae,mt),r);break}Jt(e,Ae,mt);break;case 5:Jt(e,Ae,mt);break;default:throw Error(z(329))}}}return Ie(e,se()),e.callbackNode===n?xf.bind(null,e):null}function ps(e,t){var n=wr;return e.current.memoizedState.isDehydrated&&(rn(e,t).flags|=256),e=si(e,t),e!==2&&(t=Ae,Ae=n,t!==null&&hs(t)),e}function hs(e){Ae===null?Ae=e:Ae.push.apply(Ae,e)}function yh(e){for(var t=e;;){if(t.flags&16384){var n=t.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var r=0;r<n.length;r++){var o=n[r],i=o.getSnapshot;o=o.value;try{if(!st(i(),o))return!1}catch{return!1}}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function At(e,t){for(t&=~sa,t&=~Si,e.suspendedLanes|=t,e.pingedLanes&=~t,e=e.expirationTimes;0<t;){var n=31-ot(t),r=1<<n;e[n]=-1,t&=~r}}function Hu(e){if(V&6)throw Error(z(327));Ln();var t=Bo(e,0);if(!(t&1))return Ie(e,se()),null;var n=si(e,t);if(e.tag!==0&&n===2){var r=bl(e);r!==0&&(t=r,n=ps(e,r))}if(n===1)throw n=Dr,rn(e,0),At(e,t),Ie(e,se()),n;if(n===6)throw Error(z(345));return e.finishedWork=e.current.alternate,e.finishedLanes=t,Jt(e,Ae,mt),Ie(e,se()),null}function ua(e,t){var n=V;V|=1;try{return e(t)}finally{V=n,V===0&&(Bn=se()+500,xi&&Qt())}}function dn(e){$t!==null&&$t.tag===0&&!(V&6)&&Ln();var t=V;V|=1;var n=Ze.transition,r=G;try{if(Ze.transition=null,G=1,e)return e()}finally{G=r,Ze.transition=n,V=t,!(V&6)&&Qt()}}function ca(){He=Rn.current,ee(Rn)}function rn(e,t){e.finishedWork=null,e.finishedLanes=0;var n=e.timeoutHandle;if(n!==-1&&(e.timeoutHandle=-1,Q0(n)),de!==null)for(n=de.return;n!==null;){var r=n;switch(Us(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&Zo();break;case 3:Vn(),ee($e),ee(Ee),qs();break;case 5:Js(r);break;case 4:Vn();break;case 13:ee(re);break;case 19:ee(re);break;case 10:Zs(r.type._context);break;case 22:case 23:ca()}n=n.return}if(ge=e,de=e=Bt(e.current,null),xe=He=t,he=0,Dr=null,sa=Si=cn=0,Ae=wr=null,tn!==null){for(t=0;t<tn.length;t++)if(n=tn[t],r=n.interleaved,r!==null){n.interleaved=null;var o=r.next,i=n.pending;if(i!==null){var l=i.next;i.next=o,r.next=l}n.pending=r}tn=null}return e}function yf(e,t){do{var n=de;try{if(Ys(),zo.current=ri,ni){for(var r=oe.memoizedState;r!==null;){var o=r.queue;o!==null&&(o.pending=null),r=r.next}ni=!1}if(un=0,me=fe=oe=null,xr=!1,Hr=0,la.current=null,n===null||n.return===null){he=1,Dr=t,de=null;break}e:{var i=e,l=n.return,a=n,u=t;if(t=xe,a.flags|=32768,u!==null&&typeof u=="object"&&typeof u.then=="function"){var d=u,h=a,m=h.tag;if(!(h.mode&1)&&(m===0||m===11||m===15)){var g=h.alternate;g?(h.updateQueue=g.updateQueue,h.memoizedState=g.memoizedState,h.lanes=g.lanes):(h.updateQueue=null,h.memoizedState=null)}var k=ju(l);if(k!==null){k.flags&=-257,Eu(k,l,a,i,t),k.mode&1&&Cu(i,d,t),t=k,u=d;var x=t.updateQueue;if(x===null){var S=new Set;S.add(u),t.updateQueue=S}else x.add(u);break e}else{if(!(t&1)){Cu(i,d,t),da();break e}u=Error(z(426))}}else if(ne&&a.mode&1){var _=ju(l);if(_!==null){!(_.flags&65536)&&(_.flags|=256),Eu(_,l,a,i,t),Ws(Fn(u,a));break e}}i=u=Fn(u,a),he!==4&&(he=2),wr===null?wr=[i]:wr.push(i),i=l;do{switch(i.tag){case 3:i.flags|=65536,t&=-t,i.lanes|=t;var p=tf(i,u,t);vu(i,p);break e;case 1:a=u;var c=i.type,f=i.stateNode;if(!(i.flags&128)&&(typeof c.getDerivedStateFromError=="function"||f!==null&&typeof f.componentDidCatch=="function"&&(Vt===null||!Vt.has(f)))){i.flags|=65536,t&=-t,i.lanes|=t;var y=nf(i,a,t);vu(i,y);break e}}i=i.return}while(i!==null)}Sf(n)}catch(j){t=j,de===n&&n!==null&&(de=n=n.return);continue}break}while(!0)}function wf(){var e=oi.current;return oi.current=ri,e===null?ri:e}function da(){(he===0||he===3||he===2)&&(he=4),ge===null||!(cn&268435455)&&!(Si&268435455)||At(ge,xe)}function si(e,t){var n=V;V|=2;var r=wf();(ge!==e||xe!==t)&&(mt=null,rn(e,t));do try{wh();break}catch(o){yf(e,o)}while(!0);if(Ys(),V=n,oi.current=r,de!==null)throw Error(z(261));return ge=null,xe=0,he}function wh(){for(;de!==null;)kf(de)}function kh(){for(;de!==null&&!Gp();)kf(de)}function kf(e){var t=jf(e.alternate,e,He);e.memoizedProps=e.pendingProps,t===null?Sf(e):de=t,la.current=null}function Sf(e){var t=e;do{var n=t.alternate;if(e=t.return,t.flags&32768){if(n=hh(n,t),n!==null){n.flags&=32767,de=n;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{he=6,de=null;return}}else if(n=ph(n,t,He),n!==null){de=n;return}if(t=t.sibling,t!==null){de=t;return}de=t=e}while(t!==null);he===0&&(he=5)}function Jt(e,t,n){var r=G,o=Ze.transition;try{Ze.transition=null,G=1,Sh(e,t,n,r)}finally{Ze.transition=o,G=r}return null}function Sh(e,t,n,r){do Ln();while($t!==null);if(V&6)throw Error(z(327));n=e.finishedWork;var o=e.finishedLanes;if(n===null)return null;if(e.finishedWork=null,e.finishedLanes=0,n===e.current)throw Error(z(177));e.callbackNode=null,e.callbackPriority=0;var i=n.lanes|n.childLanes;if(n0(e,i),e===ge&&(de=ge=null,xe=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||ho||(ho=!0,Ef(Fo,function(){return Ln(),null})),i=(n.flags&15990)!==0,n.subtreeFlags&15990||i){i=Ze.transition,Ze.transition=null;var l=G;G=1;var a=V;V|=4,la.current=null,gh(e,n),gf(n,e),F0(Wl),Uo=!!Ul,Wl=Ul=null,e.current=n,vh(n),Yp(),V=a,G=l,Ze.transition=i}else e.current=n;if(ho&&(ho=!1,$t=e,li=o),i=e.pendingLanes,i===0&&(Vt=null),Kp(n.stateNode),Ie(e,se()),t!==null)for(r=e.onRecoverableError,n=0;n<t.length;n++)o=t[n],r(o.value,{componentStack:o.stack,digest:o.digest});if(ii)throw ii=!1,e=ds,ds=null,e;return li&1&&e.tag!==0&&Ln(),i=e.pendingLanes,i&1?e===fs?kr++:(kr=0,fs=e):kr=0,Qt(),null}function Ln(){if($t!==null){var e=td(li),t=Ze.transition,n=G;try{if(Ze.transition=null,G=16>e?16:e,$t===null)var r=!1;else{if(e=$t,$t=null,li=0,V&6)throw Error(z(331));var o=V;for(V|=4,P=e.current;P!==null;){var i=P,l=i.child;if(P.flags&16){var a=i.deletions;if(a!==null){for(var u=0;u<a.length;u++){var d=a[u];for(P=d;P!==null;){var h=P;switch(h.tag){case 0:case 11:case 15:yr(8,h,i)}var m=h.child;if(m!==null)m.return=h,P=m;else for(;P!==null;){h=P;var g=h.sibling,k=h.return;if(pf(h),h===d){P=null;break}if(g!==null){g.return=k,P=g;break}P=k}}}var x=i.alternate;if(x!==null){var S=x.child;if(S!==null){x.child=null;do{var _=S.sibling;S.sibling=null,S=_}while(S!==null)}}P=i}}if(i.subtreeFlags&2064&&l!==null)l.return=i,P=l;else e:for(;P!==null;){if(i=P,i.flags&2048)switch(i.tag){case 0:case 11:case 15:yr(9,i,i.return)}var p=i.sibling;if(p!==null){p.return=i.return,P=p;break e}P=i.return}}var c=e.current;for(P=c;P!==null;){l=P;var f=l.child;if(l.subtreeFlags&2064&&f!==null)f.return=l,P=f;else e:for(l=c;P!==null;){if(a=P,a.flags&2048)try{switch(a.tag){case 0:case 11:case 15:ki(9,a)}}catch(j){le(a,a.return,j)}if(a===l){P=null;break e}var y=a.sibling;if(y!==null){y.return=a.return,P=y;break e}P=a.return}}if(V=o,Qt(),pt&&typeof pt.onPostCommitFiberRoot=="function")try{pt.onPostCommitFiberRoot(pi,e)}catch{}r=!0}return r}finally{G=n,Ze.transition=t}}return!1}function Ou(e,t,n){t=Fn(n,t),t=tf(e,t,1),e=Dt(e,t,1),t=Re(),e!==null&&(Ur(e,1,t),Ie(e,t))}function le(e,t,n){if(e.tag===3)Ou(e,e,n);else for(;t!==null;){if(t.tag===3){Ou(t,e,n);break}else if(t.tag===1){var r=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(Vt===null||!Vt.has(r))){e=Fn(n,e),e=nf(t,e,1),t=Dt(t,e,1),e=Re(),t!==null&&(Ur(t,1,e),Ie(t,e));break}}t=t.return}}function Ch(e,t,n){var r=e.pingCache;r!==null&&r.delete(t),t=Re(),e.pingedLanes|=e.suspendedLanes&n,ge===e&&(xe&n)===n&&(he===4||he===3&&(xe&130023424)===xe&&500>se()-aa?rn(e,0):sa|=n),Ie(e,t)}function Cf(e,t){t===0&&(e.mode&1?(t=ro,ro<<=1,!(ro&130023424)&&(ro=4194304)):t=1);var n=Re();e=Ct(e,t),e!==null&&(Ur(e,t,n),Ie(e,n))}function jh(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),Cf(e,n)}function Eh(e,t){var n=0;switch(e.tag){case 13:var r=e.stateNode,o=e.memoizedState;o!==null&&(n=o.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(z(314))}r!==null&&r.delete(t),Cf(e,n)}var jf;jf=function(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps||$e.current)Me=!0;else{if(!(e.lanes&n)&&!(t.flags&128))return Me=!1,fh(e,t,n);Me=!!(e.flags&131072)}else Me=!1,ne&&t.flags&1048576&&Nd(t,Xo,t.index);switch(t.lanes=0,t.tag){case 2:var r=t.type;To(e,t),e=t.pendingProps;var o=On(t,Ee.current);$n(t,n),o=ta(null,t,r,e,o,n);var i=na();return t.flags|=1,typeof o=="object"&&o!==null&&typeof o.render=="function"&&o.$$typeof===void 0?(t.tag=1,t.memoizedState=null,t.updateQueue=null,Le(r)?(i=!0,Qo(t)):i=!1,t.memoizedState=o.state!==null&&o.state!==void 0?o.state:null,Ks(t),o.updater=wi,t.stateNode=o,o._reactInternals=t,es(t,r,e,n),t=rs(null,t,r,!0,i,n)):(t.tag=0,ne&&i&&Bs(t),ze(null,t,o,n),t=t.child),t;case 16:r=t.elementType;e:{switch(To(e,t),e=t.pendingProps,o=r._init,r=o(r._payload),t.type=r,o=t.tag=Nh(r),e=et(r,e),o){case 0:t=ns(null,t,r,e,n);break e;case 1:t=zu(null,t,r,e,n);break e;case 11:t=_u(null,t,r,e,n);break e;case 14:t=Nu(null,t,r,et(r.type,e),n);break e}throw Error(z(306,r,""))}return t;case 0:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:et(r,o),ns(e,t,r,o,n);case 1:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:et(r,o),zu(e,t,r,o,n);case 3:e:{if(sf(t),e===null)throw Error(z(387));r=t.pendingProps,i=t.memoizedState,o=i.element,Md(e,t),ei(t,r,null,n);var l=t.memoizedState;if(r=l.element,i.isDehydrated)if(i={element:r,isDehydrated:!1,cache:l.cache,pendingSuspenseBoundaries:l.pendingSuspenseBoundaries,transitions:l.transitions},t.updateQueue.baseState=i,t.memoizedState=i,t.flags&256){o=Fn(Error(z(423)),t),t=Ru(e,t,r,n,o);break e}else if(r!==o){o=Fn(Error(z(424)),t),t=Ru(e,t,r,n,o);break e}else for(be=bt(t.stateNode.containerInfo.firstChild),De=t,ne=!0,rt=null,n=Pd(t,null,r,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(bn(),r===o){t=jt(e,t,n);break e}ze(e,t,r,n)}t=t.child}return t;case 5:return $d(t),e===null&&Xl(t),r=t.type,o=t.pendingProps,i=e!==null?e.memoizedProps:null,l=o.children,Gl(r,o)?l=null:i!==null&&Gl(r,i)&&(t.flags|=32),lf(e,t),ze(e,t,l,n),t.child;case 6:return e===null&&Xl(t),null;case 13:return af(e,t,n);case 4:return Xs(t,t.stateNode.containerInfo),r=t.pendingProps,e===null?t.child=Dn(t,null,r,n):ze(e,t,r,n),t.child;case 11:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:et(r,o),_u(e,t,r,o,n);case 7:return ze(e,t,t.pendingProps,n),t.child;case 8:return ze(e,t,t.pendingProps.children,n),t.child;case 12:return ze(e,t,t.pendingProps.children,n),t.child;case 10:e:{if(r=t.type._context,o=t.pendingProps,i=t.memoizedProps,l=o.value,X(Jo,r._currentValue),r._currentValue=l,i!==null)if(st(i.value,l)){if(i.children===o.children&&!$e.current){t=jt(e,t,n);break e}}else for(i=t.child,i!==null&&(i.return=t);i!==null;){var a=i.dependencies;if(a!==null){l=i.child;for(var u=a.firstContext;u!==null;){if(u.context===r){if(i.tag===1){u=wt(-1,n&-n),u.tag=2;var d=i.updateQueue;if(d!==null){d=d.shared;var h=d.pending;h===null?u.next=u:(u.next=h.next,h.next=u),d.pending=u}}i.lanes|=n,u=i.alternate,u!==null&&(u.lanes|=n),Jl(i.return,n,t),a.lanes|=n;break}u=u.next}}else if(i.tag===10)l=i.type===t.type?null:i.child;else if(i.tag===18){if(l=i.return,l===null)throw Error(z(341));l.lanes|=n,a=l.alternate,a!==null&&(a.lanes|=n),Jl(l,n,t),l=i.sibling}else l=i.child;if(l!==null)l.return=i;else for(l=i;l!==null;){if(l===t){l=null;break}if(i=l.sibling,i!==null){i.return=l.return,l=i;break}l=l.return}i=l}ze(e,t,o.children,n),t=t.child}return t;case 9:return o=t.type,r=t.pendingProps.children,$n(t,n),o=Qe(o),r=r(o),t.flags|=1,ze(e,t,r,n),t.child;case 14:return r=t.type,o=et(r,t.pendingProps),o=et(r.type,o),Nu(e,t,r,o,n);case 15:return rf(e,t,t.type,t.pendingProps,n);case 17:return r=t.type,o=t.pendingProps,o=t.elementType===r?o:et(r,o),To(e,t),t.tag=1,Le(r)?(e=!0,Qo(t)):e=!1,$n(t,n),ef(t,r,o),es(t,r,o,n),rs(null,t,r,!0,e,n);case 19:return uf(e,t,n);case 22:return of(e,t,n)}throw Error(z(156,t.tag))};function Ef(e,t){return Xc(e,t)}function _h(e,t,n,r){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Ye(e,t,n,r){return new _h(e,t,n,r)}function fa(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Nh(e){if(typeof e=="function")return fa(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Ps)return 11;if(e===As)return 14}return 2}function Bt(e,t){var n=e.alternate;return n===null?(n=Ye(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&14680064,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n}function Mo(e,t,n,r,o,i){var l=2;if(r=e,typeof e=="function")fa(e)&&(l=1);else if(typeof e=="string")l=5;else e:switch(e){case yn:return on(n.children,o,i,t);case Ts:l=8,o|=8;break;case jl:return e=Ye(12,n,t,o|2),e.elementType=jl,e.lanes=i,e;case El:return e=Ye(13,n,t,o),e.elementType=El,e.lanes=i,e;case _l:return e=Ye(19,n,t,o),e.elementType=_l,e.lanes=i,e;case $c:return Ci(n,o,i,t);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Ac:l=10;break e;case Mc:l=9;break e;case Ps:l=11;break e;case As:l=14;break e;case Rt:l=16,r=null;break e}throw Error(z(130,e==null?e:typeof e,""))}return t=Ye(l,n,t,o),t.elementType=e,t.type=r,t.lanes=i,t}function on(e,t,n,r){return e=Ye(7,e,r,t),e.lanes=n,e}function Ci(e,t,n,r){return e=Ye(22,e,r,t),e.elementType=$c,e.lanes=n,e.stateNode={isHidden:!1},e}function sl(e,t,n){return e=Ye(6,e,null,t),e.lanes=n,e}function al(e,t,n){return t=Ye(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}function zh(e,t,n,r,o){this.tag=t,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Fi(0),this.expirationTimes=Fi(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Fi(0),this.identifierPrefix=r,this.onRecoverableError=o,this.mutableSourceEagerHydrationData=null}function pa(e,t,n,r,o,i,l,a,u){return e=new zh(e,t,n,a,u),t===1?(t=1,i===!0&&(t|=8)):t=0,i=Ye(3,null,null,t),e.current=i,i.stateNode=e,i.memoizedState={element:r,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Ks(i),e}function Rh(e,t,n){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:xn,key:r==null?null:""+r,children:e,containerInfo:t,implementation:n}}function _f(e){if(!e)return Gt;e=e._reactInternals;e:{if(hn(e)!==e||e.tag!==1)throw Error(z(170));var t=e;do{switch(t.tag){case 3:t=t.stateNode.context;break e;case 1:if(Le(t.type)){t=t.stateNode.__reactInternalMemoizedMergedChildContext;break e}}t=t.return}while(t!==null);throw Error(z(171))}if(e.tag===1){var n=e.type;if(Le(n))return Ed(e,n,t)}return t}function Nf(e,t,n,r,o,i,l,a,u){return e=pa(n,r,!0,e,o,i,l,a,u),e.context=_f(null),n=e.current,r=Re(),o=Ft(n),i=wt(r,o),i.callback=t??null,Dt(n,i,o),e.current.lanes=o,Ur(e,o,r),Ie(e,r),e}function ji(e,t,n,r){var o=t.current,i=Re(),l=Ft(o);return n=_f(n),t.context===null?t.context=n:t.pendingContext=n,t=wt(i,l),t.payload={element:e},r=r===void 0?null:r,r!==null&&(t.callback=r),e=Dt(o,t,l),e!==null&&(it(e,o,l,i),No(e,o,l)),l}function ai(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function bu(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function ha(e,t){bu(e,t),(e=e.alternate)&&bu(e,t)}function Th(){return null}var zf=typeof reportError=="function"?reportError:function(e){console.error(e)};function ma(e){this._internalRoot=e}Ei.prototype.render=ma.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(z(409));ji(e,t,null,null)};Ei.prototype.unmount=ma.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;dn(function(){ji(null,e,null,null)}),t[St]=null}};function Ei(e){this._internalRoot=e}Ei.prototype.unstable_scheduleHydration=function(e){if(e){var t=od();e={blockedOn:null,target:e,priority:t};for(var n=0;n<Pt.length&&t!==0&&t<Pt[n].priority;n++);Pt.splice(n,0,e),n===0&&ld(e)}};function ga(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function _i(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function Du(){}function Ph(e,t,n,r,o){if(o){if(typeof r=="function"){var i=r;r=function(){var d=ai(l);i.call(d)}}var l=Nf(t,r,e,0,null,!1,!1,"",Du);return e._reactRootContainer=l,e[St]=l.current,Ar(e.nodeType===8?e.parentNode:e),dn(),l}for(;o=e.lastChild;)e.removeChild(o);if(typeof r=="function"){var a=r;r=function(){var d=ai(u);a.call(d)}}var u=pa(e,0,!1,null,null,!1,!1,"",Du);return e._reactRootContainer=u,e[St]=u.current,Ar(e.nodeType===8?e.parentNode:e),dn(function(){ji(t,u,n,r)}),u}function Ni(e,t,n,r,o){var i=n._reactRootContainer;if(i){var l=i;if(typeof o=="function"){var a=o;o=function(){var u=ai(l);a.call(u)}}ji(t,l,e,o)}else l=Ph(n,t,e,o,r);return ai(l)}nd=function(e){switch(e.tag){case 3:var t=e.stateNode;if(t.current.memoizedState.isDehydrated){var n=ur(t.pendingLanes);n!==0&&(Ls(t,n|1),Ie(t,se()),!(V&6)&&(Bn=se()+500,Qt()))}break;case 13:dn(function(){var r=Ct(e,1);if(r!==null){var o=Re();it(r,e,1,o)}}),ha(e,1)}};Is=function(e){if(e.tag===13){var t=Ct(e,134217728);if(t!==null){var n=Re();it(t,e,134217728,n)}ha(e,134217728)}};rd=function(e){if(e.tag===13){var t=Ft(e),n=Ct(e,t);if(n!==null){var r=Re();it(n,e,t,r)}ha(e,t)}};od=function(){return G};id=function(e,t){var n=G;try{return G=e,t()}finally{G=n}};Il=function(e,t,n){switch(t){case"input":if(Rl(e,n),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+t)+'][type="radio"]'),t=0;t<n.length;t++){var r=n[t];if(r!==e&&r.form===e.form){var o=vi(r);if(!o)throw Error(z(90));Ic(r),Rl(r,o)}}}break;case"textarea":Oc(e,n);break;case"select":t=n.value,t!=null&&Tn(e,!!n.multiple,t,!1)}};Wc=ua;Gc=dn;var Ah={usingClientEntryPoint:!1,Events:[Gr,Cn,vi,Bc,Uc,ua]},ir={findFiberByHostInstance:en,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Mh={bundleType:ir.bundleType,version:ir.version,rendererPackageName:ir.rendererPackageName,rendererConfig:ir.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Et.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=Qc(e),e===null?null:e.stateNode},findFiberByHostInstance:ir.findFiberByHostInstance||Th,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var mo=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!mo.isDisabled&&mo.supportsFiber)try{pi=mo.inject(Mh),pt=mo}catch{}}Fe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Ah;Fe.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!ga(t))throw Error(z(200));return Rh(e,t,null,n)};Fe.createRoot=function(e,t){if(!ga(e))throw Error(z(299));var n=!1,r="",o=zf;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(r=t.identifierPrefix),t.onRecoverableError!==void 0&&(o=t.onRecoverableError)),t=pa(e,1,!1,null,null,n,!1,r,o),e[St]=t.current,Ar(e.nodeType===8?e.parentNode:e),new ma(t)};Fe.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(z(188)):(e=Object.keys(e).join(","),Error(z(268,e)));return e=Qc(t),e=e===null?null:e.stateNode,e};Fe.flushSync=function(e){return dn(e)};Fe.hydrate=function(e,t,n){if(!_i(t))throw Error(z(200));return Ni(null,e,t,!0,n)};Fe.hydrateRoot=function(e,t,n){if(!ga(e))throw Error(z(405));var r=n!=null&&n.hydratedSources||null,o=!1,i="",l=zf;if(n!=null&&(n.unstable_strictMode===!0&&(o=!0),n.identifierPrefix!==void 0&&(i=n.identifierPrefix),n.onRecoverableError!==void 0&&(l=n.onRecoverableError)),t=Nf(t,null,e,1,n??null,o,!1,i,l),e[St]=t.current,Ar(e),r)for(e=0;e<r.length;e++)n=r[e],o=n._getVersion,o=o(n._source),t.mutableSourceEagerHydrationData==null?t.mutableSourceEagerHydrationData=[n,o]:t.mutableSourceEagerHydrationData.push(n,o);return new Ei(t)};Fe.render=function(e,t,n){if(!_i(t))throw Error(z(200));return Ni(null,e,t,!1,n)};Fe.unmountComponentAtNode=function(e){if(!_i(e))throw Error(z(40));return e._reactRootContainer?(dn(function(){Ni(null,null,e,!1,function(){e._reactRootContainer=null,e[St]=null})}),!0):!1};Fe.unstable_batchedUpdates=ua;Fe.unstable_renderSubtreeIntoContainer=function(e,t,n,r){if(!_i(n))throw Error(z(200));if(e==null||e._reactInternals===void 0)throw Error(z(38));return Ni(e,t,n,!1,r)};Fe.version="18.3.1-next-f1338f8080-20240426";function Rf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Rf)}catch(e){console.error(e)}}Rf(),zc.exports=Fe;var $h=zc.exports,Vu=$h;Sl.createRoot=Vu.createRoot,Sl.hydrateRoot=Vu.hydrateRoot;var q="-ms-",Sr="-moz-",B="-webkit-",Tf="comm",zi="rule",va="decl",Lh="@import",Ih="@namespace",Pf="@keyframes",Hh="@layer",Af=Math.abs,xa=String.fromCharCode,ms=Object.assign;function Oh(e,t){return pe(e,0)^45?(((t<<2^pe(e,0))<<2^pe(e,1))<<2^pe(e,2))<<2^pe(e,3):0}function Mf(e){return e.trim()}function gt(e,t){return(e=t.exec(e))?e[0]:e}function L(e,t,n){return e.replace(t,n)}function $o(e,t,n){return e.indexOf(t,n)}function pe(e,t){return e.charCodeAt(t)|0}function fn(e,t,n){return e.slice(t,n)}function nt(e){return e.length}function $f(e){return e.length}function dr(e,t){return t.push(e),e}function bh(e,t){return e.map(t).join("")}function Fu(e,t){return e.filter(function(n){return!gt(n,t)})}var Ri=1,Un=1,Lf=0,Xe=0,ce=0,Kn="";function Ti(e,t,n,r,o,i,l,a){return{value:e,root:t,parent:n,type:r,props:o,children:i,line:Ri,column:Un,length:l,return:"",siblings:a}}function zt(e,t){return ms(Ti("",null,null,"",null,null,0,e.siblings),e,{length:-e.length},t)}function gn(e){for(;e.root;)e=zt(e.root,{children:[e]});dr(e,e.siblings)}function Dh(){return ce}function Vh(){return ce=Xe>0?pe(Kn,--Xe):0,Un--,ce===10&&(Un=1,Ri--),ce}function lt(){return ce=Xe<Lf?pe(Kn,Xe++):0,Un++,ce===10&&(Un=1,Ri++),ce}function Lt(){return pe(Kn,Xe)}function Lo(){return Xe}function Pi(e,t){return fn(Kn,e,t)}function Vr(e){switch(e){case 0:case 9:case 10:case 13:case 32:return 5;case 33:case 43:case 44:case 47:case 62:case 64:case 126:case 59:case 123:case 125:return 4;case 58:return 3;case 34:case 39:case 40:case 91:return 2;case 41:case 93:return 1}return 0}function Fh(e){return Ri=Un=1,Lf=nt(Kn=e),Xe=0,[]}function Bh(e){return Kn="",e}function ul(e){return Mf(Pi(Xe-1,gs(e===91?e+2:e===40?e+1:e)))}function Uh(e){for(;(ce=Lt())&&ce<33;)lt();return Vr(e)>2||Vr(ce)>3?"":" "}function Wh(e,t){for(;--t&&lt()&&!(ce<48||ce>102||ce>57&&ce<65||ce>70&&ce<97););return Pi(e,Lo()+(t<6&&Lt()==32&&lt()==32))}function gs(e){for(;lt();)switch(ce){case e:return Xe;case 34:case 39:e!==34&&e!==39&&gs(ce);break;case 40:e===41&&gs(e);break;case 92:lt();break}return Xe}function Gh(e,t){for(;lt()&&e+ce!==57;)if(e+ce===84&&Lt()===47)break;return"/*"+Pi(t,Xe-1)+"*"+xa(e===47?e:lt())}function Yh(e){for(;!Vr(Lt());)lt();return Pi(e,Xe)}function Zh(e){return Bh(Io("",null,null,null,[""],e=Fh(e),0,[0],e))}function Io(e,t,n,r,o,i,l,a,u){for(var d=0,h=0,m=l,g=0,k=0,x=0,S=1,_=1,p=1,c=0,f="",y=o,j=i,N=r,w=f;_;)switch(x=c,c=lt()){case 40:if(x!=108&&pe(w,m-1)==58){$o(w+=L(ul(c),"&","&\f"),"&\f",Af(d?a[d-1]:0))!=-1&&(p=-1);break}case 34:case 39:case 91:w+=ul(c);break;case 9:case 10:case 13:case 32:w+=Uh(x);break;case 92:w+=Wh(Lo()-1,7);continue;case 47:switch(Lt()){case 42:case 47:dr(Qh(Gh(lt(),Lo()),t,n,u),u),(Vr(x||1)==5||Vr(Lt()||1)==5)&&nt(w)&&fn(w,-1,void 0)!==" "&&(w+=" ");break;default:w+="/"}break;case 123*S:a[d++]=nt(w)*p;case 125*S:case 59:case 0:switch(c){case 0:case 125:_=0;case 59+h:p==-1&&(w=L(w,/\f/g,"")),k>0&&(nt(w)-m||S===0&&x===47)&&dr(k>32?Uu(w+";",r,n,m-1,u):Uu(L(w," ","")+";",r,n,m-2,u),u);break;case 59:w+=";";default:if(dr(N=Bu(w,t,n,d,h,o,a,f,y=[],j=[],m,i),i),c===123)if(h===0)Io(w,t,N,N,y,i,m,a,j);else{switch(g){case 99:if(pe(w,3)===110)break;case 108:if(pe(w,2)===97)break;default:h=0;case 100:case 109:case 115:}h?Io(e,N,N,r&&dr(Bu(e,N,N,0,0,o,a,f,o,y=[],m,j),j),o,j,m,a,r?y:j):Io(w,N,N,N,[""],j,0,a,j)}}d=h=k=0,S=p=1,f=w="",m=l;break;case 58:m=1+nt(w),k=x;default:if(S<1){if(c==123)--S;else if(c==125&&S++==0&&Vh()==125)continue}switch(w+=xa(c),c*S){case 38:p=h>0?1:(w+="\f",-1);break;case 44:a[d++]=(nt(w)-1)*p,p=1;break;case 64:Lt()===45&&(w+=ul(lt())),g=Lt(),h=m=nt(f=w+=Yh(Lo())),c++;break;case 45:x===45&&nt(w)==2&&(S=0)}}return i}function Bu(e,t,n,r,o,i,l,a,u,d,h,m){for(var g=o-1,k=o===0?i:[""],x=$f(k),S=0,_=0,p=0;S<r;++S)for(var c=0,f=fn(e,g+1,g=Af(_=l[S])),y=e;c<x;++c)(y=Mf(_>0?k[c]+" "+f:L(f,/&\f/g,k[c])))&&(u[p++]=y);return Ti(e,t,n,o===0?zi:a,u,d,h,m)}function Qh(e,t,n,r){return Ti(e,t,n,Tf,xa(Dh()),fn(e,2,-2),0,r)}function Uu(e,t,n,r,o){return Ti(e,t,n,va,fn(e,0,r),fn(e,r+1,-1),r,o)}function If(e,t,n){switch(Oh(e,t)){case 5103:return B+"print-"+e+e;case 5737:case 4201:case 3177:case 3433:case 1641:case 4457:case 2921:case 5572:case 6356:case 5844:case 3191:case 6645:case 3005:case 4215:case 6389:case 5109:case 5365:case 5621:case 3829:case 6391:case 5879:case 5623:case 6135:case 4599:return B+e+e;case 4855:return B+e.replace("add","source-over").replace("substract","source-out").replace("intersect","source-in").replace("exclude","xor")+e;case 4789:return Sr+e+e;case 5349:case 4246:case 4810:case 6968:case 2756:return B+e+Sr+e+q+e+e;case 5936:switch(pe(e,t+11)){case 114:return B+e+q+L(e,/[svh]\w+-[tblr]{2}/,"tb")+e;case 108:return B+e+q+L(e,/[svh]\w+-[tblr]{2}/,"tb-rl")+e;case 45:return B+e+q+L(e,/[svh]\w+-[tblr]{2}/,"lr")+e}case 6828:case 4268:case 2903:return B+e+q+e+e;case 6165:return B+e+q+"flex-"+e+e;case 5187:return B+e+L(e,/(\w+).+(:[^]+)/,B+"box-$1$2"+q+"flex-$1$2")+e;case 5443:return B+e+q+"flex-item-"+L(e,/flex-|-self/g,"")+(gt(e,/flex-|baseline/)?"":q+"grid-row-"+L(e,/flex-|-self/g,""))+e;case 4675:return B+e+q+"flex-line-pack"+L(e,/align-content|flex-|-self/g,"")+e;case 5548:return B+e+q+L(e,"shrink","negative")+e;case 5292:return B+e+q+L(e,"basis","preferred-size")+e;case 6060:return B+"box-"+L(e,"-grow","")+B+e+q+L(e,"grow","positive")+e;case 4554:return B+L(e,/([^-])(transform)/g,"$1"+B+"$2")+e;case 6187:return L(L(L(e,/(zoom-|grab)/,B+"$1"),/(image-set)/,B+"$1"),e,"")+e;case 5495:case 3959:return L(e,/(image-set\([^]*)/,B+"$1$`$1");case 4968:return L(L(e,/(.+:)(flex-)?(.*)/,B+"box-pack:$3"+q+"flex-pack:$3"),/space-between/,"justify")+B+e+e;case 4200:if(!gt(e,/flex-|baseline/))return q+"grid-column-align"+fn(e,t)+e;break;case 2592:case 3360:return q+L(e,"template-","")+e;case 4384:case 3616:return n&&n.some(function(r,o){return t=o,gt(r.props,/grid-\w+-end/)})?~$o(e+(n=n[t].value),"span",0)?e:q+L(e,"-start","")+e+q+"grid-row-span:"+(~$o(n,"span",0)?gt(n,/\d+/):+gt(n,/\d+/)-+gt(e,/\d+/))+";":q+L(e,"-start","")+e;case 4896:case 4128:return n&&n.some(function(r){return gt(r.props,/grid-\w+-start/)})?e:q+L(L(e,"-end","-span"),"span ","")+e;case 4095:case 3583:case 4068:case 2532:return L(e,/(.+)-inline(.+)/,B+"$1$2")+e;case 8116:case 7059:case 5753:case 5535:case 5445:case 5701:case 4933:case 4677:case 5533:case 5789:case 5021:case 4765:if(nt(e)-1-t>6)switch(pe(e,t+1)){case 109:if(pe(e,t+4)!==45)break;case 102:return L(e,/(.+:)(.+)-([^]+)/,"$1"+B+"$2-$3$1"+Sr+(pe(e,t+3)==108?"$3":"$2-$3"))+e;case 115:return~$o(e,"stretch",0)?If(L(e,"stretch","fill-available"),t,n)+e:e}break;case 5152:case 5920:return L(e,/(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/,function(r,o,i,l,a,u,d){return q+o+":"+i+d+(l?q+o+"-span:"+(a?u:+u-+i)+d:"")+e});case 4949:if(pe(e,t+6)===121)return L(e,":",":"+B)+e;break;case 6444:switch(pe(e,pe(e,14)===45?18:11)){case 120:return L(e,/(.+:)([^;\s!]+)(;|(\s+)?!.+)?/,"$1"+B+(pe(e,14)===45?"inline-":"")+"box$3$1"+B+"$2$3$1"+q+"$2box$3")+e;case 100:return L(e,":",":"+q)+e}break;case 5719:case 2647:case 2135:case 3927:case 2391:return L(e,"scroll-","scroll-snap-")+e}return e}function ui(e,t){for(var n="",r=0;r<e.length;r++)n+=t(e[r],r,e,t)||"";return n}function Kh(e,t,n,r){switch(e.type){case Hh:if(e.children.length)break;case Lh:case Ih:case va:return e.return=e.return||e.value;case Tf:return"";case Pf:return e.return=e.value+"{"+ui(e.children,r)+"}";case zi:if(!nt(e.value=e.props.join(",")))return""}return nt(n=ui(e.children,r))?e.return=e.value+"{"+n+"}":""}function Xh(e){var t=$f(e);return function(n,r,o,i){for(var l="",a=0;a<t;a++)l+=e[a](n,r,o,i)||"";return l}}function Jh(e){return function(t){t.root||(t=t.return)&&e(t)}}function qh(e,t,n,r){if(e.length>-1&&!e.return)switch(e.type){case va:e.return=If(e.value,e.length,n);return;case Pf:return ui([zt(e,{value:L(e.value,"@","@"+B)})],r);case zi:if(e.length)return bh(n=e.props,function(o){switch(gt(o,r=/(::plac\w+|:read-\w+)/)){case":read-only":case":read-write":gn(zt(e,{props:[L(o,/:(read-\w+)/,":"+Sr+"$1")]})),gn(zt(e,{props:[o]})),ms(e,{props:Fu(n,r)});break;case"::placeholder":gn(zt(e,{props:[L(o,/:(plac\w+)/,":"+B+"input-$1")]})),gn(zt(e,{props:[L(o,/:(plac\w+)/,":"+Sr+"$1")]})),gn(zt(e,{props:[L(o,/:(plac\w+)/,q+"input-$1")]})),gn(zt(e,{props:[o]})),ms(e,{props:Fu(n,r)});break}return""})}}var In={},cl,dl;const Wn=typeof process<"u"&&In!==void 0&&(In.REACT_APP_SC_ATTR||In.SC_ATTR)||"data-styled",Hf="active",Of="data-styled-version",Ai="6.5.3",ya=`/*!sc*/
`,Cr=typeof window<"u"&&typeof document<"u";function Wu(e){if(typeof process<"u"&&In!==void 0){const t=In[e];if(t!==void 0&&t!=="")return t!=="false"}}const em=!!(typeof SC_DISABLE_SPEEDY=="boolean"?SC_DISABLE_SPEEDY:(dl=(cl=Wu("REACT_APP_SC_DISABLE_SPEEDY"))!==null&&cl!==void 0?cl:Wu("SC_DISABLE_SPEEDY"))!==null&&dl!==void 0?dl:typeof process<"u"&&In!==void 0&&!1),tm="sc-keyframes-",nm={};function Mi(e,...t){return new Error(`An error occurred. See https://github.com/styled-components/styled-components/blob/main/packages/styled-components/src/utils/errors.md#${e} for more information.${t.length>0?` Args: ${t.join(", ")}`:""}`)}let Ho=new Map,ci=new Map,Oo=1;const go=e=>{if(Ho.has(e))return Ho.get(e);for(;ci.has(Oo);)Oo++;const t=Oo++;return Ho.set(e,t),ci.set(t,e),t},rm=e=>ci.get(e),om=(e,t)=>{Oo=t+1,Ho.set(e,t),ci.set(t,e)},wa=Object.freeze([]),Gn=Object.freeze({});function bf(e,t,n=Gn){return e.theme!==n.theme&&e.theme||t||n.theme}const im=/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g,lm=/(^-|-$)/g;function Df(e){return e.replace(im,"-").replace(lm,"")}const sm=/(a)(d)/gi,Gu=e=>String.fromCharCode(e+(e>25?39:97));function Vf(e){let t,n="";for(t=Math.abs(e);t>52;t=t/52|0)n=Gu(t%52)+n;return(Gu(t%52)+n).replace(sm,"$1-$2")}const vs=5381,ln=(e,t)=>{let n=t.length;for(;n;)e=33*e^t.charCodeAt(--n);return e},Ff=e=>ln(vs,e);function Bf(e){return Vf(Ff(e)>>>0)}function am(e){return e.displayName||e.name||"Component"}function xs(e){return typeof e=="string"&&!0}function um(e){return xs(e)?`styled.${e}`:`Styled(${am(e)})`}const Uf=Symbol.for("react.memo"),cm=Symbol.for("react.forward_ref"),dm={contextType:!0,defaultProps:!0,displayName:!0,getDerivedStateFromError:!0,getDerivedStateFromProps:!0,propTypes:!0,type:!0},fm={name:!0,length:!0,prototype:!0,caller:!0,callee:!0,arguments:!0,arity:!0},Wf={$$typeof:!0,compare:!0,defaultProps:!0,displayName:!0,propTypes:!0,type:!0},pm={[cm]:{$$typeof:!0,render:!0,defaultProps:!0,displayName:!0,propTypes:!0},[Uf]:Wf};function Yu(e){return("type"in(t=e)&&t.type.$$typeof)===Uf?Wf:"$$typeof"in e?pm[e.$$typeof]:dm;var t}const hm=Object.defineProperty,mm=Object.getOwnPropertyNames,gm=Object.getOwnPropertySymbols,vm=Object.getOwnPropertyDescriptor,xm=Object.getPrototypeOf,ym=Object.prototype;function Gf(e,t,n){if(typeof t!="string"){const r=xm(t);r&&r!==ym&&Gf(e,r,n);const o=mm(t).concat(gm(t)),i=Yu(e),l=Yu(t);for(let a=0;a<o.length;++a){const u=o[a];if(!(u in fm||n&&n[u]||l&&u in l||i&&u in i)){const d=vm(t,u);try{hm(e,u,d)}catch{}}}}return e}function Zr(e){return typeof e=="function"}const wm=Symbol.for("react.forward_ref");function ka(e){return e!=null&&(typeof e=="object"||typeof e=="function")&&e.$$typeof===wm&&"styledComponentId"in e}function fr(e,t){return e&&t?e+" "+t:e||t||""}function ys(e,t){return e.join("")}function Fr(e){return e!==null&&typeof e=="object"&&e.constructor.name===Object.name&&!("props"in e&&e.$$typeof)}function ws(e,t,n=!1){if(!n&&!Fr(e)&&!Array.isArray(e))return t;if(Array.isArray(t))for(let r=0;r<t.length;r++)e[r]=ws(e[r],t[r]);else if(Fr(t))for(const r in t)e[r]=ws(e[r],t[r]);return e}function Yf(e,t){Object.defineProperty(e,"toString",{value:t})}const km=class{constructor(e){this.groupSizes=new Uint32Array(512),this.length=512,this.tag=e,this._cGroup=0,this._cIndex=0}indexOfGroup(e){if(e===this._cGroup)return this._cIndex;let t=this._cIndex;if(e>this._cGroup)for(let n=this._cGroup;n<e;n++)t+=this.groupSizes[n];else for(let n=this._cGroup-1;n>=e;n--)t-=this.groupSizes[n];return this._cGroup=e,this._cIndex=t,t}insertRules(e,t){if(e>=this.groupSizes.length){const o=this.groupSizes,i=o.length;let l=i;for(;e>=l;)if(l<<=1,l<0)throw Mi(16,`${e}`);this.groupSizes=new Uint32Array(l),this.groupSizes.set(o),this.length=l;for(let a=i;a<l;a++)this.groupSizes[a]=0}let n=this.indexOfGroup(e+1),r=0;for(let o=0,i=t.length;o<i;o++)this.tag.insertRule(n,t[o])&&(this.groupSizes[e]++,n++,r++);r>0&&this._cGroup>e&&(this._cIndex+=r)}clearGroup(e){if(e<this.length){const t=this.groupSizes[e],n=this.indexOfGroup(e),r=n+t;this.groupSizes[e]=0;for(let o=n;o<r;o++)this.tag.deleteRule(n);t>0&&this._cGroup>e&&(this._cIndex-=t)}}getGroup(e){let t="";if(e>=this.length||this.groupSizes[e]===0)return t;const n=this.groupSizes[e],r=this.indexOfGroup(e),o=r+n;for(let i=r;i<o;i++)t+=this.tag.getRule(i)+ya;return t}},Sm=`style[${Wn}][${Of}="${Ai}"]`,Cm=new RegExp(`^${Wn}\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)`),Zu=e=>typeof ShadowRoot<"u"&&e instanceof ShadowRoot||"host"in e&&e.nodeType===11,ks=e=>{if(!e)return document;if(Zu(e))return e;if("getRootNode"in e){const t=e.getRootNode();if(Zu(t))return t}return document},jm=(e,t,n)=>{const r=n.split(",");let o;for(let i=0,l=r.length;i<l;i++)(o=r[i])&&e.registerName(t,o)},Em=(e,t)=>{var n;const r=((n=t.textContent)!==null&&n!==void 0?n:"").split(ya),o=[];for(let i=0,l=r.length;i<l;i++){const a=r[i].trim();if(!a)continue;const u=a.match(Cm);if(u){const d=0|parseInt(u[1],10),h=u[2];d!==0&&(om(h,d),jm(e,h,u[3]),e.getTag().insertRules(d,o)),o.length=0}else o.push(a)}},fl=e=>{const t=ks(e.options.target).querySelectorAll(Sm);for(let n=0,r=t.length;n<r;n++){const o=t[n];o&&o.getAttribute(Wn)!==Hf&&(Em(e,o),o.parentNode&&o.parentNode.removeChild(o))}};let lr=!1;function _m(){if(lr!==!1)return lr;if(typeof document<"u"){const e=document.head.querySelector('meta[property="csp-nonce"]');if(e)return lr=e.nonce||e.getAttribute("content")||void 0;const t=document.head.querySelector('meta[name="sc-nonce"]');if(t)return lr=t.getAttribute("content")||void 0}return lr=typeof __webpack_nonce__<"u"?__webpack_nonce__:void 0}const Zf=(e,t)=>{const n=document.head,r=e||n,o=document.createElement("style"),i=(u=>{const d=Array.from(u.querySelectorAll(`style[${Wn}]`));return d[d.length-1]})(r),l=i!==void 0?i.nextSibling:null;o.setAttribute(Wn,Hf),o.setAttribute(Of,Ai);const a=t||_m();return a&&o.setAttribute("nonce",a),r.insertBefore(o,l),o},Nm=class{constructor(e,t){this.element=Zf(e,t),this.element.appendChild(document.createTextNode("")),this.sheet=(n=>{var r;if(n.sheet)return n.sheet;const o=(r=n.getRootNode().styleSheets)!==null&&r!==void 0?r:document.styleSheets;for(let i=0,l=o.length;i<l;i++){const a=o[i];if(a.ownerNode===n)return a}throw Mi(17)})(this.element),this.length=0}insertRule(e,t){try{return this.sheet.insertRule(t,e),this.length++,!0}catch{return!1}}deleteRule(e){this.sheet.deleteRule(e),this.length--}getRule(e){const t=this.sheet.cssRules[e];return t&&t.cssText?t.cssText:""}},zm=class{constructor(e,t){this.element=Zf(e,t),this.nodes=this.element.childNodes,this.length=0}insertRule(e,t){if(e<=this.length&&e>=0){const n=document.createTextNode(t);return this.element.insertBefore(n,this.nodes[e]||null),this.length++,!0}return!1}deleteRule(e){this.element.removeChild(this.nodes[e]),this.length--}getRule(e){return e<this.length?this.nodes[e].textContent:""}};let Qu=Cr;const Rm={isServer:!Cr,useCSSOMInjection:!em};class Qr{static registerId(t){return go(t)}constructor(t=Gn,n={},r){this.options=Object.assign(Object.assign({},Rm),t),this.gs=n,this.keyframeIds=new Set,this.names=new Map(r),this.server=!!t.isServer,!this.server&&Cr&&Qu&&(Qu=!1,fl(this)),Yf(this,()=>(o=>{const i=o.getTag(),{length:l}=i;let a="";for(let u=0;u<l;u++){const d=rm(u);if(d===void 0)continue;const h=o.names.get(d);if(h===void 0||!h.size)continue;const m=i.getGroup(u);if(m.length===0)continue;const g=Wn+".g"+u+'[id="'+d+'"]';let k="";for(const x of h)x.length>0&&(k+=x+",");a+=m+g+'{content:"'+k+'"}'+ya}return a})(this))}rehydrate(){!this.server&&Cr&&fl(this)}reconstructWithOptions(t,n=!0){const r=new Qr(Object.assign(Object.assign({},this.options),t),this.gs,n&&this.names||void 0);return r.keyframeIds=new Set(this.keyframeIds),!this.server&&Cr&&t.target!==this.options.target&&ks(this.options.target)!==ks(t.target)&&fl(r),r}allocateGSInstance(t){return this.gs[t]=(this.gs[t]||0)+1}getTag(){return this.tag||(this.tag=(t=(({useCSSOMInjection:n,target:r,nonce:o})=>n?new Nm(r,o):new zm(r,o))(this.options),new km(t)));var t}hasNameForId(t,n){var r,o;return(o=(r=this.names.get(t))===null||r===void 0?void 0:r.has(n))!==null&&o!==void 0&&o}registerName(t,n){go(t),t.startsWith(tm)&&this.keyframeIds.add(t);const r=this.names.get(t);r?r.add(n):this.names.set(t,new Set([n]))}insertRules(t,n,r){this.registerName(t,n),this.getTag().insertRules(go(t),r)}clearNames(t){this.names.has(t)&&this.names.get(t).clear()}clearRules(t){this.getTag().clearGroup(go(t)),this.clearNames(t)}clearTag(){this.tag=void 0}}const Qf=new WeakSet,Tm={animationIterationCount:1,aspectRatio:1,borderImageOutset:1,borderImageSlice:1,borderImageWidth:1,columnCount:1,columns:1,flex:1,flexGrow:1,flexShrink:1,gridRow:1,gridRowEnd:1,gridRowSpan:1,gridRowStart:1,gridColumn:1,gridColumnEnd:1,gridColumnSpan:1,gridColumnStart:1,fontWeight:1,lineHeight:1,opacity:1,order:1,orphans:1,scale:1,tabSize:1,widows:1,zIndex:1,zoom:1,WebkitLineClamp:1,fillOpacity:1,floodOpacity:1,stopOpacity:1,strokeDasharray:1,strokeDashoffset:1,strokeMiterlimit:1,strokeOpacity:1,strokeWidth:1};function Pm(e,t){return t==null||typeof t=="boolean"||t===""?"":typeof t!="number"||t===0||e in Tm||e.startsWith("--")?String(t).trim():t+"px"}const qt=47;function Ku(e){if(e.charCodeAt(0)===45&&e.charCodeAt(1)===45)return e;let t="";for(let n=0;n<e.length;n++){const r=e.charCodeAt(n);t+=r>=65&&r<=90?"-"+String.fromCharCode(r+32):e[n]}return t.startsWith("ms-")?"-"+t:t}const Am=Symbol.for("sc-keyframes");function Mm(e){return typeof e=="object"&&e!==null&&Am in e}function Kf(e){return Zr(e)&&!(e.prototype&&e.prototype.isReactComponent)}const Xf=e=>e==null||e===!1||e==="",$m=Symbol.for("react.client.reference");function Xu(e){return e.$$typeof===$m}function Jf(e,t){for(const n in e){const r=e[n];e.hasOwnProperty(n)&&!Xf(r)&&(Array.isArray(r)&&Qf.has(r)||Zr(r)?t.push(Ku(n)+":",r,";"):Fr(r)?(t.push(n+" {"),Jf(r,t),t.push("}")):t.push(Ku(n)+": "+Pm(n,r)+";"))}}function Ut(e,t,n,r,o=[]){if(Xf(e))return o;const i=typeof e;if(i==="string")return o.push(e),o;if(i==="function"){if(Xu(e))return o;if(Kf(e)&&t){const l=e(t);return Ut(l,t,n,r,o)}return o.push(e),o}if(Array.isArray(e)){for(let l=0;l<e.length;l++)Ut(e[l],t,n,r,o);return o}return ka(e)?(o.push(`.${e.styledComponentId}`),o):Mm(e)?(n?(e.inject(n,r),o.push(e.getName(r))):o.push(e),o):Xu(e)?o:Fr(e)?e.toString!==Object.prototype.toString?(o.push(e.toString()),o):(Jf(e,o),o):(o.push(e.toString()),o)}const Lm=Ff(Ai);class Im{constructor(t,n,r){this.rules=t,this.componentId=n,this.baseHash=ln(Lm,n),this.baseStyle=r,Qr.registerId(n)}generateAndInjectStyles(t,n,r){let o=this.baseStyle?this.baseStyle.generateAndInjectStyles(t,n,r):"";{let i="";for(let l=0;l<this.rules.length;l++){const a=this.rules[l];if(typeof a=="string")i+=a;else if(a)if(Kf(a)){const u=a(t);typeof u=="string"?i+=u:u!=null&&u!==!1&&(i+=ys(Ut(u,t,n,r)))}else i+=ys(Ut(a,t,n,r))}if(i){this.dynamicNameCache||(this.dynamicNameCache=new Map);const l=r.hash?r.hash+i:i;let a=this.dynamicNameCache.get(l);if(!a){if(a=Vf(ln(ln(this.baseHash,r.hash),i)>>>0),this.dynamicNameCache.size>=200){const u=this.dynamicNameCache.keys().next().value;u!==void 0&&this.dynamicNameCache.delete(u)}this.dynamicNameCache.set(l,a)}if(!n.hasNameForId(this.componentId,a)){const u=r(i,"."+a,void 0,this.componentId);n.insertRules(this.componentId,a,u)}o=fr(o,a)}}return o}}const Hm=/&/g;function qf(e,t){let n=0;for(;--t>=0&&e.charCodeAt(t)===92;)n++;return!(1&~n)}function pl(e){const t=e.length;let n="",r=0,o=0,i=0,l=!1,a=!1;for(let u=0;u<t;u++){const d=e.charCodeAt(u);if(i!==0||l||d!==qt||e.charCodeAt(u+1)!==42)if(l)d===42&&e.charCodeAt(u+1)===qt&&(l=!1,u++);else if(d!==34&&d!==39||qf(e,u)){if(i===0)if(d===123)o++;else if(d===125){if(o--,o<0){a=!0;let h=u+1;for(;h<t;){const m=e.charCodeAt(h);if(m===59||m===10)break;h++}h<t&&e.charCodeAt(h)===59&&h++,o=0,u=h-1,r=h;continue}o===0&&(n+=e.substring(r,u+1),r=u+1)}else d===59&&o===0&&(n+=e.substring(r,u+1),r=u+1)}else i===0?i=d:i===d&&(i=0);else l=!0,u++}return a||o!==0||i!==0?(r<t&&o===0&&i===0&&(n+=e.substring(r)),n):e}function ep(e,t){const n=t+" ",r=","+n;for(let o=0;o<e.length;o++){const i=e[o];if(i.type==="rule"){i.value=(n+i.value).replaceAll(",",r);const l=i.props,a=[];for(let u=0;u<l.length;u++)a[u]=n+l[u];i.props=a}Array.isArray(i.children)&&i.type!=="@keyframes"&&ep(i.children,t)}return e}function Om({options:e=Gn,plugins:t=wa}=Gn){let n,r,o;const i=(g,k,x)=>x.startsWith(r)&&x.endsWith(r)&&x.replaceAll(r,"").length>0?`.${n}`:g,l=t.slice();l.push(g=>{g.type===zi&&g.value.includes("&")&&(o||(o=new RegExp(`\\${r}\\b`,"g")),g.props[0]=g.props[0].replace(Hm,r).replace(o,i))}),e.prefix&&l.push(qh),l.push(Kh);let a=[];const u=Xh(l.concat(Jh(g=>a.push(g)))),d=(g,k="",x="",S="&")=>{n=S,r=k,o=void 0;const _=function(c){const f=c.indexOf("//")!==-1,y=c.indexOf("}")!==-1;if(!f&&!y)return c;if(!f)return pl(c);const j=c.length;let N="",w=0,C=0,M=0,T=0,F=0,Y=!1;for(;C<j;){const Z=c.charCodeAt(C);if(Z!==34&&Z!==39||qf(c,C))if(M===0)if(Z===qt&&C+1<j&&c.charCodeAt(C+1)===42){for(C+=2;C+1<j&&(c.charCodeAt(C)!==42||c.charCodeAt(C+1)!==qt);)C++;C+=2}else if(Z!==40)if(Z!==41)if(T>0)C++;else if(Z===42&&C+1<j&&c.charCodeAt(C+1)===qt)N+=c.substring(w,C),C+=2,w=C,Y=!0;else if(Z===qt&&C+1<j&&c.charCodeAt(C+1)===qt){for(N+=c.substring(w,C);C<j&&c.charCodeAt(C)!==10;)C++;w=C,Y=!0}else Z===123?F++:Z===125&&F--,C++;else T>0&&T--,C++;else T++,C++;else C++;else M===0?M=Z:M===Z&&(M=0),C++}return Y?(w<j&&(N+=c.substring(w)),F===0?N:pl(N)):F===0?c:pl(c)}(g);let p=Zh(x||k?x+" "+k+" { "+_+" }":_);return e.namespace&&(p=ep(p,e.namespace)),a=[],ui(p,u),a},h=e;let m=vs;for(let g=0;g<t.length;g++)t[g].name||Mi(15),m=ln(m,t[g].name);return h!=null&&h.namespace&&(m=ln(m,h.namespace)),h!=null&&h.prefix&&(m=ln(m,"p")),d.hash=m!==vs?m.toString():"",d}const bm=new Qr,Dm=Om(),tp=Oe.createContext({shouldForwardProp:void 0,styleSheet:bm,stylis:Dm,stylisPlugins:void 0});tp.Consumer;function np(){return Oe.useContext(tp)}const Sa=Oe.createContext(void 0);Sa.Consumer;const Ju=Object.prototype.hasOwnProperty,hl={};function Vm(e,t){const n=typeof e!="string"?"sc":Df(e);hl[n]=(hl[n]||0)+1;const r=n+"-"+Bf(Ai+n+hl[n]);return t?t+"-"+r:r}function Fm(e,t,n){const r=ka(e),o=e,i=!xs(e),{attrs:l=wa,componentId:a=Vm(t.displayName,t.parentComponentId),displayName:u=um(e)}=t,d=t.displayName&&t.componentId?Df(t.displayName)+"-"+t.componentId:t.componentId||a,h=r&&o.attrs?o.attrs.concat(l).filter(Boolean):l;let{shouldForwardProp:m}=t;if(r&&o.shouldForwardProp){const S=o.shouldForwardProp;if(t.shouldForwardProp){const _=t.shouldForwardProp;m=(p,c)=>S(p,c)&&_(p,c)}else m=S}const g=new Im(n,d,r?o.componentStyle:void 0);function k(S,_){return function(p,c,f){const{attrs:y,componentStyle:j,defaultProps:N,foldedComponentIds:w,styledComponentId:C,target:M}=p,T=Oe.useContext(Sa),F=np(),Y=p.shouldForwardProp||F.shouldForwardProp,Z=bf(c,T,N)||Gn;let D,$;{const E=Oe.useRef(null),A=E.current;if(A!==null&&A[1]===Z&&A[2]===F.styleSheet&&A[3]===F.stylis&&A[7]===j&&function(H,I,te){const Q=H,K=I;let _e=0;for(const we in K)if(Ju.call(K,we)&&(_e++,Q[we]!==K[we]))return!1;return _e===te}(A[0],c,A[4]))D=A[5],$=A[6];else{D=function(I,te,Q){const K=Object.assign(Object.assign({},te),{className:void 0,theme:Q}),_e=I.length>1;for(let we=0;we<I.length;we++){const at=I[we],ut=Zr(at)?at(_e?Object.assign({},K):K):at;for(const Je in ut)Je==="className"?K.className=fr(K.className,ut[Je]):Je==="style"?K.style=Object.assign(Object.assign({},K.style),ut[Je]):Je in te&&te[Je]===void 0||(K[Je]=ut[Je])}return"className"in te&&typeof te.className=="string"&&(K.className=fr(K.className,te.className)),K}(y,c,Z),$=j.generateAndInjectStyles(D,F.styleSheet,F.stylis);let H=0;for(const I in c)Ju.call(c,I)&&H++;E.current=[c,Z,F.styleSheet,F.stylis,H,D,$,j]}}const ae=D.as||M,b=function(E,A,H,I){const te={};for(const Q in E)E[Q]===void 0||Q[0]==="$"||Q==="as"||Q==="theme"&&E.theme===H||(Q==="forwardedAs"?te.as=E.forwardedAs:I&&!I(Q,A)||(te[Q]=E[Q]));return te}(D,ae,Z,Y);let R=fr(w,C);return $&&(R+=" "+$),D.className&&(R+=" "+D.className),b[xs(ae)&&ae.includes("-")?"class":"className"]=R,f&&(b.ref=f),U.createElement(ae,b)}(x,S,_)}k.displayName=u;let x=Oe.forwardRef(k);return x.attrs=h,x.componentStyle=g,x.displayName=u,x.shouldForwardProp=m,x.foldedComponentIds=r?fr(o.foldedComponentIds,o.styledComponentId):"",x.styledComponentId=d,x.target=r?o.target:e,Object.defineProperty(x,"defaultProps",{get(){return this._foldedDefaultProps},set(S){this._foldedDefaultProps=r?function(_,...p){for(const c of p)ws(_,c,!0);return _}({},o.defaultProps,S):S}}),Yf(x,()=>`.${x.styledComponentId}`),i&&Gf(x,e,{attrs:!0,componentStyle:!0,displayName:!0,foldedComponentIds:!0,shouldForwardProp:!0,styledComponentId:!0,target:!0}),x}var Bm=new Set(["a","abbr","address","area","article","aside","audio","b","bdi","bdo","blockquote","body","button","br","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","label","legend","li","main","map","mark","menu","meter","nav","object","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","slot","small","span","strong","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","u","ul","var","video","wbr","circle","clipPath","defs","ellipse","feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence","filter","foreignObject","g","image","line","linearGradient","marker","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","switch","symbol","text","textPath","tspan","use"]);function qu(e,t){const n=[e[0]];for(let r=0,o=t.length;r<o;r+=1)n.push(t[r],e[r+1]);return n}const ec=e=>(Qf.add(e),e);function rp(e,...t){if(Zr(e)||Fr(e))return ec(Ut(qu(wa,[e,...t])));const n=e;return t.length===0&&n.length===1&&typeof n[0]=="string"?Ut(n):ec(Ut(qu(n,t)))}function Ss(e,t,n=Gn){if(!t)throw Mi(1,t);const r=(o,...i)=>e(t,n,rp(o,...i));return r.attrs=o=>Ss(e,t,Object.assign(Object.assign({},n),{attrs:Array.prototype.concat(n.attrs,o).filter(Boolean)})),r.withConfig=o=>Ss(e,t,Object.assign(Object.assign({},n),o)),r}const op=e=>Ss(Fm,e),v=op;Bm.forEach(e=>{v[e]=op(e)});class Um{constructor(t,n){this.instanceRules=new Map,this.rules=t,this.componentId=n,this.isStatic=function(r){for(let o=0;o<r.length;o+=1){const i=r[o];if(Zr(i)&&!ka(i))return!1}return!0}(t),Qr.registerId(this.componentId)}removeStyles(t,n){this.instanceRules.delete(t),this.rebuildGroup(n)}renderStyles(t,n,r,o){const i=this.componentId;if(this.isStatic){if(r.hasNameForId(i,i+t))this.instanceRules.has(t)||this.computeRules(t,n,r,o);else{const a=this.computeRules(t,n,r,o);r.insertRules(i,a.name,a.rules)}return}const l=this.instanceRules.get(t);if(this.computeRules(t,n,r,o),!r.server&&l){const a=l.rules,u=this.instanceRules.get(t).rules;if(a.length===u.length){let d=!0;for(let h=0;h<a.length;h++)if(a[h]!==u[h]){d=!1;break}if(d)return}}this.rebuildGroup(r)}computeRules(t,n,r,o){const i=ys(Ut(this.rules,n,r,o)),l={name:this.componentId+t,rules:o(i,"")};return this.instanceRules.set(t,l),l}rebuildGroup(t){const n=this.componentId;t.clearRules(n);for(const r of this.instanceRules.values())t.insertRules(n,r.name,r.rules)}}function Wm(e,...t){const n=rp(e,...t),r=`sc-global-${Bf(JSON.stringify(n))}`,o=new Um(n,r),i=a=>{const u=np(),d=Oe.useContext(Sa);let h;{const m=Oe.useRef(null);m.current===null&&(m.current=u.styleSheet.allocateGSInstance(r)),h=m.current}u.styleSheet.server&&l(h,a,u.styleSheet,d,u.stylis);{const m=o.isStatic?[h,u.styleSheet,o]:[h,a,u.styleSheet,d,u.stylis,o],g=Oe.useRef(o);Oe.useLayoutEffect(()=>{u.styleSheet.server||(g.current!==o&&(u.styleSheet.clearRules(r),g.current=o),l(h,a,u.styleSheet,d,u.stylis))},m),Oe.useLayoutEffect(()=>()=>{u.styleSheet.server||o.removeStyles(h,u.styleSheet)},[h,u.styleSheet,o])}return u.styleSheet.server&&o.instanceRules.delete(h),null};function l(a,u,d,h,m){if(o.isStatic)o.renderStyles(a,nm,d,m);else{const g=Object.assign(Object.assign({},u),{theme:bf(u,h,i.defaultProps)});o.renderStyles(a,g,d,m)}}return Oe.memo(i)}const Gm=e=>e*e*e*(e*(e*6-15)+10),Kt=(e,t,n)=>{const r=Math.abs(e-t);return r>=n?0:Gm(1-r/n)},tc={streak:(e,t)=>Kt(e,.5,.06+.16*t)+.32*Kt(e,.5,.5),twin:(e,t)=>Kt(e,.36,.08+.18*t)+.85*Kt(e,.7,.03+.06*t)+.26*Kt(e,.5,.5),sheen:(e,t)=>.55*Kt(e,.5,.25+.25*t)+.3*Kt(e,.5,.5)},nc=(e,t,n,r)=>{const o=tc[n]??tc.streak;return`linear-gradient(90deg, ${Array.from({length:33},(l,a)=>{const u=a/32,d=Math.round(Math.min(1,o(u,r)*t)*1e3)/10;return`color-mix(in srgb, ${e} ${d}%, transparent) ${(u*100).toFixed(1)}%`}).join(", ")})`},Ym=e=>(1-Math.cos(Math.PI*e))/2,Zm=({width:e="auto",height:t="auto",background:n="transparent",borderRadius:r="10px",borderColor:o="transparent",children:i,glareColor:l="#ffffff",glareOpacity:a=.5,glareAngle:u=-45,glareSize:d=30,softness:h=.6,variant:m="streak",blendMode:g="screen",rimGlint:k=!0,mode:x="hover",transitionDuration:S=650,interval:_=3,playOnce:p=!1,intro:c=!1,className:f="",style:y={}})=>{const j=U.useRef(null),N=U.useRef(null),w=U.useRef(null),C=U.useRef(null),M=U.useRef(null),T=U.useRef(!1),F={glareAngle:u,glareSize:d,transitionDuration:S,interval:_,playOnce:p,intro:c},Y=U.useRef(F);Y.current=F,U.useEffect(()=>{const $=j.current,ae=N.current;if(!$||!ae)return;const b=window.matchMedia("(prefers-reduced-motion: reduce)").matches,R={band:0,reach:0,ux:0,uy:-1,angle:0},E={pos:0,velocity:0,target:0,presence:0,presenceTarget:0,sweep:null,visible:!0};let A=0,H=0,I=0;const te=()=>[w.current,C.current].filter(Boolean),Q=()=>{const W=`translate(-50%, -50%) rotate(${R.angle-90}deg) translateX(${E.pos.toFixed(2)}px)`;for(const ue of te())ue.style.transform=W;ae.style.opacity=E.presence.toFixed(3)},K=()=>{const{glareAngle:W,glareSize:ue}=Y.current,ke=$.clientWidth,Ne=$.clientHeight,_t=W*Math.PI/180,Kr=Math.sin(_t),Xn=-Math.cos(_t),Pa=Math.hypot(ke,Ne),Xr=Math.max(8,Pa*ue/100),Ii=(Math.abs(ke*Kr)+Math.abs(Ne*Xn))/2+Xr/2+2,sp=!E.sweep&&x!=="follow";Object.assign(R,{band:Xr,reach:Ii,ux:Kr,uy:Xn,angle:W});for(const Aa of te())Aa.style.width=`${Xr}px`,Aa.style.height=`${Pa+Xr}px`;sp&&(E.pos=E.pos>0?Ii:-Ii),Q()},_e=W=>{const ue=Math.min(.05,(W-H)/1e3||0);H=W;let ke=!1;if(E.sweep){const Ne=E.sweep,_t=Math.min(1,(W-Ne.start)/Ne.duration);E.pos=Ne.from+(Ne.to-Ne.from)*Ym(_t),_t<1?ke=!0:E.sweep=null}else if(x==="follow"){const Ne=Math.max(1,Math.ceil(ue/.008333333333333333)),_t=ue/Ne;for(let Xn=0;Xn<Ne;Xn++)E.velocity+=(170*(E.target-E.pos)-24*E.velocity)*_t,E.pos+=E.velocity*_t;const Kr=E.presenceTarget>E.presence?.18:.4;E.presence+=(E.presenceTarget-E.presence)*(1-Math.exp(-ue/Kr)),ke=Math.abs(E.target-E.pos)>.05||Math.abs(E.velocity)>.05||Math.abs(E.presenceTarget-E.presence)>.002,ke||(E.presence=E.presenceTarget)}Q(),A=ke?requestAnimationFrame(_e):0},we=()=>{A||(H=performance.now(),A=requestAnimationFrame(_e))},at=W=>{if(b||!R.reach)return;const ue=W*R.reach,ke=E.sweep||Math.abs(E.pos)<R.reach?E.pos:-ue;if(ke===ue)return;const Ne=Math.abs(ue-ke)/(2*R.reach);E.sweep={from:ke,to:ue,start:performance.now(),duration:Math.max(120,Y.current.transitionDuration*Ne)},we()},ut=W=>{const ue=$.getBoundingClientRect(),ke=W.clientX-(ue.left+ue.width/2),Ne=W.clientY-(ue.top+ue.height/2);return ke*R.ux+Ne*R.uy},Je=W=>{E.target=Math.max(-R.reach,Math.min(R.reach,ut(W))),we()},Ca=W=>{x==="hover"&&at(ut(W)>0?-1:1),x==="follow"&&(E.presence<.02&&(E.pos=Math.max(-R.reach,Math.min(R.reach,ut(W))),E.velocity=0),E.presenceTarget=b?0:1,Je(W))},ja=W=>{x==="follow"&&Je(W)},Ea=W=>{x==="hover"&&!Y.current.playOnce&&at(ut(W)>0?1:-1),x==="follow"&&(E.presenceTarget=0,we())},_a=W=>{x==="click"&&at(ut(W)>0?-1:1)},Na=W=>{var ue,ke;x!=="follow"&&((ke=(ue=W.target).matches)!=null&&ke.call(ue,":focus-visible"))&&at(1)},za=()=>{window.clearTimeout(I),!(x!=="loop"||b)&&(I=window.setTimeout(()=>{E.visible&&!document.hidden&&at(1),za()},Math.max(.5,Y.current.interval)*1e3))};$.addEventListener("pointerenter",Ca),$.addEventListener("pointermove",ja),$.addEventListener("pointerleave",Ea),$.addEventListener("pointerdown",_a),$.addEventListener("focusin",Na);const Ra=new ResizeObserver(K);Ra.observe($);const Ta=new IntersectionObserver(([W])=>{E.visible=W.isIntersecting,W.isIntersecting&&Y.current.intro&&!T.current&&(T.current=!0,at(1))},{threshold:.4});return Ta.observe($),E.presence=x==="follow"?0:1,E.presenceTarget=E.presence,E.pos=-1e4,K(),za(),M.current={measure:K},()=>{cancelAnimationFrame(A),window.clearTimeout(I),Ra.disconnect(),Ta.disconnect(),$.removeEventListener("pointerenter",Ca),$.removeEventListener("pointermove",ja),$.removeEventListener("pointerleave",Ea),$.removeEventListener("pointerdown",_a),$.removeEventListener("focusin",Na),M.current=null}},[x]),U.useEffect(()=>{var $;($=M.current)==null||$.measure()},[u,d,k]);const Z=nc(l,a,m,h),D=nc(l,Math.min(1,a*1.8),m,h);return s.jsxs("div",{ref:j,className:`glare-hover ${f}`.trim(),style:{"--gh-width":e,"--gh-height":t,"--gh-bg":n,"--gh-br":r,"--gh-border":o,"--gh-glare":Z,"--gh-rim":D,"--gh-blend":g,...y},children:[i,s.jsxs("span",{ref:N,className:"glare-hover__glare","aria-hidden":"true",children:[s.jsx("span",{ref:w,className:"glare-hover__band"}),k&&s.jsx("span",{className:"glare-hover__rim",children:s.jsx("span",{ref:C,className:"glare-hover__band glare-hover__band--rim"})})]})]})},Qm=()=>s.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",width:64,height:150,viewBox:"0 0 64 150",fill:"black",children:[s.jsx("path",{d:"M44 138V136.967H20V138H44Z"}),s.jsx("path",{d:"M44 13.0328V12H20V13.0328H44Z"}),s.jsx("path",{d:"M44 14.0656V13.5492H20V14.0656H44Z"}),s.jsx("path",{d:"M44 15.6148V15.0984H20V15.6148H44Z"}),s.jsx("path",{d:"M44 18.1967V17.6803H20V18.1967H44Z"}),s.jsx("path",{d:"M44 20.2623V19.2295H20V20.2623H44Z"}),s.jsx("path",{d:"M44 22.8443V22.3279H20V22.8443H44Z"}),s.jsx("path",{d:"M44 23.877V23.3607H20V23.877H44Z"}),s.jsx("path",{d:"M44 26.9754V24.9098H20V26.9754H44Z"}),s.jsx("path",{d:"M44 28.0082V27.4918H20V28.0082H44Z"}),s.jsx("path",{d:"M44 29.5574V29.041H20V29.5574H44Z"}),s.jsx("path",{d:"M44 32.6557V30.5902H20V32.6557H44Z"}),s.jsx("path",{d:"M44 33.6885V33.1721H20V33.6885H44Z"}),s.jsx("path",{d:"M44 35.2376V34.7213H20V35.2376H44Z"}),s.jsx("path",{d:"M44 36.2705V35.7541H20V36.2705H44Z"}),s.jsx("path",{d:"M44 39.3689V37.3033H20V39.3689H44Z"}),s.jsx("path",{d:"M44 40.918V40.4015H20V40.918H44Z"}),s.jsx("path",{d:"M44 43.5001V41.4345H20V43.5001H44Z"}),s.jsx("path",{d:"M44 45.0492V44.5327H20V45.0492H44Z"}),s.jsx("path",{d:"M44 47.631V46.0819H20V47.631H44Z"}),s.jsx("path",{d:"M44 49.1804V48.664H20V49.1804H44Z"}),s.jsx("path",{d:"M44 51.2458V50.2131H20V51.2458H44Z"}),s.jsx("path",{d:"M44 52.2787V51.7622H20V52.2787H44Z"}),s.jsx("path",{d:"M44 54.3443V52.7952H20V54.3443H44Z"}),s.jsx("path",{d:"M44 56.4099V55.377H20V56.4099H44Z"}),s.jsx("path",{d:"M44 57.959V57.4426H20V57.959H44Z"}),s.jsx("path",{d:"M44 60.0247V58.4753H20V60.0247H44Z"}),s.jsx("path",{d:"M44 62.09V61.0573H20V62.09H44Z"}),s.jsx("path",{d:"M44 63.6394V63.123H20V63.6394H44Z"}),s.jsx("path",{d:"M44 66.7377V64.6721H20V66.7377H44Z"}),s.jsx("path",{d:"M44 68.2868V67.7704H20V68.2868H44Z"}),s.jsx("path",{d:"M44 69.3198V68.8033H20V69.3198H44Z"}),s.jsx("path",{d:"M44 72.4181V71.3851H20V72.4181H44Z"}),s.jsx("path",{d:"M44 73.4508V72.9345H20V73.4508H44Z"}),s.jsx("path",{d:"M44 76.5493V74.4837H20V76.5493H44Z"}),s.jsx("path",{d:"M44 77.5819V77.0655H20V77.5819H44Z"}),s.jsx("path",{d:"M44 79.1311V78.6146H20V79.1311H44Z"}),s.jsx("path",{d:"M44 80.6802V80.164H20V80.6802H44Z"}),s.jsx("path",{d:"M44 82.2294V81.1967H20V82.2294H44Z"}),s.jsx("path",{d:"M44 83.7788V83.2623H20V83.7788H44Z"}),s.jsx("path",{d:"M44 86.3606V85.8441H20V86.3606H44Z"}),s.jsx("path",{d:"M44 87.9097V87.3935H20V87.9097H44Z"}),s.jsx("path",{d:"M44 91.0083V88.9427H20V91.0083H44Z"}),s.jsx("path",{d:"M44 92.041V91.5245H20V92.041H44Z"}),s.jsx("path",{d:"M44 94.623V92.5574H20V94.623H44Z"}),s.jsx("path",{d:"M44 96.1722V95.6557H20V96.1722H44Z"}),s.jsx("path",{d:"M44 97.7213V97.2048H20V97.7213H44Z"}),s.jsx("path",{d:"M44 99.2704V98.2378H20V99.2704H44Z"}),s.jsx("path",{d:"M44 100.82V100.303H20V100.82H44Z"}),s.jsx("path",{d:"M44 103.402V102.885H20V103.402H44Z"}),s.jsx("path",{d:"M44 105.467V104.434H20V105.467H44Z"}),s.jsx("path",{d:"M44 108.049V106.5H20V108.049H44Z"}),s.jsx("path",{d:"M44 109.082V108.566H20V109.082H44Z"}),s.jsx("path",{d:"M44 112.18V111.148H20V112.18H44Z"}),s.jsx("path",{d:"M44 113.213V112.697H20V113.213H44Z"}),s.jsx("path",{d:"M44 114.762V114.246H20V114.762H44Z"}),s.jsx("path",{d:"M44 118.377V116.311H20V118.377H44Z"}),s.jsx("path",{d:"M44 119.41V118.893H20V119.41H44Z"}),s.jsx("path",{d:"M44 120.442V119.926H20V120.442H44Z"}),s.jsx("path",{d:"M44 122.508V120.959H20V122.508H44Z"}),s.jsx("path",{d:"M44 124.574V123.541H20V124.574H44Z"}),s.jsx("path",{d:"M44 127.672V125.607H20V127.672H44Z"}),s.jsx("path",{d:"M44 128.705V128.188H20V128.705H44Z"}),s.jsx("path",{d:"M44 130.254V129.738H20V130.254H44Z"}),s.jsx("path",{d:"M44 132.32V131.287H20V132.32H44Z"}),s.jsx("path",{d:"M44 135.418V133.869H20V135.418H44Z"}),s.jsx("path",{d:"M44 136.451V135.934H20V136.451H44Z"})]}),$i=({name:e,role:t,roleCode:n,id:r,owns:o,shipped:i,badgeColor:l,photoPath:a,glareColor:u="#C9DBE9"})=>s.jsx(Zm,{width:"380px",height:"160px",borderRadius:"1rem",mode:"hover",variant:"streak",glareColor:u,glareOpacity:.5,glareSize:30,softness:.6,glareAngle:-45,blendMode:"screen",rimGlint:!0,transitionDuration:650,children:s.jsxs(ng,{children:[s.jsx(Qm,{}),s.jsx(rg,{children:s.jsx(og,{})}),s.jsxs(ig,{children:[s.jsxs(lg,{children:[s.jsxs(sg,{children:[s.jsxs(rc,{children:[s.jsx(oc,{children:"SETTLE"}),s.jsx(ic,{children:e})]}),s.jsx("svg",{style:{flexShrink:0},xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",children:s.jsx("path",{fill:"none",stroke:"#90B0C7",strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:1,d:"m18 8l4 4l-4 4M2 12h20"})}),s.jsxs(rc,{children:[s.jsx(oc,{children:t}),s.jsx(ic,{children:n})]})]}),s.jsx(ag,{}),s.jsxs(ug,{children:[s.jsxs(lc,{children:[s.jsxs(ml,{children:[s.jsx(gl,{children:"ID"}),s.jsx(vl,{children:r})]}),s.jsxs(ml,{children:[s.jsx(gl,{children:"Owns"}),s.jsx(vl,{children:o})]})]}),s.jsx(lc,{children:s.jsxs(ml,{children:[s.jsx(gl,{children:"Shipped"}),s.jsx(vl,{children:i})]})})]})]}),s.jsx(cg,{badgeColor:l,children:s.jsx(dg,{src:a,alt:e})})]})]})}),Km=()=>s.jsx(Li,{children:s.jsx("a",{href:"https://www.linkedin.com/in/saeeekumbhar/",target:"_blank",rel:"noopener noreferrer",style:{textDecoration:"none"},children:s.jsx($i,{name:"SAEE",role:"TEAM LEAD",roleCode:"TL",id:"762001",owns:"API & Chain",shipped:"62 tests",photoPath:"/images/SAEE.jpg",badgeColor:"#4E6A9C"})})}),Xm=()=>s.jsx(Li,{children:s.jsx("a",{href:"https://www.linkedin.com/in/atharv-chaskar-75711936b/",target:"_blank",rel:"noopener noreferrer",style:{textDecoration:"none"},children:s.jsx($i,{name:"ATHARV",role:"BACKEND",roleCode:"BE",id:"762002",owns:"Smart Contracts",shipped:"4 Attacks",photoPath:"/images/CHASKAR.jpg",badgeColor:"#1A3F75"})})}),Jm=()=>s.jsx(Li,{children:s.jsx("a",{href:"https://www.linkedin.com/in/prathamesh-patil-794441385/",target:"_blank",rel:"noopener noreferrer",style:{textDecoration:"none"},children:s.jsx($i,{name:"PRATHAMESH",role:"SMART CONTRACT",roleCode:"SC",id:"762003",owns:"MilestoneVault",shipped:"29 Checks",photoPath:"/images/PRATHAMESH.jpg",badgeColor:"#325E8A"})})}),qm=()=>s.jsx(Li,{children:s.jsx("a",{href:"https://www.linkedin.com/in/bhavjot-singh-rooprai-a9b861385/",target:"_blank",rel:"noopener noreferrer",style:{textDecoration:"none"},children:s.jsx($i,{name:"PAJI",role:"FRONT-END + BACKEND",roleCode:"FB",id:"762004",owns:"UI & Demo",shipped:"23 APIs",photoPath:"/images/PAJI.jpg",badgeColor:"#204A7D"})})}),eg=()=>s.jsxs(tg,{children:[s.jsx(Km,{}),s.jsx(Xm,{}),s.jsx(Jm,{}),s.jsx(qm,{})]}),tg=v.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  justify-items: center;
  align-items: center;
  gap: 40px;
  padding: 40px 20px;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`,Li=v.div`
  perspective: 1000px;
  border-radius: 1rem;
  transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.25), box-shadow 0.35s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(78, 106, 156, 0.4);
  }
`,ng=v.div`
  position: relative !important;
  height: 100% !important;
  width: 100% !important;
  display: flex !important;
  color: #C9DBE9 !important;
  background: linear-gradient(135deg, #0B1423 0%, #162C46 100%) !important;
  border: 1px solid rgba(78, 106, 156, 0.35) !important;
  border-radius: inherit !important;
  z-index: 1 !important;
  gap: 0.8rem !important;
  overflow: hidden !important;
  cursor: pointer !important;
`,rg=v.div`
  position: absolute;
  top: 0;
  left: 50px;
  width: 16px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 10;
`,og=v.span`
  position: relative;
  display: flex;
  height: 100%;
  border-left: 2px dashed #4E6A9C !important;

  &::after {
    content: "";
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #00002A !important;
  }

  &::before {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: #00002A !important;
  }
`,ig=v.div`
  position: relative;
  justify-content: space-between;
  width: 100%;
  display: flex;
  align-items: stretch;
`,lg=v.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  padding: 0.875rem;
  gap: 0.35rem;
  flex: 1;
`,sg=v.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`,rc=v.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`,oc=v.p`
  font-size: 9px;
  line-height: 1;
  color: #90B0C7 !important;
  font-weight: 500;
  margin: 0;
`,ic=v.p`
  font-weight: 800;
  color: #ffffff !important;
  font-size: 12px;
  margin: 2px 0 0 0;
  letter-spacing: 0.5px;
`,ag=v.div`
  border-bottom: 2px solid #4E6A9C !important;
  margin: 0.25rem 0;
`,ug=v.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`,lc=v.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
`,ml=v.div`
  font-size: 9px;
  line-height: 11px;
  flex: 1;
`,gl=v.p`
  color: #90B0C7 !important;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin: 0;
  font-size: 8px;
`,vl=v.p`
  font-weight: 700;
  color: #C9DBE9 !important;
  margin: 2px 0 0 0;
  font-size: 10px;
`,cg=v.div`
  width: 70px;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  z-index: 10;
  border-radius: 0 1rem 1rem 0;
  background-color: ${e=>e.badgeColor} !important;
  overflow: hidden;
`,dg=v.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`,fg=Wm`
  html, body {
    overflow-x: clip;
  }
`,pg=()=>{const e=U.useRef(null),t=U.useRef(null),n=U.useRef(null),r=U.useRef([]);return U.useEffect(()=>{const o=e.current;if(!o)return;if(typeof window<"u"){let c=o.parentElement;for(;c&&c!==document.body&&c!==document.documentElement;){const f=window.getComputedStyle(c),y=c.tagName.toLowerCase(),j=c.id?`#${c.id}`:"",N=c.className&&typeof c.className=="string"?`.${c.className.trim().split(/\s+/)[0]}`:"",w=`<${y}${j}${N}>`,C=[];f.overflow!=="visible"&&f.overflow!=="clip"&&C.push(`overflow: "${f.overflow}"`),f.overflowX!=="visible"&&f.overflowX!=="clip"&&C.push(`overflow-x: "${f.overflowX}"`),f.overflowY!=="visible"&&f.overflowY!=="clip"&&C.push(`overflow-y: "${f.overflowY}"`),f.transform&&f.transform!=="none"&&C.push(`transform: "${f.transform}"`),f.filter&&f.filter!=="none"&&C.push(`filter: "${f.filter}"`),f.contain&&f.contain!=="none"&&f.contain!=="normal"&&C.push(`contain: "${f.contain}"`),C.length>0&&console.warn(`[Footer Sticky Warning] Ancestor element ${w} has styles that break position: sticky: ${C.join(", ")}. Set overflow to visible/clip and remove transform/filter/contain.`),c=c.parentElement}}const i=t.current;if(i){let c=function(){return y=y*16807%2147483647,(y-1)/2147483646},y=7;i.innerHTML="";for(let j=0;j<90;j++){const N=j/90+c()*.01,w=document.createElement("i");let C,M,T;N<.55?(C=c()*22,M=85+c()*15,T=35+c()*35):(C=200+c()*30,M=80+c()*20,T=35+c()*40),c()<.18&&(T=6,M=30),c()<.08&&(C=40+c()*10,T=55),w.style.left=N*100+"%",w.style.width=.3+c()*c()*3.2+"%",w.style.background=`linear-gradient(90deg, transparent, hsl(${C}, ${M}%, ${T}%), transparent)`,w.style.opacity=(.45+c()*.55).toFixed(3),i.appendChild(w)}}const l=(c,f=0,y=1)=>Math.min(Math.max(c,f),y),a=(c,f,y)=>l((c-f)/(y-f),0,1),u=c=>c<.5?4*c*c*c:1-Math.pow(-2*c+2,3)/2,d=c=>1-Math.pow(1-c,3);function h(c){const f=a(c,0,.25),y=u(a(c,.25,.5)),j=u(a(c,.72,.92)),N=1-.72*y+.72*j,w=f*(1-.5*y*(1-j));if(t.current&&(t.current.style.transform=`scaleX(${N.toFixed(4)})`,t.current.style.opacity=w.toFixed(3)),r.current&&r.current.forEach((C,M)=>{if(!C)return;const T=.38+M*.045,F=T+.28,Y=d(a(c,T,F));C.style.opacity=Y.toFixed(3),C.style.transform=`scaleY(${(1+1.8*(1-Y)).toFixed(3)}) translateY(${(-30*(1-Y)).toFixed(1)}px)`,C.style.filter=`blur(${(16*(1-Y)).toFixed(1)}px) drop-shadow(0 .03em .05em rgba(0,0,0,.55))`}),n.current){const C=d(a(c,.86,1));n.current.style.opacity=C.toFixed(3),n.current.style.transform=`translateY(${(24*(1-C)).toFixed(1)}px)`,n.current.style.pointerEvents=C>.6?"auto":"none"}}if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){h(1);return}const k=(c=>{let f=c==null?void 0:c.parentElement;for(;f&&f!==document.body&&f!==document.documentElement;){const y=window.getComputedStyle(f);if(["auto","scroll"].includes(y.overflowY)&&f.scrollHeight>f.clientHeight)return f;f=f.parentElement}return window})(o);let x=null;const S=()=>{if(!e.current)return;const c=e.current,f=c.getBoundingClientRect(),y=k===window,j=y?window.innerHeight:k.clientHeight,N=y?f.top:f.top-k.getBoundingClientRect().top,w=c.offsetHeight-j,C=w>0?l(-N/w,0,1):0;h(C),(window.__DEBUG_FOOTER__||window.__LOG_FOOTER_PROGRESS__)&&console.log(`[Footer Scroll Test] p = ${C.toFixed(3)} | Stage pinned: ${N<=0&&-N<w}`)},_=()=>{x===null&&(x=requestAnimationFrame(()=>{x=null,S()}))},p=k;return p.addEventListener("scroll",_,{passive:!0}),window.addEventListener("resize",_),window.addEventListener("load",_),document.fonts&&document.fonts.ready&&document.fonts.ready.then(S).catch(()=>{}),S(),()=>{p.removeEventListener("scroll",_),window.removeEventListener("resize",_),window.removeEventListener("load",_),x!==null&&cancelAnimationFrame(x)}},[]),s.jsx(hg,{ref:e,children:s.jsxs(mg,{children:[s.jsx(gg,{ref:t,"aria-hidden":"true"}),s.jsx(vg,{"aria-hidden":"true"}),s.jsx(xg,{"aria-label":"SETTL",children:["S","E","T","T","L"].map((o,i)=>s.jsx(yg,{ref:l=>{l&&r.current&&(r.current[i]=l)},children:o},i))}),s.jsxs(wg,{ref:n,children:[s.jsxs(kg,{children:[s.jsxs(vo,{children:[s.jsx(xo,{children:"Company"}),s.jsx(Ue,{href:"#about",children:"About"}),s.jsx(Ue,{href:"#careers",children:"Careers"}),s.jsx(Ue,{href:"#press",children:"Press"})]}),s.jsxs(vo,{children:[s.jsx(xo,{children:"Product"}),s.jsx(Ue,{href:"#features",children:"Features"}),s.jsx(Ue,{href:"#pricing",children:"Pricing"}),s.jsx(Ue,{href:"#changelog",children:"Changelog"})]}),s.jsxs(vo,{children:[s.jsx(xo,{children:"Support"}),s.jsx(Ue,{href:"#help",children:"Help Center"}),s.jsx(Ue,{href:"#contact",children:"Contact"}),s.jsx(Ue,{href:"#status",children:"Status"})]}),s.jsxs(vo,{children:[s.jsx(xo,{children:"Legal"}),s.jsx(Ue,{href:"#privacy",children:"Privacy"}),s.jsx(Ue,{href:"#terms",children:"Terms"}),s.jsx(Ue,{href:"#cookies",children:"Cookies"})]})]}),s.jsxs(Sg,{children:[s.jsx("span",{children:"© 2026 SETTLE. All rights reserved."}),s.jsx("span",{children:"Made with care."})]})]})]})})},hg=v.footer`
  position: relative;
  height: 320vh;
  background: #000;
`,mg=v.div`
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
  background: #000;
  isolation: isolate;
`,gg=v.div`
  position: absolute;
  inset: 0;
  opacity: 0;
  transform-origin: 50% 50%;
  filter: blur(1.5px) saturate(1.15);
  will-change: transform, opacity;

  i {
    position: absolute;
    top: -5%;
    bottom: -5%;
    display: block;
  }
`,vg=v.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: 
    radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0, 0, 0, 0.75) 100%),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.55), transparent 25%, transparent 70%, rgba(0, 0, 0, 0.85));
`,xg=v.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 46%;
  transform: translateY(-50%);
  display: flex;
  justify-content: center;
  gap: 0.01em;
  font: 400 clamp(72px, 21vw, 340px) / 1 'Anton', Impact, sans-serif;
  pointer-events: none;
  letter-spacing: 0.02em;
`,yg=v.span`
  display: inline-block;
  opacity: 0;
  transform-origin: 50% 100%;
  will-change: transform, opacity, filter;
  background: linear-gradient(90deg, #e50914 0 52%, #a9050e 52% 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0.03em 0.05em rgba(0, 0, 0, 0.55));
`,wg=v.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 clamp(1rem, 5vw, 4rem) calc(2rem + env(safe-area-inset-bottom, 0px));
  opacity: 0;
  transform: translateY(24px);
  will-change: opacity, transform;
`,kg=v.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1.5rem;
  max-width: 960px;
  margin: 0 auto 1.5rem;
`,vo=v.div``,xo=v.h4`
  margin: 0 0 0.6rem;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8d8d96;
  font-weight: 600;
`,Ue=v.a`
  display: block;
  color: #f4f4f5;
  text-decoration: none;
  font-size: 0.95rem;
  padding: 0.25rem 0;
  opacity: 0.85;
  transition: opacity 0.2s, color 0.2s;
  cursor: pointer;

  &:hover {
    opacity: 1;
    color: #ff5560;
  }
`,Sg=v.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  justify-content: space-between;
  max-width: 960px;
  margin: 0 auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 0.8rem;
  color: #b9b9c2;
`,di=window.location.port==="5173"?"http://localhost:3000/app/":"/app/",Cg=()=>s.jsxs(jg,{id:"home",children:[s.jsx(Eg,{}),s.jsx(_g,{children:s.jsxs(Ng,{children:[s.jsx(zg,{children:"Write the deal in plain words. Settl locks it."}),s.jsx(Rg,{children:"Money moves only when the work is approved. No middleman. No vague terms."}),s.jsxs(Tg,{children:[s.jsx(Pg,{href:di,children:"Try a live deal"}),s.jsx(Ag,{href:"#security",children:"Watch the attacks fail"})]}),s.jsx(Mg,{children:"All funds are simulated."})]})})]}),jg=v.section`
  position: relative;
  z-index: 5;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  overflow: hidden;
`,Eg=v.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 42, 0.7) 0%,
    rgba(11, 20, 35, 0.45) 50%,
    rgba(0, 0, 42, 0.75) 100%
  );
  pointer-events: none;
  z-index: -1;
`,_g=v.div`
  max-width: 860px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
`,Ng=v.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,zg=v.h1`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(2.4rem, 6vw, 4.2rem);
  font-weight: 700;
  color: #ffffff;
  line-height: 1.15;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`,Rg=v.p`
  font-size: clamp(1rem, 2.2vw, 1.35rem);
  color: #d0d0d0;
  line-height: 1.6;
  margin: 0;
  font-weight: 300;
  max-width: 680px;
`,Tg=v.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`,ip=v.a`
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`,Pg=v(ip)`
  background: #1A3F75;
  color: #ffffff;

  &:hover {
    background: #255598;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(78, 106, 156, 0.4);
  }
`,Ag=v(ip)`
  background: transparent;
  color: #C9DBE9;
  border: 2px solid #4E6A9C;

  &:hover {
    background: rgba(78, 106, 156, 0.2);
    border-color: #90B0C7;
    transform: translateY(-2px);
  }
`,Mg=v.div`
  font-size: 0.875rem;
  color: #90B0C7;
  background: rgba(26, 63, 117, 0.25);
  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid rgba(78, 106, 156, 0.4);
  margin-top: 12px;
  display: inline-block;
`,$g=""+new URL("blockchain-blocks-g9ENj4Ju.svg",import.meta.url).href,Lg=()=>{const[e,t]=U.useState(null),n=U.useRef(null),r=[{number:1,title:"Describe",description:"Type the deal in normal language."},{number:2,title:"Check",description:"The deal checker builds a checklist and flags every unclear line."},{number:3,title:"Join",description:"Everyone agrees. Payers deposit. The deal locks."},{number:4,title:"Do and approve",description:"Payee marks a stage done. Payers approve, or the judge decides a dispute."},{number:5,title:"Finish",description:"Every stage settled. The money adds up exactly."}];return U.useEffect(()=>{var l;const o=new IntersectionObserver(a=>{a.forEach(u=>{if(u.isIntersecting){const d=parseInt(u.target.dataset.step,10);t(d)}})},{threshold:.5}),i=(l=n.current)==null?void 0:l.querySelectorAll("[data-step]");return i==null||i.forEach(a=>o.observe(a)),()=>o.disconnect()},[]),s.jsxs(Ig,{ref:n,id:"how-it-works",children:[s.jsx(Hg,{children:"How it works"}),s.jsx(Og,{children:"Five steps from plain words to locked deal."}),s.jsx(bg,{children:r.map(o=>s.jsxs(Dg,{"data-step":o.number,isActive:e===o.number,children:[s.jsx(Vg,{isActive:e===o.number,children:o.number}),s.jsx(Fg,{children:o.title}),s.jsx(Bg,{children:o.description})]},o.number))}),s.jsxs(Ug,{children:[s.jsx(Wg,{children:"Blocks linked in a chain"}),s.jsx(Gg,{children:s.jsx("img",{src:$g,alt:"Blocks linked in a chain",style:{width:"100%",maxWidth:"1000px",height:"auto",display:"block",margin:"0 auto",borderRadius:"10px"}})})]})]})},Ig=v.section`
  position: relative;
  z-index: 5;
  padding: 80px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-top: 1px solid rgba(78, 106, 156, 0.2);
  border-bottom: 1px solid rgba(78, 106, 156, 0.2);
`,Hg=v.h2`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #ffffff;
  text-align: center;
  margin: 0 0 16px 0;
`,Og=v.p`
  font-size: 1.1rem;
  color: #b0b0b0;
  text-align: center;
  margin: 0 0 60px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`,bg=v.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`,Dg=v.div`
  background: linear-gradient(135deg, rgba(11, 20, 35, 0.6), rgba(26, 63, 117, 0.15));
  border: 2px solid ${e=>e.isActive?"#90B0C7":"rgba(78, 106, 156, 0.25)"};
  border-radius: 12px;
  padding: 32px 24px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #C9DBE9;
    transform: translateY(-4px);
    background: linear-gradient(135deg, rgba(11, 20, 35, 0.8), rgba(26, 63, 117, 0.3));
  }
`,Vg=v.div`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  background: ${e=>e.isActive?"linear-gradient(90deg, #90B0C7, #C9DBE9)":"linear-gradient(90deg, #24416B, #4E6A9C)"};
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  line-height: 1;
  margin-bottom: 16px;
  transition: all 0.3s ease;
`,Fg=v.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ffffff;
  margin: 0 0 12px 0;
`,Bg=v.p`
  font-size: 0.95rem;
  color: #b0b0b0;
  line-height: 1.6;
  margin: 0;
`,Ug=v.div`
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
  padding: 40px 20px;
  background: rgba(11, 20, 35, 0.4);
  border: 1px solid rgba(78, 106, 156, 0.2);
  border-radius: 12px;
`,Wg=v.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  margin: 0 0 32px 0;
  text-align: center;
`,Gg=v.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;

  svg, img {
    max-width: 100%;
    height: auto;
    display: block;
  }
`,Yg=()=>{const[e,t]=U.useState(null),[n,r]=U.useState({}),o=[{id:"second-release",name:"Second Release",tries:"Pay the same stage twice",blocked:"Refused. A stage settles once."},{id:"unauthorized-refund",name:"Unauthorised Refund",tries:"A non-judge triggers a refund",blocked:"Refused. Only the judge can resolve."},{id:"out-of-order",name:"Out-of-Order Step",tries:"Approve before the work is marked done",blocked:"Refused. Caller, phase and stage state are all checked."},{id:"re-entrancy",name:"Re-entrancy",tries:"Call back into withdraw to drain the vault",blocked:"Refused. Credit is cleared before sending."}],i=["No second release","No unauthorised refund","No out-of-order step","No re-entrancy theft","Books always reconcile","Fair group rules"],l=a=>{t(a),setTimeout(()=>{r(u=>({...u,[a]:"blocked"}))},800)};return s.jsxs(Zg,{id:"security",children:[s.jsx(Qg,{children:"Security and Attack Lab"}),s.jsx(Kg,{children:"Hundreds of random actions tested. Books checked after every single step."}),s.jsx(Xg,{children:o.map(a=>s.jsxs(Jg,{isActive:e===a.id,children:[s.jsx(qg,{children:a.name}),s.jsxs(e1,{children:[s.jsxs(t1,{children:[s.jsx(sc,{children:"What it tries"}),s.jsx(ac,{children:a.tries})]}),s.jsxs(n1,{children:[s.jsx(sc,{children:"What the vault does"}),s.jsx(ac,{children:a.blocked})]})]}),s.jsx(r1,{onClick:()=>l(a.id),disabled:e===a.id,children:e===a.id?"Running...":"Run attack"}),n[a.id]&&s.jsx(o1,{children:"BLOCKED"})]},a.id))}),s.jsxs(i1,{children:[s.jsx(l1,{children:"Guarantee Badges"}),s.jsx(s1,{children:i.map((a,u)=>s.jsxs(a1,{children:["✓ ",a]},u))})]}),s.jsxs(u1,{children:[s.jsx(c1,{children:"Same attacker. Same code. One tiny difference."}),s.jsxs(d1,{children:[s.jsxs("div",{children:[s.jsx(cc,{children:"Settl Vault"}),s.jsxs(uc,{children:[s.jsx(vn,{label:"Owed to the attacker",children:"One stage"}),s.jsx(vn,{label:"Attacker receives",children:s.jsx(h1,{children:"Exactly one stage"})}),s.jsx(vn,{label:"Honest payee afterwards",children:s.jsx(m1,{children:"Still paid"})})]})]}),s.jsxs("div",{children:[s.jsx(cc,{children:"Unprotected Copy"}),s.jsxs(uc,{children:[s.jsx(vn,{label:"Owed to the attacker",children:"One stage"}),s.jsx(vn,{label:"Attacker receives",children:s.jsx(dc,{children:"Every stage in the vault"})}),s.jsx(vn,{label:"Honest payee afterwards",children:s.jsx(dc,{children:"Cannot be paid"})})]})]})]})]})]})},Zg=v.section`
  position: relative;
  z-index: 5;
  padding: 80px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-bottom: 1px solid rgba(78, 106, 156, 0.2);
`,Qg=v.h2`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #ffffff;
  text-align: center;
  margin: 0 0 16px 0;
`,Kg=v.p`
  font-size: 1rem;
  color: #999;
  text-align: center;
  margin: 0 0 60px 0;
  font-style: italic;
`,Xg=v.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`,Jg=v.div`
  background: linear-gradient(135deg, rgba(11, 20, 35, 0.75), rgba(26, 63, 117, 0.2));
  border: 2px solid ${e=>e.isActive?"#90B0C7":"rgba(78, 106, 156, 0.3)"};
  border-radius: 12px;
  padding: 28px;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    border-color: #C9DBE9;
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(26, 63, 117, 0.3);
  }
`,qg=v.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C9DBE9;
  margin: 0 0 20px 0;
`,e1=v.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
`,t1=v.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`,n1=v.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`,sc=v.span`
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.08em;
  font-weight: 600;
`,ac=v.span`
  font-size: 0.95rem;
  color: #d0d0d0;
  line-height: 1.5;
`,r1=v.button`
  width: 100%;
  padding: 12px 16px;
  background: #1A3F75;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #255598;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(78, 106, 156, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`,o1=v.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #4E6A9C;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`,i1=v.div`
  max-width: 1200px;
  margin: 0 auto 60px;
  padding: 40px;
  background: rgba(26, 63, 117, 0.15);
  border: 1px solid rgba(78, 106, 156, 0.35);
  border-radius: 12px;
`,l1=v.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C9DBE9;
  margin: 0 0 24px 0;
  text-align: center;
`,s1=v.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`,a1=v.div`
  padding: 12px 16px;
  background: rgba(26, 63, 117, 0.3);
  border: 1px solid rgba(78, 106, 156, 0.4);
  border-radius: 6px;
  color: #C9DBE9;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
`,u1=v.div`
  max-width: 1000px;
  margin: 0 auto;
`,c1=v.h3`
  font-size: 1.2rem;
  color: #d0d0d0;
  text-align: center;
  margin: 0 0 40px 0;
  font-style: italic;
  font-weight: 500;
`,d1=v.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`,uc=v.div`
  background: rgba(11, 20, 35, 0.6);
  border: 1px solid rgba(78, 106, 156, 0.25);
  border-radius: 12px;
  overflow: hidden;
`,cc=v.div`
  background: linear-gradient(90deg, rgba(26, 63, 117, 0.3), rgba(78, 106, 156, 0.15));
  padding: 16px;
  color: #C9DBE9;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(78, 106, 156, 0.25);
`,f1=v.div`
  padding: 16px;
  border-bottom: 1px solid rgba(78, 106, 156, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;

  &:last-child {
    border-bottom: none;
  }
`,p1=v.span`
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.08em;
  font-weight: 600;
`,vn=({label:e,children:t})=>s.jsxs(f1,{children:[s.jsx(p1,{children:e}),t]}),h1=v.span`
  color: #00d98e;
  font-weight: 600;
`,m1=v.span`
  color: #00d98e;
  font-weight: 600;
`,dc=v.span`
  color: #ff3333;
  font-weight: 600;
`,g1=()=>{const e=[{title:"The middleman is a black box",description:"Whoever holds the money sets hidden rules and can favour one side."},{title:"Agreements are vague",description:'"Pay when the work is good" becomes a dispute later.'},{title:"A program that holds money cannot make mistakes",description:"A double release or a re-entrant call can lose money for good."}];return s.jsxs(v1,{id:"problem",children:[s.jsx(x1,{children:e.map((t,n)=>s.jsxs(y1,{children:[s.jsx(w1,{children:t.title}),s.jsx(k1,{children:t.description})]},n))}),s.jsx(S1,{children:"Everyone is afraid to go first. Settl removes the fear."})]})},v1=v.section`
  position: relative;
  z-index: 5;
  padding: 80px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-bottom: 1px solid rgba(78, 106, 156, 0.2);
`,x1=v.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto 60px;

  @media (max-width: 768px) {
    gap: 24px;
  }
`,y1=v.div`
  background: linear-gradient(135deg, rgba(11, 20, 35, 0.6), rgba(26, 63, 117, 0.12));
  border: 2px solid rgba(78, 106, 156, 0.3);
  border-radius: 12px;
  padding: 40px 32px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: #90B0C7;
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(26, 63, 117, 0.3);
  }
`,w1=v.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C9DBE9;
  margin: 0 0 16px 0;
`,k1=v.p`
  font-size: 1rem;
  color: #b0b0b0;
  line-height: 1.6;
  margin: 0;
`,S1=v.p`
  text-align: center;
  font-size: 1.2rem;
  color: #d0d0d0;
  margin: 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
  line-height: 1.6;
`,C1=()=>{const e=["Every stage must quote the deal text exactly, or it is dropped.","The AI never invents a name, amount or judge. Gaps become questions.",'Vague words ("satisfactory", "a reasonable time") are flagged, not guessed.',"Nothing reaches the contract without human confirmation.","A fingerprint of the deal text is stored in the vault, tying it to exactly what everyone agreed to.","If the model fails, an offline reader takes over and the product still works."];return s.jsxs(j1,{id:"ai-guardrails",children:[s.jsx(E1,{children:"AI helps you write the deal. It never touches the money."}),s.jsxs(_1,{children:[s.jsx(yo,{children:s.jsx(wo,{children:"AI proposes"})}),s.jsx(xl,{children:"→"}),s.jsx(yo,{children:s.jsx(wo,{children:"Human confirms"})}),s.jsx(xl,{children:"→"}),s.jsx(yo,{children:s.jsx(wo,{children:"Everyone agrees"})}),s.jsx(xl,{children:"→"}),s.jsx(yo,{children:s.jsx(wo,{children:"Contract locks"})})]}),s.jsx(N1,{children:e.map((t,n)=>s.jsxs(z1,{children:[s.jsx(R1,{children:"✓"}),s.jsx(T1,{children:t})]},n))})]})},j1=v.section`
  position: relative;
  z-index: 5;
  padding: 80px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-bottom: 1px solid rgba(78, 106, 156, 0.2);
`,E1=v.h2`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #ffffff;
  text-align: center;
  margin: 0 0 60px 0;
`,_1=v.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  max-width: 1000px;
  margin: 0 auto 60px;
  padding: 40px 20px;
  background: rgba(11, 20, 35, 0.5);
  border: 1px solid rgba(78, 106, 156, 0.25);
  border-radius: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`,yo=v.div`
  background: linear-gradient(135deg, rgba(26, 63, 117, 0.35), rgba(78, 106, 156, 0.15));
  border: 2px solid rgba(78, 106, 156, 0.4);
  border-radius: 8px;
  padding: 16px 24px;
  min-width: 160px;
  text-align: center;
`,wo=v.span`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C9DBE9;
`,xl=v.div`
  font-size: 1.5rem;
  color: #90B0C7;
  font-weight: bold;

  @media (max-width: 768px) {
    transform: rotate(90deg);
  }
`,N1=v.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
`,z1=v.div`
  background: rgba(11, 20, 35, 0.6);
  border: 1px solid rgba(78, 106, 156, 0.25);
  border-radius: 8px;
  padding: 24px;
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #90B0C7;
    background: rgba(26, 63, 117, 0.2);
  }
`,R1=v.span`
  font-size: 1.5rem;
  color: #90B0C7;
  font-weight: 700;
  flex-shrink: 0;
`,T1=v.p`
  font-size: 0.95rem;
  color: #d0d0d0;
  line-height: 1.6;
  margin: 0;
`,P1=()=>{const[e,t]=U.useState(0),n=[{title:"Flatmates' wifi",payers:"Three flatmates",payees:"The wifi provider",stages:"12 monthly stages"},{title:"Freelance work",payers:"The client",payees:"The freelancer",stages:"Design, development, launch"},{title:"House construction",payers:"The owner",payees:"Mason, plumber, electrician",stages:"One per trade"},{title:"Company bonus",payers:"The company",payees:"Employees",stages:"One per person"}],r=n[e];return s.jsxs(A1,{id:"use-cases",children:[s.jsx(M1,{children:"One vault. Every kind of deal."}),s.jsx($1,{children:n.map((o,i)=>s.jsx(L1,{isActive:e===i,onClick:()=>t(i),children:s.jsx(I1,{children:o.title})},i))}),s.jsxs(H1,{children:[s.jsxs(yl,{children:[s.jsx(wl,{children:"Payers"}),s.jsx(kl,{children:r.payers})]}),s.jsxs(yl,{children:[s.jsx(wl,{children:"Payees"}),s.jsx(kl,{children:r.payees})]}),s.jsxs(yl,{children:[s.jsx(wl,{children:"Stages"}),s.jsx(kl,{children:r.stages})]})]})]})},A1=v.section`
  position: relative;
  z-index: 5;
  padding: 80px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-bottom: 1px solid rgba(78, 106, 156, 0.2);
`,M1=v.h2`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #ffffff;
  text-align: center;
  margin: 0 0 60px 0;
`,$1=v.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 40px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    gap: 12px;
  }
`,L1=v.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${e=>e.isActive?"linear-gradient(135deg, rgba(26, 63, 117, 0.5), rgba(78, 106, 156, 0.2))":"rgba(11, 20, 35, 0.5)"};
  border: 2px solid ${e=>e.isActive?"#90B0C7":"rgba(78, 106, 156, 0.25)"};
  border-radius: 8px;
  color: ${e=>e.isActive?"#C9DBE9":"#8A9EB2"};
  font-family: 'Anton', Impact, sans-serif;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #C9DBE9;
    color: #ffffff;
  }
`,I1=v.span`
  @media (min-width: 600px) {
    display: inline;
  }
`,H1=v.div`
  background: linear-gradient(135deg, rgba(11, 20, 35, 0.8), rgba(26, 63, 117, 0.2));
  border: 2px solid rgba(78, 106, 156, 0.3);
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0.8;
    }
    to {
      opacity: 1;
    }
  }
`,yl=v.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 24px;
  padding: 24px 0;
  border-bottom: 1px solid rgba(78, 106, 156, 0.15);
  align-items: start;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`,wl=v.span`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #90B0C7;
`,kl=v.span`
  font-size: 1rem;
  color: #d0d0d0;
  line-height: 1.6;
`,O1=()=>{const e=[{title:"Payers",does:"Put money in, approve or dispute",cannot:"Release money alone (needs more than half)"},{title:"Payees",does:"Mark stages done, get paid",cannot:"Approve their own work"},{title:"Judge",does:"Settles disputes: pay or refund",cannot:"Ever take the money"}];return s.jsxs(b1,{id:"roles",children:[s.jsx(D1,{children:e.map((t,n)=>s.jsxs(V1,{children:[s.jsx(F1,{children:t.title}),s.jsxs(fc,{children:[s.jsx(pc,{children:"Does"}),s.jsxs(hc,{children:["✓ ",t.does]})]}),s.jsxs(fc,{children:[s.jsx(pc,{children:"Cannot"}),s.jsxs(hc,{children:["✗ ",t.cannot]})]})]},n))}),s.jsx(B1,{children:"A judge who cannot be paid with your own funds."})]})},b1=v.section`
  position: relative;
  z-index: 5;
  padding: 80px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-bottom: 1px solid rgba(78, 106, 156, 0.2);
`,D1=v.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto 60px;

  @media (max-width: 768px) {
    gap: 24px;
  }
`,V1=v.div`
  background: linear-gradient(135deg, rgba(11, 20, 35, 0.8), rgba(26, 63, 117, 0.2));
  border: 2px solid rgba(78, 106, 156, 0.3);
  border-radius: 12px;
  padding: 32px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #90B0C7;
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(26, 63, 117, 0.3);
  }
`,F1=v.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C9DBE9;
  margin: 0 0 28px 0;
`,fc=v.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`,pc=v.span`
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #90B0C7;
  letter-spacing: 0.08em;
  font-weight: 700;
  margin-bottom: 8px;
`,hc=v.p`
  font-size: 0.95rem;
  color: #d0d0d0;
  line-height: 1.6;
  margin: 0;
`,B1=v.p`
  text-align: center;
  font-size: 1.1rem;
  color: #d0d0d0;
  margin: 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
  line-height: 1.6;
  font-weight: 500;
`,U1=()=>{const e=["Solidity 0.8.28","OpenZeppelin","Hardhat","ethers.js","Node.js","Express","Claude"];return s.jsxs(W1,{id:"tech-depth",children:[s.jsx(G1,{children:"Built with depth"}),s.jsxs(Y1,{children:[s.jsxs(Z1,{children:[s.jsx(Q1,{children:"Architecture"}),s.jsx(K1,{children:s.jsxs("svg",{viewBox:"0 0 400 300",preserveAspectRatio:"xMidYMid meet",children:[s.jsx("rect",{x:"20",y:"20",width:"80",height:"40",fill:"rgba(26, 63, 117, 0.25)",stroke:"#4E6A9C",strokeWidth:"2",rx:"4"}),s.jsx("text",{x:"60",y:"45",textAnchor:"middle",fill:"#C9DBE9",fontSize:"12",fontWeight:"bold",children:"Client"}),s.jsx("line",{x1:"60",y1:"60",x2:"60",y2:"100",stroke:"#4E6A9C",strokeWidth:"2",markerEnd:"url(#arrowBlue)"}),s.jsx("rect",{x:"20",y:"100",width:"80",height:"40",fill:"rgba(26, 63, 117, 0.25)",stroke:"#4E6A9C",strokeWidth:"2",rx:"4"}),s.jsx("text",{x:"60",y:"125",textAnchor:"middle",fill:"#C9DBE9",fontSize:"12",fontWeight:"bold",children:"Express"}),s.jsx("line",{x1:"100",y1:"120",x2:"160",y2:"120",stroke:"#4E6A9C",strokeWidth:"2",markerEnd:"url(#arrowBlue)"}),s.jsx("rect",{x:"160",y:"100",width:"80",height:"40",fill:"rgba(26, 63, 117, 0.25)",stroke:"#4E6A9C",strokeWidth:"2",rx:"4"}),s.jsx("text",{x:"200",y:"125",textAnchor:"middle",fill:"#C9DBE9",fontSize:"11",fontWeight:"bold",children:"Deal Checker"}),s.jsx("line",{x1:"240",y1:"120",x2:"300",y2:"120",stroke:"#4E6A9C",strokeWidth:"2",markerEnd:"url(#arrowBlue)"}),s.jsx("rect",{x:"300",y:"100",width:"80",height:"40",fill:"rgba(26, 63, 117, 0.25)",stroke:"#4E6A9C",strokeWidth:"2",rx:"4"}),s.jsx("text",{x:"340",y:"125",textAnchor:"middle",fill:"#C9DBE9",fontSize:"12",fontWeight:"bold",children:"JSON"}),s.jsx("line",{x1:"60",y1:"140",x2:"60",y2:"180",stroke:"#90B0C7",strokeWidth:"2",markerEnd:"url(#arrowIce)"}),s.jsx("rect",{x:"20",y:"180",width:"80",height:"40",fill:"rgba(78, 106, 156, 0.2)",stroke:"#90B0C7",strokeWidth:"2",rx:"4"}),s.jsx("text",{x:"60",y:"205",textAnchor:"middle",fill:"#90B0C7",fontSize:"12",fontWeight:"bold",children:"Hardhat"}),s.jsx("line",{x1:"100",y1:"200",x2:"160",y2:"200",stroke:"#90B0C7",strokeWidth:"2",markerEnd:"url(#arrowIce)"}),s.jsx("rect",{x:"160",y:"180",width:"80",height:"40",fill:"rgba(78, 106, 156, 0.2)",stroke:"#90B0C7",strokeWidth:"2",rx:"4"}),s.jsx("text",{x:"200",y:"205",textAnchor:"middle",fill:"#90B0C7",fontSize:"11",fontWeight:"bold",children:"MilestoneVault"}),s.jsxs("defs",{children:[s.jsx("marker",{id:"arrowBlue",markerWidth:"10",markerHeight:"10",refX:"9",refY:"3",orient:"auto",markerUnits:"strokeWidth",children:s.jsx("path",{d:"M0,0 L0,6 L9,3 z",fill:"#4E6A9C"})}),s.jsx("marker",{id:"arrowIce",markerWidth:"10",markerHeight:"10",refX:"9",refY:"3",orient:"auto",markerUnits:"strokeWidth",children:s.jsx("path",{d:"M0,0 L0,6 L9,3 z",fill:"#90B0C7"})})]})]})})]}),s.jsxs(X1,{children:[s.jsx(J1,{children:"Tech Stack"}),s.jsx(q1,{children:e.map((t,n)=>s.jsx(ev,{children:t},n))}),s.jsx(tv,{children:"Quickstart"}),s.jsxs(nv,{children:[s.jsx(ko,{children:"npm install"}),s.jsx(ko,{children:"npm test"}),s.jsx(ko,{children:"npm run demo"}),s.jsx(ko,{children:"npm start"})]}),s.jsxs(rv,{children:[s.jsx(mc,{as:"a",href:"https://github.com/Atharvchaskar008/Vortexa-3.0.git",target:"_blank",rel:"noopener noreferrer",children:"View on GitHub"}),s.jsx(mc,{secondary:!0,children:"Read the README"})]})]})]})]})},W1=v.section`
  position: relative;
  z-index: 5;
  padding: 80px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-bottom: 1px solid rgba(78, 106, 156, 0.2);
`,G1=v.h2`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #ffffff;
  text-align: center;
  margin: 0 0 60px 0;
`,Y1=v.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`,Z1=v.div`
  background: rgba(11, 20, 35, 0.6);
  border: 1px solid rgba(78, 106, 156, 0.25);
  border-radius: 12px;
  padding: 32px;
`,Q1=v.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  margin: 0 0 24px 0;
  text-align: center;
`,K1=v.div`
  svg {
    max-width: 100%;
    height: auto;
  }
`,X1=v.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`,J1=v.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  margin: 0;
`,q1=v.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`,ev=v.span`
  background: linear-gradient(135deg, rgba(26, 63, 117, 0.35), rgba(78, 106, 156, 0.15));
  border: 1px solid rgba(78, 106, 156, 0.35);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.85rem;
  color: #C9DBE9;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`,tv=v.h4`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  margin: 0;
`,nv=v.div`
  background: rgba(11, 20, 35, 0.85);
  border: 1px solid rgba(78, 106, 156, 0.25);
  border-radius: 8px;
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #90B0C7;
`,ko=v.div`
  padding: 4px 0;
  
  &::before {
    content: '$ ';
    color: #666;
  }
`,rv=v.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`,mc=v.a`
  padding: 12px 24px;
  background: ${e=>e.secondary?"transparent":"#1A3F75"};
  color: ${e=>e.secondary?"#C9DBE9":"#ffffff"};
  border: ${e=>e.secondary?"2px solid #4E6A9C":"none"};
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    ${e=>e.secondary?"background: rgba(78, 106, 156, 0.2); border-color: #90B0C7;":"background: #255598; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(78, 106, 156, 0.4);"}
  }
`,ov=()=>{const e=["Funds are simulated. No real UPI or bank connection.","It controls when money moves, not whether the work gets done.","People still decide: a person approves, a person judges.","It does not replace a legal contract."];return s.jsxs(iv,{id:"limits",children:[s.jsx(lv,{children:"What Settl is not"}),s.jsx(sv,{children:"Radical transparency"}),s.jsx(av,{children:e.map((t,n)=>s.jsxs(uv,{children:[s.jsx(cv,{children:"→"}),s.jsx(dv,{children:t})]},n))})]})},iv=v.section`
  position: relative;
  z-index: 5;
  padding: 80px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-bottom: 1px solid rgba(78, 106, 156, 0.2);
`,lv=v.h2`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #ffffff;
  text-align: center;
  margin: 0 0 12px 0;
`,sv=v.p`
  font-size: 1rem;
  color: #999;
  text-align: center;
  margin: 0 0 60px 0;
  font-style: italic;
  font-weight: 400;
`,av=v.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`,uv=v.div`
  background: rgba(11, 20, 35, 0.6);
  border-left: 3px solid rgba(78, 106, 156, 0.5);
  border-radius: 4px;
  padding: 24px;
  display: flex;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    border-left-color: #90B0C7;
    background: rgba(26, 63, 117, 0.2);
  }
`,cv=v.span`
  font-size: 1.5rem;
  color: #90B0C7;
  font-weight: bold;
  flex-shrink: 0;
  line-height: 1.4;
`,dv=v.p`
  font-size: 0.95rem;
  color: #d0d0d0;
  line-height: 1.6;
  margin: 0;
`,fv=()=>{const e=[{level:"1",title:"Small group",description:"A few payers, payees, one judge",note:"This project"},{level:"2",title:"Small business",description:"One firm, many deals",note:"A new vault per deal"},{level:"3",title:"Company",description:"Teams instead of people",note:"Multi-manager approval, panel of judges"},{level:"4",title:"Large enterprise",description:"Contractor with subcontractors",note:"Vaults that pay into vaults, inspector sign-off"}],t=["Walk-away stake","Penalty deposits","Real rupee payments","Licensed partner integration"];return s.jsxs(pv,{id:"roadmap",children:[s.jsx(hv,{children:"Roadmap"}),s.jsx(mv,{children:e.map((n,r)=>s.jsxs(gv,{delay:r*.1,children:[s.jsx(vv,{children:n.level}),s.jsx(xv,{children:n.title}),s.jsx(yv,{children:n.description}),s.jsx(wv,{children:n.note})]},r))}),s.jsxs(kv,{children:[s.jsx(Sv,{children:"Later ideas"}),s.jsx(Cv,{children:t.map((n,r)=>s.jsx(jv,{children:n},r))})]})]})},pv=v.section`
  position: relative;
  z-index: 5;
  padding: 80px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-bottom: 1px solid rgba(78, 106, 156, 0.2);
`,hv=v.h2`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #ffffff;
  text-align: center;
  margin: 0 0 60px 0;
`,mv=v.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto 60px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`,gv=v.div`
  background: linear-gradient(135deg, rgba(11, 20, 35, 0.8), rgba(26, 63, 117, 0.2));
  border: 2px solid rgba(78, 106, 156, 0.3);
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease ${e=>e.delay}s both;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    border-color: #90B0C7;
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(26, 63, 117, 0.3);
  }
`,vv=v.div`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(90deg, #90B0C7, #C9DBE9);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 16px;
`,xv=v.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #ffffff;
  margin: 0 0 12px 0;
`,yv=v.p`
  font-size: 0.9rem;
  color: #b0b0b0;
  line-height: 1.6;
  margin: 0 0 16px 0;
`,wv=v.p`
  font-size: 0.8rem;
  color: #90B0C7;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`,kv=v.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px;
  background: rgba(26, 63, 117, 0.15);
  border: 1px solid rgba(78, 106, 156, 0.35);
  border-radius: 12px;
`,Sv=v.h3`
  font-family: 'Anton', Impact, sans-serif;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #C9DBE9;
  margin: 0 0 24px 0;
  text-align: center;
`,Cv=v.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
`,jv=v.span`
  background: rgba(26, 63, 117, 0.3);
  border: 1px solid rgba(78, 106, 156, 0.4);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.85rem;
  color: #C9DBE9;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`,Ev=()=>s.jsx(_v,{id:"demo",children:s.jsxs(Nv,{children:[s.jsx(zv,{children:"Stop trusting. Start settling."}),s.jsxs(Rv,{children:[s.jsx(Tv,{href:di,children:"Run the demo"}),s.jsx(Pv,{href:"https://github.com/Atharvchaskar008/Vortexa-3.0.git",target:"_blank",rel:"noopener noreferrer",children:"Read the code"})]}),s.jsx(Av,{children:"Built for VORTEXA 3.0, problem B-03 MilestoneVault."})]})}),_v=v.section`
  position: relative;
  z-index: 5;
  padding: 120px 20px;
  background: rgba(0, 0, 42, 0.3);
  border-bottom: 1px solid rgba(78, 106, 156, 0.2);
`,Nv=v.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`,zv=v.h2`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
`,Rv=v.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`,lp=v.a`
  padding: 16px 40px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`,Tv=v(lp)`
  background: #1A3F75;
  color: #ffffff;

  &:hover {
    background: #255598;
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(78, 106, 156, 0.4);
  }
`,Pv=v(lp)`
  background: transparent;
  color: #C9DBE9;
  border: 2px solid #4E6A9C;

  &:hover {
    background: rgba(78, 106, 156, 0.2);
    border-color: #90B0C7;
    transform: translateY(-2px);
  }
`,Av=v.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  font-style: italic;
`,gc=({href:e="#demo",children:t="Run the demo",className:n="",onClick:r})=>s.jsx(Mv,{href:e,className:n,onClick:r,children:s.jsx("div",{className:"wrap",children:s.jsxs("p",{children:[s.jsx("span",{className:"sparkle-idle",children:"✧"}),s.jsx("span",{className:"sparkle-hover",children:"✦"}),t]})})}),Mv=v.a`
  --white: #C9DBE9;
  --bg: #091326;
  --radius: 100px;

  /* Hidden on mobile, inline-flex on md+ (matches original hidden md:inline-flex) */
  display: none;
  @media (min-width: 768px) {
    display: inline-flex;
  }

  align-items: center;
  justify-content: center;
  text-decoration: none;
  outline: none;
  cursor: pointer;
  border: 1px solid rgba(78, 106, 156, 0.4);
  position: relative;
  border-radius: var(--radius);
  background-color: var(--bg);
  transition: all 0.2s ease;
  box-shadow:
    inset 0 0.2rem 0.6rem rgba(201, 219, 233, 0.25),
    inset 0 -0.08rem 0.25rem rgba(0, 0, 42, 0.8),
    inset 0 -0.3rem 0.6rem rgba(78, 106, 156, 0.4),
    0 0.8rem 1.8rem rgba(0, 0, 42, 0.6),
    0 0.3rem 0.6rem -0.2rem rgba(26, 63, 117, 0.5);

  .wrap {
    font-size: 13.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: #C9DBE9;
    padding: 9px 24px;
    border-radius: inherit;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .wrap p {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    transition: all 0.2s ease;
    transform: translateY(2%);
    mask-image: linear-gradient(to bottom, white 40%, transparent);
    -webkit-mask-image: linear-gradient(to bottom, white 40%, transparent);
  }

  .wrap p span.sparkle-hover {
    display: none;
  }

  &:hover .wrap p span.sparkle-idle {
    display: none;
  }

  &:hover .wrap p span.sparkle-hover {
    display: inline-block;
  }

  .wrap::before,
  .wrap::after {
    content: '';
    position: absolute;
    transition: all 0.3s ease;
  }

  .wrap::before {
    left: -15%;
    right: -15%;
    bottom: 25%;
    top: -100%;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.12);
  }

  .wrap::after {
    left: 6%;
    right: 6%;
    top: 12%;
    bottom: 40%;
    border-radius: 22px 22px 0 0;
    box-shadow: inset 0 10px 8px -10px rgba(255, 255, 255, 0.8);
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.3) 0%,
      rgba(0, 0, 0, 0) 50%,
      rgba(0, 0, 0, 0) 100%
    );
  }

  &:hover {
    box-shadow:
      inset 0 0.2rem 0.4rem rgba(255, 255, 255, 0.4),
      inset 0 -0.08rem 0.25rem rgba(0, 0, 0, 0.7),
      inset 0 -0.3rem 0.6rem rgba(255, 255, 255, 0.7),
      0 1.2rem 2rem rgba(0, 0, 0, 0.3),
      0 0.5rem 0.8rem -0.3rem rgba(0, 0, 0, 0.8);
  }

  &:hover .wrap::before {
    transform: translateY(-5%);
  }

  &:hover .wrap::after {
    opacity: 0.4;
    transform: translateY(5%);
  }

  &:hover .wrap p {
    transform: translateY(-4%);
    color: #ffffff;
  }

  &:active {
    transform: translateY(2px);
    box-shadow:
      inset 0 0.2rem 0.4rem rgba(255, 255, 255, 0.5),
      inset 0 -0.08rem 0.25rem rgba(0, 0, 0, 0.8),
      inset 0 -0.3rem 0.6rem rgba(255, 255, 255, 0.4),
      0 1.2rem 2rem rgba(0, 0, 0, 0.3),
      0 0.5rem 0.8rem -0.3rem rgba(0, 0, 0, 0.8);
  }
`,$v=()=>{const e=U.useRef(null);U.useEffect(()=>{if(!e.current)return;const h=2,m=`
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`,g=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uHover;
uniform vec3  uBg;
uniform vec3  uBase;
uniform vec3  uAccent;
uniform vec3  uHigh;
uniform float uSlats;
uniform float uFrost;
uniform float uRefract;
uniform float uEdge;
uniform float uGrain;

float sat(float x) { return clamp(x, 0.0, 1.0); }

float h21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 34.56);
    return fract(p.x * p.y);
}

float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = h21(i), b = h21(i + vec2(1.0, 0.0));
    float c = h21(i + vec2(0.0, 1.0)), d = h21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm5(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
    return s;
}

float fbm3(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.07 + vec2(4.1, 2.3); a *= 0.5; }
    return s;
}

vec3 behind(vec2 uv, float t) {
    float a = fbm5(vec2(uv.x * 3.2, t * 0.05));
    float b = fbm3(vec2(uv.x * 9.0 + 4.1, t * 0.07));
    float prof = exp(-pow((uv.y - 0.52) / 0.42, 2.0));
    float amber = sat((b - 0.62) * 4.0) * sat(a * 1.5 - 0.30);
    vec3 c = mix(uBase, uAccent, sat(a * 1.5 - 0.20));
    c = mix(c, uHigh, amber * 0.85);
    return c * prof * (0.35 + 1.25 * pow(sat(a * 1.2 + b * 0.5 - 0.32), 1.4));
}

void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float t = uTime;
    float warp = 0.05 * fbm3(vec2(uv.x * 2.2, 7.0));
    float sx = (uv.x + warp) * uSlats;
    float si = floor(sx), sf = fract(sx);
    float rnd = h21(vec2(si * 0.317, 1.0));
    float rnd2 = h21(vec2(si * 0.713, 5.0));
    float shift = (rnd - 0.5) * uRefract * 0.10;
    vec3 lit = behind(vec2(uv.x + shift, uv.y), t);
    vec3 soft = vec3(0.0);
    for (int k = 0; k < 5; k++) {
        float o = (float(k) - 2.0) * uFrost * 0.020;
        soft += behind(vec2(uv.x + shift + o, uv.y + o * 0.4), t);
    }
    soft *= 0.2;
    vec2 wd = uv - uMouse;
    wd.x *= uRes.x / uRes.y;
    float wipe = uHover * exp(-dot(wd, wd) * 8.0);
    vec3 col = uBg + mix(lit, soft, clamp(0.80 - wipe, 0.0, 0.80)) * (0.55 + 0.85 * rnd2);
    col *= 1.0 + wipe * 0.22;
    float edge = min(sf, 1.0 - sf);
    col += mix(uAccent, vec3(1.0), 0.35) * exp(-edge / 0.030) * 0.30 * uEdge;
    col *= 0.86 + 0.28 * smoothstep(0.0, 0.20, edge);
    col *= 1.0 - 0.40 * pow(sat(abs(uv.y - 0.5) * 2.0), 2.4);
    col += (h21(gl_FragCoord.xy + fract(uTime) * 37.0) - 0.5) * uGrain;
    gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`,k=(D,$)=>{if(!D)return $;const ae=String(D).trim();if(ae.charAt(0)==="#"){let b=ae.slice(1);if((b.length===3||b.length===4)&&(b=b[0]+b[0]+b[1]+b[1]+b[2]+b[2]),b.length>=6){const R=parseInt(b.slice(0,2),16),E=parseInt(b.slice(2,4),16),A=parseInt(b.slice(4,6),16);if(!isNaN(R)&&!isNaN(E)&&!isNaN(A))return[R/255,E/255,A/255]}}return $},x=(D,$,ae)=>{const b=D.createShader($);return b?(D.shaderSource(b,ae),D.compileShader(b),D.getShaderParameter(b,D.COMPILE_STATUS)?b:(console.error("FrostedVeil shader:",D.getShaderInfoLog(b)),D.deleteShader(b),null)):null},S=e.current,_=S.getContext("webgl",{antialias:!1,alpha:!1,depth:!1});if(!_){console.error("FrostedVeil: WebGL unavailable");return}const p=x(_,_.VERTEX_SHADER,m),c=x(_,_.FRAGMENT_SHADER,g);if(!p||!c)return;const f=_.createProgram();if(_.attachShader(f,p),_.attachShader(f,c),_.linkProgram(f),!_.getProgramParameter(f,_.LINK_STATUS)){console.error("FrostedVeil link:",_.getProgramInfoLog(f));return}_.useProgram(f);const y=_.createBuffer();_.bindBuffer(_.ARRAY_BUFFER,y),_.bufferData(_.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),_.STATIC_DRAW);const j=_.getAttribLocation(f,"a_pos");_.enableVertexAttribArray(j),_.vertexAttribPointer(j,2,_.FLOAT,!1,0,0);const N={},w=D=>(D in N||(N[D]=_.getUniformLocation(f,D)),N[D]);let C=performance.now(),M=0;const T={x:.5,y:.5,tx:.5,ty:.5,on:0,onTarget:0},F=D=>{const $=Math.min(.05,(D-C)/1e3);C=D,M=(M+$*1)%3600;const ae=1-Math.exp(-6*$);T.on+=(T.onTarget-T.on)*ae,T.x+=((T.onTarget>0?T.tx:.5)-T.x)*ae,T.y+=((T.onTarget>0?T.ty:.5)-T.y)*ae;const b=Math.min(window.devicePixelRatio||1,h),R=S.clientWidth||1200,E=S.clientHeight||800,A=Math.max(1,Math.round(R*b)),H=Math.max(1,Math.round(E*b));(S.width!==A||S.height!==H)&&(S.width=A,S.height=H),_.viewport(0,0,A,H),_.uniform2f(w("uRes"),A,H),_.uniform1f(w("uTime"),M),_.uniform2f(w("uMouse"),T.x,1-T.y),_.uniform1f(w("uHover"),Math.min(1,T.on)*.99);const I=k("#00002A",[0,0,.165]),te=k("#1A3F75",[.102,.247,.459]),Q=k("#4E6A9C",[.306,.416,.612]),K=k("#C9DBE9",[.788,.859,.914]);_.uniform3f(w("uBg"),I[0],I[1],I[2]),_.uniform3f(w("uBase"),te[0],te[1],te[2]),_.uniform3f(w("uAccent"),Q[0],Q[1],Q[2]),_.uniform3f(w("uHigh"),K[0],K[1],K[2]),_.uniform1f(w("uSlats"),60),_.uniform1f(w("uFrost"),3),_.uniform1f(w("uRefract"),3),_.uniform1f(w("uEdge"),1.5),_.uniform1f(w("uGrain"),.05),_.drawArrays(_.TRIANGLES,0,3),requestAnimationFrame(F)},Y=D=>{const $=S.getBoundingClientRect();$.width<=0||$.height<=0||(T.tx=Math.max(0,Math.min(1,(D.clientX-$.left)/$.width)),T.ty=Math.max(0,Math.min(1,(D.clientY-$.top)/$.height)),T.onTarget=1)},Z=()=>{T.onTarget=0};return S.addEventListener("pointermove",Y),S.addEventListener("pointerenter",Y),S.addEventListener("pointerleave",Z),requestAnimationFrame(F),()=>{S.removeEventListener("pointermove",Y),S.removeEventListener("pointerenter",Y),S.removeEventListener("pointerleave",Z)}},[]);const t=[{id:"home",label:"Home"},{id:"how-it-works",label:"How it works"},{id:"security",label:"Security"},{id:"use-cases",label:"Use cases"},{id:"team",label:"Team"}],[n,r]=U.useState("home"),[o,i]=U.useState(!1),[l,a]=U.useState(!1),u=(h,m=800)=>{const g=window.pageYOffset||document.documentElement.scrollTop||window.scrollY||0,k=h-g;if(Math.abs(k)<2)return;const x=performance.now(),S=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2,_=p=>{const c=p-x,f=Math.min(c/m,1),y=S(f);window.scrollTo(0,g+k*y),f<1&&requestAnimationFrame(_)};requestAnimationFrame(_)},d=(h,m)=>{if(h&&h.preventDefault&&h.preventDefault(),a(!1),!m||m==="#"||m==="#home"){r("home"),u(0,750),window.history.pushState(null,"","#home");return}const g=m.startsWith("#")?m.slice(1):m,k=document.getElementById(g);if(k){r(g);const x=72,S=window.pageYOffset||document.documentElement.scrollTop||window.scrollY||0,_=k.getBoundingClientRect().top+S,p=Math.max(0,_-x);u(p,800),window.history.pushState(null,"",`#${g}`),k.classList.remove("section-scroll-highlight"),k.offsetWidth,k.classList.add("section-scroll-highlight"),setTimeout(()=>{k.classList.remove("section-scroll-highlight")},1500)}};return U.useEffect(()=>{const h=()=>{const m=window.pageYOffset||document.documentElement.scrollTop||window.scrollY||0;i(m>25);const g=["home","how-it-works","security","use-cases","team","demo"],k=130;for(let x=g.length-1;x>=0;x--){const S=g[x],_=document.getElementById(S);if(_&&_.getBoundingClientRect().top<=k){r(S==="demo"?"demo":S);break}}};return window.addEventListener("scroll",h,{passive:!0}),h(),()=>window.removeEventListener("scroll",h)},[]),U.useEffect(()=>{const h=m=>{const g=m.target.closest('a[href^="#"]');if(g){const k=g.getAttribute("href");k&&k.startsWith("#")&&k.length>1&&(m.preventDefault(),d(m,k))}};return document.addEventListener("click",h),()=>document.removeEventListener("click",h)},[]),s.jsxs(s.Fragment,{children:[s.jsx(fg,{}),s.jsxs(Lv,{children:[s.jsx(Iv,{ref:e}),s.jsx(Hv,{children:s.jsxs(Ov,{className:`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${o?"bg-[#00002A]/90 backdrop-blur-xl border-b border-[#4E6A9C]/40 shadow-[0_10px_32px_rgba(0,0,25,0.7)]":"bg-[#00002A]/45 backdrop-blur-md border-b border-slate-800/35"}`,children:[s.jsxs("div",{className:"max-w-6xl mx-auto px-6 h-16 flex items-center justify-between",children:[s.jsx("div",{className:"flex items-center gap-2 ml-0",children:s.jsx("a",{className:"flex items-center gap-2 cursor-pointer group",href:"#home",onClick:h=>d(h,"#home"),children:s.jsx("span",{className:"text-xl font-bold tracking-tight uppercase transition-colors group-hover:text-white",style:{color:"#C9DBE9"},children:"SETTLE"})})}),s.jsx("div",{className:"hidden md:flex flex-col items-center relative flex-1 justify-center",children:s.jsxs("div",{className:"flex items-center gap-1.5 lg:gap-2.5 bg-black/25 px-2 py-1 rounded-full border border-slate-800/50 backdrop-blur-sm",children:[t.map(h=>{const m=n===h.id;return s.jsxs("a",{href:`#${h.id}`,onClick:g=>d(g,`#${h.id}`),className:`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${m?"text-[#C9DBE9] bg-[#1A3F75]/75 shadow-[0_0_16px_rgba(78,106,156,0.5)] border border-[#4E6A9C]":"text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent"}`,children:[s.jsx("span",{children:h.label}),m&&s.jsx("span",{className:"absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-[2px] bg-[#90B0C7] rounded-full shadow-[0_0_6px_#C9DBE9]"})]},h.id)}),s.jsx("a",{href:"https://github.com/Atharvchaskar008/Vortexa-3.0.git",target:"_blank",rel:"noopener noreferrer",className:"px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-full transition-all duration-200 border border-transparent",children:"Docs"})]})}),s.jsx(gc,{href:di,children:"Run the demo"}),s.jsx("button",{onClick:()=>a(h=>!h),"aria-label":"Toggle navigation menu",className:"md:hidden p-2 text-gray-400 hover:text-white transition-colors",children:s.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:"w-5 h-5",children:l?s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M18 6L6 18"}),s.jsx("path",{d:"M6 6l12 12"})]}):s.jsxs(s.Fragment,{children:[s.jsx("path",{d:"M4 6h16"}),s.jsx("path",{d:"M4 12h16"}),s.jsx("path",{d:"M4 18h16"})]})})})]}),l&&s.jsxs("div",{className:"md:hidden bg-[#00002A]/98 backdrop-blur-2xl border-b border-[#4E6A9C]/40 px-6 py-5 flex flex-col gap-2.5 shadow-2xl",children:[t.map(h=>{const m=n===h.id;return s.jsxs("a",{href:`#${h.id}`,onClick:g=>d(g,`#${h.id}`),className:`px-4 py-2.5 text-base font-medium rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between ${m?"text-[#C9DBE9] bg-[#1A3F75]/60 border border-[#4E6A9C]/60 shadow-[0_0_12px_rgba(26,63,117,0.4)]":"text-slate-300 hover:text-white hover:bg-slate-800/40"}`,children:[s.jsx("span",{children:h.label}),m&&s.jsx("span",{className:"w-2 h-2 rounded-full bg-[#90B0C7] shadow-[0_0_6px_#C9DBE9]"})]},h.id)}),s.jsx("a",{href:"https://github.com/Atharvchaskar008/Vortexa-3.0.git",target:"_blank",rel:"noopener noreferrer",className:"px-4 py-2.5 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-xl transition-colors",children:"Docs"}),s.jsx("div",{className:"pt-2",children:s.jsx(gc,{href:di,children:"Run the demo"})})]})]})}),s.jsx(Cg,{}),s.jsx(Lg,{}),s.jsx(g1,{}),s.jsx(Yg,{}),s.jsx(C1,{}),s.jsx(P1,{}),s.jsx(O1,{}),s.jsx(U1,{}),s.jsx(ov,{}),s.jsx(fv,{}),s.jsx(Ev,{}),s.jsxs(bv,{id:"team",children:[s.jsx(Dv,{children:"The people behind the vault"}),s.jsx(eg,{})]})]}),s.jsx(pg,{})]})},Lv=v.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #00002A;
  overflow-x: clip;
`,Iv=v.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  filter: blur(3px);
  display: block;
`,Hv=v.div`
  position: relative;
  z-index: 10;
`,Ov=v.nav`
  a, button {
    cursor: pointer;
  }
`,bv=v.div`
  position: relative;
  z-index: 10;
  padding: 100px 20px 60px;
  margin-top: 0;
`,Dv=v.h2`
  font-family: 'Anton', Impact, sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  background: linear-gradient(90deg, #90B0C7, #C9DBE9, #4E6A9C, #90B0C7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
  margin-bottom: 60px;
  margin-top: 0;
`;v.div`
  position: relative;
  z-index: 10;
  min-height: 80vh;
  display: grid;
  place-content: center;
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
  font-size: 1.2rem;
`;const Vv=Sl.createRoot(document.getElementById("root"));Vv.render(s.jsx(Oe.StrictMode,{children:s.jsx($v,{})}));
