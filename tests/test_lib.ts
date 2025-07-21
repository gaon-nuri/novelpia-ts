import {jest} from "@jest/globals";
import {FunctionLike} from "jest-mock";

type Mock<T extends FunctionLike> = jest.Mock<T>;

const stubFn = () => jest.fn();
const mockFn = (fn: FunctionLike) => jest.fn(fn);

export type {
    Mock
}

export {
    mockFn,
    stubFn
}