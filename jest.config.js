/** @type {import("jest").Config} **/
export default {
    moduleNameMapper: {
        "^@const": [
            '<rootDir>/src/const/main',
        ],
        "^@official": [
            '<rootDir>/src/official/main',
        ],
        "^@type": [
            '<rootDir>/src/enum/comment',
            '<rootDir>/src/types/comment',
        ],
        "^@utils": '<rootDir>/src/utils/utils',
    }
};