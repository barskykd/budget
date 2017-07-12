import * as Decimal from 'decimal.js'
import * as moment from 'moment';
import { createSelector } from 'reselect'


export type AccountData = {
    title: string,
    balance: any
}

export type Account = AccountData & {
    id: string
}

export type Envelope = {
    date: string,
    amount: string
}

export type Monthly = {
    id: string,
    title: string,
    amount: string,
    defaultAmount: string
}

export type Goal = {
    id: string,
    title: string,
    goalAmount: string,
    goalDate: string,
    amount: string
}

export type State = {
    accounts: Account[],
    envelopes: Envelope[],
    monthlies: Monthly[],
    goals: Goal[]
    loggedInDropbox: boolean    
}

export const getAccountTotals = createSelector(
    [(state:State)=>state.accounts],
    accounts => accounts.reduce((pv, cv)=>pv.plus(cv.balance), new Decimal(0))    
)

export const getEnvelopesTotals = createSelector(
    [(state:State)=>state.envelopes],
    envelopes => envelopes.reduce((pv, cv)=>pv.plus(cv.amount), new Decimal(0))
)

export const getMonthliesTotals = createSelector(
    [(state:State)=>state.monthlies],
    monthlies => monthlies.reduce((pv, cv)=>({
            amount: pv.amount.plus(cv.amount),
            defaultAmount: pv.defaultAmount.plus(cv.defaultAmount)
        }), {
            amount: new Decimal(0),
            defaultAmount: new Decimal(0)
        })
)

export function perMonth(g: Goal) {
    if (!g.goalDate || !g.goalAmount) {
        return 0;
    }
    let gdate = moment(g.goalDate);
    if (!gdate.isValid()) {
        return 0;
    }
    let currentDate = moment();
    let md = gdate.diff(currentDate, 'months');
    if (md <= 0) {
        return 0;
    }
    return new Decimal(g.goalAmount).minus(new Decimal(g.amount)).div(md);
}

export type GoalsTotals = {
    amount: decimal.Decimal,
    perMonth: decimal.Decimal
}

export const getGoalsTotals = createSelector(
    [(state:State)=>state.goals],
    goals => goals.reduce((pv, cv)=>({
            amount: pv.amount.plus(cv.amount),
            perMonth: pv.perMonth.plus(perMonth(cv))
        }), {
            amount: new Decimal(0),
            perMonth: new Decimal(0)
        })
)

