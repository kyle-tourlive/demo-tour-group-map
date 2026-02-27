'use client';

import { useEffect, useState } from 'react';
import { tourApi } from '@/lib/tourApi';
import { TourTrack, TourGroupV2, TourGroupV2Tracks } from '@/types/models';
import { Plus, Trash, Edit2, Save, X, Layers, GripVertical } from 'lucide-react';

export function TourGroupManager({ tourId }: { tourId: string }) {
    const [tracks, setTracks] = useState<TourTrack[]>([]);
    const [groups, setGroups] = useState<TourGroupV2[]>([]);
    const [groupTracks, setGroupTracks] = useState<Record<number, TourGroupV2Tracks[]>>({});
    const [loading, setLoading] = useState(true);

    // New Group State
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupTitle, setNewGroupTitle] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedTracks, fetchedGroups] = await Promise.all([
                tourApi.getTourTracks(tourId),
                tourApi.getTourGroups(tourId),
            ]);
            setTracks(fetchedTracks);
            setGroups(fetchedGroups);

            // Fetch tracks for each group
            const tracksMap: Record<number, TourGroupV2Tracks[]> = {};
            await Promise.all(
                fetchedGroups.map(async (g) => {
                    const gTracks = await tourApi.getGroupTracks(tourId, g.id);
                    tracksMap[g.id] = gTracks;
                })
            );
            setGroupTracks(tracksMap);

        } catch (err) {
            console.error('Failed to load data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [tourId]);

    const handleCreateGroup = async () => {
        if (!newGroupTitle.trim()) return;
        try {
            await tourApi.createTourGroup(tourId, { name: newGroupTitle });
            setNewGroupTitle('');
            setIsCreatingGroup(false);
            loadData();
        } catch {
            alert('Failed to create group');
        }
    };

    const handleDeleteGroup = async (groupId: number) => {
        if (!confirm('Are you sure you want to delete this group?')) return;
        try {
            await tourApi.deleteTourGroup(tourId, groupId);
            loadData();
        } catch {
            alert('Failed to delete group');
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e: React.DragEvent, trackId: number) => {
        e.dataTransfer.setData('trackId', trackId.toString());
    };

    const handleDrop = async (e: React.DragEvent, groupId: number) => {
        e.preventDefault();
        const trackIdStr = e.dataTransfer.getData('trackId');
        if (!trackIdStr) return;
        const trackId = parseInt(trackIdStr, 10);

        // Calculate next index
        const currentTracks = groupTracks[groupId] || [];
        const nextIndex = currentTracks.length > 0 ? Math.max(...currentTracks.map(t => t.index)) + 1 : 0;

        try {
            await tourApi.assignTrackToGroup(tourId, groupId, trackId, nextIndex);
            // Refresh only this group's tracks for performance, or full reload
            const updatedTracks = await tourApi.getGroupTracks(tourId, groupId);
            setGroupTracks(prev => ({ ...prev, [groupId]: updatedTracks }));
        } catch {
            alert('Failed to assign track to group');
        }
    };

    const handleRemoveTrack = async (groupId: number, groupTrackId: number) => {
        try {
            await tourApi.removeTrackFromGroup(tourId, groupId, groupTrackId);
            const updatedTracks = await tourApi.getGroupTracks(tourId, groupId);
            setGroupTracks(prev => ({ ...prev, [groupId]: updatedTracks }));
        } catch {
            alert('Failed to remove track');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Tracks and Groups...</div>;

    return (
        <div className="flex gap-6 h-[calc(100vh-120px)]">
            {/* Left: Tracks List */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b font-semibold text-gray-800 bg-gray-50 rounded-t-xl">
                    Available Tracks ({tracks.length})
                </div>
                <div className="p-4 overflow-y-auto flex-1 space-y-2">
                    {(tracks || []).map((track) => (
                        <div
                            key={track.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, track.id)}
                            className="p-3 border rounded-lg bg-gray-50 text-sm hover:shadow-md transition cursor-grab flex items-center gap-2 border-l-4 border-l-blue-400"
                        >
                            <GripVertical size={16} className="text-gray-400" />
                            <span className="font-semibold text-gray-600">#{track.id}</span>
                            <span className="truncate">{track.title || track.name}</span>
                        </div>
                    ))}
                    {tracks.length === 0 && <p className="text-gray-400 text-sm">No tracks found.</p>}
                </div>
            </div>

            {/* Right: Group Management */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="font-semibold text-gray-800">Tour Groups</h3>
                    <button
                        onClick={() => setIsCreatingGroup(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                        <Plus size={16} /> New Group
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 space-y-6">
                    {isCreatingGroup && (
                        <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg flex items-center gap-3">
                            <input
                                type="text"
                                autoFocus
                                placeholder="Group Title..."
                                value={newGroupTitle}
                                onChange={(e) => setNewGroupTitle(e.target.value)}
                                className="flex-1 px-3 py-1.5 border rounded-md focus:outline-blue-500"
                            />
                            <button onClick={handleCreateGroup} className="text-blue-600 hover:text-blue-800"><Save size={18} /></button>
                            <button onClick={() => setIsCreatingGroup(false)} className="text-gray-500 hover:text-gray-700"><X size={18} /></button>
                        </div>
                    )}

                    {(groups || []).filter(g => !g.parent).map((group) => (
                        <div key={group.id} className="space-y-4">
                            <GroupCard
                                group={group}
                                groups={groups}
                                groupTracks={groupTracks}
                                tracks={tracks}
                                tourId={tourId}
                                handleDrop={handleDrop}
                                handleDeleteGroup={handleDeleteGroup}
                                handleRemoveTrack={handleRemoveTrack}
                                depth={0}
                            />
                        </div>
                    ))}

                    {groups.length === 0 && !isCreatingGroup && (
                        <div className="text-center text-gray-400 py-10">No groups found. Create one to get started.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Separated Component to support recursion for sub-groups
interface GroupCardProps {
    group: TourGroupV2;
    groups: TourGroupV2[];
    groupTracks: Record<number, TourGroupV2Tracks[]>;
    tracks: TourTrack[];
    handleDrop: (e: React.DragEvent, groupId: number) => void;
    handleDeleteGroup: (groupId: number) => void;
    handleRemoveTrack: (groupId: number, groupTrackId: number) => void;
    tourId: string;
    depth: number;
}

function GroupCard({
    group,
    groups,
    groupTracks,
    tracks,
    handleDrop,
    handleDeleteGroup,
    handleRemoveTrack,
    tourId,
    depth
}: GroupCardProps) {
    const subGroups = groups.filter((g: TourGroupV2) => g.parent === group.id);
    const marginLeft = depth > 0 ? `${depth * 1.5}rem` : '0';

    return (
        <div
            className={`border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden flex flex-col ${depth > 0 ? 'border-l-4 border-l-blue-300' : ''}`}
            style={{ marginLeft }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => { e.stopPropagation(); handleDrop(e, group.id); }}
        >
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center group/header">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <Layers size={18} className="text-blue-500" />
                    {group.name || `Group #${group.id}`}
                </h4>
                <div className="flex gap-2 opacity-0 group-hover/header:opacity-100 transition">
                    <button className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteGroup(group.id)} className="text-gray-400 hover:text-red-600"><Trash size={16} /></button>
                </div>
            </div>

            <div className={`p-4 bg-white ${subGroups.length > 0 && (groupTracks[group.id] || []).length === 0 ? 'min-h-[50px]' : 'min-h-[100px]'}`}>

                {/* Sub Groups Render */}
                {subGroups.length > 0 && (
                    <div className="space-y-4 mb-4">
                        {subGroups.map((sub: TourGroupV2) => (
                            <GroupCard
                                key={sub.id}
                                group={sub}
                                groups={groups}
                                groupTracks={groupTracks}
                                tracks={tracks}
                                handleDrop={handleDrop}
                                handleDeleteGroup={handleDeleteGroup}
                                handleRemoveTrack={handleRemoveTrack}
                                tourId={tourId}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}

                {/* Tracks Render */}
                {(groupTracks[group.id] || []).length > 0 ? (
                    <div className="space-y-2">
                        {(groupTracks[group.id] || []).map((gt: TourGroupV2Tracks) => {
                            const t = gt.track || tracks.find((x: TourTrack) => x.id === gt.tour_track);
                            return (
                                <div key={gt.id} className="flex justify-between items-center p-2 bg-gray-50 border border-gray-100 rounded-md text-sm group/track">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-xs font-mono w-4">{gt.index}</span>
                                        <span className="font-semibold text-gray-600">#{gt.tour_track}</span>
                                        <span>{t?.title || t?.name || 'Unknown Track'}</span>
                                    </div>
                                    <button
                                        onClick={() => gt.id && handleRemoveTrack(group.id, gt.id)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover/track:opacity-100 transition"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : subGroups.length === 0 ? (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50/50">
                        <p className="text-sm text-gray-400">Drag tracks here to assign them</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
