import React from "react";
import { observer } from "mobx-react";

interface iProps {}
interface iState {}

@observer
export default class ManageListsView extends React.Component<iProps, iState> {
    render() {
        return <div>ManageListsView</div>;
    }
}
