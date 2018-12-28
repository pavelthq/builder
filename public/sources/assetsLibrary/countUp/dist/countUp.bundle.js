(function(e){var t={};function n(a){if(t[a]){return t[a].exports}var r=t[a]={i:a,l:false,exports:{}};e[a].call(r.exports,r,r.exports,n);r.l=true;return r.exports}n.m=e;n.c=t;n.d=function(e,t,a){if(!n.o(e,t)){Object.defineProperty(e,t,{enumerable:true,get:a})}};n.r=function(e){if(typeof Symbol!=="undefined"&&Symbol.toStringTag){Object.defineProperty(e,Symbol.toStringTag,{value:"Module"})}Object.defineProperty(e,"__esModule",{value:true})};n.t=function(e,t){if(t&1)e=n(e);if(t&8)return e;if(t&4&&typeof e==="object"&&e&&e.__esModule)return e;var a=Object.create(null);n.r(a);Object.defineProperty(a,"default",{enumerable:true,value:e});if(t&2&&typeof e!="string")for(var r in e)n.d(a,r,function(t){return e[t]}.bind(null,r));return a};n.n=function(e){var t=e&&e.__esModule?function t(){return e["default"]}:function t(){return e};n.d(t,"a",t);return t};n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)};n.p=".";return n(n.s=0)})({"./src/countUp.js":function(e,t){(function(e){e.vcCountUp=function(t,n,a,r,i,o){var u=this;u.version=function(){return"1.9.3"};u.options={useEasing:true,useGrouping:true,separator:",",decimal:".",easingFn:d,formattingFn:c,prefix:"",suffix:"",numerals:[]};if(o&&typeof o==="object"){for(var l in u.options){if(o.hasOwnProperty(l)&&o[l]!==null){u.options[l]=o[l]}}}if(u.options.separator===""){u.options.useGrouping=false}else{u.options.separator=""+u.options.separator}var s=0;var f=["webkit","moz","ms","o"];for(var m=0;m<f.length&&!e.requestAnimationFrame;++m){e.requestAnimationFrame=e[f[m]+"RequestAnimationFrame"];e.cancelAnimationFrame=e[f[m]+"CancelAnimationFrame"]||e[f[m]+"CancelRequestAnimationFrame"]}if(!e.requestAnimationFrame){e.requestAnimationFrame=function(t,n){var a=(new Date).getTime();var r=Math.max(0,16-(a-s));var i=e.setTimeout(function(){t(a+r)},r);s=a+r;return i}}if(!e.cancelAnimationFrame){e.cancelAnimationFrame=function(e){clearTimeout(e)}}function c(e){var t=e<0,n,a,r,i,o,l;e=Math.abs(e).toFixed(u.decimals);e+="";n=e.split(".");a=n[0];r=n.length>1?u.options.decimal+n[1]:"";if(u.options.useGrouping){i="";for(o=0,l=a.length;o<l;++o){if(o!==0&&o%3===0){i=u.options.separator+i}i=a[l-o-1]+i}a=i}if(u.options.numerals.length){a=a.replace(/[0-9]/g,function(e){return u.options.numerals[+e]});r=r.replace(/[0-9]/g,function(e){return u.options.numerals[+e]})}return(t?"-":"")+u.options.prefix+a+r+u.options.suffix}function d(e,t,n,a){return n*(-Math.pow(2,-10*e/a)+1)*1024/1023+t}function p(e){return typeof e==="number"&&!isNaN(e)}u.initialize=function(){if(u.initialized){return true}u.error="";u.d=typeof t==="string"?document.getElementById(t):t;if(!u.d){u.error="[CountUp] target is null or undefined";return false}u.startVal=Number(n);u.endVal=Number(a);if(p(u.startVal)&&p(u.endVal)){u.decimals=Math.max(0,r||0);u.dec=Math.pow(10,u.decimals);u.duration=Number(i)*1e3||2e3;u.countDown=u.startVal>u.endVal;u.frameVal=u.startVal;u.initialized=true;return true}else{u.error="[CountUp] startVal ("+n+") or endVal ("+a+") is not a number";return false}};u.printValue=function(e){var t=u.options.formattingFn(e);if(u.d.tagName==="INPUT"){this.d.value=t}else if(u.d.tagName==="text"||u.d.tagName==="tspan"){this.d.textContent=t}else{this.d.innerHTML=t}};u.count=function(e){if(!u.startTime){u.startTime=e}u.timestamp=e;var t=e-u.startTime;u.remaining=u.duration-t;if(u.options.useEasing){if(u.countDown){u.frameVal=u.startVal-u.options.easingFn(t,0,u.startVal-u.endVal,u.duration)}else{u.frameVal=u.options.easingFn(t,u.startVal,u.endVal-u.startVal,u.duration)}}else{if(u.countDown){u.frameVal=u.startVal-(u.startVal-u.endVal)*(t/u.duration)}else{u.frameVal=u.startVal+(u.endVal-u.startVal)*(t/u.duration)}}if(u.countDown){u.frameVal=u.frameVal<u.endVal?u.endVal:u.frameVal}else{u.frameVal=u.frameVal>u.endVal?u.endVal:u.frameVal}u.frameVal=Math.round(u.frameVal*u.dec)/u.dec;u.printValue(u.frameVal);if(t<u.duration){u.rAF=requestAnimationFrame(u.count)}else{if(u.callback){u.callback()}}};u.start=function(e){if(!u.initialize()){return}u.callback=e;u.rAF=requestAnimationFrame(u.count)};u.pauseResume=function(){if(!u.paused){u.paused=true;cancelAnimationFrame(u.rAF)}else{u.paused=false;delete u.startTime;u.duration=u.remaining;u.startVal=u.frameVal;requestAnimationFrame(u.count)}};u.reset=function(){u.paused=false;delete u.startTime;u.initialized=false;if(u.initialize()){cancelAnimationFrame(u.rAF);u.printValue(u.startVal)}};u.update=function(e){if(!u.initialize()){return}e=Number(e);if(!p(e)){u.error="[CountUp] update() - new endVal is not a number: "+e;return}u.error="";if(e===u.frameVal){return}cancelAnimationFrame(u.rAF);u.paused=false;delete u.startTime;u.startVal=u.frameVal;u.endVal=e;u.countDown=u.startVal>u.endVal;u.rAF=requestAnimationFrame(u.count)};if(u.initialize()){u.printValue(u.startVal)}}})(window)},0:function(e,t,n){e.exports=n("./src/countUp.js")}});