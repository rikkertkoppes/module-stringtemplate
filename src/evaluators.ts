import { Expr, Name, Node } from "./types";

function evalExpr(node: Expr, context: any): string {
    switch (node.operator) {
        case "||": {
            return (
                evaluate([node.left], context) ||
                evaluate([node.right], context)
            );
        }
        case "?": {
            let test = evaluate([node.left], context);
            if (node.right.type !== "expr" || node.right.operator !== ":") {
                throw new Error("expected : in ternary operator");
            }
            return test
                ? evaluate([node.right.left], context)
                : evaluate([node.right.right], context);
        }
        default:
            return "";
    }
}

function evalName(node: Name, context: any) {
    let parts = node.value;
    let identOrIndex = parts.shift();
    var value = context[identOrIndex?.value ?? ""];
    while (parts.length && value) {
        let identOrIndex = parts.shift();
        let key = identOrIndex?.value ?? "";
        if (Array.isArray(value) && identOrIndex?.type === "ident") {
            value = value.map((v) => v[key]);
        } else {
            value = value[key];
        }
    }
    return value || "";
}

export function evaluate(ast: Node[], context: any): string {
    return ast.reduce((str, node) => {
        switch (node.type) {
            case "wrapped": {
                let r = evaluate([node.value], context);
                return str ? str + "" + r : r;
            }
            case "text": {
                let r = node.value;
                return str ? str + "" + r : r;
            }
            case "number": {
                let r = node.value.toString();
                return str ? str + "" + r : r;
            }
            case "name": {
                let r = evalName(node, context);
                return str ? str + "" + r : r;
            }
            case "expr": {
                let r = evalExpr(node, context);
                return str ? str + "" + r : r;
            }
            default:
                return str;
        }
    }, "");
}
