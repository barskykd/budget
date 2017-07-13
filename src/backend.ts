import * as Decimal from 'decimal.js'
import * as _ from 'lodash';

import * as dbx from './dropbox';
import * as Model from './model';
import * as Actions from './actions';


type data_v1 = {
    version: 1
    accounts: {
        id: string,
        title: string,
        balance: string
    }[],
    envelopes: {
        date: string,
        amount: string
    }[],
    monthlies: {
        id: string,
        title: string,
        amount: string,
        spentIn: string | null
    }[],
    goals: {
        id: string,
        title: string,
        goalAmount: string,
        goalDate: string,
        amount: string
    }[]
}

const DEFAULT_DATA: Model.StoredData = {    
    "accounts": [
        {"id":"1", "title": "Cash", "balance": "2850"},
        {"id":"2", "title": "Bank account", "balance": "3051.97"}	
    ],
    "envelopes": [
    ],
    "monthlies": [
        {"id": "1", "title": "Utility bills", "amount": "2850.00", "spentIn": null},
        {"id": "2", "title": "TV subscription", "amount": "7000.00", "spentIn": null}
    ],
    "goals": [	
        {"id": "1", "title": "X BOX ONE X", "goalAmount": "16000.00", "goalDate":"2018-05-01", "amount": "0.0"},
        {"id": "2", "title": "New Iphone", "goalAmount": "18000.00", "goalDate":"2018-05-01", "amount": "100.0"}
    ]
}

function format_state_v1(state: Model.State): data_v1
{
    return {
        version: 1,
        accounts: state.accounts.map(x => ({
            id: x.id,
            title: x.title,
            balance: x.balance.toString()
        })),
        envelopes: state.envelopes.map(x => ({
            date: x.date,
            amount: x.amount
        })),
        monthlies: state.monthlies.map(x => ({
            id: x.id,
            title: x.title,
            amount: x.amount,
            spentIn: x.spentIn
        })),
        goals: state.goals.map(x => ({
            id: x.id,
            title: x.title,
            goalAmount: x.goalAmount,
            goalDate: x.goalDate,
            amount: x.amount
        }))
    }
}

function parse_data_v1(data: data_v1): Model.StoredData {
    return {
            accounts: data.accounts.map(x => ({
                ...x,
                balance: new Decimal(x.balance)
            })),
            envelopes: [...data.envelopes],
            monthlies: [...data.monthlies],
            goals: [...data.goals]
        }
}

async function fetch_data(handlers: {
    loaded: (d: Model.StoredData) => void,
    notExists: () => void,
    loginError: () => void,
    parseError: (err: Error) => void
}) {
    const data = await dbx.download_json('/budget.json')    
    if (data.error_summary && data.error_summary.startsWith('path/not_found')) {
        handlers.notExists();        
        return;
    }
    if (data.error) {
        handlers.loginError();        
        return;
    }
    switch (data.version) {
        case 1:
            handlers.loaded(parse_data_v1(data));
            return;
        default:
            handlers.parseError(new Error("Unknown version. " + data.version));
            return;
    }
}

export function loadData(handlers: {
    loaded: (d: Model.StoredData) => void,
    loginError: () => void,
    parseError: (e: Error) => void
}) {
    fetch_data({
        loaded: handlers.loaded,
        notExists: () => handlers.loaded(DEFAULT_DATA),
        loginError: handlers.loginError,
        parseError: handlers.parseError
    });
}

export function isLoggedIn() {
    return dbx.loggedIn();
}

export function logOut() {
    dbx.logOut();
}

export const save_changes = _.throttle(
    async function(state: Model.State) {
        const data = format_state_v1(state);
        await dbx.upload_json('/budget.json', data);    
    }, 3000);


