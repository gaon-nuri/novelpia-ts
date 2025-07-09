import {describe, expect, it} from "@jest/globals";
import {getAlarmCnt} from "../src/official";
import {UserData} from "../src/types";

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

    function http(_type: string, _url: string, _data: {}) {
        return {
            status: "200",
            errmsg: "",
            result: {
                cnt: mockAlarmCnt,
            },
        };
    }

    it("should get the correct alarm count", async () => {
        const cnt = await getAlarmCnt(user, http, () => {
        });

        expect(cnt).toBe(mockAlarmCnt);
    });
});