// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      AC: Function.prototype.call.bind(DataView.prototype.setUint16),
      AD: x0 => x0.tabIndex,
      AE: (x0,x1) => x0.getComputedStyle(x1),
      AF: x0 => x0.tiltY,
      AG: (x0,x1) => x0.go(x1),
      AH: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      AI: (x0,x1,x2) => x0.insertBefore(x1,x2),
      AJ: x0 => x0.sheet,
      AK: x0 => x0.canvasKitMaximumSurfaces,
      AL: x0 => x0.loader,
      B: s => printToConsole(s),
      BB: b => !!b,
      BC: Function.prototype.call.bind(DataView.prototype.setUint8),
      BD: (x0,x1) => x0.contains(x1),
      BE: x0 => x0.documentElement,
      BF: x0 => x0.tiltX,
      BG: x0 => x0.parentElement,
      BH: x0 => x0.readText(),
      BI: x0 => x0.id,
      BJ: x0 => x0.head,
      BK: x0 => x0.nextSibling,
      BL: () => globalThis._flutter,
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      CC: Function.prototype.call.bind(DataView.prototype.setInt8),
      CD: x0 => x0.activeElement,
      CE: x0 => x0.computedStyleMap(),
      CF: x0 => x0.pointerType,
      CG: (x0,x1) => x0.querySelectorAll(x1),
      CH: x0 => x0.clipboard,
      CI: x0 => x0.offsetHeight,
      CJ: () => globalThis.document,
      CK: (x0,x1) => x0.debug(x1),
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (x0,x1) => x0.focus(x1),
      DC: Function.prototype.call.bind(DataView.prototype.getInt8),
      DD: x0 => x0.parentNode,
      DE: (x0,x1) => x0.get(x1),
      DF: x0 => x0.pointerId,
      DG: (x0,x1) => x0.requestAnimationFrame(x1),
      DH: (x0,x1) => x0.writeText(x1),
      DI: x0 => x0.offsetWidth,
      DJ: (x0,x1,x2) => x0.setItem(x1,x2),
      DK: x0 => x0.hostElement,
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: () => ({}),
      EC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      ED: x0 => x0.tagName,
      EE: (o, p) => p in o,
      EF: x0 => x0.getCoalescedEvents(),
      EG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      EH: x0 => x0.unlock(),
      EI: x0 => x0.stopPropagation(),
      EJ: (x0,x1) => x0.removeItem(x1),
      EK: x0 => x0.location,
      F: () => new Error().stack,
      FB: (o, p, v) => o[p] = v,
      FC: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      FD: x0 => x0.target,
      FE: (x0,x1) => { x0.textContent = x1 },
      FF: (x0,x1) => x0.getModifierState(x1),
      FG: x0 => x0.now(),
      FH: (x0,x1) => x0.lock(x1),
      FI: x0 => x0.disabled,
      FJ: x0 => x0.reload(),
      FK: (x0,x1) => x0.getModifierState(x1),
      G: s => JSON.stringify(s),
      GB: () => [],
      GC: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      GD: x0 => x0.clientY,
      GE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      GF: s => s.trimLeft(),
      GG: x0 => x0.performance,
      GH: x0 => x0.orientation,
      GI: (x0,x1) => { x0.min = x1 },
      GJ: () => globalThis.location,
      GK: x0 => x0.metaKey,
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (a, i) => a.push(i),
      HC: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      HD: x0 => x0.clientX,
      HE: x0 => x0.matches,
      HF: s => s.toUpperCase(),
      HG: (d, digits) => d.toFixed(digits),
      HH: (x0,x1) => x0.querySelector(x1),
      HI: (x0,x1) => { x0.max = x1 },
      HJ: () => globalThis.localStorage,
      HK: x0 => x0.altKey,
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: x0 => new Int8Array(x0),
      IC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      ID: (x0,x1,x2) => x0.setAttribute(x1,x2),
      IE: (x0,x1) => x0.matchMedia(x1),
      IF: (x0,x1) => x0.test(x1),
      IG: x0 => x0.maxHeight,
      IH: (x0,x1) => { x0.title = x1 },
      II: (x0,x1) => { x0.disabled = x1 },
      IJ: (x0,x1) => x0.getItem(x1),
      IK: x0 => x0.ctrlKey,
      J: (s, p, i) => s.lastIndexOf(p, i),
      JB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      JC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      JD: x0 => x0.getBoundingClientRect(),
      JE: x0 => x0.matches,
      JF: (x0,x1) => x0[x1],
      JG: x0 => x0.maxWidth,
      JH: (x0,x1) => x0.vibrate(x1),
      JI: (x0,x1) => { x0.scrollLeft = x1 },
      JJ: x0 => x0.abort(),
      JK: x0 => x0.isComposing,
      K: o => o,
      KB: x0 => new Uint8Array(x0),
      KC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      KD: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      KE: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      KF: x0 => x0.length,
      KG: x0 => x0.minHeight,
      KH: x0 => x0.arrayBuffer(),
      KI: (x0,x1) => { x0.spellcheck = x1 },
      KJ: () => new AbortController(),
      KK: x0 => x0.code,
      L: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      LB: x0 => new Uint8ClampedArray(x0),
      LC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      LD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      LE: f => f.dartFunction,
      LF: x0 => x0.pop(),
      LG: x0 => x0.minWidth,
      LH: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      LI: (x0,x1) => { x0.disabled = x1 },
      LJ: (x0,x1,x2,x3,x4,x5) => ({method: x0,headers: x1,body: x2,credentials: x3,redirect: x4,signal: x5}),
      LK: x0 => x0.repeat,
      M: x0 => x0.index,
      MB: x0 => new Int16Array(x0),
      MC: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      MD: Date.now,
      ME: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      MF: x0 => x0.flags,
      MG: (x0,x1) => x0.removeProperty(x1),
      MH: x0 => x0.status,
      MI: (a, i) => a.splice(i, 1),
      MJ: (x0,x1) => globalThis.fetch(x0,x1),
      MK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      N: o => String(o),
      NB: x0 => new Uint16Array(x0),
      NC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      ND: (handle) => clearTimeout(handle),
      NE: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      NF: (a, s) => a.join(s),
      NG: (x0,x1) => x0.add(x1),
      NH: (x0,x1) => x0.fetch(x1),
      NI: a => a.pop(),
      NJ: (x0,x1) => x0.get(x1),
      NK: x0 => x0.userAgent,
      O: o => o === undefined,
      OB: x0 => new Int32Array(x0),
      OC: (x0,x1) => x0.querySelector(x1),
      OD: (x0,x1) => x0.closest(x1),
      OE: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      OF: (x0,x1) => x0.error(x1),
      OG: x0 => x0.data,
      OH: x0 => x0.content,
      OI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      OJ: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1,x2) { return wasmFunction(f,arguments.length,x0,x1,x2) }),
      OK: x0 => x0.navigator,
      P: (x0,x1) => x0.exec(x1),
      PB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      PC: (x0,x1) => x0.item(x1),
      PD: x0 => x0.bottom,
      PE: (o, i) => o[i],
      PF: () => globalThis.console,
      PG: (x0,x1) => { x0.scrollTop = x1 },
      PH: x0 => x0.document,
      PI: (a, s, e) => a.slice(s, e),
      PJ: (x0,x1) => x0.forEach(x1),
      PK: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      Q: (x0,x1) => { x0.lastIndex = x1 },
      QB: x0 => new Uint32Array(x0),
      QC: x0 => x0.length,
      QD: x0 => x0.top,
      QE: o => o.length,
      QF: s => s.trimRight(),
      QG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      QH: x0 => new Uint8Array(x0),
      QI: x0 => x0.createBufferSource(),
      QJ: x0 => x0.name,
      QK: () => globalThis.window,
      R: o => o,
      RB: x0 => new Float32Array(x0),
      RC: (x0,x1) => x0.querySelectorAll(x1),
      RD: x0 => x0.right,
      RE: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      RF: x0 => x0.blur(),
      RG: (x0,x1) => { x0.value = x1 },
      RH: (x0,x1,x2) => x0.slice(x1,x2),
      RI: (x0,x1) => x0.connect(x1),
      RJ: x0 => x0.statusText,
      RK: (x0,x1) => x0.removeItem(x1),
      S: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      SB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      SC: (x0,x1) => x0.getAttribute(x1),
      SD: x0 => x0.left,
      SE: x0 => x0.language,
      SF: x0 => x0.button,
      SG: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      SH: (x0,x1) => x0.decode(x1),
      SI: (x0,x1,x2) => x0.start(x1,x2),
      SJ: x0 => x0.url,
      SK: x0 => x0.localStorage,
      T: o => o instanceof RegExp,
      TB: x0 => new Float64Array(x0),
      TC: x0 => x0.remove(),
      TD: x0 => x0.clientY,
      TE: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      TF: x0 => x0.innerHeight,
      TG: (x0,x1) => { x0.value = x1 },
      TH: (x0,x1) => x0.adoptText(x1),
      TI: x0 => x0.currentTime,
      TJ: x0 => x0.status,
      TK: (x0,x1) => x0.getItem(x1),
      U: (string, times) => string.repeat(times),
      UB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      UC: (x0,x1) => x0.appendChild(x1),
      UD: x0 => x0.clientX,
      UE: () => globalThis.window.FinalizationRegistry,
      UF: x0 => x0.innerWidth,
      UG: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      UH: x0 => x0.first(),
      UI: x0 => x0.duration,
      UJ: x0 => x0.cancel(),
      UK: (x0,x1) => x0.key(x1),
      V: o => o,
      VB: x0 => new ArrayBuffer(x0),
      VC: (x0,x1) => x0.append(x1),
      VD: x0 => x0.changedTouches,
      VE: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      VF: x0 => x0.height,
      VG: x0 => x0.value,
      VH: x0 => x0.next(),
      VI: (x0,x1) => { x0.loop = x1 },
      VJ: x0 => x0.getReader(),
      VK: x0 => x0.length,
      W: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      WB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      WC: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      WD: x0 => x0.offsetY,
      WE: x0 => new window.FinalizationRegistry(x0),
      WF: x0 => x0.width,
      WG: x0 => x0.selectionDirection,
      WH: x0 => x0.current(),
      WI: (x0,x1) => { x0.buffer = x1 },
      WJ: x0 => x0.read(),
      WK: (x0,x1,x2) => x0.setItem(x1,x2),
      X: x0 => x0.dotAll,
      XB: (x0,x1,x2) => new DataView(x0,x1,x2),
      XC: x0 => x0.style,
      XD: x0 => x0.offsetX,
      XE: (x0,x1) => x0.unregister(x1),
      XF: x0 => x0.clientHeight,
      XG: x0 => x0.selectionStart,
      XH: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      XI: (x0,x1) => { x0.value = x1 },
      XJ: x0 => x0.value,
      XK: x0 => x0.close(),
      Y: x0 => x0.unicode,
      YB: (o, p) => o[p],
      YC: x0 => x0.debugShowSemanticsNodes,
      YD: x0 => x0.type,
      YE: (x0,x1) => x0.contains(x1),
      YF: x0 => x0.clientWidth,
      YG: x0 => x0.selectionEnd,
      YH: x0 => x0.v8BreakIterator,
      YI: x0 => x0.gain,
      YJ: x0 => x0.done,
      YK: x0 => x0.remove(),
      Z: x0 => x0.ignoreCase,
      ZB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      ZC: (x0,x1) => x0.warn(x1),
      ZD: x0 => x0.maxTouchPoints,
      ZE: (s) => +s,
      ZF: (x0,x1) => { x0.content = x1 },
      ZG: x0 => x0.value,
      ZH: () => globalThis.Intl,
      ZI: x0 => x0.createGain(),
      ZJ: x0 => x0.body,
      ZK: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      a: x0 => x0.multiline,
      aB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      aC: x0 => x0.console,
      aD: x0 => x0.platform,
      aE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      aF: (x0,x1) => { x0.name = x1 },
      aG: x0 => x0.selectionDirection,
      aH: (x0,x1) => x0.segment(x1),
      aI: (x0,x1,x2,x3) => x0.createBuffer(x1,x2,x3),
      aJ: x0 => x0.headers,
      aK: (x0,x1) => { x0.src = x1 },
      b: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      bB: o => o.byteOffset,
      bC: () => globalThis.window,
      bD: x0 => x0.body,
      bE: s => s.trim(),
      bF: x0 => x0.head,
      bG: x0 => x0.selectionStart,
      bH: x0 => x0.index,
      bI: x0 => x0.start(),
      bJ: x0 => x0.signal,
      bK: x0 => x0.pause(),
      c: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      cB: o => o.buffer,
      cC: (o, c) => o instanceof c,
      cD: () => globalThis.document,
      cE: x0 => x0.classList,
      cF: (x0,x1) => x0.removeChild(x1),
      cG: x0 => x0.selectionEnd,
      cH: x0 => x0.next(),
      cI: x0 => x0.resume(),
      cJ: (x0,x1) => x0.getRandomValues(x1),
      cK: x0 => x0.currentTime,
      d: (x0,x1) => x0.didCreateEngineInitializer(x1),
      dB: Function.prototype.call.bind(DataView.prototype.getUint8),
      dC: (string, token) => string.split(token),
      dD: (x0,x1,x2) => x0.addEventListener(x1,x2),
      dE: x0 => x0.preventDefault(),
      dF: x0 => x0.firstChild,
      dG: x0 => x0.keyCode,
      dH: x0 => x0.value,
      dI: x0 => x0.destination,
      dJ: () => globalThis.crypto,
      dK: x0 => x0.play(),
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: (b, o) => new DataView(b, o),
      eC: o => o instanceof Array,
      eD: x0 => x0.hasFocus(),
      eE: x0 => x0.parent,
      eF: x0 => x0.viewConstraints,
      eG: (x0,x1) => x0.scrollIntoView(x1),
      eH: x0 => x0.done,
      eI: x0 => x0.state,
      eJ: l => new DataView(new ArrayBuffer(l)),
      eK: (x0,x1) => { x0.currentTime = x1 },
      f: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      fB: (b, o, l) => new DataView(b, o, l),
      fC: (a, i) => a[i],
      fD: x0 => x0.relatedTarget,
      fE: x0 => x0.timeStamp,
      fF: x0 => x0.hostElement,
      fG: x0 => x0.multiViewEnabled,
      fH: (o, m, a) => o[m].apply(o, a),
      fI: (x0,x1) => x0.createElement(x1),
      fJ: (a, l) => a.length = l,
      fK: (x0,x1) => x0.createMediaElementSource(x1),
      g: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      gB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      gC: a => a.length,
      gD: x0 => x0.shiftKey,
      gE: (x0,x1) => x0.hasAttribute(x1),
      gF: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      gG: (x0,x1) => x0.replaceWith(x1),
      gH: x0 => x0.iterator,
      gI: (x0,x1) => x0.append(x1),
      gJ: x0 => x0.stop(),
      gK: x0 => x0.createStereoPanner(),
      h: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      hB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      hC: x0 => x0.userAgent,
      hD: (decoder, codeUnits) => decoder.decode(codeUnits),
      hE: x0 => x0.buttons,
      hF: x0 => ({runApp: x0}),
      hG: (x0,x1) => { x0.type = x1 },
      hH: () => globalThis.Symbol,
      hI: (x0,x1,x2) => x0.insertRule(x1,x2),
      hJ: x0 => x0.disconnect(),
      hK: x0 => x0.load(),
      i: x0 => new Promise(x0),
      iB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      iC: x0 => x0.navigator,
      iD: () => new TextDecoder("utf-8", {fatal: true}),
      iE: x0 => x0.ctrlKey,
      iF: () => Date.now(),
      iG: (x0,x1) => { x0.className = x1 },
      iH: (x0,x1) => new Intl.Segmenter(x0,x1),
      iI: (x0,x1) => x0.add(x1),
      iJ: x0 => x0.suspend(),
      iK: x0 => x0.code,
      j: (x0,x1,x2) => x0.call(x1,x2),
      jB: (t, s) => t.set(s),
      jC: Function.prototype.call.bind(String.prototype.toLowerCase),
      jD: () => new TextDecoder("utf-8", {fatal: false}),
      jE: x0 => x0.y,
      jF: () => typeof dartUseDateNowForTicks !== "undefined",
      jG: (x0,x1) => { x0.tabIndex = x1 },
      jH: x0 => x0.Segmenter,
      jI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jJ: (x0,x1) => { x0.type = x1 },
      jK: x0 => x0.message,
      k: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      kB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      kC: Object.is,
      kD: (a, i, v) => a[i] = v,
      kE: x0 => x0.x,
      kF: () => 1000 * performance.now(),
      kG: (x0,x1) => { x0.name = x1 },
      kH: x0 => x0.buffer,
      kI: (x0,x1,x2) => x0.addEventListener(x1,x2),
      kJ: () => globalThis.navigator.audioSession,
      kK: x0 => x0.error,
      l: x0 => new Array(x0),
      lB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      lC: x0 => x0.vendor,
      lD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      lE: x0 => x0.scrollTop,
      lF: (a, i) => a.splice(i, 1)[0],
      lG: (x0,x1) => { x0.placeholder = x1 },
      lH: x0 => x0.wasmMemory,
      lI: x0 => x0.preventDefault(),
      lJ: (x0,x1) => x0.decodeAudioData(x1),
      lK: x0 => x0.duration,
      m: o => [o],
      mB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      mC: (x0,x1) => x0.createTextNode(x1),
      mD: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      mE: x0 => x0.offsetTop,
      mF: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      mG: (x0,x1) => { x0.autocomplete = x1 },
      mH: () => globalThis.window._flutter_skwasmInstance,
      mI: x0 => x0.createRange(),
      mJ: () => new AudioContext(),
      mK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      n: (o0, o1) => [o0, o1],
      nB: Function.prototype.call.bind(DataView.prototype.getUint32),
      nC: (x0,x1) => { x0.id = x1 },
      nD: x0 => x0.visibilityState,
      nE: x0 => x0.scrollLeft,
      nF: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      nG: (x0,x1) => { x0.name = x1 },
      nH: () => new TextDecoder(),
      nI: (x0,x1) => x0.selectNode(x1),
      nJ: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      nK: (x0,x1) => { x0.playbackRate = x1 },
      o: (o0, o1, o2) => [o0, o1, o2],
      oB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      oC: (x0,x1) => { x0.nonce = x1 },
      oD: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      oE: x0 => x0.offsetLeft,
      oF: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      oG: (x0,x1) => { x0.placeholder = x1 },
      oH: x0 => x0.debugSkipFontRetryDelay,
      oI: x0 => x0.getSelection(),
      oJ: (x0,x1) => ({capture: x0,passive: x1}),
      oK: (x0,x1) => { x0.loop = x1 },
      p: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      pB: Function.prototype.call.bind(DataView.prototype.getInt32),
      pC: x0 => x0.nonce,
      pD: x0 => x0.disconnect(),
      pE: x0 => x0.offsetParent,
      pF: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      pG: (x0,x1) => { x0.action = x1 },
      pH: (x0,x1,x2) => x0.set(x1,x2),
      pI: x0 => x0.removeAllRanges(),
      pJ: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      pK: (x0,x1) => { x0.crossOrigin = x1 },
      q: (x0,x1,x2) => { x0[x1] = x2 },
      qB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      qC: () => globalThis.window.flutterConfiguration,
      qD: x0 => new Intl.Locale(x0),
      qE: (o, p, r) => o.replaceAll(p, () => r),
      qF: x0 => x0.history,
      qG: (x0,x1) => { x0.method = x1 },
      qH: x0 => x0.fontFallbackBaseUrl,
      qI: (x0,x1) => x0.addRange(x1),
      qJ: () => globalThis.document,
      qK: (x0,x1) => { x0.preload = x1 },
      r: (o, p) => o[p],
      rB: o => o instanceof Uint16Array,
      rC: (x0,x1) => x0.attachShadow(x1),
      rD: x0 => x0.region,
      rE: x0 => x0.deltaMode,
      rF: x0 => x0.search,
      rG: (x0,x1) => { x0.noValidate = x1 },
      rH: (handle) => clearInterval(handle),
      rI: () => globalThis.window,
      rJ: (x0,x1) => x0.transferFromImageBitmap(x1),
      rK: (x0,x1) => x0.createElement(x1),
      s: () => globalThis,
      sB: Function.prototype.call.bind(DataView.prototype.getUint16),
      sC: (x0,x1) => x0.createElement(x1),
      sD: x0 => x0.script,
      sE: x0 => x0.deltaY,
      sF: x0 => x0.location,
      sG: (x0,x1) => x0.removeAttribute(x1),
      sH: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      sI: (x0,x1) => { x0.innerText = x1 },
      sJ: (x0,x1) => x0.getContext(x1),
      sK: x0 => x0.length,
      t: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      tB: o => o instanceof Int16Array,
      tC: x0 => x0.scale,
      tD: x0 => x0.language,
      tE: x0 => x0.deltaX,
      tF: x0 => x0.pathname,
      tG: x0 => x0.isConnected,
      tH: () => Date.now(),
      tI: x0 => x0.offsetY,
      tJ: (x0,x1) => { x0.height = x1 },
      tK: x0 => x0.getReader(),
      u: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      uB: Function.prototype.call.bind(DataView.prototype.getInt16),
      uC: x0 => x0.visualViewport,
      uD: x0 => x0.languages,
      uE: x0 => x0.wheelDeltaY,
      uF: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      uG: x0 => x0.click(),
      uH: (map, o, v) => map.set(o, v),
      uI: x0 => x0.offsetX,
      uJ: (x0,x1) => { x0.width = x1 },
      uK: x0 => x0.value,
      v: (x0,x1) => ({addView: x0,removeView: x1}),
      vB: o => o instanceof Uint8ClampedArray,
      vC: x0 => x0.devicePixelRatio,
      vD: (x0,x1) => x0.observe(x1),
      vE: x0 => x0.wheelDeltaX,
      vF: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      vG: (x0,x1) => x0.getElementsByClassName(x1),
      vH: () => new WeakMap(),
      vI: x0 => x0.button,
      vJ: x0 => x0.height,
      vK: x0 => x0.done,
      w: (l, r) => l === r,
      wB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      wC: x0 => x0.height,
      wD: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      wE: x0 => x0.key,
      wF: o => Object.keys(o),
      wG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      wH: (map, o) => map.get(o),
      wI: x0 => x0.classList,
      wJ: x0 => x0.width,
      wK: x0 => x0.read(),
      x: x0 => x0.random(),
      xB: Function.prototype.call.bind(DataView.prototype.setInt32),
      xC: x0 => x0.width,
      xD: x0 => new ResizeObserver(x0),
      xE: x0 => x0.identifier,
      xF: x0 => x0.state,
      xG: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      xH: x0 => new WeakRef(x0),
      xI: (x0,x1) => { x0.height = x1 },
      xJ: x0 => x0.rasterEndMilliseconds,
      xK: x0 => x0.body,
      y: () => globalThis.Math,
      yB: Function.prototype.call.bind(DataView.prototype.setUint32),
      yC: x0 => x0.screen,
      yD: (x0,x1) => x0.getPropertyValue(x1),
      yE: x0 => x0.touches,
      yF: x0 => x0.hash,
      yG: (x0,x1) => x0.dispatchEvent(x1),
      yH: x0 => x0.deref(),
      yI: (x0,x1) => { x0.width = x1 },
      yJ: x0 => x0.rasterStartMilliseconds,
      yK: (x0,x1) => new OffscreenCanvas(x0,x1),
      z: (x0,x1) => x0.prepend(x1),
      zB: Function.prototype.call.bind(DataView.prototype.setInt16),
      zC: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      zD: x0 => globalThis.parseFloat(x0),
      zE: x0 => x0.pressure,
      zF: x0 => x0.state,
      zG: (x0,x1) => x0.createEvent(x1),
      zH: () => globalThis.WeakRef,
      zI: x0 => x0.style,
      zJ: x0 => x0.imageBitmaps,
      zK: x0 => x0.assetBase,

    };

    const baseImports = {
      _: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
