"use client";

import {
  LoaderCircle,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Teacher {
  _id: string;
  name: string;
  avatar?: string;
  job: string;
  description: string;
}

const Page = () => {
  const { data: session } = useSession();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [name, setName] = useState("");
  const [jobtitle, setJobtitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  /* ---------------- GET ALL ---------------- */
  const getAllTeachers = async () => {
    try {
      const res = await fetch("/api/teachers/all");
      const data = await res.json();
      if (!data.success) throw data.message;
      setTeachers(data.allTeachers);
    } catch {
      toast.error("Failed to load teachers");
    }
  };

  useEffect(() => {
    getAllTeachers();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!name || !jobtitle || !description) {
        toast.error("All fields required");
        return;
      }

      if (!editingTeacher && !file) {
        toast.error("Avatar is required");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("jobtitle", jobtitle);
      formData.append("description", description);

      if (file) {
        formData.append("file", file);
      }

      if (editingTeacher) {
        formData.append("id", editingTeacher._id);
      }

      const res = await fetch(
        editingTeacher ? "/api/teachers/update" : "/api/teachers/create",
        {
          method: "POST",
          body: formData, // ❗ no headers
        },
      );

      const data = await res.json();
      if (!data.success) throw data.message;

      toast.success(editingTeacher ? "Teacher updated" : "Teacher created");
      resetForm();
      getAllTeachers();
    } catch (err) {
      toast.error(String(err));
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;

    try {
      const res = await fetch("/api/teachers/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!data.success) throw data.message;

      toast.success("Teacher deleted");
      setTeachers((prev) => prev.filter((t) => t._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ---------------- HELPERS ---------------- */
  const openEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setName(teacher.name);
    setJobtitle(teacher.job);
    setDescription(teacher.description);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditingTeacher(null);
    setName("");
    setJobtitle("");
    setDescription("");
  };

  return (
    <div className="w-full">
      {/* ---------- Dialog ---------- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTeacher ? "Edit Teacher" : "Add Teacher"}
            </DialogTitle>
          </DialogHeader>

          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Job Title"
            value={jobtitle}
            onChange={(e) => setJobtitle(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border p-2 rounded"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded"
          />

          <Button onClick={handleSubmit} disabled={loading}>
            {loading && (
              <LoaderCircle className="animate-spin mr-2" size={18} />
            )}
            {editingTeacher ? "Update" : "Create"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* ---------- Header ---------- */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2" size={18} />
          Teacher
        </Button>
      </div>

      {/* ---------- Table ---------- */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Avatar</TableHead>
            <TableHead>Job</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {teachers.map((t) => (
            <TableRow key={t._id}>
              <TableCell>{t.name}</TableCell>
              <TableCell>
                {t.avatar && (
                  <Image
                    src={t.avatar}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
              </TableCell>
              <TableCell>{t.job}</TableCell>
              <TableCell>{t.description.slice(0, 30)}...</TableCell>

              {/* ---------- DROPDOWN ---------- */}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={18} />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(t)}>
                      <Pencil size={16} className="mr-2" />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => handleDelete(t._id)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Page;
