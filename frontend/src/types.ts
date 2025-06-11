export interface OsmElement {
    id: number;
    lat: number;
    lon: number;
    tags?: {
        [key: string]: string;
    }
}