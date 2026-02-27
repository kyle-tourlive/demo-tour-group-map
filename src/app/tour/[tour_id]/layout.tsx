import { Sidebar } from '@/components/Sidebar';

export default async function TourLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ tour_id: string }>;
}) {
    const { tour_id } = await params;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar tourId={tour_id} />
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-800">
                        Managing Tour #{tour_id}
                    </h1>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
