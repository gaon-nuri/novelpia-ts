// 댓글/대댓글 insert/update
function set_commit_comment(_this) {
    $('#comment_box .set_commit_comment_btn').prop('disabled', true);
    $('.loads').show(); // 연속으로 엔터/클릭 시 중복 등록 방지를 위해 로딩 삽입

    if (_this === "") {
        return;
    }

    const get_input_sel = (name_val) => `input[name='${name_val}']`;

    // 작성 또는 수정
    let _target = _this.find("input[name='target']").val();

    // 댓글 내용
    let _comment_msg = _this.find("textarea[name='comment_msg']").val();

    // 이모티콘 등 이미지
    let _comment_img = _this.find("input[name='comment_img']").val();

    // 회차 번호
    let _episode_no = _this.find("input[name='content_no']").val();

    // 댓글 번호
    let _comment_no = _this.find("input[name='comment_no']").val();

    // 대댓글 번호
    let _comment_re_no = _this.find("input[name='comment_re_no']").val();

    // 등록: insert, 회차 번호 필요
    const is_insert_mode = _target === "insert" && _episode_no !== "";
    // 수정: update, 댓글 번호 필요
    const is_update_mode = _target === "update" && _comment_no !== "";
    if (!is_insert_mode && !is_update_mode) {
        return;
    }

    $.ajax({
        url: "/proc/viewer", data: {
            "mode": "set_commit_comment",
            "target": _target,
            "comment_msg": _comment_msg,
            "comment_img": _comment_img,
            "episode_no": _episode_no,
            "comment_no": _comment_no,
            "comment_re_no": _comment_re_no,
            "csrf": "696c348ebddc22f5607bfa4bcacf29b4"
        }, type: "POST", dataType: "json", success: res => {
            switch (res.status) {
                case "200":
                    switch (_target) {
                        case "insert":
                            alert("댓글이 입력되었습니다.");
                            break;
                        case "update":
                            alert("댓글이 수정되었습니다.");
                            break;
                    }

                    // 입력 폼 초기화 및 목록 새로고침
                    $("#comment_box .emoticon_box").remove();
                    _this.find(get_input_sel("target")).val('insert');
                    _this.find("textarea[name='comment_msg']").val("");
                    _this.find(get_input_sel("comment_img")).val();
                    _this.find(get_input_sel("comment_no")).val();
                    _this.find(get_input_sel("comment_re_no")).val();

                    g_comment_cnt = 0; // count init
                    tab_link_on(); // 댓글 목록 새로고침
                    break;
                case "401":
                    if (confirm("로그인이 필요합니다.\n로그인 하시겠습니까?")) {
                        member_login_modal_on();
                    }
                    break;
                default:
                    alert(res.errmsg);
                    break;
            }
        }, complete: () => {
        }
    });
}