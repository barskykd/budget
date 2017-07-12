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
        defaultAmount: string
    }[],
    goals: {
        id: string,
        title: string,
        goalAmount: string,
        goalDate: string,
        amount: string
    }[]
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
            defaultAmount: x.defaultAmount
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

export async function load_data(): Promise<Actions.DataLoaded> {
    const data = await dbx.download_json('/budget.json')    
    switch (data.version) {
        case 1:
            return state_change_action_v1(data)
        default:
            throw new Error("Unknown version. " + data.version);
    }
}

function middleware ({getState, dispatch}: {getState:()=>Model.State, dispatch: any}) {
    return (next: (action: Actions.Action)=>Model.State) => {
        return (action: Actions.Action) => {
            if (action.type == 'DATA_START_LOADING') {
                load_data().then(a => dispatch(a))
                return 
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
