import {describe, expect, it} from "@jest/globals"
import {get_random_int} from "../../src/utils/utils";

describe("get_random_int unit test", () => {
    const max_loop_cnt = 100;

    it.each([
        [1, 10],
        [10, 1],
        [1, 1],
        [-10, -1],
        [-1, -10],
    ])("returns int in range [%i, %i]", (min, max) => {
        for (let i = 0; i < max_loop_cnt; i++) {
            const random_int = get_random_int(min, max);

            expect(random_int).toBeGreaterThanOrEqual(Math.min(min, max));
            expect(random_int).toBeLessThanOrEqual(Math.max(min, max));
        }
    });
});