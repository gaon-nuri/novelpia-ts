import status from "http-status";
import {beforeEach, describe, expect, it, jest, test} from "@jest/globals";
import {getCmtInWriter, getUserCmt} from "../src/official/official.comment";
import {getRandInt, partialApply} from "../src/utils/utils";
import type {HttpFnWithDataType, HttpRes} from "../src/types/type.main";
import type {CmtUISetUpHandlers, MemberInfo} from "../src/types/type.comment";
import {AuthGrade, ViewCmt} from "../src/types/enum.comment";
import {MAX_CMT_CNT, MAX_USER_NO} from "../src/const/const.main";

describe("getCmtInWriter 단위 테스트", () => {
    const mockWriterNo = getRandInt(1, MAX_USER_NO);
    const setMockHttpRetVal = (
        fn: jest.Mock<HttpFnWithDataType>,
        res: HttpRes
    ) => {
        fn.mockReturnValue(Promise.resolve(res));
    }

    let mockHttp: jest.Mock<HttpFnWithDataType>;
    let mockGetUserCmt: jest.Mock;
    let getCmtOfWriter: Function;
    let mockCmtCnt: number;

    beforeEach(() => {
        mockHttp = jest.fn();
        mockGetUserCmt = jest.fn();
        getCmtOfWriter = partialApply(
            getCmtInWriter,
            mockWriterNo,
            mockHttp,
            mockGetUserCmt
        );
    });

    describe(`${mockWriterNo}번 회원: 댓글 無`, () => {
        beforeEach(() => {
            mockCmtCnt = 0;
            setMockHttpRetVal(mockHttp, {
                status: status.IM_A_TEAPOT.toString(),
                errmsg: "",
                result: {cnt: mockCmtCnt}
            });
        })

        test("어떤 콜백도 無", async () => {
            await getCmtOfWriter();

            [
                mockHttp,
                mockGetUserCmt
            ].forEach(cb => {
                expect(cb).toHaveBeenCalledTimes(1)
            });
        });

        describe("성공 콜백 有", () => {
            let mockSuccCb: jest.Mock<(res: HttpRes, ...[]) => void>;

            beforeEach(() => {
                mockSuccCb = jest.fn((
                    res: HttpRes,
                    ...[]
                ) => {
                    console.info(res.result.cnt);
                });
            });

            test("성공 콜백 有", async () => {
                await getCmtOfWriter(mockSuccCb);

                [
                    mockHttp,
                    mockGetUserCmt
                ].forEach(cb => {
                    expect(cb).toHaveBeenCalledTimes(1);
                });

                expect(mockSuccCb).not.toHaveBeenCalled();
            });
        });
    });

    describe(`${mockWriterNo}번 회원: 댓글 有`, () => {
        beforeEach(() => {
            mockCmtCnt = getRandInt(1, MAX_CMT_CNT);
        })

        describe("성공 콜백 無", () => {
            test("HTTP OK", async () => {
                setMockHttpRetVal(mockHttp, {
                    status: status.OK.toString(),
                    errmsg: "",
                    result: {cnt: mockCmtCnt}
                });

                await getCmtOfWriter();

                [
                    mockHttp,
                    mockGetUserCmt
                ].forEach(cb => {
                    expect(cb).toHaveBeenCalledTimes(1)
                });
            });
        });

        describe("성공 콜백 有", () => {
            let mockSuccCb: jest.Mock<(res: HttpRes, ...[]) => void>;

            beforeEach(() => {
                mockSuccCb = jest.fn((
                    res: HttpRes,
                    ...[]
                ) => {
                    console.info(res.result.cnt);
                });
            });

            describe("로그인 콜백 無", () => {
                test("기본 로그인 콜백, 미사용", async () => {
                    setMockHttpRetVal(mockHttp, {
                        status: status.IM_A_TEAPOT.toString(),
                        errmsg: "",
                        result: {cnt: mockCmtCnt}
                    });

                    await getCmtOfWriter(mockSuccCb);

                    [
                        mockHttp,
                        mockSuccCb,
                        mockGetUserCmt
                    ].forEach(cb => {
                        expect(cb).toHaveBeenCalledTimes(1)
                    });
                });
            });
        });

        describe("성공 콜백 無", () => {
            describe("로그인 콜백 有", () => {
                let mockLoginCb: jest.Mock;
                let getCmtOfWriterWithLoginCb: Function;

                beforeEach(() => {
                    mockLoginCb = jest.fn(() => {
                        console.info("Logined");
                    });
                    getCmtOfWriterWithLoginCb = partialApply(
                        getCmtOfWriter,
                        undefined,
                        mockLoginCb
                    );
                });

                describe("HTTP 콜백 無", () => {
                    test("HTTP 200", async () => {
                        setMockHttpRetVal(mockHttp, {
                            status: status.OK.toString(),
                            errmsg: "",
                            result: {cnt: mockCmtCnt}
                        });

                        await getCmtOfWriterWithLoginCb();

                        [
                            mockHttp,
                            mockGetUserCmt
                        ].forEach(cb => {
                            expect(cb).toHaveBeenCalledTimes(1)
                        });

                        expect(mockLoginCb).not.toHaveBeenCalled();
                    })

                    test("HTTP 401", async () => {
                        setMockHttpRetVal(mockHttp, {
                            status: status.UNAUTHORIZED.toString(),
                            errmsg: "",
                            result: {cnt: mockCmtCnt}
                        });

                        await getCmtOfWriterWithLoginCb();

                        [
                            mockHttp,
                            mockLoginCb,
                            mockGetUserCmt
                        ].forEach(cb => {
                            expect(cb).toHaveBeenCalledTimes(1)
                        });
                    });
                });

                describe("HTTP 콜백 有", () => {
                    let mockHttpFbCb: jest.Mock<(res: HttpRes) => void>;

                    beforeEach(() => {
                        mockHttpFbCb = jest.fn((res: HttpRes) => {
                            console.info(res.status);
                        });
                    });

                    test("HTTP 200/401 外", async () => {
                        setMockHttpRetVal(mockHttp, {
                            status: status.IM_A_TEAPOT.toString(),
                            errmsg: "",
                            result: {cnt: mockCmtCnt}
                        });

                        await getCmtOfWriterWithLoginCb(
                            undefined,
                            mockHttpFbCb
                        );

                        expect(mockHttp).toHaveBeenCalledTimes(1);
                        expect(mockLoginCb).toHaveBeenCalledTimes(0);
                        expect(mockHttpFbCb).toHaveBeenCalledTimes(1);
                        expect(mockGetUserCmt).toHaveBeenCalledTimes(1);
                    });
                });
            });

            describe("로그인 콜백 無", () => {
                describe("HTTP 콜백 有", () => {
                    let mockHttpFbCb: jest.Mock<(res: HttpRes) => void>;
                    let getCmtOfWriterWithHTTPFbCb: Function;

                    beforeEach(() => {
                        mockHttpFbCb = jest.fn((res: HttpRes) => {
                            console.info(res.status);
                        });
                        getCmtOfWriterWithHTTPFbCb = partialApply(
                            getCmtOfWriter,
                            undefined,
                            undefined,
                            undefined,
                            mockHttpFbCb
                        );
                    });

                    test("HTTP 200", async () => {
                        setMockHttpRetVal(mockHttp, {
                            status: status.OK.toString(),
                            errmsg: "",
                            result: {
                                cnt: mockCmtCnt
                            }
                        });

                        await getCmtOfWriterWithHTTPFbCb();

                        [
                            mockHttp,
                            mockGetUserCmt
                        ].forEach(cb => {
                            expect(cb).toHaveBeenCalledTimes(1);
                        });

                        expect(mockHttpFbCb).not.toHaveBeenCalled();
                    })

                    test("HTTP 200/401 外", async () => {
                        setMockHttpRetVal(mockHttp, {
                            status: status.IM_A_TEAPOT.toString(),
                            errmsg: "",
                            result: {cnt: mockCmtCnt}
                        });

                        await getCmtOfWriterWithHTTPFbCb();

                        [
                            mockHttp,
                            mockHttpFbCb,
                            mockGetUserCmt
                        ].forEach(cb => {
                            expect(cb).toHaveBeenCalledTimes(1)
                        });
                    });
                });
            });
        });
    });
});

describe("getUserCmt 단위 테스트", () => {
    const mockMemNo = getRandInt(1, MAX_USER_NO);
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

    describe(`${mockMemNo}번 회원: 댓글 공개 상태`, () => {
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

    describe(`${mockMemNo}번 회원: 댓글 비공개 상태`, () => {
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
})