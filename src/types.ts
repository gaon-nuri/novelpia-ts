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

interface EpDownCheckRes extends Res {
    code: string,
    status: number
}

type UserData = {
    data: {
        mem_adt: string,
        mem_birthday: string,
        mem_no: string
    },
    methods: {}
};

export type {
    EpDownCheckRes,
    HttpRes,
    UserData,
};