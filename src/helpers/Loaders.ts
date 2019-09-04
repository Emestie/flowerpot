import Differences from "./Differences";

export default class Loaders {
    public static interval: NodeJS.Timeout;
    public static count: number = 0;

    public static setLoadingInterval(seconds: number = 60) {
        if (this.interval) clearInterval(this.interval);

        this.interval = setInterval(() => {
            this.load();
        }, seconds * 1000);
    }

    public static load() {
        
        this.count += 1;
        Differences.check();
    }
}
