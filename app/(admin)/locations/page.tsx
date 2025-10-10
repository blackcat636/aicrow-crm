"use client"
export const runtime = 'edge';
import { useEffect } from 'react';
import { DataTable } from "@/components/locations/data-table"
import { useLocationsStore } from "@/store/useLocationsStore"
import { AddLocationModal } from "@/components/locations/add-location-modal"

export default function Page() { 
  const { locations, isLoading, error, fetchLocations } = useLocationsStore()

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 mt-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Locations</h1>
              <AddLocationModal onSuccess={fetchLocations} />
            </div>
            <div className="flex flex-col gap-4 pb-2 md:gap-6 md:pb-3">
              <DataTable data={locations} />
            </div>
          </div>
        </div>
  )
}
