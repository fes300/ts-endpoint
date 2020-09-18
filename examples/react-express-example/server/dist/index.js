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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var shared_1 = require("shared");
var ts_endpoint_express_1 = require("ts-endpoint-express");
var express_1 = __importDefault(require("express"));
var TA = __importStar(require("fp-ts/lib/TaskEither"));
var E = __importStar(require("fp-ts/lib/Either"));
var pipeable_1 = require("fp-ts/lib/pipeable");
var errors_1 = require("ts-endpoint/lib/shared/errors");
var users = [
    { id: 1, name: "John", surname: "Doe", age: 22 },
    { id: 2, name: "Michael", surname: "Black", age: 51 },
];
function getUserFromDB(id) {
    return TA.fromEither(E.fromNullable("user not found")(users.find(function (u) { return u.id === id; })));
}
var app = express_1.default();
var router = express_1.default.Router();
ts_endpoint_express_1.AddEndpoint(router)(shared_1.getUser, function (_a) {
    var id = _a.params.id;
    var user = getUserFromDB(id);
    return pipeable_1.pipe(user, TA.mapLeft(function (e) { return new errors_1.IOError(404, e, { kind: "ClientError" }); }), TA.map(function (userFromDB) { return ({
        body: { user: userFromDB },
        statusCode: 200,
    }); }));
});
app.use(router);
var port = 3000;
app.listen(port, function () {
    console.log("Example app listening at http://localhost:" + port);
});
