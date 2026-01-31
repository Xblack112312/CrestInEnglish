"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password is required & must be at least 8 characters.",
  }),
  education: z.enum(["General", "Azher"]),
  grade: z.enum(["Grade 9", "Grade 10", "Grade 11", "Grade 12"]),
});

const page = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      education: "General",
      grade: "Grade 9",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const { email, password, username, education, grade } = values;

      if (!email || !password || !username || !education || !grade) {
        toast.error("Missing Required Fields.");
        return;
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fullName: username,
          education,
          grade,
        }),
      });

      const results = await response?.json();

      if (results?.success) {
        const { email, password } = values;

        const signResponse = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (!signResponse) {
          toast.error("Authentication failed. Please try again.");
          return;
        }

        if (signResponse?.error) {
          toast.error(signResponse?.error);
          setLoading(false);
          return;
        }

        if (signResponse?.ok) {
          setLoading(false);
          router.replace("/");
        }
      } else {
        toast.error(results?.message);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log(error);
      toast.error(error as string);
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center text-cener">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 w-full max-w-md bg-white p-6"
        >
          <h2 className="text-3xl font-bold">Sign Up</h2>
          <p className="text-sm text-black/40">
            Create an new account to Gain Access on all Courses.
          </p>

          {/* Form Fields */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    placeholder="Full Name."
                    className="w-full border border-black/20 rounded-md px-3 py-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    placeholder="Email."
                    className="w-full border border-black/20 rounded-md px-3 py-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    type="password"
                    placeholder="Password."
                    className="w-full border border-black/20 rounded-md px-3 py-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Education</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select education type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Azher">Azhar</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                    <SelectItem value="Grade 12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer bg-black text-white py-2"
          >
            {loading ? "Creating Account..." : "Create Account."}
          </Button>

          <p className="text-xs text-black/60">
            Already have account{" "}
            <Link href="/sign-in" className="underline text-black">
              Sign In
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default page;
