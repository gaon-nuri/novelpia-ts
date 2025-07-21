import {beforeEach, describe, expect, it} from "@jest/globals";
import {init} from "../src/official/official.setup";
import {mockFn} from "./test_lib";

describe("init 단위 테스트", () => {
    const validMemNo = 1;
    const invalidMemNo = -1;
    let mockGetUserChk: ReturnType<typeof mockFn>;
    let mockUpdateHist: ReturnType<typeof mockFn>;
    let mockLoginCb: ReturnType<typeof mockFn>;

    beforeEach(() => {
        mockLoginCb = mockFn(() => {
            console.warn("로그인 후 이용 가능합니다.");
        });
    });

    it("should redirect to login page", () => {
        expect(init(
            {g_mem_no: invalidMemNo},
            undefined,
            undefined,
            mockLoginCb
        )).toBe(false);

        expect(mockLoginCb).toHaveBeenCalledTimes(1);
    });

    describe("로그인 불필요, 계속 진행", () => {
        beforeEach(() => {
            mockGetUserChk = mockFn(() => {
                console.info("getUserChk 호출");
            });
            mockUpdateHist = mockFn(() => {
                console.info("방문 기록 갱신");
            });
        });

        it("should terminate without any error", () => {
            expect(init(
                {g_mem_no: validMemNo},
                mockUpdateHist,
                mockGetUserChk
            )).toBe(true);

            [mockUpdateHist, mockGetUserChk].forEach(cb => {
                expect(cb).toHaveBeenCalledTimes(1);
            })
        });
    });
})