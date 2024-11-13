# String template library

usage:

```js
import { interpolate } from "StringTemplate";

interpolate("hello ${subject}", { subject: "world" });
```

The library interpolates stuff between `${` and `}`, much like other libraries. However, there are some additional operators, which makes it different than most and more like native JavaScript template strings (but without everything else that JavaScript can do)

You can also use array indices as part of the interpolation string

You can also skip array indices, in which case, the deeper values get mapped

available operators:

-   or operator eg: `${subject || 'fallback'}`
-   ternary: `${bool? 'true': 'false'}`

```bnf
    expr = value (combinator value)*
    value = name | string | number
    name = ident ('.' ident)*
    combinator = ws? operator ws?
    operator = '||' | '?' | ':'
```
