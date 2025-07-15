/*
 * comment tab function START
 */

// comment
import HTTPMethod from "http-method-enum";
import {status as HTTPStatus} from "http-status";
import type {HttpFnWithDataType, HttpRes} from "../types/cmt-tab";

async function getCmtInWriter(
    cmtWriterNo: number, // 해당 페이지의 회원 번호(즉, 프로필 주인)
    http: HttpFnWithDataType,
    getUserCmt: () => void,
    // 테스트 의존성 주입
    mockSuccCb?: (res: HttpRes, ...[]) => void,
    mockLoginCb?: Function,
    memLogModalOn?: Function,
    httpFbCb?: (res: HttpRes) => void
) {
    const type = HTTPMethod.POST;
    const url = "/proc/user";
    const data = {
        mem_no: cmtWriterNo,
        mode: "get_comment_in_writer"
    };
    const dataType = "json";

    function fallbackCb(
        res: HttpRes,
        httpFbCb?: (res: HttpRes) => void
    ) {
        switch (Number(res.status)) {
            case HTTPStatus.OK:
                break;
            case HTTPStatus.UNAUTHORIZED:
                if (mockLoginCb) mockLoginCb()
                else if (confirm("로그인이 필요합니다.\n로그인 하시겠습니까?"))
                    memLogModalOn!();
                break;
            default:
                httpFbCb ? httpFbCb(res) : alert(res.errmsg);
        }
    }

    const res = await http(type, url, data, dataType);
    if (res.result.cnt > 0)
        (mockSuccCb ? mockSuccCb : fallbackCb)(res, httpFbCb);
    getUserCmt();
}

export {
    getCmtInWriter
}
