"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adapter = exports.Schema = exports.output = exports.input = exports.map = exports.type = exports.Type = exports.Map = exports.Transform = exports.setPath = exports.pathContainer = exports.access = exports.ETransformDirection = void 0;
var ETransformDirection;
(function (ETransformDirection) {
    ETransformDirection[ETransformDirection["INPUT"] = 0] = "INPUT";
    ETransformDirection[ETransformDirection["OUTPUT"] = 1] = "OUTPUT";
})(ETransformDirection = exports.ETransformDirection || (exports.ETransformDirection = {}));
function access(data, accessor) {
    if ([null, undefined].indexOf(data) > -1)
        return null;
    var parts = accessor.split('.');
    var current = parts.shift();
    var value = current === undefined ? null : data[current];
    if (parts.length > 0)
        return typeof value === 'object' ? access(value, parts.join('.')) : null;
    return value;
}
exports.access = access;
function pathContainer(data, accessor) {
    if ([null, undefined].indexOf(data) > -1)
        data = {};
    var parts = accessor.split('.');
    var current = parts.shift();
    if (current === undefined)
        return null;
    if (data[current] === undefined)
        data[current] = {};
    if (parts.length === 1)
        return data[current];
    return pathContainer(data[current], parts.join('.'));
}
exports.pathContainer = pathContainer;
function setPath(data, accessor, value) {
    if ([null, undefined].indexOf(data) > -1)
        return;
    var parts = accessor.split('.');
    var current = parts.shift();
    if (current === undefined)
        return;
    if (parts.length > 0 && data[current] === undefined)
        data[current] = {};
    if (parts.length === 0) {
        data[current] = value;
        return;
    }
    setPath(data[current], parts.join('.'), value);
}
exports.setPath = setPath;
var Transform = /** @class */ (function () {
    function Transform(direction, func, schema, from, to) {
        this.direction = direction;
        this.func = func;
        this.schema = schema;
        this.from = from instanceof Array ? from : [from];
        this.to = to instanceof Array ? to : [to];
    }
    return Transform;
}());
exports.Transform = Transform;
var Map = /** @class */ (function () {
    function Map(key, schema, accessor) {
        this.key = key;
        this.schema = schema;
        this.accessor = accessor;
    }
    return Map;
}());
exports.Map = Map;
var Type = /** @class */ (function () {
    function Type(value) {
        this.value = this.cast(value);
    }
    Type.prototype.cast = function (value) {
        return value;
    };
    return Type;
}());
exports.Type = Type;
function type(t) {
    return function (target, key) {
        target.constructor.addType(key, t);
    };
}
exports.type = type;
function map(schema, accessor) {
    return function (target, key) {
        target.constructor.addMap(new Map(key, schema, accessor));
    };
}
exports.map = map;
function input(schema, from, to) {
    return function (target, func) {
        target.constructor.addTransform(new Transform(ETransformDirection.INPUT, func, schema, from, to));
    };
}
exports.input = input;
function output(schema, from, to) {
    return function (target, func) {
        target.constructor.addTransform(new Transform(ETransformDirection.OUTPUT, func, schema, from, to));
    };
}
exports.output = output;
var Schema = /** @class */ (function () {
    function Schema() {
        this.accessors = [];
        this.transforms = [];
        this._maps = [];
    }
    Schema.prototype.addAccessor = function (accessor) {
        if (this.accessors.indexOf(accessor) === -1)
            this.accessors.push(accessor);
    };
    Schema.prototype.addTransform = function (transform) {
        this.transforms.push(transform);
    };
    Schema.prototype.addMap = function (map) {
        this._maps.push(map);
        this.addAccessor(map.accessor);
    };
    Schema.prototype.getTransforms = function (direction) {
        return this.transforms.filter(function (transform) { return transform.direction === direction; });
    };
    Object.defineProperty(Schema.prototype, "inputs", {
        get: function () {
            return this.getTransforms(ETransformDirection.INPUT);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "outputs", {
        get: function () {
            return this.getTransforms(ETransformDirection.OUTPUT);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Schema.prototype, "maps", {
        get: function () {
            return this._maps;
        },
        enumerable: false,
        configurable: true
    });
    return Schema;
}());
exports.Schema = Schema;
var Adapter = /** @class */ (function () {
    function Adapter() {
    }
    Adapter.prototype.schema = function (schema) {
        return this.constructor.schemas ? this.constructor.schemas[schema] : null;
    };
    Adapter.prototype.type = function (t) {
        return this.constructor.types ? this.constructor.types[t] : null;
    };
    Adapter.prototype.from = function (schema, inputData) {
        return __awaiter(this, void 0, void 0, function () {
            var _schema, _i, _a, map_1, t, _b, _c, input_1, inputValues, _d, _e, t, out, i;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _schema = this.schema(schema);
                        if (!_schema)
                            return [2 /*return*/];
                        for (_i = 0, _a = _schema.maps; _i < _a.length; _i++) {
                            map_1 = _a[_i];
                            t = this.type(map_1.key) || Type;
                            this[map_1.key] = new t(access(inputData, map_1.accessor)).value;
                        }
                        _b = 0, _c = _schema.inputs;
                        _g.label = 1;
                    case 1:
                        if (!(_b < _c.length)) return [3 /*break*/, 4];
                        input_1 = _c[_b];
                        inputValues = [];
                        for (_d = 0, _e = input_1.from; _d < _e.length; _d++) {
                            t = _e[_d];
                            inputValues.push(access(inputData, t));
                        }
                        return [4 /*yield*/, (_f = this)[input_1.func].apply(_f, inputValues)];
                    case 2:
                        out = _g.sent();
                        if (input_1.to.length === 1) {
                            this[input_1.to[0]] = out;
                        }
                        else {
                            for (i = 0; i < input_1.to.length; i++) {
                                this[input_1.to[i]] = out[i];
                            }
                        }
                        _g.label = 3;
                    case 3:
                        _b++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Adapter.prototype.to = function (schema) {
        return __awaiter(this, void 0, void 0, function () {
            var _schema, data, _i, _a, map_2, _b, _c, output_1, outputValues, _d, _e, t, out, i;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _schema = this.schema(schema);
                        data = {};
                        if (!_schema)
                            return [2 /*return*/, data];
                        for (_i = 0, _a = _schema.maps; _i < _a.length; _i++) {
                            map_2 = _a[_i];
                            setPath(data, map_2.accessor, access(this, map_2.key));
                        }
                        _b = 0, _c = _schema.outputs;
                        _g.label = 1;
                    case 1:
                        if (!(_b < _c.length)) return [3 /*break*/, 4];
                        output_1 = _c[_b];
                        outputValues = [];
                        for (_d = 0, _e = output_1.from; _d < _e.length; _d++) {
                            t = _e[_d];
                            outputValues.push(access(this, t));
                        }
                        return [4 /*yield*/, (_f = this)[output_1.func].apply(_f, outputValues)];
                    case 2:
                        out = _g.sent();
                        if (output_1.to.length === 1) {
                            setPath(data, output_1.to[0], out);
                        }
                        else {
                            for (i = 0; i < output_1.to.length; i++) {
                                setPath(data, output_1.to[i], out[i]);
                            }
                        }
                        _g.label = 3;
                    case 3:
                        _b++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, data];
                }
            });
        });
    };
    Adapter.addTransform = function (transform) {
        this.schema(transform.schema).addTransform(transform);
    };
    Adapter.addMap = function (map) {
        this.schema(map.schema).addMap(map);
    };
    Adapter.addType = function (prop, t) {
        if (!this.types)
            this.types = {};
        this.types[prop] = t;
    };
    Adapter.schema = function (schema) {
        if (!this.schemas)
            this.schemas = {};
        if (!this.schemas[schema])
            this.schemas[schema] = new Schema();
        return this.schemas[schema];
    };
    return Adapter;
}());
exports.Adapter = Adapter;
//# sourceMappingURL=Adapter.js.map