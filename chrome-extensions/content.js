(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/regenerator-runtime/runtime.js
  var require_runtime = __commonJS({
    "node_modules/regenerator-runtime/runtime.js"(exports, module) {
      var runtime = (function(exports2) {
        "use strict";
        var Op = Object.prototype;
        var hasOwn = Op.hasOwnProperty;
        var defineProperty = Object.defineProperty || function(obj, key, desc) {
          obj[key] = desc.value;
        };
        var undefined2;
        var $Symbol = typeof Symbol === "function" ? Symbol : {};
        var iteratorSymbol = $Symbol.iterator || "@@iterator";
        var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
        var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
        function define(obj, key, value) {
          Object.defineProperty(obj, key, {
            value,
            enumerable: true,
            configurable: true,
            writable: true
          });
          return obj[key];
        }
        try {
          define({}, "");
        } catch (err) {
          define = function(obj, key, value) {
            return obj[key] = value;
          };
        }
        function wrap(innerFn, outerFn, self, tryLocsList) {
          var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
          var generator = Object.create(protoGenerator.prototype);
          var context = new Context(tryLocsList || []);
          defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) });
          return generator;
        }
        exports2.wrap = wrap;
        function tryCatch(fn, obj, arg) {
          try {
            return { type: "normal", arg: fn.call(obj, arg) };
          } catch (err) {
            return { type: "throw", arg: err };
          }
        }
        var GenStateSuspendedStart = "suspendedStart";
        var GenStateSuspendedYield = "suspendedYield";
        var GenStateExecuting = "executing";
        var GenStateCompleted = "completed";
        var ContinueSentinel = {};
        function Generator() {
        }
        function GeneratorFunction() {
        }
        function GeneratorFunctionPrototype() {
        }
        var IteratorPrototype = {};
        define(IteratorPrototype, iteratorSymbol, function() {
          return this;
        });
        var getProto = Object.getPrototypeOf;
        var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
        if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
          IteratorPrototype = NativeIteratorPrototype;
        }
        var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
        GeneratorFunction.prototype = GeneratorFunctionPrototype;
        defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: true });
        defineProperty(
          GeneratorFunctionPrototype,
          "constructor",
          { value: GeneratorFunction, configurable: true }
        );
        GeneratorFunction.displayName = define(
          GeneratorFunctionPrototype,
          toStringTagSymbol,
          "GeneratorFunction"
        );
        function defineIteratorMethods(prototype) {
          ["next", "throw", "return"].forEach(function(method) {
            define(prototype, method, function(arg) {
              return this._invoke(method, arg);
            });
          });
        }
        exports2.isGeneratorFunction = function(genFun) {
          var ctor = typeof genFun === "function" && genFun.constructor;
          return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
        };
        exports2.mark = function(genFun) {
          if (Object.setPrototypeOf) {
            Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
          } else {
            genFun.__proto__ = GeneratorFunctionPrototype;
            define(genFun, toStringTagSymbol, "GeneratorFunction");
          }
          genFun.prototype = Object.create(Gp);
          return genFun;
        };
        exports2.awrap = function(arg) {
          return { __await: arg };
        };
        function AsyncIterator(generator, PromiseImpl) {
          function invoke(method, arg, resolve, reject) {
            var record = tryCatch(generator[method], generator, arg);
            if (record.type === "throw") {
              reject(record.arg);
            } else {
              var result = record.arg;
              var value = result.value;
              if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
                return PromiseImpl.resolve(value.__await).then(function(value2) {
                  invoke("next", value2, resolve, reject);
                }, function(err) {
                  invoke("throw", err, resolve, reject);
                });
              }
              return PromiseImpl.resolve(value).then(function(unwrapped) {
                result.value = unwrapped;
                resolve(result);
              }, function(error) {
                return invoke("throw", error, resolve, reject);
              });
            }
          }
          var previousPromise;
          function enqueue(method, arg) {
            function callInvokeWithMethodAndArg() {
              return new PromiseImpl(function(resolve, reject) {
                invoke(method, arg, resolve, reject);
              });
            }
            return previousPromise = // If enqueue has been called before, then we want to wait until
            // all previous Promises have been resolved before calling invoke,
            // so that results are always delivered in the correct order. If
            // enqueue has not been called before, then it is important to
            // call invoke immediately, without waiting on a callback to fire,
            // so that the async generator function has the opportunity to do
            // any necessary setup in a predictable way. This predictability
            // is why the Promise constructor synchronously invokes its
            // executor callback, and why async functions synchronously
            // execute code before the first await. Since we implement simple
            // async functions in terms of async generators, it is especially
            // important to get this right, even though it requires care.
            previousPromise ? previousPromise.then(
              callInvokeWithMethodAndArg,
              // Avoid propagating failures to Promises returned by later
              // invocations of the iterator.
              callInvokeWithMethodAndArg
            ) : callInvokeWithMethodAndArg();
          }
          defineProperty(this, "_invoke", { value: enqueue });
        }
        defineIteratorMethods(AsyncIterator.prototype);
        define(AsyncIterator.prototype, asyncIteratorSymbol, function() {
          return this;
        });
        exports2.AsyncIterator = AsyncIterator;
        exports2.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
          if (PromiseImpl === void 0) PromiseImpl = Promise;
          var iter = new AsyncIterator(
            wrap(innerFn, outerFn, self, tryLocsList),
            PromiseImpl
          );
          return exports2.isGeneratorFunction(outerFn) ? iter : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
        };
        function makeInvokeMethod(innerFn, self, context) {
          var state = GenStateSuspendedStart;
          return function invoke(method, arg) {
            if (state === GenStateExecuting) {
              throw new Error("Generator is already running");
            }
            if (state === GenStateCompleted) {
              if (method === "throw") {
                throw arg;
              }
              return doneResult();
            }
            context.method = method;
            context.arg = arg;
            while (true) {
              var delegate = context.delegate;
              if (delegate) {
                var delegateResult = maybeInvokeDelegate(delegate, context);
                if (delegateResult) {
                  if (delegateResult === ContinueSentinel) continue;
                  return delegateResult;
                }
              }
              if (context.method === "next") {
                context.sent = context._sent = context.arg;
              } else if (context.method === "throw") {
                if (state === GenStateSuspendedStart) {
                  state = GenStateCompleted;
                  throw context.arg;
                }
                context.dispatchException(context.arg);
              } else if (context.method === "return") {
                context.abrupt("return", context.arg);
              }
              state = GenStateExecuting;
              var record = tryCatch(innerFn, self, context);
              if (record.type === "normal") {
                state = context.done ? GenStateCompleted : GenStateSuspendedYield;
                if (record.arg === ContinueSentinel) {
                  continue;
                }
                return {
                  value: record.arg,
                  done: context.done
                };
              } else if (record.type === "throw") {
                state = GenStateCompleted;
                context.method = "throw";
                context.arg = record.arg;
              }
            }
          };
        }
        function maybeInvokeDelegate(delegate, context) {
          var methodName = context.method;
          var method = delegate.iterator[methodName];
          if (method === undefined2) {
            context.delegate = null;
            if (methodName === "throw" && delegate.iterator["return"]) {
              context.method = "return";
              context.arg = undefined2;
              maybeInvokeDelegate(delegate, context);
              if (context.method === "throw") {
                return ContinueSentinel;
              }
            }
            if (methodName !== "return") {
              context.method = "throw";
              context.arg = new TypeError(
                "The iterator does not provide a '" + methodName + "' method"
              );
            }
            return ContinueSentinel;
          }
          var record = tryCatch(method, delegate.iterator, context.arg);
          if (record.type === "throw") {
            context.method = "throw";
            context.arg = record.arg;
            context.delegate = null;
            return ContinueSentinel;
          }
          var info = record.arg;
          if (!info) {
            context.method = "throw";
            context.arg = new TypeError("iterator result is not an object");
            context.delegate = null;
            return ContinueSentinel;
          }
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
            if (context.method !== "return") {
              context.method = "next";
              context.arg = undefined2;
            }
          } else {
            return info;
          }
          context.delegate = null;
          return ContinueSentinel;
        }
        defineIteratorMethods(Gp);
        define(Gp, toStringTagSymbol, "Generator");
        define(Gp, iteratorSymbol, function() {
          return this;
        });
        define(Gp, "toString", function() {
          return "[object Generator]";
        });
        function pushTryEntry(locs) {
          var entry = { tryLoc: locs[0] };
          if (1 in locs) {
            entry.catchLoc = locs[1];
          }
          if (2 in locs) {
            entry.finallyLoc = locs[2];
            entry.afterLoc = locs[3];
          }
          this.tryEntries.push(entry);
        }
        function resetTryEntry(entry) {
          var record = entry.completion || {};
          record.type = "normal";
          delete record.arg;
          entry.completion = record;
        }
        function Context(tryLocsList) {
          this.tryEntries = [{ tryLoc: "root" }];
          tryLocsList.forEach(pushTryEntry, this);
          this.reset(true);
        }
        exports2.keys = function(val) {
          var object = Object(val);
          var keys = [];
          for (var key in object) {
            keys.push(key);
          }
          keys.reverse();
          return function next() {
            while (keys.length) {
              var key2 = keys.pop();
              if (key2 in object) {
                next.value = key2;
                next.done = false;
                return next;
              }
            }
            next.done = true;
            return next;
          };
        };
        function values(iterable) {
          if (iterable) {
            var iteratorMethod = iterable[iteratorSymbol];
            if (iteratorMethod) {
              return iteratorMethod.call(iterable);
            }
            if (typeof iterable.next === "function") {
              return iterable;
            }
            if (!isNaN(iterable.length)) {
              var i = -1, next = function next2() {
                while (++i < iterable.length) {
                  if (hasOwn.call(iterable, i)) {
                    next2.value = iterable[i];
                    next2.done = false;
                    return next2;
                  }
                }
                next2.value = undefined2;
                next2.done = true;
                return next2;
              };
              return next.next = next;
            }
          }
          return { next: doneResult };
        }
        exports2.values = values;
        function doneResult() {
          return { value: undefined2, done: true };
        }
        Context.prototype = {
          constructor: Context,
          reset: function(skipTempReset) {
            this.prev = 0;
            this.next = 0;
            this.sent = this._sent = undefined2;
            this.done = false;
            this.delegate = null;
            this.method = "next";
            this.arg = undefined2;
            this.tryEntries.forEach(resetTryEntry);
            if (!skipTempReset) {
              for (var name in this) {
                if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                  this[name] = undefined2;
                }
              }
            }
          },
          stop: function() {
            this.done = true;
            var rootEntry = this.tryEntries[0];
            var rootRecord = rootEntry.completion;
            if (rootRecord.type === "throw") {
              throw rootRecord.arg;
            }
            return this.rval;
          },
          dispatchException: function(exception) {
            if (this.done) {
              throw exception;
            }
            var context = this;
            function handle(loc, caught) {
              record.type = "throw";
              record.arg = exception;
              context.next = loc;
              if (caught) {
                context.method = "next";
                context.arg = undefined2;
              }
              return !!caught;
            }
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              var record = entry.completion;
              if (entry.tryLoc === "root") {
                return handle("end");
              }
              if (entry.tryLoc <= this.prev) {
                var hasCatch = hasOwn.call(entry, "catchLoc");
                var hasFinally = hasOwn.call(entry, "finallyLoc");
                if (hasCatch && hasFinally) {
                  if (this.prev < entry.catchLoc) {
                    return handle(entry.catchLoc, true);
                  } else if (this.prev < entry.finallyLoc) {
                    return handle(entry.finallyLoc);
                  }
                } else if (hasCatch) {
                  if (this.prev < entry.catchLoc) {
                    return handle(entry.catchLoc, true);
                  }
                } else if (hasFinally) {
                  if (this.prev < entry.finallyLoc) {
                    return handle(entry.finallyLoc);
                  }
                } else {
                  throw new Error("try statement without catch or finally");
                }
              }
            }
          },
          abrupt: function(type, arg) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
                var finallyEntry = entry;
                break;
              }
            }
            if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
              finallyEntry = null;
            }
            var record = finallyEntry ? finallyEntry.completion : {};
            record.type = type;
            record.arg = arg;
            if (finallyEntry) {
              this.method = "next";
              this.next = finallyEntry.finallyLoc;
              return ContinueSentinel;
            }
            return this.complete(record);
          },
          complete: function(record, afterLoc) {
            if (record.type === "throw") {
              throw record.arg;
            }
            if (record.type === "break" || record.type === "continue") {
              this.next = record.arg;
            } else if (record.type === "return") {
              this.rval = this.arg = record.arg;
              this.method = "return";
              this.next = "end";
            } else if (record.type === "normal" && afterLoc) {
              this.next = afterLoc;
            }
            return ContinueSentinel;
          },
          finish: function(finallyLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.finallyLoc === finallyLoc) {
                this.complete(entry.completion, entry.afterLoc);
                resetTryEntry(entry);
                return ContinueSentinel;
              }
            }
          },
          "catch": function(tryLoc) {
            for (var i = this.tryEntries.length - 1; i >= 0; --i) {
              var entry = this.tryEntries[i];
              if (entry.tryLoc === tryLoc) {
                var record = entry.completion;
                if (record.type === "throw") {
                  var thrown = record.arg;
                  resetTryEntry(entry);
                }
                return thrown;
              }
            }
            throw new Error("illegal catch attempt");
          },
          delegateYield: function(iterable, resultName, nextLoc) {
            this.delegate = {
              iterator: values(iterable),
              resultName,
              nextLoc
            };
            if (this.method === "next") {
              this.arg = undefined2;
            }
            return ContinueSentinel;
          }
        };
        return exports2;
      })(
        // If this script is executing as a CommonJS module, use module.exports
        // as the regeneratorRuntime namespace. Otherwise create a new empty
        // object. Either way, the resulting object will be used to initialize
        // the regeneratorRuntime variable at the top of this file.
        typeof module === "object" ? module.exports : {}
      );
      try {
        regeneratorRuntime = runtime;
      } catch (accidentalStrictMode) {
        if (typeof globalThis === "object") {
          globalThis.regeneratorRuntime = runtime;
        } else {
          Function("r", "regeneratorRuntime = r")(runtime);
        }
      }
    }
  });

  // node_modules/tesseract.js/src/utils/getId.js
  var require_getId = __commonJS({
    "node_modules/tesseract.js/src/utils/getId.js"(exports, module) {
      "use strict";
      module.exports = (prefix, cnt) => `${prefix}-${cnt}-${Math.random().toString(16).slice(3, 8)}`;
    }
  });

  // node_modules/tesseract.js/src/createJob.js
  var require_createJob = __commonJS({
    "node_modules/tesseract.js/src/createJob.js"(exports, module) {
      "use strict";
      var getId = require_getId();
      var jobCounter = 0;
      module.exports = ({
        id: _id,
        action,
        payload = {}
      }) => {
        let id = _id;
        if (typeof id === "undefined") {
          id = getId("Job", jobCounter);
          jobCounter += 1;
        }
        return {
          id,
          action,
          payload
        };
      };
    }
  });

  // node_modules/tesseract.js/src/utils/log.js
  var require_log = __commonJS({
    "node_modules/tesseract.js/src/utils/log.js"(exports) {
      "use strict";
      var logging = false;
      exports.logging = logging;
      exports.setLogging = (_logging) => {
        logging = _logging;
      };
      exports.log = (...args) => logging ? console.log.apply(exports, args) : null;
    }
  });

  // node_modules/tesseract.js/src/createScheduler.js
  var require_createScheduler = __commonJS({
    "node_modules/tesseract.js/src/createScheduler.js"(exports, module) {
      "use strict";
      var createJob = require_createJob();
      var { log } = require_log();
      var getId = require_getId();
      var schedulerCounter = 0;
      module.exports = () => {
        const id = getId("Scheduler", schedulerCounter);
        const workers = {};
        const runningWorkers = {};
        let jobQueue = [];
        schedulerCounter += 1;
        const getQueueLen = () => jobQueue.length;
        const getNumWorkers = () => Object.keys(workers).length;
        const dequeue = () => {
          if (jobQueue.length !== 0) {
            const wIds = Object.keys(workers);
            for (let i = 0; i < wIds.length; i += 1) {
              if (typeof runningWorkers[wIds[i]] === "undefined") {
                jobQueue[0](workers[wIds[i]]);
                break;
              }
            }
          }
        };
        const queue = (action, payload) => new Promise((resolve, reject) => {
          const job = createJob({ action, payload });
          jobQueue.push(async (w) => {
            jobQueue.shift();
            runningWorkers[w.id] = job;
            try {
              resolve(await w[action].apply(exports, [...payload, job.id]));
            } catch (err) {
              reject(err);
            } finally {
              delete runningWorkers[w.id];
              dequeue();
            }
          });
          log(`[${id}]: Add ${job.id} to JobQueue`);
          log(`[${id}]: JobQueue length=${jobQueue.length}`);
          dequeue();
        });
        const addWorker = (w) => {
          workers[w.id] = w;
          log(`[${id}]: Add ${w.id}`);
          log(`[${id}]: Number of workers=${getNumWorkers()}`);
          dequeue();
          return w.id;
        };
        const addJob = async (action, ...payload) => {
          if (getNumWorkers() === 0) {
            throw Error(`[${id}]: You need to have at least one worker before adding jobs`);
          }
          return queue(action, payload);
        };
        const terminate = async () => {
          Object.keys(workers).forEach(async (wid) => {
            await workers[wid].terminate();
          });
          jobQueue = [];
        };
        return {
          addWorker,
          addJob,
          terminate,
          getQueueLen,
          getNumWorkers
        };
      };
    }
  });

  // node_modules/tesseract.js/src/utils/getEnvironment.js
  var require_getEnvironment = __commonJS({
    "node_modules/tesseract.js/src/utils/getEnvironment.js"(exports, module) {
      "use strict";
      module.exports = (key) => {
        const env = {};
        if (typeof WorkerGlobalScope !== "undefined") {
          env.type = "webworker";
        } else if (typeof document === "object") {
          env.type = "browser";
        } else if (typeof process === "object" && typeof __require === "function") {
          env.type = "node";
        }
        if (typeof key === "undefined") {
          return env;
        }
        return env[key];
      };
    }
  });

  // node_modules/tesseract.js/src/utils/resolvePaths.js
  var require_resolvePaths = __commonJS({
    "node_modules/tesseract.js/src/utils/resolvePaths.js"(exports, module) {
      "use strict";
      var isBrowser = require_getEnvironment()("type") === "browser";
      var resolveURL = isBrowser ? (s) => new URL(s, window.location.href).href : (s) => s;
      module.exports = (options) => {
        const opts = { ...options };
        ["corePath", "workerPath", "langPath"].forEach((key) => {
          if (options[key]) {
            opts[key] = resolveURL(opts[key]);
          }
        });
        return opts;
      };
    }
  });

  // node_modules/tesseract.js/src/constants/OEM.js
  var require_OEM = __commonJS({
    "node_modules/tesseract.js/src/constants/OEM.js"(exports, module) {
      "use strict";
      module.exports = {
        TESSERACT_ONLY: 0,
        LSTM_ONLY: 1,
        TESSERACT_LSTM_COMBINED: 2,
        DEFAULT: 3
      };
    }
  });

  // node_modules/tesseract.js/package.json
  var require_package = __commonJS({
    "node_modules/tesseract.js/package.json"(exports, module) {
      module.exports = {
        name: "tesseract.js",
        version: "7.0.0",
        description: "Pure Javascript Multilingual OCR",
        main: "src/index.js",
        type: "commonjs",
        types: "src/index.d.ts",
        unpkg: "dist/tesseract.min.js",
        jsdelivr: "dist/tesseract.min.js",
        scripts: {
          start: "node scripts/server.js",
          build: "rimraf dist && webpack --config scripts/webpack.config.prod.js && rollup -c scripts/rollup.esm.mjs",
          "profile:tesseract": "webpack-bundle-analyzer dist/tesseract-stats.json",
          "profile:worker": "webpack-bundle-analyzer dist/worker-stats.json",
          prepublishOnly: "npm run build",
          wait: "rimraf dist && wait-on http://localhost:3000/dist/tesseract.min.js",
          test: "npm-run-all -p -r start test:all",
          "test:all": "npm-run-all wait test:browser test:node:all",
          "test:browser": "karma start karma.conf.js",
          "test:node": "nyc mocha --exit --bail --require ./scripts/test-helper.mjs",
          "test:node:all": "npm run test:node -- ./tests/*.test.mjs",
          lint: "eslint src",
          "lint:fix": "eslint --fix src",
          postinstall: "opencollective-postinstall || true"
        },
        browser: {
          "./src/worker/node/index.js": "./src/worker/browser/index.js"
        },
        author: "",
        contributors: [
          "jeromewu"
        ],
        license: "Apache-2.0",
        devDependencies: {
          "@babel/core": "^7.21.4",
          "@babel/eslint-parser": "^7.21.3",
          "@babel/preset-env": "^7.21.4",
          "@rollup/plugin-commonjs": "^24.1.0",
          acorn: "^8.8.2",
          "babel-loader": "^9.1.2",
          buffer: "^6.0.3",
          cors: "^2.8.5",
          eslint: "^7.32.0",
          "eslint-config-airbnb-base": "^14.2.1",
          "eslint-plugin-import": "^2.27.5",
          "expect.js": "^0.3.1",
          express: "^4.18.2",
          mocha: "^10.2.0",
          "npm-run-all": "^4.1.5",
          karma: "^6.4.2",
          "karma-chrome-launcher": "^3.2.0",
          "karma-firefox-launcher": "^2.1.2",
          "karma-mocha": "^2.0.1",
          "karma-webpack": "^5.0.0",
          nyc: "^15.1.0",
          rimraf: "^5.0.0",
          rollup: "^3.20.7",
          "wait-on": "^7.0.1",
          webpack: "^5.79.0",
          "webpack-bundle-analyzer": "^4.8.0",
          "webpack-cli": "^5.0.1",
          "webpack-dev-middleware": "^6.0.2",
          "rollup-plugin-sourcemaps": "^0.6.3"
        },
        dependencies: {
          "bmp-js": "^0.1.0",
          "idb-keyval": "^6.2.0",
          "is-url": "^1.2.4",
          "node-fetch": "^2.6.9",
          "opencollective-postinstall": "^2.0.3",
          "regenerator-runtime": "^0.13.3",
          "tesseract.js-core": "^7.0.0",
          "wasm-feature-detect": "^1.8.0",
          zlibjs: "^0.3.1"
        },
        overrides: {
          "@rollup/pluginutils": "^5.0.2"
        },
        repository: {
          type: "git",
          url: "https://github.com/naptha/tesseract.js.git"
        },
        bugs: {
          url: "https://github.com/naptha/tesseract.js/issues"
        },
        homepage: "https://github.com/naptha/tesseract.js",
        collective: {
          type: "opencollective",
          url: "https://opencollective.com/tesseractjs"
        }
      };
    }
  });

  // node_modules/tesseract.js/src/constants/defaultOptions.js
  var require_defaultOptions = __commonJS({
    "node_modules/tesseract.js/src/constants/defaultOptions.js"(exports, module) {
      "use strict";
      module.exports = {
        /*
         * Use BlobURL for worker script by default
         * TODO: remove this option
         *
         */
        workerBlobURL: true,
        logger: () => {
        }
      };
    }
  });

  // node_modules/tesseract.js/src/worker/browser/defaultOptions.js
  var require_defaultOptions2 = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/defaultOptions.js"(exports, module) {
      "use strict";
      var version = require_package().version;
      var defaultOptions = require_defaultOptions();
      module.exports = {
        ...defaultOptions,
        workerPath: `https://cdn.jsdelivr.net/npm/tesseract.js@v${version}/dist/worker.min.js`
      };
    }
  });

  // node_modules/tesseract.js/src/worker/browser/spawnWorker.js
  var require_spawnWorker = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/spawnWorker.js"(exports, module) {
      "use strict";
      module.exports = ({ workerPath, workerBlobURL }) => {
        let worker;
        if (Blob && URL && workerBlobURL) {
          const blob = new Blob([`importScripts("${workerPath}");`], {
            type: "application/javascript"
          });
          worker = new Worker(URL.createObjectURL(blob));
        } else {
          worker = new Worker(workerPath);
        }
        return worker;
      };
    }
  });

  // node_modules/tesseract.js/src/worker/browser/terminateWorker.js
  var require_terminateWorker = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/terminateWorker.js"(exports, module) {
      "use strict";
      module.exports = (worker) => {
        worker.terminate();
      };
    }
  });

  // node_modules/tesseract.js/src/worker/browser/onMessage.js
  var require_onMessage = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/onMessage.js"(exports, module) {
      "use strict";
      module.exports = (worker, handler) => {
        worker.onmessage = ({ data }) => {
          handler(data);
        };
      };
    }
  });

  // node_modules/tesseract.js/src/worker/browser/send.js
  var require_send = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/send.js"(exports, module) {
      "use strict";
      module.exports = async (worker, packet) => {
        worker.postMessage(packet);
      };
    }
  });

  // node_modules/tesseract.js/src/worker/browser/loadImage.js
  var require_loadImage = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/loadImage.js"(exports, module) {
      "use strict";
      var readFromBlobOrFile = (blob) => new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          resolve(fileReader.result);
        };
        fileReader.onerror = ({ target: { error: { code } } }) => {
          reject(Error(`File could not be read! Code=${code}`));
        };
        fileReader.readAsArrayBuffer(blob);
      });
      var loadImage = async (image) => {
        let data = image;
        if (typeof image === "undefined") {
          return "undefined";
        }
        if (typeof image === "string") {
          if (/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(image)) {
            data = atob(image.split(",")[1]).split("").map((c) => c.charCodeAt(0));
          } else {
            const resp = await fetch(image);
            data = await resp.arrayBuffer();
          }
        } else if (typeof HTMLElement !== "undefined" && image instanceof HTMLElement) {
          if (image.tagName === "IMG") {
            data = await loadImage(image.src);
          }
          if (image.tagName === "VIDEO") {
            data = await loadImage(image.poster);
          }
          if (image.tagName === "CANVAS") {
            await new Promise((resolve) => {
              image.toBlob(async (blob) => {
                data = await readFromBlobOrFile(blob);
                resolve();
              });
            });
          }
        } else if (typeof OffscreenCanvas !== "undefined" && image instanceof OffscreenCanvas) {
          const blob = await image.convertToBlob();
          data = await readFromBlobOrFile(blob);
        } else if (image instanceof File || image instanceof Blob) {
          data = await readFromBlobOrFile(image);
        }
        return new Uint8Array(data);
      };
      module.exports = loadImage;
    }
  });

  // node_modules/tesseract.js/src/worker/browser/index.js
  var require_browser = __commonJS({
    "node_modules/tesseract.js/src/worker/browser/index.js"(exports, module) {
      "use strict";
      var defaultOptions = require_defaultOptions2();
      var spawnWorker = require_spawnWorker();
      var terminateWorker = require_terminateWorker();
      var onMessage = require_onMessage();
      var send = require_send();
      var loadImage = require_loadImage();
      module.exports = {
        defaultOptions,
        spawnWorker,
        terminateWorker,
        onMessage,
        send,
        loadImage
      };
    }
  });

  // node_modules/tesseract.js/src/createWorker.js
  var require_createWorker = __commonJS({
    "node_modules/tesseract.js/src/createWorker.js"(exports, module) {
      "use strict";
      var resolvePaths = require_resolvePaths();
      var createJob = require_createJob();
      var { log } = require_log();
      var getId = require_getId();
      var OEM = require_OEM();
      var {
        defaultOptions,
        spawnWorker,
        terminateWorker,
        onMessage,
        loadImage,
        send
      } = require_browser();
      var workerCounter = 0;
      module.exports = async (langs = "eng", oem = OEM.LSTM_ONLY, _options = {}, config = {}) => {
        const id = getId("Worker", workerCounter);
        const {
          logger,
          errorHandler,
          ...options
        } = resolvePaths({
          ...defaultOptions,
          ..._options
        });
        const promises = {};
        const currentLangs = typeof langs === "string" ? langs.split("+") : langs;
        let currentOem = oem;
        let currentConfig = config;
        const lstmOnlyCore = [OEM.DEFAULT, OEM.LSTM_ONLY].includes(oem) && !options.legacyCore;
        let workerResReject;
        let workerResResolve;
        const workerRes = new Promise((resolve, reject) => {
          workerResResolve = resolve;
          workerResReject = reject;
        });
        const workerError = (event) => {
          workerResReject(event.message);
        };
        let worker = spawnWorker(options);
        worker.onerror = workerError;
        workerCounter += 1;
        const startJob = ({ id: jobId, action, payload }) => new Promise((resolve, reject) => {
          log(`[${id}]: Start ${jobId}, action=${action}`);
          const promiseId = `${action}-${jobId}`;
          promises[promiseId] = { resolve, reject };
          send(worker, {
            workerId: id,
            jobId,
            action,
            payload
          });
        });
        const load = () => console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)");
        const loadInternal = (jobId) => startJob(createJob({
          id: jobId,
          action: "load",
          payload: { options: { lstmOnly: lstmOnlyCore, corePath: options.corePath, logging: options.logging } }
        }));
        const writeText = (path, text, jobId) => startJob(createJob({
          id: jobId,
          action: "FS",
          payload: { method: "writeFile", args: [path, text] }
        }));
        const readText = (path, jobId) => startJob(createJob({
          id: jobId,
          action: "FS",
          payload: { method: "readFile", args: [path, { encoding: "utf8" }] }
        }));
        const removeFile = (path, jobId) => startJob(createJob({
          id: jobId,
          action: "FS",
          payload: { method: "unlink", args: [path] }
        }));
        const FS = (method, args, jobId) => startJob(createJob({
          id: jobId,
          action: "FS",
          payload: { method, args }
        }));
        const loadLanguageInternal = (_langs, jobId) => startJob(createJob({
          id: jobId,
          action: "loadLanguage",
          payload: {
            langs: _langs,
            options: {
              langPath: options.langPath,
              dataPath: options.dataPath,
              cachePath: options.cachePath,
              cacheMethod: options.cacheMethod,
              gzip: options.gzip,
              lstmOnly: [OEM.DEFAULT, OEM.LSTM_ONLY].includes(currentOem) && !options.legacyLang
            }
          }
        }));
        const initializeInternal = (_langs, _oem, _config, jobId) => startJob(createJob({
          id: jobId,
          action: "initialize",
          payload: { langs: _langs, oem: _oem, config: _config }
        }));
        const reinitialize = (langs2 = "eng", oem2, config2, jobId) => {
          if (lstmOnlyCore && [OEM.TESSERACT_ONLY, OEM.TESSERACT_LSTM_COMBINED].includes(oem2)) throw Error("Legacy model requested but code missing.");
          const _oem = oem2 || currentOem;
          currentOem = _oem;
          const _config = config2 || currentConfig;
          currentConfig = _config;
          const langsArr = typeof langs2 === "string" ? langs2.split("+") : langs2;
          const _langs = langsArr.filter((x) => !currentLangs.includes(x));
          currentLangs.push(..._langs);
          if (_langs.length > 0) {
            return loadLanguageInternal(_langs, jobId).then(() => initializeInternal(langs2, _oem, _config, jobId));
          }
          return initializeInternal(langs2, _oem, _config, jobId);
        };
        const setParameters = (params = {}, jobId) => startJob(createJob({
          id: jobId,
          action: "setParameters",
          payload: { params }
        }));
        const recognize = async (image, opts = {}, output = {
          text: true
        }, jobId) => startJob(createJob({
          id: jobId,
          action: "recognize",
          payload: { image: await loadImage(image), options: opts, output }
        }));
        const detect = async (image, jobId) => {
          if (lstmOnlyCore) throw Error("`worker.detect` requires Legacy model, which was not loaded.");
          return startJob(createJob({
            id: jobId,
            action: "detect",
            payload: { image: await loadImage(image) }
          }));
        };
        const terminate = async () => {
          if (worker !== null) {
            terminateWorker(worker);
            worker = null;
          }
          return Promise.resolve();
        };
        onMessage(worker, ({
          workerId,
          jobId,
          status,
          action,
          data
        }) => {
          const promiseId = `${action}-${jobId}`;
          if (status === "resolve") {
            log(`[${workerId}]: Complete ${jobId}`);
            promises[promiseId].resolve({ jobId, data });
            delete promises[promiseId];
          } else if (status === "reject") {
            promises[promiseId].reject(data);
            delete promises[promiseId];
            if (action === "load") workerResReject(data);
            if (errorHandler) {
              errorHandler(data);
            } else {
              throw Error(data);
            }
          } else if (status === "progress") {
            logger({ ...data, userJobId: jobId });
          }
        });
        const resolveObj = {
          id,
          worker,
          load,
          writeText,
          readText,
          removeFile,
          FS,
          reinitialize,
          setParameters,
          recognize,
          detect,
          terminate
        };
        loadInternal().then(() => loadLanguageInternal(langs)).then(() => initializeInternal(langs, oem, config)).then(() => workerResResolve(resolveObj)).catch(() => {
        });
        return workerRes;
      };
    }
  });

  // node_modules/tesseract.js/src/Tesseract.js
  var require_Tesseract = __commonJS({
    "node_modules/tesseract.js/src/Tesseract.js"(exports, module) {
      "use strict";
      var createWorker = require_createWorker();
      var recognize = async (image, langs, options) => {
        const worker = await createWorker(langs, 1, options);
        return worker.recognize(image).finally(async () => {
          await worker.terminate();
        });
      };
      var detect = async (image, options) => {
        const worker = await createWorker("osd", 0, options);
        return worker.detect(image).finally(async () => {
          await worker.terminate();
        });
      };
      module.exports = {
        recognize,
        detect
      };
    }
  });

  // node_modules/tesseract.js/src/constants/languages.js
  var require_languages = __commonJS({
    "node_modules/tesseract.js/src/constants/languages.js"(exports, module) {
      "use strict";
      module.exports = {
        AFR: "afr",
        AMH: "amh",
        ARA: "ara",
        ASM: "asm",
        AZE: "aze",
        AZE_CYRL: "aze_cyrl",
        BEL: "bel",
        BEN: "ben",
        BOD: "bod",
        BOS: "bos",
        BUL: "bul",
        CAT: "cat",
        CEB: "ceb",
        CES: "ces",
        CHI_SIM: "chi_sim",
        CHI_TRA: "chi_tra",
        CHR: "chr",
        CYM: "cym",
        DAN: "dan",
        DEU: "deu",
        DZO: "dzo",
        ELL: "ell",
        ENG: "eng",
        ENM: "enm",
        EPO: "epo",
        EST: "est",
        EUS: "eus",
        FAS: "fas",
        FIN: "fin",
        FRA: "fra",
        FRK: "frk",
        FRM: "frm",
        GLE: "gle",
        GLG: "glg",
        GRC: "grc",
        GUJ: "guj",
        HAT: "hat",
        HEB: "heb",
        HIN: "hin",
        HRV: "hrv",
        HUN: "hun",
        IKU: "iku",
        IND: "ind",
        ISL: "isl",
        ITA: "ita",
        ITA_OLD: "ita_old",
        JAV: "jav",
        JPN: "jpn",
        KAN: "kan",
        KAT: "kat",
        KAT_OLD: "kat_old",
        KAZ: "kaz",
        KHM: "khm",
        KIR: "kir",
        KOR: "kor",
        KUR: "kur",
        LAO: "lao",
        LAT: "lat",
        LAV: "lav",
        LIT: "lit",
        MAL: "mal",
        MAR: "mar",
        MKD: "mkd",
        MLT: "mlt",
        MSA: "msa",
        MYA: "mya",
        NEP: "nep",
        NLD: "nld",
        NOR: "nor",
        ORI: "ori",
        PAN: "pan",
        POL: "pol",
        POR: "por",
        PUS: "pus",
        RON: "ron",
        RUS: "rus",
        SAN: "san",
        SIN: "sin",
        SLK: "slk",
        SLV: "slv",
        SPA: "spa",
        SPA_OLD: "spa_old",
        SQI: "sqi",
        SRP: "srp",
        SRP_LATN: "srp_latn",
        SWA: "swa",
        SWE: "swe",
        SYR: "syr",
        TAM: "tam",
        TEL: "tel",
        TGK: "tgk",
        TGL: "tgl",
        THA: "tha",
        TIR: "tir",
        TUR: "tur",
        UIG: "uig",
        UKR: "ukr",
        URD: "urd",
        UZB: "uzb",
        UZB_CYRL: "uzb_cyrl",
        VIE: "vie",
        YID: "yid"
      };
    }
  });

  // node_modules/tesseract.js/src/constants/PSM.js
  var require_PSM = __commonJS({
    "node_modules/tesseract.js/src/constants/PSM.js"(exports, module) {
      "use strict";
      module.exports = {
        OSD_ONLY: "0",
        AUTO_OSD: "1",
        AUTO_ONLY: "2",
        AUTO: "3",
        SINGLE_COLUMN: "4",
        SINGLE_BLOCK_VERT_TEXT: "5",
        SINGLE_BLOCK: "6",
        SINGLE_LINE: "7",
        SINGLE_WORD: "8",
        CIRCLE_WORD: "9",
        SINGLE_CHAR: "10",
        SPARSE_TEXT: "11",
        SPARSE_TEXT_OSD: "12",
        RAW_LINE: "13"
      };
    }
  });

  // node_modules/tesseract.js/src/index.js
  var require_src = __commonJS({
    "node_modules/tesseract.js/src/index.js"(exports, module) {
      "use strict";
      require_runtime();
      var createScheduler = require_createScheduler();
      var createWorker = require_createWorker();
      var Tesseract2 = require_Tesseract();
      var languages = require_languages();
      var OEM = require_OEM();
      var PSM = require_PSM();
      var { setLogging } = require_log();
      module.exports = {
        languages,
        OEM,
        PSM,
        createScheduler,
        createWorker,
        setLogging,
        ...Tesseract2
      };
    }
  });

  // src/content.js
  var import_tesseract = __toESM(require_src(), 1);
  (() => {
    if (window.__suvidhaAssistantLoaded) return;
    window.__suvidhaAssistantLoaded = true;
    const norm = (s) => (s || "").replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    function notice(message, isError = false) {
      let box = document.getElementById("suvidha-assistant-notice");
      if (!box) {
        box = document.createElement("div");
        box.id = "suvidha-assistant-notice";
        Object.assign(box.style, {
          position: "fixed",
          right: "15px",
          bottom: "15px",
          zIndex: "999999",
          background: "#ffffff",
          padding: "12px 16px",
          border: "2px solid #531b91",
          borderRadius: "8px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
          font: "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
          maxWidth: "340px",
          lineHeight: "1.4",
          color: "#1e293b",
          transition: "all 0.2s ease"
        });
        document.body.appendChild(box);
      }
      box.style.borderColor = isError ? "#c0392b" : "#25845b";
      box.textContent = message;
    }
    async function extractLogoText() {
      const img = document.getElementById("captcha");
      console.log({ img });
      if (!img) {
        notice("Logo image element not found.", true);
        return null;
      }
      notice("Reading text from image...", false);
      let imageSource = img;
      try {
        const canvas = document.createElement("canvas");
        const scale = 3;
        canvas.width = (img.naturalWidth || img.width || 200) * scale;
        canvas.height = (img.naturalHeight || img.height || 50) * scale;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          imageSource = canvas.toDataURL("image/png");
        }
      } catch (e) {
        imageSource = img.src || img;
      }
      if (typeof import_tesseract.default === "undefined") {
        notice("Injecting OCR engine...", false);
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("node_modules/tesseract.js/dist/tesseract.min.js");
        (document.head || document.documentElement).appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
      try {
        const { data: { text } } = await import_tesseract.default.recognize(
          imageSource,
          "eng",
          {
            workerPath: chrome.runtime.getURL("tesseract-worker.min.js"),
            corePath: chrome.runtime.getURL("tesseract-core-simd-lstm.wasm.js"),
            langPath: chrome.runtime.getURL("tessdata/"),
            cacheMethod: "none",
            gzip: false,
            // IMPROVEMENT 2: Enforce strict character boundary whitelist.
            // This forces Tesseract to only output capital letters and numbers.
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            logger: (m) => {
              if (m.status === "recognizing text" && m.progress !== void 0) {
                notice(`Extracting text: ${Math.round(m.progress * 100)}%`, false);
              }
            }
          }
        );
        const cleaned = (text || "").replace(/[^A-Z0-9]/g, "").trim();
        console.log("[OCR Result] Extracted text (Whitelisted):", cleaned);
        notice(`OCR Extracted: ${cleaned}`, false);
        return cleaned;
      } catch (err) {
        console.error("Tesseract OCR single-thread injection failed:", err);
        notice("Failed to extract text from logo.", true);
        return null;
      }
    }
    function setValue(el, value) {
      if (!el || value === void 0 || value === null || value === "") return false;
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (setter) setter.call(el, String(value));
      else el.value = String(value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
    function findInput(terms) {
      const inputs = [...document.querySelectorAll("input:not([type=hidden]), textarea")].filter(
        (el) => el.offsetWidth || el.offsetHeight
      );
      const directMatch = inputs.find((el) => {
        const directContext = norm([
          el.id,
          el.name,
          el.placeholder,
          el.getAttribute("aria-label"),
          [...el.labels || []].map((x) => x.innerText || x.textContent).join(" ")
        ].join(" "));
        return terms.some((t) => directContext.includes(t));
      });
      if (directMatch) return directMatch;
      return inputs.find((el) => {
        const parent = el.closest && el.closest(".form-group, .form-row, td, tr, label") || el.parentElement;
        if (!parent || parent === document.body || parent.tagName === "FORM") return false;
        const parentText = norm(parent.innerText || parent.textContent);
        return terms.some((t) => parentText.includes(t));
      });
    }
    function waitFor(predicate, timeoutMs = 8e3, intervalMs = 200) {
      return new Promise((resolve) => {
        const start = Date.now();
        const check = () => {
          const res = predicate();
          if (res) return resolve(res);
          if (Date.now() - start >= timeoutMs) return resolve(null);
          setTimeout(check, intervalMs);
        };
        check();
      });
    }
    function extractDay(dateStr) {
      if (!dateStr) return null;
      const str = String(dateStr).trim();
      const ymd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (ymd) return parseInt(ymd[3], 10);
      const slash = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (slash) {
        const p1 = parseInt(slash[1], 10);
        const p2 = parseInt(slash[2], 10);
        if (p1 > 12) return p1;
        if (p2 > 12) return p2;
        return p1;
      }
      const num = parseInt(str, 10);
      if (!isNaN(num) && num >= 1 && num <= 31) return num;
      return null;
    }
    function findAvailableSlot(targetDay, targetDateIso = null) {
      const slots = [...document.querySelectorAll(".slot_available, .slot_available_reschedule, [data-booking_date]")];
      if (targetDay === null && !targetDateIso) {
        if (slots.length > 0) return slots[0];
        const cells2 = [...document.querySelectorAll("td, div[class*='cell'], div[class*='day']")];
        for (const cell of cells2) {
          const action = cell.querySelector("a, button, [class*='badge'], [class*='slot'], i.fa, i[class*='plus']");
          if (action) return action.closest && action.closest("a, button, [onclick]") || action;
        }
        return null;
      }
      if (slots.length > 0) {
        const match = slots.find((s) => {
          const bd = (s.getAttribute("data-booking_date") || s.dataset?.booking_date || s.dataset?.bookingDate || "").trim();
          if (targetDateIso && bd) {
            return bd === targetDateIso;
          }
          const ymd = bd.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
          if (ymd && parseInt(ymd[3], 10) === targetDay) return true;
          const cell = s.closest && s.closest("td, div[class*='cell'], div[class*='day']") || s.parentElement;
          if (cell) {
            const txt = (cell.innerText || cell.textContent || "").trim();
            const tokens = txt.split(/[\s\n\r\t]+/);
            if (tokens.some((t) => t.replace(/\D/g, "") === String(targetDay))) return true;
          }
          return false;
        });
        if (match) return match;
      }
      const cells = [...document.querySelectorAll("td, div[class*='cell'], div[class*='day']")];
      if (targetDay !== null) {
        const targetCell = cells.find((cell) => {
          const txt = (cell.innerText || cell.textContent || "").trim();
          const tokens = txt.split(/[\s\n\r\t]+/);
          return tokens.some((t) => t.replace(/\D/g, "") === String(targetDay));
        });
        if (targetCell) {
          const action = targetCell.querySelector("a, button, [class*='badge'], [class*='slot'], i.fa, i[class*='plus']");
          return action && action.closest && action.closest("a, button, [onclick]") || action || targetCell;
        }
      }
      return null;
    }
    function selectAndSubmitSlot(slotElement) {
      if (!slotElement) return false;
      try {
        slotElement.scrollIntoView?.({ behavior: "smooth", block: "center" });
        const bookingDate = (slotElement.getAttribute("data-booking_date") || slotElement.dataset?.booking_date || slotElement.dataset?.bookingDate || "").trim();
        const eventDateInputs = document.querySelectorAll(".event-date, input[name='event_date'], input[name='booking_date']");
        eventDateInputs.forEach((input) => {
          if (bookingDate) input.value = bookingDate;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
        const target = slotElement.closest && slotElement.closest(".slot_available") || slotElement;
        const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
        target.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
        target.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
        try {
          if (typeof PointerEvent !== "undefined") {
            const clickEvent = new PointerEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window
            });
            target.dispatchEvent(clickEvent);
          } else {
            target.click?.();
          }
        } catch (clickErr) {
          if (typeof target.onclick === "function") {
            target.onclick();
          } else {
            target.click?.();
          }
        }
        const form = target.closest && target.closest("form") || document.querySelector("form");
        if (form) {
          setTimeout(() => {
            if (window.location.href.includes("avilable-slot")) {
              try {
                HTMLFormElement.prototype.submit.call(form);
              } catch (e) {
                form.submit();
              }
            }
          }, 400);
        }
        return true;
      } catch (globalErr) {
        console.error("[Suvidha Assistant] Safe slot selection error handled:", globalErr);
        return false;
      }
    }
    async function handleAvailableSlots(profile) {
      notice("Processing slot selection...");
      const typeSelect = [...document.querySelectorAll("select")].find((sel) => {
        const context = norm([
          sel.id,
          sel.name,
          [...sel.labels || []].map((x) => x.innerText).join(" "),
          sel.parentElement?.innerText
        ].join(" "));
        return context.includes("type of goods") && (sel.offsetWidth || sel.offsetHeight);
      }) || document.querySelector("select");
      if (typeSelect && profile.goodsType) {
        const targetOption = [...typeSelect.options].find(
          (opt) => norm(opt.text).includes(norm(profile.goodsType))
        );
        if (targetOption && typeSelect.value !== targetOption.value) {
          typeSelect.value = targetOption.value;
          setValue(typeSelect, targetOption.value);
          notice(`Selected Type: ${targetOption.text}`);
        }
      }
      const goodsSelect = await waitFor(() => {
        const selects = [...document.querySelectorAll("select")].filter(
          (s) => s !== typeSelect && (s.offsetWidth || s.offsetHeight)
        );
        return selects.find((s) => s.options.length > 1) || null;
      }, 6e3);
      if (goodsSelect && profile.goodsCategory) {
        const targetCat = norm(profile.goodsCategory);
        const catOption = [...goodsSelect.options].find((opt) => {
          const txt = norm(opt.text);
          return txt.includes(targetCat) || targetCat.includes(txt);
        });
        if (catOption && goodsSelect.value !== catOption.value) {
          goodsSelect.value = catOption.value;
          setValue(goodsSelect, catOption.value);
          notice(`Selected Category: ${catOption.text}`);
        }
      }
      if (profile.autoSlot !== false) {
        const isFirstAvailable = profile.slotMode === "first" || !profile.slotMode && !profile.slotDate;
        const rawSlotDate = isFirstAvailable ? "" : (profile.slotDate || "").trim();
        const targetDateIso = /^\d{4}-\d{2}-\d{2}$/.test(rawSlotDate) ? rawSlotDate : null;
        const targetDay = isFirstAvailable ? null : extractDay(rawSlotDate);
        const slotElement = await waitFor(() => {
          return findAvailableSlot(targetDay, targetDateIso);
        }, 8e3);
        if (slotElement) {
          const label = targetDateIso || (targetDay ? `day ${targetDay}` : "first available date");
          notice(`Found available slot for ${label}. Opening booking form...`, false);
          setTimeout(() => selectAndSubmitSlot(slotElement), 350);
          return `Slot selected for ${label}. Opening booking form...`;
        } else {
          const msg = rawSlotDate ? `Selected date (${rawSlotDate}) is not available. Please click a slot (+) manually.` : "Calendar loaded. Please click the desired slot (+).";
          notice(msg, Boolean(rawSlotDate));
          return "Waiting for manual slot click.";
        }
      }
      return "Slot selection complete.";
    }
    function handleBookingForm(p) {
      notice("Filling booking details...");
      const fields = [
        [
          ["goods you want to export", "name of the goods", "name of goods", "goods name"],
          p.goods,
          "Goods"
        ],
        [
          ["25 alphanumeric udin", "udin of lc", "udin"],
          p.udin,
          "UDIN"
        ],
        [
          ["enter the lc number", "lc number", "lc no"],
          p.lcNumber,
          "LC number"
        ],
        [
          ["mm/dd/yyyy", "lc date"],
          p.lcDate,
          "LC date"
        ],
        [
          ["name of the importer", "name of importer", "importer name", "importer"],
          p.importer,
          "Importer"
        ],
        [
          ["enter total number of vehicle", "total number of vehicles", "number of vehicles", "vehicles"],
          p.vehicles,
          "Vehicles"
        ]
      ];
      const filled = [];
      fields.forEach(([terms, val, label]) => {
        if (val === void 0 || val === null || val === "") return;
        const el = findInput(terms);
        if (el) {
          let formattedVal = val;
          if (label === "LC date" && el.type !== "date" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
            const [yyyy, mm, dd] = val.split("-");
            formattedVal = `${mm}/${dd}/${yyyy}`;
          }
          if (setValue(el, formattedVal)) filled.push(label);
        }
      });
      const calculate = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")].find((el) => {
        const txt = norm(el.innerText || el.value || "");
        return txt.includes("calculate") && (el.offsetWidth || el.offsetHeight);
      });
      if (calculate) {
        calculate.addEventListener?.("click", async () => {
          const text = await extractLogoText();
          const logoInput = findInput(["captchavalue", "captchaValue", "captcha"]);
          if (logoInput) {
            logoInput.scrollIntoView?.({ behavior: "smooth", block: "center" });
            logoInput.focus();
            console.log({ text });
            const extractedText = text;
            if (extractedText) {
              logoInput.value = extractedText;
              logoInput.dispatchEvent(new Event("input", { bubbles: true }));
              logoInput.dispatchEvent(new Event("change", { bubbles: true }));
              notice(`Typed full code: ${extractedText}`, false);
              setTimeout(() => {
                const paymentBtn = [...document.querySelectorAll("button, input[type=submit], input[type=button], a")].find((el) => {
                  const txt = norm(el.innerText || el.value || el.textContent || "");
                  return txt.includes("proceed to payment") && (el.offsetWidth || el.offsetHeight);
                });
                if (paymentBtn) {
                  notice("Clicking Proceed to payment...", false);
                  const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
                  paymentBtn.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
                  paymentBtn.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
                  paymentBtn.click();
                } else {
                  notice("Proceed to payment button not found.", true);
                }
              }, 350);
            }
          }
        });
      }
      if (p.autoCalc !== false) {
        if (calculate) {
          setTimeout(() => {
            const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
            calculate.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
            calculate.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
            calculate.click();
          }, 250);
          notice("Autofill complete. Calculate clicked. Enter logo.", false);
        } else {
          notice("Autofill complete. Please click Calculate manually.", false);
        }
      } else {
        notice("Autofill complete. Enter logo.", false);
      }
      return filled;
    }
    async function selectDropdownOption(containerOrSelect, optionText) {
      if (!containerOrSelect) return false;
      const normTarget = norm(optionText);
      if (containerOrSelect.tagName === "SELECT") {
        const opt = [...containerOrSelect.options].find((o) => norm(o.text).includes(normTarget));
        if (opt) {
          containerOrSelect.value = opt.value;
          setValue(containerOrSelect, opt.value);
          return true;
        }
      }
      const trigger = containerOrSelect.querySelector?.(".mat-select-trigger, [cdk-overlay-origin], mat-select") || (containerOrSelect.classList?.contains("mat-select-trigger") ? containerOrSelect : null) || containerOrSelect;
      const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
      trigger.focus?.();
      trigger.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
      trigger.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
      trigger.click();
      trigger.dispatchEvent(new EventCtor("click", { bubbles: true, cancelable: true, view: window }));
      const option = await waitFor(() => {
        const options = [...document.querySelectorAll("mat-option, .mat-option, [role='option']")].filter(
          (el) => el.offsetWidth || el.offsetHeight
        );
        return options.find((el) => {
          const txt = norm(el.innerText || el.textContent || "");
          return txt === normTarget || txt.includes(normTarget);
        }) || null;
      }, 4500, 150);
      if (option) {
        await new Promise((r) => setTimeout(r, 150));
        option.scrollIntoView?.({ block: "nearest" });
        option.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
        option.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
        option.click();
        option.dispatchEvent(new EventCtor("click", { bubbles: true, cancelable: true, view: window }));
        await new Promise((r) => setTimeout(r, 300));
        return true;
      }
      return false;
    }
    async function handleGripsPayment(profile) {
      notice("GRIPS Payment page detected...", false);
      const checkbox = await waitFor(() => {
        const checkboxes = [...document.querySelectorAll("input[type='checkbox']")];
        return checkboxes.find((cb) => {
          const context = norm([
            cb.id,
            cb.name,
            cb.parentElement?.innerText,
            cb.closest("label, div, p")?.innerText
          ].join(" "));
          return context.includes("verified and checked") || context.includes("verified");
        }) || null;
      }, 2500);
      if (checkbox && !checkbox.checked) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        checkbox.dispatchEvent(new Event("input", { bubbles: true }));
        checkbox.click();
        notice("Checked 'Verified and checked'. Clicking Next...", false);
        await new Promise((r) => setTimeout(r, 400));
        const nextBtn = await waitFor(() => {
          const buttons = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")];
          return buttons.find((btn) => {
            const txt = norm(btn.innerText || btn.value || "");
            return (txt === "next" || txt.includes("next")) && (btn.offsetWidth || btn.offsetHeight) && !btn.disabled;
          }) || null;
        }, 3e3);
        if (nextBtn) {
          nextBtn.click();
          notice("Review step completed. Loading Payment Mode selection...", false);
        }
      }
      notice("Loading Payment Mode & Bank Selection...", false);
      await new Promise((r) => setTimeout(r, 800));
      const paymentModeSelect = await waitFor(() => {
        const byLabel = document.querySelector("mat-select[aria-labelledby*='mat-form-field-label-1'], #mat-select-0");
        if (byLabel && (byLabel.offsetWidth || byLabel.offsetHeight)) return byLabel;
        const allSelects = [...document.querySelectorAll("mat-select, [role='combobox']")].filter(
          (el) => el.offsetWidth || el.offsetHeight
        );
        const match = allSelects.find((el) => {
          const labelText = norm(el.closest(".mat-form-field")?.querySelector(".mat-form-field-label")?.innerText || "");
          return labelText.includes("payment mode");
        });
        return match || allSelects[0] || null;
      }, 1e4, 200);
      if (paymentModeSelect) {
        notice("Selecting Payment Mode: SBI Epay...", false);
        const paymentModeTarget = profile.paymentMode || "SBI Epay";
        await selectDropdownOption(paymentModeSelect, paymentModeTarget);
        await new Promise((r) => setTimeout(r, 1200));
        const payThroughSelect = await waitFor(() => {
          const byLabel = document.querySelector("mat-select[aria-labelledby*='mat-form-field-label-3'], #mat-select-2");
          if (byLabel && (byLabel.offsetWidth || byLabel.offsetHeight)) return byLabel;
          const allSelects = [...document.querySelectorAll("mat-select, [role='combobox']")].filter(
            (el) => (el.offsetWidth || el.offsetHeight) && el !== paymentModeSelect
          );
          const match = allSelects.find((el) => {
            const labelText = norm(el.closest(".mat-form-field")?.querySelector(".mat-form-field-label")?.innerText || "");
            return labelText.includes("pay through") || labelText.includes("bank");
          });
          return match || allSelects[0] || null;
        }, 8e3, 200);
        if (payThroughSelect) {
          notice("Selecting Pay through: Payment Gateway/Bank...", false);
          const payThroughTarget = profile.payThrough || "Payment Gateway";
          await selectDropdownOption(payThroughSelect, payThroughTarget);
          await new Promise((r) => setTimeout(r, 800));
          const nextBtn2 = await waitFor(() => {
            const buttons = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")];
            return buttons.find((btn) => {
              const txt = norm(btn.innerText || btn.value || "");
              return (txt === "next" || txt.includes("next")) && (btn.offsetWidth || btn.offsetHeight) && !btn.disabled;
            }) || null;
          }, 6e3, 200);
          if (nextBtn2) {
            nextBtn2.scrollIntoView?.({ block: "center" });
            nextBtn2.click();
            notice("Selected SBI Epay & Payment Gateway. Clicked Next.", false);
          }
        }
      }
      notice("Waiting for Transaction Details & Pay Now button...", false);
      const payNowBtn = await waitFor(() => {
        const buttons = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")];
        return buttons.find((btn) => {
          const txt = norm(btn.innerText || btn.value || "");
          return (txt === "pay now" || txt.includes("pay now")) && (btn.offsetWidth || btn.offsetHeight) && !btn.disabled;
        }) || null;
      }, 12e3, 300);
      if (payNowBtn) {
        await new Promise((r) => setTimeout(r, 600));
        payNowBtn.scrollIntoView?.({ block: "center" });
        payNowBtn.click();
        notice("Pay Now clicked! Redirecting to Payment Gateway...", false);
        return "Pay Now clicked. Final payment redirect in progress.";
      }
      return "GRIPS payment automation in progress.";
    }
    async function handleSbiEpay() {
      notice("SBI ePay gateway detected. Selecting NEFT tab...", false);
      const neftTab = await waitFor(() => {
        const direct = document.querySelector("#activeNEFT a, li#activeNEFT, a.collapse5");
        if (direct && (direct.offsetWidth || direct.offsetHeight)) return direct;
        const navLinks = [...document.querySelectorAll(".side_nav a, .side_nav li, a, button")].filter(
          (el) => el.offsetWidth || el.offsetHeight
        );
        return navLinks.find((el) => {
          const txt = norm(el.innerText || el.textContent || "");
          return txt === "neft" || txt.includes("neft");
        }) || null;
      }, 1e4, 200);
      if (neftTab) {
        await new Promise((r) => setTimeout(r, 400));
        neftTab.scrollIntoView?.({ block: "center" });
        const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
        neftTab.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
        neftTab.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
        neftTab.click();
        neftTab.dispatchEvent(new EventCtor("click", { bubbles: true, cancelable: true, view: window }));
        notice("NEFT selected! Ready for Pay Now.", false);
        return "NEFT tab selected on SBI ePay.";
      } else {
        notice("NEFT tab not found on SBI ePay.", true);
        return "NEFT tab not found.";
      }
    }
    async function runAction(profile) {
      const url = window.location.href;
      if (url.includes("avilable-slot")) {
        const res = await handleAvailableSlots(profile);
        return res;
      } else if (url.includes("slot-booking") || url.includes("booking")) {
        const filled = handleBookingForm(profile);
        return "Filled: " + (filled.join(", ") || "No matching fields found");
      } else if (url.includes("wbifms.gov.in") || url.includes("g2-payment") || url.includes("GRIPS")) {
        const res = await handleGripsPayment(profile);
        return res;
      } else if (url.includes("epay.sbi.bank.in") || url.includes("AggregatorHostedListener")) {
        const res = await handleSbiEpay();
        return res;
      } else {
        notice("Ready. Navigate to slot, booking or payment page.", false);
        return "Current page is not recognized as slot, booking, or payment form.";
      }
    }
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg?.type === "SUVIDHA_TRIGGER" || msg?.type === "SUVIDHA_AUTOFILL") {
        runAction(msg.profile || {}).then((resMsg) => {
          sendResponse({ message: resMsg });
        });
        return true;
      }
    });
    chrome.storage.local.get("profile", ({ profile }) => {
      const isPaymentPortal = window.location.href.includes("wbifms.gov.in") || window.location.href.includes("g2-payment") || window.location.href.includes("epay.sbi.bank.in");
      if (profile?.autoRun || isPaymentPortal) {
        setTimeout(() => runAction(profile || {}), 600);
      }
    });
    new MutationObserver(() => {
      const text = norm(document.body?.textContent);
      if (text.includes("logo code does not match")) {
        notice("logo failed. Please check and enter it again.", true);
      }
    }).observe(document.body, { subtree: true, childList: true });
  })();
})();
//# sourceMappingURL=content.js.map
