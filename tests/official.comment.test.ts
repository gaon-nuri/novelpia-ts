import status from "http-status";
import {beforeEach, describe, expect, jest, test} from "@jest/globals";
import {getCmtInWriter} from "../src/official/official.comment";
import {partialApply} from "../src/utils/utils";
import type {HttpFnWithDataType, HttpRes} from "../src/types/type.main";

describe("getCmtInWriter 단위 테스트", () => {
    const mockWriterNo = 1;
    const setMockHttpRetVal = (
        fn: jest.Mock<HttpFnWithDataType>,
        res: HttpRes
    ) => {
        fn.mockReturnValue(Promise.resolve(res));
    }

    let mockHttp: jest.Mock<HttpFnWithDataType>;
    let mockGetUserCmt: jest.Mock;
    let getCmtOfWriter: Function;
    let mockCount: number;

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

    describe("댓글 無", () => {
        beforeEach(() => {
            mockCount = 0;
            setMockHttpRetVal(mockHttp, {
                status: status.IM_A_TEAPOT.toString(),
                errmsg: "",
                result: {cnt: mockCount}
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

    describe("댓글 有", () => {
        beforeEach(() => {
            mockCount = 1;
        })

        describe("성공 콜백 無", () => {
            test("HTTP OK", async () => {
                setMockHttpRetVal(mockHttp, {
                    status: status.OK.toString(),
                    errmsg: "",
                    result: {cnt: mockCount}
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
                        result: {cnt: mockCount}
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
                            result: {cnt: mockCount}
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
                            result: {cnt: mockCount}
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
                            result: {cnt: mockCount}
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
                                cnt: mockCount
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
                            result: {cnt: mockCount}
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
