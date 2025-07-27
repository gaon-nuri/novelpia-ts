function get_comment_in_writer() {
    console.log('get_comment_in_writer');
    $.ajax({
        url: "/proc/user", data: {
            "mode": "get_comment_in_writer", "mem_no": g_cate
        }, type: "POST", dataType: "json", success: function (response) {
            if (response.status !== '200') {
                if (response.status === '401') {
                    if (confirm("로그인이 필요합니다.\n로그인 하시겠습니까?")) {
                        member_login_modal_on();
                    }
                } else {
                    alert(response.errmsg);
                }
                return;
            }
            console.log(response.result);
            if (response.result !== '') {
                g_is_writer = response.result.cnt;
            }
        }, complete: function () {
            get_user_comment();
        }
    });
}

function get_user_comment() {
    g_this.find('.user_card_databox')
        .append(_comment_html);
    g_this.find('select.select-align').html('');
    $.each(g_comment_sort, function (i, v) {
        let _selected = (i === g_comment_selected_sort) ? ' selected' : '';
        g_this.find('select.select-align').append('<option value="' + i + '" ' + _selected + '>' + v + '</option>');
    });

    if (g_mem_no === g_cate || g_mem_admin > 9) {
        if (g_member_view.view_comment === 1) {
            let _html = '';
            _html += '<img class="hide-option" src="' + G_CDN_DOMAIN_IMG + '/img/new/user_profile/hide_option_icon.png" alt="비공개">';
            g_this.find('.user_card_databox .list-tit p').prepend(_html);
            g_this.find('.user_card_databox .list-tit p').append(' <span class="hide_txt">(비공개)</span>');
            card_databox_end();
        }

        get_member_comment();
    } else {
        if (g_member_view.view_comment === 1) {
            let _html = `
					<div style="margin-top:30px;"></div><!--상단여백, 이동시 삭제-->
					<div class="list-tit s_inv" style="justify-content: center; padding: 40px 0; text-align: center;">
						<div class="hide-option-box">
							<img class="s_inv" src="${G_CDN_DOMAIN_IMG}/img/new/user_profile/hide_option_korani.png" alt="비공개 설정">
							<p style="margin-top: 10px; font-size: initial; font-weight: normal; color: #999;">비공개 설정 되었습니다.</p>
						</div>
					</div>
				`;
            g_this.find('.user_card_databox').html(_html);
            card_databox_end();
        } else {
            get_member_comment();
        }
    }
}

