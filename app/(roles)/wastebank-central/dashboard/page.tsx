'use client';
import { LogoutButton } from '../../../../components/logout-button/logout-button';

export default function WastebankCentralDashboard() {
    return (
        <div className="p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Wastebank Central Dashboard</h1>
                <LogoutButton />
            </div>
            <p className="mt-2">Welcome to the Wastebank Central dashboard.</p>
        </div>
    );
}
