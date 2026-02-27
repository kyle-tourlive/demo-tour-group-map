'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Layers, ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Sidebar({ tourId }: { tourId: string }) {
    const pathname = usePathname();

    const links = [
        { name: 'Tour Group Management', href: `/tour/${tourId}/group`, icon: Layers },
        { name: 'Tour Map Management', href: `/tour/${tourId}/map`, icon: Map },
    ];

    return (
        <div className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
            <div className="p-4 flex items-center gap-3 border-b border-gray-800">
                <Link href="/" className="p-2 hover:bg-gray-800 rounded-full transition">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h2 className="font-bold">TourLive Admin</h2>
                    <p className="text-xs text-gray-400">Tour ID: {tourId}</p>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={twMerge(
                                clsx(
                                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium',
                                    isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                )
                            )}
                        >
                            <Icon size={18} />
                            {link.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
