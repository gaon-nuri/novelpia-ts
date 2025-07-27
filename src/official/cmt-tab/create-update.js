// 댓글/대댓글 insert/update
function set_commit_comment(_this) {
    if (_this != "") {
        let _target = _this.find("input[name='target']").val();
        let _comment_msg = _this.find("textarea[name='comment_msg']").val();
        let _comment_img = _this.find("input[name='comment_img']").val();
        let _episode_no = _this.find("input[name='content_no']").val();
        let _comment_no = _this.find("input[name='comment_no']").val();
        let _comment_re_no = _this.find("input[name='comment_re_no']").val();

        //console.log(_target,_comment_msg,_comment_img,_episode_no,_comment_no,_comment_re_no);
        //return false;

        if (_target == "insert" && _episode_no != "" || _target == "update" && _comment_no != "") {
            $.ajax({
                url: "/proc/viewer",
                data: {
                    "mode": "set_commit_comment",
                    "target": _target,
                    "comment_msg": _comment_msg,
                    "comment_img": _comment_img,
                    "episode_no": _episode_no,
                    "comment_no": _comment_no,
                    "comment_re_no": _comment_re_no,
                    "csrf": "696c348ebddc22f5607bfa4bcacf29b4"
                },
                type: "POST",
                dataType: "json",
                success: function (response) {
                    if (response.status == '200') {
                        //console.log(response.result);
                        if (_target == "insert") {
                            alert("댓글이 입력되었습니다.");
                        } else if (_target == "update") {
                            alert("댓글이 수정되었습니다.");
                        }
                        // comment_box init
                        $("#comment_box .emoticon_box").remove();
                        _this.find("input[name='target']").val('insert');
                        _this.find("textarea[name='comment_msg']").val('');
                        _this.find("input[name='comment_img']").val('');
                        //_this.find("input[name='content_no']").val(_episode_no); // 초기화 하지 않음
                        _this.find("input[name='comment_no']").val('');
                        _this.find("input[name='comment_re_no']").val('');
                        g_comment_cnt = 0; // count init
                        //$('.more_comment'+g_page).remove();
                        //get_comment_load();
                        tab_link_on();
                    } else if (response.status == '401') {
                        if (confirm("로그인이 필요합니다.\n로그인 하시겠습니까?")) {
                            //location = "/page/login";
                            member_login_modal_on();
                        }
                    } else {
                        alert(response.errmsg);
                    }
                },
                complete: function () {
                }
            });
        }
    }
}