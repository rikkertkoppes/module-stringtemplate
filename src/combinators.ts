import { success } from "./helpers";
import { Parser, Result } from "./types";

// try each matcher in order, starting from the same point in the input. return the first one that succeeds.
// or return the failure that got furthest in the input string.
// which failure to return is a matter of taste, we prefer the furthest failure because.
// it tends be the most useful / complete error message.
export function any<T>(parsers: Parser<T>[]): Parser<T> {
    return (ctx) => {
        let furthestRes: Result<T> | null = null;
        for (const parser of parsers) {
            const res = parser(ctx);
            if (res.success) return res;
            if (!furthestRes || furthestRes.ctx.index < res.ctx.index)
                furthestRes = res;
        }
        return furthestRes!;
    };
}

// match a parser, or succeed with null
export function optional<T>(parser: Parser<T>): Parser<T | null> {
    return any([parser, (ctx) => success(ctx, null)]);
}

// look for 0 or more of something, until we can't parse any more. note that this function never fails, it will instead succeed with an empty array.
export function many<T>(parser: Parser<T>): Parser<T[]> {
    return (ctx) => {
        let values: T[] = [];
        let nextCtx = ctx;
        while (true) {
            const res = parser(nextCtx);
            if (!res.success) break;
            values.push(res.value);
            nextCtx = res.ctx;
        }
        return success(nextCtx, values);
    };
}

// look for an exact sequence of parsers, or fail
export function sequence<T>(parsers: Parser<T>[]): Parser<T[]> {
    return (ctx) => {
        let values: T[] = [];
        let nextCtx = ctx;
        for (const parser of parsers) {
            const res = parser(nextCtx);
            if (!res.success) return res;
            values.push(res.value);
            nextCtx = res.ctx;
        }
        return success(nextCtx, values);
    };
}
