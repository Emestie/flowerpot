import React from "react";
import store from "../store";

interface IProps {}
interface IState {}

export default class RefreshHelperView extends React.Component<IProps, IState> {

    componentDidMount() {
        store.switchView('main');
    }

    render() {
        return <div></div>;
    }
}
