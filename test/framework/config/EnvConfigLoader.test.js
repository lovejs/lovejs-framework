import EnvConfigLoader from "../../../src/framework/config/EnvConfigLoader";

const envs = {
    env1: "val1_bébé",
    project_dir: __dirname
};

const yaml = `
    services:
        s1:
            module: !env env1
            tags: blaat
        s2:
            tags: [a, b, c]
        s3:
            module: fu
            path: !project_dir /dude/fu/p
        s4:
            tags: [{name: dude, fu: lol}]
`;

const config = new EnvConfigLoader(envs);

const data = config.load(yaml, config.getParser("1.yml"));

console.log(require("util").inspect(data, { depth: null }));
