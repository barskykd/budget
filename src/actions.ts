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

export type AddMonthly = {
    type: 'ADD_MONTHLY',
    monthly: Model.Monthly
}

export type UpdateMonthly = {
    type: 'UPDATE_MONTHLY',
    monthly: Partial<Model.Monthly>
}

export type RemoveMonthly = {
    type: 'REMOVE_MONTHLY',
    monthly_id: string
}

export type AddGoal = {
    type: 'ADD_GOAL',
    goal: Model.Goal
}

export type UpdateGoal = {
    type: 'UPDATE_GOAL',
    goal: Partial<Model.Goal>
}

export type RemoveGoal = {
    type: 'REMOVE_GOAL',
    goal_id: string
}

export type DataStartLoading = {
    type: "DATA_START_LOADING"    
}

export type DataLoaded = {
    type: 'DATA_LOADED',
    data: Model.StoredData
}

export function dataLoaded(data: Model.StoredData): DataLoaded {
    return {
        type: "DATA_LOADED",
        data
    }
}

export type Logout = {
    type: 'LOGOUT'
}

export function logout():Logout {
    return {
        type: 'LOGOUT'
    }
}

export type DataSaved = {
    type: 'DATA_SAVED',
    changesCount: number
}

export function dataSaved(changesCount: number): DataSaved {
    return {
        type: 'DATA_SAVED',
        changesCount
    }
}

export type Action = AddAccount | UpdateAccount | RemoveAccount | 
        UpdateEnvelope | RemoveEnvelope |
        AddGoal | UpdateGoal | RemoveGoal |
        AddMonthly | UpdateMonthly | RemoveMonthly |
        DataLoaded |
        DataStartLoading |
        DataSaved |
        Logout


