import "babel-polyfill";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactModal from "react-modal";

import * as dbx from './dropbox';
import * as Decimal from 'decimal.js'
import * as Model from './model';
import * as Actions from './actions';
import Accounts from './accounts';
import Envelopes from './envelopes';
import Monthlies from './monthlies';
import Goals from './goals';
import MiddleWare from './middleware'

import { connect, Provider } from 'react-redux'
import { createStore, applyMiddleware} from 'redux'

declare var window: any;
declare var Redux: any;

import Reducers from './reducers';

let redux_store = createStore<Model.State>(Reducers, {
    accounts: [],
    envelopes: [],
    monthlies: [],
    goals: [],
    loggedInDropbox: dbx.loggedIn(),
    loadingState: "LOADING"
}, applyMiddleware(MiddleWare))

interface WithId {
    id: string
}

interface Account {
    name: string,
    balance: number
}

interface Envelope {
    weekStart: Date,
    amount: number
}

interface Monthly {
    name: string,
    amount: number,
    payedThisMonth?: number,
    thisMonth?: Date
}

interface Goal {
    name: string,
    amount: number,
    goalAmount: number,
    goalDate: string    
}

interface AccountItemState {
    editingTitle?: boolean,
    editingBalance?: boolean
}

var appDiv = document.getElementById('app'); 

type AppProps = {
    data: Model.State, 
    loadData: () => void,
    logOut: () => void
}

class App extends React.Component<AppProps, {}> {
    componentWillMount() {
        if (this.props.data.loggedInDropbox) {
            this.props.loadData();
        }
    }

    render() {
        if (!this.props.data.loggedInDropbox) {
            return <div className="loginlink">
                <a id="login_link" href={dbx.auth_url()}>Login to dropbox</a>
            </div>
        }
        if (this.props.data.loadingState == "LOADING") {
            return <div className="load-indicator"><img src="spinner.gif"/></div>
        }
        return <div>
                <div className="page-header">
                        <button onClick={()=>this.props.logOut()}>Logout</button>
                    </div>
                    <Accounts/>
                    <Envelopes/>                    
                    <Monthlies/>
                    <Goals/>
                </div>
        }
}

const AppC = connect(
        (state: Model.State) => ({data: state}), 
       (dispatch: (action: Actions.Action) => void) => ({
        loadData() {
            dispatch({type: 'DATA_START_LOADING'})
        },
        logOut() {
            dispatch({type: 'LOGOUT'});
        }
    })
    )(App)

if (appDiv) {
    ReactDOM.render(
        <Provider store={redux_store}>
            <AppC/>
        </Provider>,
        appDiv  
    );
}
