import { ReactNode } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Header, Icon, Label, SemanticCOLORS } from "semantic-ui-react";
import { tagPalette } from "../modules/palette";
import { settingsCollapseBlock } from "../redux/actions/settingsActions";
import { settingsSelector } from "../redux/selectors/settingsSelectors";

export function CollapsibleBlock(props: {
    id: string;
    children: ReactNode;
    isLoading: boolean;
    isCollapseEnabled: boolean;
    iconComponent?: ReactNode;
    caption: string;
    subcaption?: string;
    subcaptionTooltip?: string;
    rightBlock?: ReactNode;
    counters?: { [id: string | number]: { count: number | string; color?: SemanticCOLORS } };
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
    } = props;

    const dispatch = useDispatch();

    const settings = useSelector(settingsSelector);

    const isCollapsed = settings.collapsedBlocks.includes(id);
    const toggleCollapse = () => dispatch(settingsCollapseBlock(id, !isCollapsed));

    const iconCollapse = isCollapsed ? <Icon name="angle right" /> : <Icon name="angle down" />;

    const countersComponents = counters
        ? Object.entries(counters).map(([id, counter]) => {
              if (!counter.count) return null;

              return (
                  <Label key={id} size="mini" circular color={counter.color}>
                      {counter.count}
                  </Label>
              );
          })
        : null;

    return (
        <>
            <Header as="h3" style={{ marginBottom: 0 }}>
                {isLoading && (
                    <span>
                        <Icon name="circle notched" loading />
                    </span>
                )}
                {!isLoading && isCollapseEnabled && <span onClick={toggleCollapse}>{iconCollapse}</span>}
                <span>
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
                </span>
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
                {rightBlock}
            </Header>
            {(isCollapseEnabled ? !isCollapsed : true) && children}
        </>
    );
}
