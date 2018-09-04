const resources = require('./scripts/haul-resources');
const haulConfigOptions = {
    "entryFile": "./src/index.ts"
}

export default resources.createHaulConfig(haulConfigOptions);