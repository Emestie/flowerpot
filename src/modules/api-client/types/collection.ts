// export interface IResponseCollection1 {
//     __wrappedArray: ICollection[];
// }

export interface IResponseCollection {
    id: string;
    name: string;
    url: string;
}

export interface ICollection extends IResponseCollection {
    // name: string;
    // projects: {
    //     name: string;
    //     path: string;
    //     collectionName: string;
    //     enabled: boolean;
    // }[];
}
