// want to allow a subset of js, with conditionals

// every parsing function will have this signature
export type Parser<T> = (ctx: Context) => Result<T>;

// to track progress through our input string.
// we should make this immutable, because we can.
export type Context = Readonly<{
    tokens: string[]; // the full input string
    index: number; // our current position in it
}>;

// our result types
export type Result<T> = Success<T> | Failure;

// on success we'll return a value of type T, and a new Ctx
// (position in the string) to continue parsing from
export type Success<T> = Readonly<{
    success: true;
    value: T;
    ctx: Context;
}>;

// when we fail we want to know where and why
export type Failure = Readonly<{
    success: false;
    expected: string;
    ctx: Context;
}>;

export type Wrapped = { type: "wrapped"; value: Node };
export type Text = { type: "text"; value: string };
export type Num = { type: "number"; value: number };
export type Ident = { type: "ident"; value: string };
export type Name = { type: "name"; value: Ident[] };
export type Comb = { type: "comb"; operator: string };
export type Expr = { type: "expr"; operator: string; left: Node; right: Node };
export type Node = Text | Wrapped | Num | Ident | Name | Expr;
