"use client";
import { LoaderCircle, SquarePen } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Profile = () => {
  const { data: session, status } = useSession();

  const [Password, setPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [nameStep, setnameStep] = useState(1);
  const [ChangeName, setChangeName] = useState(false);

  const [Nameloading, setNameloading] = useState(false);

  // --- Password Change ---
  const [ChangePasswordDialog, setChangePasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // --- Delete Account ---
  const [DeleteAccountAlert, setDeleteAccountAlert] = useState(false);
  const [DeleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.fullName) {
      setNewName(session.user.fullName);
    }
  }, [session]);

  const HandleChangeName = async () => {
    try {
      setNameloading(true);

      if (newName?.length < 3) {
        setNameloading(false);
        toast.error("New Name Must be Over 3 Charcaters");
        return;
      }

      const response = await fetch("/api/auth/update-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newName: newName,
          password: Password,
        }),
      });

      const data = await response.json();

      if (data?.success) {
        toast.success(data?.message);
        setnameStep(1);
        setChangeName(false);
        setNewName("");
        setPassword("");
        setNameloading(false);
        return;
      } else {
        toast.error(data?.message);
        setNameloading(false);
        return;
      }
    } catch (error) {
      toast.error(error as string);
      console.log(error);
      return;
    }
  };

  const router = useRouter();



  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Both fields are required");
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!data?.success) return toast.error(data?.message);

      toast.success(data.message);

      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Password is required");
      return;
    }

    try {
      setDeleteLoading(true);
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();

      if (!data?.success) return toast.error(data?.message);

      await signOut()
      toast.success(data.message);
      router.replace("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
      setDeletePassword("");
    }
  };

  return (
    <div className="flex flex-col items-start w-full">
      <Dialog open={ChangeName} onOpenChange={setChangeName}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-black font-mediumx">
              {nameStep === 1 ? "Change Your Account Name?" : "Verify!"}
            </DialogTitle>
          </DialogHeader>
          <div>
            {nameStep === 1 ? (
              <div className="flex flex-col w-full items-start">
                <div className="flex gap-y-1 flex-col w-full items-start">
                  <label className=" text-zinc-800 ">New Name</label>
                  <input
                    type="text"
                    className="w-full text-sm border outline-none border-solid border-black/40 transition-all duration-150 focus:border-black! p-2 rounded-md"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Your New Name"
                  />
                </div>
                <Button
                  size="sm"
                  className="mt-3 flex items-center gap-2 flex-row w-full cursor-pointer"
                  onClick={() => setnameStep(2)}
                >
                  Next.
                </Button>
              </div>
            ) : (
              <div className="flex flex-col w-full items-start">
                <div className="flex gap-y-1 flex-col w-full items-start">
                  <label className=" text-zinc-800 ">Your Password</label>
                  <input
                    type="password"
                    className="w-full text-sm  border border-solid p-2 rounded-md border-black/50 transition-all focus:border-black! outline-none "
                    onChange={(e) => setPassword(e?.target?.value)}
                    placeholder="Your Current Password."
                    value={Password}
                  />
                </div>
                <Button
                  size="sm"
                  className="mt-3 flex items-center gap-2 flex-row w-full cursor-pointer"
                  onClick={HandleChangeName}
                >
                  {Nameloading ? (
                    <LoaderCircle size={21} className="animate-spin" />
                  ) : null}
                  Update Name.
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={DeleteAccountDialog} onOpenChange={setDeleteAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Verify To Delete!</DialogTitle>
          </DialogHeader>
          <div className="flex w-full items-start flex-col ">
            <div className="flex w-full items-start flex-col gap-y-1">
              <label>Your Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="p-2 border w-full rounded-md outline-none border-black/40 focus:border-black"
              />
            </div>
            <div className="flex w-full mt-3 items-start flex-col gap-y-2">
              <Button
                onClick={handleDeleteAccount}
                size="default"
                className="flex items-center w-full cursor-pointer! flex-row gap-2"
              >
                {deleteLoading ? <LoaderCircle size={21} /> : null}
                Yes, Delete
              </Button>
              <Button
                variant="ghost"
                size="default"
                onClick={() => {
                  setDeleteAccountDialog(false);
                  setDeletePassword("");
                }}
                className="w-full cursor-pointer flex items-center justify-center flex-row"
              >
                Cancel, Please
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={DeleteAccountAlert}
        onOpenChange={setDeleteAccountAlert}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This Account Will be Deleted Forever, You can't access anything
              like Settings Or Courses
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              variant="outline"
              onClick={() => setDeleteAccountAlert(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => setDeleteAccountDialog(true)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <Dialog
        open={ChangePasswordDialog}
        onOpenChange={setChangePasswordDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            {/* Current Password */}
            <div className="flex flex-col gap-1">
              <label className="text-zinc-800 text-sm">Current Password</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="p-2 border rounded-md outline-none border-black/40 focus:border-black"
              />
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1">
              <label className="text-zinc-800 text-sm">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-2 border rounded-md outline-none border-black/40 focus:border-black"
              />
            </div>

            {/* Submit Button */}
            <Button
              className="mt-3 w-full flex justify-center items-center"
              onClick={handleChangePassword}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <LoaderCircle className="animate-spin mr-2" />
              ) : null}
              Update Password
            </Button>

            {/* Cancel */}
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => setChangePasswordDialog(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <h2 className="text-2xl font-semibold w-full">Account Settings.</h2>
      <div className="mt-4">
        <h3 className="text-xl font-medium">Email Address</h3>
        <p className="text-sm text-zinc-500 mt-2">
          Your Email Address is{" "}
          <span className="font-medium text-sm text-black!">
            {session?.user?.email}
          </span>
        </p>
      </div>

      <hr className="w-full mt-3" />

      <div className="mt-4">
        <h3 className="text-xl font-medium">Personal Details.</h3>
        <section className="flex items-center gap-3 flex-row">
          <div className="flex flex-col items-start mt-2.5">
            <p className="text-sm text-black/70">Name.</p>
            <div className="flex items-center text-lg rounded-md! p-3 flex-row justify-between w-43.75 px-2 bg-gray-100/65">
              <p className="font-medium">{session?.user?.fullName}</p>
              <SquarePen
                onClick={() => setChangeName(true)}
                className="cursor-pointer text-black transition-all duration-150 hover:text-black/65"
              />
            </div>
          </div>

          <div className="flex flex-col items-start mt-2.5">
            <p className="text-sm text-black/70">Current Password.</p>
            <div className="flex items-center text-lg rounded-md! p-3 flex-row justify-between w-43.75 px-2 bg-gray-100/65">
              <p className="font-medium">********</p>
              <SquarePen
                onClick={() => setChangePasswordDialog(true)}
                className="cursor-pointer text-black transition-all duration-150 hover:text-black/65"
              />
            </div>
          </div>
        </section>
        <span className="flex items-center flex-row gap-1 text-zinc-600 text-xs mt-3">
          Can't Remember Your Current Passowrd{" "}
          <Link
            className="text-black! text-sm font-medium underline"
            href={"/contact-us"}
          >
            Contact Us
          </Link>
          .
        </span>
      </div>

      <hr className="w-full mt-3" />

      <div className="mt-4">
        <h3 className="text-xl font-medium">Delete Account!</h3>
        <p className="w-96 text-sm text-black/90 mt-2">
          Before you delete your acccount you have to know thats you going to
          lose your courses and access on your account.
        </p>
        <button
          onClick={() => setDeleteAccountAlert(true)}
          className="mt-3 cursor-pointer underline text-black transition-all hover:text-black/80"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile;
