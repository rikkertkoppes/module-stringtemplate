import { evaluate } from "./evaluators";
import { parse } from "./parser";

export function interpolate(str: string, context: any): string {
    let ast = parse(str);
    let result = evaluate(ast, context);
    // console.log(ast, context);
    // console.log(result);
    return result;
}

export function deepInterpolate(
    obj: string | Record<string, any>,
    context: any = {}
) {
    if (typeof obj === "string") {
        return interpolate(obj, context);
    }
    // base case
    if (obj === null) return obj;
    if (typeof obj !== "object") return obj;
    // recurse into arrays
    if (Array.isArray(obj)) {
        return obj.map((v) => deepInterpolate(v, context));
    }
    // recurse into objects
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, deepInterpolate(v, context)])
    );
}
