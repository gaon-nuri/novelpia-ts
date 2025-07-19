/**
 * 회원 페이지 초기 설정
 */

// 1. 초기화
function init(
    global: {
        g_cate?: number,
        g_load?: string,
        g_mem_no: number,
        g_proc?: string
    },
    mockUpdateHist?: Function,
    mockGetUserChk?: Function,
    mockLoginCb?: Function
) {
    const isLogined = global.g_mem_no > 0;

    // 1) 로그인 상태 확인
    if (!isLogined) {
        (mockLoginCb || (() => {
            // 비로그인 시 알림 후 로그인 페이지로 이동
            alert("로그인 후 이용 가능합니다.");
            location.assign("/?login_req=1");
        }))();
        return false;
    }

    // 2) 브라우저 방문 기록 갱신
    (mockUpdateHist || (() => {
        // 주소창을 g_load/g_cate/g_proc 형태로 바꾸고, 방문 기록에 저장
        history.replaceState(
            {cate: global.g_cate},
            "",
            `/${global.g_load}/${global.g_cate}/${global.g_proc}`
        );
    }))();

    // 3) 회원 정보 불러오기
    delete global.g_load;
    (mockGetUserChk || getUserChk)(global);

    return true;
}

// 2. 회원 정보 불러오기
async function getUserChk(
    global: {
        g_cate: number,
        g_mem_no: number,
        g_proc?: string
    }
) {
    console.log(global);
}

export {
    init
}