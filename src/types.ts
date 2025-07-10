type HttpEpResFn = (
    type: string,
    url: string,
    data: {}
) => Promise<EpDownCheckRes>;

type HttpFn = (
    type: string,
    url: string,
    data: {}
) => Promise<HttpRes>;

type HttpStrFn = (
    type: string,
    url: string,
    data: {}
) => Promise<string>;

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

interface SuccCbs {
    loginCallback: Function,
}

interface ToggleStateCbs extends SuccCbs {
    authCallback: Function,
    offCallback: Function,
    onCallback: Function
}

export type {
    EpDownCheckRes,
    HttpEpResFn,
    HttpFn,
    HttpStrFn,
    HttpRes,
    ToggleStateCbs,
    UserData
};