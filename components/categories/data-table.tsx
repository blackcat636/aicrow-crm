import { Badge } from "@/components/ui/badge"
import { EditCategoryModal } from "./edit-category-modal"
import { DeleteCategoryModal } from "./delete-category-modal"
import { Category } from "@/interface/Category"

interface DataTableProps {
  categories: Category[];
}

export function DataTable({ categories }: DataTableProps) {

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Name
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Description
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Created
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle font-medium">
                  {category.name}
                </td>
                <td className="p-4 align-middle text-muted-foreground">
                  {category.description || "—"}
                </td>
                <td className="p-4 align-middle">
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="p-4 align-middle text-muted-foreground">
                  {new Date(category.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 align-middle">
                  <div className="flex items-center justify-end gap-2">
                    <EditCategoryModal category={category} />
                    <DeleteCategoryModal category={category} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
