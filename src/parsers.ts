import { failure, success } from "./helpers";
import { Parser } from "./types";

// match an exact string or fail
export function str(match: string): Parser<string> {
    return (ctx) => {
        if (ctx.index >= ctx.tokens.length)
            return failure(ctx, "unexpected end of input");
        if (ctx.tokens[ctx.index] === match) {
            return success({ ...ctx, index: ctx.index + 1 }, match);
        } else {
            return failure(ctx, match);
        }
    };
}

// match a regexp or fail
export function regex(re: RegExp, expected: string): Parser<string> {
    return (ctx) => {
        if (ctx.index >= ctx.tokens.length)
            return failure(ctx, "unexpected end of input");
        const res = (ctx.tokens[ctx.index] || "").match(re);
        if (res) {
            return success({ ...ctx, index: ctx.index + 1 }, res[0]);
        } else {
            return failure(ctx, expected);
        }
    };
}
