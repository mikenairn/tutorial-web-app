import { walkthroughTypes } from '../constants';
import { setStateProp, PENDING_ACTION, REJECTED_ACTION, FULFILLED_ACTION } from '../helpers';

const initialState = {
  walkthrough: {
    error: false,
    errorStatus: null,
    errorMessage: null,
    pending: false,
    fulfilled: false,
    data: null
  }
};

const walkthroughReducers = (state = initialState, action) => {
  switch (action.type) {
    case FULFILLED_ACTION(walkthroughTypes.CREATE_WALKTHROUGH):
      return setStateProp(
        'walkthrough',
        {
          data: action.payload
        },
        {
          state,
          initialState
        }
      )

    case FULFILLED_ACTION(walkthroughTypes.REMOVE_WALKTHROUGH):
      return setStateProp(
        'walkthrough',
        {
          data: null
        },
        {
          state,
          initialState
        }
      )
    default:
      return state;
  }
};

walkthroughReducers.initialState = initialState;

export { walkthroughReducers as default, walkthroughReducers, initialState };
