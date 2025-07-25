// tests/virtual-dom/alarm_btn.test.ts
import {JSDOM} from 'jsdom';
import jQuery from 'jquery';
import {compileFile, compileTemplate} from 'pug';
import path from 'node:path';
import {beforeAll, beforeEach, describe, expect, it} from "@jest/globals";
import status from "http-status";
import {Mock, stubFn} from "../test_lib";
import {getRandInt, partialApply} from "../../src/utils/utils";
import {HttpFn, HttpRes, UserData} from "../../src/types/type.main";
import {MAX_USER_NO} from "../../src/const/const.main";
import {getAlarmCnt} from "../../src/official/official.main";

describe('Pug 렌더링 + jQuery DOM 테스트', () => {
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

    type MockHttp = Mock<HttpFn>;

    const setMockHttpRetVal = (fn: MockHttp, res: HttpRes) => {
        fn.mockReturnValue(Promise.resolve(res));
    };
    const alarm_dot_id = "pc_alarm_dot";
    const alarm_dot_sel = `#btn-alarm #${alarm_dot_id}`;

    let get_html: compileTemplate;
    let mockHttp: MockHttp;
    let $: any;
    let get_alarm_cnt_from: Function;

    beforeAll(() => {
        const project_dir = path.dirname(__dirname);
        get_html = compileFile(
            path.resolve(project_dir, '../views/alarm/alarm_btn.pug'),
        );
    });

    beforeEach(() => {
        mockHttp = stubFn() as MockHttp;
        setMockHttpRetVal(mockHttp, {
            status: status.OK.toString(),
            errmsg: "",
            result: {cnt: mockAlarmCnt}
        });

        // 1) Pug로 HTML 생성
        const html = get_html();

        // 2) JSDOM 인스턴스 생성
        const dom = new JSDOM(html);

        // 3) jQuery 인스턴스 연결
        //    dom.window를 jQuery 팩토리에 넘겨주면, $ 로 DOM 조작 가능
        $ = jQuery(dom.window);

        get_alarm_cnt_from = partialApply(
            getAlarmCnt, user, mockHttp, undefined
        );
    });

    it("should get the correct alarm count", async () => {
        const cnt = await get_alarm_cnt_from($);

        expect(cnt).toBe(mockAlarmCnt);
    });

    it("shoud remove the dot from the button and add it back", async () => {
        expect($(alarm_dot_sel).length).toEqual(1);
        expect($(alarm_dot_sel).hasClass("red-dot")).toBeFalsy();

        await getAlarmCnt(user, mockHttp, undefined, $);

        expect($(alarm_dot_sel).length).toEqual(1);
        expect($(alarm_dot_sel).hasClass("red-dot")).toBeTruthy();
    });
});
