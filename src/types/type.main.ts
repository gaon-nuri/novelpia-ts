import {HttpRes, Res} from "@type/http";

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

type HttpFnWithDataType = (
    type: string,
    url: string,
    data: {},
    dataType: string
) => Promise<HttpRes>;

type HttpStrFn = (
    type: string,
    url: string,
    data: {}
) => Promise<string>;

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

interface AlarmDelCbs extends SuccCbs {
    okCallback: Function,
}

export type {
    AlarmDelCbs,
    EpDownCheckRes,
    HttpEpResFn,
    HttpFn,
    HttpFnWithDataType,
    HttpStrFn,
    ToggleStateCbs,
    UserData
};