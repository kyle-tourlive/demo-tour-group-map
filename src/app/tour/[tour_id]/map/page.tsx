import { TourMapManager } from '@/components/TourMapManager';

export default async function TourMapPage({
    params,
}: {
    params: Promise<{ tour_id: string }>;
}) {
    const { tour_id } = await params;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Tour Map Management</h2>
            </div>

            <TourMapManager tourId={tour_id} />
        </div>
    );
}
