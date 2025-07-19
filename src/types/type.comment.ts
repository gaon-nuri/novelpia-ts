type MemberView = {
    comment_cnt: number,
    episode_cnt: number,
    mem_no: number,
    view_comment: number,
    view_like_hash: number,
    view_like_novel: number,
    view_sponsor: number
}

type MemberInfo = {
    g_cate: number            // 현재 로그인한 회원 번호
    g_mem_admin: number         // 현재 로그인한 회원의 관리자 등급(숫자가 높을수록 권한 높음)
    g_mem_no: number              // 해당 페이지의 회원 번호(즉, 프로필 주인)
    g_member_view: MemberView
}

type CmtUISetUpHandlers = {
    appendCmtHTML: Function,    // 댓글 영역 UI 기본 구조 추가
    setCmtSortOpts: Function,   // 댓글 정렬 옵션 세팅
};

interface ReqCbs {
    allowAcsCb: Function,
    denyAcsCb: Function,
}

export type {
    ReqCbs,
    CmtUISetUpHandlers,
    MemberView,
    MemberInfo
}