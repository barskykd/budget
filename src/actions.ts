import * as Model from './model';

export type AddAccount = {
    type: 'ADD_ACCOUNT',
    account: Model.AccountData
}

export type UpdateAccount = {
    type: 'UPDATE_ACCOUNT',
    account: Partial<Model.Account>
}

export type RemoveAccount = {
    type: 'REMOVE_ACCOUNT',
    account_id: string
}

export type UpdateEnvelope = {
    type: 'UPDATE_ENVELOPE',
    envelope: Partial<Model.Envelope>
}

export type RemoveEnvelope = {
    type: 'REMOVE_ENVELOPE',
    date: string
}

export type DataStartLoading = {
    type: "DATA_START_LOADING"    
}

export type DataLoaded = {
    type: 'DATA_LOADED',
    data: {
        accounts: Model.Account[],
        envelopes: Model.Envelope[],
        monthlies: Model.Monthly[],
        goals: Model.Goal[]
    }
}

export type Action = AddAccount | 
        UpdateAccount | 
        RemoveAccount | 
        UpdateEnvelope |
        RemoveEnvelope |
        DataLoaded |
        DataStartLoading