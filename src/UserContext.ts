import React from "react";

export interface IUserContext {
    username: string;
    loggedIn: boolean;
    updateUserContext: (username: string, loggedIn: boolean) => void;
}

const userDefaultVal = {
    loggedIn: false,
    username: "",
    updateUserContext: () => {},
} as IUserContext;

const UserContext = React.createContext(userDefaultVal);

export default UserContext;