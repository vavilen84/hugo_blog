---
title: "Пишем блог на MERN (часть №1): Redux в React приложении"
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

Источники:
- [Официальная документация](https://redux.js.org/introduction/getting-started)
- [Пример приложения от автора](https://github.com/vavilen84/mern_skills_up_project)
- [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension)

# Redux

Redux - это предсказуемый контейнер состояния для JavaScript приложений.

# Главные части

1. Store - все глобальное состояние Вашего приложения хранится в объекте внутри одного хранилища.
2. Reducer - функция, которая принимает предыдущее состояние и возвращает новое принимая "action" объект.
3. Action - объект, который описывает событие.

# Создание store

Пример [ссылка](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/index.js)
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

В примере выше мы использовали:
1. [combineReducers](https://redux.js.org/api/combinereducers) чтобы иметь возможность расширять наше приложение в будущем.
2. Второй "enhancer" параметр [composeWithDevTools()](https://github.com/zalmoxisus/redux-devtools-extension), который добавит devTools к нашим middleware - [вот тут](https://www.youtube.com/watch?v=IlM7497j6LY) есть хорошее демо.
3. [thunk](https://github.com/reduxjs/redux-thunk) middleware для Redux - позволяет нам возвращать функцию с параметром "dispatch" в наших "actions" вместо простого объекта.
4. [logger](https://www.npmjs.com/package/redux-logger) - Logger для Redux.

# Reducer

Сигнатура функции: (state, action) => newState

[Правила Reducers](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers):
- Должен только определять новое состояние на основе state и action аргументов
- Нельзя изменять state аргумент. Вместо этого, надо создавать новый объект, копировать в него state аргумент и изменять уже его.
- Не должны содержать асинхронной логики или сайд-эффектов.

Пример [ссылка](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/reducers/index.js)
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

Абстракция Mutations не обязательна - просто, чтобы вынести логику изменений из reducer.

Как мы можем видеть, наш reducer:
- принимает 2 параметра: "state" и "action"
- "state" параметр имеет начальное "defaultState" значение
- мы не передаем "state" параметр в mutation, но создаем новый объект вместо этого

Mutations [ссылка](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/mutations/index.js)
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

Официальная документация описывает 2 типа actions:
- "простой" action представляет собой простой объект Javascript [ссылка](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers#designing-actions)
- "thunk" action, который может: содержать логику, вызывать методы dispatch и getState [ссылка](https://redux.js.org/tutorials/essentials/part-5-async-logic#thunks-and-async-logic)

# "простой" action

"простой" action - обычный объект с данными для изменения store. Должен иметь свойство 'type'. 
Пример [ссылка](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/actions/index.js):
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

пример вызова "простого" action из компонента 
[ссылка](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/components/posts/PostSaveForm.js):
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
Как мы можем видеть, мы использовали метод "connect" из пакета 'react-redux' чтобы объявить mapDispatchToProps.
Это дает возможность определить showAlert action как свойство компонента и вызвать его.

# Thunk action

Пример вызова "thunk" action 
[ссылка](https://github.com/vavilen84/mern_skills_up_project/blob/master/frontend/src/components/pages/login/LoginForm.js)
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
как мы можем видеть, мы тоже использовали методы connect & mapDispatchToProps.
Мы можем вызвать "простой" action из 
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

Конец статьи!

