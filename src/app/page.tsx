import { redirect } from 'next/navigation';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tour_id } = await searchParams;

  if (tour_id && typeof tour_id === 'string') {
    redirect(`/tour/${tour_id}/group`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          TourLive Admin Tool
        </h1>
        <p className="text-gray-600 mb-6 text-center text-sm">
          Enter a Tour ID to manage groups and maps.
        </p>
        <form action="/" className="space-y-4">
          <div>
            <label htmlFor="tour_id" className="block text-sm font-medium text-gray-700 mb-1">
              Tour ID
            </label>
            <input
              type="number"
              id="tour_id"
              name="tour_id"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g. 1234"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Start Managing
          </button>
        </form>
      </div>
    </div>
  );
}
