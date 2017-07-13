import * as React from "react";

import { connect, Provider } from 'react-redux'
import * as Decimal from 'decimal.js'

import * as Model from './model';
import * as Actions from './actions';

type BudgetSummaryProps = {
    totalAccounts: string,
    totalWeeklyes: string,
    totalMonthlyes: string,
    totalGoals: string,
    balance: string,
}

class BudgetSummary extends React.Component<BudgetSummaryProps, {}> {
    render() {
        let balanceClass = new Decimal(this.props.balance || '0.0').lessThan(0) ? 'budget-summary-balance-negative' : 'budget-summary-balance-positive';
        return <div className="budget-summary">
            <table className="budget-summary-table">
                <tbody>
                    <tr>
                        <td>Total money</td>
                        <td>{this.props.totalAccounts}</td>
                    </tr>
                    <tr>
                        <td>Allocated to weekly spendings</td>
                        <td>- {this.props.totalWeeklyes}</td>
                    </tr>
                    <tr>
                        <td>Allocated to monthly spendings</td>
                        <td>- {this.props.totalMonthlyes}</td>
                    </tr>
                    <tr>
                        <td>Allocated to goals</td>
                        <td>- {this.props.totalGoals}</td>
                    </tr>
                    <tr className={`budget-summary-balance ${balanceClass}`}>
                        <td>Balance</td>
                        <td>{this.props.balance}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    }
}

export default connect(
    (state: Model.State) => ({
        totalAccounts: Model.getAccountTotals(state),
        totalWeeklyes: Model.getEnvelopesTotals(state),
        totalMonthlyes: Model.getMonthliesTotals(state).remainingAmount,
        totalGoals: Model.getGoalsTotals(state).amount,
        balance: Model.getBalance(state)
    })    
) (BudgetSummary);