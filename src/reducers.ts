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

function update_monthly(state: Model.Monthly, action: Actions.UpdateMonthly) {
    if (state.id == action.monthly.id) {
        return {...state, ...action.monthly};
    }
    return state;
}

function monthlies(state: Model.Monthly[] | undefined, action: Action): Model.Monthly[] {
    if (!state) {
        state = [];
    }
    switch (action.type) {
        case 'DATA_LOADED':
            return action.data.monthlies;
        case 'ADD_MONTHLY':
            return [...state, action.monthly];            
        case 'UPDATE_MONTHLY':
            return state.map(x => update_monthly(x, action))
        case 'REMOVE_MONTHLY':
            return state.filter(x => x.id != action.monthly_id)
        default:
            return state;
    }
}

function update_goal(x: Model.Goal, action: Actions.UpdateGoal): Model.Goal {
    if (x.id == action.goal.id) {
        return {...x, ...action.goal}
    }
    return x;
}

function goals(state: Model.Goal[] | undefined, action: Action): Model.Goal[] {
    if (!state) {
        state = [];
    }
    switch (action.type) {
        case 'DATA_LOADED':
            return action.data.goals;
        case 'ADD_GOAL':
            return [...state, action.goal];
        case 'UPDATE_GOAL':
            return state.map(x => update_goal(x, action));            
        case 'REMOVE_GOAL':
            return state.filter(x => x.id != action.goal_id);
        default:
            return state;
    }
}

export function loggedInDropbox(state: boolean, action: Action): boolean {
    return state || false;
}

function loadingState(state: Model.LoadingState, action: Action): Model.LoadingState {
    if (!state) {
        state = "LOADING"
    }
    switch (action.type) {
        case 'DATA_LOADED':
            return "LOADED"
        default:
            return state;
    }
}

export default combineReducers<Model.State>({
        accounts,
        loggedInDropbox,
        envelopes,
        monthlies,
        goals,
        loadingState,
    });