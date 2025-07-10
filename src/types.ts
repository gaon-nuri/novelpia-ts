type UserData = {
    data: {
        mem_adt: string,
        mem_birthday: string,
        mem_no: string
    },
    methods: {}
};

type EpDownCheckRes = {
    "status": number, "errmsg": string, "code": string
};

export {UserData, EpDownCheckRes};