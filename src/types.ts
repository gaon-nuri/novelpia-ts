interface HttpRes {
    errmsg: string,
    result: {
        cnt: number
    },
    status: string
}

interface EpDownCheckRes {
    code: string,
    errmsg: string,
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