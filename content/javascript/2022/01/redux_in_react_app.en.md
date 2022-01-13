---
title: "Creating a blog on MERN (part №1): Redux in React app"
publishdate: "2022-01-01"
lastmod: "2022-01-13"
summary: "javascript"
categories:
- "javascript"
tags:
- "mern"
- "mongodb"
- "react"
- "node"
- "express"
---

Sources:
- [Official Docs](https://redux.js.org/introduction/getting-started)
- [Example app sources](https://github.com/vavilen84/mern_skills_up_project)
- [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension)

# Redux

Redux is a predictable state container for JavaScript apps.

# Main parts

1. Store - the whole global state of your app is stored in an object tree inside a single store.
2. Reducer - a function that takes prev state and returns new by taking an "action" object.
3. Action - an object describing what happened.

# Create store

Example [source link](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/index.js)
```
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/layout/app/App';
import reportWebVitals from './reportWebVitals';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import logger from 'redux-logger'
import { composeWithDevTools } from 'redux-devtools-extension'
import {rootReducer} from './reducers';
import {Provider} from 'react-redux';

// Note: this API requires redux@>=3.1.0
const store = createStore(
    combineReducers({rootReducer}),
    composeWithDevTools(
        applyMiddleware(thunk, logger)
    )
);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>
  ,
  document.getElementById('root')
);
```

In an example above we used:
1. [combineReducers](https://redux.js.org/api/combinereducers) in order to have the possibility to extend our app in the future.
2. 2nd "enhancer" param [composeWithDevTools()](https://github.com/zalmoxisus/redux-devtools-extension) which adds devTools to our middlewares - [here](https://www.youtube.com/watch?v=IlM7497j6LY) you can find a great demo.
3. [thunk](https://github.com/reduxjs/redux-thunk) middleware for Redux - it allows us to return a function with a "dispatch" param in our "actions" instead of a simple object.
4. [logger](https://www.npmjs.com/package/redux-logger) - Logger for Redux.

# Reducer

A reducer's function signature is: (state, action) => newState

[Rules of Reducers](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers):
- They should only calculate the new state value based on the state and action arguments
- They are not allowed to modify the existing state. Instead, they must make immutable updates, by copying the existing state and making changes to the copied values.
- They must not do any asynchronous logic or other "side effects"

Example [source link](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/reducers/index.js)
```
import {SHOW_ALERT, LOGIN, LOGOUT, HIDE_ALERT} from "../actionTypes";
import {showAlert, defaultState, login, logout, hideAlert} from "../mutations";

export function rootReducer(state = defaultState, action) {
    let st = Object.assign({},state);
    switch (action.type) {
        case SHOW_ALERT:
            return showAlert(st, action);
        case HIDE_ALERT:
            return hideAlert(st);
        case LOGIN:
            return login(st, action);
        case LOGOUT:
            return logout(st);
        default:
            return state
    }
}
```

Mutations abstraction is not mandatory - just to separate mutation logic from the reducer.

As we can see, our reducer:
- takes 2 params: "state" & "action"
- "state" param has initial "defaultState" value
- we don`t pass "state" param to mutation, but create new object instead

Mutations [source link](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/mutations/index.js)
```
export const defaultState = {
    type: null,
    showAlert: false,
    alert: {
        code: null,
        data: [],
        message: null,
        visible: false
    },
    auth: {
        accessToken: null,
        refreshToken: null
    }
};

export function showAlert(state, action) {
    state.showAlert = true;
    state.alert.visible = true;
    state.alert.code = action.code || null;
    state.alert.data = action.data || [];
    state.alert.message = action.message || null;

    return state;
}

export function hideAlert(state) {
    state.showAlert = false;
    state.alert.visible = false;
    state.alert.code = null;
    state.alert.data = [];
    state.alert.message = null;

    return state;
}

...
```

# Action

Official docs suggests 2 types of actions:
- "simple" action represented as a plain Javascript object [link](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers#designing-actions)
- "thunk" action, which may: contain logic, call dispatch and getState methods [link](https://redux.js.org/tutorials/essentials/part-5-async-logic#thunks-and-async-logic) 

# "simple" action

"simple" action should have a simple object with data for updating the store. It should have 'type' property. 
Example [link](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/actions/index.js):
```
import {SHOW_ALERT, LOGIN, LOGOUT, HIDE_ALERT} from "../actionTypes";

export function showAlertAction(code, data, message) {
    return {
        type: SHOW_ALERT,
        code: code,
        data: data,
        message: message
    };
}

export function hideAlertAction() {
    return {
        type: HIDE_ALERT,
    };
}

...
```

call "simple" action from component example 
[link](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/components/posts/PostSaveForm.js):
```
...
import {connect} from 'react-redux'
import {showAlertAction} from "../../../../../actions";

class PostsCreate extends React.Component {
    ...
    async handleSubmit(post) {
        ...
        await fetch(getURL(POSTS_BASE_URL), {
            ...
        })
            .then(res => res.json())
            .then(json => {
                ...
                this.props.showAlert(json.code, json.data, json.message);
            })
            .catch(err => {
                ...
                this.props.showAlert(500, null, defaultErr);
            });
    }

    render() {
       ...
    }
}

const mapDispatchToProps = dispatch => (
    {
        showAlert: (code, data, message) => dispatch(showAlertAction(code, data, message))
    }
)

const mapStateToProps = (state) => {
    ...
}

export default connect(mapStateToProps, mapDispatchToProps)(PostsCreate);
```

As we can see, we have used "connect" method from 'react-redux' package in order to define mapDispatchToProps. 
This gives the ability to define showAlert action as a component property and call it.

# Thunk action

Example of "thunk" action call 
[link](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/components/pages/login/LoginForm.js)
```
...
import { connect } from 'react-redux'
import {authenticateUserThunkAction} from "../../../../actions/thunk/authenticateUser";

class LoginForm extends React.Component {

    constructor(props) {
        ...
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    ...
    handleSubmit(event) {
        event.preventDefault();
        this.props.authenticateUser(this.state.username, this.state.password);
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    ...
                </form>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => (
    {
        authenticateUser: (username, password) => dispatch(authenticateUserThunkAction(username, password))
    }
)

export default connect(null, mapDispatchToProps)(LoginForm);
```
as we can see, we also used connect & mapDispatchToProps methods here.
We are able to call "simple" actions from 
["thunk" action](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/actions/thunk/authenticateUser.js):
```
...
import {loginAction, showAlertAction} from "../index";

export function authenticateUserThunkAction(username, password) {
    return (dispatch) => {
        fetch(getURL(USERS_BASE_URL + "/" + username + "/authenticate"), {
            ...
        })
            .then(res => res.json())
            .then(json => {
                if (json.code === 200) {
                    ...
                    dispatch(loginAction(accessTokenData.token, refreshTokenData.token));
                }
                dispatch(showAlertAction(json.code, json.data, json.message));
            })
            .catch(err => {
                ...
                dispatch(showAlertAction(500, null, defaultErr));
            });
    };
}
```

The end of the article!