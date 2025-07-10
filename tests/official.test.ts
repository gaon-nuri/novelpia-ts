import status from "http-status";
import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {epDownloadChk, getAlarmCnt} from "../src/official";
import type {
    EpDownCheckRes,
    HttpEpResFn,
    HttpFn,
    HttpRes,
    UserData
} from "../src/types"

describe("getAlarmCnt 단위 테스트", () => {
    const mockAlarmCnt: number = 1;
    const user: UserData = {
        data: {
            mem_adt: "1",
            mem_birthday: new Date().toISOString().slice(0, 10),
            mem_no: "1234567"
        },
        methods: {}
    }

    type MockHttp = jest.Mock<HttpFn>;

    const setMockHttpRetVal = (fn: MockHttp, res: HttpRes) => {
        fn.mockReturnValue(Promise.resolve(res));
    };

    let mockHttp: MockHttp;
    let mockCb: jest.Mock;

    beforeEach(() => {
        mockHttp = jest.fn();
        setMockHttpRetVal(mockHttp, {
            status: status.OK.toString(),
            errmsg: "",
            result: {cnt: mockAlarmCnt}
        });
        mockCb = jest.fn();
    });

    it("should get the correct alarm count", async () => {
        const cnt = await getAlarmCnt(user, mockHttp, mockCb);

        expect(cnt).toBe(mockAlarmCnt);
        expect(mockCb).toHaveBeenCalledTimes(1);
    });

    it("should fail to get an invalid user's correct alarm count", async () => {
        const invalidUser: UserData = {
            data: {
                mem_adt: "1",
                mem_birthday: new Date().toISOString().slice(0, 10),
                mem_no: "0"
            },
            methods: {}
        };

        await expect(
            getAlarmCnt(invalidUser, mockHttp, mockCb)
        ).rejects.toThrow("Member not found");

        expect(mockHttp).not.toHaveBeenCalled();
        expect(mockCb).not.toHaveBeenCalled();
    });

    it("should fail to get an alarm count on HTTP status error", async () => {
        setMockHttpRetVal(mockHttp, {
            status: status.IM_A_TEAPOT.toString(),
            errmsg: "",
            result: {cnt: mockAlarmCnt}
        });

        await expect(
            getAlarmCnt(user, mockHttp, mockCb)
        ).rejects.toThrow(`status is ${status.IM_A_TEAPOT}`);

        expect(mockHttp).toHaveBeenCalledTimes(1);
        expect(mockCb).not.toHaveBeenCalled();
    });
});

describe("epDownloadChk 단위 테스트", () => {
    const mockCanDownloadEp: boolean = true;

    type MockHttp = jest.Mock<HttpEpResFn>;

    const setMockHttpRetVal = (fn: MockHttp, res: EpDownCheckRes) => {
        fn.mockReturnValue(Promise.resolve(res));
    };

    let mockHttp: MockHttp;

    beforeEach(() => {
        mockHttp = jest.fn();
        setMockHttpRetVal(mockHttp, {
            status: mockCanDownloadEp ? status.OK : status.TOO_MANY_REQUESTS,
            errmsg: "",
            code: ""
        });
    });

    it("should get 'CAN download' response", async () => {
        setMockHttpRetVal(mockHttp, {
            code: "", errmsg: "", status: status.OK
        });

        await expect(epDownloadChk(mockHttp)).resolves.toBe(true);
    });

    it("should get 'can NOT download' response due to too many reqeusts",
        async () => {
            setMockHttpRetVal(mockHttp, {
                code: "", errmsg: "", status: status.TOO_MANY_REQUESTS
            });
            const errMsg = `HTTP ${status.TOO_MANY_REQUESTS} 오류`;
            const failCb = jest.fn(() => {
                throw new Error(errMsg);
            });

            await expect(
                epDownloadChk(mockHttp, failCb)
            ).rejects.toThrow(errMsg);

            expect(failCb).toHaveBeenCalledTimes(1);
        }
    );
})
