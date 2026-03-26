import { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Header, Icon, Label, SemanticCOLORS } from "semantic-ui-react";
import { APP_EVENT_COLLAPSE_ALL, APP_EVENT_EXPAND_ALL } from "../events/collapse-expand";
import { tagPalette } from "../modules/palette";
import { settingsCollapseBlock, settingsUpdate } from "../redux/actions/settingsActions";
import { settingsSelector } from "../redux/selectors/settingsSelectors";
import { AccountBadge } from "./AccountBadge";

export function CollapsibleBlock(props: {
    id: string;
    children: ReactNode;
    isLoading: boolean;
    isCollapseEnabled: boolean;
    iconComponent?: ReactNode;
    accountId: string;
    caption: string;
    subcaption?: string;
    subcaptionTooltip?: string;
    rightBlock?: ReactNode;
    counters?: { [id: string | number]: { count: number | string; color?: SemanticCOLORS; basic?: boolean } };
    enableColorCode: boolean;
    status?: "done" | "error";
}) {
    const {
        id,
        children,
        isLoading,
        caption,
        counters,
        iconComponent,
        isCollapseEnabled,
        rightBlock,
        subcaption,
        subcaptionTooltip,
        enableColorCode,
        status,
        accountId,
    } = props;

    const dispatch = useDispatch();

    const settings = useSelector(settingsSelector);

    useEffect(() => {
        const onCollapse = () => dispatch(settingsCollapseBlock(id, true));
        const onExpand = () => dispatch(settingsUpdate({ collapsedBlocks: [] }));

        document.addEventListener(APP_EVENT_COLLAPSE_ALL, onCollapse);
        document.addEventListener(APP_EVENT_EXPAND_ALL, onExpand);

        return () => {
            document.removeEventListener(APP_EVENT_COLLAPSE_ALL, onCollapse);
            document.removeEventListener(APP_EVENT_EXPAND_ALL, onExpand);
        };
    }, [id, dispatch]);

    const isCollapsed = settings.collapsedBlocks.includes(id);
    const toggleCollapse = () => dispatch(settingsCollapseBlock(id, !isCollapsed));

    const iconCollapse = isCollapsed ? <Icon name="angle right" /> : <Icon name="angle down" />;

    const countersComponents = counters
        ? Object.entries(counters).map(([id, counter]) => {
              if (!counter.count) return null;

              return (
                  <Label key={id} size="mini" circular color={counter.color} basic={counter.basic}>
                      {counter.count}
                  </Label>
              );
          })
        : null;

    return (
        <>
            <Header as="h3" style={{ marginBottom: 0 }}>
                <div style={{ display: "flex" }} className="dynamic-flex-wrap">
                    <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
                        {isLoading && (
                            <span>
                                <Icon name="circle notched" loading />
                            </span>
                        )}
                        {!isLoading && isCollapseEnabled && <span onClick={toggleCollapse}>{iconCollapse}</span>}
                        {settings.accounts.length > 1 && (
                            <AccountBadge accountId={accountId} size="l" display="flex" rightGap={6} />
                        )}
                        {iconComponent && <span>{iconComponent}</span>}
                        <span
                            onClick={toggleCollapse}
                            style={
                                !enableColorCode
                                    ? undefined
                                    : {
                                          backgroundColor: tagPalette
                                              .getColor(caption)
                                              .hexWithTransparency(settings.darkTheme ? 0.3 : 0.2),
                                          padding: "0 8px",
                                          borderRadius: 4,
                                      }
                            }
                        >
                            {caption}
                        </span>
                        {subcaption && (
                            <small>
                                <span style={{ marginLeft: 10, color: "gray" }} title={subcaptionTooltip}>
                                    {subcaption}
                                </span>
                            </small>
                        )}
                        <span className="WICounts">
                            {countersComponents}
                            {status === "done" && (
                                <Label size="mini" circular color="green">
                                    ✔
                                </Label>
                            )}
                            {status === "error" && (
                                <Label size="mini" circular color="red">
                                    &times;
                                </Label>
                            )}
                        </span>
                    </div>
                    <div style={{ flexShrink: 0 }}>{rightBlock}</div>
                </div>
            </Header>
            {(isCollapseEnabled ? !isCollapsed : true) && children}
        </>
    );
}
