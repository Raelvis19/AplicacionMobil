import { createContext, useContext } from 'react';

export type Session = { token: string | null; setToken: (token: string | null) => void };
export const SessionContext = createContext<Session>({ token: null, setToken: () => {} });
export const useSession = () => useContext(SessionContext);
