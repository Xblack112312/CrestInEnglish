"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { LoaderCircle, Eye, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Enrollment = {
  _id: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  paymentProof: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
  course: {
    title: string;
    price: number;
  };
};

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  /* =========================
      Fetch Enrollments
  ========================== */
  const fetchAllEnrollments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/enrollments/all");
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setEnrollments(data.enrollments);
    } catch (error: any) {
      toast.error(error.message || "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEnrollments();
  }, []);

  /* =========================
      Update Status
  ========================== */
  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      setUpdatingId(id);
      const res = await fetch("/api/enrollments/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: id, status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(`Enrollment ${status}`);
      fetchAllEnrollments();
    } catch (error: any) {
      toast.error(error.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center mt-20 gap-3">
        <LoaderCircle size={30} className="animate-spin text-black" />
        <p className="text-lg font-medium text-black">Loading Enrollments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col items-start gap-1">
        <h2 className="text-3xl font-semibold text-black">All Enrollments</h2>
        <p className="text-sm text-gray-500">
          Approve or reject enrollments and view payment proofs.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <p className="mt-8 text-gray-500">No enrollments found.</p>
      ) : (
        <Table className="mt-8">
          <TableCaption>A list of all enrollments</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((item) => (
              <TableRow key={item._id} className="hover:bg-gray-50 transition">
                <TableCell className="font-medium">{item.user.fullName}</TableCell>
                <TableCell>{item?.course?.title}</TableCell>
                <TableCell>{item?.phone}</TableCell>
                <TableCell>EGP {item?.course?.price?.toFixed(2)}</TableCell>

   {/* Payment Proof Modal */}
<TableCell>
  {item.paymentProof && (
    <>
      <button
        onClick={() => setPreviewImg(item.paymentProof)}
        className="flex items-center gap-1 text-blue-600 hover:underline text-xs"
      >
        <Eye size={14} /> View
      </button>

      {/* Global Modal */}
      {previewImg && previewImg === item.paymentProof && (
        <Dialog open={true} onOpenChange={() => setPreviewImg(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Payment Proof</DialogTitle>
            </DialogHeader>
            <Image
              src={previewImg}
              alt="Payment proof"
              height={500}
              width={500}
              loading="lazy"
              className="w-full h-auto rounded-md"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )}
</TableCell>


                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      item.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : item.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </TableCell>

                {/* Dropdown for actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded border hover:bg-gray-100">
                        <MoreHorizontal size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateStatus(item._id, "approved")}
                        disabled={item.status !== "pending" || updatingId === item._id}
                      >
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateStatus(item._id, "rejected")}
                        disabled={item.status !== "pending" || updatingId === item._id}
                      >
                        Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Page;
