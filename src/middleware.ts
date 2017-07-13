import * as dbx from './dropbox'
import * as Model from './model'
import * as Actions from './actions'
import * as Decimal from 'decimal.js'

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

const DEFAULT_DATA: data_v1 = {"version":1, 

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

function state_change_action_v1(data: data_v1): Actions.DataLoaded {
    return {
        type: 'DATA_LOADED',
        data: {
            accounts: data.accounts.map(x => ({
                id: x.id,
                title: x.title,
                balance: new Decimal(x.balance)
            })),
            envelopes: [...data.envelopes],
            monthlies: [...data.monthlies],
            goals: [...data.goals]
        }
    }
}

export async function save_changes(state: Model.State) {
    const data = format_state_v1(state);
    await dbx.upload_json('/budget.json', JSON.stringify(data));    
}

export async function load_data(): Promise<Actions.DataLoaded | Actions.Logout> {
    const data = await dbx.download_json('/budget.json')    
    if (data.error_summary && data.error_summary.startsWith('path/not_found')) {
        return state_change_action_v1(DEFAULT_DATA);
    }
    if (data.error) {
        return {type: "LOGOUT"}
    }
    switch (data.version) {
        case 1:
            return state_change_action_v1(data)
        default:
            throw new Error("Unknown version. " + data.version);
    }
}

export function logOut() {
    dbx.logOut();
}

function middleware ({getState, dispatch}: {getState:()=>Model.State, dispatch: any}) {
    return (next: (action: Actions.Action)=>Model.State) => {
        return (action: Actions.Action) => {
            if (action.type == 'DATA_START_LOADING') {
                load_data().then(a => dispatch(a))
                return 
            } else if (action.type == 'LOGOUT') {
                logOut();                
            }
            const result = next(action);
            if (action.type != 'DATA_LOADED') {
                //save_changes(result);
            }
            return result;
        }
    }    
}

export default middleware;
