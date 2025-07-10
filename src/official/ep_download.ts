import HTTPMethod from "http-method-enum";
import {status as HTTPStatus} from "http-status";
import type {EpDownCheckRes} from "../types/ep_download";

async function query_limit(
    http: Function,
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

export {
    query_limit
}
