import { apiClient } from './api';
import { TourTrack, TourGroupV2, TourGroupV2Tracks, TourMap, TourMapPoints } from '@/types/models';

const extractData = <T>(data: any): T[] => {
    if (Array.isArray(data)) return data;
    return data?.results || [];
};

export const tourApi = {
    // --- Tracks ---
    getTourTracks: async (tourId: string): Promise<TourTrack[]> => {
        const res = await apiClient.get<any>(`/v4/tours/${tourId}/tour_tracks`);
        return extractData<TourTrack>(res.data.data);
    },

    // --- Tour Groups ---
    getTourGroups: async (tourId: string): Promise<TourGroupV2[]> => {
        const res = await apiClient.get<any>(`/v4/tours/${tourId}/tour_groups`);
        return extractData<TourGroupV2>(res.data.data);
    },
    createTourGroup: async (tourId: string, data: Partial<TourGroupV2>): Promise<TourGroupV2> => {
        const res = await apiClient.post<TourGroupV2>(`/v4/tours/${tourId}/tour_groups`, data);
        return res.data;
    },
    updateTourGroup: async (tourId: string, groupId: number, data: Partial<TourGroupV2>): Promise<TourGroupV2> => {
        const res = await apiClient.patch<TourGroupV2>(`/v4/tours/${tourId}/tour_groups/${groupId}`, data);
        return res.data;
    },
    deleteTourGroup: async (tourId: string, groupId: number): Promise<void> => {
        return await apiClient.delete(`/v4/tours/${tourId}/tour_groups/${groupId}`);
    },

    // --- Group Tracks ---
    getGroupTracks: async (tourId: string, groupId: number): Promise<TourGroupV2Tracks[]> => {
        const res = await apiClient.get<any>(`/v4/tours/${tourId}/tour_groups/${groupId}/tracks`);
        return extractData<TourGroupV2Tracks>(res.data.data);
    },
    assignTrackToGroup: async (
        tourId: string,
        groupId: number,
        trackId: number,
        index: number
    ): Promise<TourGroupV2Tracks> => {
        const res = await apiClient.post<TourGroupV2Tracks>(`/v4/tours/${tourId}/tour_groups/${groupId}/tracks`, {
            tour_track: trackId,
            index,
        });
        return res.data;
    },
    removeTrackFromGroup: async (
        tourId: string,
        groupId: number,
        groupTrackId: number
    ): Promise<void> => {
        return await apiClient.delete(`/v4/tours/${tourId}/tour_groups/${groupId}/tracks/${groupTrackId}`);
    },

    // --- Tour Maps ---
    getTourMaps: async (tourId: string): Promise<TourMap[]> => {
        const res = await apiClient.get<any>(`/v4/tours/${tourId}/tour_maps`);
        return extractData<TourMap>(res.data.data);
    },
    createTourMap: async (tourId: string, data: Partial<TourMap>): Promise<TourMap> => {
        const res = await apiClient.post<TourMap>(`/v4/tours/${tourId}/tour_maps`, data);
        return res.data;
    },
    deleteTourMap: async (tourId: string, mapId: number): Promise<void> => {
        return await apiClient.delete(`/v4/tours/${tourId}/tour_maps/${mapId}`);
    },

    // --- Tour Map Points ---
    getTourMapPoints: async (tourId: string, mapId: number): Promise<TourMapPoints[]> => {
        const res = await apiClient.get<any>(`/v4/tours/${tourId}/tour_maps/${mapId}/points`);
        return extractData<TourMapPoints>(res.data.data);
    },
    createTourMapPoint: async (tourId: string, mapId: number, data: Partial<TourMapPoints>): Promise<TourMapPoints> => {
        const res = await apiClient.post<TourMapPoints>(`/v4/tours/${tourId}/tour_maps/${mapId}/points`, data);
        return res.data;
    },
    updateTourMapPoint: async (tourId: string, mapId: number, pointId: number, data: Partial<TourMapPoints>): Promise<TourMapPoints> => {
        const res = await apiClient.patch<TourMapPoints>(`/v4/tours/${tourId}/tour_maps/${mapId}/points/${pointId}`, data);
        return res.data;
    },
    deleteTourMapPoint: async (tourId: string, mapId: number, pointId: number): Promise<void> => {
        return await apiClient.delete(`/v4/tours/${tourId}/tour_maps/${mapId}/points/${pointId}`);
    },

    // --- Map Point Assignments ---
    assignTrackToPoint: async (tourId: string, mapId: number, pointId: number, trackId: number): Promise<void> => {
        await apiClient.post(`/v4/tours/${tourId}/tour_maps/${mapId}/points/${pointId}/tracks`, { track_id: trackId });
    },
    assignSubMapToPoint: async (tourId: string, mapId: number, pointId: number, subMapId: number): Promise<void> => {
        await apiClient.post(`/v4/tours/${tourId}/tour_maps/${mapId}/points/${pointId}/to_map`, { linked_map_id: subMapId });
    },
};
