import status from "http-status";
import {describe, expect, it, jest} from "@jest/globals";
import {query_limit} from "../src/official/ep_download";

describe("epDownloadChk 단위 테스트", () => {
    const mockCanDownloadEp: boolean = true;
    const mockHttp = jest.fn();
    mockHttp.mockReturnValue({
        status: mockCanDownloadEp ? status.OK : status.TOO_MANY_REQUESTS,
        errmsg: "",
        code: ""
    });

    it("should get 'CAN download' response", async () => {
        await expect(query_limit(mockHttp)).resolves.toBe(true);
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

            await expect(query_limit(mockHttp, failCb)).rejects.toThrow(errMsg);

            expect(failCb).toHaveBeenCalledTimes(1);
        });
});