import { interpolate } from "../src";

describe("template", () => {
    test("should a single expression", () => {
        expect(interpolate("${name}", { name: "world" })).toEqual("world");
    });
    test("should an expression as part of a string", () => {
        expect(interpolate("hello ${name}", { name: "world" })).toEqual(
            "hello world"
        );
    });
});

describe("deep string", () => {
    test("should return a deeper value", () => {
        expect(interpolate("${foo.bar}", { foo: { bar: "baz" } })).toEqual(
            "baz"
        );
    });
    test("should return a deeper numeric value", () => {
        expect(interpolate("${foo.bar}", { foo: { bar: 42 } })).toEqual(42);
    });
    test("should return a deeper array value", () => {
        expect(interpolate("${foo.bar}", { foo: { bar: [1, 2, 3] } })).toEqual([
            1, 2, 3,
        ]);
    });
});

describe("array mapping", () => {
    test("should index into an array", () => {
        expect(
            interpolate("${foo.0}", { foo: ["bar1", "bar2", "bar3"] })
        ).toEqual("bar1");
    });
    test("should map an array if it skipped", () => {
        expect(
            interpolate("${foo.bar}", {
                foo: [{ bar: "bar1" }, { bar: "bar2" }, { bar: "bar3" }],
            })
        ).toEqual(["bar1", "bar2", "bar3"]);
    });
});

describe("or operator", () => {
    test("should should return first when found", () => {
        expect(
            interpolate("hello ${name || 'anon'}", { name: "world" })
        ).toEqual("hello world");
    });
    test("should return second when not found", () => {
        expect(
            interpolate("hello ${name || 'anon'}", { notname: "world" })
        ).toEqual("hello anon");
    });
    test("should return second when false", () => {
        expect(interpolate("hello ${name || 'anon'}", { name: false })).toEqual(
            "hello anon"
        );
    });
    test("should return second when undefined", () => {
        expect(
            interpolate("hello ${name || 'anon'}", { name: undefined })
        ).toEqual("hello anon");
    });
    test("should return second when null", () => {
        expect(interpolate("hello ${name || 'anon'}", { name: null })).toEqual(
            "hello anon"
        );
    });
    test("should return second when empty", () => {
        expect(interpolate("hello ${name || 'anon'}", { name: "" })).toEqual(
            "hello anon"
        );
    });
    test("should return second when 0", () => {
        expect(interpolate("hello ${name || 'anon'}", { name: 0 })).toEqual(
            "hello anon"
        );
    });
    test("should return alternative expression when not found", () => {
        expect(
            interpolate("hello ${name || lastname}", { lastname: "mars" })
        ).toEqual("hello mars");
    });
});
