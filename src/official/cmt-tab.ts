/*
 * comment tab function START
 */

// comment
import type {CmtUISetUpHandlers, MemberInfo, ReqCbs} from "../types/cmt-tab";
import {AuthGrade, ViewCmt} from "../enum/cmt-tab";

/* 회원의 프로필 페이지에서 댓글 영역을 로딩하고,
 * 댓글 정렬 옵션 및 비공개 설정 등에 따라 UI를 제어합니다.
 * */
function getUserCmt(
    memInfo: MemberInfo,
    getMemberCmt: Function,
    // 테스트용 의존성 주입
    cmtUISetUpHandlers?: CmtUISetUpHandlers,
    cmtVisbilityHandler?: Function // UI 마무리 처리 및 후처리용 콜백
) {
    function cmtVisbilityHandlerFb(
        memInfo: MemberInfo,
        // 테스트용 의존성 주입
        getMemberCmt: Function,
        callbacks?: ReqCbs,
        tearDownUI?: Function
    ) {
        function alertCmtHiddenToCmtViewer() {
            console.warn("현재 댓글 비공개 상태");
        }

        function showAcsDeniedPgToVisitors() {
            console.warn("비공개 댓글은 작성자만 열람 가능");
        }

        const isProfileOwner = memInfo.g_mem_no === memInfo.g_cate;
        const isAdmin = memInfo.g_mem_admin >= AuthGrade.ADMIN;
        const isCmtHidden =
            memInfo.g_member_view.view_comment === ViewCmt.HIDDEN;

        if (!isCmtHidden) {
            getMemberCmt();
        } else if (isProfileOwner || isAdmin) {
            (callbacks?.allowAcsCb || function () {
                alertCmtHiddenToCmtViewer();
                tearDownUI?.();
            })()
            getMemberCmt();
        } else {
            (callbacks?.denyAcsCb || function () {
                showAcsDeniedPgToVisitors();
                tearDownUI?.();
            })()
        }
    }

    // (선택) 1. 댓글 영역 UI 기본 구조 추가
    cmtUISetUpHandlers?.appendCmtHTML();
    // (선택) 2. 댓글 정렬 옵션 세팅
    cmtUISetUpHandlers?.setCmtSortOpts();
    // 3. 회원(또는 관리자) 여부 및 댓글 공개설정에 따른 처리
    (cmtVisbilityHandler || cmtVisbilityHandlerFb)(memInfo, getMemberCmt);
}

export {
    getUserCmt
}
