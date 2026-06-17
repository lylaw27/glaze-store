import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { revalidatePath } from "next/cache";
import { adminSecret } from "@/lib/convex";
import type { Id } from "@/convex/_generated/dataModel";
import OrderList from "./OrderList";

async function getOrders() {
  return await fetchQuery(api.orders.list, {});
}

export default async function OrdersPage() {
  const orders = await getOrders();

  async function updateOrderStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as Id<"orders">;
    const status = formData.get("status") as string;

    await fetchMutation(api.orders.updateStatus, {
      secret: adminSecret(),
      id,
      status,
    });

    revalidatePath("/admin/orders");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>
      <OrderList orders={orders} updateStatusAction={updateOrderStatus} />
    </div>
  );
}
