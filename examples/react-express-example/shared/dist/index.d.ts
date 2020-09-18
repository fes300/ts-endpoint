import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
export declare const getUser: import("ts-endpoint").EndpointInstance<Endpoint<"GET", t.ExactC<t.TypeC<{
    user: t.ExactC<t.TypeC<{
        name: t.StringC;
        surname: t.StringC;
        age: t.NumberC;
    }>>;
}>>, undefined, undefined, undefined, {
    id: import("io-ts-types/lib/NumberFromString").NumberFromStringC;
}>>;
//# sourceMappingURL=index.d.ts.map