// 댓글/대댓글 삭제
function comment_delete_proc(comment_no) {
    //console.log("comment_delete_proc", comment_no);

    if (g_comment_delete == 0) {
        if (confirm('정말 댓글을 삭제하시겠습니까?')) {
            g_comment_delete = 1;
            $.ajax({
                url: "/proc/viewer",
                data: {
                    "mode": "set_delete_comment",
                    "comment_no": comment_no,
                    "csrf": "696c348ebddc22f5607bfa4bcacf29b4"
                },
                type: "POST",
                dataType: "json",
                success: function (response) {
                    if (response.status == '200') {
                        //console.log(response.result);
                        alert("댓글이 삭제되었습니다.");
                        g_comment_cnt = 0; // count init
                        //$('.more_comment'+g_page).remove();
                        //get_comment_load();
                        tab_link_on();
                    } else if (response.status == '401') {
                        if (confirm("로그인이 필요합니다.\n로그인 하시겠습니까?")) {
                            //location = "/page/login";
                            //$.cookie('_redirectrurl', 'L3VzZXIvMjUyOTcyMC9jb21tZW50', { expires: 365, path: '/', domain: 'novelpia.com', secure: false });
                            //location = "/?login_req=1";
                            member_login_modal_on();
                        }
                    } else {
                        alert(response.errmsg);
                    }
                },
                complete: function () {
                    g_comment_delete = 0;
                }
            });
        }
    }
}