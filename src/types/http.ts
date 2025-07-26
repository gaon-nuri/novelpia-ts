// src/types/http.ts
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
    Res,
    HttpRes
};