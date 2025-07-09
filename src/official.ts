import HTTPMethod from "http-method-enum";
import {status as HTTPStatus} from "http-status";
import type {UserData} from "./types";

async function getAlarmCnt(
    user: UserData,
    http: Function,
    // 테스트 의존성 주입
    mockShowAlarmDot?: Function,
    $?: any
): Promise<number> {  // 알람
    if (Number(user.data.mem_no) === 0) throw new Error("Member not found");

    const url: string = "/proc/alarm";
    const data = {"mode": "getAlarmCnt"};
    const http_result = await http(HTTPMethod.POST, url, data);
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

export {
    getAlarmCnt
}
