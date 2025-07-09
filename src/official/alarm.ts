import type {UserData} from "../types/alarm";

async function getAlarmCnt(
    user: UserData,
    http: Function,
    // 테스트 의존성 주입
    mockShowAlarmDot?: Function
): Promise<number> {  // 알람
    if (Number(user.data.mem_no) === 0) throw new Error("Member not found");

    const url: string = "/proc/alarm";
    const data = {"mode": "getAlarmCnt"};
    const http_result = await http("post", url, data);
    const {status, result} = http_result;

    if (200 !== Number(status))
        throw new Error("status is " + status);

    const {cnt = 0} = result;

    if (cnt > 0) (mockShowAlarmDot || function showAlarmDot() {
        $("#btn_m_alram #alarm_dot").remove();
        $("#btn_m_alram")
            .append('<span id="alarm_dot" class="red-dot"></span>');
    })();

    return cnt;
}

export {
    getAlarmCnt
}
