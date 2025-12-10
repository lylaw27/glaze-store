import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import OrderList from "./OrderList";

async function getOrders() {
  return await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

export default async function OrdersPage() {
  const orders = await getOrders();

  async function updateOrderStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;

    await prisma.order.update({
      where: { id },
      data: { status },
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
