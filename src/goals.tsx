import * as React from "react";
import { connect, Provider } from 'react-redux'
import * as ReactModal from "react-modal";
import * as moment from 'moment';
import * as Decimal from 'decimal.js';
import * as uuid from 'node-uuid';

import InplaceInput from './inplaceinput'
import {MoneyInput} from './inplaceinput'
import ButtonWithConfirmation from './ButtonWithConfirmation'
import * as Model from './model';
import * as Actions from './actions';

type GoalListItemProps = {
    goal: Model.Goal,
    onUpdate: (goal: Partial<Model.Goal>)=>void,
    onDelete: (goal_id: string)=>void
}

function formatGoalDate(d: string) {
    if (!d) {
        return ''
    }
    let md = moment(d);
    if (!md.isValid()) {
        return ''
    }
    return md.format('YYYY-MM');
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
        <td>
            <InplaceInput value={g.title} onChange={v=>props.onUpdate({title: v})}/>
        </td>
        <td>
            <MoneyInput value={g.goalAmount} onChange={v=>props.onUpdate({goalAmount: v})}/>            
        </td>
        <td>
            <InplaceInput value={formatGoalDate(g.goalDate)} inputType="month" onChange={(v)=>props.onUpdate({goalDate: v})}/>
        </td>        
        <td>
            <MoneyInput value={g.amount} onChange={v=>props.onUpdate({amount: v})}/>
        </td>
        <td>{formatPerMonth(g)}</td>
        <td>{formatProgress(g)}</td>
        <td><button>Add per month</button></td>        
        <td>
            <ButtonWithConfirmation 
                buttonText="&times;" 
                confirmMessage={"Delete goal " + g.title + "?"}
                confirmLabel="Confirm"
                cancelLabel="Cancel"
                onConfirm={() => props.onDelete(g.id)}
            />
        </td>        
    </tr>
}

type GoalListProps = {
    goals: Model.Goal[],
    goalsTotals: Model.GoalsTotals,
    addGoal: (goal:Model.Goal) => void,
    updateGoal: (goal: Partial<Model.Goal>) => void,
    removeGoal: (goal_id: string) => void
}

class GoalList extends React.Component<GoalListProps, {}> {
    render() {
        return <div className="goals">
            <div className="header">Goals</div>                    
            <table className="goals-table">
                <colgroup>
                    <col className="goals-table-name"/>
                    <col className="goals-table-amount"/>
                    <col className="goals-table-date"/>
                    <col className="goals-table-assigned"/>
                    <col className="goals-table-permonth"/>
                    <col className="goals-table-progress"/>
                    <col className="goals-table-add-permonth-button"/>
                    <col className="goals-table-delete-button"/>
                </colgroup>
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
                    {this.props.goals.map(x => <GoalListItem key={x.id} goal={x} 
                        onUpdate={g => this.props.updateGoal({...g, id: x.id})} 
                        onDelete={g_id => this.props.removeGoal(g_id)}/>)}
                </tbody>
                <tfoot>
                    <tr className="goals-table-total">
                        <td>Total</td>
                        <td></td>
                        <td></td>
                        <td>{this.props.goalsTotals.amount}</td>
                        <td>{this.props.goalsTotals.perMonth}</td>
                    </tr>
                </tfoot>
            </table>
            <button onClick={() => this.props.addGoal({
                id: uuid.v4(),
                title: 'Goal',
                amount: '0.00',
                goalAmount: '0.00',
                goalDate: ''
                })}>+ Goal</button>
        </div>
    }    
}

export default connect(
    (state:Model.State) => ({
        goals: state.goals,
        goalsTotals: Model.getGoalsTotals(state)
    }),
    (dispatch: (action:Actions.Action) => void) => ({
        addGoal(goal: Model.Goal) {
            dispatch({type: 'ADD_GOAL', goal});
        },
        updateGoal(goal: Partial<Model.Goal>) {
            dispatch({type: 'UPDATE_GOAL', goal});
        },
        removeGoal(goal_id: string) {
            dispatch({type: 'REMOVE_GOAL', goal_id})
        }
    })  
)(GoalList);