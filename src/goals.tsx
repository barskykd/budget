import * as React from "react";
import { connect, Provider } from 'react-redux'
import * as ReactModal from "react-modal";
import * as moment from 'moment';
import * as Decimal from 'decimal.js';

import * as Model from './model';

type GoalListItemProps = {
    goal: Model.Goal
}

function formatGoalDate(d: string) {
    if (!d) {
        return ''
    }
    let md = moment(d);
    if (!md.isValid()) {
        return ''
    }
    return md.format('MMM YYYY');
}



function formatPerMonth(g: Model.Goal) {
    let pm = Model.perMonth(g);
    if (!pm) {
        return ''
    }
    return pm.toFixed(2);    
}

function formatProgress(g: Model.Goal) {
    if (!g.goalAmount) {
        return ''
    }
    return new Decimal(g.amount).div(new Decimal(g.goalAmount)).times(100).toFixed(0);
}

function GoalListItem(props: GoalListItemProps) {
    let g = props.goal;    
    return <tr>
        <td>{g.title}</td>
        <td>{new Decimal(g.goalAmount).toFixed(2)}</td>
        <td>{formatGoalDate(g.goalDate)}</td>
        <td>{new Decimal(g.amount).toFixed(2)}</td>
        <td>{formatPerMonth(g)}</td>
        <td>{formatProgress(g)}</td>
        <td><button>Add per month</button></td>
        <td><button>...</button></td>
        <td><button>&times;</button></td>        
    </tr>
}

type GoalListProps = {
    goals: Model.Goal[],
    goalsTotals: Model.GoalsTotals
}

function GoalList(props: GoalListProps) {
    return <div className="goals">
        <div className="header">Goals</div>                    
        <table className="goals-table">
            <thead>
                <tr>
                    <td>Goal</td>
                    <td>Amount</td>
                    <td>Date</td>
                    <td>Assigned</td>
                    <td>Per month</td>
                    <td>Progress</td>                
                </tr>
            </thead>
            <tbody>
                {props.goals.map(x => <GoalListItem key={x.id} goal={x}/>)}
            </tbody>
            <tfoot>
                <tr className="goals-table-total">
                    <td>Total</td>
                    <td></td>
                    <td></td>
                    <td>{props.goalsTotals.amount.toFixed(2)}</td>
                    <td>{props.goalsTotals.perMonth.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
    </div>
}

export default connect(
    (state:Model.State) => ({
        goals: state.goals,
        goalsTotals: Model.getGoalsTotals(state)
    })
)(GoalList);