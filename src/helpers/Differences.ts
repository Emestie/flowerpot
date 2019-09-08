export default class Differences {
    public static check() {
        //if Loaders.count > 1
        //get what I already saved
        //else just store return
        //store current state
        //calc differences - new or state changes (or comments count?)
        //show notifs
    }

    private static showNotif(text: string) {
        new Notification("Flowerpot", { body: text });
    }
}
