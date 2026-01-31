"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis, UserPlus, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  grade: "Grade 9" | "Grade 10" | "Grade 11" | "Grade 12";
  education: "General" | "Azher";
  role: "user" | "teacher" | "admin";
  createdAt: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // track action per user

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/users/all", { method: "GET" });
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Failed to fetch users");
        setUsers([]);
      } else {
        setUsers(data.users || []);
      }
    } catch (err) {
      toast.error("Error fetching users");
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "teacher":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  if (!loading && users.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No users found</p>
      </div>
    );
  }

  const handleUpgradeRole = async (userId: string) => {
    try {
      setActionLoading(userId);
      const res = await fetch("/api/users/upgrade-role", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to upgrade role");
      }
    } catch (err) {
      toast.error("Error upgrading role");
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full">
      <Table>
        <TableCaption>A list of all users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Education</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.fullName}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.grade}</TableCell>
              <TableCell>{user.education}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                    user.role,
                  )}`}
                >
                  {user.role === "user"
                    ? "User"
                    : user?.role === "admin"
                      ? "Admin"
                      : user?.role === "teacher"
                        ? "Teacher"
                        : ""}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Ellipsis
                      size={20}
                      className="cursor-pointer transition-all hover:text-black/75 text-black"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleUpgradeRole(user._id)}
                        disabled={actionLoading === user._id}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Upgrade Role
                      </DropdownMenuItem>{" "}
                    </DropdownMenuGroup>
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

export default UsersPage;
