"use client"
export const runtime = 'edge';
import { useEffect } from 'react';
import { DataTable } from "@/components/cars/data-table"
import { useCarsStore } from "@/store/useCarsStore"
import { AddCarsModal } from "@/components/cars/add-cars-modal"
import { ModuleRouteGuard } from "@/components/auth/module-route-guard"
import { useModulePermission } from "@/components/auth/module-route-guard"

export default function Page() { 
  const { cars, isLoading, error, fetchCars } = useCarsStore()
  const { canView, canEdit } = useModulePermission('cars')

  useEffect(() => {
    if (canView) {
      fetchCars();
    }
  }, [fetchCars, canView]);

  // Ensure cars is always an array
  const safeCars = Array.isArray(cars) ? cars : [];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ModuleRouteGuard moduleKey="cars" requiredPermission="can_view">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2 mt-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Cars</h1>
            {canEdit && <AddCarsModal onSuccess={fetchCars} />}
          </div>
          <div className="flex flex-col gap-4 pb-2 md:gap-6 md:pb-3">
            <div>
              <h2>Cars ({safeCars.length})</h2>
              <DataTable data={safeCars} />
            </div>
          </div>
        </div>
      </div>
    </ModuleRouteGuard>
  )
}
