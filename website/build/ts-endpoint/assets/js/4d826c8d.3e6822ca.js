"use strict";(self.webpackChunk_ts_endpoint_docs=self.webpackChunk_ts_endpoint_docs||[]).push([[780],{5318:(e,t,r)=>{r.d(t,{Zo:()=>u,kt:()=>m});var n=r(7378);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function c(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var p=n.createContext({}),l=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},u=function(e){var t=l(e.components);return n.createElement(p.Provider,{value:t},e.children)},s="mdxType",f={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,p=e.parentName,u=c(e,["components","mdxType","originalType","parentName"]),s=l(r),d=o,m=s["".concat(p,".").concat(d)]||s[d]||f[d]||a;return r?n.createElement(m,i(i({ref:t},u),{},{components:r})):n.createElement(m,i({ref:t},u))}));function m(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=d;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c[s]="string"==typeof e?e:o,i[1]=c;for(var l=2;l<a;l++)i[l]=r[l];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},6662:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>u,contentTitle:()=>p,default:()=>m,frontMatter:()=>c,metadata:()=>l,toc:()=>s});var n=r(5773),o=r(808),a=(r(7378),r(5318)),i=["components"],c={title:"Adding RSS Support - RSS Truncation Test",author:"Eric Nakagawa",authorURL:"http://twitter.com/ericnakagawa",authorFBID:661277173},p=void 0,l={permalink:"/blog/2017/09/25/testing-rss",source:"@site/blog/2017-09-25-testing-rss.md",title:"Adding RSS Support - RSS Truncation Test",description:"1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890",date:"2017-09-25T00:00:00.000Z",formattedDate:"September 25, 2017",tags:[],readingTime:.065,hasTruncateMarker:!0,authors:[{name:"Eric Nakagawa",url:"http://twitter.com/ericnakagawa"}],frontMatter:{title:"Adding RSS Support - RSS Truncation Test",author:"Eric Nakagawa",authorURL:"http://twitter.com/ericnakagawa",authorFBID:661277173},prevItem:{title:"Adding RSS Support",permalink:"/blog/2017/09/26/adding-rss"},nextItem:{title:"New Blog Post",permalink:"/blog/2017/04/10/blog-post-two"}},u={authorsImageUrls:[void 0]},s=[],f={toc:s},d="wrapper";function m(e){var t=e.components,r=(0,o.Z)(e,i);return(0,a.kt)(d,(0,n.Z)({},f,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,"1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890"),(0,a.kt)("p",null,"This should be truncated."),(0,a.kt)("p",null,"This line should never render in XML."))}m.isMDXComponent=!0}}]);