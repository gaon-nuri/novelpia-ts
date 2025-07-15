type HttpFnWithDataType = (
    type: string,
    url: string,
    data: {},
    dataType: string
) => Promise<HttpRes>;

interface Res {
    errmsg: string,
    status: number | string
}

interface HttpRes extends Res {
    result: {
        cnt: number
    },
    status: string
}

export type {
    HttpFnWithDataType,
    HttpRes,
};