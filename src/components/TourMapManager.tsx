'use client';

import { useEffect, useState } from 'react';
import { tourApi } from '@/lib/tourApi';
import { TourMap, TourMapPoints, TourTrack } from '@/types/models';
import { Plus, Trash, Image as ImageIcon, Map as MapIcon } from 'lucide-react';

export function TourMapManager({ tourId }: { tourId: string }) {
    const [maps, setMaps] = useState<TourMap[]>([]);
    const [, setTracks] = useState<TourTrack[]>([]);
    const [, setLoading] = useState(true);
    const [selectedMap, setSelectedMap] = useState<TourMap | null>(null);

    // Points for selected map
    const [points, setPoints] = useState<TourMapPoints[]>([]);

    // New Map State
    const [isCreatingMap, setIsCreatingMap] = useState(false);
    const [newMapName, setNewMapName] = useState('');
    const [newMapType, setNewMapType] = useState<'GOOGLE' | 'SVG'>('GOOGLE');
    const [newMapImageUrl, setNewMapImageUrl] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [fetchedMaps, fetchedTracks] = await Promise.all([
                tourApi.getTourMaps(tourId),
                tourApi.getTourTracks(tourId),
            ]);
            setMaps(fetchedMaps);
            setTracks(fetchedTracks);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadPoints = async (mapId: number) => {
        try {
            const fetchedPoints = await tourApi.getTourMapPoints(tourId, mapId);
            setPoints(fetchedPoints);
        } catch (err) {
            console.error('Failed to load points', err);
        }
    };

    useEffect(() => {
        loadData();
    }, [tourId]);

    useEffect(() => {
        if (selectedMap) {
            loadPoints(selectedMap.id);
        } else {
            setPoints([]);
        }
    }, [selectedMap, tourId]);

    const handleCreateMap = async () => {
        if (!newMapName.trim()) return;
        try {
            await tourApi.createTourMap(tourId, {
                exhibition_hall: newMapName,
                name: newMapName,
                map_type: newMapType === 'GOOGLE' ? 2 : 1,
                svg_image: newMapType === 'SVG' ? newMapImageUrl : undefined,
            });
            setIsCreatingMap(false);
            setNewMapName('');
            setNewMapImageUrl('');
            loadData();
        } catch {
            alert('Failed to create map');
        }
    };

    const handleDeleteMap = async (mapId: number) => {
        if (!confirm('Delete this map?')) return;
        try {
            await tourApi.deleteTourMap(tourId, mapId);
            if (selectedMap?.id === mapId) setSelectedMap(null);
            loadData();
        } catch {
            alert('Failed to delete map');
        }
    };

    const handleCreatePoint = async (extraData: Partial<TourMapPoints> = {}) => {
        if (!selectedMap) return;
        try {
            await tourApi.createTourMapPoint(tourId, selectedMap.id, {
                pin_type: 1, // Default Track
                ...extraData,
            });
            loadPoints(selectedMap.id);
        } catch {
            alert('Failed to create point');
        }
    };

    const handleUpdatePoint = async (pointId: number, data: Partial<TourMapPoints>) => {
        if (!selectedMap) return;
        try {
            await tourApi.updateTourMapPoint(tourId, selectedMap.id, pointId, data);
            loadPoints(selectedMap.id);
        } catch {
            alert('Failed to update point');
        }
    };

    const handleDeletePoint = async (pointId: number) => {
        if (!selectedMap || !confirm('Delete point?')) return;
        try {
            await tourApi.deleteTourMapPoint(tourId, selectedMap.id, pointId);
            loadPoints(selectedMap.id);
        } catch {
            alert('Failed to delete point');
        }
    };

    const handleSvgClick = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!selectedMap) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const anchor_x = parseFloat((x / rect.width).toFixed(4));
        const anchor_y = parseFloat((y / rect.height).toFixed(4));

        handleCreatePoint({ anchor_x, anchor_y });
    };

    const renderPointEditorRow = (point: TourMapPoints) => {
        const isGoogle = selectedMap?.map_type === 2 || selectedMap?.map_type === 'GOOGLE';
        return (
            <tr key={point.id} className="border-b border-gray-100 hover:bg-gray-50 text-sm">
                <td className="p-3 text-gray-500 font-mono">#{point.id}</td>
                <td className="p-3">
                    <select
                        className="border rounded px-2 py-1 text-sm bg-white"
                        value={point.pin_type}
                        onChange={(e) => handleUpdatePoint(point.id, { pin_type: parseInt(e.target.value) as 1 | 2 })}
                    >
                        <option value={1}>Track</option>
                        <option value={2}>SubMap</option>
                    </select>
                </td>
                <td className="p-3">
                    {isGoogle ? (
                        <div className="flex gap-2">
                            <input
                                type="number" step="0.000001" placeholder="Lat"
                                className="w-24 border rounded px-2 py-1"
                                defaultValue={point.latitude}
                                onBlur={(e) => handleUpdatePoint(point.id, { latitude: parseFloat(e.target.value) })}
                            />
                            <input
                                type="number" step="0.000001" placeholder="Lng"
                                className="w-24 border rounded px-2 py-1"
                                defaultValue={point.longitude}
                                onBlur={(e) => handleUpdatePoint(point.id, { longitude: parseFloat(e.target.value) })}
                            />
                        </div>
                    ) : (
                        <div className="text-gray-600 font-mono text-xs">
                            X: {point.anchor_x}<br />Y: {point.anchor_y}
                        </div>
                    )}
                </td>
                <td className="p-3 text-right">
                    <button onClick={() => handleDeletePoint(point.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash size={16} />
                    </button>
                </td>
            </tr>
        );
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-120px)]">
            {/* Left: Map List */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b font-semibold text-gray-800 bg-gray-50 rounded-t-xl flex justify-between items-center">
                    <span>Tour Maps ({maps.length})</span>
                    <button
                        onClick={() => setIsCreatingMap(!isCreatingMap)}
                        className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                    {isCreatingMap && (
                        <div className="p-4 bg-gray-50 border rounded-lg space-y-3">
                            <input
                                type="text" placeholder="Map Name" value={newMapName}
                                onChange={(e) => setNewMapName(e.target.value)}
                                className="w-full px-3 py-2 border rounded text-sm"
                            />
                            <select
                                value={newMapType} onChange={(e) => setNewMapType(e.target.value as 'GOOGLE' | 'SVG')}
                                className="w-full px-3 py-2 border rounded text-sm bg-white"
                            >
                                <option value="GOOGLE">Google Map</option>
                                <option value="SVG">SVG Image Map</option>
                            </select>
                            {newMapType === 'SVG' && (
                                <input
                                    type="text" placeholder="Image URL" value={newMapImageUrl}
                                    onChange={(e) => setNewMapImageUrl(e.target.value)}
                                    className="w-full px-3 py-2 border rounded text-sm"
                                />
                            )}
                            <div className="flex gap-2">
                                <button onClick={handleCreateMap} className="flex-1 bg-blue-600 text-white py-1.5 rounded text-sm font-medium">Save</button>
                                <button onClick={() => setIsCreatingMap(false)} className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded text-sm font-medium">Cancel</button>
                            </div>
                        </div>
                    )}

                    {(maps || []).map(map => {
                        const isGoogleMap = map.map_type === 2 || map.map_type === 'GOOGLE';
                        const mapName = map.exhibition_hall || map.name || `Unnamed Map ${map.id}`;
                        return (
                            <div
                                key={map.id}
                                onClick={() => setSelectedMap(map)}
                                className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer transition ${selectedMap?.id === map.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'bg-gray-50 hover:border-blue-300'}`}
                            >
                                <div className="flex items-center gap-3">
                                    {isGoogleMap ? <MapIcon size={18} className="text-green-600" /> : <ImageIcon size={18} className="text-purple-600" />}
                                    <div>
                                        <div className="font-medium text-sm text-gray-800">{mapName}</div>
                                        <div className="text-xs text-gray-400">ID: {map.id}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteMap(map.id); }}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        );
                    })}
                    {maps.length === 0 && !isCreatingMap && <p className="text-sm text-gray-500 text-center py-4">No maps configured.</p>}
                </div>
            </div>

            {/* Right: Map Point Editor */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                {selectedMap ? (
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg">{selectedMap.exhibition_hall || selectedMap.name || `Map ${selectedMap.id}`}</h3>
                                <p className="text-xs text-gray-500">
                                    {(selectedMap.map_type === 2 || selectedMap.map_type === 'GOOGLE') ? 'Google' : 'SVG'} Map • {points.length} points
                                </p>
                            </div>
                            {(selectedMap.map_type === 2 || selectedMap.map_type === 'GOOGLE') && (
                                <button
                                    onClick={() => handleCreatePoint()}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
                                >
                                    <Plus size={16} /> Add Point Row
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col">
                            {/* SVG Viewer */}
                            {(selectedMap.map_type === 1 || selectedMap.map_type === 'SVG') && (
                                <div className="p-4 border-b bg-gray-100 flex justify-center">
                                    {(selectedMap.svg_image || selectedMap.image_url) ? (
                                        <div className="relative inline-block border border-gray-300 shadow-sm bg-white cursor-crosshair group">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={selectedMap.svg_image || selectedMap.image_url}
                                                alt={selectedMap.exhibition_hall || selectedMap.name || 'Map'}
                                                className="max-h-[300px] object-contain"
                                                onClick={handleSvgClick}
                                            />
                                            <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition">
                                                <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">Click to add point</span>
                                            </div>
                                            {/* Render Points on Image */}
                                            {points.map(p => p.anchor_x != null && p.anchor_y != null && (
                                                <div
                                                    key={p.id}
                                                    className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white -ml-2 -mt-2 shadow transform hover:scale-125 transition"
                                                    style={{ left: `${p.anchor_x * 100}%`, top: `${p.anchor_y * 100}%` }}
                                                    title={`Point #${p.id}`}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-orange-500 text-sm">No image URL configured for this SVG map.</p>
                                    )}
                                </div>
                            )}

                            {/* Points Spreadsheet */}
                            <div className="flex-1 p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase">Coordinates</th>
                                            <th className="p-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {points.map(renderPointEditorRow)}
                                        {points.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-gray-400">
                                                    {(selectedMap.map_type === 1 || selectedMap.map_type === 'SVG') ? 'Click on the image above to add points.' : 'No points added yet. Add a row to start.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-3">
                        <MapIcon size={48} className="text-gray-200" />
                        <p>Select or create a map on the left to edit points.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
