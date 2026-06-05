import flower256 from "../assets/flower-256.png";
import { s } from "../values/Strings";

export function LoadingView() {
    return (
        <div className="loading-view">
            <img width={128} height={128} src={flower256} />
            <br />
            {s("apploading")}
        </div>
    );
}
