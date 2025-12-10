import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import OrderList from "./OrderList";

async function getOrders() {
  const { data: orders, error } = await supabaseAdmin
    .from("Order")
    .select(`
      *,
      items:OrderItem(
        *,
        product:Product(*)
      )
    `)
    .order("createdAt", { ascending: false });

  if (error) {
    throw error;
  }

  return orders || [];
}

export default async function OrdersPage() {
  const orders = await getOrders();

  async function updateOrderStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;

    const { error } = await supabaseAdmin
      .from("Order")
      .update({ status })
      .eq("id", id);

    if (error) {
      throw error;
    }

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
