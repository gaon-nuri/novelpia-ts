import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {toggle_pick_btn} from "../../src/official/toggleBtn";
import type {HttpStrFn, ToggleStateCbs} from "../../src/types/toggleBtn";

describe("pickBtn 단위 테스트", () => {

    const novelNo = 127306;
    const csrf = process.env.CSRF!;

    let mockHttp: jest.Mock<HttpStrFn>;
    let mockOnCb: jest.Mock;
    let mockOffCb: jest.Mock;
    let mockLoginCb: jest.Mock;
    let mockAuthCb: jest.Mock;
    let toggleState: (data: string, _cbs: ToggleStateCbs) => void;
    let pickBtnOf: () => ReturnType<typeof toggle_pick_btn>

    function get_msg(action: string) {
        return `인생픽이 ${action}되었습니다.`;
    }

    function get_question(keyword: string) {
        return `인생픽 등록을 위해서는 ${keyword}이 필요합니다. ${keyword}하시겠습니까?`;
    }

    function encode(res: { isPicked: boolean, rank: string, opt: string }) {
        return res.isPicked ? "off" : "on" + "|" + res.rank + "|" + res.opt;
    }

    beforeEach(() => {
        mockHttp = jest.fn();
        mockOnCb = jest.fn(() => console.info(get_msg("등록")));
        mockOffCb = jest.fn(() => console.warn(get_msg("해제")));
        mockLoginCb = jest.fn(() => {
            console.warn(get_question("로그인"));
            console.info("logined");
        });
        mockAuthCb = jest.fn(() => {
            console.warn(get_question("본인인증"));
            console.info("redirected to /page/age_auth");
        });

        toggleState = (data: string, _: ToggleStateCbs) => toggleSuccCb(data, {
            onCallback: mockOnCb,
            offCallback: mockOffCb,
            authCallback: mockAuthCb,
            loginCallback: mockLoginCb
        });

        pickBtnOf = () => toggle_pick_btn(csrf, novelNo, mockHttp, toggleState);
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

    it("should succeed to 'pick' novel", async () => {
        mockHttp.mockReturnValueOnce(Promise.resolve(encode({
            isPicked: false, rank: "공개전", opt: ""
        })));

        await pickBtnOf();

        [mockHttp, mockOnCb].forEach(cb => {
            expect(cb).toHaveBeenCalledTimes(1);
        });

        [mockOffCb, mockLoginCb, mockAuthCb].forEach(cb => {
            expect(cb).not.toHaveBeenCalled();
        });
    });

    it("should fail to 'pick' novel due to undone login", async () => {
        mockHttp.mockReturnValueOnce(Promise.resolve("login|"));

        await pickBtnOf();

        [mockHttp, mockLoginCb].forEach(cb => {
            expect(cb).toHaveBeenCalledTimes(1);
        });
        [mockOnCb, mockOffCb, mockAuthCb]
            .forEach(cb => {
                expect(cb).not.toHaveBeenCalled();
            });
    });

    it("should fail to 'pick' novel due to undone authentication", async () => {
        mockHttp.mockReturnValueOnce(Promise.resolve("auth|"));

        await pickBtnOf();

        [mockHttp, mockAuthCb].forEach(cb => {
            expect(cb).toHaveBeenCalledTimes(1);
        });

        [mockOnCb, mockOffCb, mockLoginCb].forEach(cb => {
            expect(cb).not.toHaveBeenCalled();
        });
    });

    it("should fail to 'pick' novel due to unknown error", () => {
        mockHttp.mockReturnValueOnce(Promise.resolve("unknown|"));

        expect(pickBtnOf).rejects.toThrow("알 수 없는 오류 발생");

        expect(mockHttp).toHaveBeenCalledTimes(1);

        [mockOnCb, mockOffCb, mockLoginCb, mockAuthCb].forEach(cb => {
            expect(cb).not.toHaveBeenCalled();
        });
    });
});