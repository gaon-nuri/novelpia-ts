// src/types/main.ts
import {HttpRes} from "./http";

type HttpFn = (
    type: string,
    url: string,
    data: {}
) => Promise<HttpRes>;

type UserData = {
    data: {
        mem_adt: string,
        mem_birthday: string,
        mem_no: string
    },
    methods: {}
};

export type {
    HttpFn,
    UserData
};