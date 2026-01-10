export class PullRequestReviewer {
    name: string;
    uid: string;
    imageUrl: string;
    isRequired: boolean;
    vote: number;
    id: string;

    constructor(name: string, uid: string, imageUrl: string, isRequired: boolean, vote: number, id: string) {
        this.name = name;
        this.uid = uid;
        this.imageUrl = imageUrl;
        this.isRequired = isRequired;
        this.vote = vote;
        this.id = id;
    }
}