function get_member_comment() {
    console.log('get_member_comment');
    g_paging.rowCount = 20;
    g_paging.sort = {
        'date': 0, 'new': 1, 'vote': 1,
    };
    g_paging.order = g_comment_selected_sort;
    $.ajax({
        url: "/proc/user", data: {
            "mode": "get_member_comment",
            "mem_no": g_cate,
            "paging": g_paging,
            "view_comment": g_member_view.view_comment,
        }, type: "POST", dataType: "json", success: function (response) {
            if (response.status !== '200') {
                if (response.status === '401') {
                    if (confirm("로그인이 필요합니다.\n로그인 하시겠습니까?")) {
                        member_login_modal_on();
                    }
                } else {
                    alert(response.errmsg);
                }
                return;
            }
            console.log(response.result);
            const novel_view_comment = Number(g_member_view.view_comment);
            if (novel_view_comment !== 0) {
                if (g_mem_admin < 10 && g_mem_no !== g_cate) {
                    return 0;
                }
            }
            if (response.result.novel.length > 0) {
                g_this.find('.list-tit > p > span.comment_cnt').text('(' + response.result.allCount.format() + ')');
                g_this.find('.comment-list-wp').html('');
                const _html = `
						<div class="novel-thumbnail">
							<img class="s_inv" src="${G_CDN_DOMAIN_IMG}/imagebox/cover/ad7817457f2291d73ae9ade9e624988c_162131_ori.thumb">
						</div>
						<div class="comment-info">
							<div class="novel-tit"><span>~ 내가 본 소설이야 ~</span><a href="javascript:;" class="menu-more"></a></div>
							<div class="novel-ep-tit">~ 내가 관심있는 에피소드야 ~</div>
							<div class="comment-area">
								<!-- <img src="${G_CDN_DOMAIN_IMG}/img/emoticon/rkf25ldvx1/10.gif"> -->
							</div>
							<div class="date-recommend"><span class="date">-</span><a href="javascript:;" class="recommend">-</a></div>
						</div>
					`;

                $.each(response.result.novel, function (i, v) {
                    console.log("comment = " + v.temp);
                    g_this.find('.comment-list-wp').append('<div class="comment-list" data-id="' + v.novel_no + '" data-episode="' + v.content_no + '" data-comment="' + v.comment_idx + '" data-age="' + v.novel_age + '">' + _html + '</div>');
                    let _this = g_this.find('.comment-list[data-comment="' + v.comment_idx + '"]');

                    if (v.comment_status === 0) {
                        _this.css('background-color', '#fee');
                        _this.find('.comment-area').append('<div style="color: #999;">삭제된 댓글입니다.</div>');
                        _this.find('.menu-more').remove();
                    }
                    if (v.novel_age >= 19) {
                        _this.find('.novel-thumbnail').prepend('<div class="adult19 s_inv"></div>');
                    }
                    if ($.cookie("secret_mode") === '1') {
                        _this.find('.menu-more').remove();
                    }

                    let _novel_img = v.novel_img;
                    let _novel_thumb = v.novel_thumb;

                    // 전연령
                    if (g_mem_adt_mode === 0) {
                        _novel_img = v.novel_img_all;
                        _novel_thumb = v.novel_thumb_all;
                    }

                    // 성인표지가 비었을 경우
                    if (g_mem_adt_mode === 1 && (_novel_thumb === '' || _novel_thumb == null) && v.novel_thumb_all !== '' && v.novel_thumb_all != null) {
                        _novel_img = v.novel_img_all;
                        _novel_thumb = v.novel_thumb_all;
                    }

                    // 전연령 소설일 경우
                    if (g_mem_adt_mode === 1 && $.inArray(v.novel_age, ['19', '22']) === -1 && v.novel_thumb_all !== '' && v.novel_thumb_all != null) {
                        _novel_img = v.novel_img_all;
                        _novel_thumb = v.novel_thumb_all;
                    }

                    let _cover_src;
                    if ($.cookie('COVER_VIEW') === 'OFF') {
                        _cover_src = G_CDN_DOMAIN_IMG + '/img/layout/block_01.png';
                    } else if (_novel_thumb === '' || _novel_thumb == null || _novel_thumb === 'undefined') {
                        _cover_src = G_CDN_DOMAIN_IMG + '/img/layout/readycover4.png';
                    } else if (_novel_thumb.indexOf('/cover/') > 0) {
                        _cover_src = G_CDN_DOMAIN_IMG + _novel_thumb.replace('.file', '.thumb').replace('/img/', '/imagebox/');
                    } else {
                        _cover_src = G_CDN_DOMAIN_IMG + _novel_thumb.replace('/img/', '/imagebox/');
                    }
                    _this.find('.novel-thumbnail > img').attr('src', _cover_src);
                    _this.find('.novel-tit > span').text(v.novel_name);
                    _this.find('.novel-ep-tit').text(v.content_subject);
                    let _comment_img = v.comment_img.replace('//d.novelpia.com', '//img.novelpia.com').replace('//s.novelpia.com', '//img.novelpia.com');
                    _this.find('.comment-area').append('<img class="comment_img s_inv" src="' + _comment_img + '">');
                    _this.find('.comment-area').append('<div class="comment_text">' + v.comment_msg + '</div>');
                    _this.find('.date-recommend .date').text(v.comment_regdate);
                    _this.find('.date-recommend .recommend').text(v.user_count_good.format());
                    _this.find('.menu-more').data('id', v.novel_no);

                    if (v.comment_status === 0 && v.mem_no !== g_mem_no) {
                        if (g_mem_admin < 10) {
                            _this.find('.menu-more').remove();
                            _this.find('.comment_img').remove();
                            _this.find('.comment_text').remove();
                        }
                    }
                });
                g_paging.totalPageCnt = response.result.allCount; // totalpage
            } else {
                g_this.find('.list-tit > p > span').text('(0)');
                let _html = `
						<div class="novel-empty">
							<img class="s_inv" src="${G_CDN_DOMAIN_IMG}/img/new/user_profile/img_piaz.png">
							<p>작성한 댓글이 없습니다.</p>
						</div>
					`;
                g_this.find('.comment-list-wp').html('').append(_html);
            }
        }, complete: function () {
            paging(g_paging, '<img src="//images.novelpia.com/img/new/user_profile/left.png">', '<img src="//images.novelpia.com/img/new/user_profile/right.png">', 'pagination', 'comment'); // 페이징
        }
    });
}