/**
 * Escrow Finite State Machine (FSM) Engine
 * 
 * This module implements the core state machine logic for escrow transactions.
 * All state transitions are deterministic and immutable.
 */

export enum EscrowState {
  Created = 'Created',
  Funded = 'Funded', 
  Approved = 'Approved',
  Released = 'Released',
  Disputed = 'Disputed',
  Cancelled = 'Cancelled'
}

export enum EscrowEvent {
  Create = 'Create',
  Fund = 'Fund',
  Approve = 'Approve',
  Release = 'Release',
  Dispute = 'Dispute',
  Cancel = 'Cancel'
}

export class EscrowFSMError extends Error {
  constructor(
    message: string,
    public currentState: EscrowState,
    public attemptedEvent: EscrowEvent,
    public allowedEvents?: EscrowEvent[]
  ) {
    super(message);
    this.name = 'EscrowFSMError';
  }
}

/**
 * Transition matrix defining valid state transitions
 * Key: currentState -> event -> newState
 */
const TRANSITION_MATRIX: Record<EscrowState, Record<EscrowEvent, EscrowState | null>> = {
  [EscrowState.Created]: {
    [EscrowEvent.Create]: EscrowState.Created, // Self-transition allowed for initialization
    [EscrowEvent.Fund]: EscrowState.Funded,
    [EscrowEvent.Approve]: null, // Invalid: cannot approve before funding
    [EscrowEvent.Release]: null, // Invalid: cannot release before funding
    [EscrowEvent.Dispute]: null, // Invalid: cannot dispute before funding
    [EscrowEvent.Cancel]: EscrowState.Cancelled
  },
  [EscrowState.Funded]: {
    [EscrowEvent.Create]: null, // Invalid: already created
    [EscrowEvent.Fund]: EscrowState.Funded, // Self-transition allowed for additional funding
    [EscrowEvent.Approve]: EscrowState.Approved,
    [EscrowEvent.Release]: null, // Invalid: must be approved before release
    [EscrowEvent.Dispute]: EscrowState.Disputed,
    [EscrowEvent.Cancel]: EscrowState.Cancelled
  },
  [EscrowState.Approved]: {
    [EscrowEvent.Create]: null, // Invalid: already created
    [EscrowEvent.Fund]: null, // Invalid: already funded
    [EscrowEvent.Approve]: EscrowState.Approved, // Self-transition allowed for additional approvals
    [EscrowEvent.Release]: EscrowState.Released,
    [EscrowEvent.Dispute]: EscrowState.Disputed,
    [EscrowEvent.Cancel]: EscrowState.Cancelled
  },
  [EscrowState.Released]: {
    [EscrowEvent.Create]: null, // Invalid: already created
    [EscrowEvent.Fund]: null, // Invalid: already funded
    [EscrowEvent.Approve]: null, // Invalid: already approved
    [EscrowEvent.Release]: EscrowState.Released, // Self-transition allowed
    [EscrowEvent.Dispute]: null, // Invalid: cannot dispute after release
    [EscrowEvent.Cancel]: null // Invalid: cannot cancel after release
  },
  [EscrowState.Disputed]: {
    [EscrowEvent.Create]: null, // Invalid: already created
    [EscrowEvent.Fund]: null, // Invalid: already funded
    [EscrowEvent.Approve]: null, // Invalid: cannot approve while disputed
    [EscrowEvent.Release]: null, // Invalid: cannot release while disputed
    [EscrowEvent.Dispute]: EscrowState.Disputed, // Self-transition allowed for additional disputes
    [EscrowEvent.Cancel]: EscrowState.Cancelled
  },
  [EscrowState.Cancelled]: {
    [EscrowEvent.Create]: null, // Invalid: cannot create after cancellation
    [EscrowEvent.Fund]: null, // Invalid: cannot fund after cancellation
    [EscrowEvent.Approve]: null, // Invalid: cannot approve after cancellation
    [EscrowEvent.Release]: null, // Invalid: cannot release after cancellation
    [EscrowEvent.Dispute]: null, // Invalid: cannot dispute after cancellation
    [EscrowEvent.Cancel]: EscrowState.Cancelled // Self-transition allowed
  }
};

/**
 * Get allowed events for a given state
 */
export function getAllowedEvents(state: EscrowState): EscrowEvent[] {
  const transitions = TRANSITION_MATRIX[state];
  return Object.entries(transitions)
    .filter(([_, newState]) => newState !== null)
    .map(([event, _]) => event as EscrowEvent);
}

/**
 * Check if a transition is valid
 */
export function isValidTransition(state: EscrowState, event: EscrowEvent): boolean {
  const newState = TRANSITION_MATRIX[state]?.[event];
  return newState !== null && newState !== undefined;
}

/**
 * Core FSM transition function
 * 
 * @param state - Current escrow state
 * @param event - Event to process
 * @returns New escrow state
 * @throws EscrowFSMError if transition is invalid
 */
export function transition(state: EscrowState, event: EscrowEvent): EscrowState {
  const newState = TRANSITION_MATRIX[state]?.[event];
  
  if (newState === null || newState === undefined) {
    const allowedEvents = getAllowedEvents(state);
    throw new EscrowFSMError(
      `Invalid transition: Cannot apply event '${event}' to state '${state}'. ` +
      `Allowed events for state '${state}': ${allowedEvents.join(', ')}`,
      state,
      event,
      allowedEvents
    );
  }
  
  return newState;
}

/**
 * Get the initial state for a new escrow deal
 */
export function getInitialState(): EscrowState {
  return EscrowState.Created;
}

/**
 * Check if a state is terminal (no further transitions possible)
 */
export function isTerminalState(state: EscrowState): boolean {
  const allowedEvents = getAllowedEvents(state);
  // Terminal states only allow self-transitions
  return allowedEvents.every(event => {
    const newState = TRANSITION_MATRIX[state][event];
    return newState === state;
  });
}

/**
 * Get human-readable description of a state
 */
export function getStateDescription(state: EscrowState): string {
  const descriptions: Record<EscrowState, string> = {
    [EscrowState.Created]: 'Deal has been created and is waiting for funding',
    [EscrowState.Funded]: 'Deal has been funded and is waiting for approval',
    [EscrowState.Approved]: 'Deal has been approved and is ready for release',
    [EscrowState.Released]: 'Funds have been released to the payee',
    [EscrowState.Disputed]: 'Deal is under dispute resolution',
    [EscrowState.Cancelled]: 'Deal has been cancelled and funds refunded'
  };
  return descriptions[state];
}

/**
 * Get human-readable description of an event
 */
export function getEventDescription(event: EscrowEvent): string {
  const descriptions: Record<EscrowEvent, string> = {
    [EscrowEvent.Create]: 'Create a new escrow deal',
    [EscrowEvent.Fund]: 'Fund the escrow deal',
    [EscrowEvent.Approve]: 'Approve the deal for release',
    [EscrowEvent.Release]: 'Release funds to the payee',
    [EscrowEvent.Dispute]: 'Raise a dispute on the deal',
    [EscrowEvent.Cancel]: 'Cancel the deal and refund funds'
  };
  return descriptions[event];
} 