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
    spentIn: string | null
}

export type MonthliesTotals = {
    fullAmount: string,
    remainingAmount: string
}

export type Goal = {
    id: string,
    title: string,
    goalAmount: string,
    goalDate: string,
    amount: string
}

export type LoadingState = "LOADED" | "LOADING" | "LOADINGERROR";

export type StoredData = {
        accounts: Account[],
        envelopes: Envelope[],
        monthlies: Monthly[],
        goals: Goal[]
    }

export type State = {
    accounts: Account[],
    envelopes: Envelope[],
    monthlies: Monthly[],    
    goals: Goal[]
    loggedInDropbox: boolean ,
    loadingState: LoadingState,
    unsavedChanges: number
}

export const getAccountTotals = createSelector(
    [(state:State)=>state.accounts],
    accounts => accounts.reduce((pv, cv)=>pv.plus(cv.balance), new Decimal(0)).toFixed(2)  
)

export const getEnvelopesTotals = createSelector(
    [(state:State)=>state.envelopes],
    envelopes => envelopes.reduce((pv, cv)=>pv.plus(cv.amount), new Decimal(0)).toFixed(2)
)

export const getMonthliesTotals = createSelector(
    [(state:State)=>state.monthlies],
    monthlies => { 
        let {fullAmount, remainingAmount} = monthlies.reduce((pv, cv)=>({
            fullAmount: pv.fullAmount.plus(cv.amount),
            remainingAmount: pv.remainingAmount.plus(
                isMonthlyPaidInCurrentMonth(cv) ? 0: cv.amount
            )
        }), {
            fullAmount: new Decimal(0),
            remainingAmount: new Decimal(0)
        })
        let result:MonthliesTotals = {
            fullAmount: fullAmount.toFixed(2),
            remainingAmount: remainingAmount.toFixed(2)
        }
        return result;
    }
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
    amount: string,
    perMonth: string
}

export const getGoalsTotals = createSelector(
    [(state:State)=>state.goals],
    goals => {
        let totals = goals.reduce((pv, cv)=>({
            amount: pv.amount.plus(cv.amount),
            perMonth: pv.perMonth.plus(perMonth(cv))
        }), {
            amount: new Decimal(0),
            perMonth: new Decimal(0)
        })
        return {
            amount: totals.amount.toFixed(2),
            perMonth: totals.amount.toFixed(2)
        }

    }
)

export const getBalance = createSelector(
    getAccountTotals,
    getEnvelopesTotals,
    getMonthliesTotals,
    getGoalsTotals,
    (acc, env, month, goal) => {
        return Decimal(acc).minus(env).minus(month.remainingAmount).minus(goal.amount).toFixed(2);
    }
)

export function formatYearMonth(d: any) {
    if (!d) {
        return ''
    }
    let md = moment(d);
    if (!md.isValid()) {
        return ''
    }
    return md.format('YYYY-MM');
}

export function isMonthlyPaidInCurrentMonth(m: Monthly) {
    return formatYearMonth(m.spentIn) == formatYearMonth(new Date())
}
