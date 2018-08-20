const resources = require('./scripts/haul-resources');
const haulConfigOptions = {
    "entryFile": "./functions.ts"
}

export default resources.createHaulConfig(haulConfigOptions);