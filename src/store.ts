import { observable } from "mobx";

class Store {
    @observable view: "loading" | "error" | "main" | "settings" = "loading";
}

const store = new Store();
export default store;
