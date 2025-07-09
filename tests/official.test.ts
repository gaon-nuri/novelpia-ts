import status from "http-status";
import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {epDownloadChk, getAlarmCnt} from "../src/official";
import {UserData} from "../src/types";

let mockHttp: jest.Mock;

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

    beforeEach(() => {
        mockHttp = jest.fn();
        mockHttp.mockReturnValue({
        status: status.OK.toString(), errmsg: "", result: {cnt: mockAlarmCnt}
        });
    });

    it("should get the correct alarm count", async () => {
        const cnt = await getAlarmCnt(user, mockHttp, () => {
        });

        expect(cnt).toBe(mockAlarmCnt);
    });
});

describe("epDownloadChk 단위 테스트", () => {
    const mockCanDownloadEp: boolean = true;

    beforeEach(() => {
        mockHttp = jest.fn();
        mockHttp.mockReturnValue({
            status: mockCanDownloadEp ? status.OK : status.TOO_MANY_REQUESTS,
            errmsg: "",
            code: ""
        });
    });

    it("should get 'CAN download' response", async () => {
        await expect(epDownloadChk(mockHttp)).resolves.toBe(true);
    });

    it(
        "should get 'can NOT download' response due to too many reqeusts",
        async () => {
            mockHttp.mockReturnValue({
                status: status.TOO_MANY_REQUESTS, errmsg: "", code: ""
            });
            const errMsg = `HTTP ${status.TOO_MANY_REQUESTS} 오류`;
            const failCb = jest.fn(() => {
                throw new Error(errMsg);
            });

            await expect(epDownloadChk(mockHttp, failCb)).rejects.toThrow(errMsg);

            expect(failCb).toHaveBeenCalledTimes(1);
    });
})
