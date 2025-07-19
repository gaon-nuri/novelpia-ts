import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {getUserCmt} from "../src/official/cmt-tab";
import {partialApply} from "../src/utils/utils";
import type {CmtUISetUpHandlers, MemberInfo} from "../src/types/cmt-tab";
import {AuthGrade, ViewCmt} from "../src/enum/cmt-tab";

describe("getUserCmt 단위 테스트", () => {
    const mockMemNo = 1;
    const mockMemInfo: MemberInfo = {
        g_mem_no: mockMemNo,            // 현재 로그인한 회원 번호
        g_mem_admin: AuthGrade.COMMON,  // 현재 로그인한 회원의 관리자 등급(숫자가 높을수록 권한 높음)
        g_cate: mockMemNo,              // 해당 페이지의 회원 번호(즉, 프로필 주인)
        g_member_view: {
            mem_no: mockMemNo,
            view_comment: ViewCmt.HIDDEN,
            view_like_novel: 0,
            view_like_hash: 0,
            view_sponsor: 0,
            episode_cnt: 1,
            comment_cnt: 0
        }
    };

    let mockGetMemberCmt: jest.Mock;
    let getCmtOfUser: Function;

    beforeEach(() => {
        mockGetMemberCmt = jest.fn();
        getCmtOfUser = partialApply(
            getUserCmt,
            mockMemInfo,
            mockGetMemberCmt
        );
    });

    function setMemCmtStatusToHidden(view: ViewCmt) {
        mockMemInfo.g_member_view.view_comment = view === ViewCmt.HIDDEN
            ? 1
            : 0;
    }

    function setMemToProfileOwner(isOwner: boolean) {
        mockMemInfo.g_mem_no = mockMemNo;
        const someOtherMemNo = 1 + mockMemNo;
        mockMemInfo.g_cate = isOwner ? mockMemNo : someOtherMemNo;
        mockMemInfo.g_member_view.mem_no = mockMemNo;
    }

    function setMemToAdmin(isAdmin: boolean) {
        mockMemInfo.g_mem_admin = isAdmin
            ? 10 // 9보다 큰 적당한 수
            : 3; // 일반(?) 회원 등급
    }

    describe("댓글 공개 상태", () => {
        beforeEach(() => {
            setMemCmtStatusToHidden(ViewCmt.OPEN);
        })

        it("should succeed to get user's public comments", () => {
            getCmtOfUser();

            expect(mockGetMemberCmt).toHaveBeenCalledTimes(1);
        });

        describe("권한 有 (작성자)", () => {
            beforeEach(() => {
                setMemToProfileOwner(true);
            })

            it("should succeed to get one's own comments", () => {
                getCmtOfUser();

                expect(mockGetMemberCmt).toHaveBeenCalledTimes(1);
            });
        });

        describe("권한 有 (관리자)", () => {
            beforeEach(() => {
                setMemToAdmin(true);
            })

            it("should succeed to get customer's comments", () => {
                getCmtOfUser();

                expect(mockGetMemberCmt).toHaveBeenCalledTimes(1);
            });
        });

        describe("권한 無", () => {
            beforeEach(() => {
                setMemToProfileOwner(false);
            })

            it("should succeed to get other user's public comments", () => {
                getCmtOfUser();

                expect(mockGetMemberCmt).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe("댓글 비공개 상태", () => {
        beforeEach(() => {
            setMemCmtStatusToHidden(ViewCmt.HIDDEN);
        })

        describe("권한 有 (작성자)", () => {
            beforeEach(() => {
                setMemToProfileOwner(true);
            })

            it("should succeed to get one's own secret comments", () => {
                getCmtOfUser();

                expect(mockGetMemberCmt).toHaveBeenCalledTimes(1);
            });
        });

        describe("권한 有 (관리자)", () => {
            beforeEach(() => {
                setMemToAdmin(true);
            })

            it("should succeed to get customer's secret comments as admin",
                () => {
                    getCmtOfUser();

                    expect(mockGetMemberCmt).toHaveBeenCalledTimes(1);
                }
            );
        });

        describe("권한 無", () => {
            beforeEach(() => {
                setMemToProfileOwner(false);
                setMemToAdmin(false);
            })

            it("should fail to get other user's secret comments", () => {
                getCmtOfUser();

                expect(mockGetMemberCmt).not.toHaveBeenCalled();
            });

            describe("UI 초기 설정 함수 有", () => {
                let mockCmtUISetUpHandlers: CmtUISetUpHandlers

                beforeEach(() => {
                    mockCmtUISetUpHandlers = {
                        appendCmtHTML: jest.fn(() => {
                            console.info("댓글 HTML 추가");
                        }),
                        setCmtSortOpts: jest.fn(() => {
                            console.info("댓글 정렬 옵션 나열");
                        })
                    };
                });

                it("should fail to get other user's secret comments", () => {
                    getCmtOfUser(mockCmtUISetUpHandlers);

                    expect(mockGetMemberCmt).not.toHaveBeenCalled();
                    [
                        mockCmtUISetUpHandlers.appendCmtHTML,
                        mockCmtUISetUpHandlers.setCmtSortOpts
                    ].forEach(cb => {
                        expect(cb).toHaveBeenCalledTimes(1);
                    });
                });
            });
        });
    });
});