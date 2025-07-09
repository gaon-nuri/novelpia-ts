import status from "http-status";
import {describe, expect, it, jest} from "@jest/globals";
import {getAlarmCnt} from "../../src/official/alarm";
import {UserData} from "../../src/types/alarm";

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
    const mockHttp = jest.fn();

    mockHttp.mockReturnValue({
        status: status.OK.toString(), errmsg: "", result: {cnt: mockAlarmCnt}
    });

    it("should get the correct alarm count", async () => {
        const cnt = await getAlarmCnt(user, mockHttp, () => {
        });

        expect(cnt).toBe(mockAlarmCnt);
    });
});