import status from "http-status";
import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    alarmAllDel,
    epDownloadChk,
    getAlarmCnt,
    pickBtn
} from "@official/official.main";
import {MAX_NOVEL_NO, MAX_USER_NO} from "@const/const.main";
import type {
    AlarmDelCbs,
    HttpEpResFn,
    HttpFn,
    HttpRes,
    HttpStrFn,
    ToggleStateCbs,
    UserData
} from "@type/type.main"
import {getRandInt} from "@utils/utils";

describe("getAlarmCnt 단위 테스트", () => {
    const maxAlarmCnt = 10
    const mockAlarmCnt: number = getRandInt(1, maxAlarmCnt);
    const user: UserData = {
        data: {
            mem_adt: "1",
            mem_birthday: new Date().toISOString().slice(0, 10),
            mem_no: getRandInt(1, MAX_USER_NO).toString()
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

describe("alarmAllDel 단위 테스트", () => {
    type MockHttpStr = jest.Mock<HttpStrFn>;

    let mockHttp: MockHttpStr;
    let mockOkCb: jest.Mock;
    let mockLoginCb: jest.Mock;
    let alarmDelCbs: AlarmDelCbs;
    let alarmAllDelBinded: Function;

    beforeEach(() => {
        mockHttp = jest.fn();
        mockOkCb = jest.fn(() => {
            console.info("모든 알람이 삭제되었습니다");
            console.info("page reloaded");
        });
        mockLoginCb = jest.fn(() => {
            console.warn("로그인이 해제 된 것 같습니다.\n로그인 하시겠습니까?");
            console.info("redirect to /page/login");
        });
        alarmDelCbs = {
            okCallback: mockOkCb,
            loginCallback: mockLoginCb
        };
        alarmAllDelBinded = () =>
            alarmAllDel(process.env.CSRF!, mockHttp, alarmDelCbs);
    });

    it("should succeed to delete all alarms", async () => {
        mockHttp.mockReturnValueOnce(Promise.resolve("OK"));

        await alarmAllDelBinded();

        [mockHttp, mockOkCb].forEach(cb => expect(cb).toHaveBeenCalledTimes(1));

        expect(mockLoginCb).not.toHaveBeenCalled();
    });

    it("should fail to delete any alarm due to undone login", async () => {
        mockHttp.mockReturnValueOnce(Promise.resolve("login"))

        await alarmAllDelBinded();

        [mockHttp, mockLoginCb].forEach(cb => {
            expect(cb).toHaveBeenCalledTimes(1);
        });

        expect(mockOkCb).not.toHaveBeenCalled();
    });
});

describe("epDownloadChk 단위 테스트", () => {
    let mockHttp: jest.Mock<HttpEpResFn>;

    beforeEach(() => {
        mockHttp = jest.fn();
    });

    it("should get 'CAN download' response", async () => {
        mockHttp.mockReturnValueOnce(Promise.resolve({
            code: "", errmsg: "", status: status.OK
        }));

        await expect(epDownloadChk(mockHttp)).resolves.toBe(true);
    });

    it("should get 'can NOT download' response due to too many reqeusts",
        async () => {
            mockHttp.mockReturnValueOnce(Promise.resolve({
                code: "", errmsg: "", status: status.TOO_MANY_REQUESTS
            }));
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

describe("pickBtn 단위 테스트", () => {
    const novelNo = getRandInt(1, MAX_NOVEL_NO);
    const encode = (res: {
        isPicked: boolean, rank: string, opt: string
    }) => res.isPicked ? "off" : "on" + "|" + res.rank + "|" + res.opt;

    let mockHttp: jest.Mock<(
        type: string, url: string, data: {}
    ) => Promise<string>>;
    let mockOnCb: jest.Mock;
    let mockOffCb: jest.Mock;
    let mockLoginCb: jest.Mock;
    let mockAuthCb: jest.Mock;
    let toggleState: (data: string, _cbs: ToggleStateCbs) => void;

    beforeEach(() => {
        mockHttp = jest.fn();
        mockOnCb = jest.fn(() => console.info("인생픽이 등록되었습니다."));
        mockOffCb = jest.fn(() => console.warn("인생픽이 해제되었습니다."));
        mockLoginCb = jest.fn(() => {
            console.warn("인생픽 등록을 위해서는 로그인이 필요합니다.\n로그인 하시겠습니까?");
            console.info("logined");
        });
        mockAuthCb = jest.fn(() => {
            console.warn("인생픽 등록을 위해서는 본인인증이 필요합니다.\n본인인증 하시겠습니까?");
            console.info("redirected to /page/age_auth");
        });

        toggleState = (data: string, _: ToggleStateCbs) => toggleSuccCb(data, {
            onCallback: mockOnCb,
            offCallback: mockOffCb,
            authCallback: mockAuthCb,
            loginCallback: mockLoginCb
        });
    });

    function toggleSuccCb(data: string, callbacks: ToggleStateCbs) {
        const check = data.split("|");
        switch (check[0]) {
            case "on":
                callbacks.onCallback();
                break;
            case "off":
                callbacks.offCallback();
                break;
            case "login":
                callbacks.loginCallback();
                break;
            case "auth":
                callbacks.authCallback();
                break;
            default:
                throw new Error("알 수 없는 오류 발생");
        }
    }

    it(`should succeed to 'pick' No.${novelNo} novel`, async () => {
        mockHttp.mockReturnValueOnce(Promise.resolve(encode({
            isPicked: false, rank: "공개전", opt: ""
        })));

        await pickBtn(process.env.CSRF!, novelNo, mockHttp, toggleState);

        [mockHttp, mockOnCb].forEach(cb => {
            expect(cb).toHaveBeenCalledTimes(1);
        });

        [mockOffCb, mockLoginCb, mockAuthCb].forEach(cb => {
            expect(cb).not.toHaveBeenCalled();
        });
    });

    it(`should fail to 'pick' No.${novelNo} novel due to undone login`,
        async () => {
            mockHttp.mockReturnValueOnce(Promise.resolve("login|"));

            await pickBtn(process.env.CSRF!, novelNo, mockHttp, toggleState);

            [mockHttp, mockLoginCb].forEach(cb => {
                expect(cb).toHaveBeenCalledTimes(1);
            });
            [mockOnCb, mockOffCb, mockAuthCb].forEach(cb => {
                expect(cb).not.toHaveBeenCalled();
            });
        }
    );

    it(`should fail to 'pick' No.${novelNo} novel due to undone authentication`,
        async () => {
            mockHttp.mockReturnValueOnce(Promise.resolve("auth|"));

            await pickBtn(process.env.CSRF!, novelNo, mockHttp, toggleState);

            [mockHttp, mockAuthCb].forEach(cb => {
                expect(cb).toHaveBeenCalledTimes(1);
            });

            [mockOnCb, mockOffCb, mockLoginCb].forEach(cb => {
                expect(cb).not.toHaveBeenCalled();
            });
        }
    );

    it(`should fail to 'pick' No.${novelNo} novel due to unknown error`,
        () => {
            mockHttp.mockReturnValueOnce(Promise.resolve("unknown|"));

            expect(() =>
                pickBtn(process.env.CSRF!, novelNo, mockHttp, toggleState)
            ).rejects.toThrow("알 수 없는 오류 발생");

            expect(mockHttp).toHaveBeenCalledTimes(1);

            [mockOnCb, mockOffCb, mockLoginCb, mockAuthCb].forEach(cb => {
                expect(cb).not.toHaveBeenCalled();
            });
        }
    );
});