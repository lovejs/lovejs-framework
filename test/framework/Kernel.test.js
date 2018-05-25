const Kernel = require("framework").Kernel;
const Response = require("components/http").Response;

const instance = new Kernel("dev", __dirname + "/../integration");

test("Create instance of a kernel", () => {
    expect(instance).toBeInstanceOf(Kernel);
});
