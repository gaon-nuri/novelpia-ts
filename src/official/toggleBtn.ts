import HTTPMethod from "http-method-enum";
import type {HttpStrFn, ToggleStateCbs,} from "../types/toggleBtn";

async function toggle_pick_btn(
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
    toggle_pick_btn
};
