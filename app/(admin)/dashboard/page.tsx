"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  UserPlus,
  BookCheck,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalTeachers: number;
  totalCourses: number;
  recentUsers: number;
}

const DashboardPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalCourses: 0,
    recentUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch stats from API
        const [usersRes, teachersRes, coursesRes] = await Promise.all([
          fetch("/api/dashboard/stats/users"),
          fetch("/api/dashboard/stats/teachers"),
          fetch("/api/dashboard/stats/courses"),
        ]);

        const usersData = usersRes.ok ? await usersRes.json() : { total: 0, recent: 0 };
        const teachersData = teachersRes.ok ? await teachersRes.json() : { total: 0 };
        const coursesData = coursesRes.ok ? await coursesRes.json() : { total: 0 };

        setStats({
          totalUsers: usersData.total || 0,
          totalTeachers: teachersData.total || 0,
          totalCourses: coursesData.total || 0,
          recentUsers: usersData.recent || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      change: `+${stats.recentUsers} this month`,
      color: "bg-blue-500",
    },
    {
      title: "Teachers",
      value: stats.totalTeachers,
      icon: GraduationCap,
      change: "Active",
      color: "bg-green-500",
    },
    {
      title: "Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      change: "Available",
      color: "bg-purple-500",
    },
    {
      title: "Growth",
      value: "12%",
      icon: TrendingUp,
      change: "vs last month",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {session?.user?.fullName || "Admin"}! Here's what's happening.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {loading ? "..." : stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => router.push("/dashboard/users")}
              className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors text-left"
            >
              <UserPlus className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Add New User</p>
                <p className="text-sm text-gray-500">Register a new student</p>
              </div>
            </button>
            <button 
              onClick={() => router.push("/dashboard/teachers")}
              className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors text-left"
            >
              <GraduationCap className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Add Teacher</p>
                <p className="text-sm text-gray-500">Register a new teacher</p>
              </div>
            </button>
            <button 
              onClick={() => router.push("/dashboard/courses")}
              className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors text-left"
            >
              <BookCheck className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Create Course</p>
                <p className="text-sm text-gray-500">Add a new course</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">System running normally</p>
                <p className="text-xs text-gray-500">All services operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New users registered</p>
                <p className="text-xs text-gray-500">{stats.recentUsers} new users this month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
