import { walkthroughTypes } from '../constants';
import { setStateProp, PENDING_ACTION, REJECTED_ACTION, FULFILLED_ACTION } from '../helpers';

const initialState = {
  walkthroughs: {
    error: false,
    errorStatus: null,
    errorMessage: null,
    pending: false,
    fulfilled: false,
    data: {}
  }
};

const walkthroughReducers = (state = initialState, action) => {
  switch (action.type) {
    case FULFILLED_ACTION(walkthroughTypes.CREATE_WALKTHROUGH):
      const newData = { ...state.walkthroughs.data };
      newData[action.payload.name] = action.payload;
      return setStateProp(
        'walkthroughs',
        {
          data: newData
        },
        {
          state,
          initialState
        }
      )

    case FULFILLED_ACTION(walkthroughTypes.REMOVE_WALKTHROUGH):
      delete state.walkthroughs.data[action.payload.name];
      return setStateProp(
        'walkthroughs',
        {
          data: state.walkthroughs.data
        },
        {
          state,
          initialState
        }
      )

    // Error/Rejected
    case REJECTED_ACTION(walkthroughTypes.LIST_WALKTHROUGH):
      return setStateProp(
        'walkthroughs',
        {
          error: action.payload.error,
          errorMessage: action.payload.message
        },
        {
          state,
          initialState
        }
      );

    // Loading/Pending
    case PENDING_ACTION(walkthroughTypes.LIST_WALKTHROUGH):
      return setStateProp(
        'walkthroughs',
        {
          pending: true
        },
        {
          state,
          initialState
        }
      );

    // Success/Fulfilled
    case FULFILLED_ACTION(walkthroughTypes.LIST_WALKTHROUGH):
      const listData = {};
      action.payload.walkthroughs.forEach(walkthrough => listData[walkthrough.name] = walkthrough);
      return setStateProp(
        'walkthroughs',
        {
          pending: false,
          fulfilled: true,
          data: listData
        },
        {
          state,
          initialState
        }
      );

    default:
      return state;
  }
};

walkthroughReducers.initialState = initialState;

export { walkthroughReducers as default, walkthroughReducers, initialState };
