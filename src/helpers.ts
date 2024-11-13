import { Context, Failure, Parser, Success } from "./types";

// some convenience methods to build `Result`s for us
export function success<T>(ctx: Context, value: T): Success<T> {
    return { success: true, value, ctx };
}

export function failure(ctx: Context, expected: string): Failure {
    return { success: false, expected, ctx };
}

// a convenience method that will map a Success to callback,
// to let us do common things like build AST nodes from input strings.
export function map<A, B>(parser: Parser<A>, fn: (val: A) => B): Parser<B> {
    return (ctx) => {
        const res = parser(ctx);
        return res.success ? success(res.ctx, fn(res.value)) : res;
    };
}
