export interface TourTrack {
    id: number;
    name?: string;
    title?: string;
    index?: number;
}

export interface TourGroupV2 {
    id: number;
    name?: string;
    name_prefix?: string;
    name_suffix?: string;
    description?: string;
    parent?: number | null;
    tour_tracks?: number[]; // simplified track mapping from API
    tracks?: TourGroupV2Tracks[]; // detailed associations
    children?: TourGroupV2[];
}

export interface TourGroupV2Tracks {
    id?: number;
    tour_group: number;
    tour_track: number;
    index: number;
    track?: TourTrack;
}

export interface TourMap {
    id: number;
    tour_id: number;
    name: string;
    map_type: 'GOOGLE' | 'SVG';
    image_url?: string;
    map_points?: TourMapPoints[];
}

export interface TourMapPoints {
    id: number;
    tour_map_id: number;
    pin_type: 1 | 2; // 1 = Track, 2 = SubMap
    latitude?: number;
    longitude?: number;
    anchor_x?: number;
    anchor_y?: number;
    tracks?: TourMapPointTracks[];
    to_map?: TourMapPointToMap;
}

export interface TourMapPointTracks {
    id?: number;
    tour_map_point_id: number;
    track_id: number;
    track?: TourTrack;
}

export interface TourMapPointToMap {
    id?: number;
    tour_map_point_id: number;
    linked_map_id: number;
    linked_map?: TourMap;
}
