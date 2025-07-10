import HTTPMethod from "http-method-enum";
import {status as HTTPStatus} from "http-status";
import type {
    AlarmDelCbs,
    EpDownCheckRes,
    HttpEpResFn,
    HttpFn,
    HttpRes,
    HttpStrFn,
    ToggleStateCbs,
    UserData
} from "./types";

async function getAlarmCnt(
    user: UserData,
    http: HttpFn,
    // 테스트 의존성 주입
    mockShowAlarmDot?: Function,
    $?: any
): Promise<number> {  // 알람
    if (Number(user.data.mem_no) === 0) throw new Error("Member not found");

    const url: string = "/proc/alarm";
    const data = {"mode": "getAlarmCnt"};
    const http_result: HttpRes = await http(HTTPMethod.POST, url, data);
    const {status, result} = http_result;

    if (HTTPStatus.OK !== Number(status))
        throw new Error("status is " + status);

    const {cnt = 0} = result;

    if (cnt > 0) (mockShowAlarmDot || function showAlarmDot() {
        $("#btn-alarm #pc_alarm_dot").remove();
        $("#btn-alarm")
            .append('<span id="pc_alarm_dot" class="red-dot"></span>');
    })();

    return cnt;
}

async function alarmAllDel(
    csrf: string,
    http: HttpStrFn,
    // 테스트 의존성 주입
    mockAlarmDelCbs?: AlarmDelCbs
) {
    const type = HTTPMethod.POST;
    const url = "/proc/alarm_all_del";
    const data = {csrf: csrf};
    const httpRes: string = await http(type, url, data);

    function succCb(
        httpRes: string,
        // 테스트 의존성 주입
        mockAlarmDelCb?: AlarmDelCbs
    ) {
        const fallbackOkCb = () => {
            alert("모든 알람이 삭제되었습니다");
            location.reload();
        };

        const fallbackLoginCb = () => {
            const question = "로그인이 해제된 것 같습니다.\n로그인을 하시겠습니까?";
            if (confirm(question)) location.assign("/page/login");
        };

        switch (httpRes) {
            case "OK":
                mockAlarmDelCb
                    ? mockAlarmDelCb.okCallback()
                    : fallbackOkCb();
                break;
            case "login":
                mockAlarmDelCb
                    ? mockAlarmDelCb.loginCallback()
                    : fallbackLoginCb();
                break;
            default:
                throw new Error("오류가 발생하였습니다.");
        }
    }

    succCb(httpRes, mockAlarmDelCbs);

}

async function epDownloadChk(
    http: HttpEpResFn,
    // 테스트 의존성 주입
    mockAlertCb?: Function
): Promise<boolean> {
    const url = "/proc/novel_viewer";
    const data = {cmd: "today_episode_download_check"};
    const httpRes: EpDownCheckRes = await http(HTTPMethod.POST, url, data);
    const {status, errmsg} = httpRes;
    const canDownloadEp = (HTTPStatus.OK == status);

    if (!canDownloadEp)
        mockAlertCb
            ? mockAlertCb()
            : alert(errmsg || '일일 다운로드 횟수를 초과하였습니다.');

    return canDownloadEp;
}

async function pickBtn(
    csrf: string,
    novelNo: number,
    http: HttpStrFn,
    toggleSuccCb: (
        data: string,
        _cbs: ToggleStateCbs
    ) => void
) {
    const type = HTTPMethod.POST;
    const url = "/proc/novel_pick";
    const data = {csrf: csrf, novel_no: novelNo.toString()};
    const httpResult: string = await http(type, url, data);

    toggleSuccCb(httpResult, {
        onCallback: () => console.info('인생픽이 등록되었습니다.'),
        offCallback: () => console.warn('인생픽이 해제되었습니다.'),
        loginCallback: () => {
            console.warn("인생픽 등록을 위해서는 로그인이 필요합니다.\n로그인 하시겠습니까?");
            console.info("logined");
        },
        authCallback: () => {
            console.warn("인생픽 등록을 위해서는 본인인증이 필요합니다.\n본인인증 하시겠습니까?");
            console.info("redirected to /page/age_auth");
        }
    });
}

export {
    getAlarmCnt, alarmAllDel, epDownloadChk, pickBtn
};
