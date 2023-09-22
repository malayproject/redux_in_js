import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import axios from "axios";
import { produce } from "immer";
import logger from "redux-logger";

// initial state
const initialState = {
  amount: 1,
};

// action types
const ACTION_TYPES = {
  INIT_PENDING: "INIT_PENDING",
  INIT_FULFILLED: "INIT_FULFILLED",
  INIT_REJECTED: "INIT_REJECTED",
  INCREMENT: "INCREMENT",
  DECREMENT: "DECREMENT",
  INCREMENT_BY_AMOUNT: "INCREMENT_BY_AMOUNT",
};

const POSTS_ACTION_TYPES = {
  POSTS_INIT_PENDING: "POSTS_INIT_PENDING",
  POSTS_INIT_FULFILLED: "POSTS_INIT_FULFILLED",
  POSTS_INIT_REJECTED: "POSTS_INIT_REJECTED",
};

// action creators

const getAmount = function (id) {
  return async function (dispatch, getState) {
    try {
      dispatch(initAccountPendingHandler());
      const { data } = await axios(`http://localhost:3000/accunts/${id}`);
      dispatch(initAccountFulfilledHandler(data.amount));
    } catch (error) {
      dispatch(initAccountRejectedHandler(error.message));
    }
  };
};

const initAccountPendingHandler = function () {
  return { type: ACTION_TYPES.INIT_PENDING };
};

const initAccountFulfilledHandler = function (amount) {
  return { type: ACTION_TYPES.INIT_FULFILLED, payload: amount };
};

const initAccountRejectedHandler = function (errorMsg) {
  return { type: ACTION_TYPES.INIT_REJECTED, error: errorMsg };
};

const incrementHandler = function () {
  return { type: ACTION_TYPES.INCREMENT };
};

const decrementHandler = function () {
  return { type: ACTION_TYPES.DECREMENT };
};

const incrementByAmountHandler = function (incrementAmount) {
  return { type: ACTION_TYPES.INCREMENT_BY_AMOUNT, payload: incrementAmount };
};

const getPosts = function () {
  return async function (dispatch, getState) {
    try {
      dispatch({ type: POSTS_ACTION_TYPES.POSTS_INIT_PENDING });
      const { data } = await axios(
        "https://jsonplaceholder.typicode.com/postes"
      );
      dispatch({
        type: POSTS_ACTION_TYPES.POSTS_INIT_FULFILLED,
        payload: data[0],
      });
    } catch (error) {
      dispatch({
        type: POSTS_ACTION_TYPES.POSTS_INIT_REJECTED,
        error: error.message,
      });
    }
  };
};

// reducers
const accountReducer = function (state = initialState, action) {
  switch (action.type) {
    case ACTION_TYPES.INIT_PENDING:
      return { ...state, pending: true };
    case ACTION_TYPES.INIT_FULFILLED:
      return { ...state, amount: action.payload, pending: false };
    case ACTION_TYPES.INIT_REJECTED:
      return { ...state, error: action.error, pending: false };
    case ACTION_TYPES.INCREMENT:
      return { amount: state.amount + 1 };
    case ACTION_TYPES.DECREMENT:
      return { amount: state.amount - 1 };
    case ACTION_TYPES.INCREMENT_BY_AMOUNT:
      return { amount: state.amount + action.payload };
    default:
      return state;
  }
};

const bonusReducer = function (state = { points: 0 }, action) {
  switch (action.type) {
    case ACTION_TYPES.INCREMENT:
      return { points: state.points + 1 };
    default:
      return state;
  }
};

const postsReducer = function (state = { posts: [] }, action) {
  switch (action.type) {
    case POSTS_ACTION_TYPES.POSTS_INIT_PENDING: {
      return produce(state, (draft) => {
        draft.pending = true;
      });
      // console.log("pending", res);
      // return { ...state, pending: true };
    }

    case POSTS_ACTION_TYPES.POSTS_INIT_FULFILLED: {
      return produce(state, (draft) => {
        draft.posts = action.payload;
        draft.pending = false;
      });
      // console.log("fulfilled", res);
      // return { ...state, posts: action.payload, pending: false };
    }

    case POSTS_ACTION_TYPES.POSTS_INIT_REJECTED: {
      return produce(state, (draft) => {
        draft.error = action.error;
        draft.pending = false;
      });
      // console.log("rejected", res);
      // return { ...state, error: action.error, pending: false };
    }
    default:
      return state;
  }
};

// create store
const store = createStore(
  combineReducers({
    // account: accountReducer,
    // bonus: bonusReducer,
    posts: postsReducer,
  }),
  applyMiddleware(thunk.default)
);

let history = [];
store.subscribe(() => {
  history.push(store.getState());
  console.log(history);
});

function initAccount() {
  store.dispatch(getAmount(2));
}

function initPosts() {
  store.dispatch(getPosts());
}

// initAccount();
initPosts();

// setTimeout(() => store.dispatch(incrementByAmountHandler(5)), 2000);
// store.dispatch(incrementHandler());
