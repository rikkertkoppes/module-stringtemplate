import { Expr, Name, Node } from "./types";

function evalExpr(node: Expr, context: any) {
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
    let parts = node.value.map((v) => v.value);
    var value = context[parts.shift() || ""];
    while (parts.length && value) {
        if (Array.isArray(value)) {
            value = value.map((v) => v[parts.shift() || ""]);
        } else {
            value = value[parts.shift() || ""];
        }
    }
    return value || "";
}

export function evaluate(ast: Node[], context: any) {
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
