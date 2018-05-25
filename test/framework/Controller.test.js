const Controller = require("framework").Controller;
const Response = require("components/http").Response;

const instance = new Controller();

test("Create instance of a controller", () => {
    expect(instance).toBeInstanceOf(Controller);
});

test("Call Controller.json() should return a Response", () => {
    expect(instance.json({ test: "data" })).toBeInstanceOf(Response);
});

const mockContainer = { get: jest.fn(arg => Promise.resolve(arg)) };

instance.setContainer(mockContainer);

test("Call Controller.get() should return a service async", () => {
    return expect(instance.get("service")).resolves.toBe("service");
});
