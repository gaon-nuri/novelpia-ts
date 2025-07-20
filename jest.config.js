import {createDefaultPreset} from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
    preset: "ts-jest",
    transform: {
        ...tsJestTransformCfg,
    },
    moduleNameMapper: {
        "^@const": [
            '<rootDir>/src/const/const.main',
            '<rootDir>/src/const/const.setup',
        ],
        "^@official": [
            '<rootDir>/src/official/official.main',
            '<rootDir>/src/official/official.setup',
        ],
        "^@type": [
            '<rootDir>/src/types/enum.comment',
            '<rootDir>/src/types/type.comment',
            '<rootDir>/src/types/type.main',
            '<rootDir>/src/types/type.setup',
        ],
        "^@utils": '<rootDir>/src/utils/utils',
    }
};