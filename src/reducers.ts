import {combineReducers} from 'redux';
import * as uuid from 'node-uuid';

import {Action} from './actions';
import * as Actions from './actions';
import * as Model from './model';

function throw_invalid_action(action: Action): never {
    throw new Error("Invalid action: " + action.type);
}

function add_account(action: Actions.AddAccount): Model.Account {    
    return {
            id: uuid.v4(),
            title: action.account.title,
            balance: action.account.balance
        }    
}

function update_account(state: Model.Account, action: Actions.UpdateAccount): Model.Account {   
    if (state.id == action.account.id) {
        return {
            ...state,
            ...action.account
        }
    }
    return state;
}

function remove_account(state: Model.Account, action: Actions.RemoveAccount): boolean {
    return state.id != action.account_id;
}

export function accounts (state: Model.Account[] | undefined, action: Action): Model.Account[] {
    if (!state) {
        state = [];
    }
    switch (action.type) {
        case 'ADD_ACCOUNT':
            return state.concat(add_account(action))
        case 'UPDATE_ACCOUNT':
            return state.map(x => update_account(x, action));
        case 'REMOVE_ACCOUNT':
            return state.filter(x => remove_account(x, action))
        case 'DATA_LOADED':
            return action.data.accounts
        default:
            return state;
    }
}

function upsert_envelope(state: Model.Envelope[], action: Actions.UpdateEnvelope) {
    let idx = null;
    for (let i = 0; i < state.length; ++ i) {
        if (state[i].date == action.envelope.date) {
            idx = i;
            break;
        }
    }
    if (idx != null) {
        return [...state.slice(0, idx), {
            ...state[idx],
            ...action.envelope
        }, ...state.slice(idx + 1)]
    } else {
        return [...state, {
            date: action.envelope.date || '',
            amount: action.envelope.amount || '0.00'
        }];
    }
}

function envelopes(state: Model.Envelope[] | undefined, action: Action): Model.Envelope[] {
    if (!state) {
        state = [];
    }
    switch (action.type) {
        case 'DATA_LOADED':
            return action.data.envelopes;
        case 'UPDATE_ENVELOPE':
            return upsert_envelope(state, action);
        case 'REMOVE_ENVELOPE':
            return state.filter(x => x.date != action.date);
        default:
            return state;
    }
}

function monthlies(state: Model.Monthly[] | undefined, action: Action): Model.Monthly[] {
    if (!state) {
        state = [];
    }
    switch (action.type) {
        case 'DATA_LOADED':
            return action.data.monthlies;
        default:
            return state;
    }
}

function goals(state: Model.Goal[] | undefined, action: Action): Model.Goal[] {
    if (!state) {
        state = [];
    }
    switch (action.type) {
        case 'DATA_LOADED':
            return action.data.goals;
        default:
            return state;
    }
}

export function loggedInDropbox(state: boolean, action: Action): boolean {
    return state || false;
}

export default combineReducers<Model.State>({
        accounts,
        loggedInDropbox,
        envelopes,
        monthlies,
        goals
    });