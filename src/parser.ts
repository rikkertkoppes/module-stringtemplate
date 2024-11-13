import { any, many, optional, sequence } from "./combinators";
import { map } from "./helpers";
import { regex, str } from "./parsers";
import { Comb, Expr, Ident, Name, Text, Node, Num, Index } from "./types";

function tokenize(str: string): string[] {
    return str.split(/(\w+|\|\||\s+|\$\{|\}|[\.\?"'])/g).filter((x) => !!x);
}

// parsers
// identifier
const ident = map<string, Ident>(
    regex(/[_a-zA-Z][_a-zA-Z0-9]*/g, "identifier"),
    (value) => ({
        type: "ident",
        value,
    })
);
const index = map<string, Index>(regex(/[0-9]+/g, "identifier"), (value) => ({
    type: "index",
    value: parseInt(value, 10),
}));
const whitespace = optional(regex(/\s+/, "whitespace"));

const identOrIndex = any<any>([ident, index]);

const trailingIdent = map<any, Ident>(
    sequence<any>([str("."), identOrIndex]),
    ([dot, value]) => value
);
// name = ident ('.' ident)*
const name = map<any, Name>(
    sequence<any>([identOrIndex, many(trailingIdent)]),
    ([variable, rest]) => ({
        type: "name",
        value: [variable, ...rest],
    })
);

const string = map<any, Text>(
    any([
        sequence<any>([
            str('"'),
            map(many(regex(/[^"]+/, "string literal")), (value) =>
                value.join("")
            ),
            str('"'),
        ]),
        sequence<any>([
            str("'"),
            map(many(regex(/[^']+/, "string literal")), (value) =>
                value.join("")
            ),
            str("'"),
        ]),
    ]),
    ([open, value, close]) => {
        return { type: "text", value };
    }
);

const number = map<string, Num>(
    regex(/^[0-9]+(\.[0-9]+)?$/, "numeric value"),
    (num) => ({
        type: "number",
        value: parseFloat(num),
    })
);

const value = any<any>([name, string, number]);

// combinator = '||'
const combinator = (operator: string) =>
    map<any, Comb>(
        sequence<any>([whitespace, str(operator), whitespace]),
        () => ({ type: "comb", operator })
    );

const or = combinator("||");
// TODO: ternary is a bit hacky here
const cond = combinator("?");
const els = combinator(":");

const op = any([or, cond, els]);

// making a tree out of a list of expression parts
function toTree(name: Name, [first, ...rest]: any[]): Expr {
    return {
        type: "expr",
        operator: first[0].operator,
        left: name,
        right: rest.length ? toTree(first[1], rest) : first[1],
    };
}

// expr = name (combinator name)*
const expr = map<any, Expr>(
    sequence<any>([name, many(sequence<any>([op, value]))]),
    ([first, rest]) => {
        if (rest.length) {
            let tree = toTree(first, rest);
            return tree;
        } else {
            return first;
        }
    }
);

// TODO: work with lazy evaluation like so, to be able to use recursion
// function binary() {
//     return sequence<any>([name, op, expr2()]);
// }
// function expr2() {
//     return any([binary()])
// or let any evaluate the function
//     return any([binary])
// }

// wrapped expression in template
const wrapped = map<any, Node>(
    sequence<any>([str("${"), whitespace, expr, whitespace, str("}")]),
    ([left, s1, inner, s2, right]) => ({
        type: "wrapped",
        value: inner,
    })
);
// text in template
const text = map<string, Text>(regex(/((?!\$\{).)+/s, "any text"), (value) => ({
    type: "text",
    value,
}));
const token = any<any>([wrapped, text]);
const template = many(token);

export function parse(str: string): Node[] {
    let tokens = tokenize(str);
    // console.log(tokens);
    let context = { tokens, index: 0 };
    let result = template(context);
    if (result.ctx.index !== tokens.length) {
        console.error(
            `unexpected: ${tokens[result.ctx.index]} at ${
                result.ctx.index
            }. Template: ${str}`
        );
        return [];
    }
    if (!result.success) {
        return [];
    }
    // console.log(JSON.stringify(result.value, null, 2));
    return result.value;
}
