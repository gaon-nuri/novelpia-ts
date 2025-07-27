// 댓글/대댓글 삭제 함수
function comment_delete_proc(comment_no) {
    const is_delete_ongoing = g_comment_delete === 1;
    const is_delete_refused = !confirm('정말 댓글을 삭제하시겠습니까?');

    if (is_delete_ongoing || is_delete_refused) {
        return;
    }

    g_comment_delete = 1; // 중복 삭제 방지 플래그 설정

    $.ajax({
        url: "/proc/viewer", data: {
            comment_no: comment_no,
            csrf: "(CSRF 토큰)",
            mode: "set_delete_comment"
        }, type: "POST", dataType: "json", success: res => {
            switch (res.status) {
                case "200":
                    // 댓글 삭제 성공
                    alert("댓글이 삭제되었습니다.");
                    g_comment_cnt = 0; // count init
                    tab_link_on(); // 댓글 목록 새로고침
                    break;
                case "401":
                    // 댓글 삭제 실패, 로그인 필요
                    if (confirm("로그인이 필요합니다.\n로그인하시겠습니까?")) {
                        member_login_modal_on();
                    }
                    break;
                default:
                    alert(res.errmsg);
                    break;
            }
        }, complete: () => {
            g_comment_delete = 0; // 중복 삭제 방지 플래그 해제
        }
    });
}