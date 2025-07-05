import { describe, it, expect } from 'vitest';
import {
  EscrowState,
  EscrowEvent,
  transition,
  getAllowedEvents,
  isValidTransition,
  getInitialState,
  isTerminalState,
  getStateDescription,
  getEventDescription,
  EscrowFSMError
} from '../src/fsm';

describe('Escrow FSM', () => {
  describe('Initial State', () => {
    it('should return Created as initial state', () => {
      expect(getInitialState()).toBe(EscrowState.Created);
    });
  });

  describe('Valid Transitions', () => {
    it('should allow Create -> Fund transition', () => {
      const newState = transition(EscrowState.Created, EscrowEvent.Fund);
      expect(newState).toBe(EscrowState.Funded);
    });

    it('should allow Funded -> Approve transition', () => {
      const newState = transition(EscrowState.Funded, EscrowEvent.Approve);
      expect(newState).toBe(EscrowState.Approved);
    });

    it('should allow Funded -> Dispute transition', () => {
      const newState = transition(EscrowState.Funded, EscrowEvent.Dispute);
      expect(newState).toBe(EscrowState.Disputed);
    });

    it('should allow Funded -> Cancel transition', () => {
      const newState = transition(EscrowState.Funded, EscrowEvent.Cancel);
      expect(newState).toBe(EscrowState.Cancelled);
    });

    it('should allow Approved -> Release transition', () => {
      const newState = transition(EscrowState.Approved, EscrowEvent.Release);
      expect(newState).toBe(EscrowState.Released);
    });

    it('should allow Approved -> Dispute transition', () => {
      const newState = transition(EscrowState.Approved, EscrowEvent.Dispute);
      expect(newState).toBe(EscrowState.Disputed);
    });

    it('should allow Approved -> Cancel transition', () => {
      const newState = transition(EscrowState.Approved, EscrowEvent.Cancel);
      expect(newState).toBe(EscrowState.Cancelled);
    });

    it('should allow Disputed -> Cancel transition', () => {
      const newState = transition(EscrowState.Disputed, EscrowEvent.Cancel);
      expect(newState).toBe(EscrowState.Cancelled);
    });

    it('should allow self-transitions for Created state', () => {
      const newState = transition(EscrowState.Created, EscrowEvent.Create);
      expect(newState).toBe(EscrowState.Created);
    });

    it('should allow self-transitions for Funded state', () => {
      const newState = transition(EscrowState.Funded, EscrowEvent.Fund);
      expect(newState).toBe(EscrowState.Funded);
    });

    it('should allow self-transitions for Approved state', () => {
      const newState = transition(EscrowState.Approved, EscrowEvent.Approve);
      expect(newState).toBe(EscrowState.Approved);
    });

    it('should allow self-transitions for Released state', () => {
      const newState = transition(EscrowState.Released, EscrowEvent.Release);
      expect(newState).toBe(EscrowState.Released);
    });

    it('should allow self-transitions for Disputed state', () => {
      const newState = transition(EscrowState.Disputed, EscrowEvent.Dispute);
      expect(newState).toBe(EscrowState.Disputed);
    });

    it('should allow self-transitions for Cancelled state', () => {
      const newState = transition(EscrowState.Cancelled, EscrowEvent.Cancel);
      expect(newState).toBe(EscrowState.Cancelled);
    });
  });

  describe('Invalid Transitions', () => {
    it('should throw error for Created -> Approve', () => {
      expect(() => {
        transition(EscrowState.Created, EscrowEvent.Approve);
      }).toThrow(EscrowFSMError);
    });

    it('should throw error for Created -> Release', () => {
      expect(() => {
        transition(EscrowState.Created, EscrowEvent.Release);
      }).toThrow(EscrowFSMError);
    });

    it('should throw error for Created -> Dispute', () => {
      expect(() => {
        transition(EscrowState.Created, EscrowEvent.Dispute);
      }).toThrow(EscrowFSMError);
    });

    it('should throw error for Funded -> Release', () => {
      expect(() => {
        transition(EscrowState.Funded, EscrowEvent.Release);
      }).toThrow(EscrowFSMError);
    });

    it('should throw error for Released -> Dispute', () => {
      expect(() => {
        transition(EscrowState.Released, EscrowEvent.Dispute);
      }).toThrow(EscrowFSMError);
    });

    it('should throw error for Released -> Cancel', () => {
      expect(() => {
        transition(EscrowState.Released, EscrowEvent.Cancel);
      }).toThrow(EscrowFSMError);
    });

    it('should throw error for Cancelled -> Create', () => {
      expect(() => {
        transition(EscrowState.Cancelled, EscrowEvent.Create);
      }).toThrow(EscrowFSMError);
    });

    it('should throw error for Cancelled -> Fund', () => {
      expect(() => {
        transition(EscrowState.Cancelled, EscrowEvent.Fund);
      }).toThrow(EscrowFSMError);
    });

    it('should throw error for Cancelled -> Approve', () => {
      expect(() => {
        transition(EscrowState.Cancelled, EscrowEvent.Approve);
      }).toThrow(EscrowFSMError);
    });

    it('should throw error for Cancelled -> Release', () => {
      expect(() => {
        transition(EscrowState.Cancelled, EscrowEvent.Release);
      }).toThrow(EscrowFSMError);
    });

    it('should throw error for Cancelled -> Dispute', () => {
      expect(() => {
        transition(EscrowState.Cancelled, EscrowEvent.Dispute);
      }).toThrow(EscrowFSMError);
    });
  });

  describe('Error Details', () => {
    it('should include current state in error', () => {
      try {
        transition(EscrowState.Created, EscrowEvent.Approve);
      } catch (error) {
        expect(error).toBeInstanceOf(EscrowFSMError);
        expect((error as EscrowFSMError).currentState).toBe(EscrowState.Created);
        expect((error as EscrowFSMError).attemptedEvent).toBe(EscrowEvent.Approve);
      }
    });

    it('should include attempted event in error', () => {
      try {
        transition(EscrowState.Funded, EscrowEvent.Release);
      } catch (error) {
        expect(error).toBeInstanceOf(EscrowFSMError);
        expect((error as EscrowFSMError).attemptedEvent).toBe(EscrowEvent.Release);
      }
    });

    it('should include allowed events in error', () => {
      try {
        transition(EscrowState.Created, EscrowEvent.Approve);
      } catch (error) {
        expect(error).toBeInstanceOf(EscrowFSMError);
        expect((error as EscrowFSMError).allowedEvents).toContain(EscrowEvent.Fund);
        expect((error as EscrowFSMError).allowedEvents).toContain(EscrowEvent.Cancel);
      }
    });
  });

  describe('getAllowedEvents', () => {
    it('should return correct allowed events for Created state', () => {
      const allowed = getAllowedEvents(EscrowState.Created);
      expect(allowed).toContain(EscrowEvent.Create);
      expect(allowed).toContain(EscrowEvent.Fund);
      expect(allowed).toContain(EscrowEvent.Cancel);
      expect(allowed).not.toContain(EscrowEvent.Approve);
      expect(allowed).not.toContain(EscrowEvent.Release);
      expect(allowed).not.toContain(EscrowEvent.Dispute);
    });

    it('should return correct allowed events for Funded state', () => {
      const allowed = getAllowedEvents(EscrowState.Funded);
      expect(allowed).toContain(EscrowEvent.Fund);
      expect(allowed).toContain(EscrowEvent.Approve);
      expect(allowed).toContain(EscrowEvent.Dispute);
      expect(allowed).toContain(EscrowEvent.Cancel);
      expect(allowed).not.toContain(EscrowEvent.Create);
      expect(allowed).not.toContain(EscrowEvent.Release);
    });

    it('should return correct allowed events for Approved state', () => {
      const allowed = getAllowedEvents(EscrowState.Approved);
      expect(allowed).toContain(EscrowEvent.Approve);
      expect(allowed).toContain(EscrowEvent.Release);
      expect(allowed).toContain(EscrowEvent.Dispute);
      expect(allowed).toContain(EscrowEvent.Cancel);
      expect(allowed).not.toContain(EscrowEvent.Create);
      expect(allowed).not.toContain(EscrowEvent.Fund);
    });

    it('should return correct allowed events for Released state', () => {
      const allowed = getAllowedEvents(EscrowState.Released);
      expect(allowed).toContain(EscrowEvent.Release);
      expect(allowed).not.toContain(EscrowEvent.Create);
      expect(allowed).not.toContain(EscrowEvent.Fund);
      expect(allowed).not.toContain(EscrowEvent.Approve);
      expect(allowed).not.toContain(EscrowEvent.Dispute);
      expect(allowed).not.toContain(EscrowEvent.Cancel);
    });

    it('should return correct allowed events for Disputed state', () => {
      const allowed = getAllowedEvents(EscrowState.Disputed);
      expect(allowed).toContain(EscrowEvent.Dispute);
      expect(allowed).toContain(EscrowEvent.Cancel);
      expect(allowed).not.toContain(EscrowEvent.Create);
      expect(allowed).not.toContain(EscrowEvent.Fund);
      expect(allowed).not.toContain(EscrowEvent.Approve);
      expect(allowed).not.toContain(EscrowEvent.Release);
    });

    it('should return correct allowed events for Cancelled state', () => {
      const allowed = getAllowedEvents(EscrowState.Cancelled);
      expect(allowed).toContain(EscrowEvent.Cancel);
      expect(allowed).not.toContain(EscrowEvent.Create);
      expect(allowed).not.toContain(EscrowEvent.Fund);
      expect(allowed).not.toContain(EscrowEvent.Approve);
      expect(allowed).not.toContain(EscrowEvent.Release);
      expect(allowed).not.toContain(EscrowEvent.Dispute);
    });
  });

  describe('isValidTransition', () => {
    it('should return true for valid transitions', () => {
      expect(isValidTransition(EscrowState.Created, EscrowEvent.Fund)).toBe(true);
      expect(isValidTransition(EscrowState.Funded, EscrowEvent.Approve)).toBe(true);
      expect(isValidTransition(EscrowState.Approved, EscrowEvent.Release)).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(isValidTransition(EscrowState.Created, EscrowEvent.Approve)).toBe(false);
      expect(isValidTransition(EscrowState.Funded, EscrowEvent.Release)).toBe(false);
      expect(isValidTransition(EscrowState.Released, EscrowEvent.Dispute)).toBe(false);
    });
  });

  describe('isTerminalState', () => {
    it('should identify Released as terminal state', () => {
      expect(isTerminalState(EscrowState.Released)).toBe(true);
    });

    it('should identify Cancelled as terminal state', () => {
      expect(isTerminalState(EscrowState.Cancelled)).toBe(true);
    });

    it('should not identify Created as terminal state', () => {
      expect(isTerminalState(EscrowState.Created)).toBe(false);
    });

    it('should not identify Funded as terminal state', () => {
      expect(isTerminalState(EscrowState.Funded)).toBe(false);
    });

    it('should not identify Approved as terminal state', () => {
      expect(isTerminalState(EscrowState.Approved)).toBe(false);
    });

    it('should not identify Disputed as terminal state', () => {
      expect(isTerminalState(EscrowState.Disputed)).toBe(false);
    });
  });

  describe('State Descriptions', () => {
    it('should return correct description for Created state', () => {
      expect(getStateDescription(EscrowState.Created)).toBe('Deal has been created and is waiting for funding');
    });

    it('should return correct description for Funded state', () => {
      expect(getStateDescription(EscrowState.Funded)).toBe('Deal has been funded and is waiting for approval');
    });

    it('should return correct description for Approved state', () => {
      expect(getStateDescription(EscrowState.Approved)).toBe('Deal has been approved and is ready for release');
    });

    it('should return correct description for Released state', () => {
      expect(getStateDescription(EscrowState.Released)).toBe('Funds have been released to the payee');
    });

    it('should return correct description for Disputed state', () => {
      expect(getStateDescription(EscrowState.Disputed)).toBe('Deal is under dispute resolution');
    });

    it('should return correct description for Cancelled state', () => {
      expect(getStateDescription(EscrowState.Cancelled)).toBe('Deal has been cancelled and funds refunded');
    });
  });

  describe('Event Descriptions', () => {
    it('should return correct description for Create event', () => {
      expect(getEventDescription(EscrowEvent.Create)).toBe('Create a new escrow deal');
    });

    it('should return correct description for Fund event', () => {
      expect(getEventDescription(EscrowEvent.Fund)).toBe('Fund the escrow deal');
    });

    it('should return correct description for Approve event', () => {
      expect(getEventDescription(EscrowEvent.Approve)).toBe('Approve the deal for release');
    });

    it('should return correct description for Release event', () => {
      expect(getEventDescription(EscrowEvent.Release)).toBe('Release funds to the payee');
    });

    it('should return correct description for Dispute event', () => {
      expect(getEventDescription(EscrowEvent.Dispute)).toBe('Raise a dispute on the deal');
    });

    it('should return correct description for Cancel event', () => {
      expect(getEventDescription(EscrowEvent.Cancel)).toBe('Cancel the deal and refund funds');
    });
  });

  describe('Complete State Machine Flow', () => {
    it('should handle complete happy path: Created -> Funded -> Approved -> Released', () => {
      let state = getInitialState();
      expect(state).toBe(EscrowState.Created);

      state = transition(state, EscrowEvent.Fund);
      expect(state).toBe(EscrowState.Funded);

      state = transition(state, EscrowEvent.Approve);
      expect(state).toBe(EscrowState.Approved);

      state = transition(state, EscrowEvent.Release);
      expect(state).toBe(EscrowState.Released);
    });

    it('should handle dispute path: Created -> Funded -> Disputed -> Cancelled', () => {
      let state = getInitialState();
      expect(state).toBe(EscrowState.Created);

      state = transition(state, EscrowEvent.Fund);
      expect(state).toBe(EscrowState.Funded);

      state = transition(state, EscrowEvent.Dispute);
      expect(state).toBe(EscrowState.Disputed);

      state = transition(state, EscrowEvent.Cancel);
      expect(state).toBe(EscrowState.Cancelled);
    });

    it('should handle early cancellation: Created -> Cancelled', () => {
      let state = getInitialState();
      expect(state).toBe(EscrowState.Created);

      state = transition(state, EscrowEvent.Cancel);
      expect(state).toBe(EscrowState.Cancelled);
    });
  });
}); 