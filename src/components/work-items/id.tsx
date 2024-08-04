import { useSelector } from "react-redux";
import { HighlightenText } from "../HighlightenText";
import { IWorkItem } from "/@/modules/api-client";
import { TableScale } from "/@/redux/reducers/settingsReducer";
import { IStore } from "/@/redux/store";
import { s } from "/@/values/Strings";

export function Id({ item, hasChanges }: { item: IWorkItem; hasChanges: boolean }) {
    const scale = useSelector((s: IStore) => s.settings.tableScale);

    // const typeEl = (() => {
    //     switch (item.type) {
    //         case "Bug":
    //             return <Icon name="bug" />;
    //         case "Task":
    //             return <Icon name="check" />;
    //         case "Issue":
    //             return <Icon name="question" />;
    //         case "Feature":
    //             return <Icon name="trophy" />;
    //         case "User Story":
    //             return <Icon name="book" />;
    //         case "Epic":
    //             return <Icon name="chess queen" />;
    //         case "Test Case":
    //             return <Icon name="gavel" />;
    //         default:
    //             return <Icon name="fire" />;
    //     }
    // })();

    return (
        <span title={item.type} style={{ display: "flex", justifyContent: "start", alignItems: "center" }}>
            {hasChanges && <span title={s("newItem")} className="HasChangesDot"></span>}
            {item.typeIconUrl && (
                <span
                    style={{
                        width: "1.1em",
                        height: scale === TableScale.Small ? "1.25em" : "1.2em",
                        marginRight: "0.4rem",
                    }}
                >
                    <img src={item.typeIconUrl} />
                </span>
            )}
            <HighlightenText text={item.id.toString()} />
        </span>
    );
}
