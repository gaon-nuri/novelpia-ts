import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {init} from "../src/official/official.setup";

describe("init 단위 테스트", () => {
    const validMemNo = 1;
    const invalidMemNo = -1;
    let mockGetUserChk: jest.Mock;
    let mockUpdateHist: jest.Mock;
    let mockLoginCb: jest.Mock;

    beforeEach(() => {
        mockLoginCb = jest.fn(() => {
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
            mockGetUserChk = jest.fn(() => {
                console.info("getUserChk 호출");
            });
            mockUpdateHist = jest.fn(() => {
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