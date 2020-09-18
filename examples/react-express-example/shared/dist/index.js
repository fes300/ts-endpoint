"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
var t = __importStar(require("io-ts"));
var NumberFromString_1 = require("io-ts-types/lib/NumberFromString");
var ts_endpoint_1 = require("ts-endpoint");
var User = t.strict({
    name: t.string,
    surname: t.string,
    age: t.number,
});
exports.getUser = ts_endpoint_1.Endpoint({
    Method: "GET",
    getPath: function (_a) {
        var id = _a.id;
        return "user/" + id;
    },
    Output: t.strict({ user: User }),
    Input: {
        Params: { id: NumberFromString_1.NumberFromString },
    },
});
//# sourceMappingURL=index.js.map